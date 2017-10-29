# Roadtrip
- present Roadtrips with an easy framework
- just use a browser in fullscreen


## build your roadtrip-site with the framework
- rename files based on exif-camera-timestamp with python-script `./renameByExif DIR`
- autorotate pics by exif with `exifautotran DIR/*`
- generate picInfos with `generateJsonPicFile.py DIR`
- modify `allLocations.js`, 1 entry at the start-location and 1 entry per accommodation
- modify `index.html` (maybe that will be configurable too...)

## change the date in name and exif
- if you use multiple cameras, some are timezone-aware and some are not - you need to rename the pics afterwards
- use the script `changeTime.py
	- via pic list: `./changeTime.py "[file1, file2, file3, ... , fileN]" -09:00:00`
	- via start and end pic: `./changeTime.py startPic endPic -09:00:00`
		- the firstPic is analyzed to get exif.make and exif.model to get the right camera
		- all pics in the directory are prefiltered with this make and model
		- the date from firstPic and lastPic is extracted and used for another filtering
		- all filtered pics (in the pic-directory with matching make, model and timestamp) are then renamed by this offset
	- if a newly renamed pic would override an existing pic, an postfix will be appended
- best practice
	- note all timezone-changes
	- if possible use 'main-timezone-change' initially for all necessary cameras, f.e.:
		- update time to Vancouver timezone (-9h)
			- `./changeTime.py alle_USA_Kanada/20170907_040744.jpg alle_USA_Kanada/20170923_004143.jpg -09:00:00 # Canon`
			- `./changeTime.py alle_USA_Kanada/20170908_224231.jpg alle_USA_Kanada/20170927_014734.jpg -09:00:00 # WB200F`
	- afterwards you remodify the pics for 'inner time zone changes', f.e.:
		- update time from Vancouver to Alberta timezonne (+1h)
			- `./changeTime.py alle_USA_Kanada/20170912_082842.jpg alle_USA_Kanada/20170916_145434.jpg +01:00:00 # Canon`
			- `./changeTime.py alle_USA_Kanada/20170911_113225.jpg alle_USA_Kanada/20170916_145434.jpg +01:00:00 # WB200F`
	- check your commmand before you hit enter!

## rotate pictures
- most of pics work with `exifautotran DIR/*` 
- some are still wrong - use debugPic and rotate yourself
	- you will see an command which is copied to the clipboard and can be used with `exifmanualtran.sh`
- seldomly some will still have the wrong exif-tags - use force inverted size
	- you will see an command which is copied to the clipboard and can be used with `exifForceSize.py
- if there are lots of pics and you know which camera needs an additional invert size call 
	- modify the "intelligentRotate"-javascript-function (shift + alt + i)
- hopefully then all are rotated in the right way (look through with debugPic)
	- accessKeys: shift + alt + n/p/r/f
- then you can finally generate the json file

## modify allLocations.js
- TODO

## show the roadtrip
- click on map-location or route to navigate to show a infobox with the dates
	- these dates are links and will open a modal window 'ShowPic' to show the configured picture (from allLocations)
	- there are 2 button for next / previous image
	- stop the presentation with escape / upper right X
	- the currently shown picture is saved in the background
	- quickly jump to certain pic via the url '...roadtrip/index.html?123' to show pic with id 123 from your extractedPics.js-file


## TODO
- right indices for last trip :-p
- titles for pics via locations...
- on route/city-click, maybe with zoom-icon in infowindow, zoom in and display detailed-locations
	- other json-file for that with array of locations per location/route (optional)
- test on raspberry pi
- close infowindow somehow...? 
	- not ideal: https://stackoverflow.com/questions/10022873/closing-info-windows-in-google-maps-by-clicking-the-map
- use navbar
	- on selection of city/route: center it and show infowindow
- improve UI, see: https://www.thregr.org/~wavexx/software/fgallery/demo/
