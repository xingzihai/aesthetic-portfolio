/* Ripple Refraction System - Circular expansion with content distortion */
function initRippleRefraction() {
  if ('ontouchstart' in window) return;
  
  const config = {
    maxRipples: 3,
    maxRadius: 400,        // 扩大范围
    expandSpeed: 1.2,      // 减慢速度
    waveCount: 6,          // 波纹圈数
    distortStrength: 8,    // 扭曲强度
    fadeStart: 0.6
  };
  
  const ripples = [];
  
  // Create SVG filter for circular distortion
  const svgNS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(svgNS, 'svg');
  svg.setAttribute('style', 'position: absolute; width: 0; height: 0;');
  
  const defs = document.createElementNS(svgNS, 'defs');
  
  const filter = document.createElementNS(svgNS, 'filter');
  filter.setAttribute('id', 'ripple-distort');
  filter.setAttribute('x', '-50%');
  filter.setAttribute('y', '-50%');
  filter.setAttribute('width', '200%');
  filter.setAttribute('height', '200%');
  
  // Use fractalNoise for more organic circular distortion
  const turbulence = document.createElementNS(svgNS, 'feTurbulence');
  turbulence.setAttribute('type', 'fractalNoise');
  turbulence.setAttribute('baseFrequency', '0.008');  // 更低频率，更大的波纹
  turbulence.setAttribute('numOctaves', '1');
  turbulence.setAttribute('result', 'noise');
  
  const displacement = document.createElementNS(svgNS, 'feDisplacementMap');
  displacement.setAttribute('in', 'SourceGraphic');
  displacement.setAttribute('in2', 'noise');
  displacement.setAttribute('scale', String(config.distortStrength));
  displacement.setAttribute('xChannelSelector', 'R');
  displacement.setAttribute('yChannelSelector', 'G');
  
  filter.appendChild(turbulence);
  filter.appendChild(displacement);
  defs.appendChild(filter);
  svg.appendChild(defs);
  document.body.appendChild(svg);
  
  // Create canvas for wave lines
  const surfaceCanvas = document.createElement('canvas');
  const behindCanvas = document.createElement('canvas');
  
  surfaceCanvas.style.cssText = `
    position: fixed;
    top: 0; left: 0;
    width: 100%; height: 100%;
    pointer-events: none;
    z-index: 100;
  `;
  behindCanvas.style.cssText = `
    position: fixed;
    top: 0; left: 0;
    width: 100%; height: 100%;
    pointer-events: none;
    z-index: 3;
  `;
  
  document.body.appendChild(surfaceCanvas);
  document.body.appendChild(behindCanvas);
  
  const surfaceCtx = surfaceCanvas.getContext('2d');
  const behindCtx = behindCanvas.getContext('2d');
  
  let canvasWidth = window.innerWidth;
  let canvasHeight = window.innerHeight;
  let dpr = window.devicePixelRatio || 1;
  
  const resizeCanvases = () => {
    dpr = window.devicePixelRatio || 1;
    canvasWidth = window.innerWidth;
    canvasHeight = window.innerHeight;
    
    [surfaceCanvas, behindCanvas].forEach(canvas => {
      canvas.width = canvasWidth * dpr;
      canvas.height = canvasHeight * dpr;
      canvas.style.width = `${canvasWidth}px`;
      canvas.style.height = `${canvasHeight}px`;
    });
    
    surfaceCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
    behindCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  
  resizeCanvases();
  window.addEventListener('resize', resizeCanvases);
  
  // Ripple class
  class Ripple {
    constructor(x, y) {
      this.x = x;
      this.y = y;
      this.radius = 0;
      this.maxRadius = config.maxRadius;
      this.opacity = 1;
      this.alive = true;
      
      // Create distortion zone (backdrop-filter)
      this.zone = document.createElement('div');
      this.zone.style.cssText = `
        position: fixed;
        pointer-events: none;
        z-index: 50;
        border-radius: 50%;
        transform: translate(-50%, -50%);
        backdrop-filter: url(#ripple-distort);
        -webkit-backdrop-filter: url(#ripple-distort);
      `;
      document.body.appendChild(this.zone);
    }
    
    update() {
      this.radius += config.expandSpeed;
      
      const progress = this.radius / this.maxRadius;
      if (progress > config.fadeStart) {
        const fadeProgress = (progress - config.fadeStart) / (1 - config.fadeStart);
        this.opacity = Math.max(0, 1 - fadeProgress * fadeProgress);
      }
      
      if (this.radius >= this.maxRadius) {
        this.alive = false;
        this.zone.remove();
      }
    }
    
    renderDistortionZone() {
      if (!this.alive) return;
      
      const size = this.radius * 2;
      this.zone.style.left = `${this.x}px`;
      this.zone.style.top = `${this.y}px`;
      this.zone.style.width = `${size}px`;
      this.zone.style.height = `${size}px`;
      this.zone.style.opacity = this.opacity;
    }
    
    drawWaveLines(ctx, isBehind) {
      if (!this.alive || this.opacity <= 0) return;
      
      ctx.save();
      
      const waves = config.waveCount;
      const waveSpacing = this.radius / waves;
      
      // Draw concentric wave circles
      for (let i = 1; i <= waves; i++) {
        const waveRadius = waveSpacing * i;
        if (waveRadius <= 0 || waveRadius > this.radius) continue;
        
        // Alternate between peak and valley
        const isPeak = i % 2 === 0;
        
        // Wave opacity fades with distance
        const distanceFade = 1 - (i / waves) * 0.4;
        const lineOpacity = this.opacity * distanceFade * 0.7;
        
        ctx.beginPath();
        ctx.arc(this.x, this.y, waveRadius, 0, Math.PI * 2);
        
        if (isPeak) {
          // 峰点：极细的淡淡白色线
          ctx.strokeStyle = isBehind 
            ? `rgba(220, 240, 250, ${lineOpacity * 0.4})`
            : `rgba(255, 252, 248, ${lineOpacity * 0.4})`;
        } else {
          // 谷点：极细的淡淡灰色线
          ctx.strokeStyle = isBehind
            ? `rgba(130, 150, 165, ${lineOpacity * 0.35})`
            : `rgba(170, 165, 160, ${lineOpacity * 0.35})`;
        }
        
        ctx.lineWidth = 0.6;  // 极细
        ctx.stroke();
      }
      
      ctx.restore();
    }
  }
  
  // Animation
  let animationId = null;
  
  const animate = () => {
    // Clear canvases
    surfaceCtx.clearRect(0, 0, canvasWidth, canvasHeight);
    behindCtx.clearRect(0, 0, canvasWidth, canvasHeight);
    
    // Update and render ripples
    ripples.forEach(r => {
      r.update();
      r.renderDistortionZone();
      r.drawWaveLines(surfaceCtx, false);
      r.drawWaveLines(behindCtx, true);
    });
    
    // Remove dead ripples
    for (let i = ripples.length - 1; i >= 0; i--) {
      if (!ripples[i].alive) ripples.splice(i, 1);
    }
    
    if (ripples.length > 0) {
      animationId = requestAnimationFrame(animate);
    } else {
      animationId = null;
    }
  };
  
  const createRipple = (x, y) => {
    if (ripples.length >= config.maxRipples) {
      const old = ripples.shift();
      old.zone.remove();
    }
    ripples.push(new Ripple(x, y));
    if (!animationId) animate();
  };
  
  document.addEventListener('click', (e) => {
    if (e.target.closest('a, button, .nav-toggle, input, textarea, [role="button"], .gallery-card, .skill-card, .philosophy-block')) return;
    createRipple(e.clientX, e.clientY);
  });
  
  console.log('Ripple system initialized (circular expansion with wave lines)');
}