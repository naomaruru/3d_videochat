/*************
 * Three
 *************/
var Three = function () {
  this.scene = new THREE.Scene();
  this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 500);
  this.renderer = new THREE.WebGLRenderer();
  this.objs = {};
  this.objs.members = {};
  this.fontLoader = new THREE.FontLoader();
  this.light = new THREE.PointLight(0xFFFFFF);
  // this.axisHelper = new THREE.AxisHelper(1000);
  this.gridXZ = new THREE.GridHelper(1000, 100, new THREE.Color(0xFFFFFF), new THREE.Color(0x7f7f7f) );
  this.scale = 5.0;
  this.width = 1280 / this.scale;
  this.height = 720 / this.scale;
  this.ratio = 5.0;
  this.ctracker = new clm.tracker();
  this.direction = "C";
  // this.count = 0;
  // this.tmpDiff = 0.0;
  // this.defaultDiff = 0.0;
  // this.audioCtx = new window.AudioContext();
}

Three.prototype._init = function() {
  var self = this;

  //window resize
  function _onWindowResize() {
    self.camera.aspect = window.innerWidth / window.innerHeight;
    self.camera.updateProjectionMatrix();
    self.renderer.setSize( window.innerWidth, window.innerHeight );
  }

  this.camera.position.set(0, 100 / this.scale, 0);
  this.camera.lookAt(new THREE.Vector3(0, 0, -1000));

  //renderer
  this.renderer.shadowMap.enabled = true;
  this.renderer.setPixelRatio( window.devicePixelRatio );
  this.renderer.setSize( window.innerWidth, window.innerHeight );
  window.addEventListener( 'resize', _onWindowResize, false );
  document.body.appendChild( this.renderer.domElement );

  //Light
  this.light.position.set(0,1000,0);
  this.scene.add(this.light);

  //axisHelper
  // blue z; green y; red x;
  // this.axisHelper.position.set(0,0,0);
  // this.scene.add(this.axisHelper);

  //gradXZ
  this.gridXZ.position.set(0,0,0);
  this.scene.add(this.gridXZ);

  //clmtrackr
  this.ctracker.init(pModel);

  //audioContext
  //this.audioCtx.listener.setPosition(0, 0, 0);
}
Three.prototype._makeVideoObject = function(id) {
  var self = this;
  var width = this.width,
  height = this.height,
  ratio = this.ratio;

  var videoImage = document.createElement( 'canvas' );
  videoImage.width = width;
  videoImage.height = height;
  this.objs.members[id].videoImage = videoImage;

  var videoImageContext = videoImage.getContext( '2d' );
  videoImageContext.fillStyle = '#FFFFFF';
  videoImageContext.fillRect( 0, 0, videoImage.width, videoImage.width );
  this.objs.members[id].videoImageContext = videoImageContext;

  var videoTexture = new THREE.Texture( videoImage );
  videoTexture.minFilter = THREE.LinearFilter;
  videoTexture.magFilter = THREE.LinearFilter;
  videoTexture.format = THREE.RGBFormat;
  this.objs.members[id].videoTexture = videoTexture;

  //text object
  this.fontLoader.load('./fonts/gentilis_regular.typeface.json', function(_font){
    var text = id,
    parameter = {
      font: _font,
      size: 20 / self.scale,
      height: 2 / self.scale,
      curveSegments: 1,
      bevelThickness: 0.1 /self.scale,
      bevelSize: 0.1 / self.scale,
      bevelEnabled: true
    },
    geometry = new THREE.TextGeometry( text, parameter ),
    material = new THREE.LineBasicMaterial({ color: 0x156289 }),
    obj = new THREE.Mesh( geometry, material );
    obj.position.set(-width/(2*ratio), height/ratio + parameter.size, -400/ self.scale);

    self.scene.add( obj );
    self.objs.members[id].font = obj;
  });

  //video object
  var material = new THREE.MeshBasicMaterial( { map: videoTexture, overdraw: true, side:THREE.DoubleSide } ),
  geometry = new THREE.PlaneGeometry( videoImage.width / ratio, videoImage.height / ratio, 4, 4 ),
  movieScreen = new THREE.Mesh( geometry, material );
  movieScreen.position.set(0, height / (2*ratio), -400 / self.scale);

  this.scene.add(movieScreen);
  this.objs.members[id].movieScreen = movieScreen;
}

