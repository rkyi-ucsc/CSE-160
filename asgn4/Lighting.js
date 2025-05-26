var VSHADER_SOURCE = `
  precision mediump float;
  attribute vec4 a_Position;
  attribute vec2 a_UV;
  attribute vec3 a_Normal;
  varying vec2 v_UV;
  varying vec3 v_Normal;
  varying vec4 v_VertPos;
  uniform mat4 u_ModelMatrix;
  uniform mat4 u_GlobalRotateMatrix;
  uniform mat4 u_ViewMatrix;
  uniform mat4 u_ProjectionMatrix;
  void main() { 
    gl_Position = u_ProjectionMatrix * u_ViewMatrix * u_GlobalRotateMatrix * u_ModelMatrix * a_Position; 
    v_UV = a_UV;
    v_Normal = a_Normal;
    v_VertPos = u_ModelMatrix * a_Position;
  }`

// Fragment shader program
var FSHADER_SOURCE = `
  precision mediump float;
  varying vec2 v_UV;
  varying vec3 v_Normal;
  uniform vec4 u_FragColor;
  uniform sampler2D u_Sampler0;
  uniform sampler2D u_Sampler1;
  uniform int u_whichTexture;
  uniform vec3 u_lightPos;
  uniform vec3 u_cameraPos;
  uniform bool u_lightOn;
  varying vec4 v_VertPos;
  void main() {
    if (u_whichTexture == -3) {
      gl_FragColor = vec4((v_Normal+1.0)/2.0, 1.0);

    } else if (u_whichTexture == -2) {
      gl_FragColor = u_FragColor;
    
    } else if (u_whichTexture == -1) {
      gl_FragColor = vec4(v_UV, 1.0, 1.0);

    } else if (u_whichTexture == 0) {
      gl_FragColor = texture2D(u_Sampler0, v_UV);

    } else if (u_whichTexture == 1) {
      gl_FragColor = texture2D(u_Sampler1, v_UV);
  
    } else {
      gl_FragColor = vec4(1,.2,.2,1);
    }
      
    vec3 lightVector = u_lightPos - vec3(v_VertPos);

    //vec3 lightVector = vec3(v_VertPos) - u_lightPos;
    float r=length(lightVector);

    // if (r<2.0) {
    //   gl_FragColor = vec4(1, 0, 0, 1);
    // } else if (r<4.0) {
    //   gl_FragColor = vec4(0, 1, 0, 1);
    // } else if (r<6.0) {
    //   gl_FragColor = vec4(1, 1, 0, 1);
    // }

    // float falloff = r * r / 13.0;
    // gl_FragColor = vec4(vec3(gl_FragColor)/falloff, 1);

    float specular = 0.0;

    vec3 L = normalize(lightVector);
    vec3 N = normalize(v_Normal);
    float nDotL = max(dot(N, L), 0.0);

    //Reflection
    vec3 R = reflect(L, N);

    //Eye
    vec3 E = normalize(u_cameraPos-vec3(v_VertPos));

    //Specular
    if (u_whichTexture == 0 || u_whichTexture == 1) {
      specular = pow(max(dot(E, R), 0.0), 5.0);
    }
    
    vec3 diffuse = vec3(gl_FragColor) * nDotL * 0.7;
    vec3 ambient = vec3(gl_FragColor) * 0.3;

    if (u_lightOn){
      gl_FragColor = vec4(vec3(specular)+diffuse+ambient, 1.0);
    }

}`
let g_AngleX = 0;
let g_camSlider = 0;
let g_AngleY = 0;
let g_normalsOn = false;

let removed_special_blocks_count = 0;

let canvas;
let gl;
let a_Position;
let a_UV;
let a_Normal;
let u_FragColor;
// let u_Size;
let u_ModelMatrix;
let u_ProjectionMatrix;
let u_ViewMatrix;
let u_GlobalRotateMatrix;
let u_Sampler0;
let u_Sampler1;
let u_whichTexture;
let u_lightPos;
let u_cameraPos;
let u_lightOn;
show_animal = false;

function setupWebGL() {
  canvas = document.getElementById('webgl');

  // Get the rendering context for WebGL
  //gl = getWebGLContext(canvas);
  gl = canvas.getContext("webgl", { preserveDrawingBuffer: true});

  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }

  gl.enable(gl.DEPTH_TEST);
}

