# Roadtrip
- present Roadtrips with an easy framework
- just use a browser in fullscreen


## usage
- rename files based on exif-camera-timestamp with python-script `./renameByExif DIR`
- autorotate pics by exif with `exifautotran DIR/*`
- generate picInfos with `generatePicFile.py DIR`
- modify `allLocations.js`, 1 entry at the start-location and 1 entry per accommodation
- modify `index.html` (maybe that will be configurable too...)

## TODO
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