Three.prototype._makeAudioObject = function(stream, id) {
  var width = this.width,
  height = this.height,
  ratio = this.ratio;

  var audioCtx = new window.AudioContext();
  var panner = audioCtx.createPanner();
  var gainNode = audioCtx.createGain();

  var source = audioCtx.createMediaStreamSource(stream);
  source.connect(gainNode);

  //panner.setPosition(0, height / (2*ratio), panner.positionZ.maxValue);
  panner.setPosition(2, 0, -1);

  gainNode.connect(panner);
  panner.connect(audioCtx.destination);

  gainNode.gain.value = 1;

  this.objs.members[id].audioCtx = audioCtx;
  this.objs.members[id].panner = panner;
  this.objs.members[id].gainNode = gainNode;
  this.objs.members[id].stream = stream;
  // console.log(this.objs.members[id]);
  // window.objmembers = this.objs.members;
}
Three.prototype._deleteObject = function(id) {
  var _member = this.objs.members[id];
  for (var objKey in _member) {
    this.scene.remove(_member[objKey]);
    delete _member[objKey];
  }
}
Three.prototype._cleanMembers = function() {
  var _members = this.objs.members;
  for (var id in _members) {
    if ($.isEmptyObject(_members[id].movieScreen)) {
      delete this.objs.members[id];
    }
  }
}
Three.prototype._updatePositions = function() {
  var _members = this.objs.members;
  var length = Object.keys(_members).length,
  index = 0;
  for (var id in _members) {
    if (!$.isEmptyObject(_members[id].movieScreen)) {
      var base_x = 0,
        base_z = -400 / this.scale;
      switch (length){
        case 1:
          _members[id].movieScreen.position.x = base_x;
          _members[id].movieScreen.position.z = base_z * (3.0/4);
          _members[id].movieScreen.rotation.y = 0;
          break;
        case 2:
          _members[id].movieScreen.position.x = base_x + this.width/(2*this.ratio) * (2*index - 1);
          _members[id].movieScreen.position.z = base_z;
          _members[id].movieScreen.rotation.y = - Math.PI / 6 * (2*index - 1);
          break;
        case 3:
          _members[id].movieScreen.position.x = base_x + this.width/(this.ratio) * (index - 1);
          _members[id].movieScreen.position.z = base_z - base_z / 4 * Math.abs(index - 1);
          _members[id].movieScreen.rotation.y = - Math.PI / 8 * (index - 1);
          break;
      }
    }
    if (!$.isEmptyObject(_members[id].font)) {
      var base_x = -this.width/(2*this.ratio),
        base_z = -400 / this.scale;
      switch (length){
        case 1:
          _members[id].font.position.x = base_x;
          _members[id].font.position.z = base_z * (3.0/4);
          _members[id].font.rotation.y = 0;
          break;
        case 2:
          _members[id].font.position.x = base_x + this.width/(2*this.ratio) * (2*index - 1);
          _members[id].font.position.z = base_z;
          _members[id].font.rotation.y = - Math.PI / 6 * (2*index - 1);
          break;
        case 3:
          _members[id].font.position.x = base_x + this.width/(this.ratio) * (index - 1);
          _members[id].font.position.z = base_z - base_z / 4 * Math.abs(index - 1);
          _members[id].font.rotation.y = - Math.PI / 8 * (index - 1);
          break;
      }
      if (!$.isEmptyObject(_members[id].panner)) {
        _members[id].panner.positionX.value =  2 * (2 * index -1 );
        //_members[id].panner.positionZ.value = (_members[id].movieScreen.position.z / 400 / this.scale) * 2;
      }
      if (!$.isEmptyObject(_members[id].gainNode)) {
        //var val = 1.0;
        //_members[id].gainNode.gain.value = val * (this.width / Math.sqrt(Math.pow(_members[id].movieScreen.position.x, 2) + Math.pow(_members[id].movieScreen.position.z, 2)));
      }
    }
    index++;
  }
}
Three.prototype._updateCamera = function(){
  var length = Object.keys(this.objs.members).length;
  var MAX = 0;
  switch (length) {
    case 0:
      // MAX = Math.PI;
      MAX = 0;
      break;
    case 1:
      MAX = 0;
      break;
    case 2:
      // MAX = Math.PI / 12;
      MAX = 0;
      break;
    case 3:
      MAX = Math.PI / 6;
      break;
  }
  var MIN = -MAX;
  var base_rot = 0,
  move = Math.PI / 300;
  switch (this.direction) {
    case "C":
      move = 0;
    case "R":
      move *= -1;
      break;
    case "L":
      move *= 1;
      break;
  }
  this.camera.rotation.y += move;
  if (this.camera.rotation.y < MIN) {
    this.camera.rotation.y = MIN;
  } else if (this.camera.rotation.y > MAX) {
    this.camera.rotation.y = MAX;
  }
}
Three.prototype._detectDirection = function(face) {
  // var x1 = face.top[0],
  // x2 = face.bottom[0],
  // _diff = x2 - x1 - this.defaultDiff,
  // diff = _diff * Math.abs(_diff),
  // thr = 1.5;
  var diff = Math.sqrt(Math.pow(face.rip.left[0] - face.outline.left[0], 2)
      + Math.pow(face.rip.left[1] - face.outline.left[1], 2))
    - Math.sqrt(Math.pow(face.rip.right[0] - face.outline.right[0], 2)
        + Math.pow(face.rip.right[1] - face.outline.right[1], 2)),
  ratio = diff / Math.sqrt( Math.pow(face.outline.right[0] - face.outline.left[0], 2) + Math.pow(face.outline.right[1] - face.outline.left[1], 2) );
  thr = 0.1;
  // console.log(ratio);
  if (ratio > thr){
    this.direction = "R";
  } else if (ratio < -thr){
    this.direction = "L";
  } else {
    this.direction = "C";
  }
}
Three.prototype._calibration = function() {
  var positions = this.ctracker.getCurrentPosition() || [];
  if (positions.length > 0) {
    var nose = {
      top: positions[33],
      middle: positions[41],
      bottom: positions[62]
    };
    this.tmpDiff += (nose.bottom[0] - nose.top[0]);
    if (this.count++ > 100) {
      this.defaultDiff = this.tmpDiff / this.count;
      console.log("calibration : " + this.defaultDiff);
    }
  }
}

