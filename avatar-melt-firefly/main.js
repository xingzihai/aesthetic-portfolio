/* ========================================
   溶 · 萤火 | 交互逻辑
   ======================================== */

document.addEventListener('DOMContentLoaded', () => {
  initAvatar();
});

function initAvatar() {
  const avatar = document.getElementById('avatar');
  const firefliesLayer = avatar.querySelector('.fireflies-layer');
  const circleBottom = avatar.querySelector('.circle-bottom');
  const ripplesLayer = avatar.querySelector('.ripples-layer');
  
  // 萤火粒子配置
  const fireflyConfig = {
    count: 12,
    colors: ['#E8D4A0', '#C8E0D8', '#E8C4B8', '#D8D0E8'],
    minSize: 4,
    maxSize: 10,
    minDuration: 4,
    maxDuration: 8
  };
  
  // 存储粒子状态
  const fireflies = [];
  
  // 创建萤火粒子
  createFireflies();
  
  // 鼠标交互
  setupMouseInteraction();
  
  // 点击涟漪
  setupClickRipple();
  
  // ========== 创建萤火粒子 ==========
  function createFireflies() {
    for (let i = 0; i < fireflyConfig.count; i++) {
      const firefly = document.createElement('div');
      firefly.className = 'firefly';
      
      // 随机属性
      const size = randomBetween(fireflyConfig.minSize, fireflyConfig.maxSize);
      const color = fireflyConfig.colors[Math.floor(Math.random() * fireflyConfig.colors.length)];
      const duration = randomBetween(fireflyConfig.minDuration, fireflyConfig.maxDuration);
      const delay = Math.random() * duration;
      
      // 初始位置（在头像区域内随机分布）
      const x = randomBetween(10, 90); // 百分比
      const y = randomBetween(10, 90);
      
      firefly.style.cssText = `
        width: ${size}px;
        height: ${size}px;
        left: ${x}%;
        top: ${y}%;
        background: radial-gradient(circle, ${color}, transparent);
        box-shadow: 0 0 ${size * 2}px ${color};
        animation: firefly-glow ${duration}s ease-in-out ${delay}s infinite;
      `;
      
      firefliesLayer.appendChild(firefly);
      
      // 存储粒子数据
      fireflies.push({
        element: firefly,
        baseX: x,
        baseY: y,
        currentX: 0,
        currentY: 0,
        velocityX: 0,
        velocityY: 0
      });
    }
    
    // 添加萤火动画
    const style = document.createElement('style');
    style.textContent = `
      @keyframes firefly-glow {
        0%, 100% {
          opacity: 0.3;
          transform: scale(0.8);
        }
        50% {
          opacity: 1;
          transform: scale(1.2);
        }
      }
    `;
    document.head.appendChild(style);
  }
  
  // ========== 鼠标交互 ==========
  function setupMouseInteraction() {
    let isNear = false;
    
    document.addEventListener('mousemove', (e) => {
      const rect = avatar.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      // 计算鼠标到中心的距离
      const distance = Math.hypot(e.clientX - centerX, e.clientY - centerY);
      const threshold = rect.width * 0.6;
      
      // 融化效果
      if (distance < threshold) {
        if (!isNear) {
          isNear = true;
          circleBottom.classList.add('melting');
        }
      } else {
        if (isNear) {
          isNear = false;
          circleBottom.classList.remove('melting');
        }
      }
      
      // 粒子躲避效果
      updateFireflies(e.clientX, e.clientY, rect);
    });
  }
  
  // ========== 更新粒子位置 ==========
  function updateFireflies(mouseX, mouseY, avatarRect) {
    const centerX = avatarRect.left + avatarRect.width / 2;
    const centerY = avatarRect.top + avatarRect.height / 2;
    
    fireflies.forEach(firefly => {
      // 粒子相对于头像中心的位置
      const fireflyX = avatarRect.left + (firefly.baseX / 100) * avatarRect.width;
      const fireflyY = avatarRect.top + (firefly.baseY / 100) * avatarRect.height;
      
      // 计算粒子到鼠标的距离和方向
      const dx = fireflyX - mouseX;
      const dy = fireflyY - mouseY;
      const distance = Math.hypot(dx, dy);
      
      // 躲避半径
      const fleeRadius = 80;
      
      if (distance < fleeRadius) {
        // 在躲避范围内，远离鼠标
        const fleeStrength = (fleeRadius - distance) / fleeRadius;
        const fleeX = (dx / distance) * fleeStrength * 20;
        const fleeY = (dy / distance) * fleeStrength * 20;
        
        firefly.element.style.transform = `translate(${fleeX}px, ${fleeY}px)`;
      } else {
        // 恢复原位
        firefly.element.style.transform = 'translate(0, 0)';
      }
    });
  }
  
  // ========== 点击涟漪 ==========
  function setupClickRipple() {
    avatar.addEventListener('click', (e) => {
      const rect = avatar.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      createRipple(x, y, '#FFB088');
      
      // 延迟创建第二个涟漪
      setTimeout(() => {
        createRipple(x, y, '#D8B0C0');
      }, 150);
    });
  }
  
  function createRipple(x, y, color) {
    const ripple = document.createElement('div');
    ripple.className = 'ripple';
    ripple.style.cssText = `
      left: ${x}px;
      top: ${y}px;
      width: 50px;
      height: 50px;
      border-color: ${color};
    `;
    
    ripplesLayer.appendChild(ripple);
    
    // 动画结束后移除
    ripple.addEventListener('animationend', () => {
      ripple.remove();
    });
  }
  
  // ========== 工具函数 ==========
  function randomBetween(min, max) {
    return min + Math.random() * (max - min);
  }
}