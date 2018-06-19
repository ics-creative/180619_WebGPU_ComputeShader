var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var Main = /** @class */ (function () {
    function Main() {
        console.log(new Date());
        this.init();
    }
    Main.prototype.init = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            var maxThreadgroupNum, maxNumElementsIndex, i, option, canvas, shader, library, kernelFunction1, kernelFunction2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        // Check whether WebGPU is enabled
                        if (!('WebGPURenderingContext' in window)) {
                            document.body.className = 'error';
                            return [2 /*return*/];
                        }
                        if (/iP(hone|(o|a)d)/.test(navigator.userAgent)) {
                            this.maxThreadNum = Main.MAX_THREAD_NUM_iOS;
                            maxThreadgroupNum = Main.MAX_THREADGROUP_NUM_iOS;
                        }
                        else {
                            this.maxThreadNum = Main.MAX_THREAD_NUM_macOS;
                            maxThreadgroupNum = Main.MAX_THREADGROUP_NUM_macOS;
                        }
                        // Selector setup
                        this.selectBox = document.getElementById('selectBox');
                        maxNumElementsIndex = Math.log2(this.maxThreadNum * maxThreadgroupNum) - 9;
                        for (i = 0; i < maxNumElementsIndex; i++) {
                            option = document.createElement('option');
                            option.text = '' + this.getLength(i);
                            this.selectBox.add(option);
                        }
                        this.selectBox.selectedIndex = 7;
                        this.selectBox.addEventListener('change', function () {
                            _this.logElement.innerText = '';
                            requestAnimationFrame(function () { return _this.compute(); });
                        });
                        // Div setup
                        this.logElement = document.createElement('div');
                        document.getElementById('contents').appendChild(this.logElement);
                        canvas = document.createElement(('canvas'));
                        // Create WebGPURenderingContext
                        this.gpu = canvas.getContext('webgpu');
                        // Create WebGPUCommandQueue
                        this.commandQueue = this.gpu.createCommandQueue();
                        return [4 /*yield*/, fetch('shader/defaultShader.metal').then(function (response) { return response.text(); })];
                    case 1:
                        shader = _a.sent();
                        shader = shader.replace('#define MAX_THREAD_NUM 512', "#define MAX_THREAD_NUM " + this.maxThreadNum);
                        library = this.gpu.createLibrary(shader);
                        kernelFunction1 = library.functionWithName('bitonicSort_phase1');
                        kernelFunction2 = library.functionWithName('bitonicSort_phase2');
                        if (!library || !kernelFunction1 || !kernelFunction2) {
                            return [2 /*return*/];
                        }
                        // Create pipelineState for compute
                        this.computePipelineState = this.gpu.createComputePipelineState(kernelFunction1);
                        this.computePipelineState2 = this.gpu.createComputePipelineState(kernelFunction2);
                        this.compute();
                        return [2 /*return*/];
                }
            });
        });
    };
    Main.prototype.compute = function () {
        return __awaiter(this, void 0, void 0, function () {
            var length, arr;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        length = this.getLength(this.selectBox.selectedIndex);
                        arr = new Float32Array(length);
                        this.resetData(arr, length);
                        // console.log(arr);
                        return [4 /*yield*/, this.sumCPU(arr.slice(0))];
                    case 1:
                        // console.log(arr);
                        _a.sent();
                        return [4 /*yield*/, this.sumGPU(arr.slice(0))];
                    case 2:
                        _a.sent();
                        this.log('compute completed');
                        return [2 /*return*/];
                }
            });
        });
    };
    Main.prototype.sumCPU = function (arr) {
        return __awaiter(this, void 0, void 0, function () {
            var now;
            return __generator(this, function (_a) {
                now = performance.now();
                arr.sort(function (a, b) {
                    return a - b;
                });
                this.log("CPU time: " + (performance.now() - now) + " ms");
                console.log("sort result validation: " + (this.validateSorted(arr) ? 'success' : 'failure'));
                return [2 /*return*/];
            });
        });
    };
    Main.prototype.sumGPU = function (arr) {
        return __awaiter(this, void 0, void 0, function () {
            var now, commandBuffer, length, inoutBuffer, threadgroups, computeCommandEncoder, threadgroupsPerGrid, threadsPerThreadgroup, k, j, computeCommandEncoder_1, uniformBuffer, completed, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        now = performance.now();
                        commandBuffer = this.commandQueue.createCommandBuffer();
                        length = arr.length;
                        inoutBuffer = this.gpu.createBuffer(arr);
                        threadgroups = Math.max(1, length / this.maxThreadNum);
                        computeCommandEncoder = commandBuffer.createComputeCommandEncoder();
                        computeCommandEncoder.setComputePipelineState(this.computePipelineState);
                        threadgroupsPerGrid = {
                            width: threadgroups,
                            height: 1,
                            depth: 1
                        };
                        threadsPerThreadgroup = {
                            width: Math.min(length, this.maxThreadNum),
                            height: 1,
                            depth: 1
                        };
                        computeCommandEncoder.setBuffer(inoutBuffer, 0, 0);
                        computeCommandEncoder.dispatch(threadgroupsPerGrid, threadsPerThreadgroup);
                        computeCommandEncoder.endEncoding();
                        if (threadgroups > 1) {
                            for (k = threadgroups; k <= length; k <<= 1) {
                                for (j = k >> 1; j > 0; j >>= 1) {
                                    computeCommandEncoder_1 = commandBuffer.createComputeCommandEncoder();
                                    computeCommandEncoder_1.setComputePipelineState(this.computePipelineState2);
                                    computeCommandEncoder_1.setBuffer(inoutBuffer, 0, 0);
                                    uniformBuffer = this.gpu.createBuffer(new Uint32Array([k, j]));
                                    computeCommandEncoder_1.setBuffer(uniformBuffer, 0, 1);
                                    computeCommandEncoder_1.dispatch(threadgroupsPerGrid, threadsPerThreadgroup);
                                    computeCommandEncoder_1.endEncoding();
                                }
                            }
                        }
                        completed = commandBuffer.completed;
                        // commit command
                        commandBuffer.commit();
                        return [4 /*yield*/, completed];
                    case 1:
                        _a.sent();
                        result = new Float32Array(inoutBuffer.contents);
                        this.log("GPU time: " + (performance.now() - now) + " ms");
                        console.log("sort result validation: " + (this.validateSorted(result) ? 'success' : 'failure'));
                        return [2 /*return*/];
                }
            });
        });
    };
    Main.prototype.resetData = function (arr, sortLength) {
        for (var i = 0; i < sortLength; i++) {
            arr[i] = Math.random();
        }
    };
    Main.prototype.validateSorted = function (arr) {
        var length = arr.length;
        for (var i = 0; i < length; i++) {
            if (i !== length - 1 && arr[i] > arr[i + 1]) {
                console.log(i, arr[i], arr[i + 1]);
                console.log(arr);
                return false;
            }
        }
        return true;
    };
    Main.prototype.getLength = function (index) {
        return 1 << (index + 10);
    };
    Main.prototype.log = function (str) {
        this.logElement.innerText += str + '\n';
    };
    Main.MAX_THREAD_NUM_iOS = 512;
    Main.MAX_THREAD_NUM_macOS = 1024;
    Main.MAX_THREADGROUP_NUM_iOS = 1024;
    Main.MAX_THREADGROUP_NUM_macOS = 2048;
    return Main;
}());
export { Main };
window.addEventListener('DOMContentLoaded', function () {
    new Main();
});
