# 涟漪波形算法设计文档

> 日期：2026-04-08
> 版本：v0.27 设计稿
> 目标：实现水的清透感 - 明暗变化 + 起伏感

---

## 核心原理

### 涟漪物理模型

```
涟漪截面（侧视图）：

     波峰(亮)        波峰(亮)        波峰(亮)
        /\              /\              /\
       /  \            /  \            /  \
──────/────\──────────/────\──────────/────\──── 水面基准
     波谷(暗)        波谷(暗)        波谷(暗)
     
涟漪从中心向外扩散：
- 范围不断扩大
- 波形在范围内传播
- 强度随距离衰减
```

### 波形参数

| 参数 | 符号 | 说明 | 建议范围 |
|------|------|------|----------|
| 波形频率 | `frequency` | 波纹密度 | 0.015-0.04 |
| 波形相位 | `phase` | 波形位置（随时间变化） | 0 - 2π |
| 振幅 | `amplitude` | 起伏强度 | 1-20 |
| 传播速度 | `waveSpeed` | 波形传播速度 | 0.1-0.3 |
| 扩散速度 | `expandSpeed` | 涟漪范围扩大速度 | 1-3 |
| 衰减系数 | `decay` | 距离衰减 | 0-1 |

---

## 1. 波形算法（Wave Algorithm）

### 核心公式

```javascript
/**
 * 计算某点在涟漪中的波形高度
 * @param {number} distance - 距离涟漪中心的距离
 * @param {number} radius - 当前涟漪半径
 * @param {number} phase - 当前波形相位
 * @param {number} frequency - 波形频率
 * @returns {number} 波形高度 (-1 到 1)
 */
function calculateWaveHeight(distance, radius, phase, frequency = 0.025) {
  // 不在涟漪范围内
  if (distance > radius) return 0;
  
  // 波形高度 = sin(距离 × 频率 - 相位)
  // phase 随时间增加，波形向外传播
  const waveHeight = Math.sin(distance * frequency - phase);
  
  return waveHeight;  // -1 到 1
}
```

### 波形传播

```javascript
/**
 * 更新波形相位（产生传播效果）
 * @param {number} currentPhase - 当前相位
 * @param {number} waveSpeed - 传播速度
 * @param {number} deltaTime - 时间增量
 * @returns {number} 新相位
 */
function updateWavePhase(currentPhase, waveSpeed = 0.15, deltaTime = 1) {
  // 相位增加 = 波形向外传播
  return currentPhase + waveSpeed * deltaTime;
}
```

### 距离衰减

```javascript
/**
 * 计算距离衰减系数
 * @param {number} distance - 距离涟漪中心
 * @param {number} radius - 涟漪半径
 * @param {number} innerFade - 内部衰减起点 (0-1)
 * @param {number} outerFade - 外部衰减起点 (0-1)
 * @returns {number} 衰减系数 (0-1)
 */
function calculateDecay(distance, radius, innerFade = 0.1, outerFade = 0.7) {
  if (distance > radius) return 0;
  
  const progress = distance / radius;
  
  // 中心区域不衰减
  if (progress < innerFade) return 1;
  
  // 边缘区域衰减
  if (progress > outerFade) {
    const fadeProgress = (progress - outerFade) / (1 - outerFade);
    return Math.max(0, 1 - fadeProgress * fadeProgress);  // 平方衰减更自然
  }
  
  // 中间区域轻微衰减
  return 1 - (progress - innerFade) / (outerFade - innerFade) * 0.2;
}
```

---

## 2. 明暗算法（Brightness Algorithm）

### 原理

- **波峰（waveHeight > 0）**：内容凸起，光线反射更集中 → **更亮**
- **波谷（waveHeight < 0）**：内容凹陷，光线散射 → **更暗**
- **明暗程度与波形高度成正比**

### 实现

```javascript
/**
 * 计算明暗调整值
 * @param {number} waveHeight - 波形高度 (-1 到 1)
 * @param {number} decay - 衰减系数 (0-1)
 * @param {number} maxBrightness - 最大亮度调整 (0-1)
 * @returns {number} 明暗调整 (-maxBrightness 到 +maxBrightness)
 */
function calculateBrightness(waveHeight, decay, maxBrightness = 0.3) {
  // 波形高度 × 衰减 × 最大亮度
  return waveHeight * decay * maxBrightness;
  
  // waveHeight = 1 (波峰) → brightness = +0.3 (更亮)
  // waveHeight = -1 (波谷) → brightness = -0.3 (更暗)
  // waveHeight = 0 (平衡) → brightness = 0 (不变)
}
```

### 应用方式

**方式A：CSS Filter（简单）**
```javascript
const brightness = calculateBrightness(waveHeight, decay);
element.style.filter = `brightness(${1 + brightness})`;
```

