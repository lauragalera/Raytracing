/*Camera*/
class Camera {
    constructor(name,eye,center,fov){ //eye, center, up, front, right
        this.name = name;
        this.eye = eye;
        this.center = center;
        this.fov = fov;
        this.up = [0,1,0];
        this.front = vec3.sub(this.center,this.eye);
        this.front = vec3.normalize(this.front);
        this.right = vec3.cross(this.front,this.up);
        this.right = vec3.normalize(this.right);
    }

    moveX(inc){ //mou a la dreta i esquerra
        var vector = vec3.scale(this.right, inc);
        this.eye = vec3.add(this.eye,vector);
        this.center = vec3.add(this.center,vector);
    }

    moveZ(inc){ //mou endavant i enderrera
        var vector = vec3.scale(this.front,inc);
        this.eye = vec3.add(this.eye,vector);
        this.center = vec3.add(this.center,vector);
    }

    moveY(inc){ //mou amunt i avall
        var vector = vec3.scale(this.up,inc);
        this.eye = vec3.add(this.eye,vector);
        this.center = vec3.add(this.center,vector)
    }

    rotateH(tetha){
        var aux = vec4.fromValues(this.front[0],this.front[1],this.front[2],0);
        var matriu = mat4.create();
        matriu = mat4.rotate(matriu,matriu,glMatrix.toRadian(tetha),this.up);
        vec4.transformMat4(this.front,aux,matriu);
        this.front = vec3.normalize(this.front);
        this.center = vec3.add(this.eye,this.front);
        aux = vec4.fromValues(this.right[0],this.right[1],this.right[2],0);
        vec4.transformMat4(this.right,aux,matriu);
        this.right = vec3.normalize(this.right);
    }

    rotateV(tetha){
        var aux = vec4.fromValues(this.front[0],this.front[1],this.front[2],0);
        var matriu = mat4.create();
        matriu = mat4.rotate(matriu,matriu,glMatrix.toRadian(tetha),this.right);
        vec4.transformMat4(this.front,aux,matriu);
        this.front = vec3.normalize(this.front);
        this.center = vec3.add(this.eye,this.front);
        aux = vec4.fromValues(this.up[0],this.up[1],this.up[2],0);
        vec4.transformMat4(this.up,aux,matriu);
        this.up = vec3.normalize(this.up);
    }

    cameraMatrix(){ //Computa la matriu de la camera
        return mat4.lookAt(mat4.create(), this.eye,  this.center, this.up);
    }

    copyCamera(){ //fa una deep copy de la càmera
        var eye = {...this.eye};
        var center = {...this.center}
        return new Camera(this.name, eye,center,this.fov);
    }
}

/*llista cameras guardades*/
class Caretaker{
    constructor(listCameras){
        this.mementos = listCameras;
    }

    addMemento(camera){
        this.mementos.push(camera);
    }

    getMemento(index){
        var c = this.mementos[index];
        return c.copyCamera();
    }

    length(){
        return this.mementos.length;
    }
}