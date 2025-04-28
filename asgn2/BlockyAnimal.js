// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program

var VSHADER_SOURCE = `
  attribute vec4 a_Position;
  uniform mat4 u_ModelMatrix;
  uniform mat4 u_GlobalRotateMatrix;
  void main() {
    gl_Position = u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
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
let u_ModelMatrix;
let u_GlobalRotateMatrix;

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

  gl.enable(gl.DEPTH_TEST);
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

  u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
  if (!u_ModelMatrix) {
    console.log('Failed to get the storage location of u_ModelMatrix');
    return;
  }

  u_GlobalRotateMatrix = gl.getUniformLocation(gl.program, 'u_GlobalRotateMatrix');
  if (!u_GlobalRotateMatrix) {
    console.log('Failed to get the storage location of u_GlobalRotateMatrix');
    return;
  }

  var identityM = new Matrix4();
  gl.uniformMatrix4fv(u_ModelMatrix, false, identityM.elements);

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
let g_globalAngle = 5.0;
let g_yellowAngle = 0.0;
let g_selectedType = POINT;

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

    document.getElementById("rotateSlider").addEventListener("mousemove", function() {
        g_globalAngle = this.value;
        renderAllShapes();
    })

    document.getElementById("yellowSlider").addEventListener("mousemove", function() {
      g_yellowAngle = this.value;
      renderAllShapes();
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
  //gl.clear(gl.COLOR_BUFFER_BIT);
  renderAllShapes();
  requestAnimationFrame(tick);
}

var g_startTime=performance.now()/1000.0;
var g_seconds=performance.now()/1000.0-g_startTime;

function tick() {
  //console.log(performance.now());
  g_seconds = performance.now()/1000.0-g_startTime;

  renderAllShapes();

  requestAnimationFrame(tick);
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
    // case 2:
    //   point = new Circle();
    //   point.segments = g_selectedSegment;
    //   break;
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

  var globalRotMat = new Matrix4().rotate(g_globalAngle, 0, 1, 0);
  gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements)
    // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.clear(gl.DEPTH_BUFFER_BIT);
  // var len = g_shapesList.length;
  // for(var i = 0; i < len; i++) {
  //   g_shapesList[i].render();
  // }

  //drawTriangle3D([-1.0,0.0,0.0,   -0.5,-1.0,0.0,  0.0,0.0,0.0]);
  
  var body = new Cube();
  body.color = [.5, .4, 0, 1.0];
  body.matrix.translate(-.3, -.3, -0.4)
  body.matrix.scale(.55, .5, .75)
  body.render();

  var left_leg = new Cube();
  left_leg.color = [.5, .4, 0, 1.0];
  left_leg.matrix.translate(-.3, -.25, -.3)
  left_leg.matrix.rotate(180+45*Math.sin(g_seconds), 1, 0, 0);
  var ll_m = new Matrix4(left_leg.matrix)
  left_leg.matrix.scale(0.2, .35, 0.2)
  left_leg.render();

  var left_foot = new Cube();
  left_foot.color = [0.3, 0.15, 0, 1.0];
  left_foot.matrix = ll_m
  left_foot.matrix.translate(0, .35,0);
  left_foot.matrix.scale(0.2, 0.1, 0.2);
  left_foot.render();

  // Right leg (mirror of left leg)
  var right_leg = new Cube();
  right_leg.color = [.5, .4, 0, 1.0];  // Same color as left leg
  right_leg.matrix.translate(.06, -.25, -.3);  // Positive x position (mirrored)
  right_leg.matrix.rotate(180+45*Math.sin(g_seconds), 1, 0, 0);  // Same rotation
  var rl_m = new Matrix4(right_leg.matrix);  // Save matrix for foot
  right_leg.matrix.scale(0.2, .35, 0.2);  // Same scale
  right_leg.render();

  // Right foot (mirror of left foot)
  var right_foot = new Cube();
  right_foot.color = [0.3, 0.15, 0, 1.0];  // Same color as left foot
  right_foot.matrix = rl_m;  // Use saved matrix
  right_foot.matrix.translate(0, .35, 0);  // Same offset
  right_foot.matrix.scale(0.2, 0.1, 0.2);  // Same scale
  right_foot.render();

  var left_back = new Cube();
  left_back.color = [.5, .4, 0, 1.0];
  left_back.matrix.translate(-.3, -.25, .35)
  left_back.matrix.rotate(180+45*Math.sin(g_seconds), 1, 0, 0);
  var ll_m = new Matrix4(left_back.matrix)
  left_back.matrix.scale(0.2, .35, 0.2)
  left_back.render();

  var left_backfoot = new Cube();
  left_backfoot.color = [0.3, 0.15, 0, 1.0];
  left_backfoot.matrix = ll_m
  left_backfoot.matrix.translate(0, .35,0);
  left_backfoot.matrix.scale(0.2, 0.1, 0.2);
  left_backfoot.render();

  // Right leg (mirror of left leg)
  var right_back = new Cube();
  right_back.color = [.5, .4, 0, 1.0];  // Same color as left leg
  right_back.matrix.translate(.06, -.25, .35);  // Positive x position (mirrored)
  right_back.matrix.rotate(180+45*Math.sin(g_seconds), 1, 0, 0);  // Same rotation
  var rl_m = new Matrix4(right_back.matrix);  // Save matrix for foot
  right_back.matrix.scale(0.2, .35, 0.2);  // Same scale
  right_back.render();

  // Right foot (mirror of left foot)
  var right_backfoot = new Cube();
  right_backfoot.color = [0.3, 0.15, 0, 1.0];  // Same color as left foot
  right_backfoot.matrix = rl_m;  // Use saved matrix
  right_backfoot.matrix.translate(0, .35, 0);  // Same offset
  right_backfoot.matrix.scale(0.2, 0.1, 0.2);  // Same scale
  right_backfoot.render();

  var neck = new Cube();
  neck.color = [.5, .4, 0, 1.0];
  neck.matrix.translate(-.15, 0, -.5)
  var n_m = new Matrix4(neck.matrix);
  neck.matrix.scale(0.2, 0.9, 0.3)
  neck.render();

  var head = new Cube();
  head.color = [.5, .4, 0, 1.0];
  head.matrix = n_m;
  head.matrix.rotate(340, 1, 0, 0)
  head.matrix.translate(0, 0.68, -0.1)
  head.matrix.scale(.2, .2, .4)
  head.render();
   
  var tail = new Cube();
  tail.color = [0.35, 0.22, 0, 1.0];
  tail.matrix.rotate(45, 1, 0,0)
  tail.matrix.translate(-.07, .35, .05)
  tail.matrix.scale(0.1, 0.3, 0.1)
  tail.render();




  var duration = performance.now() - start_time;
  sendTextToHTML(("ms: " + Math.floor(duration) + " | fps: " + Math.floor(10000/duration)), "numdot");

}

function sendTextToHTML(text, htmlID) {
    var element = document.getElementById(htmlID);
    if (!element) {
        console.log("Failed to fetch" + htmlID + "from DOM.\n");
        return;
    }
    element.innerHTML = text;
}