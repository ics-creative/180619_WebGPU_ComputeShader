import {Primitive} from '../webgpu/Primitive';

export class WirePlane extends Primitive {
  constructor(blockPerDirection:number, directionLength:number, posY:number) {
    super();

    const linesPerDirection:number = blockPerDirection + 1;
    const halfDirectionLength:number = directionLength / 2;
    const halfBlockPerDirection:number = blockPerDirection / 2;
    const pitch:number = directionLength / blockPerDirection;

    this._numAttributes = 3;
    this._numVertices = linesPerDirection * 4;

    const vertices:Float32Array = new Float32Array(this._numVertices * 3);
    for (let i:number = 0; i < linesPerDirection; i++) {
      const offset:number = i * 6;
      const gz:number = (i - halfBlockPerDirection) * pitch;
      vertices[offset] = -halfDirectionLength;
      vertices[offset + 1] = posY;
      vertices[offset + 2] = gz;

      vertices[offset + 3] = halfDirectionLength;
      vertices[offset + 4] = posY;
      vertices[offset + 5] = gz;

      const offset2:number = (i + linesPerDirection) * 6;
      vertices[offset2] = gz;
      vertices[offset2 + 1] = posY;
      vertices[offset2 + 2] = -halfDirectionLength;

      vertices[offset2 + 3] = gz;
      vertices[offset2 + 4] = posY;
      vertices[offset2 + 5] = halfDirectionLength;
    }

    this._bufferData = new Float32Array(vertices);
  }
}
