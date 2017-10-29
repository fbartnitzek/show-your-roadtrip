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


def write_exif_to_file(exif_dict, path):
    im = Image.open(path)
    exif_bytes = piexif.dump(exif_dict)
    tmpFile = path + "_forced.jpg"
    im.save(tmpFile, "jpeg", exif=exif_bytes)
    
    os.remove(path)
    os.rename(tmpFile, path)
    

if __name__=='__main__':
    try:
        path = sys.argv[1]
        width = int(sys.argv[2])
        height = int(sys.argv[3])
    except IndexError:
        print '''Usage:  

  exifForceSize.py  file width height
$ ./exifForceSize.py 20170913_102554_jpegtran.jpg 8256 2240

'''
        sys.exit(1)

    exif_dict = piexif.load(path)
    picInfos = get_pic_infos(exif_dict)
    print "all: %s" % json.dumps(picInfos, indent=4, sort_keys=True)

    #exif_dict = replace_exif_tags(exif_dict, 2240, 8256)
    if "PixelXDimension" in picInfos:
        try:
             exif_dict["0th"][piexif.ImageIFD.PixelXDimension] = width
             exif_dict["0th"][piexif.ImageIFD.PixelYDimension] = height
        except AttributeError:
             # happened once...
             exif_dict["Exif"][40962] = width
             exif_dict["Exif"][40963] = height

    else:
        exif_dict["0th"][piexif.ImageIFD.ImageWidth] = width
        exif_dict["0th"][piexif.ImageIFD.ImageLength] = height

    print "replaced in exif"
    picInfos = get_pic_infos(exif_dict)
    print "all: %s" % json.dumps(picInfos, indent=4, sort_keys=True)

    write_exif_to_file(exif_dict,path)
    print "written to file"




