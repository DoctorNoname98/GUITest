var gl = null;
var cone = null;

function init() {
    cone = new Cone( n );
    var canvas = document.getElementById( "webgl-canvas" );

    gl = WebGLUtils.setupWebGL( canvas );

    if ( !gl ) {
        alert("Unable to setup WebGL");
        return;
    }

    gl.clearColor( 1.0, 1.0, 0.0, 1.0 );
    gl_PointSize = 10;

    render();
}

function render() {
    cone.render();
    gl.drawArrays(gl.POINTS, 0, 10);
    gl.clear( gl.COLOR_BUFFER_BIT );
}

window.onload = init;
