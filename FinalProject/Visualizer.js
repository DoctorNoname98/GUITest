gl = null;
var canvas;

var V;  // matrix storing the viewing transformation

// Projection transformation parameters
var P;  // matrix storing the projection transformation
var near = 10;      // near clipping plane's distance
var far = 120;      // far clipping plane's distance
var bars = [1];
// Animation variables
var time = 0.0;      // time, our global time constant, which is
                     // incremented every frame
var timeDelta = 0.5; // the amount that time is updated each fraime


function init()
{
  canvas = document.getElementById("webgl-canvas");
  gl = WebGLUtils.setupWebGL(canvas);
  if (!gl) { alert("WebGL initialization failed"); }

  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.enable(gl.DEPTH_TEST);
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
  resize();

  //Visualizer();
  window.requestAnimationFrame(render);
}


function render() {
    var ms = new MatrixStack();

    gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT);

    V = translate(0.0, 0.0, -0.5*(near + far));
    ms.load(V);

    //square = new Square();
    //square.render();
    var number, bar;
    number = 0;
    bar = Bars[number];
    //planet.PointMode = true;

    ms.push();
    gl.useProgram(bar.program);
    //ms.scale(20);
    gl.uniformMatrix4fv(bar.uniforms.MV, false, flatten(ms.current()));
    gl.uniformMatrix4fv(bar.uniforms.P, false, flatten(P));
    //gl.uniform4fv(bar.uniforms.color, flatten(data.color));
    bar.render();
    ms.pop();

    number = 1;
    bar = Bars[number];
    //planet.PointMode = true;

    ms.push();
    gl.useProgram(bar.program);
    ms.translate(20, 0, 0);
    gl.uniformMatrix4fv(bar.uniforms.MV, false, flatten(ms.current()));
    gl.uniformMatrix4fv(bar.uniforms.P, false, flatten(P));
    //gl.uniform4fv(bar.uniforms.color, flatten(data.color));
    bar.render();
    ms.pop();
}

function resize() {
  var w = canvas.clientWidth;
  var h = canvas.clientHeight;

  gl.viewport(0, 0, w, h);

  var fovy = 100.0; // degrees
  var aspect = w / h;

  P = perspective(fovy, aspect, near, far);
}

window.onload = init;

/*function Visualizer()
{
  //file = new File("C:\Users\drnon_000\desktop", DarudeAstleySandroll.mp3);
  audioInputStream = AudioSystem.getAudioInputStream(file);

  frameLength = (int) (audioInputStream.getFrameLength());
  frameSize = (int) (audioInputStream.getFormat().getFrameSize());

  bytes = new byte[frameLength * frameSize];

  results = 0;
  try
  {
    result = audioInputStream.read(byts);
  } catch (e)
  {
    e.printStackTrace();
  }

  sampleIndex = 0;

  for (t = 0; t < eightBitByteArray.length;)
  {
    for (channel = 0; channel < numChannels; channel++)
    {
      low = (int) (eightBitByteArray[t]);
      t++;
      high = (int) (eightBitByteArray[t]);
      t++;
      sameple = (high << 8) + (low & 0x00ff);
      toReturn[channel][samepleIndex] = sample;
    }
    sampleIndex++;
    render();
  }*/


  /*private int getSixteenBitSample(int high, int low)
  {
    return (high << 8) + (low & 0x00ff);
  }*/
//}
