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
  initCustomCursor();
  initClickRipple();
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
  const spring = 0.08;
  const damping = 0.85;
  const maxRotateY = 45;  // 大幅增加移动范围
  const maxRotateX = 35;

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
   点击涟漪效果（全页面）
   ======================================== */

// 莫兰迪配色系（用于涟漪）
const RIPPLE_COLOR_FAMILIES = [
  { name: 'pink', colors: ['#EAD9D4', '#D4C4BC', '#C4A8A0', '#B48C84', '#9A7068'] },
  { name: 'blue', colors: ['#C4CED2', '#A8B4B8', '#8A9AA0', '#6A7A82', '#4A5A62'] },
  { name: 'green', colors: ['#BCBEB8', '#9CAA9C', '#7C8A7C', '#5C6A5C', '#3C4A3C'] },
  { name: 'purple', colors: ['#D8D0D8', '#B8A8B8', '#988898', '#786878', '#584858'] },
  { name: 'orange', colors: ['#E8D8C8', '#D8C8A8', '#C8B898', '#B8A878', '#988858'] },
  { name: 'yellow', colors: ['#E8E0D0', '#D8D0B8', '#C8C0A8', '#B8B088', '#989068'] },
  { name: 'rose', colors: ['#E8D0D8', '#D8B0C0', '#C890A0', '#B87080', '#985060'] }
];

// 获取随机涟漪颜色（同色系80%，跨色系20%）
function getRippleColors() {
  const isMonochrome = Math.random() < 0.8; // 80% 同色系
  
  if (isMonochrome) {
    // 同色系渐变：随机选一种颜色系，内亮外暗
    const family = RIPPLE_COLOR_FAMILIES[Math.floor(Math.random() * RIPPLE_COLOR_FAMILIES.length)];
    return {
      layer1: family.colors[2], // 中等亮度
      layer2: family.colors[1], // 较亮
      layer3: family.colors[0], // 最亮（中心）
      type: 'monochrome',
      family: family.name
    };
  } else {
    // 跨色系混合：每层随机选不同颜色系
    const shuffled = [...RIPPLE_COLOR_FAMILIES].sort(() => Math.random() - 0.5);
    return {
      layer1: shuffled[0].colors[2],
      layer2: shuffled[1].colors[2],
      layer3: shuffled[2].colors[2],
      type: 'multicolor',
      families: [shuffled[0].name, shuffled[1].name, shuffled[2].name]
    };
  }
}

function initClickRipple() {
  const surfaceWorld = document.querySelector('.surface-world');
  if (!surfaceWorld) return;

  surfaceWorld.addEventListener('click', (e) => {
    // 点击位置（页面坐标，包含滚动）
    const x = e.pageX;
    const y = e.pageY;

    // 获取随机颜色
    const colors = getRippleColors();

    // 创建三层涟漪
    for (let i = 0; i < 3; i++) {
      const ripple = document.createElement('span');
      ripple.className = `click-ripple r-layer-${i + 1}`;
      ripple.style.left = `${x}px`;
      ripple.style.top = `${y}px`;
      ripple.style.transform = 'translate(-50%, -50%)';
      
      // 设置颜色
      const color = i === 0 ? colors.layer1 : (i === 1 ? colors.layer2 : colors.layer3);
      ripple.style.borderColor = color;
      
      surfaceWorld.appendChild(ripple);

      // 动画结束后移除
      ripple.addEventListener('animationend', () => ripple.remove());
    }
  });
}

/* ========================================
   自定义光标系统 + 背后世界窗口
   ======================================== */