Three.prototype._animate = function() {
  var self = this,
  _members = self.objs.members;
  function update() {
    self._cleanMembers();
    self._updatePositions();
    self._updateCamera();
  }
  function render() {
    for (var id in _members) {
      if (!$.isEmptyObject(_members[id].video)) {
        _members[id].videoImageContext.drawImage( _members[id].video, 0, 0, _members[id].videoImage.width, _members[id].videoImage.height );
        if (_members[id].videoTexture) {
          _members[id].videoTexture.needsUpdate = true;
        }
      }
    }
  }
  function track() {
    var positions = self.ctracker.getCurrentPosition() || [];
    if (positions.length > 0) {
      // var nose = {
      // top: positions[33],
      // middle: positions[41],
      // bottom: positions[62]
      // };
      // self._detectDirection(nose);
      var face = {
        outline : {
          right: positions[3],
          left: positions[11]
        }, rip: {
          right: positions[44],
          left: positions[50]
        }
      };
      self._detectDirection(face);
    } else {
      self.direction = "C";
    }
  }
  function animateHelper() {
    requestAnimationFrame( animateHelper );
    update();
    render();
    // if (self.defaultDiff != 0) {
    track();
    // } else {
    // self._calibration();
    // }
    self.renderer.render( self.scene, self.camera );
  }
  animateHelper();
}
Three.prototype.start = function() {
  if (Detector.webgl) {
    this._init();
    this._animate();
  } else {
    var warning = Detector.getWebGLErrorMessage();
    document.getElementById('container').appendChild(warning);
  }
}

/*************
 * DIMWEBRTC
 *************/

var DIMWEBRTC = function (key) {
  this.peer = new Peer( { key: key } );
  this.three = new Three();
  this.localStream = null,
  this.exportStream = null;
  this._peerInit();
}

// start local stream
DIMWEBRTC.prototype._streamInit = function() {
  var self = this;
  var constraints = {audio: true, video: { width: this.three.width * this.three.scale / 2, height: this.three.height * this.three.scale / 2 }};
  function successCallback_1(stream) {
    self.localStream = stream;
    self._getStream(self.localStream);
  }
  function successCallback_2(stream) {
    self.exportStream = stream;
    self._getOtherPeers();
  }
  function failureCallback(error) {
    console.error('An error occurred: [CODE ' + error.code + ']');
    return;
  }
  navigator.getUserMedia(constraints, successCallback_1, failureCallback);
  var constraints = {audio: true, video: { width: this.three.width, height: this.three.height }};
  navigator.getUserMedia(constraints, successCallback_2, failureCallback);
}

