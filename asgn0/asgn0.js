// DrawRectangle.js
function drawVector(v, color="red") {
  var canvas = document.getElementById('example');
    if (!canvas) {
      console.log('Failed to retrieve the <canvas> element');
      return;
    }
  
    // Get the rendering context for 2DCG
    var ctx = canvas.getContext('2d');
    ctx.save();

    ctx.translate(canvas.width / 2, canvas.height / 2);

    ctx.strokeStyle = color;
    
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(v.elements[0]* 20, v.elements[1] * -20);
    ctx.stroke();
    ctx.restore();
};

function clearCanvas(){
  var canvas = document.getElementById('example');
  if (!canvas) {
    console.log('Failed to retrieve the <canvas> element');
    return;
  }

  // Get the rendering context for 2DCG
  var ctx = canvas.getContext('2d');

  //ctx.translate(-canvas.width / 2, -canvas.height / 2);
  
  // clear canvas
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, 400, 400);
  //console.log('canvas cleared')
}

function handleDrawEvent() {

  clearCanvas();
  

  var x1 = parseFloat(document.getElementById('x1').value);
  var y1 = parseFloat(document.getElementById('y1').value);
  var x2 = parseFloat(document.getElementById('x2').value);
  var y2 = parseFloat(document.getElementById('y2').value);
  // console.log(x1, y1);
  // console.log(x2, y2);

  var v1 = new Vector3([x1, y1, 0]);
  var v2 = new Vector3([x2, y2, 0]);
  drawVector(v1, "red");
  drawVector(v2, "blue");

  var v6 = new Vector3([-87, 22, 66.45623])
  v6.normalize();
  v6.print();
}

function angleBetween(v1, v2) {
  var dot_prod = Vector3.dot(v1, v2);
  var m1 = v1.magnitude();
  var m2 = v2.magnitude();
 
  console.log(Math.acos(dot_prod/(m1 * m2)) * (180/ Math.PI));
 }

 function areaTriangle(v1, v2) {
  var v3 = Vector3.cross(v1, v2);
  var m3 = v3.magnitude();

  console.log(m3 * 0.5)
 }

function handleDrawOperationEvent(){
  clearCanvas()

  var op = document.getElementById('ops').value

  var scalar = parseFloat(document.getElementById('scalar').value);

  var x1 = parseFloat(document.getElementById('x1').value);
  var y1 = parseFloat(document.getElementById('y1').value);
  var x2 = parseFloat(document.getElementById('x2').value);
  var y2 = parseFloat(document.getElementById('y2').value);
  // console.log(x1, y1);
  // console.log(x2, y2);

  var v1 = new Vector3([x1, y1, 0]);
  var v2 = new Vector3([x2, y2, 0]);
  var v3 = new Vector3([x1, y1, 0]);
  //console.log(v3.elements[0])

  drawVector(v1, "red");
  drawVector(v2, "blue");

  switch(op){
    case "add": {
      //console.log("add");
      v3.add(v2);
      drawVector(v3, "lime");
      break;
    }
    case "sub": {
      //console.log("sub");
      v3.sub(v2);
      drawVector(v3, "lime");
      break;
    }
    case "div": {
      //console.log("div");
      v1.div(scalar);
      v2.div(scalar);
      drawVector(v1, "lime");
      drawVector(v2, "lime");
      break;
    }
    case "mul": {
      //console.log("mul");
      v1.mul(scalar);
      v2.mul(scalar);
      drawVector(v1, "lime");
      drawVector(v2, "lime");
      break;
    }
    case "mag": {
      console.log("Magnitude V1:", v1.magnitude());
      console.log("Magnitude V2:", v2.magnitude());
      break;
    }
    case "norm": {
      console.log("Normalized V1:", v1.normalize().elements);
      console.log("Normalized V2:", v2.normalize().elements);
      break;
    }
    case "ab": {
      angleBetween(v1, v2);
      break;
    }
    case "area": {
      areaTriangle(v1, v2);
      break;
    }
  }
}


function main() {
    // Retrieve <canvas> element
    var canvas = document.getElementById('example');
    if (!canvas) {
      console.log('Failed to retrieve the <canvas> element');
      return;
    }
  
    // Get the rendering context for 2DCG
    var ctx = canvas.getContext('2d');
  
    // Draw a blue rectangle
    ctx.fillStyle = 'rgba(0, 0, 255, 1.0)'; // Set a blue color
    ctx.fillRect(120, 10, 150, 150); // Fill a rectangle with the color

    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, 400, 400);

    var v1 = new Vector3([2.25, 2.25, 0])

    drawVector(v1, "red");
  }
  