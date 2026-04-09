/**
 * WebGL 涟漪折射系统 v1.1
 * 
 * 核心原理：
 * 1. html2canvas 截取页面内容 → 生成纹理
 * 2. WebGL Shader 计算波形高度（基于距离和相位）
 * 3. Fragment Shader 根据波形偏移纹理坐标：
 *    - 波峰：采样更外的像素（内容向外扩散）
 *    - 波谷：采样更内的像素（内容向内收缩）
 * 4. GPU 并行渲染 → 高性能涟漪折射效果
 * 
 * v1.1 修复：
 * - 使用 getComputedStyle 读取 clip-path
 * - 添加 html2canvas 加载检查
 * - 修复 Shader 编译失败后资源泄漏
 * - 排除涟漪 Canvas 避免递归捕获
 * - 分离动画 ID 避免双 Canvas 冲突
 */

function initWebGLRipple() {
  // 触屏设备不启用
  if ('ontouchstart' in window) return;
  
  // ========== Bug Fix: html2canvas 加载检查 ==========
  if (typeof html2canvas === 'undefined') {
    console.warn('html2canvas 未加载，涟漪系统禁用');
    return;
  }
  
  // ========== 配置参数 ==========
  const config = {
    maxRipples: 3,
    maxRadius: 400,
    expandSpeed: 3,
    waveSpeed: 0.5,
    frequency: 0.025,
    maxDisplacement: 25,
    fadeStart: 0.6
  };
  
  // ========== Shader 源码 ==========
  
  const vertexShaderSource = `
    attribute vec2 a_position;
    attribute vec2 a_texCoord;
    
    varying vec2 v_texCoord;
    
    void main() {
      gl_Position = vec4(a_position, 0.0, 1.0);
      v_texCoord = a_texCoord;
    }
  `;
  
  const fragmentShaderSource = `
    precision mediump float;
    
    varying vec2 v_texCoord;
    
    uniform sampler2D u_background;
    uniform vec2 u_resolution;
    uniform vec2 u_rippleCenters[3];
    uniform float u_rippleRadii[3];
    uniform float u_ripplePhases[3];
    uniform float u_rippleOpacities[3];
    uniform int u_rippleCount;
    uniform float u_frequency;
    uniform float u_maxDisplacement;
    
    void main() {
      vec2 screenPos = v_texCoord * u_resolution;
      
      vec4 color = vec4(0.0, 0.0, 0.0, 0.0);
      float totalWeight = 0.0;
      
      for (int i = 0; i < 3; i++) {
        if (i >= u_rippleCount) break;
        
        vec2 center = u_rippleCenters[i];
        float radius = u_rippleRadii[i];
        float phase = u_ripplePhases[i];
        float opacity = u_rippleOpacities[i];
        
        vec2 delta = screenPos - center;
        float distance = length(delta);
        
        if (distance > radius) continue;
        
        float waveHeight = sin(distance * u_frequency - phase);
        
        float progress = distance / radius;
        float decay = 1.0 - progress * progress;
        
        vec2 direction = delta / max(distance, 1.0);
        float displacement = waveHeight * decay * u_maxDisplacement * opacity;
        vec2 offset = direction * displacement / u_resolution;
        
        vec2 distortedUV = v_texCoord + offset;
        distortedUV = clamp(distortedUV, 0.0, 1.0);
        
        vec4 distortedColor = texture2D(u_background, distortedUV);
        
        float blendWeight = opacity * decay;
        color = mix(color, distortedColor, blendWeight / max(totalWeight + blendWeight, 0.001));
        totalWeight += blendWeight;
      }
      
      if (totalWeight > 0.01) {
        color.a = 1.0;
      }
      
      gl_FragColor = color;
    }
  `;
  
  // ========== WebGL 初始化 ==========
  
  const surfaceCanvas = document.createElement('canvas');
  const behindCanvas = document.createElement('canvas');
  
  const canvasStyle = `
    position: fixed;
    top: 0; left: 0;
    width: 100%; height: 100%;
    pointer-events: none;
    opacity: 0;
    transition: opacity 0.15s ease-out;
  `;
  
  surfaceCanvas.id = 'ripple-webgl-surface';
  surfaceCanvas.style.cssText = canvasStyle + 'z-index: 100;';
  
  behindCanvas.id = 'ripple-webgl-behind';
  behindCanvas.style.cssText = canvasStyle + 'z-index: 3;';
  
  document.body.appendChild(surfaceCanvas);
  document.body.appendChild(behindCanvas);
  
  // 获取 WebGL Context
  const surfaceGL = surfaceCanvas.getContext('webgl', { 
    alpha: true, 
    premultipliedAlpha: false 
  });
  const behindGL = behindCanvas.getContext('webgl', { 
    alpha: true, 
    premultipliedAlpha: false 
  });
  
  // ========== Bug Fix: WebGL 不支持时清理 Canvas ==========
  if (!surfaceGL || !behindGL) {
    console.warn('WebGL 不支持，涟漪系统禁用');
    surfaceCanvas.remove();
    behindCanvas.remove();
    return;
  }
  
  // ========== Canvas 尺寸管理 ==========
  
  let canvasWidth = window.innerWidth;
  let canvasHeight = window.innerHeight;
  let dpr = Math.min(window.devicePixelRatio || 1, 2);
  
  // 节流 resize
  let resizeTimeout = null;
  const resizeCanvases = () => {
    canvasWidth = window.innerWidth;
    canvasHeight = window.innerHeight;
    
    [surfaceCanvas, behindCanvas].forEach(canvas => {
      canvas.width = canvasWidth * dpr;
      canvas.height = canvasHeight * dpr;
      canvas.style.width = `${canvasWidth}px`;
      canvas.style.height = `${canvasHeight}px`;
    });
    
    surfaceGL.viewport(0, 0, surfaceCanvas.width, surfaceCanvas.height);
    behindGL.viewport(0, 0, behindCanvas.width, behindCanvas.height);
  };
  
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(resizeCanvases, 100);
  });
  
  resizeCanvases();
  
  // ========== Shader 编译 ==========
  
  function createShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error('Shader 编译错误:', gl.getShaderInfoLog(shader));
      gl.deleteShader(shader);
      return null;
    }
    
    return shader;
  }
  
  // ========== Bug Fix: Shader 编译失败后清理资源 ==========
  function createProgram(gl, vertexShader, fragmentShader) {
    if (!vertexShader || !fragmentShader) {
      if (vertexShader) gl.deleteShader(vertexShader);
      if (fragmentShader) gl.deleteShader(fragmentShader);
      return null;
    }
    
    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('Program 链接错误:', gl.getProgramInfoLog(program));
      gl.deleteProgram(program);
      gl.deleteShader(vertexShader);
      gl.deleteShader(fragmentShader);
      return null;
    }
    
    return program;
  }
  
  const surfaceVS = createShader(surfaceGL, surfaceGL.VERTEX_SHADER, vertexShaderSource);
  const surfaceFS = createShader(surfaceGL, surfaceGL.FRAGMENT_SHADER, fragmentShaderSource);
  const surfaceProgram = createProgram(surfaceGL, surfaceVS, surfaceFS);
  
  const behindVS = createShader(behindGL, behindGL.VERTEX_SHADER, vertexShaderSource);
  const behindFS = createShader(behindGL, behindGL.FRAGMENT_SHADER, fragmentShaderSource);
  const behindProgram = createProgram(behindGL, behindVS, behindFS);
  
  if (!surfaceProgram || !behindProgram) {
    console.error('WebGL Program 创建失败');
    surfaceCanvas.remove();
    behindCanvas.remove();
    return;
  }
  
  // ========== 全屏 Quad 几何数据 ==========
  
  const positions = new Float32Array([
    -1, -1,
     1, -1,
    -1,  1,
     1,  1
  ]);
  
  const texCoords = new Float32Array([
    0, 0,
    1, 0,
    0, 1,
    1, 1
  ]);
  
  function setupBuffers(gl, program) {
    gl.useProgram(program);
    
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
    
    const positionLoc = gl.getAttribLocation(program, 'a_position');
    gl.enableVertexAttribArray(positionLoc);
    gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, 0, 0);
    
    const texCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, texCoords, gl.STATIC_DRAW);
    
    const texCoordLoc = gl.getAttribLocation(program, 'a_texCoord');
    gl.enableVertexAttribArray(texCoordLoc);
    gl.vertexAttribPointer(texCoordLoc, 2, gl.FLOAT, false, 0, 0);
  }
  
  setupBuffers(surfaceGL, surfaceProgram);
  setupBuffers(behindGL, behindProgram);
  
  // ========== Uniform 变量管理 ==========
  
  function getUniformLocations(gl, program) {
    const rippleCenters = [];
    const rippleRadii = [];
    const ripplePhases = [];
    const rippleOpacities = [];
    
    for (let i = 0; i < 3; i++) {
      rippleCenters.push(gl.getUniformLocation(program, `u_rippleCenters[${i}]`));
      rippleRadii.push(gl.getUniformLocation(program, `u_rippleRadii[${i}]`));
      ripplePhases.push(gl.getUniformLocation(program, `u_ripplePhases[${i}]`));
      rippleOpacities.push(gl.getUniformLocation(program, `u_rippleOpacities[${i}]`));
    }
    
    return {
      background: gl.getUniformLocation(program, 'u_background'),
      resolution: gl.getUniformLocation(program, 'u_resolution'),
      rippleCenters,
      rippleRadii,
      ripplePhases,
      rippleOpacities,
      rippleCount: gl.getUniformLocation(program, 'u_rippleCount'),
      frequency: gl.getUniformLocation(program, 'u_frequency'),
      maxDisplacement: gl.getUniformLocation(program, 'u_maxDisplacement')
    };
  }
  
  const surfaceUniforms = getUniformLocations(surfaceGL, surfaceProgram);
  const behindUniforms = getUniformLocations(behindGL, behindProgram);
  
  // ========== 纹理管理 ==========
  
  let surfaceTexture = createTexture(surfaceGL);
  let behindTexture = createTexture(behindGL);
  
  function createTexture(gl) {
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    return texture;
  }
  
  // ========== 涟漪管理 ==========
  
  const ripples = [];
  
  class Ripple {
    constructor(x, y) {
      this.x = x;
      this.y = y;
      this.radius = 0;
      this.phase = 0;
      this.maxRadius = config.maxRadius;
      this.opacity = 1;
      this.alive = true;
    }
    
    update(deltaTime = 1) {
      this.radius += config.expandSpeed * deltaTime;
      this.phase += config.waveSpeed * deltaTime;
      
      const progress = this.radius / this.maxRadius;
      if (progress > config.fadeStart) {
        const fadeProgress = (progress - config.fadeStart) / (1 - config.fadeStart);
        this.opacity = Math.max(0, 1 - fadeProgress * fadeProgress);
      }
      
      if (this.radius >= this.maxRadius) {
        this.alive = false;
      }
    }
  }
  
  // ========== 渲染函数 ==========
  
  function render(gl, program, uniforms, texture) {
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    
    gl.useProgram(program);
    
    gl.uniform2f(uniforms.resolution, canvasWidth * dpr, canvasHeight * dpr);
    gl.uniform1i(uniforms.rippleCount, ripples.length);
    gl.uniform1f(uniforms.frequency, config.frequency);
    gl.uniform1f(uniforms.maxDisplacement, config.maxDisplacement);
    
    ripples.forEach((ripple, i) => {
      gl.uniform2f(uniforms.rippleCenters[i], ripple.x * dpr, ripple.y * dpr);
      gl.uniform1f(uniforms.rippleRadii[i], ripple.radius * dpr);
      gl.uniform1f(uniforms.ripplePhases[i], ripple.phase);
      gl.uniform1f(uniforms.rippleOpacities[i], ripple.opacity);
    });
    
    // 清除未使用的 uniform
    for (let i = ripples.length; i < 3; i++) {
      gl.uniform1f(uniforms.rippleOpacities[i], 0);
    }
    
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.uniform1i(uniforms.background, 0);
    
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }
  
  // ========== Bug Fix: 分离动画 ID ==========
  
  let surfaceAnimationId = null;
  let behindAnimationId = null;
  let lastTime = performance.now();
  
  // ========== Bug Fix: 纹理捕获排除涟漪 Canvas ==========
  
  async function captureTexture(isBehind = false) {
    const element = isBehind 
      ? document.querySelector('.behind-world') 
      : document.querySelector('.surface-world');
    
    if (!element) return null;
    
    try {
      const captureCanvas = await html2canvas(element, {
        scale: dpr,
        useCORS: true,
        allowTaint: true,
        backgroundColor: null,
        // Bug Fix: 排除涟漪 Canvas 避免递归捕获
        ignoreElements: (el) => {
          return el.id === 'ripple-webgl-surface' || el.id === 'ripple-webgl-behind';
        }
      });
      
      return captureCanvas;
    } catch (e) {
      console.error('纹理捕获失败:', e);
      return null;
    }
  }
  
  async function updateTexture(gl, texture, isBehind = false) {
    const captureCanvas = await captureTexture(isBehind);
    
    if (!captureCanvas) return false;
    
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, captureCanvas);
    
    return true;
  }
  
  // ========== Bug Fix: 使用 getComputedStyle 读取 clip-path ==========
  
  const createRipple = async (x, y) => {
    if (ripples.length >= config.maxRipples) {
      ripples.shift();
    }
    
    // Bug Fix: 使用 getComputedStyle 读取 CSS 定义的 clip-path
    const behindWorld = document.querySelector('.behind-world');
    let isBehindVisible = false;
    
    if (behindWorld) {
      const computedStyle = window.getComputedStyle(behindWorld);
      const clipPath = computedStyle.clipPath || computedStyle.getPropertyValue('clip-path') || '';
      
      // 支持 px 和 % 两种格式
      const pxMatch = clipPath.match(/circle\((\d+(?:\.\d+)?)px/);
      const percentMatch = clipPath.match(/circle\((\d+(?:\.\d+)?)%/);
      
      let portalRadius = 0;
      if (pxMatch) {
        portalRadius = parseFloat(pxMatch[1]);
      } else if (percentMatch) {
        const percent = parseFloat(percentMatch[1]);
        portalRadius = Math.min(canvasWidth, canvasHeight) * percent / 100;
      }
      
      isBehindVisible = portalRadius > 0;
    }
    
    // 确定要渲染的 Canvas 和 GL Context
    const targetCanvas = isBehindVisible ? behindCanvas : surfaceCanvas;
    const targetGL = isBehindVisible ? behindGL : surfaceGL;
    const targetTexture = isBehindVisible ? behindTexture : surfaceTexture;
    const targetProgram = isBehindVisible ? behindProgram : surfaceProgram;
    const targetUniforms = isBehindVisible ? behindUniforms : surfaceUniforms;
    
    // 捕获纹理
    const success = await updateTexture(targetGL, targetTexture, isBehindVisible);
    
    if (!success) {
      console.warn('纹理捕获失败，涟漪取消');
      return;
    }
    
    // 创建涟漪
    ripples.push(new Ripple(x, y));
    
    // 显示 Canvas
    targetCanvas.style.opacity = '1';
    
    // Bug Fix: 使用对应的动画 ID
    const animationIdRef = isBehindVisible ? 'behindAnimationId' : 'surfaceAnimationId';
    const currentAnimationId = isBehindVisible ? behindAnimationId : surfaceAnimationId;
    
    if (!currentAnimationId) {
      lastTime = performance.now();
      startAnimation(targetGL, targetProgram, targetUniforms, targetTexture, targetCanvas, isBehindVisible);
    }
  };
  
  // Bug Fix: 传入 isBehind 参数区分动画
  const startAnimation = (gl, program, uniforms, texture, canvas, isBehind) => {
    const animateLoop = () => {
      const now = performance.now();
      const deltaTime = Math.min((now - lastTime) / 16.67, 3);
      lastTime = now;
      
      ripples.forEach(ripple => ripple.update(deltaTime));
      
      for (let i = ripples.length - 1; i >= 0; i--) {
        if (!ripples[i].alive) ripples.splice(i, 1);
      }
      
      if (ripples.length > 0) {
        render(gl, program, uniforms, texture);
        if (parseFloat(canvas.style.opacity) < 1) {
          canvas.style.opacity = '1';
        }
        const animationId = requestAnimationFrame(animateLoop);
        if (isBehind) {
          behindAnimationId = animationId;
        } else {
          surfaceAnimationId = animationId;
        }
      } else {
        canvas.style.opacity = '0';
        if (isBehind) {
          behindAnimationId = null;
        } else {
          surfaceAnimationId = null;
        }
      }
    };
    
    animateLoop();
  };
  
  // ========== 点击监听（添加防抖） ==========
  
  let isCapturing = false;
  
  document.addEventListener('click', async (e) => {
    if (e.target.closest('a, button, input, textarea, [role="button"], select, [contenteditable], .nav-toggle')) return;
    
    // Bug Fix: 防止连续点击导致多次纹理捕获
    if (isCapturing) return;
    
    isCapturing = true;
    try {
      await createRipple(e.clientX, e.clientY);
    } finally {
      isCapturing = false;
    }
  });
  
  console.log('WebGL 涟漪折射系统 v1.1 已初始化');
  
  // ========== 暴露调试接口 ==========
  
  window.debugRipple = {
    config,
    ripples,
    createRipple,
    surfaceCanvas,
    behindCanvas,
    // 暴露版本信息
    version: '1.1'
  };
}