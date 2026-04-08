/**
 * WebGL 涟漪折射系统 v1.0
 * 
 * 核心原理：
 * 1. html2canvas 截取页面内容 → 生成纹理
 * 2. WebGL Shader 计算波形高度（基于距离和相位）
 * 3. Fragment Shader 根据波形偏移纹理坐标：
 *    - 波峰：采样更外的像素（内容向外扩散）
 *    - 波谷：采样更内的像素（内容向内收缩）
 * 4. GPU 并行渲染 → 高性能涟漪折射效果
 */

function initWebGLRipple() {
  // 触屏设备不启用
  if ('ontouchstart' in window) return;
  
  // ========== 配置参数 ==========
  const config = {
    maxRipples: 3,
    maxRadius: 350,
    expandSpeed: 2.5,
    waveSpeed: 0.4,
    frequency: 0.03,
    maxDisplacement: 8,
    fadeStart: 0.5
  };
  
  // ========== Shader 源码 ==========
  
  // Vertex Shader - 全屏 Quad
  const vertexShaderSource = `
    attribute vec2 a_position;
    attribute vec2 a_texCoord;
    
    varying vec2 v_texCoord;
    
    void main() {
      gl_Position = vec4(a_position, 0.0, 1.0);
      v_texCoord = a_texCoord;
    }
  `;
  
  // Fragment Shader - 涟漪折射（涟漪区域外透明）
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
      
      // 默认透明（涟漪区域外显示原始 DOM）
      vec4 color = vec4(0.0, 0.0, 0.0, 0.0);
      float totalWeight = 0.0;
      
      // 遍历所有活跃涟漪
      for (int i = 0; i < 3; i++) {
        if (i >= u_rippleCount) break;
        
        vec2 center = u_rippleCenters[i];
        float radius = u_rippleRadii[i];
        float phase = u_ripplePhases[i];
        float opacity = u_rippleOpacities[i];
        
        // 计算到涟漪中心的距离
        vec2 delta = screenPos - center;
        float distance = length(delta);
        
        // 不在涟漪范围内 → 跳过
        if (distance > radius) continue;
        
        // 计算波形高度
        float waveHeight = sin(distance * u_frequency - phase);
        
        // 距离衰减
        float progress = distance / radius;
        float decay = 1.0 - progress * progress;
        
        // 计算折射偏移
        vec2 direction = delta / max(distance, 1.0);  // normalize，避免 distance=0
        float displacement = waveHeight * decay * u_maxDisplacement * opacity;
        vec2 offset = direction * displacement / u_resolution;
        
        // 偏移纹理坐标
        vec2 distortedUV = v_texCoord + offset;
        
        // 边界检查
        distortedUV = clamp(distortedUV, 0.0, 1.0);
        
        // 采样背景纹理
        vec4 distortedColor = texture2D(u_background, distortedUV);
        
        // 混合涟漪效果（多涟漪叠加）
        float blendWeight = opacity * decay;
        color = mix(color, distortedColor, blendWeight / max(totalWeight + blendWeight, 0.001));
        totalWeight += blendWeight;
      }
      
      // 涟漪区域外 alpha = 0（透明），涟漪区域内 alpha = 1
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
    transition: opacity 0.1s ease;
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
  
  if (!surfaceGL || !behindGL) {
    console.warn('WebGL 不支持，涟漪系统禁用');
    return;
  }
  
  // ========== Canvas 尺寸管理 ==========
  
  let canvasWidth = window.innerWidth;
  let canvasHeight = window.innerHeight;
  let dpr = Math.min(window.devicePixelRatio || 1, 2);  // 限制 DPR
  
  const resizeCanvases = () => {
    canvasWidth = window.innerWidth;
    canvasHeight = window.innerHeight;
    
    [surfaceCanvas, behindCanvas].forEach(canvas => {
      canvas.width = canvasWidth * dpr;
      canvas.height = canvasHeight * dpr;
      canvas.style.width = `${canvasWidth}px`;
      canvas.style.height = `${canvasHeight}px`;
    });
    
    // 重新设置 WebGL viewport
    surfaceGL.viewport(0, 0, surfaceCanvas.width, surfaceCanvas.height);
    behindGL.viewport(0, 0, behindCanvas.width, behindCanvas.height);
  };
  
  resizeCanvases();
  window.addEventListener('resize', resizeCanvases);
  
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
  
  function createProgram(gl, vertexShader, fragmentShader) {
    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('Program 链接错误:', gl.getProgramInfoLog(program));
      gl.deleteProgram(program);
      return null;
    }
    
    return program;
  }
  
  // 为两个 GL Context 创建 Program
  const surfaceVS = createShader(surfaceGL, surfaceGL.VERTEX_SHADER, vertexShaderSource);
  const surfaceFS = createShader(surfaceGL, surfaceGL.FRAGMENT_SHADER, fragmentShaderSource);
  const surfaceProgram = createProgram(surfaceGL, surfaceVS, surfaceFS);
  
  const behindVS = createShader(behindGL, behindGL.VERTEX_SHADER, vertexShaderSource);
  const behindFS = createShader(behindGL, behindGL.FRAGMENT_SHADER, fragmentShaderSource);
  const behindProgram = createProgram(behindGL, behindVS, behindFS);
  
  if (!surfaceProgram || !behindProgram) {
    console.error('WebGL Program 创建失败');
    return;
  }
  
  // ========== 全屏 Quad 几何数据 ==========
  
  // 顶点位置（NDC 坐标：-1 到 1）
  const positions = new Float32Array([
    -1, -1,   // 左下
     1, -1,   // 右下
    -1,  1,   // 左上
     1,  1    // 右上
  ]);
  
  // 纹理坐标（0 到 1）
  const texCoords = new Float32Array([
    0, 0,   // 左下
    1, 0,   // 右下
    0, 1,   // 左上
    1, 1    // 右上
  ]);
  
  // 创建 Buffer 并上传数据（为两个 GL Context）
  function setupBuffers(gl, program) {
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
    // 数组 uniform 需逐个获取（如 u_rippleCenters[0], u_rippleCenters[1]）
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
  
  let surfaceTexture = null;
  let behindTexture = null;
  
  function createTexture(gl) {
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    
    // 设置纹理参数
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    
    return texture;
  }
  
  surfaceTexture = createTexture(surfaceGL);
  behindTexture = createTexture(behindGL);
  
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
    // 清空 Canvas（透明背景）
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    
    gl.useProgram(program);
    
    // 设置分辨率 uniform
    gl.uniform2f(uniforms.resolution, canvasWidth * dpr, canvasHeight * dpr);
    
    // 设置涟漪参数 uniform（逐个设置，兼容 WebGL）
    gl.uniform1i(uniforms.rippleCount, ripples.length);
    gl.uniform1f(uniforms.frequency, config.frequency);
    gl.uniform1f(uniforms.maxDisplacement, config.maxDisplacement);
    
    ripples.forEach((ripple, i) => {
      // 逐个设置数组元素（WebGL 不支持 uniform2fv 整体赋值数组）
      gl.uniform2f(uniforms.rippleCenters[i], ripple.x * dpr, ripple.y * dpr);
      gl.uniform1f(uniforms.rippleRadii[i], ripple.radius * dpr);
      gl.uniform1f(uniforms.ripplePhases[i], ripple.phase);
      gl.uniform1f(uniforms.rippleOpacities[i], ripple.opacity);
    });
    
    // 绑定纹理
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.uniform1i(uniforms.background, 0);
    
    // 绘制全屏 Quad
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }
  
  // ========== 动画循环 ==========
  
  let animationId = null;
  let lastTime = performance.now();
  
  const animate = () => {
    const now = performance.now();
    const deltaTime = Math.min((now - lastTime) / 16.67, 3);
    lastTime = now;
    
    // 更新涟漪
    ripples.forEach(ripple => ripple.update(deltaTime));
    
    // 移除死亡的涟漪
    for (let i = ripples.length - 1; i >= 0; i--) {
      if (!ripples[i].alive) ripples.splice(i, 1);
    }
    
    // 渲染
    if (ripples.length > 0) {
      render(surfaceGL, surfaceProgram, surfaceUniforms, surfaceTexture);
      render(behindGL, behindProgram, behindUniforms, behindTexture);
      animationId = requestAnimationFrame(animate);
    } else {
      // 涟漪消失 → 隐藏 Canvas
      surfaceCanvas.style.opacity = '0';
      behindCanvas.style.opacity = '0';
      animationId = null;
    }
  };
  
  // ========== 纹理捕获（html2canvas 集成） ==========
  
  async function captureTexture(isBehind = false) {
    const element = isBehind 
      ? document.querySelector('.behind-world') 
      : document.querySelector('.surface-world');
    
    if (!element) return null;
    
    try {
      // 使用 html2canvas 截取
      const captureCanvas = await html2canvas(element, {
        scale: dpr,
        useCORS: true,
        allowTaint: true,
        backgroundColor: null
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
    gl.texImage2D(
      gl.TEXTURE_2D, 
      0, 
      gl.RGBA, 
      gl.RGBA, 
      gl.UNSIGNED_BYTE, 
      captureCanvas
    );
    
    return true;
  }
  
  // ========== 创建涟漪 ==========
  
  const createRipple = async (x, y) => {
    if (ripples.length >= config.maxRipples) {
      ripples.shift();
    }
    
    // 判断当前可见世界（通过 clip-path 半径判断）
    const behindWorld = document.querySelector('.behind-world');
    const clipPath = behindWorld?.style.clipPath || '';
    const radiusMatch = clipPath.match(/circle\((\d+)px/);
    const portalRadius = radiusMatch ? parseInt(radiusMatch[1]) : 0;
    const isBehindVisible = portalRadius > 0;
    
    // 确定要渲染的 Canvas 和 GL Context
    const targetCanvas = isBehindVisible ? behindCanvas : surfaceCanvas;
    const targetGL = isBehindVisible ? behindGL : surfaceGL;
    const targetTexture = isBehindVisible ? behindTexture : surfaceTexture;
    const targetProgram = isBehindVisible ? behindProgram : surfaceProgram;
    const targetUniforms = isBehindVisible ? behindUniforms : surfaceUniforms;
    
    // 显示 Canvas
    targetCanvas.style.opacity = '1';
    
    // 捕获纹理
    const success = await updateTexture(targetGL, targetTexture, isBehindVisible);
    
    if (!success) {
      console.warn('纹理捕获失败，涟漪取消');
      targetCanvas.style.opacity = '0';
      return;
    }
    
    // 创建涟漪
    ripples.push(new Ripple(x, y));
    
    // 启动动画（使用对应的 GL Context）
    if (!animationId) {
      lastTime = performance.now();
      startAnimation(targetGL, targetProgram, targetUniforms, targetTexture);
    }
  };
  
  // 启动动画（使用指定的 GL Context）
  const startAnimation = (gl, program, uniforms, texture) => {
    const animateLoop = () => {
      const now = performance.now();
      const deltaTime = Math.min((now - lastTime) / 16.67, 3);
      lastTime = now;
      
      // 更新涟漪
      ripples.forEach(ripple => ripple.update(deltaTime));
      
      // 移除死亡的涟漪
      for (let i = ripples.length - 1; i >= 0; i--) {
        if (!ripples[i].alive) ripples.splice(i, 1);
      }
      
      // 渲染
      if (ripples.length > 0) {
        render(gl, program, uniforms, texture);
        animationId = requestAnimationFrame(animateLoop);
      } else {
        // 涟漪消失 → 隐藏 Canvas
        surfaceCanvas.style.opacity = '0';
        behindCanvas.style.opacity = '0';
        animationId = null;
      }
    };
    
    animateLoop();
  };
  
  // ========== 点击监听 ==========
  
  document.addEventListener('click', async (e) => {
    // 排除交互元素
    if (e.target.closest(
      'a, button, .nav-toggle, input, textarea, [role="button"], ' +
      '.gallery-card, .skill-card, .philosophy-block, .card'
    )) return;
    
    await createRipple(e.clientX, e.clientY);
  });
  
  console.log('WebGL 涟漪折射系统 v1.0 已初始化');
  
  // ========== 暴露调试接口 ==========
  
  window.debugRipple = {
    config,
    ripples,
    createRipple,
    surfaceCanvas,
    behindCanvas
  };
}