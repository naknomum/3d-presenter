
//props:  http://www.html5rocks.com/en/tutorials/file/dndfiles/

var numFiles = 0;
var fileData = new Array();

function filesSelected(ev) {
	processFiles(ev.target.files);
}


function filesDragOver(ev) {
	ev.stopPropagation();
	ev.preventDefault();
	ev.dataTransfer.dropEffect = 'copy';
}

function filesDropped(ev) {
	ev.stopPropagation();
	ev.preventDefault();
	processFiles(ev.dataTransfer.files);
}


function processFiles(files) {
	busy(true);
	console.log(files);
	numFiles = files.length;
console.log('numFiles = '+numFiles);
	for (var i = 0 ; i < numFiles ; i++) {
console.log(escape(files[i].name));
		processFile(files[i]);
	}
}


function processFile(file) {
console.log(file);
	var reader = new FileReader();
	reader.onload = (function(f) {
		return function(ev) { processFileContents(f, ev.target.result); };
/*
console.log(ev.target.result);
console.log(escape(f.name));
		};
*/
	})(file);

	reader.readAsDataURL(file);
}


function processFileContents(file, dataURI) {
	var i = dataURI.indexOf(';base64,');
	if (i < 0) {
		fileData.push({ file: file, error: 'bad dataURI parse'});
		checkFilesProgress();
		return;
	}

	fileData.push({
		file: file,
		mimeType: dataURI.substr(5, i-5),
		b64: dataURI.substr(i+8),
	});

	checkFilesProgress();
return;

	console.log(escape(file.name));
console.log(type);
	console.log(b64);
console.log(window.atob(b64));
console.log('-----------------------------------');
}


function checkFilesProgress() {
	if (fileData.length < numFiles) return;
	console.log('all files transfered');
console.log(fileData);

	var method = false;
	var mesh = false;
	var texture;

	for (var i = 0 ; i < fileData.length ; i++) {
		if (fileData[i].mimeType.match(/^image\//)) {
			texture = 'data:' + fileData[i].mimeType + ';base64,' + fileData[i].b64;
		} else if (fileData[i].file.name.match(/\.obj$/)) {
			mesh = window.atob(fileData[i].b64);
			method = addOBJbyData;
		}
	}

	if (!method || !mesh) {
		addMessage('error', ':( bad file(s)?');

	} else {
		method(mesh, texture);
	}
}


