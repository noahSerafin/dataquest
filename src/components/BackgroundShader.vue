<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';

const props = defineProps<{ 
  progress: number,
  edgeColor: string,
  tileColor: string
}>();

function parseRGB(colorStr: string): [number, number, number] {
  if (!colorStr) return [0, 0, 0];
  const match = colorStr.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
  if (match) {
    return [
      parseInt(match[1], 10) / 255,
      parseInt(match[2], 10) / 255,
      parseInt(match[3], 10) / 255
    ];
  }
  return [0, 0, 0];
}

const canvasRef = ref<HTMLCanvasElement | null>(null);
let animationFrameId: number;
let gl: WebGLRenderingContext | null = null;
let programInfo: any = null;
let bufferInfo: any = null;

onMounted(() => {
  const canvas = canvasRef.value;
  if (!canvas) return;

  gl = canvas.getContext('webgl');
  if (!gl) {
    console.error('WebGL not supported');
    return;
  }

  // Handle high DPI displays
  const dpr = window.devicePixelRatio || 1;
  const resizeCanvas = () => {
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    gl?.viewport(0, 0, canvas.width, canvas.height);
  };
  
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  // Vertex shader
  const vsSource = `
    attribute vec4 aVertexPosition;
    void main() {
      gl_Position = aVertexPosition;
    }
  `;

  // Fragment shader
  const fsSource = `
    precision highp float;
    uniform float uProgress;
    uniform vec2 iResolution;
    uniform vec3 uEdgeColor;
    uniform vec3 uTileColor;
    uniform float iTime;

    #define PI 3.14159265359

    vec2 rotate(vec2 p, float a)
    {
        return vec2(p.x * cos(a) - p.y * sin(a), p.x * sin(a) + p.y * cos(a));
    }

    float rand(float n)
    {
        return fract(sin(n) * 43758.5453123);
    }
    float rand(vec2 n)
    {
        return fract(sin(dot(n, vec2(591.32,391.32))));
    }
    float rand(vec3 n)
    {
        return fract(sin(dot(n, vec3(591.32,391.32,623.54))));
    }

    vec2 rand2(in vec2 p)
    {
        return fract(vec2(sin(p.x * 591.32 + p.y * 154.077), cos(p.x * 391.32 + p.y * 49.077)));
    }

    const float voronoiRandK = 0.8;

    vec3 voronoi3(in vec2 x, out vec4 cellCenters)
    {
        vec2 p = floor(x);
        vec2 f = fract(x);

        vec2 i1 = vec2(0.0);
        vec2 i2 = vec2(0.0);
        vec3 res = vec3(8.0);
        for(int j = -1; j <= 1; j ++)
        {
            for(int i = -1; i <= 1; i ++)
            {
                vec2 b = vec2(i, j);
                vec2 r = vec2(b) - f + rand2(p + b) * voronoiRandK;

                float d = (abs(r.x) + abs(r.y));

                if (d < res.x)
                {
                    res.z = res.y;
                    res.y = res.x;
                    res.x = d;
                    i2 = i1;
                    i1 = p + b;
                }
                else if (d < res.y)
                {
                    res.z = res.y;
                    res.y = d;
                    i2 = p + b;
                }
                else if (d < res.z)
                {
                    res.z = d;
                }
            }
        }
        cellCenters = vec4(i1,i2);
        return res;
    }

    float cubicPulse( float c, float w, float x )
    {
        x = abs(x - c);
        if( x>w ) return 0.0;
        x /= w;
        return 1.0 - x*x*(3.0-2.0*x);
    }

    void mainImage( out vec4 fragColor, in vec2 fragCoord )
    {
        vec2 uv = (fragCoord / iResolution.xy - 0.5) * 2.0;
        vec2 suv = uv;
        uv.x *= iResolution.x / iResolution.y;

        // Camera movement removed per user request:
        // uv = rotate(uv, sin(iTime * 0.10));
        // uv.x += iTime * 0.3;

        //  first wire
        float scale = 4.;
        float width = 0.6;
        vec4 cellCenters;
        vec3 vr = voronoi3(uv * scale + 10.0, cellCenters);
        float d = vr.y - vr.x;
        if (vr.z - vr.y < width && vr.y - vr.x < width)    //connections between cell corners
            d = max(width - (vr.z - vr.y), d);
        vec2 cellHashes = vec2(rand(cellCenters.xy), rand(cellCenters.zw));
        float wire = cubicPulse(width, 0.06, d);

        //  light
        float lightX = (rotate(uv, PI/8.).x+iTime*0.5)*5.;
        float lightHash1 = rand(floor(lightX));
        float lightValue1 = fract(lightX);
        lightX = (rotate(uv, PI*5./8.).x+iTime*0.2)*5.;
        float lightHash2 = rand(floor(lightX)+0.5);
        float lightValue2 = fract(lightX);
        lightX = (rotate(uv, PI*9./8.).x+iTime*0.2)*5.;
        float lightHash3 = rand(floor(lightX)+0.5);
        float lightValue3 = fract(lightX);
        lightX = (rotate(uv, PI*13./8.).x+iTime*0.2)*5.;
        float lightHash4 = rand(floor(lightX)+0.5);
        float lightValue4 = fract(lightX);
        float light = 0.;
        float lightFrequency = 0.002;
        if (rand(vec3(cellHashes.xy,lightHash1)) < lightFrequency)  light =  wire*cubicPulse(0.5,0.25,lightValue1)*3.;
        if (rand(vec3(cellHashes.xy,lightHash2)) < lightFrequency)  light += wire*cubicPulse(0.5,0.25,lightValue2)*3.;
        if (rand(vec3(cellHashes.xy,lightHash3)) < lightFrequency)  light += wire*cubicPulse(0.5,0.25,lightValue3)*3.;
        if (rand(vec3(cellHashes.xy,lightHash4)) < lightFrequency)  light += wire*cubicPulse(0.5,0.25,lightValue4)*3.;

        //  second parallel wire
        if ((cellHashes.x - cellHashes.y) > 0.0)  {
            float w = cubicPulse(width-0.1, 0.06, d);
            wire += w;
        }

        //  background wire layer
        scale *= 0.4;
        vec3 vr2 = voronoi3(uv * scale + 30.0, cellCenters);
        d = vr2.y - vr2.x;
        if (vr2.z - vr2.y < width && vr2.y - vr2.x < width)    //connections between cell corners
            d = max(width - (vr2.z - vr2.y), d);
        cellHashes = vec2(rand(cellCenters.xy), rand(cellCenters.zw));
        float backWire = cubicPulse(width, 0.06, d);
        if ((cellHashes.x - cellHashes.y) > 0.0)  {
            float w = cubicPulse(width-0.1, 0.06, d);
            backWire += w;
        }
        wire = max(wire, backWire * 0.3);

        //  some background noise
        wire += vr.x*0.3 + 0.3;

        //  apply light and use uEdgeColor/uTileColor to keep color-changing logic
        wire = wire * 0.4 + light;
        vec3 col = mix(uTileColor, uEdgeColor, clamp(wire, 0.0, 1.0));
        col *= 0.7; // keeping original darken factor from new shader

        fragColor = vec4(col, 1.0);
    }

    void main() {
        mainImage(gl_FragColor, gl_FragCoord.xy);
    }
  `;

  const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
  const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);

  if (!vertexShader || !fragmentShader) return;

  const shaderProgram = gl.createProgram();
  if (!shaderProgram) return;

  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram);

  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    console.error('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));
    return;
  }

  programInfo = {
    program: shaderProgram,
    attribLocations: {
      vertexPosition: gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
    },
    uniformLocations: {
      progress: gl.getUniformLocation(shaderProgram, 'uProgress'),
      resolution: gl.getUniformLocation(shaderProgram, 'iResolution'),
      edgeColor: gl.getUniformLocation(shaderProgram, 'uEdgeColor'),
      tileColor: gl.getUniformLocation(shaderProgram, 'uTileColor'),
      time: gl.getUniformLocation(shaderProgram, 'iTime'),
    },
  };

  // Create a buffer for the square's positions.
  const positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

  // A full-screen quad (two triangles forming a rectangle from -1 to +1)
  const positions = [
    -1.0,  1.0,
     1.0,  1.0,
    -1.0, -1.0,
     1.0, -1.0,
  ];

  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

  bufferInfo = {
    position: positionBuffer,
  };

  let currentProgress = 0;

  const render = (now: number) => {
    if (!gl || !programInfo) return;

    currentProgress += (props.progress - currentProgress) * 0.05;

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.bindBuffer(gl.ARRAY_BUFFER, bufferInfo.position);
    gl.vertexAttribPointer(
      programInfo.attribLocations.vertexPosition,
      2, // numComponents
      gl.FLOAT, // type
      false, // normalize
      0, // stride
      0 // offset
    );
    gl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition);

    gl.useProgram(programInfo.program);

    gl.uniform1f(programInfo.uniformLocations.progress, currentProgress);
    gl.uniform1f(programInfo.uniformLocations.time, now / 1000.0);
    gl.uniform2f(programInfo.uniformLocations.resolution, canvas.width, canvas.height);
    
    const parsedEdge = parseRGB(props.edgeColor);
    const parsedTile = parseRGB(props.tileColor);
    gl.uniform3fv(programInfo.uniformLocations.edgeColor, parsedEdge);
    gl.uniform3fv(programInfo.uniformLocations.tileColor, parsedTile);

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

    animationFrameId = requestAnimationFrame(render);
  };

  animationFrameId = requestAnimationFrame(render);
});

onBeforeUnmount(() => {
  cancelAnimationFrame(animationFrameId);
  window.removeEventListener('resize', () => {}); // A bit sloppy, but ok for now
});

function loadShader(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);
  if (!shader) return null;

  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }

  return shader;
}
</script>

<template>
  <canvas ref="canvasRef" class="bg-shader-canvas"></canvas>
</template>

<style scoped>
.bg-shader-canvas {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: -1;
  pointer-events: none;
}
</style>
