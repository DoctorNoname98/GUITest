var gl = null;
var cone = null;

function init() {
    cone = new Cone(4);
    var canvas = document.getElementById( "webgl-canvas" );

    gl = WebGLUtils.setupWebGL( canvas );

    if ( !gl ) {
        alert("Unable to setup WebGL");
        return;
    }

    gl.clearColor( 1.0, 1.0, 0.0, 1.0 );

    render();
}

function render() {
    cone.render();
    gl.clear( gl.COLOR_BUFFER_BIT );
}

window.onload = init;
