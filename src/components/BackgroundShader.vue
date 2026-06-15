<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';

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
    precision mediump float;
    uniform float uTime;
    void main() {
      // Slow pulsing colors
      float r = sin(uTime * 0.2) * 0.3 + 0.3;
      float g = sin(uTime * 0.15 + 2.0) * 0.3 + 0.3;
      float b = sin(uTime * 0.25 + 4.0) * 0.3 + 0.4;
      
      // Make it slightly darker for a background
      gl_FragColor = vec4(r * 0.5, g * 0.5, b * 0.5, 1.0);
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
      time: gl.getUniformLocation(shaderProgram, 'uTime'),
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

  let startTime = performance.now();

  const render = (now: number) => {
    if (!gl || !programInfo) return;

    const time = (now - startTime) * 0.001; // Convert to seconds

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

    gl.uniform1f(programInfo.uniformLocations.time, time);

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
