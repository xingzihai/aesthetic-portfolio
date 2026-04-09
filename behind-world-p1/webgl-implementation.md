# WebGL 涟漪折射实现记录

> 日期：2026-04-09
> 版本：v1.0
> 状态：Phase 1-4 完成，关键修正完成

---

## 已完成内容

### Phase 1：WebGL 基础架构

**文件**：`scripts/ripple-webgl.js`

**核心组件**：
- WebGL Canvas 层（surfaceCanvas + behindCanvas）
- Vertex Shader（全屏 Quad）
- Fragment Shader（涟漪折射算法，涟漪区域外透明）
- WebGL Program 创建与链接
- Uniform 变量管理（数组 uniform 逐个获取和设置）

### Phase 2：纹理捕获

**html2canvas CDN**：已添加到 index.html

**关键函数**：
- `captureTexture(isBehind)` - 截取指定世界内容
- `updateTexture(gl, texture, isBehind)` - 更新 WebGL 纹理

**跨域处理**：
```javascript
html2canvas(element, {
  scale: dpr,
  useCORS: true,
  allowTaint: true,
  backgroundColor: null
});
```

### Phase 3：涟漪生命周期

**Ripple 类属性**：
- `x, y` - 涟漪中心
- `radius` - 当前半径
- `phase` - 波形相位
- `opacity` - 透明度
- `alive` - 存活状态

**涟漪算法**：
```javascript
// 波形高度
waveHeight = sin(distance × frequency - phase)

// 距离衰减
decay = 1 - progress²

// 折射偏移
displacement = waveHeight × decay × maxDisplacement × opacity
```

### Phase 4：动画循环

**渲染流程**：
1. 更新所有涟漪状态
2. 移除死亡涟漪
3. 渲染 WebGL（更新 uniform）
4. 涟漪消失后隐藏 Canvas

---

## 关键修正记录

### 修正1：WebGL 数组 Uniform 传参

**问题**：WebGL 不支持 `uniform2fv` 整体赋值数组

**修正**：
```javascript
// 逐个获取 uniform location
for (let i = 0; i < 3; i++) {
  rippleCenters.push(gl.getUniformLocation(program, `u_rippleCenters[${i}]`));
}

// 逐个设置 uniform 值
ripples.forEach((ripple, i) => {
  gl.uniform2f(uniforms.rippleCenters[i], ripple.x * dpr, ripple.y * dpr);
});
```

### 修正2：Shader 输出透明区域

**问题**：Shader 渲染整个背景纹理，覆盖 DOM 动态内容

**修正**：Shader 中涟漪区域外输出 `vec4(0, 0, 0, 0)`（透明），DOM 内容透过 Canvas 显示

```glsl
// 默认透明
vec4 color = vec4(0.0, 0.0, 0.0, 0.0);

// 只在涟漪区域内渲染
if (totalWeight > 0.01) {
  color.a = 1.0;
}
```

### 修正3：WebGL Clear 背景透明

**修正**：
```javascript
gl.clearColor(0, 0, 0, 0);
gl.clear(gl.COLOR_BUFFER_BIT);
```

### 修正4：背后世界可见性判断

**问题**：原代码通过 opacity 判断，但背后世界通过 `clip-path` 控制

**修正**：
```javascript
const clipPath = behindWorld?.style.clipPath || '';
const radiusMatch = clipPath.match(/circle\((\d+)px/);
const portalRadius = radiusMatch ? parseInt(radiusMatch[1]) : 0;
const isBehindVisible = portalRadius > 0;
```

---

## 当前参数

```javascript
config = {
  maxRipples: 3,
  maxRadius: 350,      // 涟漪最大半径
  expandSpeed: 2.5,    // 扩散速度
  waveSpeed: 0.4,      // 波形传播速度
  frequency: 0.03,     // 波纹频率
  maxDisplacement: 8,  // 最大折射位移
  fadeStart: 0.5       // 开始衰减的进度
};
```

---

## 待测试问题

### 问题1：html2canvas 截取是否成功？

**风险**：
- CSS 背景图可能无法截取
- 动态光影效果是否被捕获

**验证方法**：
```javascript
// 浏览器控制台
await debugRipple.createRipple(100, 100);
// 查看涟漪是否出现
```

### 问题2：Shader 是否编译成功？

**验证方法**：
```javascript
// 检查控制台是否有 Shader 编译错误
// 应看到 "WebGL 涟漪折射系统 v1.0 已初始化"
```

### 问题3：涟漪折射效果是否正确？

**预期效果**：
- 点击非交互区域 → 涟漪扩散
- 涟漪区域内内容被折射变形
- 波峰内容向外扩散，波谷内容向内收缩
- 涟漪区域外显示原始 DOM（透明）
- 涟漪消失后恢复正常

---

## 调试接口

```javascript
// 浏览器控制台可用
window.debugRipple = {
  config,          // 配置参数
  ripples,         // 当前涟漪数组
  createRipple,    // 手动创建涟漪
  surfaceCanvas,   // 表层 WebGL Canvas
  behindCanvas     // 背后 WebGL Canvas
};
```

---

## 下一步：Phase 6 集成测试

需要用户在浏览器中测试：
1. 打开页面
2. 点击非交互区域
3. 检查涟漪效果
4. 检查控制台错误
5. 检查性能

---

*代码完成，待浏览器测试*