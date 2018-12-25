import {mat4} from 'gl-matrix';
import {VertexUniform} from './project/VertexUniform';
import {WirePlane} from './project/WirePlane';
import {Camera} from './webgpu/Camera';
import {RoundCameraController} from './webgpu/RoundCameraController';
import {WebMetalTranslator} from './webgpu/WebMetalTranslator';

export class Main {
  private static readonly MAX_THREAD_NUM_iOS:number = 512;
  private static readonly MAX_THREAD_NUM_macOS:number = 1024;

  private static readonly MIN_SORT_MULTIPLIER:number = 3;
  private static readonly MAX_SORT_MULTIPLIER:number = 17;

  private static RAD:number = Math.PI / 180;

  private static CANVAS_WIDTH:number = innerWidth * devicePixelRatio;
  private static CANVAS_HEIGHT:number = innerHeight * devicePixelRatio;

  private stats:Stats;

  private numElementsDiv:HTMLDivElement;

  private canvas:HTMLCanvasElement;
  private gpu:WebGPURenderingContext;
  private commandQueue:WebGPUCommandQueue;
  private linesRenderPipelineState:WebGPURenderPipelineState;
  private groundRenderPipelineState:WebGPURenderPipelineState;
  private renderPassDescriptor:WebGPURenderPassDescriptor;
  private depthStencilState:WebGPUDepthStencilState;

  private maxThreadNum:number;
  private computePipelineState:WebGPUComputePipelineState;
  private bitonicSortUniform:WebGPUBuffer;
  private bitonicSortUniformContents:Uint32Array;

  private camera:Camera;
  private cameraController:RoundCameraController;
  private sortData:Float32Array;
  private sortDataBuffer:WebGPUBuffer;
  private vertexUniform:VertexUniform;
  private ground:WirePlane;

  private sortLength:number;
  private time:number;
  private wave:number;
  private sortStepCompleted:boolean;

  constructor() {
    console.log(new Date());
    this.init();
  }

