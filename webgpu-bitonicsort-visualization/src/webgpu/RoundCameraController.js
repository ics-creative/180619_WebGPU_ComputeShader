import { vec3 } from 'gl-matrix';
import KeyboardEventName from './enum/events/KeyboardEventName';
import MouseEventName from './enum/events/MouseEventName';
import GestureEventName from './enum/events/GestureEventName';
import TouchEventName from './enum/events/TouchEventName';
import KeyCode from './enum/ui/KeyCode';
var RoundCameraController = /** @class */ (function () {
    function RoundCameraController(camera, stage) {
        // parameter
        this.radiusMin = 1.0;
        this.radiusOffset = 0.1;
        this.gestureRadiusFactor = 20.0;
        // camera
        this.radius = 2.0;
        this._theta = 0.0;
        this._oldX = 0.0;
        this._phi = 90.0;
        this._oldY = 0.0;
        this._currentTheta = 0.0;
        this._currentPhi = 90.0;
        this._camera = camera;
        this._stage = stage;
        this._target = vec3.fromValues(0.0, 0.0, 0.0);
        this.enable();
        this._updateCamera();
    }
    RoundCameraController.prototype.enable = function () {
        var _this = this;
        document.addEventListener(KeyboardEventName.KEY_DOWN, function (event) {
            _this._keyHandler(event);
        });
        document.addEventListener(MouseEventName.MOUSE_UP, function (event) {
            _this._upHandler(event);
        });
        this._stage.addEventListener(MouseEventName.MOUSE_DOWN, function (event) {
            _this._downHandler(event);
        });
        this._stage.addEventListener(MouseEventName.MOUSE_MOVE, function (event) {
            _this._moveHandler(event);
        });
        this._stage.addEventListener(MouseEventName.MOUSE_WHEEL, function (event) {
            _this._wheelHandler(event);
        });
        this._stage.addEventListener(MouseEventName.DOM_MOUSE_SCROLL, function (event) {
            _this._domMouseScrollHandler(event);
        });
        // touch
        if ('ontouchstart' in window) {
            this._stage.addEventListener(TouchEventName.TOUCH_START, function (event) {
                _this._touchStartHandler(event);
            });
            this._stage.addEventListener(TouchEventName.TOUCH_MOVE, function (event) {
                _this._touchMoveHandler(event);
            });
            document.addEventListener(TouchEventName.TOUCH_END, function (event) {
                _this._touchEndHandler(event);
            });
        }
        if ('ongesturestart' in window || 'GestureEvent' in window) {
            this._stage.addEventListener(GestureEventName.GESTURE_START, function (event) {
                _this._gestureStartHandler(event);
            });
            this._stage.addEventListener(GestureEventName.GESTURE_CHANGE, function (event) {
                _this._gestureChangeHandler(event);
            });
            document.addEventListener(GestureEventName.GESTURE_END, function (event) {
                _this._gestureEndHandler(event);
            });
        }
    };
    RoundCameraController.prototype._keyHandler = function (event) {
        switch (event.keyCode) {
            case KeyCode.UP:
                this.radius -= this.radiusOffset;
                if (this.radius < this.radiusMin) {
                    this.radius = this.radiusMin;
                }
                break;
            case KeyCode.DOWN:
                this.radius += this.radiusOffset;
                break;
            default:
                break;
        }
    };
    RoundCameraController.prototype._upHandler = function (event) {
        this.isMouseDown = false;
    };
    RoundCameraController.prototype._downHandler = function (event) {
        this.isMouseDown = true;
        var rect = event.target.getBoundingClientRect();
        this._oldX = event.clientX - rect.left;
        this._oldY = event.clientY - rect.top;
    };
    RoundCameraController.prototype._wheelHandler = function (event) {
        event.preventDefault();
        if (event.wheelDelta > 0) {
            this.radius -= this.radiusOffset;
            if (this.radius < this.radiusMin) {
                this.radius = this.radiusMin;
            }
        }
        else {
            this.radius += this.radiusOffset;
        }
    };
    RoundCameraController.prototype._domMouseScrollHandler = function (event) {
        event.preventDefault();
        if (event.detail < 0) {
            this.radius -= this.radiusOffset;
            if (this.radius < this.radiusMin) {
                this.radius = this.radiusMin;
            }
        }
        else {
            this.radius += this.radiusOffset;
        }
    };
    RoundCameraController.prototype._moveHandler = function (event) {
        if (this.isMouseDown) {
            var rect = event.target.getBoundingClientRect();
            var stageX = event.clientX - rect.left;
            var stageY = event.clientY - rect.top;
            this.inputXY(stageX, stageY);
        }
    };
    RoundCameraController.prototype._touchStartHandler = function (event) {
        event.preventDefault();
        if (!this.isMouseDown) {
            var touches = event.changedTouches;
            var touch = touches[0];
            this.isMouseDown = true;
            this._identifier = touch.identifier;
            var target = touch.target;
            this._oldX = touch.pageX - target.offsetLeft;
            this._oldY = touch.pageY - target.offsetTop;
        }
    };
    RoundCameraController.prototype._touchMoveHandler = function (event) {
        event.preventDefault();
        if (this._isGestureChange) {
            return;
        }
        var touches = event.changedTouches;
        var touchLength = touches.length;
        for (var i = 0; i < touchLength; i++) {
            var touch = touches[i];
            if (touch.identifier === this._identifier) {
                var target = touch.target;
                var stageX = touch.pageX - target.offsetLeft;
                var stageY = touch.pageY - target.offsetTop;
                this.inputXY(stageX, stageY);
                break;
            }
        }
    };
    RoundCameraController.prototype._touchEndHandler = function (event) {
        if (this.isMouseDown) {
            event.preventDefault();
        }
        this.isMouseDown = false;
    };
    RoundCameraController.prototype._gestureStartHandler = function (event) {
        event.preventDefault();
        event.stopImmediatePropagation();
        this._isGestureChange = true;
        this.isMouseDown = true;
        this._oldRadius = this.radius;
    };
    RoundCameraController.prototype._gestureChangeHandler = function (event) {
        event.preventDefault();
        event.stopImmediatePropagation();
        this.radius = this._oldRadius + this.gestureRadiusFactor * this.radiusOffset * (1 - event.scale);
        if (this.radius < this.radiusMin) {
            this.radius = this.radiusMin;
        }
    };
    RoundCameraController.prototype._gestureEndHandler = function (event) {
        event.preventDefault();
        event.stopImmediatePropagation();
        this._isGestureChange = false;
        this.isMouseDown = false;
        this._identifier = -1;
    };
    RoundCameraController.prototype.inputXY = function (newX, newY) {
        this._theta -= (newX - this._oldX) * 0.3;
        this._oldX = newX;
        this._phi -= (newY - this._oldY) * 0.3;
        this._oldY = newY;
        //
        if (this._phi < 20) {
            this._phi = 20;
        }
        else if (this._phi > 160) {
            this._phi = 160;
        }
    };
    RoundCameraController.prototype._updateCamera = function () {
        var t = this._currentTheta * RoundCameraController.RAD;
        var p = this._currentPhi * RoundCameraController.RAD;
        var rsin = this.radius * Math.sin(p);
        this._camera.x = rsin * Math.sin(t) + this._target[0];
        this._camera.z = rsin * Math.cos(t) + this._target[2];
        this._camera.y = this.radius * Math.cos(p) + this._target[1];
        this._camera.lookAt(this._target);
    };
    RoundCameraController.prototype.upDate = function (factor) {
        if (factor === void 0) { factor = 0.1; }
        this._currentTheta += (this._theta - this._currentTheta) * factor;
        this._currentPhi += (this._phi - this._currentPhi) * factor;
        this._updateCamera();
    };
    RoundCameraController.prototype.rotate = function (dTheta, dPhi) {
        this._theta += dTheta;
        this._phi += dPhi;
    };
    RoundCameraController.prototype.set = function (theta, phi) {
        this._theta = theta;
        this._phi = phi;
    };
    RoundCameraController.RAD = Math.PI / 180.0;
    return RoundCameraController;
}());
export { RoundCameraController };
