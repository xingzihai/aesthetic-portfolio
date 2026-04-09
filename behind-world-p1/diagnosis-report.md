# 涟漪效果问题诊断报告

> 日期：2026-04-08 22:56
> 诊断方式：5个子agent并行分析
> 状态：待修复

---

## 🎯 问题总览

用户反馈："有种说不上来的诡异感，效果很一般"

---

## 🔍 五维度诊断结果

### 1. 视觉效果检查

| 问题 | 分析 |
|------|------|
| **叠加方式错误** | 画半透明圆圈叠加会产生"圈感"和"脏色" |
| **颜色诡异** | 峰白谷灰叠加像"涂油漆"，不像光线穿过水 |
| **波纹不自然** | 硬边缘、等间距、缺乏流动感 |

**核心问题**：当前实现混淆了"明暗"和"扭曲"。水的清透感主要来自光线折射（扭曲），而不是简单的颜色明暗变化。

---

### 2. 算法实现检查

| 问题 | 分析 |
|------|------|
| **双重衰减** | `calculateWaveHeight` 内部衰减 + `drawWaves` 再次衰减 |
| **效果** | 边缘效果过弱 |
| **函数未使用** | `calculateDistortion` 定义了但从未调用 |

---

### 3. 参数调优检查

| 问题 | 分析 |
|------|------|
| **运动方向冲突** | waveSpeed较慢可能导致"波纹向内收缩"错觉 |
| **强度不平衡** | 扭曲12px明显，明暗0.2微妙，产生"塑料感" |

**建议参数调整**：
```javascript
waveSpeed: 0.35,      // 0.12 → 0.35
maxDistort: 10,       // 12 → 10
maxBrightness: 0.35   // 0.2 → 0.35
```

---

### 4. 用户体验检查

| 问题 | 分析 |
|------|------|
| **SVG与Canvas脱节** | Canvas波纹位置与SVG扭曲位置无关 |
| **"圈感"严重** | 画离散圆圈而非连续波面 |
| **扭曲无方向** | SVG随机噪声 vs 真实涟漪径向扭曲 |

---

### 5. 技术实现检查

未完成（超时），但其他维度已覆盖核心问题。

---

## 🎯 根本原因

### 核心问题：技术架构冲突

```
Canvas画圈：位置由 waveRadius 决定
     ↓
     ❌ 不匹配！
     ↓
SVG扭曲：随机噪声，与波形位置无关
```

**用户看到的**：
- Canvas画的明暗圆圈（视觉信号A）
- SVG产生的随机扭曲（视觉信号B）
- 两者独立存在，没有空间对应关系 → 产生"分离感"、"诡异感"

---

### 实现与设计不符

**设计文档定义**：
```javascript
// 波峰向外扭曲，波谷向内扭曲
function calculateDistortion(waveHeight, decay, maxDistort) {
  return waveHeight * decay * maxDistort;  // 保留方向性
}
```

**实际实现**：
```javascript
// 用SVG随机噪声，忽略波形位置
turbulence.setAttribute('baseFrequency', '0.008');  // 全局随机
```

**结果**：扭曲算法设计正确但从未使用。

---

## 📋 修复方案

### P0：统一波形与扭曲（核心）

**方案：纯Canvas像素操作**

```javascript
// 不用SVG滤镜，直接在Canvas上扭曲像素
// 1. 截取涟漪区域的页面内容
// 2. 根据波形高度计算每个像素的偏移
// 3. 波峰向外偏移，波谷向内偏移
// 4. 绘制扭曲后的内容
```

**优点**：
- 波形位置直接决定扭曲效果
- 明暗效果来自扭曲程度，不需要额外叠加层
- 消除SVG与Canvas的分离感

---

### P1：消除"圈感"

**方案：不画波纹圈**

```javascript
// 不要画：
ctx.stroke();  // 硬边圆圈

// 改为：
// 扭曲本身就是波纹效果
// 不需要额外画线条
```

---

### P2：修复双重衰减

**方案：只在一处衰减**

```javascript
// 移除 calculateWaveHeight 内的衰减
function calculateWaveHeight(distance, radius, phase) {
  if (distance > radius || radius <= 0) return 0;
  return Math.sin(distance * config.frequency - phase + Math.PI / 2);
}

// 在调用处统一衰减
const decay = calculateDistanceDecay(distance, radius);
const finalWaveHeight = waveHeight * decay;
```

---

### P3：调整参数

```javascript
const config = {
  maxRipples: 3,
  maxRadius: 400,
  expandSpeed: 1.2,
  waveSpeed: 0.35,        // ↑ 提升波形传播速度
  frequency: 0.035,
  maxDistort: 10,         // ↓ 略降扭曲
  maxBrightness: 0.35,    // ↑ 提升明暗对比（如果保留明暗）
  fadeStart: 0.6
};
```

---

## 🎯 预期修复后效果

| 特征 | 修复后 |
|------|--------|
| **清透感** | 能看到涟漪区域内内容被扭曲变形 |
| **起伏感** | 波峰内容向外扩散，波谷向内收缩 |
| **流动感** | 波形传播流畅自然 |
| **自然消失** | 边缘柔和衰减，无固定中心亮点 |

---

## 📂 相关文件

| 文件 | 说明 |
|------|------|
| `scripts/ripple-refraction.js` | 涟漪系统代码 |
| `behind-world-p1/WAVE-ALGORITHM.md` | 波形算法设计文档 |
| `behind-world-p1/OPTIMIZATION.md` | 优化记录 |

---

*诊断完成，待修复*