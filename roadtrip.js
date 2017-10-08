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

	function showOtherPic(pos){
		console.log(pos);
		index = pos;
		showPic();
	}

	function showPic(){

		console.log("show pic, position:" + index);
		
		var picRef = pics[index % pics.length];
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
	}
	
	function myNextClick(){
		index++;
		showPic();
	}