function connectVariablesToGLSL() {
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

    a_UV = gl.getAttribLocation(gl.program, 'a_UV');
    if (a_UV < 0) {
      console.log('Failed to get the storage location of a_UV');
      return;
    }

    a_Normal = gl.getAttribLocation(gl.program, 'a_Normal');
    if (a_Normal < 0) {
      console.log('Failed to get the storage location of a_UV');
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

    u_ProjectionMatrix = gl.getUniformLocation(gl.program, 'u_ProjectionMatrix');
    if (!u_ProjectionMatrix) {
        console.log('Failed to get the storage location of u_ProjectionMatrix');
        return;
    }

    u_Sampler0 = gl.getUniformLocation(gl.program, 'u_Sampler0');
    if (!u_Sampler0) {
      console.log('Failed to get the storage location of u_Sampler0');
      return false;
    }

    u_Sampler1 = gl.getUniformLocation(gl.program, 'u_Sampler1');
    if (!u_Sampler1) {
      console.log('Failed to get the storage location of u_Sampler1');
      return false;
    }

  
    u_ViewMatrix = gl.getUniformLocation(gl.program, 'u_ViewMatrix');
    if (!u_ViewMatrix) {
        console.log('Failed to get the storage location of u_ViewMatrix');
        return;
    }

    u_whichTexture = gl.getUniformLocation(gl.program, 'u_whichTexture');
    if (!u_whichTexture) {
        console.log('Failed to get the storage location of u_whichTexture');
        return;
    }

    u_lightPos = gl.getUniformLocation(gl.program, 'u_lightPos');
    if (!u_whichTexture) {
        console.log('Failed to get the storage location of u_lightPos');
        return;
    }

    u_cameraPos = gl.getUniformLocation(gl.program, 'u_cameraPos');
    if (!u_whichTexture) {
        console.log('Failed to get the storage location of u_cameraPos');
        return;
    }

    u_lightOn = gl.getUniformLocation(gl.program, 'u_lightOn');
    if (!u_whichTexture) {
        console.log('Failed to get the storage location of u_lightOn');
        return;
    }

    // u_Size = gl.getUniformLocation(gl.program, 'u_Size');
    // if (!u_Size) {
    //   console.log('Failed to get the storage location of u_Size');
    //   return;
    // }

}
// onload command

// create variable to tell if textures are loaded

// force rerender until textures are ready

let g_selectedColor=[1.0, 1.0, 1.0, 1.0];
let g_selectedSize = 5;
let g_globalAngle = 0;
let g_frontUpLegAngle = 0;
let g_frontLowLegAngle = 0;
let g_backUpLegAngle = 0;
let g_backLowLegAngle = 0;
let g_neckAngle = 0;
let g_footAngle = 0;
let g_animation = false;
let special_animation = false;
let g_camera;
let g_camPos = false;
let g_camFlip = false;
let g_lightPos = [0, 1, -2];
let g_lightOn = true;
let isDragging = false;
var xyCoord = [0,0];

function addActionsForHtmlUI() {
  document.getElementById("normalOn").onclick = function(){g_normalsOn = true;};
  document.getElementById("normalOff").onclick = function(){g_normalsOn = false;};
  document.getElementById("cam1").onclick = function(){g_camPos = true;};
  document.getElementById("cam2").onclick = function(){g_camPos = false;};
  document.getElementById("camFlip").onclick = function(){g_camFlip = !g_camFlip;};

  document.getElementById("toggle").onclick = function(){g_lightOn = !g_lightOn;};


  document.getElementById("lightSlideX").addEventListener('mousemove', function(ev){if (ev.buttons == 1) {g_lightPos[0] = this.value/37; renderScene(); console.log(g_lightPos);}});
  document.getElementById("lightSlideY").addEventListener('mousemove', function(ev){if (ev.buttons == 1) {g_lightPos[1] = this.value/37; renderScene();console.log(g_lightPos);}});
  document.getElementById("lightSlideZ").addEventListener('mousemove', function(ev){if (ev.buttons == 1) {g_lightPos[2] = this.value/37; renderScene();console.log(g_lightPos);}});
}

// var modelViewMatrix = new Matrix4();
//  modelViewMatrix.setLookAt(0.20, 0.25, 0.25, 0, 0, 0, 0, 1, 0).rotate(-10, 0, 0, 1);
//  // Pass the model view matrix to the uniform variable
//  gl.uniformMatrix4fv(u_ModelViewMatrix, false, modelViewMatrix.elements);

function initTextures(gl, n) {

  // Get the storage location of u_Sampler0

  var image = new Image();  // Create the image object
  if (!image) {
    console.log('Failed to create the image object');
    return false;
  }
  // Register the event handler to be called on loading an image
  image.onload = function(){ sendTextureToTEXTURE0(image);};
  // Tell the browser to load an image

  image.src = 'resources/universe_resized.jpg';

  var image2 = new Image();  // Create the image object
  if (!image2) {
    console.log('Failed to create the image object');
    return false;
  }
  // Register the event handler to be called on loading an image
  image2.onload = function(){ sendTextureToTEXTURE1(image2);};
  // Tell the browser to load an image
  image2.src = 'resources/ice_resized.jpeg';

  }

// make sure to call renderScene() after the texture is loaded 

function sendTextureToTEXTURE0(image) {
  console.log("loading image 0");
  var texture = gl.createTexture();   // Create a texture object
  if (!texture) {
    console.log('Failed to create the texture object');
    return false;
  }
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); // Flip the image's y axis
  // Enable texture unit0
  gl.activeTexture(gl.TEXTURE0);
  // Bind the texture object to the target
  gl.bindTexture(gl.TEXTURE_2D, texture);

  // Set the texture parameters
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  // Set the texture image
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
  
  // Set the texture unit 0 to the sampler
  gl.uniform1i(u_Sampler0, 0);
  
  ///gl.clear(gl.COLOR_BUFFER_BIT);   // Clear <canvas>

  //gl.drawArrays(gl.TRIANGLE_STRIP, 0, n); // Draw the rectangle

}

