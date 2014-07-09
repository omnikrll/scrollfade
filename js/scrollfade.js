// for audio
var context;
var matrix;

var init = function() {
	try {
		window.AudioContext = window.AudioContext || window.webkitAudioContext;
		context = new AudioContext();
		matrix = new Matrix();
	} catch(e) {
		alert(e.name, e.message);
		console.log(e.name, e.message);
	}
}

// pure js scrolling stuff
var sections = document.getElementsByClassName("section");
var offsets = [0];

for (var i=0, ii=sections.length; i<ii; i++) {
	offsets.push(sections[i].offsetTop);
}

var curVisible = 0;

var scrollHandler = function() {
	if (offsets.indexOf(window.pageYOffset) != -1) {
		curVisible = offsets.indexOf(window.pageYOffset);
	}
	document.getElementById("offsetCounter").innerHTML = "window.pageYOffset: " + window.pageYOffset + "<br/>section[" + curVisible + "].offsetTop: " + sections[curVisible].offsetTop
}

window.addEventListener('load', init, false);
window.addEventListener('scroll', scrollHandler, false);

var Matrix =  (function() {

	var Matrix = function() {
		this.compressor = null;
		this.buffers = [];
		this.voices = [];

		this.initialize();
	}

	Matrix.prototype.constructor = Matrix;

	Matrix.prototype.initialize = function() {
		var self = this;
		var mediaSources = document.getElementsByClassName("media-source");
		// var anchors = $("a.audio-anchor");
		// var filePaths = [];

		// anchors.each(function() {
		// 	filePaths.push($(this).attr("src"));
		// });

		self.compressor = context.createDynamicsCompressor();
		self.compressor.connect(context.destination);

		// self.setupVoices(filePaths, function() {
		// 	// callback
		// });

		for (var i=0, ii=mediaSources.length; i<ii; i++) {
			var voice = new AudioTagVoice(mediaSources[i]);
			voice.gainStage.connect(self.compressor);
			self.voices[i] = voice;
		}
	}

	Matrix.prototype.setupVoices = function(urls, callback) {
		var lastUrl = urls.length - 1;

		for (var i=0, ii=urls.length; i<ii; i++) {

		}
	}



	return Matrix;
})();

var BufferVoice = (function(filePath) {

	var BufferVoice = function(filePath) {
		this.sourceNode = null;
		this.panner = null;
		this.gainStage = null;

		this.initialize(filePath, function() {
			// callback
		});
	}

	BufferVoice.prototype.constructer = BufferVoice;

	BufferVoice.prototype.initialize = function(filePath, callback) {
		var self = this;

		self.sourceNode = context.createBufferSource();
		self.panner = context.createPanner();
		self.gainStage = context.createGainNode();

		self.sourceNode.connect(self.panner);
		self.panner.connect(self.gainStage);

		self.loadBuffer(filePath, function(buffer) {
			
		})
	}

	BufferVoice.prototype.loadBuffer = function(filePath, callback) {
		var request = new XMLHttpRequest();
		request.open('GET', filePath, true);
		request.responseType = 'arraybuffer';

		request.onload = function() {
			context.decodeAudioData(request.response, function(buffer) {
				if (typeof callback === 'function') {
					return callback(buffer);
				}
			});
		}
	}

})();

var AudioTagVoice = (function(e) {

	var AudioTagVoice = function(e) {
		this.sourceNode = null;
		this.panner = null;
		this.gainStage = null;
		this.offsetTop = 0;
		this.parentTop = 0;
		this.parentBottom = 0;

		this.initialize(e);
	}

	AudioTagVoice.prototype.constructor = AudioTagVoice;

	AudioTagVoice.prototype.initialize = function(e) {
		var self = this;

		// create the nodes
		self.sourceNode = context.createMediaElementSource(e);
		self.panner = context.createPanner();
		self.gainStage = context.createGainNode();
		self.offsetTop = e.offsetTop;
		self.parentTop = e.parentNode.offsetTop;
		self.parentBottom = e.parentNode.offsetTop + e.parentNode.offsetHeight;

		// zero gain
		self.gainStage.gain.setValueAtTime(0, context.currentTime);

		self.sourceNode.connect(self.panner);
		self.panner.connect(self.gainStage);
	}

	AudioTagVoice.prototype.start = function() {
		this.sourceNode.mediaElement.play();
		console.log("start");
	}

	AudioTagVoice.prototype.stop = function() {
		this.sourceNode.mediaElement.pause();
		this.sourceNode.mediaElement.currentTime = 0;
		console.log("stop");
	}

	return AudioTagVoice;
})();