class Cube {
  constructor() {
      this.type = 'cube';
      this.color = [1.0, 1.0, 1.0, 1.0];
      this.matrix = new Matrix4();
      this.textureNum = -1;
      this.verts = [
          // front
          0, 0, 0, 1, 1, 0, 1, 0, 0,
          0, 0, 0, 0, 1, 0, 1, 1, 0,
          // top
          0, 1, 0, 0, 1, 1, 1, 1, 1,
          0, 1, 0, 1, 1, 1, 1, 1, 0,
          // bottom
          0, 1, 0, 0, 1, 1, 1, 1, 1,
          0, 1, 0, 1, 1, 1, 1, 1, 0,
          // left
          1, 0, 0, 1, 1, 1, 1, 1, 0,
          1, 0, 0, 1, 0, 1, 1, 1, 1,
          // right 
          0, 0, 0, 0, 1, 1, 0, 1, 0,
          0, 0, 0, 0, 0, 1, 0, 1, 1,
          // back
          0, 0, 1, 1, 1, 1, 0, 1, 1,
          0, 0, 1, 1, 0, 1, 1, 1, 1
      ];
      this.uvVerts = [
          0, 0, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1,
          0, 0, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1,
          0, 0, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1,
          0, 0, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1,
          0, 0, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1,
          0, 0, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1
      ];
  }

  render() {
      var rgba = this.color;
  
      gl.uniform1i(u_whichTexture, this.textureNum);
  
      gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
      gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

      // front of cube
      drawTriangle3DUVNormal(
        [0, 0, 0, 1, 1, 0, 1, 0, 0],
        [0, 0, 1, 1, 1, 0],
        [0,0,-1, 0,0,-1, 0,0,-1]
    );
      drawTriangle3DUVNormal(
        [0, 0, 0, 0, 1, 0, 1, 1, 0],
        [0, 0, 0, 1, 1, 1],
        [0,0,-1, 0,0,-1, 0,0,-1]
    );

    let colorMod = 0.9
    //gl.uniform4f(u_FragColor, rgba[0]*colorMod, rgba[1]*colorMod, rgba[2]*colorMod, rgba[3]);
  
    //top of cube
      drawTriangle3DUVNormal(
        [0, 1, 0, 1, 1, 1, 1, 1, 0],
        [0, 0, 1, 1, 1, 0],
        [0,1,0, 0,1,0, 0,1,0]
    );
      drawTriangle3DUVNormal(
        [0, 1, 0, 0, 1, 1, 1, 1, 1],
        [0, 0, 0, 1, 1, 1],
        [0,1,0, 0,1,0, 0,1,0]
    );

    colorMod = 0.8;
    //gl.uniform4f(u_FragColor, rgba[0]*colorMod, rgba[1]*colorMod, rgba[2]*colorMod, rgba[3]);
  
    // right of cube
      drawTriangle3DUVNormal(
        [0, 0, 0, 1, 0, 1, 0, 0, 1],
        [0, 0, 1, 1, 1, 0],
        [1,0,0, 1,0,0, 1,0,0]
    );
      drawTriangle3DUVNormal(
        [0, 0, 0, 1, 0, 0, 1, 0, 1], 
        [0, 0, 0, 1, 1, 1],
        [1,0,0, 1,0,0, 1,0,0]
    );
    colorMod = 0.7;
    //gl.uniform4f(u_FragColor, rgba[0]*colorMod, rgba[1]*colorMod, rgba[2]*colorMod, rgba[3]);


    //left of cube
    drawTriangle3DUVNormal(
        [1, 0, 0, 1, 1, 1, 1, 1, 0], 
        [0, 0, 1, 1, 1, 0],
        [-1,0,0, -1,0,0, -1,0,0]
    );
      drawTriangle3DUVNormal(
        [1, 0, 0, 1, 0, 1, 1, 1, 1], 
        [0, 0, 0, 1, 1, 1],
        [-1,0,0, -1,0,0, -1,0,0]
    );
    colorMod = 0.6;
    //gl.uniform4f(u_FragColor, rgba[0]*colorMod, rgba[1]*colorMod, rgba[2]*colorMod, rgba[3]);
  
    // bottom of cube
      drawTriangle3DUVNormal(
        [0, 0, 0, 0, 1, 1, 0, 1, 0], 
        [0, 0, 1, 1, 1, 0],
        [0,-1,0, 0,-1,0, 0,-1,0]
    );
      drawTriangle3DUVNormal(
        [0, 0, 0, 0, 0, 1, 0, 1, 1], 
        [0, 0, 0, 1, 1, 1],
        [0,-1,0, 0,-1,0, 0,-1,0]
    );
    colorMod = 0.5;
    //gl.uniform4f(u_FragColor, rgba[0]*colorMod, rgba[1]*colorMod, rgba[2]*colorMod, rgba[3]);
    
    // back of cube
      drawTriangle3DUVNormal(
        [0, 0, 1, 1, 1, 1, 0, 1, 1], 
        [0, 0, 1, 1, 1, 0],
        [0,0,1, 0,0,1, 0,0,1]
    );
      drawTriangle3DUVNormal(
        [0, 0, 1, 1, 0, 1, 1, 1, 1], 
        [0, 0, 0, 1, 1, 1],
        [0,0,1, 0,0,1, 0,0,1]
    );
    colorMod = 0.4;
    //gl.uniform4f(u_FragColor, rgba[0]*colorMod, rgba[1]*colorMod, rgba[2]*colorMod, rgba[3]);
  
    //   drawTriangle3DUV([0, 0, 0, 1, 1, 0, 1, 0, 0], [0, 0, 1, 1, 1, 0]);
    //   drawTriangle3DUV([0, 0, 0, 0, 1, 0, 1, 1, 0], [0, 0, 0, 1, 1, 1]);
  
    //   drawTriangle3DUV([0, 1, 0, 1, 1, 1, 1, 1, 0], [0, 0, 1, 1, 1, 0]);
    //   drawTriangle3DUV([0, 1, 0, 0, 1, 1, 1, 1, 1], [0, 0, 0, 1, 1, 1]);
  
    //   drawTriangle3DUV([0, 0, 0, 1, 0, 1, 0, 0, 1], [0, 0, 1, 1, 1, 0]);
    //   drawTriangle3DUV([0, 0, 0, 1, 0, 0, 1, 0, 1], [0, 0, 0, 1, 1, 1]);
  
    //   drawTriangle3DUV([1, 0, 0, 1, 1, 1, 1, 1, 0], [0, 0, 1, 1, 1, 0]);
    //   drawTriangle3DUV([1, 0, 0, 1, 0, 1, 1, 1, 1], [0, 0, 0, 1, 1, 1]);
  
    //   drawTriangle3DUV([0, 0, 0, 0, 1, 1, 0, 1, 0], [0, 0, 1, 1, 1, 0]);
    //   drawTriangle3DUV([0, 0, 0, 0, 0, 1, 0, 1, 1], [0, 0, 0, 1, 1, 1]);
  
    //   drawTriangle3DUV([0, 0, 1, 1, 1, 1, 0, 1, 1], [0, 0, 1, 1, 1, 0]);
    //   drawTriangle3DUV([0, 0, 1, 1, 0, 1, 1, 1, 1], [0, 0, 0, 1, 1, 1]);
  }

  renderfaster() {
      var rgba = this.color;
  
      gl.uniform1i(u_whichTexture, this.textureNum);
      gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
      gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);
  
      drawTriangle3DUV(this.verts, this.uvVerts);
  }  

}