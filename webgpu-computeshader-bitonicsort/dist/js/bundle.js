/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "js/";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);

// CONCATENATED MODULE: ./src/webgpu/WebMetalTranslator.ts
class WebMetalTranslator {
    static get useWebMetal() {
        return WebMetalTranslator._useWebMetal;
    }
    static set useWebMetal(value) {
        WebMetalTranslator._useWebMetal = value;
    }
    static createWebGPURenderingContext(canvas) {
        return WebMetalTranslator.useWebMetal ? canvas.getContext('webmetal') : canvas.getContext('webgpu');
    }
    static createWebGPURenderPipelineDescriptor() {
        return WebMetalTranslator.useWebMetal ? new WebMetalRenderPipelineDescriptor() : new WebGPURenderPipelineDescriptor();
    }
    static createWebGPUDepthStencilDescriptor() {
        return WebMetalTranslator.useWebMetal ? new WebMetalDepthStencilDescriptor() : new WebGPUDepthStencilDescriptor();
    }
    static createWebGPURenderPassDescriptor() {
        return WebMetalTranslator.useWebMetal ? new WebMetalRenderPassDescriptor() : new WebGPURenderPassDescriptor();
    }
    static createWebGPUTextureDescriptor(pixelFormat, width, height, mipmapped) {
        return WebMetalTranslator.useWebMetal ? new WebMetalTextureDescriptor(pixelFormat, width, height, mipmapped) : new WebGPUTextureDescriptor(pixelFormat, width, height, mipmapped);
    }
}

// CONCATENATED MODULE: ./src/Main.ts
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Main", function() { return Main_Main; });

