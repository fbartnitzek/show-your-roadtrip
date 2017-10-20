#!/bin/sh
# exifmanualtran angle file
#
# Transforms JPEG file manually and sets Exif Orientation 1
#
  case $1 in
    -v|--version) echo "exifmanualtran"; exit 0;;
    -h|--help) 
      cat <<EOF
exifmanualtran angle file
Transforms JPEG file manually and sets Exif Orientation 1
example:
exifmanualtran 270 path/to/myPic.jpeg
EOF
    exit 0;;
  esac

  case $1 in
    0) transform="";;
    180) transform="-rotate 180";;
    90) transform="-rotate 90";;
    270) transform="-rotate 270";;
    *) exit 1;;
  esac


  if test -n "$transform"; then
    echo Executing: jpegtran -copy all $transform $2 >&2
    jpegtran -copy all $transform "$2" > tempfile
	if test $? -ne 0; then
      echo Error while transforming $2 - skipped. >&2
    else
      rm "$2"
      mv tempfile "$2"
      jpegexiforient -1 "$2" > /dev/null
    fi
  fi
