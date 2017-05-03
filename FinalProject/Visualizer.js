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
  /*
  bars = [1,2,3,4,5,6,7,8,9];
  for (var number in Bars)
  {
    var bar = Bars[number] = new Sphere();
    bar.uniforms = {
      color : gl.getUniformLocation(bar.program, "color"),
      MV : gl.getUniformLocation(bar.program, "MV"),
      P : gl.getUniformLocation(bar.program, "P"),
    };
  }
  */
  resize();

  new Visualizer().ini();
  //window.requestAnimationFrame(render);
}


function render(meterNum, array, angle) {

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

    sphere.applyMatrix( new THREE.Matrix4().makeRotationZ(angle - time) );
    var radianAngle = (angle * i - time) * Math.PI / 180;
    sphere.applyMatrix( new THREE.Matrix4().makeTranslation(-Math.sin(radianAngle) * array[i] / 5, Math.cos(radianAngle) * array[i] / 5, 0 ));
    if(array[i] > 0)
    {
      sphere.scale.x = (array[i] / scaler);
      sphere.scale.y = (array[i] / scaler);
      sphere.scale.z = (array[i] / scaler);
    } else
    {
      sphere.scale.x = (.01);
      sphere.scale.y = (.01);
      sphere.scale.z = (.01);
    }



    //ms.load(V);
    //ms.push();
    //ms.rotate(time + angle * i, [0,0,1]);
    //ms.translate(array[i], 0, 0);
    //gl.useProgram(bar.program);
    //gl.uniformMatrix4fv(bar.uniforms.MV, false, flatten(ms.current()));
    //gl.uniformMatrix4fv(bar.uniforms.P, false, flatten(P));
    //gl.uniform4fv(bar.uniforms.color, flatten(data.color));
    scene.add(sphere);
    sphere.updateMatrix();

    //ms.pop();
  }


  //cube.position.y = 10;
  time += 1;
  requestAnimationFrame(render);
  renderer.render(scene, camera);
  while(scene.children.length > 0){
    scene.remove(scene.children[0]);
  }

}

function resize() {
  /*
  var w = canvas.clientWidth;
  var h = canvas.clientHeight;

  gl.viewport(0, 0, w, h);

  var fovy = 100.0; // degrees
  var aspect = w / h;

  P = perspective(fovy, aspect, near, far);
  */
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

      var geometry = new THREE.SphereGeometry(30, 50, 50, 0, Math.PI * 2, 0, Math.PI * 2);
      var material = new THREE.MeshBasicMaterial({color: 0xfffff, wireframe: true});
      var sphere = new THREE.Mesh(geometry, material);

      var ms = new MatrixStack();

      var angle = 360 / meterNum;
      V = translate(0,0,0)

/*
      for (var i = 0; i < meterNum; i++)
      {
        var bar = array[i] = new THREE.Mesh(geometry,material);



        bar.uniforms = {
          //color : gl.getUniformLocation(bar.program, "color"),
          MV : gl.getUniformLocation(bar.program, "MV"),
          P : gl.getUniformLocation(bar.program, "P"),
        };
      }
*/    /*
      for (var i = 0; i < meterNum; i++)
      {
        var scaler = 1000;
        //console.log("e");
        var sphere = new THREE.Mesh(geometry, material);
        //var rot = new THREE.Matrix4().makeRotationZ(angle * i);
        var pos = new THREE.Matrix4().makeRotationZ(angle * i);
        //pos.rotateAround((0,0,1), angle * i)
        //sphere.applyMatrix( rot * pos);
        sphere.matrixAutoUpdate = false;
        sphere.rotation.y = (angle * i);
        sphere.updateMatrix();
        geometry.applyMatrix( new THREE.Matrix4().makeTranslation(0, array[i] / scaler * 20, 0) );
        if(array[i] > 0)
        {
          sphere.scale.x = (array[i] / scaler);
          sphere.scale.y = (array[i] / scaler);
          sphere.scale.z = (array[i] / scaler);
        } else
        {
          sphere.scale.x = (.1);
          sphere.scale.y = (.1);
          sphere.scale.z = (.1);
        }


        //ms.load(V);
        //ms.push();
        //ms.rotate(time + angle * i, [0,0,1]);
        //ms.translate(array[i], 0, 0);
        //gl.useProgram(bar.program);
        //gl.uniformMatrix4fv(bar.uniforms.MV, false, flatten(ms.current()));
        //gl.uniformMatrix4fv(bar.uniforms.P, false, flatten(P));
        //gl.uniform4fv(bar.uniforms.color, flatten(data.color));
        scene.add(sphere);
        sphere.updateMatrix();

        //ms.pop();
      }


      //cube.position.y = 10;
      time += .01;
      requestAnimationFrame(render);
      renderer.render(scene, camera);
      while(scene.children.length > 0){
        scene.remove(scene.children[0]);
      }
      */
      render(meterNum, array, angle);



  /*
      var step = Math.round(array.length / meterNum); //sample limited data from the total array
      if(ctx)
      {
        ctx.clearRect(0, 0, cwidth, cheight);//clear canvas

        for (var i = 0; i < meterNum; i++)
        {
          var value = array[i * step];
          if (capYPositionArray.length < Math.round(meterNum))
          {
            capYPositionArray.push(value);
          };

          ctx.fillStyle = capStyle;

          //draw the cap, the the transition effect
          if (value < capYPositionArray[i])
          {
            ctx.fillRect(i * (meterWidth + gap), cheight - (--capYPositionArray[i]), meterWidth, capHeight);
          } else
          {
            ctx.fillRect(i * (meterWidth + gap), cheight - value, meterWidth, capHeight);
            capYPositionArray[i] = value;
          };
          ctx.fillStyle = "#123456";//gradient; //set the fillStyle to gradient for a better Look
          ctx.fillRect(i * (meterWidth + gap) , cheight - value + capHeight, meterWidth, cheight); //the meter

        }
      }
*/



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
