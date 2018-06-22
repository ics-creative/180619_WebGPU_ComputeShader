import {Uniform} from '../webgpu/Uniform';

export class VertexUniform extends Uniform {
  public static readonly BUFFER_LENGTH:number = 19;

  // Layout
  // 0-15 = mvpMatrix:float4x4
  // 16 = numLines:float
  // 17 = time:float
  // 18 = sortCompleteTime:float

  public get mvpMatrix():Float32Array {
    return this._bufferData.subarray(0, 16);
  }

  public set mvpMatrix(value:Float32Array) {
    this._copyData(value, 0, 16);
  }

  public get numLines():number {
    return this._bufferData[16];
  }

  public set numLines(value:number) {
    this._bufferData[16] = value;
  }

  public get time():number {
    return this._bufferData[17];
  }

  public set time(value:number) {
    this._bufferData[17] = value;
  }

  public get sortCompleteTime():number {
    return this._bufferData[18];
  }

  public set sortCompleteTime(value:number) {
    this._bufferData[18] = value;
  }

  constructor() {
    super();
    this._bufferDataLength = VertexUniform.BUFFER_LENGTH;
  }
}
