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
  initFireflies();
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
   萤火虫粒子（外部自主飞行）
   ======================================== */
function initFireflies() {
  const container = document.querySelector('.firefly-container');
  if (!container) return;
  
  // 检测减少动画偏好
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) return;
  
  // 萤火虫数量
  const count = 80;
  
  // 萤火虫状态数组
  const fireflies = [];
  
  // 颜色类型
  const colorTypes = ['warm', 'cool', 'pink'];
  
  // 创建萤火虫
  for (let i = 0; i < count; i++) {
    const el = document.createElement('span');
    el.className = `firefly ${colorTypes[i % 3]}`;
    
    // 尺寸：6-12px，更大更明显
    const size = 6 + Math.random() * 6;
    el.style.width = `${size}px`;
    el.style.height = `${size}px`;
    
    // 闪烁周期：2-5秒，更快更明显
    const glowDuration = 2 + Math.random() * 3;
    el.style.animation = `firefly-glow ${glowDuration}s ease-in-out infinite`;
    el.style.animationDelay = `${Math.random() * glowDuration}s`;
    
    container.appendChild(el);
    
    // 状态初始化
    const containerSize = 500;
    const half = containerSize / 2;
    
    // 初始位置：随机分布在容器内（避开中心头像区域）
    let x, y;
    const distFromCenter = () => Math.sqrt(x * x + y * y);
    do {
      x = (Math.random() - 0.5) * containerSize;
      y = (Math.random() - 0.5) * containerSize;
    } while (distFromCenter() < 80); // 避开中心80px区域
    
    fireflies.push({
      el,
      x,
      y,
      // 飞行参数
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      // 转向频率（不同萤火虫不同）
      turnInterval: 800 + Math.random() * 1500,
      lastTurn: 0,
      // 目标方向（随机游走）
      targetVx: 0,
      targetVy: 0,
      // 边界
      maxDist: half - 20,
      minDist: 70 // 不进入中心头像区域
    });
  }
  
  // 动画循环
  const animate = () => {
    const now = performance.now();
    
    fireflies.forEach(f => {
      // 随机转向（模拟萤火虫的不规则飞行）
      if (now - f.lastTurn > f.turnInterval) {
        f.lastTurn = now;
        // 新目标方向：随机，但速度限制
        f.targetVx = (Math.random() - 0.5) * 0.4;
        f.targetVy = (Math.random() - 0.5) * 0.4;
      }
      
      // 平滑过渡到目标速度
      f.vx += (f.targetVx - f.vx) * 0.02;
      f.vy += (f.targetVy - f.vy) * 0.02;
      
      // 更新位置
      f.x += f.vx;
      f.y += f.vy;
      
      // 边界处理：碰到边界时反弹转向
      const dist = Math.sqrt(f.x * f.x + f.y * f.y);
      
      if (dist > f.maxDist) {
        // 太远了，向中心转向
        const angle = Math.atan2(f.y, f.x);
        f.targetVx = -Math.cos(angle) * 0.2;
        f.targetVy = -Math.sin(angle) * 0.2;
      } else if (dist < f.minDist) {
        // 太近了，向外转向
        const angle = Math.atan2(f.y, f.x);
        f.targetVx = Math.cos(angle) * 0.2;
        f.targetVy = Math.sin(angle) * 0.2;
      }
      
      // 应用位置
      f.el.style.transform = `translate(${f.x}px, ${f.y}px)`;
    });
    
    requestAnimationFrame(animate);
  };
  
  animate();
}