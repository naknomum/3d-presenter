var cameraInitialized = false;
var snapshotCount = 0;
var sceneReady = false;
var latestSnapshot = false;
var editMode = false;

var thisUrl = window.location.toString();
if (thisUrl.substr(-1) != '/') thisUrl += '/';
console.log(thisUrl);



jQuery(document).ready(function() {
	init();
});




var entered = 0;
var id = false;
var drawCanvas = document.createElement('canvas');

function init() {
	id = window.location.pathname.substr(5);
	if (id.substr(-1) != '/') id += '/';
	id = id.substr(0,id.length-1);
console.log('id='+id);

	if (data.key) editMode = true;

	if (data.new) {
		editMode = true;
		//delete(data.new);
	}

	//this prevents shifting the 3d stuff when we drag on the ui element
	jQuery('#ui-save-wrapper').on('mousedown', function(e) { e.stopPropagation(); });

	initTools();

	init3d();

	drawCanvas.setAttribute('id', 'drawCanvas');
	jQuery('body').append(drawCanvas);

	if (editMode) {
		jQuery('#ui-help-wrapper').show();
		jQuery('#ui-save-wrapper').append('<div id="save-main" class="ui"><span class="inactive url">' + thisUrl + '</span></div><div id="snap-urls" />');
	}


	var objFile, objTexture;
	if (data.fileData) {
		for (var i = 0 ; i < data.fileData.length ; i++) {
			if (data.fileData[i].file.name.indexOf('.obj') > -1) {
				objFile = data.fileData[i].file.name;
			} else if (data.fileData[i].mimeType.indexOf('image/') == 0) {
				objTexture = data.fileData[i].file.name;
			}
		}
	}

	if (objFile) {
		//var u = '/obj/' + id + '/';
		//var objUrl = u + objFile;
//console.log(objUrl);
//console.log(objTexture);
		addOBJbyUrl(objFile, objTexture);
		if (data.cameraPosition) {
			camera.position.x = data.cameraPosition.x;
			camera.position.y = data.cameraPosition.y;
			camera.position.z = data.cameraPosition.z;
		}
		cameraInitialized = true;
	}

	if (false && data.sceneData) {
		var sl = new THREE.SceneLoader();
console.log(data.sceneData);
		sl.parse(data.sceneData, function(e) {
console.log('scene loaded????');
console.log(e);
scene = e.scene;
/*
	sceneReady = true;  //TODO handle > 1 object
	busy(false);
	changesMade();
	jQuery('#ui-tools-wrapper').show();
	jQuery('#ui-save-wrapper').show();
			if (data.cameraPosition) {
				camera.position.x = data.cameraPosition.x;
				camera.position.y = data.cameraPosition.y;
				camera.position.z = data.cameraPosition.z;
			}
			cameraInitialized = true;
*/
		}, '.');
	}

	if (data.effects) {
		for (var efType in data.effects) {
console.log(efType);
			setEffect(efType, data.effects[efType]);
		}

	}


	var mouseWheelTimer = false;
	jQuery('body').on('mousewheel', function() {
		if (mouseWheelTimer) return true;
		clearTimeout(mouseWheelTimer);
		mouseWheelTimer = setTimeout(function() {
			clearTimeout(mouseWheelTimer);
			mouseWheelTimer = false;
			//now do what we have to do
			data.cameraPosition = camera.position;
			controlsChanged = false;
			changesMade();
		}, 750);
		return true;
	});

	jQuery('body').mouseup(function() {
		if (cameraInitialized && controlsChanged) {
			data.cameraPosition = camera.position;
			controlsChanged = false;
			changesMade();
		}
	});

	jQuery(window).resize(function() {
		waitForFinalEvent(function(){
console.log('resize done??????');
			onWindowResize();  //3d
/////// note: snapshot fails cuz 3d redraw is not finished... must find event on this!  TODO (for now we just stall for a half second and hope!)
///// ditto for initial draw
			snapshotToCanvasDELAYED();
		}, 500, "main");
	});


	updateSaveMenu();


	//jQuery('#file-input').bind('change', filesSelected);

	//see:  js/files.js
  var dropZone = document.body;
  dropZone.addEventListener('dragover', filesDragOver, false);
  dropZone.addEventListener('drop', filesDropped, false);


}



