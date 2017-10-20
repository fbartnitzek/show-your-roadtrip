# Roadtrip
- present Roadtrips with an easy framework
- just use a browser in fullscreen


## build your roadtrip-site with the framework
- rename files based on exif-camera-timestamp with python-script `./renameByExif DIR`
- autorotate pics by exif with `exifautotran DIR/*`
- generate picInfos with `generateJsonPicFile.py DIR`
- modify `allLocations.js`, 1 entry at the start-location and 1 entry per accommodation
- modify `index.html` (maybe that will be configurable too...)

## rotate pictures
- most of pics work with `exifautotran DIR/*`
- some are still wrong - use debugPic and rotate yourself
	- you will see an command which is copied to the clipboard and can be used with `exifmanualtran.sh`
- seldomly some will still have the wrong exif-tags - use force inverted size
	- you will see an command which is copied to the clipboard and can be used with `exifForceSize.py
- hopefully then all are rotated in the right way (look through with debugPic)
	- accessKeys: shift + alt + n/p/r/f
- then you can finally generate the json file :-p

## show the roadtrip
- click on map-location or route to navigate to show a infobox with the dates
	- these dates are links and will open a modal window 'ShowPic' to show the configured picture (from allLocations)
	- there are 2 button for next / previous image
	- stop the presentation with escape / upper right X
	- the currently shown picture is saved in the background
	- quickly jump to certain pic via the url '...roadtrip/index.html?123' to show pic with id 123 from your extractedPics.js-file

## TODO
- rotation of pics (if neccessary by cam...)
- right indices for last trip :-p
- some help / script for pic-timestamps
	- script to add/subtract offset for range of pics (range based on day-range and cam-model)
- titles for pics via locations...
- on route/city-click, maybe with zoom-icon in infowindow, zoom in and display detailed-locations
	- other json-file for that with array of locations per location/route (optional)
- test on raspberry pi
- close infowindow somehow...? 
	- not ideal: https://stackoverflow.com/questions/10022873/closing-info-windows-in-google-maps-by-clicking-the-map
- use navbar
	- on selection of city/route: center it and show infowindow
- improve UI, see: https://www.thregr.org/~wavexx/software/fgallery/demo/
