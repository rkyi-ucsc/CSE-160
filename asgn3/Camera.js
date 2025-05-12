class Camera {
    constructor() {
        this.eye = new Vector3([0.25, 1.25, -5.0]); // [0.25, 1.75, -5.0]) seems to work well
        this.at = new Vector3([0.0, 1.2, 0.0]);
        this.up = new Vector3([0.0, 1.0, 0.0]);
        this.speed = 0.2;

        this.isDragging = false;
        this.lastMouseX = 0;
        this.sensitivity = 0.5; 
    }

    pan(delta) {
        console.log("Panning:", delta);
        var f = new Vector3();
        f.set(this.at);
        f.sub(this.eye);
        let rotationMatrix = new Matrix4();
        rotationMatrix.setIdentity();
        rotationMatrix.setRotate(delta * this.sensitivity, this.up.elements[0], this.up.elements[1], this.up.elements[2]);
        let d3D = rotationMatrix.multiplyVector3(f);
        this.at = d3D.add(this.eye);
    }
    

    forward(move = 0) {
        var f = new Vector3;
        f.set(this.at);
        f.sub(this.eye);
        f.normalize();
        f.mul(this.speed + move);
        this.eye.add(f);
        this.at.add(f);
    }

    //from tutor 
    forwardVector() {
        const f = new Vector3(this.at.elements);
        f.sub(this.eye);
        f.normalize();
        return f;
    }

    back(move = 0) {
        var f = new Vector3;
        f.set(this.eye);
        f.sub(this.at);
        f.normalize();
        f.mul(this.speed + move);
        this.at.add(f);
        this.eye.add(f);
    }

    left() {
        var f = new Vector3;
        f.set(this.at);
        f.sub(this.eye); 
        f.normalize();
        var s = Vector3.cross(this.up, f); 
        s.normalize(); 
        s.mul(this.speed); 
        this.eye.add(s);
        this.at.add(s);
    }

    right() {
        var f = new Vector3;
        f.set(this.eye);
        f.sub(this.at); 
        f.normalize();
        var s = Vector3.cross(this.up, f); 
        s.normalize();
        s.mul(this.speed); 
        this.eye.add(s);
        this.at.add(s);
    }

    panLeft() {
        var f = new Vector3;
        f.set(this.at);
        f.sub(this.eye);
        let rotationMatrix = new Matrix4();
        rotationMatrix.setIdentity();
        rotationMatrix.setRotate(1, this.up.elements[0], this.up.elements[1], this.up.elements[2]);
        let d3D = rotationMatrix.multiplyVector3(f);
        this.at = d3D.add(this.eye);
    }

    panRight() {
        var f = new Vector3;
        f.set(this.at);
        f.sub(this.eye);
        let rotationMatrix = new Matrix4();
        rotationMatrix.setIdentity();
        rotationMatrix.setRotate(-1, this.up.elements[0], this.up.elements[1], this.up.elements[2]);
        let d3D = rotationMatrix.multiplyVector3(f);
        this.at = d3D.add(this.eye);
    }
}
