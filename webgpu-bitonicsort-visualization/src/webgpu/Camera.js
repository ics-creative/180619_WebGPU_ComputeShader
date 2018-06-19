import { mat4, vec3 } from 'gl-matrix';
var Camera = /** @class */ (function () {
    function Camera(fov, aspect, zNear, zFar) {
        //
        this._cameraUP = vec3.fromValues(0.0, 1.0, 0.0);
        //
        this._projectionMtx = mat4.identity(mat4.create());
        this._cameraMtx = mat4.identity(mat4.create());
        this._lookMtx = mat4.identity(mat4.create());
        //
        this.x = 0.0;
        this.y = 0.0;
        this.z = 0.0;
        mat4.perspective(this._projectionMtx, fov, aspect, zNear, zFar);
    }
    Camera.prototype.getCameraMtx = function () {
        return this._cameraMtx;
    };
    Camera.prototype.lookAt = function (point) {
        mat4.identity(this._lookMtx);
        mat4.lookAt(this._lookMtx, vec3.fromValues(this.x, this.y, this.z), point, this._cameraUP);
        mat4.multiply(this._cameraMtx, this._projectionMtx, this._lookMtx);
    };
    Camera.DIRECTION = vec3.fromValues(0.0, 0.0, 1.0);
    return Camera;
}());
export { Camera };
