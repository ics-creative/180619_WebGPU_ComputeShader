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
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
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
import { VertexUniform } from './project/VertexUniform';
import { WirePlane } from './project/WirePlane';
import { Camera } from './webgpu/Camera';
import { RoundCameraController } from './webgpu/RoundCameraController';
var Main = /** @class */ (function () {
    function Main() {
        console.log(new Date());
        this.init();
    }
    Main.prototype.init = function () {
        return __awaiter(this, void 0, void 0, function () {
            var shader, library, linesVertexFunction, groundVertexFunction, fragmentFunction, kernelFunction, renderPipelineDescriptor, depthStencilDescriptor, colorAttachment0, depthTextureDescriptor, depthTexture, depthAttachment, length;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        // Check whether WebGPU is enabled
                        if (!('WebGPURenderingContext' in window)) {
                            document.body.className = 'error';
                            return [2 /*return*/];
                        }
                        // Stats setup
                        this.stats = new Stats();
                        document.body.appendChild(this.stats.dom);
                        // Canvas setup
                        this.canvas = document.getElementById(('myCanvas'));
                        this.canvas.width = Main.CANVAS_WIDTH;
                        this.canvas.height = Main.CANVAS_HEIGHT;
                        // Create WebGPURenderingContext
                        this.gpu = this.canvas.getContext('webgpu');
                        // Create WebGPUCommandQueue
                        this.commandQueue = this.gpu.createCommandQueue();
                        // Choose appropriate thread size for runnning environment
                        this.maxThreadNum = /iP(hone|(o|a)d)/.test(navigator.userAgent) ? Main.MAX_THREAD_NUM_iOS : Main.MAX_THREAD_NUM_macOS;
                        return [4 /*yield*/, fetch('shader/defaultShader.metal').then(function (response) { return response.text(); })];
                    case 1:
                        shader = _a.sent();
                        shader = shader.replace('#define MAX_THREAD_NUM 512', "#define MAX_THREAD_NUM " + this.maxThreadNum);
                        library = this.gpu.createLibrary(shader);
                        linesVertexFunction = library.functionWithName('vertex_lines');
                        groundVertexFunction = library.functionWithName('vertex_ground');
                        fragmentFunction = library.functionWithName('fragment_main');
                        kernelFunction = library.functionWithName('bitonicSort');
                        if (!library || !linesVertexFunction || !groundVertexFunction || !fragmentFunction || !kernelFunction) {
                            return [2 /*return*/];
                        }
                        renderPipelineDescriptor = new WebGPURenderPipelineDescriptor();
                        renderPipelineDescriptor.vertexFunction = linesVertexFunction;
                        renderPipelineDescriptor.fragmentFunction = fragmentFunction;
                        renderPipelineDescriptor.colorAttachments[0].pixelFormat = 80 /* BGRA8Unorm */;
                        renderPipelineDescriptor.depthAttachmentPixelFormat = 252 /* Depth32Float */;
                        this.linesRenderPipelineState = this.gpu.createRenderPipelineState(renderPipelineDescriptor);
                        renderPipelineDescriptor.vertexFunction = groundVertexFunction;
                        this.groundRenderPipelineState = this.gpu.createRenderPipelineState(renderPipelineDescriptor);
                        depthStencilDescriptor = new WebGPUDepthStencilDescriptor();
                        depthStencilDescriptor.depthCompareFunction = "less" /* less */;
                        depthStencilDescriptor.depthWriteEnabled = true;
                        this.depthStencilState = this.gpu.createDepthStencilState(depthStencilDescriptor);
                        // Create WebGPURenderPassDescriptor
                        this.renderPassDescriptor = new WebGPURenderPassDescriptor();
                        colorAttachment0 = this.renderPassDescriptor.colorAttachments[0];
                        colorAttachment0.loadAction = 2 /* clear */;
                        colorAttachment0.storeAction = 1 /* store */;
                        colorAttachment0.clearColor = [0.1, 0.1, 0.2, 1.0];
                        depthTextureDescriptor = new WebGPUTextureDescriptor(252 /* Depth32Float */, Main.CANVAS_WIDTH, Main.CANVAS_HEIGHT, false);
                        depthTextureDescriptor.textureType = 2 /* type2D */;
                        depthTextureDescriptor.sampleCount = 1;
                        depthTextureDescriptor.usage = 0 /* unknown */;
                        depthTextureDescriptor.storageMode = 2 /* private */;
                        depthTexture = this.gpu.createTexture(depthTextureDescriptor);
                        depthAttachment = this.renderPassDescriptor.depthAttachment;
                        depthAttachment.loadAction = 2 /* clear */;
                        depthAttachment.storeAction = 1 /* store */;
                        depthAttachment.clearDepth = 1.0;
                        depthAttachment.texture = depthTexture;
                        // Create pipelineState for compute
                        this.computePipelineState = this.gpu.createComputePipelineState(kernelFunction);
                        this.bitonicSortUniform = this.gpu.createBuffer(new Uint32Array([0, 0]));
                        this.bitonicSortUniformContents = new Uint32Array(this.bitonicSortUniform.contents);
                        length = 1 << (Main.MAX_SORT_MULTIPLIER + 1);
                        this.sortDataBuffer = this.gpu.createBuffer(new Float32Array(length));
                        this.sortData = new Float32Array(this.sortDataBuffer.contents);
                        this.sortLength = 1 << Main.MIN_SORT_MULTIPLIER;
                        this.resetData(this.sortData, this.sortLength);
                        this.ground = new WirePlane(10, 400, -120);
                        this.ground.createBuffer(this.gpu);
                        this.vertexUniform = new VertexUniform();
                        this.vertexUniform.createBuffer(this.gpu);
                        this.vertexUniform.numLines = this.sortLength;
                        // Initialize camera
                        this.camera = new Camera(45 * Main.RAD, Main.CANVAS_WIDTH / Main.CANVAS_HEIGHT, 0.1, 1000.0);
                        this.cameraController = new RoundCameraController(this.camera, this.canvas);
                        this.canvas.style.cursor = 'move';
                        this.cameraController.radius = 250;
                        this.cameraController.radiusOffset = 2;
                        this.cameraController.rotate(0, 0);
                        // Initialize values
                        this.time = 0;
                        this.wave = 0;
                        this.sortStepCompleted = false;
                        this.vertexUniform.sortCompleteTime = Number.MAX_VALUE;
                        this.render();
                        return [2 /*return*/];
                }
            });
        });
    };
    Main.prototype.render = function () {
        return __awaiter(this, void 0, void 0, function () {
            var cameraMatrix, commandBuffer, sortTime, timeOffset, drawable, linesRenderCommandEncoder, groundRenderCommandEncoder, commandPromise;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.stats.begin();
                        this.time += 1;
                        this.wave += 1;
                        // Update camera
                        this.cameraController.upDate(0.1);
                        cameraMatrix = this.camera.getCameraMtx();
                        commandBuffer = this.commandQueue.createCommandBuffer();
                        // Compute phase
                        if (!this.sortStepCompleted && this.time >= 60) {
                            sortTime = this.time - 60;
                            timeOffset = 10;
                            if (sortTime % timeOffset === 0) {
                                this.sortStepCompleted = this.sortStep(this.sortDataBuffer, this.sortLength, commandBuffer, sortTime / timeOffset);
                                if (this.sortStepCompleted) {
                                    console.log('sort result validation: ', this.validateSorted(new Float32Array(this.sortDataBuffer.contents), this.sortLength));
                                    this.time = 0;
                                    this.vertexUniform.sortCompleteTime = this.wave;
                                }
                            }
                        }
                        else if (this.sortStepCompleted && this.time >= 120) {
                            // Change Number of array elements and reset data
                            if (this.sortLength < (1 << Main.MAX_SORT_MULTIPLIER)) {
                                this.sortLength *= 2;
                            }
                            else {
                                this.sortLength = 1 << Main.MIN_SORT_MULTIPLIER;
                            }
                            this.vertexUniform.numLines = this.sortLength;
                            this.vertexUniform.sortCompleteTime = Number.MAX_VALUE;
                            this.resetData(this.sortData, this.sortLength);
                            this.time = 0;
                            this.sortStepCompleted = false;
                        }
                        drawable = this.gpu.nextDrawable();
                        this.renderPassDescriptor.colorAttachments[0].texture = drawable.texture;
                        // render visualization
                        this.renderPassDescriptor.colorAttachments[0].loadAction = 2 /* clear */;
                        this.renderPassDescriptor.depthAttachment.loadAction = 2 /* clear */;
                        linesRenderCommandEncoder = commandBuffer.createRenderCommandEncoderWithDescriptor(this.renderPassDescriptor);
                        linesRenderCommandEncoder.setRenderPipelineState(this.linesRenderPipelineState);
                        linesRenderCommandEncoder.setDepthStencilState(this.depthStencilState);
                        linesRenderCommandEncoder.setVertexBuffer(this.sortDataBuffer, 0, 0);
                        this.vertexUniform.mvpMatrix = cameraMatrix;
                        this.vertexUniform.time = this.wave;
                        linesRenderCommandEncoder.setVertexBuffer(this.vertexUniform.buffer, 0, 1);
                        linesRenderCommandEncoder.drawPrimitives(1 /* line */, 0, this.sortLength * 2);
                        linesRenderCommandEncoder.endEncoding();
                        // render ground
                        this.renderPassDescriptor.colorAttachments[0].loadAction = 1 /* load */;
                        this.renderPassDescriptor.depthAttachment.loadAction = 1 /* load */;
                        groundRenderCommandEncoder = commandBuffer.createRenderCommandEncoderWithDescriptor(this.renderPassDescriptor);
                        groundRenderCommandEncoder.setRenderPipelineState(this.groundRenderPipelineState);
                        groundRenderCommandEncoder.setDepthStencilState(this.depthStencilState);
                        groundRenderCommandEncoder.setVertexBuffer(this.ground.vertexBuffer, 0, 0);
                        groundRenderCommandEncoder.setVertexBuffer(this.vertexUniform.buffer, 0, 1);
                        groundRenderCommandEncoder.drawPrimitives(1 /* line */, 0, this.ground.numVertices);
                        groundRenderCommandEncoder.endEncoding();
                        // commit command
                        commandBuffer.presentDrawable(drawable);
                        commandPromise = commandBuffer.completed;
                        commandBuffer.commit();
                        // Wait for command complete
                        return [4 /*yield*/, commandPromise];
                    case 1:
                        // Wait for command complete
                        _a.sent();
                        this.stats.end();
                        requestAnimationFrame(function () { return _this.render(); });
                        return [2 /*return*/];
                }
            });
        });
    };
    Main.prototype.sortStep = function (buffer, length, commandBuffer, step) {
        // Decide number of threadgroups
        var threadgroups = Math.max(1, length / this.maxThreadNum);
        var threadgroupsPerGrid = {
            width: threadgroups,
            height: 1,
            depth: 1
        };
        var threadsPerThreadgroup = {
            width: Math.min(length, this.maxThreadNum),
            height: 1,
            depth: 1
        };
        var completed = true;
        var i = 0;
        step += 1;
        for (var k = 2; k <= length; k <<= 1) {
            for (var j = k >> 1; j > 0; j >>= 1) {
                i += 1;
                if (i === step) {
                    // Compute one step
                    var computeCommandEncoder = commandBuffer.createComputeCommandEncoder();
                    computeCommandEncoder.setComputePipelineState(this.computePipelineState);
                    computeCommandEncoder.setBuffer(buffer, 0, 0);
                    this.bitonicSortUniformContents[0] = k;
                    this.bitonicSortUniformContents[1] = j;
                    computeCommandEncoder.setBuffer(this.bitonicSortUniform, 0, 1);
                    computeCommandEncoder.dispatch(threadgroupsPerGrid, threadsPerThreadgroup);
                    computeCommandEncoder.endEncoding();
                    completed = false;
                    break;
                }
            }
        }
        return completed;
    };
    Main.prototype.resetData = function (arr, sortLength) {
        for (var i = 0; i < sortLength; i++) {
            arr[i] = 200 * (Math.random() - 0.5);
        }
    };
    Main.prototype.validateSorted = function (arr, sortLength) {
        var length = sortLength;
        for (var i = 0; i < length; i++) {
            if (i !== length - 1 && arr[i] > arr[i + 1]) {
                return false;
            }
        }
        return true;
    };
    Main.MAX_THREAD_NUM_iOS = 512;
    Main.MAX_THREAD_NUM_macOS = 1024;
    Main.MIN_SORT_MULTIPLIER = 3;
    Main.MAX_SORT_MULTIPLIER = 17;
    Main.RAD = Math.PI / 180;
    Main.CANVAS_WIDTH = 960;
    Main.CANVAS_HEIGHT = 540;
    return Main;
}());
export { Main };
window.addEventListener('DOMContentLoaded', function () {
    new Main();
});