// start local stream
DIMWEBRTC.prototype._getStream = function (stream, id = this.peer.id) {
  var videoElement = document.createElement("video");
  // videoElement.srcObject = stream;
  //videoElement.play();
  /*
     var audioCtx = new window.AudioContext();
     var panner = audioCtx.createPanner();
     var gainNode = audioCtx.createGain();
     var source = audioCtx.createMediaStreamSource(stream);
     source.connect(gainNode);
     panner.setPosition(2, 0,-1);
     gainNode.gain.value = 0;
     gainNode.connect(panner);
     panner.connect(audioCtx.destination);
     */
  videoElement.srcObject = stream;
  // videoElement.setAttribute("src", URL.createObjectURL(stream));
  // videoElement.play();
  /*
     function continueVideo() {
     videoElement.play();
     }
     setTimeout(continueVideo, 100);
     */
  if (id != this.peer.id) {
    this.three.objs.members[id] = {};
    this.three.objs.members[id].video = videoElement;
  } else {
    videoElement.muted = true;
    var width = this.three.width * 2.0 + "",
    height = this.three.height  * 2.0 + "";
    videoElement.setAttribute("width", width);
    videoElement.setAttribute("height", height);
    videoElement.setAttribute("class", "embed-responsive-item");
    videoElement.setAttribute("style", "display: none");
    $('#myVideo').append(videoElement);
    this.three.ctracker.start(videoElement);
  }
}

DIMWEBRTC.prototype._peerInit = function() {
  var self = this;
  this.peer.on('open', function(id){
    console.log("peer open : " + id);
    self._streamInit();
    self.three.start();
  });
  this.peer.on('connection', function(dataConnection) {
    console.log("dataConnection open");
    // setInterval(self._sendMyRotation, 1000, dataConnection, self.three.camera);
    dataConnection.on('data', function(data) {
      console.log("arrived data from " + dataConnection.peer + " : " + data);
    });
    dataConnection.on('close', function() {
      console.log("dataConnection close");
      self.three._deleteObject(dataConnection.peer);
    });
  });
  this.peer.on('call', function(mediaConnection) {
    console.log("mediaConnection open");
    mediaConnection.answer(self.exportStream);
    mediaConnection.on('stream', function(stream) {
      self._getStream(stream, mediaConnection.peer);
      self.three._makeVideoObject(mediaConnection.peer);
      self.three._makeAudioObject(stream, mediaConnection.peer);
    });
    mediaConnection.on('close', function() {
      console.log("mediaConnection close");
    });
  });
  this.peer.on('close', function() {
    console.log("peer close");
  });
}

DIMWEBRTC.prototype._getOtherPeers = function(id) {
  var self = this;
  this.peer.listAllPeers(function(list) {
    for(var _id of list) {
      if(_id != self.peer.id ) {
        self._call(_id);
      }
    }
  });
}
DIMWEBRTC.prototype._sendMyRotaion = function(dataConnection, camera) {
  dataConnection.send(camera.rotation.y);
}
DIMWEBRTC.prototype._call = function(_id) {
  var self = this;
  var dataConnection = this.peer.connect(_id);
  dataConnection.on('open', function() {
    console.log("dataConnection open");
    // setInterval(self._sendMyRotation, 1000, dataConnection, self.three.camera);
  });
  dataConnection.on('data', function(data) {
    console.log("arrived data from " + dataConnection.peer + " : " + data);
  });
  dataConnection.on('close', function() {
    console.log("dataConnection close");
    self.three._deleteObject(dataConnection.peer);
  });
  var mediaConnection = this.peer.call(_id, this.exportStream);
  mediaConnection.on('stream', function(stream) {
    console.log("mediaConnection open");
    self._getStream(stream, mediaConnection.peer);
    self.three._makeVideoObject(mediaConnection.peer);
    self.three._makeAudioObject(stream, mediaConnection.peer);
  });
  mediaConnection.on('close', function() {
    console.log("mediaConnection close");
  });
}
