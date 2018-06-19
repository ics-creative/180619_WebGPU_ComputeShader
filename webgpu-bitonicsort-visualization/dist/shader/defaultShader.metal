#include <metal_stdlib>

using namespace metal;

struct VertexUniform
{
  float4x4 mvpMatrix;
  float numLines;
  float time;
  float sortCompleteTime;
};

struct Varying
{
  float4 position [[position]];
  float4 color;
};

float3 hsv2rgb(float h, float s, float v)
{
  return ((clamp(abs(fract(h + float3(0, 2, 1) / 3.0) * 6.0 - 3.0) - 1.0, 0.0, 1.0) -1.0) * s + 1.0) * v;
}

vertex Varying vertex_lines(device float *positions [[buffer(0)]],
                            constant VertexUniform &uniforms [[buffer(1)]],
                            uint vid [[vertex_id]])
{
  uint lid = vid >> 1;
  float value = positions[lid];
  float lx = (lid - uniforms.numLines / 2) / (uniforms.numLines / 200);
  float ly = vid % 2 == 0 ? value : -100.0;
  float lz = 10 * sin(uniforms.time * 0.1 + vid/uniforms.numLines * 16);

  Varying varying;
  varying.position = uniforms.mvpMatrix * float4(lx, ly, lz, 1.0);

  uint elapsed = uint(uniforms.time - uniforms.sortCompleteTime);
  if(elapsed > 0 && elapsed < 25)
  {
    float xPercent = lid / uniforms.numLines * 15;
    float3 rgb = hsv2rgb((value + 100.0) / 200.0 * 300.0 / 360.0, 0.7, 1.0);
    if((xPercent > elapsed && xPercent < elapsed + 2)
    || (xPercent > elapsed - 8 && xPercent < elapsed - 2))
    {
      rgb += 0.4;
    }
    varying.color = float4(rgb, 1.0);
  }
  else
  {
    varying.color = float4(hsv2rgb((value + 100.0) / 200.0 * 300.0 / 360.0, 0.6, 0.8), 1.0);
  }

  return varying;
}

vertex Varying vertex_ground(device packed_float3 *positions [[buffer(0)]],
                             constant VertexUniform &uniforms [[buffer(1)]],
                             uint vid [[vertex_id]])
{
  Varying varying;
  varying.position = uniforms.mvpMatrix * float4(positions[vid], 1.0);
  varying.color = float4(0.8, 0.8, 0.8, 1.0);

  return varying;
}

fragment float4 fragment_main(Varying varying [[stage_in]])
{
  return varying.color;
}

#define MAX_THREAD_NUM 512

struct BitonicSortUniform
{
  uint length;
  uint mLength;
};

kernel void bitonicSort(device float *inout [[buffer(0)]],
                        constant BitonicSortUniform &uniforms [[buffer(1)]],
                        uint id [[thread_position_in_grid]])
{
  float tmp;

  uint ixj = id ^ uniforms.mLength;
  if (ixj > id)
  {
    if ((id & uniforms.length) == 0)
    {
      if (inout[id] > inout[ixj])
      {
        tmp = inout[id];
        inout[id] = inout[ixj];
        inout[ixj] = tmp;
      }
    }
    else
    {
      if (inout[id] < inout[ixj])
      {
        tmp = inout[id];
        inout[id] = inout[ixj];
        inout[ixj] = tmp;
      }
    }
  }
}