class Main_Main {
    constructor() {
        console.log(new Date());
        this.init();
    }
    async init() {
        // Check whether WebGPU is enabled
        if ('WebMetalRenderingContext' in window) {
            WebMetalTranslator.useWebMetal = true;
        }
        else if ('WebGPURenderingContext' in window && 'WebGPULibrary' in window) {
            WebMetalTranslator.useWebMetal = false;
        }
        else {
            document.body.className = 'error';
            return;
        }
        // Choose appropriate thread size for runnning environment
        let maxThreadgroupNum;
        if (/iP(hone|(o|a)d)/.test(navigator.userAgent)) {
            this.maxThreadNum = Main_Main.MAX_THREAD_NUM_iOS;
            maxThreadgroupNum = Main_Main.MAX_THREADGROUP_NUM_iOS;
        }
        else {
            this.maxThreadNum = Main_Main.MAX_THREAD_NUM_macOS;
            maxThreadgroupNum = Main_Main.MAX_THREADGROUP_NUM_macOS;
        }
        // Selector setup
        this.selectBox = document.getElementById('selectBox');
        const maxNumElementsIndex = Math.log2(this.maxThreadNum * maxThreadgroupNum) - 9;
        for (let i = 0; i < maxNumElementsIndex; i++) {
            const option = document.createElement('option');
            option.text = '' + this.getLength(i);
            this.selectBox.add(option);
        }
        this.selectBox.selectedIndex = 7;
        this.selectBox.addEventListener('change', () => {
            this.logElement.innerText = '';
            this.selectBox.disabled = true;
            requestAnimationFrame(() => this.compute());
        });
        // Div setup
        this.logElement = document.getElementById('log');
        // Canvas setup
        const canvas = document.createElement(('canvas'));
        // Create WebGPURenderingContext
        this.gpu = WebMetalTranslator.createWebGPURenderingContext(canvas);
        // Create WebGPUCommandQueue
        this.commandQueue = this.gpu.createCommandQueue();
        // Load metal shader file and create each WebGPUFunction to use for computing
        let shader = await fetch('shader/defaultShader.metal').then((response) => response.text());
        shader = shader.replace('#define MAX_THREAD_NUM 512', `#define MAX_THREAD_NUM ${this.maxThreadNum}`);
        const library = this.gpu.createLibrary(shader);
        const kernelFunction1 = library.functionWithName('bitonicSort_phase1');
        const kernelFunction2 = library.functionWithName('bitonicSort_phase2');
        if (!library || !kernelFunction1 || !kernelFunction2) {
            return;
        }
        // Create pipelineState for compute
        this.computePipelineState = this.gpu.createComputePipelineState(kernelFunction1);
        this.computePipelineState2 = this.gpu.createComputePipelineState(kernelFunction2);
        this.compute();
    }
    async compute() {
        const length = this.getLength(this.selectBox.selectedIndex);
        const arr = new Float32Array(length);
        this.resetData(arr, length);
        // console.log(arr);
        await this.sumCPU(arr.slice(0));
        await this.sumGPU(arr.slice(0));
        this.selectBox.disabled = false;
    }
    async sumCPU(arr) {
        const now = performance.now();
        arr.sort((a, b) => {
            return a - b;
        });
        this.log(`CPUでの実行時間: ${Math.round(performance.now() - now)} ms`);
        console.log(`sort result validation: ${this.validateSorted(arr) ? 'success' : 'failure'}`);
        // console.log(arr);
    }
    async sumGPU(arr) {
        const now = performance.now();
        // prepare command
        const commandBuffer = this.commandQueue.createCommandBuffer();
        const length = arr.length;
        let inoutBuffer = this.gpu.createBuffer(arr);
        const threadgroups = Math.max(1, length / this.maxThreadNum);
        const computeCommandEncoder = commandBuffer.createComputeCommandEncoder();
        computeCommandEncoder.setComputePipelineState(this.computePipelineState);
        const threadgroupsPerGrid = {
            width: threadgroups,
            height: 1,
            depth: 1
        };
        const threadsPerThreadgroup = {
            width: Math.min(length, this.maxThreadNum),
            height: 1,
            depth: 1
        };
        computeCommandEncoder.setBuffer(inoutBuffer, 0, 0);
        computeCommandEncoder.dispatch(threadgroupsPerGrid, threadsPerThreadgroup);
        computeCommandEncoder.endEncoding();
        if (threadgroups > 1) {
            for (let k = threadgroups; k <= length; k <<= 1) {
                for (let j = k >> 1; j > 0; j >>= 1) {
                    const computeCommandEncoder = commandBuffer.createComputeCommandEncoder();
                    computeCommandEncoder.setComputePipelineState(this.computePipelineState2);
                    computeCommandEncoder.setBuffer(inoutBuffer, 0, 0);
                    const uniformBuffer = this.gpu.createBuffer(new Uint32Array([k, j]));
                    computeCommandEncoder.setBuffer(uniformBuffer, 0, 1);
                    computeCommandEncoder.dispatch(threadgroupsPerGrid, threadsPerThreadgroup);
                    computeCommandEncoder.endEncoding();
                }
            }
        }
        const completed = commandBuffer.completed;
        // commit command
        commandBuffer.commit();
        await completed;
        const result = new Float32Array(inoutBuffer.contents);
        this.log(`GPUでの実行時間: ${Math.round(performance.now() - now)} ms`);
        console.log(`sort result validation: ${this.validateSorted(result) ? 'success' : 'failure'}`);
        // this.log(`threadgroup: ${threadgroupsPerGrid.width}, thread: ${threadsPerThreadgroup.width}`);
        // console.log(result);
    }
    resetData(arr, sortLength) {
        for (let i = 0; i < sortLength; i++) {
            arr[i] = Math.random();
        }
    }
    validateSorted(arr) {
        const length = arr.length;
        for (let i = 0; i < length; i++) {
            if (i !== length - 1 && arr[i] > arr[i + 1]) {
                console.log(i, arr[i], arr[i + 1]);
                console.log(arr);
                return false;
            }
        }
        return true;
    }
    getLength(index) {
        return 1 << (index + 10);
    }
    log(str) {
        this.logElement.innerText += str + '\n';
    }
}
Main_Main.MAX_THREAD_NUM_iOS = 512;
Main_Main.MAX_THREAD_NUM_macOS = 1024;
Main_Main.MAX_THREADGROUP_NUM_iOS = 1024;
Main_Main.MAX_THREADGROUP_NUM_macOS = 2048;
window.addEventListener('DOMContentLoaded', () => {
    new Main_Main();
});


/***/ })
/******/ ]);