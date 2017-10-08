#!/usr/bin/python

# -*- coding: Windows-1251 -*-

import Image

import os
import re
import sys
import time
import json

from os.path import isfile, join

CREATE_HARDLINK=0

def generate_pic_info(fn):
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
        
        #print(json.dumps(exif_data, indent = 4))
        #print(json.dumps(pic_info, indent = 4, sort_keys=True))
        return pic_info
    except:
        _type, value, traceback = sys.exc_info()
        pic_info["url"] = fn
        pic_info["error"] = True
        print "Error for %s:\n" % fn
        print "%r", value

	return pic_info 


def generate_pic_json_for_dir(dn):
    names = os.listdir(dn)
    count=0
    allPics = []
    print 'found files [%s]' % ', '.join(map(str, names))

    for s in sorted(names):
        allPics.append(generate_pic_info(join(dn,s)))

    print "end"

    with open('exportedPics.js', 'w') as f:
        #json.dump(allPics, f)

        f.write('var pics=[\n')
        pos = -1
        for pic in allPics:
            pos = pos + 1 
            pic["no"]=pos
            f.write(json.dumps(pic))
            f.write(',\n')
        f.write('];\n')
   
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