function sendTextureToTEXTURE1(image2) {
  var texture = gl.createTexture();   // Create a texture object
  if (!texture) {
    console.log('Failed to create the texture object');
    return false;
  }
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); // Flip the image's y axis
  // Enable texture unit0
  gl.activeTexture(gl.TEXTURE1);
  // Bind the texture object to the target
  gl.bindTexture(gl.TEXTURE_2D, texture);

  // Set the texture parameters
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  // Set the texture image
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image2);
  
  // Set the texture unit 0 to the sampler
  gl.uniform1i(u_Sampler1, 1);
  
  ///gl.clear(gl.COLOR_BUFFER_BIT);   // Clear <canvas>

  //gl.drawArrays(gl.TRIANGLE_STRIP, 0, n); // Draw the rectangle
}

function main() {
  setupWebGL();
  connectVariablesToGLSL();
  addActionsForHtmlUI();

  // Retrieve <canvas> element
  g_camera = new Camera();
  document.onkeydown = keydown;

  initTextures(gl, 0);
  
  // Specify the color for clearing <canvas>
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  let lastMouseX = 0;
  let sensitivity = 0.2; // Adjust for smoother panning

  canvas.onmousedown = function(event) {
      isDragging = true;
      lastMouseX = event.clientX;
      click(event); // Preserve existing behavior
  };

  canvas.onmousemove = function(event) {
      if (event.buttons == 1) { 
          click(event, 1); // Preserve existing functionality
      } else {
          if (xyCoord[0] != 0) {
              xyCoord = [0, 0];
          }
      }

      // Handle camera panning when dragging
      if (isDragging) {
          let deltaX = event.clientX - lastMouseX;
          g_camera.pan(deltaX * sensitivity);
          lastMouseX = event.clientX;
          renderScene();
      }
  };

  canvas.onmouseup = function() {
      isDragging = false;
  };

  canvas.onmouseleave = function() {
      isDragging = false;
  };

  requestAnimationFrame(tick);
}

var g_startTime = performance.now()/1000.0;
var g_seconds = performance.now()/1000.0-g_startTime;

