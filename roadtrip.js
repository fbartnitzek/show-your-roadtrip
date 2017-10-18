	function initMap(){
		// locations from allLocations.js 

		var mapProp={
			center:new google.maps.LatLng(49.5,-120.1), 
			zoom:6,
			//mapTypeId: google.maps.MapTypeId.ROADMAP
		};
		var map=new google.maps.Map(document.getElementById("googleMap"),mapProp);

		var infowindow = new google.maps.InfoWindow();


		// add markers
		var i;
		var marker;
		var locationInfo;
		var locationInfos = {};

		// create array with lat_lng to date?
		for (i=0; i<locations.length;i++){
			var cLocation = locations[i];
			//console.log(cLocation);		

			var lat = cLocation[1];
			var lng = cLocation[2];

			locationInfo = locationInfos[toKey(lat,lng)];
			//console.log(locationInfo);

			if (locationInfo == null){	// unknown				
				
				locationInfo = [ cLocation[0], 
								 new google.maps.LatLng( cLocation[1], cLocation[2] ),  
								 [ [ cLocation[3], cLocation[4] ] ] 
								];

				locationInfos[toKey(lat,lng)] = locationInfo;
				//console.log(locationInfo);

			} else {				// known -> add date to location
			//	console.log('latLng found');
				var locDates = locationInfo[2];
				locDates.push( [ cLocation[3], cLocation[4] ] );
				locationInfo[2] = locDates;
				locationInfos[toKey(lat,lng)] = locationInfo;
			}
		}

		console.log(locationInfos);
		

		// create markers with links
		for (i in locationInfos){
			//locationInfo = locationInfos[i];	

			marker=new google.maps.Marker({
				position: locationInfos[i][1],	
				map: map
			});
			
			google.maps.event.addListener(marker, 'click', (function(marker, i){
				return function() {
					
					//infowindow.setContent('<a href="./' + locationInfo[0] +  '/index.html">' + locationInfo[0] +'</a>');
					infowindow.setContent( calcMarkerText( locationInfos[i] ) );
					//infowindow.setContent(calcMarkerText()'<a href="./' + locations[i][3] +  '/index.html">' + locations[i][0] +'</a>');
					infowindow.open(map,marker);
				}
			})(marker, i));
		}
/*
{
	lat;lng: [ title, latLng, [[date, url], [date, url], [date, url]] ]
}
*/

		// add routes
		var line;
		var lines= [];
		var nextLocInfo;

		for (i=0; i<locations.length-2; i++){

			locationInfo = locationInfos[ toKey( locations[i][1], locations[i][2] ) ];
			nextLocInfo = locationInfos[ toKey( locations[i+1][1], locations[i+1][2] ) ];
			

			line= new google.maps.Polyline({
				//path:[latLngs[i],latLngs[i+1]],
				path: [locationInfo[1], nextLocInfo[1]],
				//strokeColor:"0000FF",
				strokeColor:"A9A9A9",
				strokeOpacity: 0.8,
				strokeWeight: 6
			});
			google.maps.event.addListener(line, 'click', (function(line, i){
				return function() {
					infowindow.setContent(calcTourText(locations[i], locations[i+1]));
					//infowindow.setContent('<a href="./' + locations[i+1][3]  + '/route/index.html">' + 
					//						locations[i][0] + ' to ' + locations[i+1][0] + '</a>');
					infowindow.setPosition(routeLatLng(locations[i],locations[i+1]));
					infowindow.open(map,line);
				}
			})(line, i));

			line.setMap(map);
		}
	}

	function toKey(lat, lng){
		return lat + "_" + lng;
	}


	function routeLatLng(l1, l2) {
		return new google.maps.LatLng(
			(l1[1] + l2[1]) / 2, 
			(l1[2] + l2[2]) / 2);
	}
	
	function calcMarkerText( locationInfo ) {

		//return '<a href="./' + locationInfo[0] +  '/index.html">' + locationInfo[0] +'</a>';
		var links = '';
		console.log(locationInfo[2]);
		for (var j = 0; j < locationInfo[2].length; ++j){
			links += '<li><a ' +
						'data-toggle="modal" data-target="#myModal" onclick="showOtherPic('+ locationInfo[2][j][1]  +')"' + 
						'>' + locationInfo[2][j][0] + '</a></li>';	
		}

		return '<p>' + locationInfo[0] + '</p><ul>' + links + '</ul>';
	}

	function calcTourText( locStart, locEnd){
		return	'<p>' + locStart[0] + ' to ' + locEnd[0] + '</p><ul><li>' +
				'<a data-toggle="modal" data-target="#myModal" onclick="showOtherPic('+ locStart[5]  +')">' + 
						locEnd[3] + '</a></li></ul>';

	}

// end of map stuff


