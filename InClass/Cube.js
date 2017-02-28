var gl = null;
var cone = null;

function init() {

    var canvas = document.getElementById( "webgl-canvas" );

    gl = WebGLUtils.setupWebGL( canvas );

    if ( !gl ) {
        alert("Unable to setup WebGL");
        return;
    }

    gl.clearColor( 1.0, 1.0, 0.5, 1.0 );
    cone = new Cone(gl, 4);
    sun = new Sphere();
    sun.period = 2;
    sun.distance = 0;
    sun.scaler = 10;
    mercury = new Sphere();
    venus = new Sphere();
    earth = new Sphere();
    mars = new Sphere();

    render();
}

function render() {
    foreach p in planet {
        sun.render ();
        ms.push;
        ms.rotate(p.period, [0,1,0]);
        ms.translate(p.distance,0,0);
        ms.scale(p.scaler, p.scaler, p.scaler);
        mercury.render();
        ms.pop;
    }

}

function cube() {
  this.count = 8;
  this.positions = {
    values : new Float32Array([
      0.5, 0.5, 0.5,
      0.5, 0.5, -0.5,
      0.5, -0.5, 0.5,
      0.5, -0.5, -0.5,
      -0.5, 0.5, 0.5,
      -0.5, 0.5, -0.5,
      -0.5, -0.5, 0.5,
      -0.5, -0.5, -0.5
    ]),
    numComponents : 3
  }
}

window.onload = init;
