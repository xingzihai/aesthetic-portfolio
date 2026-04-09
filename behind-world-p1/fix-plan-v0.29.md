# 涟漪效果修复计划 v0.29

> 日期：2026-04-08 23:07
> 目标：彻底消除"诡异感"，实现真实水的清透感
> 方法：Canvas像素操作，让波形位置直接决定扭曲效果

---

## 🎯 修复目标

| 目标 | 说明 |
|------|------|
| **消除诡异感** | 扭曲方向从随机改为径向 |
| **实现清透感** | 波峰向外、波谷向内的自然效果 |
| **波形传播** | 波峰波谷从中心向外传播 |
| **多涟漪独立** | 每个涟漪效果独立，不互相干扰 |

---

## 📋 技术方案

### 核心思路

```
点击 → 创建涟漪实例
    ↓
涟漪范围扩大 + 波形相位传播
    ↓
每帧渲染：
  1. 截取涟漪区域背景
  2. 计算每个像素的波形高度
  3. 根据波形高度计算像素偏移
  4. 绘制扭曲后的结果
    ↓
涟漪消失后移除
```

### 架构设计

```
Ripple类
├── 属性
│   ├── x, y          涟漪中心位置
│   ├── radius        当前涟漪半径
│   ├── phase         波形相位
│   ├── opacity       整体透明度
│   └── maxRadius     最大半径
│
├── 更新方法
│   ├── update()      更新半径和相位
│   └── calculateWaveHeight(distance)  计算波形高度
│
└── 渲染方法
    └── draw(ctx)     Canvas绘制扭曲效果
```

---

## 📐 核心算法

### 1. 波形高度计算

```javascript
/**
 * 计算某点到涟漪中心的波形高度
 * @param {number} distance - 距离涟漪中心的距离
 * @param {number} radius - 涟漪当前半径
 * @param {number} phase - 波形相位
 * @returns {number} 波形高度 (-1 到 1)
 */
function calculateWaveHeight(distance, radius, phase) {
  if (distance > radius || radius <= 0) return 0;
  
  // 波形公式：sin(distance × frequency - phase + π/2)
  // +π/2 让中心从波峰开始
  const frequency = 0.03;
  const waveHeight = Math.sin(distance * frequency - phase + Math.PI / 2);
  
  // 距离衰减
  const progress = distance / radius;
  const decay = 1 - progress * progress;
  
  return waveHeight * decay;
}
```

### 2. 像素偏移计算

```javascript
/**
 * 计算像素的扭曲偏移
 * @param {number} x - 像素x坐标
 * @param {number} y - 像素y坐标
 * @param {number} cx - 涟漪中心x
 * @param {number} cy - 涟漪中心y
 * @param {number} waveHeight - 波形高度
 * @param {number} strength - 扭曲强度
 * @returns {object} 偏移量 {dx, dy}
 */
function calculateDisplacement(x, y, cx, cy, waveHeight, strength) {
  // 计算到涟漪中心的角度
  const angle = Math.atan2(y - cy, x - cx);
  
  // 波峰向外，波谷向内
  const offset = waveHeight * strength;
  
  return {
    dx: Math.cos(angle) * offset,
    dy: Math.sin(angle) * offset
  };
}
```

### 3. 渲染流程

```javascript
function drawRipple(ripple, ctx) {
  const { x, y, radius, phase, opacity } = ripple;
  
  // 遍历涟漪范围内的像素
  for (let py = y - radius; py <= y + radius; py++) {
    for (let px = x - radius; px <= x + radius; px++) {
      // 计算距离
      const dist = Math.sqrt((px - x) ** 2 + (py - y) ** 2);
      
      // 计算波形高度
      const waveHeight = calculateWaveHeight(dist, radius, phase);
      
      // 计算偏移
      const { dx, dy } = calculateDisplacement(px, py, x, y, waveHeight, 5);
      
      // 从原图采样
      const srcX = px - dx;
      const srcY = py - dy;
      
      // 复制像素
      copyPixel(ctx, srcX, srcY, px, py, opacity);
    }
  }
}
```

---

## 📋 任务清单

### T1：基础架构（20min）

| 步骤 | 内容 | 验收标准 |
|------|------|----------|
| 1.1 | 创建Canvas层 | 正确覆盖页面 |
| 1.2 | 涟漪类定义 | 属性完整 |
| 1.3 | 配置参数 | 参数合理 |

### T2：波形算法（30min）

| 步骤 | 内容 | 验收标准 |
|------|------|----------|
| 2.1 | calculateWaveHeight | 波形高度正确 |
| 2.2 | calculateDistanceDecay | 衰减自然 |
| 2.3 | 波形传播 | phase变化时波形向外移动 |

### T3：扭曲渲染（40min）

| 步骤 | 内容 | 验收标准 |
|------|------|----------|
| 3.1 | calculateDisplacement | 偏移方向正确 |
| 3.2 | 像素采样 | 从原图正确采样 |
| 3.3 | 绘制扭曲 | 视觉效果正确 |

### T4：动画循环（20min）

| 步骤 | 内容 | 验收标准 |
|------|------|----------|
| 4.1 | animate函数 | 流畅运行 |
| 4.2 | update调用 | 状态正确更新 |
| 4.3 | 多涟漪支持 | 互不干扰 |

### T5：优化调试（20min）

| 步骤 | 内容 | 验收标准 |
|------|------|----------|
| 5.1 | 性能优化 | 帧率稳定 |
| 5.2 | 参数调优 | 效果自然 |
| 5.3 | 视觉验证 | 无诡异感 |

---

## ⏱️ 工时预估

| 任务 | 预估 |
|------|------|
| T1 基础架构 | 20min |
| T2 波形算法 | 30min |
| T3 扭曲渲染 | 40min |
| T4 动画循环 | 20min |
| T5 优化调试 | 20min |
| **总计** | **2h 10min** |

---

## 🎯 验收标准

| 标准 | 说明 |
|------|------|
| ✅ 无诡异感 | 扭曲方向径向，不是随机 |
| ✅ 清透感 | 能看到涟漪区域内内容被扭曲 |
| ✅ 起伏感 | 波峰向外扩散，波谷向内收缩 |
| ✅ 波形传播 | 波峰波谷向外移动 |
| ✅ 性能达标 | 帧率保持60fps |

---

## 📂 文件结构

```
scripts/ripple-refraction.js
├── config              配置参数
├── class Ripple        涟漪类
│   ├── constructor()   初始化
│   ├── update()        更新状态
│   └── draw()          绘制扭曲
├── calculateWaveHeight()   波形计算
├── calculateDisplacement() 偏移计算
├── animate()          动画循环
└── createRipple()     创建涟漪
```

---

## ⚠️ 注意事项

1. **性能关键**：像素操作开销大，需要优化
2. **降级策略**：低端设备降低分辨率
3. **渐进增强**：支持 `prefers-reduced-motion`

---

*计划完成，待执行*