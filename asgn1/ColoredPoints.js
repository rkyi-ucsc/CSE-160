// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program

var VSHADER_SOURCE = `
  attribute vec4 a_Position;
  uniform float u_Size;
  void main() {
    gl_Position = a_Position;
    //gl_PointSize = 10.0;
    gl_PointSize = u_Size;
  }`

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
let a_Position;
let u_FragColor;
let u_Size;

function setupWebGL() {
    // Retrieve <canvas> element
  canvas = document.getElementById('webgl');

  // Get the rendering context for WebGL
  //gl = getWebGLContext(canvas);
  gl = canvas.getContext("webgl", {preserveDrawingBuffer: true})
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }
}

function connectVariablesToGLSL(){
    // Initialize shaders
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.');
    return;
  }

  // // Get the storage location of a_Position
  a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return;
  }

  // Get the storage location of u_FragColor
  u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
  if (!u_FragColor) {
    console.log('Failed to get the storage location of u_FragColor');
    return;
  }

  u_Size = gl.getUniformLocation(gl.program, 'u_Size');
  if (!u_Size) {
    console.log('Failed to get the storage location of u_Size');
    return;
  }
}

const kirby = [
  new Circle([-0.01, -0.04], [1, 0.79, 0.87, 1], 100, 6),
  new Circle([-0.01, -0.04], [1, 0.79, 0.87, 1], 100, 6),
  new Triangle([0.48, -0.04], [1, 0.79, 0.87, 1], 37),
  new Triangle([-0.64, -0.02], [1, 0.79, 0.87, 1], 37),
  new Triangle([-0.245, -0.645], [1, 0.25, 0.29, 1], 57),
  new Triangle([0.23, -0.65], [1, 0.25, 0.29, 1], 57),
  new Circle([-0.23, 0.015], [0, 0, 0, 1], 22, 6),
  new Circle([0.175, -0.005], [0, 0, 0, 1], 22, 6),
  new Triangle([-0.28, -0.085], [0.22, 0.18, 1, 1], 22),
  new Triangle([0.115, -0.1], [0.22, 0.18, 1, 1], 22),
];



const POINT = 0;
const TRIANGLE = 1;
const CIRCLE = 2;

let g_selectedColor = [1.0, 1.0, 1.0, 1.0];
let g_selectedSize = 10.0;
let g_selectedType = POINT;
let g_selectedSegment = 10;

function addActionsForHtmlUI() {
    document.getElementById("red").onclick = function() { g_selectedColor = [1.0, 0, 0, 1.0]};
    document.getElementById("green").onclick = function() { g_selectedColor = [0, 1.0, 0, 1.0]};
    document.getElementById("blue").onclick = function() { g_selectedColor = [0, 0, 1.0, 1.0]};
    document.getElementById("paint").onclick = function() {g_shapesList = kirby.slice(); 
      console.log(g_shapesList);
      renderAllShapes();};
    document.getElementById("clear").onclick = function() {g_shapesList = []; renderAllShapes();};
    document.getElementById("point").onclick = function() {g_selectedType = POINT}
    document.getElementById("triangle").onclick = function() {g_selectedType = TRIANGLE}
    document.getElementById("circle").onclick = function() {g_selectedType = CIRCLE}

    const redSlider = document.getElementById("redSlider");
    const greenSlider = document.getElementById("greenSlider");
    const blueSlider = document.getElementById("blueSlider");

    [redSlider, greenSlider, blueSlider].forEach( slider => {
        slider.addEventListener("input", function() {
          g_selectedColor = [
            redSlider.value / 100,
            greenSlider.value / 100,
            blueSlider.value / 100,
            1.0
          ];
        });
      });

    document.getElementById("sizeSlider").addEventListener("mouseup", function() {
        g_selectedSize = this.value;
    })

    document.getElementById("segSlider").addEventListener("mouseup", function() {
      g_selectedSegment = this.value;
  })
}

function main() {
  
  setupWebGL();
  connectVariablesToGLSL();

  addActionsForHtmlUI();
    

  // Register function (event handler) to be called on a mouse press
  canvas.onmousedown = click;
  canvas.onmousemove = function(ev) { if (ev.buttons == 1){click(ev)}};

  // Specify the color for clearing <canvas>
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT);
}

var g_shapesList = [];

// var g_points = [];  // The array for the position of a mouse press
// var g_colors = [];  // The array to store the color of a point
// var g_sizes  = [];


function click(ev) {
  let [x, y] = convertCoordinatesEventToGL(ev);

  let point;
  switch(g_selectedType) {
    case 0: {
      point = new Point();
      break;
    }
    case 1: {
      point = new Triangle();
      break;
    }
    case 2:
      point = new Circle();
      point.segments = g_selectedSegment;
      break;
  }
    
  point.position=[x, y];
  point.color=g_selectedColor.slice()
  point.size=g_selectedSize;
  g_shapesList.push(point);
  console.log(g_shapesList);

//   // Store the coordinates to g_points array
//   g_points.push([x, y]);
//   // Store the coordinates to g_points array
  
//   g_colors.push(g_selectedColor.slice());  // Red

//   g_sizes.push(g_selectedSize);

  renderAllShapes();
}

function convertCoordinatesEventToGL(ev){
  var x = ev.clientX; // x coordinate of a mouse pointer
  var y = ev.clientY; // y coordinate of a mouse pointer
  var rect = ev.target.getBoundingClientRect();

  x = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
  y = (canvas.height/2 - (y - rect.top))/(canvas.height/2);

  return ([x, y]);
}

function renderAllShapes(){

    var start_time = performance.now();
    // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT);

  var len = g_shapesList.length;
  for(var i = 0; i < len; i++) {
    g_shapesList[i].render();
  }

  var duration = performance.now() - start_time;
  sendTextToHTML(("numdot: " + len + " | ms: " + Math.floor(duration) + " | fps: " + Math.floor(10000/duration)), "numdot");

}

function sendTextToHTML(text, htmlID) {
    var element = document.getElementById(htmlID);
    if (!element) {
        console.log("Failed to fetch" + htmlID + "from DOM.\n");
        return;
    }
    element.innerHTML = text;
}