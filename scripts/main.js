/* ========================================
   印象派美学交互系统
   xingzihai · 冰水泡枸杞
   ======================================== */

document.addEventListener('DOMContentLoaded', () => {
  // 初始化所有模块
  initScrollProgress();
  initNavScroll();
  initMobileNav();
  initScrollAnimations();
  initSmoothScroll();
  initAvatarInteraction();
  initInnerParticles();
});

/* ========================================
   滚动进度条
   ======================================== */
function initScrollProgress() {
  const progressBar = document.querySelector('.scroll-progress');
  if (!progressBar) return;
  
  const updateProgress = () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = (scrollTop / docHeight) * 100;
    progressBar.style.width = `${progress}%`;
  };
  
  // 使用 requestAnimationFrame 优化性能
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        updateProgress();
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });
  
  // 初始化
  updateProgress();
}

/* ========================================
   导航栏滚动效果
   ======================================== */
function initNavScroll() {
  const nav = document.querySelector('.site-nav');
  if (!nav) return;
  
  let lastScroll = 0;
  const scrollThreshold = 100;
  
  const handleScroll = () => {
    const currentScroll = window.scrollY;
    
    // 添加背景模糊效果
    if (currentScroll > 50) {
      nav.style.background = 'rgba(232, 223, 214, 0.95)';
      nav.style.boxShadow = '0 2px 20px rgba(152, 136, 152, 0.08)';
    } else {
      nav.style.background = 'rgba(232, 223, 214, 0.85)';
      nav.style.boxShadow = 'none';
    }
    
    // 隐藏/显示导航栏（可选功能）
    // if (currentScroll > lastScroll && currentScroll > scrollThreshold) {
    //   nav.style.transform = 'translateY(-100%)';
    // } else {
    //   nav.style.transform = 'translateY(0)';
    // }
    
    lastScroll = currentScroll;
  };
  
  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();
}

/* ========================================
   移动端导航
   ======================================== */
function initMobileNav() {
  const toggle = document.querySelector('.nav-toggle');
  const links = document.querySelector('.nav-links');
  
  if (!toggle || !links) return;
  
  toggle.addEventListener('click', () => {
    toggle.classList.toggle('active');
    links.classList.toggle('active');
    
    // 切换body滚动
    document.body.style.overflow = links.classList.contains('active') ? 'hidden' : '';
  });
  
  // 点击链接后关闭菜单
  links.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      toggle.classList.remove('active');
      links.classList.remove('active');
      document.body.style.overflow = '';
    });
  });
}

/* ========================================
   滚动触发动画
   ======================================== */
function initScrollAnimations() {
  // 创建 Intersection Observer
  const observerOptions = {
    root: null,
    rootMargin: '0px 0px -100px 0px',
    threshold: 0.1
  };
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        // 一旦显示，停止观察（优化性能）
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);
  
  // 观察所有需要动画的元素
  const animatedElements = document.querySelectorAll(`
    .gallery-card,
    .philosophy-block,
    .skill-card
  `);
  
  animatedElements.forEach((el, index) => {
    // 添加初始隐藏状态
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = `opacity 0.6s var(--ease-out), transform 0.6s var(--ease-out)`;
    el.style.transitionDelay = `${index % 4 * 0.1}s`;
    observer.observe(el);
  });
  
  // 添加可见状态的样式
  const style = document.createElement('style');
  style.textContent = `
    .gallery-card.visible,
    .philosophy-block.visible,
    .skill-card.visible {
      opacity: 1 !important;
      transform: translateY(0) !important;
    }
  `;
  document.head.appendChild(style);
}

/* ========================================
   平滑滚动
   ======================================== */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      const targetId = this.getAttribute('href');
      const target = document.querySelector(targetId);
      
      if (target) {
        const navHeight = document.querySelector('.site-nav')?.offsetHeight || 0;
        const targetPosition = target.getBoundingClientRect().top + window.scrollY - navHeight - 20;
        
        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
      }
    });
  });
}

/* ========================================
   辅助功能：检测用户偏好
   ======================================== */
function checkUserPreferences() {
  // 检测减少动画偏好
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
  if (prefersReducedMotion) {
    console.log('用户偏好：减少动画');
    document.body.classList.add('reduced-motion');
  }
  
  // 检测深色模式（可选）
  const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  if (prefersDarkMode) {
    console.log('用户偏好：深色模式（暂不支持）');
  }
}

