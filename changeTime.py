#!/usr/bin/python

# -*- coding: Windows-1251 -*-

import Image

import os
import re
import sys
import time
import json
import piexif

from os.path import isfile, join
import datetime

CREATE_HARDLINK=0


def get_pic_info(fn):
    # {parentDir, date, make, model}
    if not os.path.isfile(fn):
        print "file not found %s" % fn
        return None
    exif_dict = piexif.load(fn)   
    all_pic_infos = {}
    for ifd in ("0th", "Exif", "GPS", "1st"):
        for tag in exif_dict[ifd]:
            if piexif.TAGS[ifd][tag]["name"] != "MakerNote": # useless and long
                all_pic_infos[piexif.TAGS[ifd][tag]["name"]] = exif_dict[ifd][tag]

    pic_infos= {}
    #for name in ("Model", "Make", "Orientation", "DateTime"):
    #    pic_infos[name] = all_pic_infos[name]

    pic_infos["url"] = fn
    pic_infos["date"] = all_pic_infos["DateTime"]
    #pic_infos["orientation"] = all_pic_infos["Orientation"]
    pic_infos["make"] = all_pic_infos["Make"]
    pic_infos["model"] = all_pic_infos["Model"]


    #print pic_infos
    return pic_infos


def get_filtered_pic_infos(dn, make, model):
    names = os.listdir(dn)
    count=0
    allPics = {}
    #print 'found files [%s]' % ', '.join(map(str, names))

    for s in sorted(names):
        # just for pics
        ext = os.path.splitext(s)[1].lower()
        if ext in ['.jpg', '.jpeg', '.jfif', '.nef', '.png']:
             pic_info = get_pic_info(join(dn,s)) #print pic_info
             if (pic_info["make"] == make and pic_info["model"] == model):
                  allPics[pic_info["date"]] = pic_info

    # {
    #   date: { path, name }  
    # }
    return allPics


def get_last_date(all_pics, endpic):
    for pic in all_pics:
        
        #print pic
        picInfo = all_pics[pic]
        #print picInfo
        if (picInfo["url"] == endpic):
            return picInfo["date"]
    return None
    

def filter_pics(all_pics, first_date, last_date):
    filtered_pics = {}
    for date in all_pics:
        #print pic

        if (date >= first_date and (last_date == None or date <= last_date)):
            filtered_pics[date] = all_pics[date]

    return filtered_pics

def get_pic_infos(exif_dict):
    picInfos = {}
    for ifd in ("0th", "Exif", "GPS", "1st"):
        for tag in exif_dict[ifd]:
            if piexif.TAGS[ifd][tag]["name"] != "MakerNote":
                #print(piexif.TAGS[ifd][tag]["name"], exif_dict[ifd][tag])
                #name = str(ifd) + "." + str(tag) + "." + str(piexif.TAGS[ifd][tag]["name"])
                name = str(piexif.TAGS[ifd][tag]["name"])
                picInfos[name] = exif_dict[ifd][tag]
    return picInfos

def rename_and_update_exif(pic, offset):
    date = pic["date"]
    url = pic["url"]
    name = os.path.basename(url)

    # calc new date by pic.date and offset
    newDate = calcNewDate(date, offset)

    # calc new filename
    newFileUrl = calcFileUrl(url, pic["date"], newDate)
    # print newFileUrl

    # load and change exif-data
    exif_data = piexif.load(url)
    exif_data["0th"][piexif.ImageIFD.DateTime] = newDate.strftime("%Y:%m:%d %H:%M:%S")
    # ignore other 2 for now

    # search new filename, if existing append _n, add to n until empty
    newFileUrl = getNonExistingFileName(newFileUrl)   
    print url + " " + offset + " = " + newFileUrl

    # write filename
    write_exif_to_file(exif_data, url, newFileUrl)


def getNonExistingFileName(newFileUrl):
    if not os.path.isfile(newFileUrl):
       return newFileUrl
    
    ext = os.path.splitext(newFileUrl)[1].lower()
    base = os.path.splitext(newFileUrl)[0]
    print ext + ", " + base
   
    exists = True
    index = 0
    while exists:
        index = index + 1
        new_name = base + '_' + str(index) + ext
        #new_full_name = os.path.join(path, new_name)
        exists = os.path.isfile(new_name)
    return new_name


