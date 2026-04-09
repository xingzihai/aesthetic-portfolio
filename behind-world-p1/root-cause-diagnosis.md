# 根本原因诊断报告

> 日期：2026-04-08 23:15
> 结论：**核心错误从未被修复**

---

## 🎯 一句话结论

**代码在"涂颜色"，而不是"折射页面内容"。**

---

## 🔴 根本问题

### 用户想要的是什么

从用户反馈（记录在 `understanding.md`）：

> "涟漪效果太丑了，不应该是这样的，应该是根据页面本身的显示内容进行'折射'才对"

用户要的是：
- **涟漪区域内的页面内容被扭曲变形**
- 像透过水波看东西，东西本身变形
- 不是在页面上面覆盖一层图形/颜色

### 当前代码实际做了什么

`ripple-refraction.js v0.29` 关心代码：

```javascript
// 计算偏移后的源位置
const srcX = px - Math.cos(angle) * displacement;
const srcY = py - Math.sin(angle) * displacement;

// ❌ 关键错误：直接设置颜色
let color;
if (waveHeight > 0) {
  color = `rgba(255, 245, 235, ${intensity * 0.35})`;  // 暖色调
} else {
  color = `rgba(180, 175, 170, ${intensity * 0.25})`;  // 暗色调
}

// ❌ 在偏移位置画颜色块
ctx.fillStyle = color;
ctx.fillRect(srcX - step/2, srcY - step/2, step, step);
```

**这是涂油漆，不是折射。**

---

## 📊 四次失败对比

| 版本 | 方案 | 错误 |
|------|------|------|
| v1 | Canvas画同心圆线条 | 在"画图形" |
| v2 | SVG滤镜全局扭曲 | 不是从点击点扩散 |
| v3 | Canvas涟漪 + SVG滤镜叠加 | 叠加两个效果，混乱 |
| v4 (v0.29) | Canvas画半透明颜色块 | 在"涂颜色" |

**共同根本问题**：从未真正**从页面采样像素并重排**。

---

## 💡 为什么看起来像"大粪"

1. **半透明颜色叠加**：`rgba(255, 245, 235, ...)` 和 `rgba(200, 230, 245, ...)` 直接覆盖在页面上
2. **没有清透感**：看不到涟漪区域内的页面内容
3. **颜色诡异**：暖色/冷色叠加产生"脏色"、"涂油漆"感
4. **形状混乱**：多个颜色块堆叠，没有真实的水折射效果

---

## ✅ 设计文档中的正确方案（从未实现）

`wave-algorithm.md` 中的位移算法：

```javascript
// 波峰向外位移（扩散效果）
// 波谷向内位移（收缩效果）
const displacement = waveHeight * decay * maxDisplacement;

// 计算新位置（从哪里采样）
const newDistance = distance + displacement;
const srcX = rippleX + Math.cos(angle) * newDistance;
const srcY = rippleY + Math.sin(angle) * newDistance;

// ✅ 正确：从新位置采样像素，绘制到当前位置
drawPixel(srcX, srcY, currentX, currentY);
```

**设计正确，但代码从未实现采样和重排。**

---

## 🔧 正确实现方案

### 方案一：SVG径向扭曲（推荐）

使用 `backdrop-filter` + 动态生成的径向 `feDisplacementMap`：

```javascript
// 创建涟漪区域元素
const rippleZone = document.createElement('div');
rippleZone.style.cssText = `
  position: fixed;
  left: ${x - radius}px;
  top: ${y - radius}px;
  width: ${radius * 2}px;
  height: ${radius * 2}px;
  border-radius: 50%;
  backdrop-filter: url(#radial-displacement-filter);
`;
```

**优点**：
- backdrop-filter 只对元素后面的内容生效
- 实现了真正的"折射"（内容扭曲）

**难点**：
- 需要动态生成径向位移滤镜
- 兼容性可能有问题

### 方案二：Canvas像素重排

```javascript
// 1. 截取涟漪区域的页面内容
const pageImage = capturePageRegion(x - radius, y - radius, radius * 2, radius * 2);

// 2. 根据波形计算每个像素的偏移
for (let py = 0; py < radius * 2; py++) {
  for (let px = 0; px < radius * 2; px++) {
    const distance = Math.sqrt((px - radius) ** 2 + (py - radius) ** 2);
    const waveHeight = calculateWaveHeight(distance, radius, phase);
    const displacement = waveHeight * maxDisp;
    
    // 波峰向外，波谷向内
    const srcX = px + Math.cos(angle) * displacement;
    const srcY = py + Math.sin(angle) * displacement;
    
    // 从源位置采样，绘制到目标位置
    const pixel = pageImage.getPixel(srcX, srcY);
    ctx.putPixel(px, py, pixel);
  }
}
```

**优点**：
- 完全控制效果
- 真实的像素重排

**难点**：
- 如何截取页面内容（html2canvas 太慢）
- 每帧重新采样开销大

---

## 📋 诊断结论

| 问题 | 状态 |
|------|------|
| **设计文档正确** | ✅ 位移算法设计正确 |
| **代码从未实现设计** | ❌ 涂颜色，不采样像素 |
| **两次修复失败原因** | 都是"画图形/涂颜色"，不是"折射内容" |
| **根本错误** | 从未捕获页面内容并重排像素 |

---

## 🎯 修复方向

**必须实现**：
1. 获取涟漪区域内的页面内容像素
2. 根据波形高度计算像素偏移
3. 重排像素：从源位置采样，绘制到目标位置

**不再做**：
- ❌ 画同心圆线条
- ❌ 全局SVG扭曲
- ❌ 涂半透明颜色块

---

*诊断完成。根本问题：代码从未真正实现"折射页面内容"，始终停留在"画图形/涂颜色"的层面。*