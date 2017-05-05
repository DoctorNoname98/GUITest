gl = null;
var canvas;

var V;  // matrix storing the viewing transformation

// Projection transformation parameters
var P;  // matrix storing the projection transformation
var near = 10;      // near clipping plane's distance
var far = 120;      // far clipping plane's distance
var bars = [1];
var valueArray;
// Animation variables
var time = 0.0;      // time, our global time constant, which is
                     // incremented every frame
var timeDelta = 0.5; // the amount that time is updated each fraime
var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 1, 100);
camera.position.z = 100;
var renderer = new THREE.WebGLRenderer();
var time = 0;

function init()
{
  canvas = document.getElementById("webgl-canvas");
  gl = WebGLUtils.setupWebGL(canvas);
  if (!gl) { alert("WebGL initialization failed"); }

  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.enable(gl.DEPTH_TEST);

  new Visualizer().ini();
}


function render(meterNum, array, angle) {



}





//window.onload = init;



window.onload = function()
{
  init();
}

var Visualizer = function()
{
  this.file = null;//current file
  this.fileName = null;//current file name
  this.audioContext = null;
  this.source = null;//audio source
  this.info = document.getElementById('info').innerHTML;//used to upgrade UI
  this.infoUpdateId = null;//to store the setTimeout ID and clear the interval
  this.animationId = null;
  this.status = 0;//1 for music playing, 0 forstopped
  this.forceStop = false;
  this.allCapsReachBottem = false;
  //this.info = document.getElementById('info').innerHTML;
}