def calcNewDate(date, offset):
    #date: 2017:09:09 08:55:03, offset: -08:01:00
    #t = datetime.strptime('Jun 1 2005  1:33PM', '%b %d %Y %I:%M%p')
    #t = datetime.datetime.strptime('2017:09:09 08:55:03', '%Y:%m:%d %H:%M:%S')
    t = datetime.datetime.strptime(date, '%Y:%m:%d %H:%M:%S')
    op = offset[0]
    h = offset[1:3]
    m = offset[4:6]
    s = offset[7:9]
    delta = datetime.timedelta(hours=int(h), minutes=int(m), seconds=int(s))
    #print "delta: " + str(delta) + "," + str(op) + "," + str(h) + "," + str(m) + "," + str(s)

    if op == "-":
       return t - delta
    else:
       return t + delta

def calcFileUrl(url, oldDate, newDate):
    # 2017_USA_Kanada_Auswahl/20170911_024953.jpg,  2017:09:11 02:49:53,   2017-09-11 10:49:53

    t = datetime.datetime.strptime(oldDate, '%Y:%m:%d %H:%M:%S')
    oldString = t.strftime("%Y%m%d_%H%M%S")
    newString = newDate.strftime("%Y%m%d_%H%M%S")
    newUrl = url.replace(oldString, newString, 1) 
    #print url + "   =>   " + newUrl
    return newUrl



def write_exif_to_file(exif_dict, path, newPath):
    im = Image.open(path)
    exif_bytes = piexif.dump(exif_dict)
    #tmpFile = path + "_forced.jpg"
    #im.save(tmpFile, "jpeg", exif=exif_bytes)
    im.save(newPath, "jpeg", exif=exif_bytes)
    
    os.remove(path)
    #os.rename(tmpFile, path)
    

if __name__=='__main__':
    try:
        startpic = sys.argv[1]
        if startpic.startswith("[") and startpic.endswith("]"):
              pics = [x.strip() for x in startpic[1:-1].split(",")]
              offset = sys.argv[2]
        else:
              endpic = sys.argv[2]
              offset = sys.argv[3]
              pics = None
    except IndexError:
        print '''Usage:  

  changeTime.py startpic endpic hourdiff
get dir, date, make and model from startpic
get all pic_infos from dir
filter by date and make and model
rename and change exif

$ ./changeTime.py startPic endPic offset
$ ./changeTime.py startPic endPic -08:03:00

OR

$ ./changeTime.py "[pic1, pic2, ..., picN]" -08:03:00

'''
        sys.exit(1)
   
    if pics is None:
        first_pic_info = get_pic_info(startpic)
        # {date, make, model}
        parentDir = os.path.dirname(startpic)
        make = first_pic_info["make"]
        model = first_pic_info["model"]
    

        all_pics = get_filtered_pic_infos(parentDir + "/", make, model)
        #print all_pics
        print "found " + str(len(all_pics)) + " pics for " + str(make) + " - " + str(model)
        # {
        #   date: { path, name }  
        # }
    
        last_pic_info = get_pic_info(endpic)
        print last_pic_info["date"]
    
        filtered_pics = filter_pics(all_pics, first_pic_info["date"], last_pic_info["date"]) 
        print "found " + str(len(filtered_pics)) + " pics in that date-range for " + str(make) + " - " + str(model)
    else:
        allPics = {}
        #print 'found files [%s]' % ', '.join(map(str, names))

        for s in sorted(pics):
            # just for pics
            #print "'%s'" %s
            ext = os.path.splitext(s)[1].lower()
            if ext in ['.jpg', '.jpeg', '.jfif', '.nef', '.png']:
                 pic_info = get_pic_info(s) 
                 #print pic_info
                 allPics[pic_info["date"]] = pic_info

            # {
            #   date: { path, name }  
            # }
        filtered_pics = allPics

    for pic in sorted(filtered_pics):
        #print "rename %s" % filtered_pics[pic]
        rename_and_update_exif(filtered_pics[pic], offset)



