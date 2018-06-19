var Uniform = /** @class */ (function () {
    function Uniform() {
    }
    Object.defineProperty(Uniform.prototype, "bufferData", {
        get: function () {
            return this._bufferData;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Uniform.prototype, "bufferDataLength", {
        get: function () {
            return this._bufferDataLength;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Uniform.prototype, "buffer", {
        get: function () {
            return this._buffer;
        },
        enumerable: true,
        configurable: true
    });
    Uniform.prototype.createBuffer = function (gpu) {
        this._buffer = gpu.createBuffer(new Float32Array(this._bufferDataLength));
        this._bufferData = new Float32Array(this._buffer.contents);
    };
    Uniform.prototype._copyData = function (data, offset, count) {
        for (var i = 0; i < count; i++) {
            this._bufferData[offset + i] = data[i];
        }
    };
    return Uniform;
}());
export { Uniform };