function tick() {
    g_seconds=performance.now()/1000.0-g_startTime;
    //console.log(performance.now());

    renderScene();
    updateLightPosition()
    requestAnimationFrame(tick);
}

let g_lightAngle = 0;
const radius = 5.0;  // Distance from the center (sphere)

function updateLightPosition() {
  g_lightAngle += 1; // degrees per frame
  const rad = g_lightAngle * Math.PI / 180;

  const x = radius * Math.cos(rad);
  const z = radius * Math.sin(rad);
  const y = g_lightPos[1];  // keep it constant, or animate up/down too

  // Update the cube’s position
  g_lightPos[0] = x
  g_lightPos[1] = y
  g_lightPos[2] = z
    // Or whatever function you use

  // Send to the shader
  gl.uniform3f(u_lightPos, x, y, z);
}

var g_shapesList = [];

function scroll(ev) {
  if (ev.deltaY > 0) {
      g_camera.forward(1);
  }
  else {
      g_camera.back(1);
  }
}

function click(ev, check) {
  if (isDragging) return; // Ignore clicks while dragging

  if (ev.shiftKey) {
      special_animation = true;
  }

  let [x, y] = convertCoordinatesEventToGL(ev);
  if (xyCoord[0] == 0) {
      xyCoord = [x, y];
  }
  g_AngleX += xyCoord[0] - x;
  g_AngleY += xyCoord[1] - y;
  if (Math.abs(g_AngleX / 360) > 1) {
      g_AngleX = 0;
  }
  if (Math.abs(g_AngleY / 360) > 1) {
      g_AngleY = 0;
  }
}

function getMapCoordinate(forward, range) {
  const x = Math.floor(g_camera.at.elements[0]+4); //+ range * forward.elements[0]);
  const y = Math.floor(g_camera.at.elements[2]+4); //+ range * forward.elements[2]);
  const z = Math.floor(g_camera.at.elements[1]); //+ range * forward.elements[1]);
  console.log("current position" + x + "," + y + "," + z);
  return {x, y, z};

}

function convertCoordinatesEventToGL(ev) {
  var x = ev.clientX; // x coordinate of a mouse pointer
  var y = ev.clientY; // y coordinate of a mouse pointer
  var rect = ev.target.getBoundingClientRect();

  x = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
  y = (canvas.height/2 - (y - rect.top))/(canvas.height/2);
  return([x, y]);
}

//var g_camera = new Camera();

var g_map= [[
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 7, 7, 7, 0, 0, 0, 0, 1],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 7, 8, 7, 0, 0, 0, 0, 1],
  [0, 0, 0, 0, 0, 0, 0, 7, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 7, 7, 7, 0, 0, 0, 0, 1],
  [0, 0, 0, 0, 0, 0, 7, 8, 7, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [0, 0, 0, 0, 0, 0, 0, 7, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 7, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 7, 8, 7, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 7, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 7, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 7, 8, 7, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 7, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 7, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 7, 8, 7, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 7, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],

  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 7, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 7, 8, 7, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 7, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 7, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 7, 8, 7, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 7, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 7, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 7, 8, 7, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 7, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 7, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 7, 8, 7, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 7, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 7, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 7, 8, 7, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 7, 0, 0, 0, 0, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
]
];


