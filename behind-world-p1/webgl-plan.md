# WebGL 涟漪折射方案 - 修复计划

> 日期：2026-04-09
> 方案：WebGL Shader
> 目标：实现真正的涟漪折射效果，GPU 并行渲染

---

## 一、核心原理

### WebGL Shader 涟漪折射

```
页面内容作为纹理传入 GPU
     ↓
点击 → Shader 计算波形高度（基于距离和相位）
     ↓
片段着色器中根据波形做纹理坐标偏移：
  - 波峰：uv 向外偏移（采样更外的像素）
  - 波谷：uv 向内偏移（采样更内的像素）
     ↓
GPU 并行渲染所有像素 → 高性能涟漪折射效果
```

### 技术流程

```
1. html2canvas 截取页面内容 → 生成纹理
2. WebGL 渲染全屏 Quad → 应用涟漪 Shader
3. Shader 中：
   - 计算每个像素到涟漪中心的距离
   - 计算波形高度 = sin(distance × frequency - phase)
   - 计算折射偏移 = waveHeight × decay × maxDisplacement
   - 偏移纹理坐标 → 采样背景纹理
4. 涟漪消失后 → 恢复正常渲染
```

---

## 二、架构设计

### 层级结构

```
原有 DOM 层（z-index: 0-99）
     ↓
WebGL Canvas 层（z-index: 100） ← 涟漪层
     ↓
光标层（z-index: 1000）
```

### 双世界处理

| 世界 | WebGL Canvas | 纹理来源 |
|------|-------------|---------|
| **表层世界** | surfaceCanvas | html2canvas(surface-world) |
| **背后世界** | behindCanvas | html2canvas(behind-world) |

### 交互流程

```
点击非交互区域 → 创建涟漪
     ↓
判断当前可见世界 → 截取对应 DOM 内容
     ↓
生成纹理 → 传入 WebGL → 启动涟漪 Shader
     ↓
涟漪扩散 → Shader 实时计算折射
     ↓
涟漪消失 → 移除纹理 → 恢复 DOM 显示
```

---

## 三、关键技术难点

### 难点1：纹理捕获（html2canvas）

**问题**：
- 每次点击都要截取整个页面
- 性能开销大
- 跨域图片可能无法截取

**解决方案**：
```javascript
// 方案A：只截取涟漪区域（性能优化）
const region = {
  x: clickX - maxRadius,
  y: clickY - maxRadius,
  width: maxRadius * 2,
  height: maxRadius * 2
};
const canvas = await html2canvas(element, {
  x: region.x,
  y: region.y,
  width: region.width,
  height: region.height
});

// 方案B：预缓存页面内容（适合静态内容）
// 页面加载时一次性截取，涟漪时使用缓存
```

### 难点2：动态内容更新

**问题**：
- 截取是静态的，涟漪期间页面内容变化无法反映

**解决方案**：
- 你的网站是静态内容（文字、图片、固定布局）
- 动态元素只有：光影流动、头像颜色流转、导航高亮
- **简化方案**：涟漪期间暂停动态效果，或接受静态涟漪

### 难点3：WebGL 与 DOM 层叠

**问题**：
- WebGL Canvas 会覆盖 DOM 元素
- 点击事件穿透问题

**解决方案**：
```javascript
// WebGL Canvas 设置
canvas.style.cssText = `
  position: fixed;
  top: 0; left: 0;
  width: 100%; height: 100%;
  pointer-events: none;  /* 不阻挡点击事件 */
  z-index: 100;
  opacity: 0;  /* 默认透明，涟漪时显示 */
`;
```

---

## 四、Shader 代码设计

### Vertex Shader（全屏 Quad）

```glsl
attribute vec2 a_position;
attribute vec2 a_texCoord;

varying vec2 v_texCoord;

void main() {
  gl_Position = vec4(a_position, 0.0, 1.0);
  v_texCoord = a_texCoord;
}
```

### Fragment Shader（涟漪折射）

```glsl
precision mediump float;

varying vec2 v_texCoord;

uniform sampler2D u_background;  // 页面背景纹理
uniform vec2 u_rippleCenter;     // 涟漪中心 (屏幕坐标转UV)
uniform float u_rippleRadius;    // 涟漪半径 (像素)
uniform float u_ripplePhase;     // 波形相位
uniform float u_frequency;       // 波形频率
uniform float u_maxDisplacement; // 最大位移
uniform float u_opacity;         // 涟漪透明度
uniform vec2 u_resolution;       // 屏幕分辨率

void main() {
  // 1. UV → 屏幕坐标
  vec2 screenPos = v_texCoord * u_resolution;
  
  // 2. 计算到涟漪中心的距离
  vec2 delta = screenPos - u_rippleCenter;
  float distance = length(delta);
  
  // 3. 不在涟漪范围内 → 直接采样背景
  if (distance > u_rippleRadius) {
    gl_FragColor = texture2D(u_background, v_texCoord);
    return;
  }
  
  // 4. 计算波形高度
  float waveHeight = sin(distance * u_frequency - u_ripplePhase);
  
  // 5. 距离衰减
  float progress = distance / u_rippleRadius;
  float decay = 1.0 - progress * progress;
  
  // 6. 计算折射偏移
  // 波峰(waveHeight > 0)：向外偏移 → 采样更外的像素
  // 波谷(waveHeight < 0)：向内偏移 → 采样更内的像素
  vec2 direction = normalize(delta);
  float displacement = waveHeight * decay * u_maxDisplacement;
  vec2 offset = direction * displacement / u_resolution;  // 转为UV偏移
  
  // 7. 偏移纹理坐标采样
  vec2 distortedUV = v_texCoord + offset;
  
  // 8. 边界检查
  distortedUV = clamp(distortedUV, 0.0, 1.0);
  
  // 9. 采样背景纹理
  vec4 color = texture2D(u_background, distortedUV);
  
  // 10. 应用透明度（涟漪边缘渐隐）
  color.a *= u_opacity;
  
  gl_FragColor = color;
}
```