function initCustomCursor() {
  const cursorDot = document.querySelector('.cursor-dot');
  const behindWorld = document.querySelector('.behind-world');
  const behindContent = document.querySelector('.behind-content');
  const surfaceWorld = document.querySelector('.surface-world');

  if (!cursorDot || !behindWorld || !behindContent || !surfaceWorld) return;

  // 检测触摸设备
  if ('ontouchstart' in window) {
    cursorDot.style.display = 'none';
    behindWorld.style.display = 'none';
    document.body.style.cursor = 'auto';
    return;
  }

  // 禁用右键菜单
  document.addEventListener('contextmenu', (e) => e.preventDefault());

  // ========== 取景框参数 ==========
  const minRadius = 60;
  const maxRadius = Math.min(window.innerWidth, window.innerHeight) * 0.4;

  // 屏幕中心坐标（取景框初始位置）
  const centerX = window.innerWidth / 2;
  const centerY = window.innerHeight / 2;

  // 光标位置（初始化在屏幕中心）
  let mouseX = centerX;
  let mouseY = centerY;

  // 取景框位置（初始在中心）
  let portalX = centerX;
  let portalY = centerY;
  let currentRadius = maxRadius;

  // 是否已激活跟随模式
  let isActivated = false;

  // 右键状态
  let isRightMouseDown = false;

  // 呼吸动画参数
  let breathePhase = 0;
  const breatheSpeed = 0.008;

  // ========== 克隆表层世界到背后世界 ==========
  const cloneSurface = () => {
    behindContent.innerHTML = '';
    const clone = surfaceWorld.cloneNode(true);
    const nav = clone.querySelector('.site-nav');
    if (nav) nav.style.position = 'absolute';
    const fireflies = clone.querySelector('.firefly-container');
    if (fireflies) fireflies.remove();
    behindContent.appendChild(clone);
  };

  cloneSurface();

  // 光标是否已定位（首次mousemove）
  let cursorLocated = false;

  // ========== 初始化：光标隐藏等待首次移动，取景框最大固定在中心 ==========
  cursorDot.style.cssText = `
    opacity: 0;
    display: block;
  `;
  // 取景框固定在中心
  behindWorld.style.clipPath = `circle(${maxRadius}px at ${centerX}px ${centerY}px)`;

  // ========== 激活函数 ==========
  const activate = (mx, my) => {
    if (isActivated) return;
    isActivated = true;
    // 取景框位置锁定到光标
    portalX = mx;
    portalY = my;
  };

  // ========== 激活检测：光标进入取景框 ==========
  const checkActivation = (mx, my) => {
    if (isActivated) return;

    // 计算光标到中心的距离
    const dist = Math.sqrt((mx - centerX) ** 2 + (my - centerY) ** 2);

    // 光标进入取景框内部 → 激活
    if (dist < currentRadius) {
      activate(mx, my);
    }
  };

  // ========== 更新取景框大小 ==========
  const updatePortalRadius = () => {
    if (isRightMouseDown && isActivated) {
      // 按住右键且已激活：呼吸效果
      breathePhase += breatheSpeed;
      const cosValue = (1 - Math.cos(breathePhase)) / 2;
      currentRadius = minRadius + (maxRadius - minRadius) * cosValue;
    } else if (isActivated) {
      // 已激活：慢速吸附到 minRadius
      const spring = 0.04;  // 更慢更柔和
      currentRadius += (minRadius - currentRadius) * spring;
    } else {
      // 未激活：保持最大
      currentRadius = maxRadius;
    }
  };

  // ========== 动画循环 ==========
  const animate = () => {
    updatePortalRadius();

    if (isActivated) {
      // 已激活：取景框跟随光标
      portalX = mouseX;
      portalY = mouseY;
    } else {
      // 未激活：取景框固定在中心
      portalX = centerX;
      portalY = centerY;
    }

    behindWorld.style.clipPath = `circle(${currentRadius}px at ${portalX}px ${portalY}px)`;
    requestAnimationFrame(animate);
  };
  animate();

  // ========== 右键事件（仅激活后生效） ==========
  document.addEventListener('mousedown', (e) => {
    if (e.button === 2 && isActivated) { // 右键且已激活
      isRightMouseDown = true;
      // 重置：从初始大小开始动画
      currentRadius = minRadius;
      breathePhase = 0;
    }
  });

  document.addEventListener('mouseup', (e) => {
    if (e.button === 2) { // 右键
      isRightMouseDown = false;
    }
  });

  // 鼠标移动：首次定位后跟随，检测激活
  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    cursorDot.style.left = `${mouseX}px`;
    cursorDot.style.top = `${mouseY}px`;
    
    // 首次移动：显示光标
    if (!cursorLocated) {
      cursorLocated = true;
      cursorDot.style.opacity = '1';
    }

    // 检测是否激活
    checkActivation(mouseX, mouseY);
  }, { passive: true });

  // 同步背后内容滚动
  const syncBehindScroll = () => {
    behindContent.style.transform = `translateY(-${window.scrollY}px)`;
  };

  window.addEventListener('scroll', syncBehindScroll, { passive: true });

  // 悬停检测
  const interactiveSelectors = 'a, button, .nav-toggle, .gallery-card, input, textarea, [role="button"]';

  document.addEventListener('mouseover', (e) => {
    if (e.target.matches(interactiveSelectors) || e.target.closest(interactiveSelectors)) {
      cursorDot.classList.add('hover');
    }
  });

  document.addEventListener('mouseout', (e) => {
    if (e.target.matches(interactiveSelectors) || e.target.closest(interactiveSelectors)) {
      cursorDot.classList.remove('hover');
    }
  });

  // 左键点击状态
  document.addEventListener('mousedown', (e) => {
    if (e.button === 0) cursorDot.classList.add('clicking');
  });
  document.addEventListener('mouseup', (e) => {
    if (e.button === 0) cursorDot.classList.remove('clicking');
  });

  // 鼠标离开/进入窗口
  document.addEventListener('mouseleave', () => {
    cursorDot.style.opacity = '0';
  });
  document.addEventListener('mouseenter', () => {
    cursorDot.style.opacity = '1';
  });

  // ========== 滚动激活：到达"光的练习"区块自动激活 ==========
  const gallerySection = document.querySelector('#gallery');
  if (gallerySection) {
    const scrollObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !isActivated) {
          // 区块进入视口 → 自动激活，取景框吸附到当前光标位置
          activate(mouseX, mouseY);
        }
      });
    }, {
      threshold: 0.2,  // 区块20%可见时触发
      rootMargin: '0px 0px -50px 0px'
    });

    scrollObserver.observe(gallerySection);
  }

  // 初始化
  syncBehindScroll();
}