//until we figure out how to check that 3d renderer/canvas is ready for a snapshot, we use this for *certain cases* where we need
//  to pause a little before taking the snapshot.  lame, yes.  it will go away some day.  TODO
var _snapshotAlreadyWaiting = false;
function snapshotToCanvasDELAYED() {
	if (_snapshotAlreadyWaiting) return;
	console.log('using DELAYED snapshot!  fix me some day. :)');
	_snapshotAlreadyWaiting = true;
	setTimeout(function() {
		snapshotToCanvas();
		_snapshotAlreadyWaiting = false;
	}, 600);
}


function snapshotToCanvas() {
	if (!sceneReady) return;

	var w = jQuery(drawCanvas).width();
	var h = jQuery(drawCanvas).height();
//w =200; h = 100;
	drawCanvas.width = w;
	drawCanvas.height = h;

	var ctx = drawCanvas.getContext('2d');

	var layers = new Array();

	if (data.effects && data.effects.background) {
		if (effectsData.background[data.effects.background].type == 'background-color') {
			ctx.rect(0, 0, w, h);
			ctx.fillStyle = effectsData.background[data.effects.background].value;
			ctx.fill();

		} else if (effectsData.background[data.effects.background].type == 'background-image') {
			layers.push(effectsData.background[data.effects.background].value);
		}
	}

	layers.push(renderer.domElement.toDataURL("image/png"));
//layers.push(effectsData.n23.value);
/*
  ctx.beginPath();
      ctx.rect(188, 50, 200, 100);
      ctx.fillStyle = 'yellow';
      ctx.fill();
      ctx.lineWidth = 7;
      ctx.strokeStyle = 'black';
      ctx.stroke();
 
*/

	var i = new Image();
	i.onload = function() {
		ctx.drawImage(this, 0, 0, w, h);
		if (layers.length > 0) {
			i.src = layers.shift();
		} else {
			_snapshotCanvasReady();
		}
	}
	//i.crossOrigin = '';
	i.src = layers.shift();
}


//this is called when images all loaded into canvas above
function _snapshotCanvasReady() {
	console.log('taken snapshot ' + snapshotCount);
	var imgdata = drawCanvas.toDataURL("image/png");
	latestSnapshot = imgdata.substr(22);
	jQuery('#snapshotPreview').remove();
	var w = jQuery(drawCanvas).width();
	var h = jQuery(drawCanvas).height();
	jQuery('body').append('<div id="snapshotPreview"><img id="snapshotPreview" src="' + imgdata + '" /><span class="download-info">' + w + 'x' + h + ' PNG [' + snapshotCount + ']</span><a class="download icon-button" href="' + imgdata + '" download="snapshot-' + w + 'x' + h + '-' + snapshotCount + '.png">&nbsp;</a></div>');
	snapshotCount++;
}

function dragin() {
	entered++;
	jQuery('#upel').show();
}

function dragout() {
	entered--;
	if (!entered) jQuery('#upel').hide();
}


function addMessage(type, msg) {
	jQuery('#ui-messages').prepend('<div class="ui message-' + type + '">' + msg + '</div>');
}


function initTools() {
	var h = jQuery('<div />');

	for (var efType in effectsData) {
		h.append('<b>' + efType + '</b><br />');
		for (var ef in effectsData[efType]) {
			var b = jQuery('<div class="bgbutton" onClick="setEffect(\'' + efType + '\',\'' + ef + '\');" />');
			if (effectsData[efType][ef].type == 'background-color') {
				b.css('background-color', effectsData[efType][ef].value);
			} else if (effectsData[efType][ef].type == 'background-image') {
				b.css('background', 'url(' + effectsData[efType][ef].value + ') no-repeat');
			}
			h.append(b);
		}
		h.append('</div>');
	}

	//h.append('</div>');
	jQuery('#ui-tools-wrapper .ui-toggle-big').append(h);
}


function setEffect(efType, efKey) {
	if (!data.effects) data.effects = new Object();
	data.effects[efType] = efKey;
	enableEffect(efType, efKey);
	changesMade();
}