**方式B：SVG feComponentTransfer（精确）**
```xml
<feComponentTransfer>
  <feFuncR type="linear" slope="${1 + brightness}" intercept="0"/>
  <feFuncG type="linear" slope="${1 + brightness}" intercept="0"/>
  <feFuncB type="linear" slope="${1 + brightness}" intercept="0"/>
</feComponentTransfer>
```

**方式C：Canvas像素操作（最灵活）**
```javascript
// 遍历像素，根据波形高度调整RGB值
for (let i = 0; i < pixels.length; i += 4) {
  const brightness = calculateBrightness(waveHeight, decay);
  pixels[i] = Math.min(255, pixels[i] * (1 + brightness));     // R
  pixels[i + 1] = Math.min(255, pixels[i + 1] * (1 + brightness)); // G
  pixels[i + 2] = Math.min(255, pixels[i + 2] * (1 + brightness)); // B
}
```

---

## 3. 扭曲算法（Distortion Algorithm）

### 原理

- **波峰**：内容凸起，局部扩张 → **向外扭曲**
- **波谷**：内容凹陷，局部收缩 → **向内扭曲**
- **扭曲强度 = |波形高度|**（峰谷都扭曲，方向不同）

### 实现

```javascript
/**
 * 计算扭曲强度
 * @param {number} waveHeight - 波形高度 (-1 到 1)
 * @param {number} decay - 衰减系数
 * @param {number} maxDistort - 最大扭曲强度
 * @returns {number} 扭曲强度 (0 到 maxDistort)
 */
function calculateDistortion(waveHeight, decay, maxDistort = 15) {
  // 波峰波谷都产生扭曲，强度取绝对值
  return Math.abs(waveHeight) * decay * maxDistort;
}

/**
 * 计算扭曲方向
 * @param {number} waveHeight - 波形高度
 * @param {number} angle - 像素相对于涟漪中心的角度
 * @returns {object} 扭曲偏移 {dx, dy}
 */
function calculateDistortionDirection(waveHeight, angle) {
  const direction = waveHeight > 0 ? 1 : -1;  // 波峰向外，波谷向内
  const strength = Math.abs(waveHeight) * 5;  // 偏移强度
  
  return {
    dx: Math.cos(angle) * strength * direction,
    dy: Math.sin(angle) * strength * direction
  };
}
```

### 应用方式

**SVG feDisplacementMap**
```javascript
// 动态调整 displacement scale
const distortion = calculateDistortion(waveHeight, decay);
displacementElement.setAttribute('scale', distortion);
```

---

## 4. 位移算法（Displacement Algorithm）

### 原理

- **波峰**：内容向外位移（扩散效果）
- **波谷**：内容向内位移（收缩效果）
- **位移方向 = 从涟漪中心向外的径向**

### 实现

```javascript
/**
 * 计算像素位移偏移
 * @param {number} x - 像素x坐标
 * @param {number} y - 像素y坐标
 * @param {number} rippleX - 涟漪中心x
 * @param {number} rippleY - 涟漪中心y
 * @param {number} waveHeight - 波形高度
 * @param {number} decay - 衰减系数
 * @param {number} maxDisplacement - 最大位移
 * @returns {object} 位移后的坐标 {newX, newY}
 */
function calculateDisplacement(x, y, rippleX, rippleY, waveHeight, decay, maxDisplacement = 3) {
  // 计算到涟漪中心的向量和角度
  const dx = x - rippleX;
  const dy = y - rippleY;
  const distance = Math.sqrt(dx * dx + dy * dy);
  const angle = Math.atan2(dy, dx);
  
  // 波峰向外位移，波谷向内位移
  const displacement = waveHeight * decay * maxDisplacement;
  
  // 计算新位置
  const newDistance = distance + displacement;
  
  return {
    newX: rippleX + Math.cos(angle) * newDistance,
    newY: rippleY + Math.sin(angle) * newDistance
  };
}
```

### 效果说明

```
波峰（waveHeight > 0）:
  - 内容向远离涟漪中心的方向移动
  - 视觉效果：凸起、扩散

波谷（waveHeight < 0）:
  - 内容向涟漪中心的方向移动
  - 视觉效果：凹陷、收缩

整体效果：
  - 产生"呼吸感"
  - 涟漪区域有立体起伏感
```

---

## 5. 综合算法（Combined Algorithm）

### 完整计算流程

