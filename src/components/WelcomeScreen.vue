<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';

const canvasRef = ref<HTMLCanvasElement | null>(null);
let animationFrameId: number;
let gl: WebGLRenderingContext | null = null;
let programInfo: any = null;
let bufferInfo: any = null;
let textureInfo: WebGLTexture | null = null;

onMounted(() => {
  const canvas = canvasRef.value;
  if (!canvas) return;

  gl = canvas.getContext('webgl');
  if (!gl) {
    console.error('WelcomeScreen: WebGL not supported');
    return;
  }
  console.log('WelcomeScreen: WebGL Context initialized');

  // Handle high DPI displays
  const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
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
    uniform vec2 iResolution;
    uniform float iTime;
    uniform sampler2D iChannel0;

    vec2 rand2(vec2 p) {
        vec3 p3 = fract(vec3(p.xyx) * vec3(.1031, .1030, .0973));
        p3 += dot(p3, p3.yzx + 33.33);
        return fract((p3.xx+p3.yz)*p3.zy);
    }

    vec4 text(vec2 fragCoord)
    {
        float blockSize = 32.0;
        vec2 block = floor(fragCoord.xy / blockSize);
        vec2 uv = mod(fragCoord.xy, blockSize) / blockSize;
        
        uv = uv * 0.8 + 0.1; // scale the letters up a bit
        
        // randomize letters
        float timeStep = floor(iTime * 1.0 + block.y * 0.5 - block.x * 0.3); // animate changes
        vec2 rand = rand2(block + timeStep);
        
        float col = floor(rand.x * 37.0);
        float row = floor(rand.y * 12.0);
        
        // Since we unpack with flip_y, 0,0 is at bottom left of the texture.
        vec2 spriteUV = (vec2(col, row) + uv) / vec2(37.0, 12.0);
        
        return texture2D(iChannel0, spriteUV);
    }

    float rain(vec2 fragCoord)
    {
        float blockSize = 32.0;
        fragCoord.x -= mod(fragCoord.x, blockSize);
        fragCoord.y -= mod(fragCoord.y, blockSize); // Snap Y to block grid so brightness is uniform across the icon
        
        float offset = sin(fragCoord.x * 15.0);
        // Halved speed from original shader (*.3+.7) to (*.15+.35)
        float speed = cos(fragCoord.x * 3.0) * 0.15 + 0.25; 
       
        float y = fract(fragCoord.y / iResolution.y + iTime * speed + offset);
        
        // Define how long the tail is (0.0 to 1.0). 
        // Subtracting the baseline intensity at 'tailLength' ensures it hits 0.0 
        // exactly at that length, making everything below the strand completely black.
        float tailLength = 0.8;
        float intensity = (1.0 / (y * 20.0)) - (1.0 / (tailLength * 20.0));
        
        return max(0.0, intensity);
    }

    void main()
    {
        vec2 fragCoord = gl_FragCoord.xy;
        float r = rain(fragCoord);
        vec4 tex = text(fragCoord);
        
        // Multiply color by rain intensity
        vec3 finalColor = tex.rgb * clamp(r, 0.0, 1.5);
        
        gl_FragColor = vec4(finalColor, 1.0);
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
      resolution: gl.getUniformLocation(shaderProgram, 'iResolution'),
      time: gl.getUniformLocation(shaderProgram, 'iTime'),
      channel0: gl.getUniformLocation(shaderProgram, 'iChannel0'),
    },
  };

  // Load texture using Vite's BASE_URL to handle GitHub Pages subpaths correctly
  textureInfo = loadTexture(gl, import.meta.env.BASE_URL + 'iconsCropped.jpg');

  // Create a buffer for the square's positions.
  const positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

  // A full-screen quad
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

  const render = (now: number) => {
    if (!gl || !programInfo) return;

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

    gl.uniform1f(programInfo.uniformLocations.time, now / 1000.0);
    gl.uniform2f(programInfo.uniformLocations.resolution, canvas.width, canvas.height);
    
    // Bind texture
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, textureInfo);
    gl.uniform1i(programInfo.uniformLocations.channel0, 0);

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

    animationFrameId = requestAnimationFrame(render);
  };

  animationFrameId = requestAnimationFrame(render);
});

onBeforeUnmount(() => {
  cancelAnimationFrame(animationFrameId);
  window.removeEventListener('resize', () => {}); 
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

function loadTexture(gl: WebGLRenderingContext, url: string) {
  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);

  // Single pixel placeholder (Black)
  const level = 0;
  const internalFormat = gl.RGBA;
  const width = 1;
  const height = 1;
  const border = 0;
  const srcFormat = gl.RGBA;
  const srcType = gl.UNSIGNED_BYTE;
  const pixel = new Uint8Array([0, 0, 0, 255]); // Opaque Black
  gl.texImage2D(gl.TEXTURE_2D, level, internalFormat, width, height, border, srcFormat, srcType, pixel);

  const image = new Image();
  
  image.onload = function() {
    console.log('WelcomeScreen: Texture loaded successfully');
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, level, internalFormat, srcFormat, srcType, image);

    function isPowerOf2(value: number) {
      return (value & (value - 1)) == 0;
    }

    if (isPowerOf2(image.width) && isPowerOf2(image.height)) {
       gl.generateMipmap(gl.TEXTURE_2D);
    } else {
       gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
       gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
       gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    }
  };
  
  image.onerror = function(err) {
    console.error('WelcomeScreen: Failed to load texture at', url, err);
  };
  
  image.src = url;

  return texture;
}
</script>

<template>
  <div class="welcome-screen">
    <canvas ref="canvasRef" class="bg-shader-canvas"></canvas>
    
    <!-- This slot allows adding UI overlay elements like title/buttons -->
    <div class="overlay-content">
      <slot></slot>
    </div>
  </div>
</template>

<style scoped>
.welcome-screen {
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
}

.bg-shader-canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  pointer-events: none;
}

.overlay-content {
  position: relative;
  z-index: 1;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
</style>
