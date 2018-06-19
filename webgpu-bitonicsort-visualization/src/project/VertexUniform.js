var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
import { Uniform } from '../webgpu/Uniform';
var VertexUniform = /** @class */ (function (_super) {
    __extends(VertexUniform, _super);
    function VertexUniform() {
        var _this = _super.call(this) || this;
        _this._bufferDataLength = VertexUniform.BUFFER_LENGTH;
        return _this;
    }
    Object.defineProperty(VertexUniform.prototype, "mvpMatrix", {
        // Layout
        // 0-15 = mvpMatrix:float4x4
        // 16 = numLines:float
        // 17 = time:float
        // 18 = sortCompleteTime:float
        get: function () {
            return this._bufferData.subarray(0, 16);
        },
        set: function (value) {
            this._copyData(value, 0, 16);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(VertexUniform.prototype, "numLines", {
        get: function () {
            return this._bufferData[16];
        },
        set: function (value) {
            this._bufferData[16] = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(VertexUniform.prototype, "time", {
        get: function () {
            return this._bufferData[17];
        },
        set: function (value) {
            this._bufferData[17] = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(VertexUniform.prototype, "sortCompleteTime", {
        get: function () {
            return this._bufferData[18];
        },
        set: function (value) {
            this._bufferData[18] = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(VertexUniform.prototype, "vertexUniformBuffer", {
        get: function () {
            return this._vertexUniformBuffer;
        },
        enumerable: true,
        configurable: true
    });
    VertexUniform.BUFFER_LENGTH = 19;
    return VertexUniform;
}(Uniform));
export { VertexUniform };
