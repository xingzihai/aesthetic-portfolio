# 最终设计规范

> 唯一标准：高质量。不惜一切代价。

---

## 设计原则

### 1. 细节至上

**不问"用户是否注意到"，只问"这是否是最好的选择"。**

- 60秒背景光影：做，因为这是印象派的灵魂
- 紫色阴影：做，因为莫奈就是这样画阴影的
- 内部光晕：做，因为光从内部透出是印象派的特征
- 光斑模糊：做，因为这是笔触的数字化

**印象派的核心**：莫奈花30年画《睡莲》系列，每一笔都是为了捕捉光。他不会问"看的人会不会注意到这个紫色阴影"。

### 2. 完整性

**中文字体必须支持，不能妥协为系统默认。**

### 3. 不考虑"成本"

- 加载量？优化加载策略，不减少内容
- 性能？用最优技术实现，不降低质量
- 开发时间？做到满意为止

---

## 中文字体方案

### 方案确认

**中文衬线：思源宋体（Noto Serif SC）**
- 与 Cormorant Garamond 风格接近：都是优雅的衬线字体
- 支持完整中文简体
- Google Fonts 提供，CDN 加速
- 开源免费，可商用

**中文无衬线：思源黑体（Noto Sans SC）**
- 与 Inter 风格接近：都是现代简洁的无衬线字体
- 支持完整中文简体
- Google Fonts 提供，CDN 加速
- 开源免费，可商用

### 字体加载策略

```html
<!-- 预连接 -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>

<!-- 英文字体 -->
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">

<!-- 中文字体：使用 display=swap 避免阻塞渲染 -->
<link href="https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;500;600;700&family=Noto+Sans+SC:wght@400;500;600&display=swap" rel="stylesheet">
```

### CSS 字体定义

```css
:root {
  /* 标题：英文优先，中文后备 */
  --font-display: 'Cormorant Garamond', 'Noto Serif SC', Georgia, serif;
  
  /* 正文：英文优先，中文后备 */
  --font-body: 'Inter', 'Noto Sans SC', -apple-system, sans-serif;
  
  /* 等宽字体 */
  --font-mono: 'JetBrains Mono', 'Noto Sans Mono SC', monospace;
}
```

### 中文字体子集优化

**问题**：思源字体完整版约 7MB，加载慢。

**解决方案**：使用 Google Fonts 的自动子集化功能。Google Fonts 会根据页面实际使用的字符动态生成子集，大幅减少加载量。

```html
<!-- Google Fonts 会自动处理子集化 -->
<!-- 无需手动配置 -->
```

**性能数据**：
- 英文字体（Cormorant + Inter）：约 50KB
- 中文字体（Noto Serif SC + Noto Sans SC）：约 100-200KB（子集化后）
- 总计：约 150-250KB（可接受）

---

## 动画层级最终方案

**三层动态，全部保留：**

### 层级1：背景光影（60秒周期）
- 莫奈式光影流动
- 位置：全屏背景
- 技术：伪元素 + transform（GPU加速）

### 层级2：光斑粒子（30秒周期）
- 印象派笔触模拟
- 数量：5个
- 技术：transform + opacity + filter: blur

### 层级3：动态头像（20秒旋转 + 10秒颜色变化）
- 冰晶几何 + 枸杞核心
- 技术：CSS 3D transform + 渐变动画

**协调原则**：所有动态遵循同一方向（顺时针），创造"和谐流动"的感觉。

---

## 配色系统最终确认

### 核心色彩

```css
:root {
  /* 莫兰迪画布 */
  --canvas-bg: #E8DFD6;
  --canvas-card: #F5F1ED;
  --canvas-deep: #C9B8A8;
  
  /* 莫奈光影 */
  --monet-sunrise: #FFB088;     /* 日出橙 */
  --monet-sky-morning: #C4CED2; /* 清晨天空 */
  --monet-sky-evening: #988898; /* 黄昏紫 */
  --monet-water: #A8B4B8;       /* 水面蓝 */
  --monet-lily: #D8B0C0;        /* 睡莲粉 */
  
  /* 文字 */
  --text-100: #3D3228;  /* 标题 */
  --text-200: #5C4A3D;  /* 次标题 */
  --text-300: #7A7A7A;  /* 正文 */
  --text-400: #9A9A9A;  /* 辅助 */
  --text-inverse: #F5F1ED;
  
  /* 阴影（互补色） */
  --shadow-purple: rgba(152, 136, 152, 0.1);
  --shadow-blue: rgba(168, 180, 184, 0.08);
}
```

### 无纯黑纯白

- ❌ `#000000` → ✅ `#3D3228`（深褐）
- ❌ `#FFFFFF` → ✅ `#FAF8F5`（米白）

### 阴影用互补色

