#!/usr/bin/python

# -*- coding: Windows-1251 -*-

# import Image

import os
import re
import sys
import time
import json
import piexif

from os.path import isfile, join

CREATE_HARDLINK=0

def generate_pic_info(fn):
    #print 'pic found: %s' % (fn)
    
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
    pic_infos["ts"] = all_pic_infos["DateTime"]
    #pic_infos["orientation"] = all_pic_infos["Orientation"]
    pic_infos["Make"] = all_pic_infos["Make"]
    pic_infos["Model"] = all_pic_infos["Model"]


    if "PixelXDimension" in all_pic_infos:
        #for name in ("PixelXDimension", "PixelYDimension"):
        #    pic_infos[name] = all_pic_infos[name]
        pic_infos["width"] = all_pic_infos["PixelXDimension"]
        pic_infos["height"] = all_pic_infos["PixelYDimension"]
    else:
        #for name in ("ImageLength", "ImageWidth"):
        #    pic_infos[name] = all_pic_infos[name]
        pic_infos["width"] = all_pic_infos["ImageWidth"]
        pic_infos["height"] = all_pic_infos["ImageLength"]

    return pic_infos


def generate_pic_json_for_dir(dn):
    names = os.listdir(dn)
    count=0
    allPics = []
    print 'found files [%s]' % ', '.join(map(str, names))

    for s in sorted(names):
        # just for pics
        ext = os.path.splitext(s)[1].lower()
        if ext in ['.jpg', '.jpeg', '.jfif', '.nef', '.png']:
             allPics.append(generate_pic_info(join(dn,s)))

    #print "end"

    #print json.dumps(allPics)

    with open('exportedPics.js', 'w') as f:
        #json.dump(allPics, f)

        f.write('var pics={\n')
        pos = -1
        for pic in allPics:
            pos = pos + 1
            f.write('%i: ' % pos)
            #pic["no"]=pos
            f.write(json.dumps(pic))
            f.write(',\n')
        f.write('};\n')
   
    return len(allPics)


if __name__=='__main__':
    try:
        path = sys.argv[1]
    except IndexError:
        print '''Usage:  

  generateJsonPicFile.py  dirname
'''
        sys.exit(1)

    if os.path.isdir(path):
        count = generate_pic_json_for_dir(path)
        #print '%d file(s) renamed.' % count
        print 'json file generated with %d pic(s).' % count
    else:
        print 'ERROR: path not found: %s' % path