// start of pic stuff

	function showOtherPic(pos){
		console.log(pos);
		index = pos;
		showPic();
	}

	function showPic(){

		console.log("show pic, position:" + index);
		
		//var picRef = pics[index % pics.length];	// TODO: something clever to get all with getNext, getPrevious...
		//var picRef = pics[index];	
		index = tryGetPosition(index);
		var picRef = pics[index];
		console.log("show pic, picInfo.width:" + picRef.width + "picInfo.height=" + picRef.height);
		
		var pic = document.getElementById('thePic');
		var picTitle = document.getElementById('picTitle');
		var picDate = document.getElementById('picDate');
		var positionSpan = document.getElementById('positionSpan');
		pic.src = picRef.url;
		
		// TODO: get title from nearest location / route, when no explicit title is given
		picTitle.innerText = picRef.title;
		picDate.innerText = picRef.ts;
		positionSpan.innerText = index;

		// calc fullscreen size, keep ratio!		
		var picRatio = picRef.width / picRef.height;
		console.log('picRatio:' + picRatio);
		
		var windowHeight = $(window).height() - 56 - 8; 
		var windowRatio = $(window).width() / windowHeight;
		console.log('windowRatio:' + windowRatio);
		if (picRatio < windowRatio){
			var windowRef = windowHeight;
			pic.height = windowRef;
			pic.width = windowRef * picRatio;
		} else {
			var windowRef = $(window).width();
			pic.width = windowRef;
			pic.height = windowRef / picRatio;
		}
		updateUrl(index);
	}

	
	function myNextClick(){
		//index++;
		getNextIndex();
		showPic();
	}
	function myPreviousClick(){
		//index--;
		getPreviousIndex();
		showPic();
	}

	function tryGetPosition(pos){
		if (pics[pos] != null){
			return pos;
		} else {
			var min = getNextBiggerIndex(pos);
			return min != null ? min : getLowestIndex();
		}
	}

    function getPositionWithPound(url) {
    	if (!url) url = window.location.href;
		//console.log("url: " + url);
    	var regex = new RegExp(/[#?](\d*)$/g);
       	var	results = regex.exec(url);
       	//var	results = /[#?](\d*)$/.exec(url);
		//console.log("results: " + results);	// shows whole regex match, then all group matches ... obviously :-p
    	if (!results) return null;
		return results[1];
	}

	function updateUrl(position){
		var myUrl = window.location.href;
		var baseUrl = /^(.*)[#?]/.exec(myUrl);

		baseUrl = baseUrl == null ? myUrl : baseUrl[1];
		//if (baseUrl == null) {
		//	baseUrl = myUrl;
		//} else {
		//	baseUrl = baseUrl[1];
		//}
		//console.log("baseUrl: " + baseUrl);
		var newUrl = baseUrl + "?" + position;
		window.history.pushState("object or string", "Title", newUrl);
	}

	function getNextIndex(){
		// constraint: just integer keys
		//console.log("current index:" + index);
		if (pics[index+1] != null) {
			index++;
		} else {
			// search something slighly bigger (or lowest in worstcase)
			var min = getNextBiggerIndex(parseInt(index));
			index = min != null ? min : getLowestIndex();
		}
	}
	
	function getPreviousIndex(){
		// constraint: just integer keys
		//console.log("current index:" + index);
		if (pics[index-1] != null) {
			index--;
		} else {
			// search something slighly smaller (or biggest in worstcase)
			var min = getNextSmallerIndex(parseInt(index));
			index = min != null ? min : getBiggestIndex();
		}
	}

	function getNextBiggerIndex(number){
		var myKeys = Object.keys(pics);
		var len = myKeys.length;
		var min = null;

		for (var i=0; i < len; i++){
			var candidate = parseInt(myKeys[i]);
			if (candidate > number){
				if (min == null){
					min = candidate;
				} else if (min > candidate){
					min = candidate;
				}
			}
		}
		return min;
	}

	function getNextSmallerIndex(number){
		var myKeys = Object.keys(pics);
		var len = myKeys.length;
		var max = null;

		for (var i=0; i < len; i++){
			var candidate = parseInt(myKeys[i]);
			if (candidate < number){
				if (max == null){
					max = candidate;
				} else if (max < candidate){
					max = candidate;
				}
			}
		}
		return max;
	}

	function getLowestIndex(){
		var myKeys = Object.keys(pics);
		var len = myKeys.length;
		var min = null;

		for (var i=0; i < len; i++){
			var candidate = parseInt(myKeys[i]);
			if (min == null){
				min = candidate;
			} else if (candidate < min){
				min = candidate;
			}
		}
		return min;
	}

	function getBiggestIndex(){
		var myKeys = Object.keys(pics);
		var len = myKeys.length;
		var max = null;

		for (var i=0; i < len; i++){
			var candidate = parseInt(myKeys[i]);
			if (max == null){
				max = candidate;
			} else if (candidate > max){
				max = candidate;
			}
		}
		return max;
	}

	

$(function(){
	// test
	console.log("pics debugging " + Object.keys(pics));


	var myNo = getPositionWithPound();
	console.log(myNo);
    if (myNo != null) {
		index = tryGetPosition(myNo);
		$('#myModal').modal('show');
		showPic();
	}
});