function drawMap() {
  for (z=0; z<1; z++) {
    for (x=0; x<32; x++) {
      for (y=0; y<32; y++) {
        if (g_map[z][x][y]==1) {
          var body = new Cube();
          body.color = [1.0, 1.0, 1.0, 1.0];
          if (show_animal == false) {
            body.textureNum = 5;
          }
          else {
            body.textureNum = 8;
          }
          body.matrix.translate(x-4, -.75, y-4);
          //body.renderfaster();
          body.renderfaster();
        }
        else if (g_map[z][x][y]==2) {
          // numbers from fjtria
          var body = new Cube();
          //body.color = [1.0, 1.0, 1.0, 1.0];
          if (show_animal == false) {
            body.textureNum = 5;
          }
          else {
            body.textureNum = 8;
          }
          body.matrix.translate(x-4, -.75, y-4);
          body.render();
          var b2 = new Cube();
          //body.color = [1.0, 1.0, 1.0, 1.0];
          if (show_animal == false) {
            b2.textureNum = 5;
          }
          else {
            b2.textureNum = 8;
          }
          b2.matrix.translate(x-4, 0.25, y-4);
          b2.render();        
        }
        else if (g_map[z][x][y]==3) {
          var body = new Cube();
          //body.color = [1.0, 1.0, 1.0, 1.0];
          if (show_animal == false) {
            body.textureNum = 5;
          }
          else {
            body.textureNum = 8;
          }
          body.matrix.translate(x-4, -.75, y-4);
          body.render();
          var b2 = new Cube();
          //body.color = [1.0, 1.0, 1.0, 1.0];
          if (show_animal == false) {
            b2.textureNum = 5;
          }
          else {
            b2.textureNum = 8;
          }
          b2.matrix.translate(x-4, 0.25, y-4);
          b2.render();  
          var b3 = new Cube();
          //body.color = [1.0, 1.0, 1.0, 1.0];
          if (show_animal == false) {
            b3.textureNum = 5;
          }
          else {
            b3.textureNum = 8;
          }
          b3.matrix.translate(x-4, 1.25, y-4);
          b3.render();      
        }
        else if (g_map[z][x][y]==8) {
          var body = new Cube();
          //body.color = [1.0, 1.0, 1.0, 1.0];
          body.textureNum = 3;
          body.matrix.translate(x-4, -.75, y-4);
          body.matrix.scale(0.3, 0.3, 0.3);
          body.render();

        }
        else if (g_map[z][x][y]==7 && show_animal == false) {
          var body = new Cube();
          //body.color = [1.0, 1.0, 1.0, 1.0];
          body.textureNum = 4;
          body.matrix.translate(x-4, -.75, y-4);
          //body.matrix.scale(0.3, 0.3, 0.3);
          body.render();

        }
      }
    }
}
}

function addCube() {
  //console.log(g_map[0][0]);
  const forward = g_camera.forwardVector();
  //console.log(g_map);
  for (let i = 2; i < 5; i++) {
    const square = getMapCoordinate(forward, i);
    console.log(square.x);
    console.log(square.y);
    if (square.x < 0 || square.x >= 32 || square.y < 0 ||  square.y >= 32) {
      console.log("bad location");
      return;
    }
    if (g_map[0][square.x][square.y] == 0) {
      g_map[0][square.x][square.y] = 1;

      console.log("eyes=" + g_camera.eye.elements[0] +  "," + g_camera.eye.elements[1] +  "," + g_camera.eye.elements[2]);
      console.log("at=" + g_camera.at.elements[0] +  "," + g_camera.at.elements[1] +  "," +g_camera.at.elements[2]);
      console.log("up=" + g_camera.up.elements[0] +  "," + g_camera.up.elements[1] +  "," +g_camera.up.elements[2]);
    
      renderScene();
      console.log("added new cube");
    }
    else if (g_map[0][square.x][square.y] == 1) {
      g_map[0][square.x][square.y] = 2;

      console.log("eyes=" + g_camera.eye.elements[0] +  "," + g_camera.eye.elements[1] +  "," + g_camera.eye.elements[2]);
      console.log("at=" + g_camera.at.elements[0] +  "," + g_camera.at.elements[1] +  "," +g_camera.at.elements[2]);
      console.log("up=" + g_camera.up.elements[0] +  "," + g_camera.up.elements[1] +  "," +g_camera.up.elements[2]);
    
      renderScene();
      console.log("removed cube");      
    }

    else if (g_map[0][square.x][square.y] == 2) {
      g_map[0][square.x][square.y] = 3;

      console.log("eyes=" + g_camera.eye.elements[0] +  "," + g_camera.eye.elements[1] +  "," + g_camera.eye.elements[2]);
      console.log("at=" + g_camera.at.elements[0] +  "," + g_camera.at.elements[1] +  "," +g_camera.at.elements[2]);
      console.log("up=" + g_camera.up.elements[0] +  "," + g_camera.up.elements[1] +  "," +g_camera.up.elements[2]);
    
      renderScene();
      console.log("removed cube");      
    }

  }
}

