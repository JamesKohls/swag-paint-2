// Vertex shader program
var VSHADER_SOURCE = `
  attribute vec4 a_Position;
  uniform float u_Size;
  void main() {
    gl_Position = a_Position;
    gl_PointSize = u_Size;
  }`;

// Fragment shader program
var FSHADER_SOURCE = `
  precision mediump float;
  uniform vec4 u_FragColor;
  void main() {
    gl_FragColor = u_FragColor;
  }`

// Global Variables
let canvas;
let gl;
var g_shapesList = [];
let a_Position;
let u_FragColor;
let u_Size;

let selectedSize = 5.0
let selectedColor = [0.0, 0.0, 0.0, 1.0];

function setupWebGL() {
  canvas = document.getElementById('webgl');
  gl = canvas.getContext("webgl", { preserveDrawingBuffer: true });
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }
}

function connectVariablesToGLSL() {
    if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
      console.log('Failed to intialize shaders.');
      return;
    }
    a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    if (a_Position < 0) {
      console.log('Failed to get the storage location of a_Position');
      return;
    }
    u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
    if (!u_FragColor) {
      console.log('Failed to get the storage location of u_FragColor');
      return;
    }
    u_Size = gl.getUniformLocation(gl.program, 'u_Size');
    if (!u_Size) {
      console.log('Failed to get the storage location of u_FragColor');
      return;
    }
}

function click(ev, check) { 
    let [x, y] = covertCoordiantesEventToGL(ev);
    let point = new Point();
    point.position = [x, y];
    point.color = selectedColor;
    point.size = selectedSize;
    //g_shapesList.push(point);
    socket.emit('push shape update', point);
    //renderAllShapes()
    
}

function covertCoordiantesEventToGL(ev) {
    var x = ev.clientX; // x coordinate of a mouse pointer
    var y = ev.clientY; // y coordinate of a mouse pointer
    var rect = ev.target.getBoundingClientRect();
  
    x = ((x - rect.left) - canvas.width / 2) / (canvas.width / 2);
    y = (canvas.height / 2 - (y - rect.top)) / (canvas.height / 2);
  
    return ([x, y]);
}

function renderAllShapes() { 
    gl.clear(gl.COLOR_BUFFER_BIT);
    var len = g_shapesList.length;
    for (var i = 0; i < len; i++) {
        g_shapesList[i].render();
    }
}

function updateBrushSize(option){
  switch(option){
    case "1":
      selectedSize = 5.0
      break;
    case "2":
      selectedSize = 10.0
      break;
    case "3":
      selectedSize = 20.0
      break;
  }
}

function updateBrushColor(rgb){
  selectedColor = [ rgb[0]/255,rgb[1]/255,rgb[2]/255,1.0]
}

function hexToRgb(hex) {
  hex = hex.replace('#', '');
  var bigint = parseInt(hex, 16);
  var r = (bigint >> 16) & 255;
  var g = (bigint >> 8) & 255;
  var b = bigint & 255;

  return [r,g,b];
}