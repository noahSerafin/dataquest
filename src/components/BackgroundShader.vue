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
    uniform float uTime;
    uniform vec2 iResolution;
    uniform vec3 uEdgeColor;
    uniform vec3 uTileColor;

    #define pi  3.14159
    #define tau 6.28318
    #define rot(a) mat2(cos(a), -sin(a), sin(a), cos(a)) // col1a col1b col2a col2b

    // random2 function by Patricio Gonzalez
    vec2 random2( vec2 p ) {
        return fract(sin(vec2(dot(p,vec2(127.1,311.7)),dot(p,vec2(269.5,183.3))))*43758.5453);
    }

    const float timeDiv = 1.5;

    vec2 voronoi(vec2 uv) 
    {
        vec2 cell = floor(uv);
        vec2 frac = fract(uv);
        float d1 = 100.;
        float d2 = 100.;
        
        float change = uProgress;
        
        for (int i = -1; i <= 1; i++) {
            for (int j = -1; j <=1; j++) {
                vec2 neighbor = vec2(float(i), float(j));
                vec2 rand = random2(cell + neighbor);
                rand = 0.5 + 0.5 * sin(change * 4. + 2. * pi * rand);
                vec2 toCenter = neighbor + rand - frac;
                float d = max(abs(toCenter.x), abs(toCenter.y));
                
                if (d < d1) {
                    d2 = d1;
                    d1 = d;
                } else if (d < d2) {
                    d2 = d;
                }
            }
        }
        
        return vec2(d1, d2);
    }

    // variant of iq's gradient function for even-thickness lines
    vec2 gradient(in vec2 x, float thickness)
    {
        vec2 h = vec2(thickness, 0.);
        return vec2(voronoi(x + h.xy).x - voronoi(x - h.xy).x,
                   voronoi(x + h.yx).x - voronoi(x - h.yx).x) / (2. * h.x);
    }

    void mainImage( out vec4 fragColor, in vec2 fragCoord )
    {    
        vec2 uv = fragCoord / iResolution.xy;
        uv.x *= iResolution.x / iResolution.y;
        
        float change = uProgress;
        float colSwitch = sin(change * pi / 2.);
        
        uv -= .5;
        uv *= rot(change * pi / 2.);
        uv += .5;
        
        uv *= 2.85;
        
        vec2 v = voronoi(uv);
        float val = v.x / length(gradient(uv, .02));
        float colVal = pow(val, 1.1) * 1.05;
        
        fragColor.rgb = mix(uTileColor, uEdgeColor, clamp(colVal, 0.0, 1.0));
        
        // Calculate exact cell borders using difference between 1st and 2nd closest centers
        float edgeDist = v.y - v.x;
        // Create a crisp mask for the borders
        float borderMask = smoothstep(0.08, 0.0, edgeDist);
        
        // Create the "Holographic Scanner" sweeping field (animated by time instead of progress)
        float scanField = sin(uv.x * 8.0 + uTime * 3.0) * sin(uv.y * 8.0 - uTime * 2.4);
        
        // Threshold the field to get discrete dashes
        float dashes = smoothstep(0.6, 0.9, scanField);
        
        // Intersect dashes with border mask
        float segments = borderMask * dashes;
        
        // Add the white segments over the existing color
        fragColor.rgb += vec3(1.0) * segments;
        
        fragColor.a = 1.0;
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
      time: gl.getUniformLocation(shaderProgram, 'uTime'),
      resolution: gl.getUniformLocation(shaderProgram, 'iResolution'),
      edgeColor: gl.getUniformLocation(shaderProgram, 'uEdgeColor'),
      tileColor: gl.getUniformLocation(shaderProgram, 'uTileColor'),
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
    gl.uniform1f(programInfo.uniformLocations.time, now * 0.001);
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