function enableEffect(efType, efKey) {
	jQuery('body').css('background', '');
	if (effectsData[efType][efKey].type == 'background-color') {
		jQuery('body').css('background-color', effectsData[efType][efKey].value);
	} else if (effectsData[efType][efKey].type == 'background-image') {
		jQuery('body').css('background', 'url(' + effectsData[efType][efKey].value + ') no-repeat');
	}
	jQuery('body').css('background-size', '100%');
}



function objAdded(obj) {
console.log('objAdded(' + obj.uuid + ')');
	sceneReady = true;  //TODO handle > 1 object
	cameraInitialized = true; //for new instance upon first drag; maybe better handled when renderer is done rendering?
	busy(false);
	changesMade();

	if (editMode) {
		jQuery('#ui-tools-wrapper').show();
		jQuery('#ui-save-wrapper').show();
	}
}

var saveState = {};

function changesMade() {
console.log(' ..... changes made ..... ');
	saveState.changes = true;
	updateSaveMenu();
	if (snapshotCount < 1) {
		snapshotToCanvasDELAYED();  //TODO find better way to know canvas/renderer/whatev is ready for snapshot!
	} else {
		snapshotToCanvas();
	}
}


function updateSaveMenu() {
	if (!data.created) busy(false);
	jQuery('#save-button').remove();
	if (saveState.changes) {
		jQuery('#save-main').prepend('<span id="save-button" onClick="save()" class="icon icon-save button"></span>');
	} else {
		jQuery('#save-main').prepend('<span id="save-button" class="icon icon-save-ok"></span>');
		jQuery('#save-main url').removeClass('inactive');
	}
	if (data.created && !jQuery('.default-img').length) {
		jQuery('#save-main').after('<div class="ui default-img"><span class="icon icon-img"></span><span class="url">' + thisUrl + 'img.png</span></div>');
	}

	if (!data.snaps) data.snaps = [];
	var s = '';
	for (var i = 0 ; i < data.snaps.length ; i++) {
		s += '<div class="ui"><span class="icon icon-img"></span><span class="url">' + thisUrl + data.snaps[i] + '</span></div>';
	}
	jQuery('#snap-urls').html(s);
}


function save() {
console.log('---------------------- saving');
	document.getElementById('save-button').onclick = null;
	jQuery('#save-button').removeClass('button').removeClass('icon-save').addClass('icon-clock');
	if (latestSnapshot) data.snap = latestSnapshot;
	if (fileData) data.fileData = fileData;
	data.sceneData = new THREE.SceneExporter().parse(scene);
	jQuery.ajax({
		url: '/',
		data: {json: JSON.stringify(data)},
		success: function(d) { saveDone(d); },
		error: function(x,a,b) { console.log('save error: ' + a + b); },
		dataType: 'json',
		type: 'POST'
	});
}


function saveDone(d) {
console.log(d);
	jQuery('#save-button').removeClass('icon-clock');
	if (d.ok) {
		saveState.changes = false;
		data.snaps = d.snaps;
		//if (d.snap) saveState.snaps.unshift(d.snap);
		//if (saveState.snaps.length > 3) saveState.snaps.pop();
		if (d.key && !saveState.key) {
			jQuery('#save-main').after('<div class="ui key"><span class="icon icon-key"></span><span class="url">' + thisUrl + d.key + '</span></div>');
			saveState.key = d.key;
			data.key = d.key;
		}
		updateSaveMenu();
	} 

	if (d.error) alert('save error: ' + d.error); //TODO nicer!
}


function busy(b) {
	if (b) {
		jQuery('#busy').show();
	} else {
		jQuery('#busy').hide();
	}
}



//  h/t http://stackoverflow.com/questions/2854407/javascript-jquery-window-resize-how-to-fire-after-the-resize-is-completed
var waitForFinalEvent = (function () {
  var timers = {};
  return function (callback, ms, uniqueId) {
    if (timers[uniqueId]) {
      clearTimeout (timers[uniqueId]);
    }
    timers[uniqueId] = setTimeout(callback, ms);
  };
})();