// 初始化偏好检测
checkUserPreferences();

/* ========================================
   头像鼠标交互（完整优化版）
   ======================================== */
function initAvatarInteraction() {
  const wrapper = document.querySelector('.avatar-crystal-wrapper');
  const glow = document.querySelector('.avatar-glow');
  const aura = document.querySelector('.avatar-aura');
  
  if (!wrapper) return;
  
  // 检测是否支持减少动画
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) return;
  
  // 弹簧阻尼参数
  const spring = 0.05;
  const damping = 0.88;
  const maxRotateY = 20;  // 限制旋转范围，避免穿帮
  const maxRotateX = 15;
  
  // 状态变量
  let targetX = 0, targetY = 0;
  let currentX = 0, currentY = 0;
  let velocityX = 0, velocityY = 0;
  
  // 呼吸动画参数
  let breathPhase = 0;
  const breathSpeed = 0.006;
  const breathAmplitudeX = 1.5;
  const breathAmplitudeY = 1.0;
  
  // 鼠标位置 → 目标角度
  document.addEventListener('mousemove', (e) => {
    // 以视口中心为原点
    const nx = (e.clientX / window.innerWidth - 0.5) * 2;
    const ny = (e.clientY / window.innerHeight - 0.5) * 2;
    
    // 映射到旋转角度
    targetY = nx * maxRotateY;
    targetX = -ny * maxRotateX;
  }, { passive: true });
  
  // 动画循环
  function animate() {
    // 呼吸动画（微弱的自然运动）
    breathPhase += breathSpeed;
    const breathX = Math.sin(breathPhase) * breathAmplitudeX;
    const breathY = Math.cos(breathPhase * 0.7) * breathAmplitudeY;
    
    // 最终目标 = 鼠标跟随 + 呼吸
    const finalTargetX = targetX + breathX;
    const finalTargetY = targetY + breathY;
    
    // 弹簧物理
    const forceX = (finalTargetX - currentX) * spring;
    const forceY = (finalTargetY - currentY) * spring;
    
    velocityX += forceX;
    velocityY += forceY;
    
    velocityX *= damping;
    velocityY *= damping;
    
    currentX += velocityX;
    currentY += velocityY;
    
    // 应用变换（保留默认的 -30deg 偏移）
    wrapper.style.transform = 
      `translate(-50%, -50%) rotateX(${currentX}deg) rotateY(${-30 + currentY}deg)`;
    
    // 光晕反向
    if (glow) {
      glow.style.transform = 
        `translate(calc(-50% + ${-currentY * 0.4}px), calc(-50% + ${currentX * 0.4}px))`;
    }
    
    // 氛围光微弱响应
    if (aura) {
      aura.style.transform = 
        `translate(calc(-50% + ${-currentY * 0.2}px), calc(-50% + ${currentX * 0.2}px))`;
    }
    
    requestAnimationFrame(animate);
  }
  
  animate();
  
  // 点击效果：六边形脉冲
  const container = document.querySelector('.avatar-container');
  if (container) {
    container.addEventListener('click', () => {
      const pulse = document.createElement('span');
      pulse.className = 'avatar-pulse-effect';
      container.appendChild(pulse);
      pulse.addEventListener('animationend', () => pulse.remove());
    });
  }
  
  // 添加六边形脉冲样式
  const style = document.createElement('style');
  style.textContent = `
    .avatar-pulse-effect {
      position: absolute;
      left: 50%;
      top: 50%;
      width: 80px;
      height: 80px;
      transform: translate(-50%, -50%);
      border: 2px solid rgba(255, 200, 207, 0.5);
      clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
      animation: hex-pulse 0.8s ease-out forwards;
      pointer-events: none;
      z-index: 10;
    }
    
    @keyframes hex-pulse {
      0% {
        width: 80px;
        height: 80px;
        opacity: 0.6;
      }
      100% {
        width: 320px;
        height: 320px;
        opacity: 0;
      }
    }
  `;
  document.head.appendChild(style);
}

/* ========================================
   性能监控（开发用）
   ======================================== */
if (process?.env?.NODE_ENV === 'development') {
  // 监控动画帧率
  let frameCount = 0;
  let lastTime = performance.now();
  
  const checkFPS = () => {
    frameCount++;
    const currentTime = performance.now();
    
    if (currentTime - lastTime >= 1000) {
      console.log(`FPS: ${frameCount}`);
      frameCount = 0;
      lastTime = currentTime;
    }
    
    requestAnimationFrame(checkFPS);
  };
  
  // 取消注释以启用 FPS 监控
  // checkFPS();
}

