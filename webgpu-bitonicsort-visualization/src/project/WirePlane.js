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
import { Primitive } from '../webgpu/Primitive';
var WirePlane = /** @class */ (function (_super) {
    __extends(WirePlane, _super);
    function WirePlane(blockPerDirection, directionLength, posY) {
        var _this = _super.call(this) || this;
        var linesPerDirection = blockPerDirection + 1;
        var halfDirectionLength = directionLength / 2;
        var halfBlockPerDirection = blockPerDirection / 2;
        var pitch = directionLength / blockPerDirection;
        _this._numAttributes = 3;
        _this._numVertices = linesPerDirection * 4;
        var vertices = new Float32Array(_this._numVertices * 3);
        for (var i = 0; i < linesPerDirection; i++) {
            var offset = i * 6;
            var gz = (i - halfBlockPerDirection) * pitch;
            vertices[offset] = -halfDirectionLength;
            vertices[offset + 1] = posY;
            vertices[offset + 2] = gz;
            vertices[offset + 3] = halfDirectionLength;
            vertices[offset + 4] = posY;
            vertices[offset + 5] = gz;
            var offset2 = (i + linesPerDirection) * 6;
            vertices[offset2] = gz;
            vertices[offset2 + 1] = posY;
            vertices[offset2 + 2] = -halfDirectionLength;
            vertices[offset2 + 3] = gz;
            vertices[offset2 + 4] = posY;
            vertices[offset2 + 5] = halfDirectionLength;
        }
        _this._bufferData = new Float32Array(vertices);
        return _this;
    }
    return WirePlane;
}(Primitive));
export { WirePlane };