```javascript
/**
 * 计算涟漪在某点的所有效果
 * @param {number} x - 像素x坐标
 * @param {number} y - 像素y坐标
 * @param {object} ripple - 涟漪对象 {x, y, radius, phase, ...}
 * @returns {object} 效果参数 {brightness, distortion, displacement}
 */
function calculateRippleEffect(x, y, ripple) {
  const { x: rx, y: ry, radius, phase, frequency, amplitude } = ripple;
  
  // 1. 计算距离和衰减
  const distance = Math.sqrt((x - rx) ** 2 + (y - ry) ** 2);
  const decay = calculateDecay(distance, radius);
  
  if (decay === 0) return null;  // 不在涟漪范围内
  
  // 2. 计算波形高度
  const waveHeight = calculateWaveHeight(distance, radius, phase, frequency);
  
  // 3. 计算明暗
  const brightness = calculateBrightness(waveHeight, decay, 0.25);
  
  // 4. 计算扭曲
  const distortion = calculateDistortion(waveHeight, decay, 15);
  
  // 5. 计算位移
  const angle = Math.atan2(y - ry, x - rx);
  const displacement = calculateDisplacement(x, y, rx, ry, waveHeight, decay, 3);
  
  return {
    brightness,      // 明暗调整 (-0.25 到 +0.25)
    distortion,      // 扭曲强度 (0 到 15)
    displacement,    // 位移坐标 {newX, newY}
    waveHeight,      // 波形高度（可选，用于调试）
    decay            // 衰减系数（可选，用于调试）
  };
}
```

---

## 6. 动画循环

### 更新逻辑

```javascript
/**
 * 涟漪动画更新
 */
function updateRipple(ripple, deltaTime) {
  // 1. 涟漪范围扩大
  ripple.radius += config.expandSpeed * deltaTime;
  
  // 2. 波形相位更新（波形传播）
  ripple.phase = updateWavePhase(ripple.phase, config.waveSpeed, deltaTime);
  
  // 3. 整体透明度衰减（涟漪逐渐消失）
  const progress = ripple.radius / ripple.maxRadius;
  if (progress > config.fadeStart) {
    const fadeProgress = (progress - config.fadeStart) / (1 - config.fadeStart);
    ripple.opacity = Math.max(0, 1 - fadeProgress * fadeProgress);
  }
  
  // 4. 检查涟漪是否消亡
  if (ripple.radius >= ripple.maxRadius) {
    ripple.alive = false;
  }
}
```

### 渲染逻辑

```javascript
/**
 * 渲染涟漪效果
 */
function renderRipple(ripple, ctx) {
  // 遍历涟漪范围内的像素
  for (let y = ripple.y - ripple.radius; y < ripple.y + ripple.radius; y++) {
    for (let x = ripple.x - ripple.radius; x < ripple.x + ripple.radius; x++) {
      // 计算效果
      const effect = calculateRippleEffect(x, y, ripple);
      if (!effect) continue;
      
      // 应用明暗
      applyBrightness(ctx, x, y, effect.brightness);
      
      // 应用扭曲（通过SVG滤镜）
      // ...
      
      // 应用位移（像素重排）
      // ...
    }
  }
}
```

---

## 7. 参数配置建议

### 不同效果的参数组合

| 效果类型 | frequency | waveSpeed | expandSpeed | maxBrightness | maxDistort |
|----------|-----------|-----------|-------------|---------------|------------|
| **细腻水纹** | 0.04 | 0.2 | 1.5 | 0.15 | 8 |
| **标准涟漪** | 0.025 | 0.15 | 2 | 0.25 | 15 |
| **强烈波纹** | 0.015 | 0.1 | 2.5 | 0.35 | 25 |
| **缓慢扩散** | 0.02 | 0.08 | 1 | 0.2 | 12 |

### 表层 vs 背后世界差异

| 世界 | brightness色调 | distortion强度 |
|------|----------------|----------------|
| **表层** | 暖色调（偏橙） | 较弱 |
| **背后** | 冷色调（偏蓝） | 较强 |

---

## 8. 实现路线图

### Phase 1：波形基础
- [ ] 实现波形高度计算
- [ ] 实现波形相位传播
- [ ] 实现距离衰减

### Phase 2：明暗效果
- [ ] 实现明暗计算
- [ ] 应用到涟漪区域
- [ ] 调整参数优化效果

### Phase 3：扭曲效果
- [ ] 实现扭曲强度计算
- [ ] 整合SVG滤镜
- [ ] 波峰波谷差异

### Phase 4：位移效果
- [ ] 实现位移计算
- [ ] 像素重排渲染
- [ ] 整合其他效果

### Phase 5：综合优化
- [ ] 性能优化
- [ ] 参数调优
- [ ] 表层/背后差异

---

## 9. 预期效果

### 视觉表现

```
点击 → 涟漪从点击点扩散
    ↓
涟漪范围内的内容：
  - 波峰位置：内容凸起、变亮、向外位移
  - 波谷位置：内容凹陷、变暗、向内位移
  - 波形传播：波峰波谷向外移动
    ↓
涟漪范围扩大 + 波形传播
    ↓
涟漪逐渐消失
```

### 关键指标

| 指标 | 目标 |
|------|------|
| **清透感** | 能看到涟漪区域内的内容被扭曲变形 |
| **明暗变化** | 波峰亮、波谷暗，过渡自然 |
| **起伏感** | 内容有凸起凹陷的立体感 |
| **扩散自然** | 波形向外传播，涟漪范围扩大 |
| **消失自然** | 边缘衰减，透明度渐变 |

---

*文档完成，待实现*