/* ========================================
   萤火虫粒子（外部自主飞行 + JS控制闪烁）
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

    // 尺寸：3-6px，小而亮
    const size = 3 + Math.random() * 3;
    el.style.width = `${size}px`;
    el.style.height = `${size}px`;

    // 初始位置：居中（firefly-container 的中心）
    el.style.left = '50%';
    el.style.top = '50%';
    el.style.marginLeft = `${-size/2}px`;
    el.style.marginTop = `${-size/2}px`;

    container.appendChild(el);

    // 状态初始化
    const containerSize = 500;

    // 初始位置：均匀分布在中心周围（使用极坐标确保均匀）
    const angle = Math.random() * Math.PI * 2; // 随机角度
    const minRadius = 80; // 最小距离（避开中心头像）
    const maxRadius = containerSize / 2 - 20; // 最大距离
    const radius = minRadius + Math.random() * (maxRadius - minRadius); // 随机半径

    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;

    // 闪烁参数：每个萤火虫独立周期
    const glowCycle = 2000 + Math.random() * 3000; // 2-5秒周期
    const glowPhase = Math.random() * glowCycle; // 随机起始相位

    fireflies.push({
      el,
      x,
      y,
      // 飞行参数
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      turnInterval: 800 + Math.random() * 1500,
      lastTurn: 0,
      targetVx: 0,
      targetVy: 0,
      // 边界
      maxDist: containerSize / 2 - 20,
      minDist: 70,
      // 闪烁参数
      glowCycle,
      glowPhase,
      baseOpacity: 0.15
    });
  }

  // 动画循环
  const animate = () => {
    const now = performance.now();

    fireflies.forEach(f => {
      // === 闪烁控制（JS独立控制，确保持续循环） ===
      const glowTime = (now + f.glowPhase) % f.glowCycle;
      const glowProgress = glowTime / f.glowCycle;

      // 使用正弦波：0→1→0（亮→暗→亮）
      const glowValue = Math.sin(glowProgress * Math.PI * 2);
      const opacity = f.baseOpacity + glowValue * 0.85; // 0.15→1.0

      f.el.style.opacity = opacity.toFixed(2);

      // === 飞行控制 ===
      if (now - f.lastTurn > f.turnInterval) {
        f.lastTurn = now;
        f.targetVx = (Math.random() - 0.5) * 0.4;
        f.targetVy = (Math.random() - 0.5) * 0.4;
      }

      f.vx += (f.targetVx - f.vx) * 0.02;
      f.vy += (f.targetVy - f.vy) * 0.02;

      f.x += f.vx;
      f.y += f.vy;

      // 边界处理
      const dist = Math.sqrt(f.x * f.x + f.y * f.y);

      if (dist > f.maxDist) {
        const angle = Math.atan2(f.y, f.x);
        f.targetVx = -Math.cos(angle) * 0.2;
        f.targetVy = -Math.sin(angle) * 0.2;
      } else if (dist < f.minDist) {
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