/* ========================================
   导出（如果需要模块化）
   ======================================== */
// export { initScrollProgress, initNavScroll, initMobileNav, initScrollAnimations };

/* ========================================
   内部漂浮微粒交互
   ======================================== */
function initInnerParticles() {
  const particles = document.querySelectorAll('.inner-particle');
  const wrapper = document.querySelector('.avatar-crystal-wrapper');
  
  if (particles.length === 0 || !wrapper) return;
  
  // 检测减少动画偏好
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) return;
  
  // 获取头像中心位置（相对于视口）
  const getCenter = () => {
    const rect = wrapper.getBoundingClientRect();
    return {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2
    };
  };
  
  // 微粒状态
  const particleStates = [];
  
  // 初始化每个微粒
  particles.forEach((p, i) => {
    const isAttract = p.classList.contains('attract');
    
    // 从CSS获取初始位置百分比
    const leftPercent = parseFloat(p.style.left) || (20 + i * 8);
    const topPercent = parseFloat(p.style.top) || (20 + i * 8);
    
    // 转换为像素（相对于wrapper）
    const wrapperSize = 160; // avatar-particles-inner 尺寸
    const baseX = (leftPercent / 100) * wrapperSize - wrapperSize / 2;
    const baseY = (topPercent / 100) * wrapperSize - wrapperSize / 2;
    
    particleStates.push({
      el: p,
      isAttract,
      // 基础位置（中心为原点）
      baseX,
      baseY,
      // 当前位置
      currentX: baseX,
      currentY: baseY,
      // 速度
      vx: 0,
      vy: 0,
      // 自主运动的相位（不同微粒不同起始相位）
      phase: i * 0.5,
      // 力度系数
      strength: isAttract ? 0.03 : 0.05, // 吸引型更温和
      maxDist: isAttract ? 40 : 35, // 影响范围
      // 弹簧参数
      spring: 0.04,
      damping: 0.85
    });
  });
  
  // 鼠标位置
  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  
  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  }, { passive: true });
  
  // 动画循环
  const animate = () => {
    const center = getCenter();
    const now = performance.now() * 0.001; // 秒
    
    particleStates.forEach(state => {
      // 计算鼠标相对于头像中心的距离
      const dx = mouseX - center.x;
      const dy = mouseY - center.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      // 影响因子（距离越近影响越大）
      const influence = Math.max(0, 1 - dist / state.maxDist);
      
      // 目标位置 = 基础位置 + 自主运动 + 光标交互
      let targetX = state.baseX;
      let targetY = state.baseY;
      
      // 自主漂浮（正弦波）
      const idleAmp = 3; // 自主漂浮幅度
      const idleX = Math.sin(now * 0.5 + state.phase) * idleAmp;
      const idleY = Math.cos(now * 0.4 + state.phase * 0.7) * idleAmp;
      targetX += idleX;
      targetY += idleY;
      
      // 光标交互
      if (dist < state.maxDist && influence > 0.1) {
        // 影响力度
        const force = influence * state.strength * 100;
        
        if (state.isAttract) {
          // 吸引：向光标方向移动（但限制距离）
          const attractStrength = force * 0.5;
          targetX += dx * attractStrength * 0.02;
          targetY += dy * attractStrength * 0.02;
        } else {
          // 排斥：远离光标
          const repelStrength = force;
          targetX -= dx * repelStrength * 0.015;
          targetY -= dy * repelStrength * 0.015;
        }
      }
      
      // 限制范围（不超出六棱柱边界）
      const maxRange = 50;
      targetX = Math.max(-maxRange, Math.min(maxRange, targetX));
      targetY = Math.max(-maxRange, Math.min(maxRange, targetY));
      
      // 弹簧物理
      const fx = (targetX - state.currentX) * state.spring;
      const fy = (targetY - state.currentY) * state.spring;
      
      state.vx += fx;
      state.vy += fy;
      state.vx *= state.damping;
      state.vy *= state.damping;
      
      state.currentX += state.vx;
      state.currentY += state.vy;
      
      // 应用变换（相对中心）
      state.el.style.transform = `translate(${state.currentX}px, ${state.currentY}px)`;
    });
    
    requestAnimationFrame(animate);
  };
  
  animate();
}