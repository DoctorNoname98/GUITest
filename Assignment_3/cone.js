var gl = null;
var cone = null;

function init() {
    
    var canvas = document.getElementById( "webgl-canvas" );

    gl = WebGLUtils.setupWebGL( canvas );

    if ( !gl ) {
        alert("Unable to setup WebGL");
        return;
    }

    gl.clearColor( 1.0, 1.0, 0.0, 1.0 );
    cone = new Cone(4, "Cone-vertex-shader", "Cone-fragment-shader");

    render();
}

function render() {
    cone.render();
    gl.clear( gl.COLOR_BUFFER_BIT );
}

window.onload = init;
