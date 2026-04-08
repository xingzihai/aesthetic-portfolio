/* Ripple Refraction System - CSS-based localized content distortion */
function initRippleRefraction() {
  if ('ontouchstart' in window) return;
  
  const config = {
    maxRipples: 3,
    maxRadius: 250,
    expandSpeed: 2.5,
    distortScale: 1.05,  // Scale factor for distortion
    fadeStart: 0.5
  };
  
  const ripples = [];
  let animationId = null;
  
  // Create SVG filter for distortion
  const svgNS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(svgNS, 'svg');
  svg.setAttribute('style', 'position: absolute; width: 0; height: 0;');
  
  const defs = document.createElementNS(svgNS, 'defs');
  
  // Distortion filter
  const filter = document.createElementNS(svgNS, 'filter');
  filter.setAttribute('id', 'ripple-filter');
  filter.setAttribute('x', '-20%');
  filter.setAttribute('y', '-20%');
  filter.setAttribute('width', '140%');
  filter.setAttribute('height', '140%');
  
  const turbulence = document.createElementNS(svgNS, 'feTurbulence');
  turbulence.setAttribute('type', 'fractalNoise');
  turbulence.setAttribute('baseFrequency', '0.025');
  turbulence.setAttribute('numOctaves', '2');
  turbulence.setAttribute('result', 'noise');
  
  const displacement = document.createElementNS(svgNS, 'feDisplacementMap');
  displacement.setAttribute('in', 'SourceGraphic');
  displacement.setAttribute('in2', 'noise');
  displacement.setAttribute('scale', '10');
  displacement.setAttribute('xChannelSelector', 'R');
  displacement.setAttribute('yChannelSelector', 'G');
  
  filter.appendChild(turbulence);
  filter.appendChild(displacement);
  defs.appendChild(filter);
  svg.appendChild(defs);
  document.body.appendChild(svg);
  
  // Ripple class - creates localized distortion zone
  class Ripple {
    constructor(x, y) {
      this.x = x;
      this.y = y;
      this.radius = 0;
      this.maxRadius = config.maxRadius;
      this.opacity = 1;
      this.alive = true;
      
      // Create ripple element that captures and distorts local content
      // Using backdrop-filter for localized effect
      this.element = document.createElement('div');
      this.element.className = 'ripple-zone';
      this.element.style.cssText = `
        position: fixed;
        pointer-events: none;
        z-index: 50;
        border-radius: 50%;
        transform: translate(-50%, -50%);
        backdrop-filter: url(#ripple-filter);
        -webkit-backdrop-filter: url(#ripple-filter);
      `;
      document.body.appendChild(this.element);
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
        this.element.remove();
      }
    }
    
    render() {
      if (!this.alive) return;
      
      // Size grows from center
      const size = this.radius * 2;
      this.element.style.left = `${this.x}px`;
      this.element.style.top = `${this.y}px`;
      this.element.style.width = `${size}px`;
      this.element.style.height = `${size}px`;
      this.element.style.opacity = this.opacity;
    }
  }
  
  // Animation
  const animate = () => {
    ripples.forEach(r => {
      r.update();
      r.render();
    });
    
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
      old.element.remove();
    }
    ripples.push(new Ripple(x, y));
    if (!animationId) animate();
  };
  
  document.addEventListener('click', (e) => {
    if (e.target.closest('a, button, .nav-toggle, input, textarea, [role="button"], .gallery-card, .skill-card, .philosophy-block')) return;
    createRipple(e.clientX, e.clientY);
  });
  
  console.log('Ripple refraction system (backdrop-filter)');
}