function removeCube() {
  //console.log(g_map[0][0]);
  const forward = g_camera.forwardVector();
  console.log(g_map);
  for (let i = 2; i < 5; i++) {
    const square = getMapCoordinate(forward, i);
    console.log(square.x);
    console.log(square.y);
    if (square.x < 0 || square.x >= 32 || square.y < 0 ||  square.y >= 32) {
      console.log("bad location");
      return;
    }
    if (g_map[0][square.x][square.y] == 1 || g_map[0][square.x][square.y] == 2 || g_map[0][square.x][square.y] == 3 || g_map[0][square.x][square.y] == 7) {
      if (g_map[0][square.x][square.y] == 7) {
        removed_special_blocks_count += 1;
        if (removed_special_blocks_count >= 7) {
          show_animal = true;
        }
      }
      
      g_map[0][square.x][square.y] = 0;


      console.log("eyes=" + g_camera.eye.elements[0] +  "," + g_camera.eye.elements[1] +  "," + g_camera.eye.elements[2]);
      console.log("at=" + g_camera.at.elements[0] +  "," + g_camera.at.elements[1] +  "," +g_camera.at.elements[2]);
      console.log("up=" + g_camera.up.elements[0] +  "," + g_camera.up.elements[1] +  "," +g_camera.up.elements[2]);
    
      renderScene();
      console.log("removed cube");      
    }
  }
}


function placeBlock() {
  let gridX = Math.floor(g_camera.eye.elements[0] / 32);
  let gridY = Math.floor(g_camera.eye.elements[2] / 32);

  console.log("gridX is" + gridX);
  console.log("gridY is" + gridY);

  let frontX = gridX + Math.round(g_camera.at.elements[0] - g_camera.eye.elements[0]);
  let frontY = gridY + Math.round(g_camera.at.elements[2] - g_camera.eye.elements[2]) + 100;

  console.log("frontX is" + frontX);
  console.log("frontY is" + frontY);

  console.log("eyes=" + g_camera.eye.elements[0] +  "," + g_camera.eye.elements[1] +  "," + g_camera.eye.elements[2]);
  console.log("at=" + g_camera.at.elements[0] +  "," + g_camera.at.elements[1] +  "," +g_camera.at.elements[2]);
  console.log("up=" + g_camera.up.elements[0] +  "," + g_camera.up.elements[1] +  "," +g_camera.up.elements[2]);

  if (g_map[frontY][frontX] == 0) {
      g_map[frontY][frontX] = 1;  // Place block
      console.log(`Block placed at (${frontX}, ${frontY})`);
      renderScene();  // Call a function to re-render the scene
  }
}



function keydown(ev) {
  if (ev.keyCode==68) {
    g_camera.eye.elements[0] += 0.2;
  } 
  else 
  if (ev.keyCode == 65) {
    // use WASD in assignment
    g_camera.eye.elements[0] -= 0.2;
  } 
  else if (ev.keyCode == 87) {
    g_camera.forward();
  } 

  else if (ev.keyCode == 83) {
    g_camera.back();
  }

  else if (ev.keyCode == 81) {
    g_camera.panLeft();
  }

  else if (ev.keyCode == 69) {
    g_camera.panRight();
  }

  else if (ev.keyCode == 67) {
    addCube();
  }

  else if (ev.keyCode == 88) {
    removeCube();
  }

  else if (ev.keyCode == 77) {
    show_animal = true;
  }

  
  console.log(ev.keyCode);
  console.log("eyes=" + g_camera.eye.elements[0] +  "," + g_camera.eye.elements[1] +  "," + g_camera.eye.elements[2]);
  console.log("at=" + g_camera.at.elements[0] +  "," + g_camera.at.elements[1] +  "," +g_camera.at.elements[2]);
  console.log("up=" + g_camera.up.elements[0] +  "," + g_camera.up.elements[1] +  "," +g_camera.up.elements[2]);
  renderScene();
  console.log("gmap is" + g_map);
}

// var g_eye = [0,0,3];
// var g_at = [0,0,-100];
// var g_up=[0,1,0];