  private async init():Promise<void> {
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

    // Stats setup
    this.stats = new Stats();
    document.body.appendChild(this.stats.dom);

    // Div setup
    this.numElementsDiv = <HTMLDivElement> document.getElementById('numElements');

    // Canvas setup
    this.canvas = <HTMLCanvasElement> document.getElementById(('myCanvas'));
    this.canvas.width = Main.CANVAS_WIDTH;
    this.canvas.height = Main.CANVAS_HEIGHT;

    // Create WebGPURenderingContext
    this.gpu = WebMetalTranslator.createWebGPURenderingContext(this.canvas);

    // Create WebGPUCommandQueue
    this.commandQueue = this.gpu.createCommandQueue();

    // Choose appropriate thread size for runnning environment
    const isIPhone:boolean = /iP(hone|(o|a)d)/.test(navigator.userAgent);
    this.maxThreadNum = isIPhone ? Main.MAX_THREAD_NUM_iOS : Main.MAX_THREAD_NUM_macOS;

    // Load metal shader file and create each WebGPUFunction to use for rendering and computing
    let shader:string = await fetch('shader/defaultShader.metal').then((response:Response) => response.text());
    shader = shader.replace('#define MAX_THREAD_NUM 512', `#define MAX_THREAD_NUM ${this.maxThreadNum}`);
    const library:WebGPULibrary = this.gpu.createLibrary(shader);
    const linesVertexFunction:WebGPUFunction = library.functionWithName('vertex_lines');
    const groundVertexFunction:WebGPUFunction = library.functionWithName('vertex_ground');
    const fragmentFunction:WebGPUFunction = library.functionWithName('fragment_main');
    const kernelFunction:WebGPUFunction = library.functionWithName('bitonicSort');

    if (!library || !linesVertexFunction || !groundVertexFunction || !fragmentFunction || !kernelFunction) {
      return;
    }

    // Create pipelineState for render
    const renderPipelineDescriptor:WebGPURenderPipelineDescriptor = WebMetalTranslator.createWebGPURenderPipelineDescriptor();
    renderPipelineDescriptor.vertexFunction = linesVertexFunction;
    renderPipelineDescriptor.fragmentFunction = fragmentFunction;
    renderPipelineDescriptor.colorAttachments[0].pixelFormat = WebGPUPixelFormat.BGRA8Unorm;
    renderPipelineDescriptor.depthAttachmentPixelFormat = WebGPUPixelFormat.Depth32Float;
    this.linesRenderPipelineState = this.gpu.createRenderPipelineState(renderPipelineDescriptor);

    renderPipelineDescriptor.vertexFunction = groundVertexFunction;
    this.groundRenderPipelineState = this.gpu.createRenderPipelineState(renderPipelineDescriptor);

    // Create pipelineState for render depth
    const depthStencilDescriptor:WebGPUDepthStencilDescriptor = WebMetalTranslator.createWebGPUDepthStencilDescriptor();
    depthStencilDescriptor.depthCompareFunction = WebGPUCompareFunction.less;
    depthStencilDescriptor.depthWriteEnabled = true;
    this.depthStencilState = this.gpu.createDepthStencilState(depthStencilDescriptor);

    // Create WebGPURenderPassDescriptor
    this.renderPassDescriptor = WebMetalTranslator.createWebGPURenderPassDescriptor();
    const colorAttachment0:WebGPURenderPassColorAttachmentDescriptor = this.renderPassDescriptor.colorAttachments[0];
    colorAttachment0.loadAction = WebGPULoadAction.clear;
    colorAttachment0.storeAction = WebGPUStoreAction.store;
    colorAttachment0.clearColor = [0.1, 0.1, 0.2, 1.0];

    // Create depth texture
    const depthTextureDescriptor:WebGPUTextureDescriptor = WebMetalTranslator.createWebGPUTextureDescriptor(
      WebGPUPixelFormat.Depth32Float, Main.CANVAS_WIDTH, Main.CANVAS_HEIGHT, false);
    depthTextureDescriptor.textureType = WebGPUTextureType.type2D;
    depthTextureDescriptor.sampleCount = 1;
    depthTextureDescriptor.usage = WebGPUTextureUsage.unknown;
    depthTextureDescriptor.storageMode = WebGPUStorageMode.private;
    const depthTexture:WebGPUTexture = this.gpu.createTexture(depthTextureDescriptor);

    const depthAttachment:WebGPURenderPassDepthAttachmentDescriptor = this.renderPassDescriptor.depthAttachment;
    depthAttachment.loadAction = WebGPULoadAction.clear;
    depthAttachment.storeAction = WebGPUStoreAction.store;
    depthAttachment.clearDepth = 1.0;
    depthAttachment.texture = depthTexture;

    // Create pipelineState for compute
    this.computePipelineState = this.gpu.createComputePipelineState(kernelFunction);
    this.bitonicSortUniform = this.gpu.createBuffer(new Uint32Array([0, 0]));
    this.bitonicSortUniformContents = new Uint32Array(this.bitonicSortUniform.contents);

    // Initialize objects
    const length:number = 1 << (Main.MAX_SORT_MULTIPLIER + 1);
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
    this.cameraController.radius = isIPhone ? 600 : 250;
    this.cameraController.radiusOffset = 2;
    this.cameraController.rotate(0, 0);

    // Initialize values
    this.time = 0;
    this.wave = 0;
    this.sortStepCompleted = false;
    this.vertexUniform.sortCompleteTime = Number.MAX_VALUE;
    this.numElementsDiv.innerText = '要素数：' + this.sortLength;

    this.render();
  }

  private async render():Promise<void> {
    this.stats.begin();

    this.time += 1;
    this.wave += 1;

    // Update camera
    this.cameraController.upDate(0.1);
    const cameraMatrix:mat4 = this.camera.getCameraMtx();

    // Prepare command
    const commandBuffer:WebGPUCommandBuffer = this.commandQueue.createCommandBuffer();

    // Compute phase
    if (!this.sortStepCompleted && this.time >= 60) {
      const sortTime:number = this.time - 60;
      const timeOffset:number = 10;
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
      } else {
        this.sortLength = 1 << Main.MIN_SORT_MULTIPLIER;
      }
      this.vertexUniform.numLines = this.sortLength;
      this.vertexUniform.sortCompleteTime = Number.MAX_VALUE;
      this.numElementsDiv.innerText = '要素数：' + this.sortLength;
      this.resetData(this.sortData, this.sortLength);
      this.time = 0;
      this.sortStepCompleted = false;
    }

