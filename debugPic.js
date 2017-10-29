
	function showPic(){
		
		console.log("show pic, position:" + index);

		angle = 0;
		rotatePic();
		document.getElementById("angle").innerHTML = angle;

		
		index = tryGetPosition(index);
		var picRef = pics[index];
		console.log("show pic, picInfo.width:" + picRef.width + "picInfo.height=" + picRef.height);
		var pic = document.getElementById('thePic');
		pic.src = picRef.url;
		document.getElementById("model").innerHTML = picRef.Make + " (" + picRef.Model + ")";
		
		positionSpan.innerText = index;
		fileUrl.innerText = picRef.url;

		// calc fullscreen size, keep ratio!		
		var picRatio = picRef.width / picRef.height;
		console.log('picRatio:' + picRatio);
		
		var windowHeight = $(window).height() - 56 - 8; 
		var windowRatio = $(window).width() / windowHeight;
		console.log('windowRatio:' + windowRatio);
		var sizeMod = 0.8;
		if (picRatio < windowRatio){
			var windowRef = windowHeight;
			pic.height = windowRef * sizeMod;
			pic.width = windowRef * picRatio * sizeMod;
		} else {
			var windowRef = $(window).width();
			pic.width = windowRef * sizeMod;
			pic.height = windowRef / picRatio * sizeMod;
		}
		updateUrl(index);
	}

	
	function nextClick(){
		//index++;
		getNextIndex();
		showPic();
	}
	function previousClick(){
		//index--;
		getPreviousIndex();
		showPic();
	}

	function rotatePic(){
		var pic = document.getElementById("thePic");
		$("#thePic").css({
            "-webkit-transform": "rotate(" + angle + "deg)",
            "-moz-transform": "rotate(" + angle + "deg)",
            "transform": "rotate(" + angle + "deg)", /* For modern browsers(CSS3)  */
            "-ms-transform": "rotate(" + angle + "deg)",
            "transform-origin": (pic.width/2) + ' ' + (pic.height/2),
            "margin": "5%"
		});
	}

	function rotateClick(){
		angle = (angle + 90) % 360;
		rotatePic();
		
		document.getElementById("angle").innerHTML = angle;
		var cmd = getRotationText(angle, pics[index].url);
		document.getElementById("cmdText").innerHTML = cmd;
		copyTextToClipboard(cmd);
	}
	
	function intelligentRotateClick(){
		angle = (angle + 90) % 360;
		rotatePic();
		
		document.getElementById("angle").innerHTML = angle;
		var cmd = getIntelligentRotationText(angle, pics[index].url);
		document.getElementById("cmdText").innerHTML = cmd;
		copyTextToClipboard(cmd);
	}

	function forceInvertedSizeClick(){
		var cmd = getForceInvertedSizeText();
		document.getElementById("cmdText").innerHTML = cmd;
		copyTextToClipboard(cmd);
	}

	function getRotationText(angle, file){
		return "./exifmanualtran.sh " + angle + " " + file;
	} 
	
	function getIntelligentRotationText(angle, file){
		// model aware rotate and invert size and generate json file
		// &&: just run generateJson-script if first script was successful
		// improvement: generate json afterwards
		// another customization/improvement: for non SM-G920F pics, invert size (if needed)
		var myPic = pics[index];
		var width = myPic.height;
		var height = myPic.width;
		var model = myPic.Model;
		//console.log(model);
		var usual = "./exifmanualtran.sh " + angle + " " + file + " && ";
		if (angle % 180 === 90 && model.indexOf("G920F") === -1) {
			return usual + getForceInvertedSizeText() + " && " +		
               "./generateJsonPicFile.py " + getDir(file); 
		} else {
		  return "./exifmanualtran.sh " + angle + " " + file + " && "+
               "./generateJsonPicFile.py " + getDir(file); 
		} 
	}

    function getDir(file){
        return /(.*)\/[^/]*$/.exec(file)[1] + "/";
    }

	function getForceInvertedSizeText(){
		var myPic = pics[index];
		var width = myPic.height;
		var height = myPic.width;
		return "./exifForceSize.py " + myPic.url + " " + width + " " + height;
	}

	function copyTextToClipboard(text) {
		var textArea = document.createElement("textarea");
		textArea.value = text;
		document.body.appendChild(textArea);
		textArea.select();
		try{
			document.execCommand('copy');
		} catch (err) {
			console.log("copy did not work...");
		}
		document.body.removeChild(textArea);
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
	//console.log("pics debugging " + Object.keys(pics));


	var myNo = getPositionWithPound();
	console.log(myNo);
    if (myNo != null) {
		index = tryGetPosition(myNo);
	}
	showPic();
});

