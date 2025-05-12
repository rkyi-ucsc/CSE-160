class Pyramid {
    constructor(baseSize = 1.0, height = 1.0) {
        this.type = 'pyramid';
        this.color = [1.0, 1.0, 1.0, 1.0];
        this.matrix = new Matrix4();
        this.baseSize = baseSize;
        this.height = height;
    }

    render() {
        var rgba = this.color;
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);
        
        let b = this.baseSize / 2, h = this.height;
        
        // Base (square)
        drawTriangle3D_old([-b, 0, -b,   b, 0, -b,   b, 0, b]);
        drawTriangle3D_old([-b, 0, -b,   -b, 0, b,   b, 0, b]);
        
        // Sides (triangles)
        gl.uniform4f(u_FragColor, rgba[0] * 0.95, rgba[1] * 0.95, rgba[2] * 0.95, rgba[3]);
        drawTriangle3D_old([-b, 0, -b,   b, 0, -b,   0, h, 0]);
        
        gl.uniform4f(u_FragColor, rgba[0] * 0.90, rgba[1] * 0.9, rgba[2] * 0.9, rgba[3]);
        drawTriangle3D_old([b, 0, -b,   b, 0, b,   0, h, 0]);
        
        gl.uniform4f(u_FragColor, rgba[0] * 0.85, rgba[1] * 0.85, rgba[2] * 0.85, rgba[3]);
        drawTriangle3D_old([b, 0, b,   -b, 0, b,   0, h, 0]);
        
        gl.uniform4f(u_FragColor, rgba[0] * 0.80, rgba[1] * 0.80, rgba[2] * 0.80, rgba[3]);
        drawTriangle3D_old([-b, 0, b,   -b, 0, -b,   0, h, 0]);
    }
}