    // render phase
    const drawable:WebGPUDrawable = this.gpu.nextDrawable();
    this.renderPassDescriptor.colorAttachments[0].texture = drawable.texture;

    // render visualization
    this.renderPassDescriptor.colorAttachments[0].loadAction = WebGPULoadAction.clear;
    this.renderPassDescriptor.depthAttachment.loadAction = WebGPULoadAction.clear;
    const linesRenderCommandEncoder:WebGPURenderCommandEncoder = commandBuffer.createRenderCommandEncoderWithDescriptor(this.renderPassDescriptor);
    linesRenderCommandEncoder.setRenderPipelineState(this.linesRenderPipelineState);
    linesRenderCommandEncoder.setDepthStencilState(this.depthStencilState);
    linesRenderCommandEncoder.setVertexBuffer(this.sortDataBuffer, 0, 0);

    this.vertexUniform.mvpMatrix = cameraMatrix;
    this.vertexUniform.time = this.wave;
    linesRenderCommandEncoder.setVertexBuffer(this.vertexUniform.buffer, 0, 1);

    linesRenderCommandEncoder.drawPrimitives(WebGPUPrimitiveType.line, 0, this.sortLength * 2);
    linesRenderCommandEncoder.endEncoding();

    // render ground
    this.renderPassDescriptor.colorAttachments[0].loadAction = WebGPULoadAction.load;
    this.renderPassDescriptor.depthAttachment.loadAction = WebGPULoadAction.load;
    const groundRenderCommandEncoder:WebGPURenderCommandEncoder = commandBuffer.createRenderCommandEncoderWithDescriptor(this.renderPassDescriptor);
    groundRenderCommandEncoder.setRenderPipelineState(this.groundRenderPipelineState);
    groundRenderCommandEncoder.setDepthStencilState(this.depthStencilState);
    groundRenderCommandEncoder.setVertexBuffer(this.ground.vertexBuffer, 0, 0);
    groundRenderCommandEncoder.setVertexBuffer(this.vertexUniform.buffer, 0, 1);

    groundRenderCommandEncoder.drawPrimitives(WebGPUPrimitiveType.line, 0, this.ground.numVertices);
    groundRenderCommandEncoder.endEncoding();

    // commit command
    commandBuffer.presentDrawable(drawable);
    const commandPromise:Promise<void> = commandBuffer.completed;
    commandBuffer.commit();

    // Wait for command complete
    await commandPromise;

    this.stats.end();

    requestAnimationFrame(() => this.render());
  }

  private sortStep(buffer:WebGPUBuffer, length:number, commandBuffer:WebGPUCommandBuffer, step:number):boolean {
    // Decide number of threadgroups
    const threadgroups:number = Math.max(1, length / this.maxThreadNum);

    const threadgroupsPerGrid:WebGPUSize = {
      width: threadgroups,
      height: 1,
      depth: 1
    };
    const threadsPerThreadgroup:WebGPUSize = {
      width: Math.min(length, this.maxThreadNum),
      height: 1,
      depth: 1
    };

    let completed:boolean = true;
    let i:number = 0;
    step += 1;
    for (let k:number = 2; k <= length; k <<= 1) {
      for (let j:number = k >> 1; j > 0; j >>= 1) {
        i += 1;
        if (i === step) {
          // Compute one step
          const computeCommandEncoder:WebGPUComputeCommandEncoder = commandBuffer.createComputeCommandEncoder();
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
  }

  private resetData(arr:Float32Array, sortLength:number):void {
    for (let i:number = 0; i < sortLength; i++) {
      arr[i] = 200 * (Math.random() - 0.5);
    }
  }

  private validateSorted(arr:Float32Array, sortLength:number):boolean {
    const length:number = sortLength;
    for (let i:number = 0; i < length; i++) {
      if (i !== length - 1 && arr[i] > arr[i + 1]) {
        return false;
      }
    }
    return true;
  }
}

window.addEventListener('DOMContentLoaded', () => {
  new Main();
});