function renderScene() {
  var currentStartTime = performance.now();

  var projMat = new Matrix4();
  projMat.setPerspective(90, canvas.width/canvas.height, .1, 200);
  gl.uniformMatrix4fv(u_ProjectionMatrix, false, projMat.elements);

  var viewMat = new Matrix4();
  viewMat.setLookAt(
    g_camera.eye.elements[0], g_camera.eye.elements[1], g_camera.eye.elements[2], 
    g_camera.at.elements[0], g_camera.at.elements[1], g_camera.at.elements[2], 
    g_camera.up.elements[0], g_camera.up.elements[1], g_camera.up.elements[2]);//]0,0,2, 0,0,0, 0,1,0); // eye, at, up
  gl.uniformMatrix4fv(u_ViewMatrix, false, viewMat.elements);
  
  var globalRotMat = new Matrix4().rotate(g_globalAngle, 0, 1, 0);
  //globalRotMat.rotate(g_camSlider, 0, 1, 0);
  //globalRotMat.rotate(g_AngleY, -1, 0, 0);
  gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);


    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Pass the light position to GLSL
    gl.uniform3f(u_lightPos, g_lightPos[0], g_lightPos[1], g_lightPos[2]);

    //gl.uniform3f(u_cameraPos, g_camera.eye.x, g_camera.eye.y, g_camera.eye.z);

    gl.uniform1i(u_lightOn, g_lightOn);
// Draw the light
    var light = new Sphere(); 
    light.color= [2,2,0,1];
    light.textureNum = -2;
    light.matrix.translate(g_lightPos[0], g_lightPos[1], g_lightPos[2]);
   //light.matrix.scale(0.1, 0.1, 0.1);
    //light.matrix.scale(1, 1, 1);
    light.matrix.scale(-.3, -.3, -.3);
    light.matrix.translate(-.5,-.5,-.5);
    light.render();

    //gl.clear(gl.COLOR_BUFFER_BIT);

    // var try1 = new Cube();
    // try1.color = [1.0, 0.3, 0.0, 1.0];
    // try1.render();
    // keep track of eye location to do collision dtection

    // var floor = new Cube();
    
    
    // // if (g_normalsOn) {
    // //   floor.textureNum= -3;
    // // } else {
    // //   floor.textureNum= 1;
    // // }
    // floor.textureNum= 1;
    // floor.color = [.8,.8,.8,1.0];
    // floor.matrix.translate(0, -.75, 0.0);
    // floor.matrix.scale(100, 1, 100);
    // floor.matrix.translate(-.5, 0, -0.5);
    // floor.render();


    var sky = new Cube();
    sky.color = [0.6, 0.8, 1.0, 1.0];
    if (g_normalsOn) {
      sky.textureNum = -3;
    } else {
      sky.textureNum = -2;
    }
   
    //sky.textureNum = 0;
    
    sky.matrix.scale(-15, -15, -15);
    //sky.matrix.scale(15, 15, 15);
    sky.matrix.translate(-.5, -.5, -0.5);
    
    sky.render();

    var ball = new Sphere();
    if (g_normalsOn) {
      ball.textureNum = -3;
    } else {
      ball.textureNum = 0;
    }
    ball.color = [1.0, 0, 0, 1.0];
    ball.matrix.translate(0, 0, 0);
    ball.matrix.translate(-.5, -.5, -0.5);
    ball.render();
    
    const pos1 = new Vector3([0.0, 1.0, 7.0]);
    const pos2 = new Vector3([0.0, 1.0, -7.0]);
    const pos3 = new Vector3([7.0, 7.0, 0.0]);
    const pos4 = new Vector3([-7.0, 7.0, 0.0]);

    if (g_camPos) {
      if (g_camFlip) {
        g_camera.eye = pos1;
      } else {
        g_camera.eye = pos2;
      }
    } else {
      if (g_camFlip) {
        g_camera.eye = pos3;
      } else {
        g_camera.eye = pos4;
      }
    }
  
    var duration = performance.now() - currentStartTime;
    sendTextToHTML(" ms: " + Math.floor(duration) + " fps: " + Math.floor(10000 / duration) / 10, "performance");
    }

    function sendTextToHTML(text, htmlID) {
    var htmlElm = document.getElementById(htmlID);
    if (!htmlElm) {
        console.log("Failed to get " + htmlID + " from HTML");
        return;
    }
    htmlElm.innerHTML = text;

  }


