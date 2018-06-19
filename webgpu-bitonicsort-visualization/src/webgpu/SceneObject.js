import { mat4, vec3 } from 'gl-matrix';
var SceneObject = /** @class */ (function () {
    function SceneObject() {
        this._mMatrix = mat4.identity(mat4.create());
        this._translateVec = vec3.create();
        this._scaleVec = vec3.create();
        this.x = 0.0;
        this.y = 0.0;
        this.z = 0.0;
        this.scaleX = 1.0;
        this.scaleY = 1.0;
        this.scaleZ = 1.0;
        this.rotationX = 0.0;
        this.rotationY = 0.0;
        this.rotationZ = 0.0;
    }
    Object.defineProperty(SceneObject.prototype, "vertexUniform", {
        get: function () {
            return this._vertexUniform;
        },
        set: function (value) {
            this._vertexUniform = value;
        },
        enumerable: true,
        configurable: true
    });
    SceneObject.prototype.getModelMtx = function () {
        mat4.identity(this._mMatrix);
        vec3.set(this._translateVec, this.x, this.y, this.z);
        mat4.translate(this._mMatrix, this._mMatrix, this._translateVec);
        mat4.rotateZ(this._mMatrix, this._mMatrix, this.rotationZ);
        mat4.rotateY(this._mMatrix, this._mMatrix, this.rotationY);
        mat4.rotateX(this._mMatrix, this._mMatrix, this.rotationX);
        vec3.set(this._scaleVec, this.scaleX, this.scaleY, this.scaleZ);
        mat4.scale(this._mMatrix, this._mMatrix, this._scaleVec);
        return this._mMatrix;
    };
    return SceneObject;
}());
export { SceneObject };