---

## 五、任务清单

### Phase 1：WebGL 基础架构搭建

- [ ] **Task 1.1**：创建 WebGL Canvas 层（surfaceCanvas + behindCanvas）
- [ ] **Task 1.2**：编写 WebGL 初始化代码（获取 context、创建 program）
- [ ] **Task 1.3**：编写 Vertex Shader + Fragment Shader
- [ ] **Task 1.4**：创建全屏 Quad（顶点数据）
- [ ] **Task 1.5**：设置 Shader uniform 变量

### Phase 2：纹理捕获系统

- [ ] **Task 2.1**：集成 html2canvas（CDN 或本地）
- [ ] **Task 2.2**：实现纹理捕获函数（截取指定区域）
- [ ] **Task 2.3**：实现纹理更新函数（传入 WebGL）
- [ ] **Task 2.4**：处理跨域问题（CSS 背景图、外部图片）

### Phase 3：涟漪生命周期管理

- [ ] **Task 3.1**：涟漪类设计（Ripple class）
- [ ] **Task 3.2**：涟漪创建逻辑（点击 → 创建涟漪）
- [ ] **Task 3.3**：涟漪更新逻辑（半径扩大、相位传播）
- [ ] **Task 3.4**：涟漪渲染逻辑（更新 Shader uniform）
- [ ] **Task 3.5**：涟漪消亡逻辑（opacity 衰减、纹理清理）

### Phase 4：动画循环

- [ ] **Task 4.1**：requestAnimationFrame 动画循环
- [ ] **Task 4.2**：多涟漪管理（maxRipples = 3）
- [ ] **Task 4.3**：双世界同步（表层 + 背后）

### Phase 5：参数调优

- [ ] **Task 5.1**：波形参数调整（frequency、waveSpeed）
- [ ] **Task 5.2**：折射强度调整（maxDisplacement）
- [ ] **Task 5.3**：衰减参数调整（fadeStart）
- [ ] **Task 5.4**：性能优化（降低采样分辨率）

### Phase 6：集成与测试

- [ ] **Task 6.1**：替换现有 ripple-refraction.js
- [ ] **Task 6.2**：测试点击响应
- [ ] **Task 6.3**：测试涟漪效果（波峰波谷折射）
- [ ] **Task 6.4**：测试性能（FPS、内存）
- [ ] **Task 6.5**：测试双世界切换

---

## 六、文件结构

```
aesthetic-portfolio/
├── index.html                  # 添加 html2canvas CDN
├── scripts/
│   ├── main.js                 # 主逻辑（不变）
│   ├── ripple-webgl.js         # ⭐ WebGL 涟漪系统（新建）
│   └── ripple-refraction.js    # 旧版本（保留备份）
├── shaders/
│   ├── ripple.vert             # Vertex Shader（新建）
│   └── ripple.frag             # Fragment Shader（新建）
└── behind-world-p1/
    ├── WEBGL-PLAN.md           # 本计划文档
    └── WEBGL-IMPLEMENTATION.md # 实现记录（新建）
```

---

## 七、预期效果

### 视觉效果

| 指标 | 目标 |
|------|------|
| **清透感** | 涟漪区域内容被折射变形，能看到扭曲效果 |
| **起伏感** | 波峰内容向外扩散，波谷内容向内收缩 |
| **流畅度** | 60 FPS，无卡顿 |
| **自然消失** | 边缘柔和衰减，无硬边界 |

### 性能指标

| 指标 | 目标 |
|------|------|
| **涟漪创建延迟** | < 100ms（html2canvas 截取） |
| **渲染 FPS** | ≥ 60 |
| **内存占用** | < 50MB（纹理缓存） |

---

## 八、风险与备选方案

### 风险1：html2canvas 性能不达标

**备选**：
- 预缓存页面内容（页面加载时一次性截取）
- 降低截取分辨率（如 50% 缩放）
- 只截取涟漪区域（而非全屏）

### 风险2：WebGL 兼容性问题

**备选**：
- 检测 WebGL 支持，不支持时降级到 CSS 方案
- 使用 WebGL2（更强大的 Shader 功能）

### 风险3：跨域图片无法截取

**备选**：
- 使用本地图片（而非 CDN）
- 使用 CORS 代理
- 简化背景（纯 CSS 渐变）

---

## 九、时间估算

| Phase | 估计时间 |
|-------|---------|
| Phase 1：基础架构 | 1-2 小时 |
| Phase 2：纹理捕获 | 2-3 小时 |
| Phase 3：涟漪管理 | 1 小时 |
| Phase 4：动画循环 | 1 小时 |
| Phase 5：参数调优 | 2-3 小时 |
| Phase 6：集成测试 | 1-2 小时 |
| **总计** | **8-12 小时** |

---

## 十、执行顺序

**严格按照以下顺序执行**：

1. Phase 1 → 2. Phase 2 → 3. Phase 3 → 4. Phase 4 → 5. Phase 5 → 6. Phase 6

**每个 Phase 完成后**：
- 测试该 Phase 的功能
- 记录实现细节到 `WEBGL-IMPLEMENTATION.md`
- 确认无问题后进入下一 Phase

---

*计划完成，待执行*