```css
/* 卡片阴影 */
box-shadow: 0 8px 32px rgba(152, 136, 152, 0.1);

/* 悬停阴影 */
box-shadow: 0 16px 48px rgba(152, 136, 152, 0.15);
```

---

## 页面结构最终确认

### 单页结构

```
┌─────────────────────────────────────┐
│           导航栏（固定）              │
├─────────────────────────────────────┤
│                                     │
│    ┌─────────────────────────┐     │
│    │      Hero 区            │     │
│    │  [头像] [名字] [定位]    │     │
│    │  背景：光影流动          │     │
│    └─────────────────────────┘     │
│                                     │
├─────────────────────────────────────┤
│                                     │
│    ┌─────────────────────────┐     │
│    │    美学展示区            │     │
│    │  [配色] [字体] [渐变]    │     │
│    └─────────────────────────┘     │
│                                     │
├─────────────────────────────────────┤
│                                     │
│    ┌─────────────────────────┐     │
│    │    设计理念区            │     │
│    │  印象派 × 莫兰迪         │     │
│    └─────────────────────────┘     │
│                                     │
├─────────────────────────────────────┤
│                                     │
│    ┌─────────────────────────┐     │
│    │    技术能力区            │     │
│    │  代码的笔触             │     │
│    └─────────────────────────┘     │
│                                     │
├─────────────────────────────────────┤
│                                     │
│    ┌─────────────────────────┐     │
│    │    结尾区               │     │
│    │  [联系方式] [社交链接]   │     │
│    └─────────────────────────┘     │
│                                     │
└─────────────────────────────────────┘
```

---

## 组件设计最终确认

### Hero 区

```html
<section class="hero">
  <!-- 背景：光影流动 -->
  <div class="hero-light-flow"></div>
  
  <!-- 光斑粒子 -->
  <div class="hero-particles">
    <span class="particle p1"></span>
    <span class="particle p2"></span>
    <span class="particle p3"></span>
    <span class="particle p4"></span>
    <span class="particle p5"></span>
  </div>
  
  <!-- 内容 -->
  <div class="hero-content">
    <!-- 头像 -->
    <div class="avatar-container">
      <div class="avatar-core"></div>
      <div class="avatar-crystal">
        <span class="crystal-face f1"></span>
        <span class="crystal-face f2"></span>
        <span class="crystal-face f3"></span>
        <span class="crystal-face f4"></span>
        <span class="crystal-face f5"></span>
        <span class="crystal-face f6"></span>
      </div>
      <div class="avatar-glow"></div>
    </div>
    
    <!-- 标识 -->
    <div class="hero-identity">
      <h1 class="hero-name">xingzihai</h1>
      <p class="hero-name-cn">冰水泡枸杞</p>
      <p class="hero-tagline">星光落入冰水，温暖慢慢渗透</p>
    </div>
  </div>
</section>
```

### 画廊卡片

```html
<article class="gallery-card">
  <!-- 内部光晕 -->
  <div class="card-inner-glow"></div>
  
  <!-- 内容 -->
  <div class="card-content">
    <h3 class="card-title">...</h3>
    <div class="card-body">...</div>
  </div>
</article>
```

---

## 文件结构

```
aesthetic-portfolio/
│
├── index.html              # 首页
├── style.css               # 主样式
├── scripts/
│   └── main.js             # 交互逻辑
│
├── color-reference/        # 配色参考库（已完成）
│   └── ...
│
├── DESIGN.md               # 美学设计规范
├── IMPRESSIONIST-DESIGN.md # 印象派设计规范
├── DESIGN-RATIONALE.md     # 设计理由与反思
├── DESIGN-FINAL.md         # 本文档
├── ARCHITECTURE.md         # 架构设计
│
└── README.md               # 项目说明
```

---

## 实现检查清单

### P0：核心实现

- [ ] index.html 页面结构
- [ ] style.css 完整样式
- [ ] 字体加载（中英文）
- [ ] 背景光影动画
- [ ] 光斑粒子动画
- [ ] 动态头像
- [ ] 画廊卡片
- [ ] 响应式适配

### P1：交互实现

- [ ] 导航栏固定
- [ ] 卡片悬停效果
- [ ] 滚动触发动画
- [ ] 平滑滚动

### P2：细节打磨

- [ ] 内部光晕效果
- [ ] 紫色阴影
- [ ] 文字光晕动画
- [ ] 渐隐结尾

### P3：性能优化

- [ ] 字体预加载
- [ ] 图片懒加载
- [ ] 动画GPU优化
- [ ] 移动端动画降级

---

## 开始编码

**确认以上设计规范后，开始实现：**

1. 创建 `index.html` 完整结构
2. 创建 `style.css` 完整样式
3. 创建 `scripts/main.js` 交互逻辑
4. 测试与微调

---

*Final Design Specification v1.0 · 2026-04-02*

**准备好开始编码了。**