Visualizer.prototype =
{
  ini: function()
  {
    this._prepareAPI();
    this._addEventListener();
  },
  _prepareAPI: function()
  {
    //fix browser vender for AudioContext and requestAnimationFrame
    window.AudioContext = window.AudioContext || window.webkitAudioContext || window.msAudioContext;
    window.requestAnimationFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame;
    window.cancelAnimationFrame = window.cancelAnimationFrame || window.webkitCancelAnimationFrame || window.mozCancelAnimationFrame;
    try
    {
      this.audioContext = new AudioContext ();
    } catch (e)
    {
      this._updateInfo('!Your browser does not support AudioContext', false);
      console.log(e);
    }
  },
  _addEventListener: function()
  {
    var thisInstance = this,
        audioInput = document.getElementById('uploadedFile'),
        dropContainer = document.getElementById('webgl-canvas')[0];
      //lsiten the file upload
      audioInput.onchange = function()
      {
        if (thisInstance.audioContext == null) {return;};

        if (audioInput.files.length !== 0)
        {
          //only process first file
          thisInstance.file = audioInput.files[0];
          thisInstance.fileName = thisInstance.file.name;
          if (thisInstance.status === 1)
          {
            //if uploading a new file, stop the music
            thisInstance.forceStop = true;
          };
          document.getElementById('fileWrapper').style.opacity = 1;
          thisInstance._updateInfo('Uploading', true);

          thisInstance._start();
        };
      };
      //listen the drag & drop
      if(dropContainer)
      {
        dropContainer.addEventListener("dragenter", function(e)
        {
          e.stopPropagation();
          e.preventDefault();
          //set the drop mode
          e.dataTransfer.dropEffect = 'copy';
        }, false);
      }
  },
  _start: function()
  {
    //read and decode the file into audio array buffer
    var that = this,
        file = this.file,
        fr = new FileReader();
    fr.onload = function(e)
    {
      var fileResult = e.target.result;
      var audioContext = that.audioContext;
      if (audioContext === null)
      {
        return;
      };
      that._updateInfo('Decoding the audio', true);
      audioContext.decodeAudioData(fileResult, function(buffer)
      {
        that._updateInfo('Decode succesful, starting the visualizer', true);
        that._visualize(audioContext, buffer);
      }, function(e)
      {
        that._updateInfo('!Fail to decode the file', false);
        console.error(e);
      });
    };
    fr.onerror = function(e)
    {
      that._updateInfo('!Fail to read the file', false);
      consolde.error(e);
    };
    //assign the file to the reader
    this._updateInfo('Starting to read the file', true);
    if(fr)
    {
      fr.readAsArrayBuffer(file);
    }
  },
  _visualize: function(audioContext, buffer)
  {
    var audioBufferSourceNode = audioContext.createBufferSource(),
        analyser = audioContext.createAnalyser(),
        that = this;
    //connect the source to the analiser
    audioBufferSourceNode.connect(analyser);
    //connect the analiser the the destination(the speaker)
    analyser.connect(audioContext.destination);
    //then assign the buffer to the buffer source node
    audioBufferSourceNode.buffer = buffer;
    //play the source
    if (!audioBufferSourceNode.start)
    {
      audioBufferSourceNode.start = audioBufferSourceNode.noteOn //in old browsers use noteOn method
      audioBufferSourceNode.stop = audioBufferSourceNode.noteOff // and noteOff method
    };
    //stop the previous sound if any
    if (this.animationId !== null)
    {
      cancelAnimationFrame(this.animationId);
    }
    if (this.source !== null)
    {
      this.source.stop(0);
    }
    audioBufferSourceNode.start(0);
    this.status = 1;
    this.source = audioBufferSourceNode;
    audioBufferSourceNode.onended = function()
    {
      that._audioEnd(that);
    };
    this._updateInfo('Playing ' + this.fileName, false);
    this.info = 'Playing ' + this.fileName;
    document.getElementById('fileWrapper').style.opacity = 0.2;
    this._drawSpectrum(analyser);
  },
  _drawSpectrum: function(analyser)
  {
    camera.position.z = 100;




    var that = this,
        canvas = document.getElementById('webgl-canvas'),
        cwidth = canvas.width,
        cheight = canvas.height - 2,
        meterWidth = 10, // width of meters in the spectrum
        gap = 2, //gap between meters
        capHeight = 2,
        capStyle = '#fff',
        meterNum = 32, //count of the meters
        capYPositionArray = []; //store the vertical position of the caps for the previous frame
        ctx = canvas.getContext('2d');//,
        //gradient = ctx.createLinearGradient(0, 0, 0, 300);
    //gradient.addColorStop(1, '#0f0');
    //gradient.addColorStop(0.5, '#ff0');
    //gradient.addColorStop(0, '#f00');
    var drawMeter = function()
    {



      var array = new Uint8Array(analyser.frequencyBinCount);
      analyser.getByteFrequencyData(array);
      if (that.status === 0)
      {
        //fix when some sounds end the value still not back to zero
        for (var i = arr.length - 1; i >= 0; i--)
        {
          array[i] = 0;
        };
        allCapsReachBottem = true;
        for (var i = capYPositionArray.length - 1; i >= 0; i--)
        {
          allCapsReachBottom = allCapsReachBottom && (capYPositionArray[i] === 0)
        };
        if (allCapsReachBottom)
        {
          cancelAnimationFrame(thet.animationId);//since the sound is stoped and animation finished, stop the requestAnimation to prevent potential memory leak,THIS IS VERY IMPORTANT!
          return;
        };
      };

      var angle = 360 / meterNum;


      for (var i = 0; i < meterNum; i++)
      {
        var geometry = new THREE.SphereGeometry(10, 10, 10, 0, Math.PI * 2, 0, Math.PI * 2);
        var material = new THREE.MeshBasicMaterial({color: 0xfffff, wireframe: true});
        var scaler = 1000;
        //console.log("e");
        var sphere = new THREE.Mesh(geometry, material);
        //pos.rotateAround((0,0,1), angle * i)
        //sphere.applyMatrix( rot * pos);
        sphere.matrixAutoUpdate = false;
        //sphere.rotation.y = (/*time + */angle * i);
        sphere.updateMatrix();
        //sphere.translate.x = (i * 10));

        var radianAngle = (angle * i - time) * Math.PI / 180;

        sphere.applyMatrix( new THREE.Matrix4().makeRotationZ(radianAngle) );


        if(array[i] > .01)
        {
          sphere.applyMatrix( new THREE.Matrix4().makeTranslation(-Math.sin(radianAngle) * array[i] / 5, Math.cos(radianAngle) * array[i] / 5, 0 ));
          sphere.scale.x = (array[i] * 1.9/ scaler);
          sphere.scale.y = (array[i] * 1.9/ scaler);
          sphere.scale.z = (array[i] * 1.9/ scaler);
        } else
        {
          sphere.scale.x = (.01);
          sphere.scale.y = (.01);
          sphere.scale.z = (.01);
        }


        scene.add(sphere);
        sphere.updateMatrix();

      }


      time += 1;
      requestAnimationFrame(render);
      renderer.render(scene, camera);
      while(scene.children.length > 0){
        scene.remove(scene.children[0]);
      }







      that.animationId = requestAnimationFrame(drawMeter);


    }
    this.animationId = requestAnimationFrame(drawMeter);
  },
  _audioEnd: function(instance)
  {
    if (this.forceStop)
    {
      this.forceStop = false;
      this.status = 1;
      return;
    };
    this.status = 0;
    var text = 'Javascript Audio Visualizer';
    document.getElementById('fileWrapper').style.opacity = 1;
    document.getElementById('info').innerHTML = text;
    instance.info = text;
    document.getElementById('uploadedFile').value = '';
  },
  _updateInfo: function(text, processing)
  {
    var infoBar = document.getElementById('info'),
        dots = '...',
        i = 0,
        that = this;
    infoBar.innerHTML = text + dots.substring(0, i++);
    if (this.infoUpdateId !== null)
    {
      clearTimeout(this.infoUpdateId);
    };
    if (processing)
    {
      //animate dots at the end of the info text
      var animateDot = function()
      {
        if (i > 3)
        {
          i = 0
        };
        infoBar.innerHTML = text + dots.substring(0, i++);
        that.infoUpdateId = setTimeout(animateDot, 250);
      }
      this.infoUpdateId = setTimeout(animateDot, 250);
    };
  }
}
