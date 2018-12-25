import {WebMetalTranslator} from './webgpu/WebMetalTranslator';

export class Main {
  private static readonly MAX_THREAD_NUM_iOS:number = 512;
  private static readonly MAX_THREAD_NUM_macOS:number = 1024;

  private static readonly MAX_THREADGROUP_NUM_iOS:number = 1024;
  private static readonly MAX_THREADGROUP_NUM_macOS:number = 2048;

  private logElement:HTMLDivElement;
  private selectBox:HTMLSelectElement;

  private gpu:WebGPURenderingContext;
  private commandQueue:WebGPUCommandQueue;
  private computePipelineState:WebGPUComputePipelineState;
  private computePipelineState2:WebGPUComputePipelineState;

  private maxThreadNum:number;

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

    // Choose appropriate thread size for runnning environment
    let maxThreadgroupNum:number;
    if (/iP(hone|(o|a)d)/.test(navigator.userAgent)) {
      this.maxThreadNum = Main.MAX_THREAD_NUM_iOS;
      maxThreadgroupNum = Main.MAX_THREADGROUP_NUM_iOS;
    } else {
      this.maxThreadNum = Main.MAX_THREAD_NUM_macOS;
      maxThreadgroupNum = Main.MAX_THREADGROUP_NUM_macOS;
    }

    // Selector setup
    this.selectBox = <HTMLSelectElement> document.getElementById('selectBox');
    const maxNumElementsIndex:number = Math.log2(this.maxThreadNum * maxThreadgroupNum) - 9;
    for (let i:number = 0; i < maxNumElementsIndex; i++) {
      const option:HTMLOptionElement = document.createElement('option');
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
    this.logElement = <HTMLDivElement> document.getElementById('log');

    // Canvas setup
    const canvas:HTMLCanvasElement = <HTMLCanvasElement> document.createElement(('canvas'));

    // Create WebGPURenderingContext
    this.gpu = WebMetalTranslator.createWebGPURenderingContext(canvas);

    // Create WebGPUCommandQueue
    this.commandQueue = this.gpu.createCommandQueue();

    // Load metal shader file and create each WebGPUFunction to use for computing
    let shader:string = await fetch('shader/defaultShader.metal').then((response:Response) => response.text());
    shader = shader.replace('#define MAX_THREAD_NUM 512', `#define MAX_THREAD_NUM ${this.maxThreadNum}`);
    const library:WebGPULibrary = this.gpu.createLibrary(shader);
    const kernelFunction1:WebGPUFunction = library.functionWithName('bitonicSort_phase1');
    const kernelFunction2:WebGPUFunction = library.functionWithName('bitonicSort_phase2');

    if (!library || !kernelFunction1 || !kernelFunction2) {
      return;
    }

    // Create pipelineState for compute
    this.computePipelineState = this.gpu.createComputePipelineState(kernelFunction1);
    this.computePipelineState2 = this.gpu.createComputePipelineState(kernelFunction2);

    this.compute();
  }

  private async compute():Promise<void> {
    const length:number = this.getLength(this.selectBox.selectedIndex);
    const arr:Float32Array = new Float32Array(length);
    this.resetData(arr, length);
    // console.log(arr);

    await this.sumCPU(arr.slice(0));
    await this.sumGPU(arr.slice(0));
    this.selectBox.disabled = false;
  }

  private async sumCPU(arr:Float32Array):Promise<void> {
    const now:number = performance.now();
    arr.sort(
      (a:number, b:number):number => {
        return a - b;
      }
    );
    this.log(`CPUでの実行時間: ${Math.round(performance.now() - now)} ms`);
    console.log(`sort result validation: ${this.validateSorted(arr) ? 'success' : 'failure'}`);

    // console.log(arr);
  }

  private async sumGPU(arr:Float32Array):Promise<void> {
    const now:number = performance.now();

    // prepare command
    const commandBuffer:WebGPUCommandBuffer = this.commandQueue.createCommandBuffer();

    const length:number = arr.length;

    let inoutBuffer:WebGPUBuffer = this.gpu.createBuffer(arr);

    const threadgroups:number = Math.max(1, length / this.maxThreadNum);

    const computeCommandEncoder:WebGPUComputeCommandEncoder = commandBuffer.createComputeCommandEncoder();
    computeCommandEncoder.setComputePipelineState(this.computePipelineState);

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

    computeCommandEncoder.setBuffer(inoutBuffer, 0, 0);

    computeCommandEncoder.dispatch(threadgroupsPerGrid, threadsPerThreadgroup);
    computeCommandEncoder.endEncoding();

    if (threadgroups > 1) {
      for (let k:number = threadgroups; k <= length; k <<= 1) {
        for (let j:number = k >> 1; j > 0; j >>= 1) {
          const computeCommandEncoder:WebGPUComputeCommandEncoder = commandBuffer.createComputeCommandEncoder();
          computeCommandEncoder.setComputePipelineState(this.computePipelineState2);

          computeCommandEncoder.setBuffer(inoutBuffer, 0, 0);
          const uniformBuffer:WebGPUBuffer = this.gpu.createBuffer(new Uint32Array([k, j]));
          computeCommandEncoder.setBuffer(uniformBuffer, 0, 1);

          computeCommandEncoder.dispatch(threadgroupsPerGrid, threadsPerThreadgroup);
          computeCommandEncoder.endEncoding();
        }
      }
    }

    const completed:Promise<void> = commandBuffer.completed;

    // commit command
    commandBuffer.commit();

    await completed;

    const result:Float32Array = new Float32Array(inoutBuffer.contents);
    this.log(`GPUでの実行時間: ${Math.round(performance.now() - now)} ms`);
    console.log(`sort result validation: ${this.validateSorted(result) ? 'success' : 'failure'}`);
    // this.log(`threadgroup: ${threadgroupsPerGrid.width}, thread: ${threadsPerThreadgroup.width}`);

    // console.log(result);
  }

  private resetData(arr:Float32Array, sortLength:number):void {
    for (let i:number = 0; i < sortLength; i++) {
      arr[i] = Math.random();
    }
  }

  private validateSorted(arr:Float32Array):boolean {
    const length:number = arr.length;
    for (let i:number = 0; i < length; i++) {
      if (i !== length - 1 && arr[i] > arr[i + 1]) {
        console.log(i, arr[i], arr[i + 1]);
        console.log(arr);
        return false;
      }
    }
    return true;
  }

  private getLength(index:number):number {
    return 1 << (index + 10);
  }

  private log(str:string):void {
    this.logElement.innerText += str + '\n';
  }
}

window.addEventListener('DOMContentLoaded', () => {
  new Main();
});
