var Primitive = /** @class */ (function () {
    function Primitive() {
    }
    Object.defineProperty(Primitive.prototype, "numAttributes", {
        get: function () {
            return this._numAttributes;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Primitive.prototype, "numVertices", {
        get: function () {
            return this._numVertices;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Primitive.prototype, "bufferData", {
        get: function () {
            return this._bufferData;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Primitive.prototype, "vertexBuffer", {
        get: function () {
            return this._vertexBuffer;
        },
        enumerable: true,
        configurable: true
    });
    Primitive.prototype.createBuffer = function (gpu) {
        this._vertexBuffer = gpu.createBuffer(this._bufferData);
    };
    return Primitive;
}());
export { Primitive };
