#include <metal_stdlib>

using namespace metal;

#define MAX_THREAD_NUM 512

struct BitonicSortUniform
{
  uint length;
  uint mLength;
};

kernel void bitonicSort_phase1(device float *inout [[buffer(0)]],
                               uint threads [[threads_per_threadgroup]],
                               uint tid [[thread_position_in_threadgroup]],
                               uint gid [[threadgroup_position_in_grid]],
                               uint id [[thread_position_in_grid]])
{
  threadgroup float shared[MAX_THREAD_NUM];
  shared[tid] = inout[id];
  threadgroup_barrier(mem_flags::mem_threadgroup);

  uint offset = gid * threads;

  float tmp;
  for (uint k = 2; k <= threads; k <<= 1)
  {
    for (uint j = k >> 1; j > 0; j >>= 1)
    {
      uint ixj = (id ^ j) - offset;
      if (ixj > tid)
      {
        if ((id & k) == 0)
        {
          if (shared[tid] > shared[ixj])
          {
            tmp = shared[tid];
            shared[tid] = shared[ixj];
            shared[ixj] = tmp;
          }
        }
        else
        {
          if (shared[tid] < shared[ixj])
          {
            tmp = shared[tid];
            shared[tid] = shared[ixj];
            shared[ixj] = tmp;
          }
        }
      }
      threadgroup_barrier(mem_flags::mem_threadgroup);
    }
  }

  inout[id] = shared[tid];
}

kernel void bitonicSort_phase2(device float *inout [[buffer(0)]],
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