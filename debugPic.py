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

CREATE_HARDLINK=0

def debug_exif(path):
    exif_dict = piexif.load(path)
    picInfos = {}
    for ifd in ("0th", "Exif", "GPS", "1st"):
        for tag in exif_dict[ifd]:
            if piexif.TAGS[ifd][tag]["name"] != "MakerNote":
                #print(piexif.TAGS[ifd][tag]["name"], exif_dict[ifd][tag])
                picInfos[piexif.TAGS[ifd][tag]["name"]] = exif_dict[ifd][tag]
    
    return picInfos
    #print "%s" % json.dumps(picInfos, indent=4, sort_keys=True)


def debug_exif_detailed(path):
    exif_dict = piexif.load(path)
    picInfos = {}
    for ifd in ("0th", "Exif", "GPS", "1st"):
        for tag in exif_dict[ifd]:
            if piexif.TAGS[ifd][tag]["name"] != "MakerNote":
                #print(piexif.TAGS[ifd][tag]["name"], exif_dict[ifd][tag])
                picInfos[str(ifd) + "." + str(tag) + "." + piexif.TAGS[ifd][tag]["name"]] = exif_dict[ifd][tag]
    
    return picInfos


def debug_pic_infos(fn):
    print 'pic found: %s' % (fn)
    if not os.path.isfile(fn):
        print "file not found %s" % fn
        return None
   
    pic_info = {}
    try:
        im = Image.open(fn)
        exif_data = im._getexif()
        # '40962': 5312
        # '40963': 2988
        # '305':   "G920..."
        # '306':   "2017:09:09 08:51:42"
        # '36867': "2017:09:09 08:51:42"
        # '36868': "2017:09:09 08:51:42"
        # '271':   "samsung"
        # '272':   "SM-G920F"
        
        pic_info["url"] = fn
        pic_info["width"] = exif_data[40962]
        pic_info["height"] = exif_data[40963]
        #pic_info["vendor"] = exif_data[271]
        #pic_info["model"] = exif_data[272]
        #pic_info["cam"] = exif_data[305]
        pic_info["ts"] = exif_data[306]
        
        print(json.dumps(exif_data, indent = 4))
        #print(json.dumps(pic_info, indent = 4, sort_keys=True))
        return pic_info
    except:
        _type, value, traceback = sys.exc_info()
        pic_info["url"] = fn
        pic_info["error"] = True
        print "Error for %s:\n" % fn
        print "%r", value

	return pic_info 


if __name__=='__main__':
    try:
        path = sys.argv[1]
        if path == "--verbose":
            path = sys.argv[2]
            verbose = True
        else:
            verbose = False
    except IndexError:
        print '''Usage:  

  generateJsonPicFile.py  dirname
'''
        sys.exit(1)

    if verbose:
        picInfos = debug_exif_detailed(path)
    else:
        picInfos = debug_exif(path)
        
    print "all: %s" % json.dumps(picInfos, indent=4, sort_keys=True)

# collect Make, Model, Orientation, DateTimeOriginal, DateTime
# PixelXXXDimension for usual pics, ImageLength/Width if not available
    if not verbose:
        usefulPicInfos = {}
        for name in ("Model", "Make", "Orientation", "DateTime"):
            usefulPicInfos[name] = picInfos[name]

        if "PixelXDimension" in picInfos:
            for name in ("PixelXDimension", "PixelYDimension"):
                usefulPicInfos[name] = picInfos[name]
        else:
            for name in ("ImageLength", "ImageWidth"):
                usefulPicInfos[name] = picInfos[name]

        print "useful: %s" % json.dumps(usefulPicInfos, indent=4, sort_keys=True)


