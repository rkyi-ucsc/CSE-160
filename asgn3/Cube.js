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
  
      drawTriangle3DUV([0, 0, 0, 1, 1, 0, 1, 0, 0], [0, 0, 1, 1, 1, 0]);
      drawTriangle3DUV([0, 0, 0, 0, 1, 0, 1, 1, 0], [0, 0, 0, 1, 1, 1]);
  
      drawTriangle3DUV([0, 1, 0, 1, 1, 1, 1, 1, 0], [0, 0, 1, 1, 1, 0]);
      drawTriangle3DUV([0, 1, 0, 0, 1, 1, 1, 1, 1], [0, 0, 0, 1, 1, 1]);
  
      drawTriangle3DUV([0, 0, 0, 1, 0, 1, 0, 0, 1], [0, 0, 1, 1, 1, 0]);
      drawTriangle3DUV([0, 0, 0, 1, 0, 0, 1, 0, 1], [0, 0, 0, 1, 1, 1]);
  
      drawTriangle3DUV([1, 0, 0, 1, 1, 1, 1, 1, 0], [0, 0, 1, 1, 1, 0]);
      drawTriangle3DUV([1, 0, 0, 1, 0, 1, 1, 1, 1], [0, 0, 0, 1, 1, 1]);
  
      drawTriangle3DUV([0, 0, 0, 0, 1, 1, 0, 1, 0], [0, 0, 1, 1, 1, 0]);
      drawTriangle3DUV([0, 0, 0, 0, 0, 1, 0, 1, 1], [0, 0, 0, 1, 1, 1]);
  
      drawTriangle3DUV([0, 0, 1, 1, 1, 1, 0, 1, 1], [0, 0, 1, 1, 1, 0]);
      drawTriangle3DUV([0, 0, 1, 1, 0, 1, 1, 1, 1], [0, 0, 0, 1, 1, 1]);
  }

  renderfaster() {
      var rgba = this.color;
  
      gl.uniform1i(u_whichTexture, this.textureNum);
      gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
      gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);
  
      drawTriangle3DUV(this.verts, this.uvVerts);
  }  

}