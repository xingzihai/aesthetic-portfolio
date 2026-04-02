# 印象派美学设计规范

> 专业艺术家 + 设计师 + 心理学专家视角

---

## 一、莫奈印象派风格深度解析

### 1.1 印象派艺术核心特征

**历史背景**：
莫奈（Claude Monet, 1840-1926）是印象派创始人之一。"印象派"名称源于其作品《日出·印象》（Impression, Soleil Levant, 1872），评论家嘲讽这幅画"只是一个印象，而非完成的画作"，却意外成就了一个艺术流派。

**技法特征**：

| 特征 | 莫奈技法 | 数字化转译 |
|------|----------|------------|
| **光影捕捉** | 记录不同时段的光线变化 | 动态颜色渐变、实时变化 |
| **并列笔触** | 纯色并列而非混合，让眼睛自行融合 | 不使用纯灰，而是多色叠加 |
| **空气感** | 朦胧、模糊、无清晰边界 | 模糊阴影、柔和过渡、无硬边框 |
| **瞬时性** | 捕捉"现在这一刻"而非永恒 | 持续运动的视觉元素 |
| **氛围优先** | 光与色彩比物体更重要 | 抽象几何胜于具体图形 |

**色彩哲学**：
- 莫奈不相信"黑色"，他用深蓝、紫、深绿代替
- 他用互补色制造阴影（橙色物体的阴影是蓝紫色）
- 阳光是黄橙色与粉色的交织
- 水面反射天空的蓝，同时折射阳光的暖

### 1.2 莫奈经典配色分析

**《日出·印象》配色**：
```
天空渐变：蓝灰 → 橙粉 → 黄白
水面倒影：蓝灰 → 橙粉（模糊）
太阳核心：纯橙 #FF6B35
太阳光晕：粉橙 #FFB088
朦胧船只：深蓝紫 #4A5568
```

**《睡莲》系列配色**：
```
水面基础：蓝绿灰 #7C8A7C → 雾霾蓝 #A8B4B8
睡莲花瓣：粉白 #E8D0D8 → 灰粉 #D4C4BC → 灰玫红 #D8B0C0
睡莲中心：深玫红 #985060
倒影光斑：黄色光点 #D8D0B8
荷叶暗部：深灰绿 #3C4A3C
```

**《干草堆》系列（不同时段）**：
```
清晨：冷蓝 + 淡黄 + 灰粉
正午：金黄 + 白 + 深绿阴影
黄昏：橙红 + 紫粉 + 深蓝阴影
```

### 1.3 印象派 × 莫兰迪融合策略

**矛盾与统一**：
- 莫兰迪：低饱和、沉静、永恒感
- 莫奈：光影变化、动态、瞬时感
- 融合：用莫兰迪的灰调作为"画布"，莫奈的光影作为"画笔"

**具体策略**：

```css
/* 背景层：莫兰迪沉静 */
--base-bg: #E8DFD6;      /* 暖米色画布 */
--base-shadow: #B5B5B5;  /* 灰色底调 */

/* 光影层：莫奈动态 */
--light-warm: #FFB088;   /* 莫奈阳光 */
--light-cool: #A8B4B8;   /* 莫奈天空 */
--shadow-complement: #988898; /* 互补阴影（紫色代替黑色） */

/* 融合方式 */
background: 
  var(--base-bg),                    /* 莫兰迪画布 */
  linear-gradient(莫奈光影动画);      /* 动态叠加 */
```

---

## 二、品牌标识：xingzihai（冰水泡枸杞）

### 2.1 名字意象解析

**xingzihai**：
- "星"（xing）：星辰、光芒、遥远而明亮
- "子"（zi）：微小粒子、本质、种子
- "海"（hai）：广阔、深邃、包容

**中文"冰水泡枸杞"意象**：
- 冰水：冷静、清澈、透明
- 枸杞：温暖、红润、生命力
- 泡：过程、等待、渗透、融合

**视觉转译**：

| 意象 | 颜色 | 动态 |
|------|------|------|
| 冰水 | 冷蓝、透明灰 | 缓慢流动、涟漪 |
| 枸杞 | 橙红、暖粉 | 缓慢变色、光晕扩散 |
| 泡的过程 | 融合渐变 | 红色向透明渗透 |

### 2.2 一句话定位（印象派表达）

**不使用具体描述，而是意象传达**：

**方案A**：
> "在光的流动中，寻找沉静的瞬间"

**方案B**：
> "用代码画出光，让时间慢下来"

**方案C**：
> "星光落入冰水，温暖慢慢渗透"

**建议选择C**：
- 匹配名字意象（星 + 冰水 + 温暖）
- 印象派风格（光 + 时间）
- 诗意而非具体（艺术化）

---

## 三、动态视觉元素设计

### 3.1 设计哲学

**持续运动 ≠ 干扰体验**

心理学研究表明，适度的动态元素可以：
- 提高注意力保持（避免静态疲劳）
- 创造"活着"的感觉（生命力）
- 提供视觉锚点（帮助眼睛休息后重新聚焦）

**关键约束**：
- 动画必须**低于意识阈值**（用户不主动注意到）
- 动画速度必须**足够慢**（每周期 > 10秒）
- 动画幅度必须**足够小**（变化 < 10%）
- 动画位置必须**不在阅读区域**（避免干扰）

### 3.2 动态元素层级

```
层级1：背景层 ──────── 最慢、最大幅度、最低注意力
   ├── 整体渐变流动（60秒周期）
   └── 光斑缓慢移动（30秒周期）
   
层级2：装饰层 ──────── 中速、中等幅度、次要视觉
   ├── 几何图形缓慢旋转（20秒周期）
   ├── 边框颜色微变（15秒周期）
   
层级3：头像层 ──────── 焦点动态、可主动观看
   ├── 3D几何持续旋转
   ├── 颜色缓慢渐变（10秒周期）
   
层级4：交互层 ──────── 用户触发、即时反馈
   ├── hover 动画（200ms）
   ├── 点击反馈（100ms）
```

### 3.3 背景光影系统

**莫奈式光影流动**：

```css
/* 整体背景：莫兰迪画布 + 莫奈光影 */
.body-bg {
  /* 基础：莫兰迪暖米 */
  background-color: #E8DFD6;
  
  /*叠加：莫奈光影动画 */
  background-image: 
    radial-gradient(
      ellipse at 30% 20%,      /* 光源位置：左上 */
      rgba(255, 176, 88, 0.15) 0%,   /* 莫奈阳光 */
      rgba(255, 176, 88, 0) 60%      /* 渐隐 */
    ),
    radial-gradient(
      ellipse at 70% 80%,      /* 反光位置：右下 */
      rgba(168, 180, 184, 0.12) 0%,  /* 莫奈天空蓝 */
      rgba(168, 180, 184, 0) 50%
    );
  
  /* 动画：光源位置缓慢移动 */
  animation: light-flow 60s ease-in-out infinite;
}

@keyframes light-flow {
  0% {
    background-position: 0% 0%, 100% 100%;
  }
  25% {
    background-position: 25% 15%, 75% 85%;
  }
  50% {
    background-position: 50% 30%, 50% 70%;
  }
  75% {
    background-position: 75% 15%, 25% 85%;
  }
  100% {
    background-position: 0% 0%, 100% 100%;
  }
}
```

**光斑粒子系统**：

```css
/* 漂浮光斑（印象派笔触模拟） */
.light-particle {
  position: absolute;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: radial-gradient(
    circle,
    rgba(255, 176, 88, 0.08) 0%,   /* 莫奈阳光色 */
    transparent 70%
  );
  animation: float-particle 30s ease-in-out infinite;
  filter: blur(20px);  /* 印象派模糊 */
}

@keyframes float-particle {
  0%, 100% {
    transform: translate(0, 0);
    opacity: 0.3;
  }
  25% {
    transform: translate(50px, -30px);
    opacity: 0.5;
  }
  50% {
    transform: translate(100px, 20px);
    opacity: 0.4;
  }
  75% {
    transform: translate(50px, 40px);
    opacity: 0.35;
  }
}
```

### 3.4 装饰几何元素

**印象派式模糊几何**：

```css
/* 背景装饰：模糊几何 */
.bg-geo {
  position: fixed;
  pointer-events: none;
  opacity: 0.4;
  filter: blur(40px);  /* 印象派笔触模糊 */
  animation: geo-slow-rotate 45s linear infinite;
}

@keyframes geo-slow-rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
```

**配色建议**：
- 使用莫奈互补色系统
- 一个暖色（橙粉）+ 一个冷色（蓝紫）
- 不使用纯灰，而是灰调互补色

---

## 四、动态3D几何头像设计

### 4.1 设计理念

**"冰水泡枸杞"的几何转译**：

| 元素 | 几何表示 | 动态表现 |
|------|----------|----------|
| 冰水 | 透明多面体（冰晶） | 缓慢旋转、折射光线 |
| 枸杞 | 红色核心（温暖光源） | 颜色脉冲、向外扩散 |
| 泡的过程 | 颜色从中心向外渗透 | 缓慢渐变动画 |

**几何结构**：
- 核心：暖色球体（枸杞）
- 外层：透明低多边形（冰晶）
- 光效：中心向外发散的光晕

### 4.2 技术实现方案

**方案A：CSS 3D Transform**（推荐，轻量）

```css
.avatar-3d {
  width: 200px;
  height: 200px;
  perspective: 1000px;
  position: relative;
}

.avatar-core {
  /* 枸杞核心：暖色球体 */
  position: absolute;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  background: radial-gradient(
    circle at 30% 30%,
    #FFB088 0%,     /* 莫奈阳光 */
    #D8B0C0 50%,    /* 灰玫红 */
    #985060 100%    /* 深玫红 */
  );
  animation: core-pulse 10s ease-in-out infinite;
  box-shadow: 
    0 0 40px rgba(255, 176, 88, 0.4),
    0 0 80px rgba(255, 176, 88, 0.2);
}

.avatar-crystal {
  /* 冰晶外层：低多边形 */
  position: absolute;
  width: 100%;
  height: 100%;
  transform-style: preserve-3d;
  animation: crystal-rotate 20s linear infinite;
}

.crystal-face {
  /* 多面体的各个面 */
  position: absolute;
  width: 100px;
  height: 100px;
  background: rgba(168, 180, 184, 0.15);  /* 冰色透明 */
  border: 1px solid rgba(168, 180, 184, 0.3);
  backface-visibility: visible;
  filter: blur(1px);  /* 冰晶模糊 */
}

@keyframes core-pulse {
  0%, 100% {
    background: radial-gradient(circle, #FFB088, #D8B0C0, #985060);
    box-shadow: 0 0 40px rgba(255, 176, 88, 0.4);
  }
  33% {
    background: radial-gradient(circle, #FF8B66, #C890A0, #786878);
    box-shadow: 0 0 50px rgba(255, 139, 102, 0.5);
  }
  66% {
    background: radial-gradient(circle, #FFD088, #B8A8B8, #584858);
    box-shadow: 0 0 45px rgba(255, 208, 136, 0.45);
  }
}

@keyframes crystal-rotate {
  from { transform: rotateY(0deg) rotateX(15deg); }
  to { transform: rotateY(360deg) rotateX(15deg); }
}
```

**方案B：Canvas/WebGL**（更精细，可选）

如果需要更复杂的3D效果，可以使用轻量 WebGL：
- Three.js（但会增加依赖）
- 纯 WebGL（最轻，但代码复杂）

**建议**：先用 CSS 3D 实现，效果足够且性能最优。

### 4.3 头像容器设计

```html
<div class="avatar-container">
  <!-- 3D几何头像 -->
  <div class="avatar-3d">
    <div class="avatar-core"></div>
    <div class="avatar-crystal">
      <!-- 多个面组成低多边形 -->
    </div>
  </div>
  
  <!-- 光晕层 -->
  <div class="avatar-glow"></div>
</div>
```

**视觉规格**：
- 尺寸：200px × 200px
- 位置：Hero 区左侧或中央
- 响应式：移动端缩小为 150px

---

## 五、色彩系统：印象派融合配色

### 5.1 新配色变量系统

```css
:root {
  /* ========== 莫兰迪基础画布 ========== */
  --canvas-bg: #E8DFD6;
  --canvas-card: #F5F1ED;
  --canvas-text: #5C4A3D;
  
  /* ========== 莫奈光影系统 ========== */
  --monet-sunrise: #FFB088;     /* 日出橙 */
  --monet-sun-core: #FF6B35;    /* 太阳核心 */
  --monet-sky-morning: #C4CED2; /* 清晨天空 */
  --monet-sky-evening: #988898; /* 黄昏天空 */
  --monet-water: #A8B4B8;       /* 水面蓝 */
  --monet-lily: #D8B0C0;        /* 睡莲粉 */
  --monet-lily-dark: #985060;   /* 睡莲深 */
  --monet-leaf: #7C8A7C;        /* 荷叶绿 */
  
  /* ========== 融合色（莫兰迪灰调 + 莫奈色相） ========== */
  --fusion-warm: #C8B8A8;       /* 灰橙（日落） */
  --fusion-cool: #B8A8B8;       /* 灰紫（黄昏） */
  --fusion-pink: #D4C4BC;       /* 灰粉（睡莲） */
  --fusion-green: #9CAA9C;      /* 灰绿（荷叶） */
  
  /* ========== 动态光影 ========== */
  --light-source-warm: rgba(255, 176, 88, 0.15);
  --light-source-cool: rgba(168, 180, 184, 0.12);
  --shadow-complement: rgba(152, 136, 152, 0.08);  /* 紫色阴影代替黑色 */
  
  /* ========== 动画周期 ========== */
  --cycle-bg: 60s;              /* 背景光影流动 */
  --cycle-particle: 30s;        /* 光斑漂浮 */
  --cycle-avatar: 20s;          /* 头像旋转 */
  --cycle-color: 10s;           /* 颜色渐变 */
}
```

### 5.2 配色应用规则

**规则1：不使用纯黑/纯白**
```css
/* ❌ 错误 */
color: #000000;
color: #FFFFFF;

/* ✅ 正确（印象派） */
color: #3D3228;    /* 深褐代替黑 */
color: #FAF8F5;    /* 米白代替白 */
```

**规则2：阴影用互补色**
```css
/* ❌ 错误 */
box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);

/* ✅ 正确（莫奈） */
box-shadow: 0 4px 8px rgba(152, 136, 152, 0.1);  /* 紫色阴影 */
box-shadow: 0 4px 8px rgba(168, 180, 184, 0.1);  /* 蓝色阴影 */
```

**规则3：渐变用莫奈光影**
```css
/* ✅ 印象派渐变 */
background: linear-gradient(
  135deg,
  var(--canvas-bg) 0%,        /* 莫兰迪画布 */
  var(--monet-sunrise) 30%,   /* 莫奈阳光 */
  var(--monet-sky-morning) 70%, /* 莫奈天空 */
  var(--canvas-bg) 100%       /* 回归画布 */
);
```

---

## 六、心理学深度应用

### 6.1 持续运动的心理学依据

**视觉疲劳理论**：
- 完全静态的界面会在 20-30 分钟后导致视觉疲劳
- 适度动态（低于意识阈值）可以保持视觉系统活跃
- 类似"微风"——我们不注意到它，但它让我们感到舒适

**注意力恢复理论 (ART)**：
Kaplan 提出注意力恢复需要四个特征：
1. **远离感 (Being Away)**：动态背景创造"窗口"感
2. **兼容感 (Compatibility)**：自然运动符合人类直觉
3. **范围感 (Extent)**：视觉延伸到屏幕之外（光斑漂浮）
4. **软吸引力 (Soft Fascination)**：不强迫关注，但吸引眼休息

**动态元素的"软吸引力"设计**：
- 运动：足够慢，用户可以选择性忽略
- 幅度：足够小，不触发"警报"机制
- 位置：边缘区域，非阅读焦点
- 目的：让眼睛有"休息的地方"

### 6.2 印象派美学的心理学效应

**模糊的心理学**：
- 清晰边界 → 确定性、理性、控制感
- 模糊边界 → 可能性、想象、放松感
- 印象派模糊 → 用户需要"想象"来补全，产生参与感

**色彩并列的心理学**：
- 色彩混合 → 被动接收
- 色彩并列 → 主动融合（眼睛自行混合），产生参与感
- 数字转译：相邻像素不同色，让屏幕模拟并列笔触

**光影变化的心理学**：
- 固定光影 → 稳定、永恒、静态
- 变化光影 → 时间流逝、生命感、动态
- 缓慢变化 → 不干扰阅读，但传达"活着"的感觉

### 6.3 阅读体验心理学

**认知负荷最小化**：

| 元素 | 设计 | 心理学目的 |
|------|------|------------|
| 标题 | 大且清晰 | 第一视线落点，立即定位 |
| 正文 | 舒适间距 | 阅读节奏稳定 |
| 动态元素 | 边缘位置 | 不干扰阅读序列 |
| 卡片悬停 | 适度反馈 | 确认"我可以探索" |

**格式塔应用**：

| 原则 | 设计 | 效果 |
|------|------|------|
| 相近性 | 相关内容聚合 | 一眼看懂结构 |
| 连续性 | 视觉引导线 | 自然阅读流 |
| 闭合性 | 不完整几何 | 用户参与想象 |
| 图底关系 | 模糊背景 | 内容自动浮现 |

---

## 七、页面区块详细设计

### 7.1 Hero 区：印象派画框

**结构**：
```html
<section class="hero">
  <!-- 背景层：光影流动 -->
  <div class="hero-bg"></div>
  
  <!-- 光斑粒子层 -->
  <div class="hero-particles">
    <div class="light-particle p1"></div>
    <div class="light-particle p2"></div>
    <div class="light-particle p3"></div>
  </div>
  
  <!-- 内容层 -->
  <div class="hero-content">
    <!-- 头像：动态3D几何 -->
    <div class="avatar-container">...</div>
    
    <!-- 标识 -->
    <div class="hero-identity">
      <h1 class="hero-name">xingzihai</h1>
      <p class="hero-name-cn">冰水泡枸杞</p>
      <p class="hero-tagline">星光落入冰水，温暖慢慢渗透</p>
    </div>
  </div>
</section>
```

**视觉规格**：

| 元素 | 规格 | 印象派特征 |
|------|------|------------|
| 背景 | 60s 光影流动 | 莫奈日出效果 |
| 光斑 | 30s 漂浮，模糊 | 印象派笔触模拟 |
| 头像 | 20s 旋转，10s 颜色变化 | 冰晶 + 枸杞意象 |
| 标题 | 衬线，letter-spacing | 优雅而不僵硬 |
| 副标题 | 小字，柔和颜色 | 不抢焦点 |

### 7.2 美学展示区：画廊式布局

**结构**：
```html
<section class="gallery-section">
  <header>
    <h2 class="section-title">光的练习</h2>
    <p class="section-subtitle">用颜色画出时间</p>
  </header>
  
  <!-- 画廊布局 -->
  <div class="gallery-grid">
    <!-- 配色展示 -->
    <article class="gallery-card palette-card">...</article>
    
    <!-- 字体展示 -->
    <article class="gallery-card typography-card">...</article>
    
    <!-- 交互展示 -->
    <article class="gallery-card interaction-card">...</article>
    
    <!-- 渐变展示 -->
    <article class="gallery-card gradient-card">...</article>
  </div>
</section>
```

**画廊卡片设计**：

```css
.gallery-card {
  /* 印象派模糊边框 */
  border: none;
  box-shadow: 
    0 8px 32px rgba(152, 136, 152, 0.1),  /* 紫色阴影 */
    inset 0 0 60px rgba(255, 176, 88, 0.03); /* 内部光晕 */
  
  /* 模糊过渡（印象派） */
  transition: 
    transform 0.4s var(--ease-out),
    box-shadow 0.4s var(--ease-out);
}

.gallery-card:hover {
  transform: translateY(-6px);
  box-shadow: 
    0 16px 48px rgba(152, 136, 152, 0.15),
    inset 0 0 80px rgba(255, 176, 88, 0.05);
}
```

### 7.3 设计理念区：光影文字

**印象派式文字展示**：

```html
<section class="philosophy-section">
  <div class="philosophy-bg"></div>  <!-- 动态背景 -->
  
  <article class="philosophy-block">
    <h3 class="philosophy-title">印象</h3>
    <p class="philosophy-text">
      不追求清晰的边界，而是让颜色自己说话。
      模糊不是缺陷，而是想象的空间。
    </p>
  </article>
</section>
```

**文字动效**：

```css
.philosophy-text {
  /* 文字渐隐渐显（印象派光影） */
  animation: text-glow 15s ease-in-out infinite;
}

@keyframes text-glow {
  0%, 100% {
    text-shadow: none;
  }
  50% {
    text-shadow: 
      0 0 20px rgba(255, 176, 88, 0.15),
      0 0 40px rgba(255, 176, 88, 0.08);
  }
}
```

### 7.4 技术能力区：代码画廊

**将技术栈转化为视觉元素**：

```html
<section class="code-gallery">
  <header>
    <h2>代码的笔触</h2>
    <p>用代码画出光的形状</p>
  </header>
  
  <div class="code-card-grid">
    <!-- 技术卡片：印象派式 -->
    <article class="code-card">
      <div class="code-icon" style="background: 渐变动画">...</div>
      <h4 class="code-title">Frontend</h4>
      <p class="code-desc">Vue / React / CSS Animation</p>
    </article>
  </div>
</section>
```

### 7.5 结尾区：渐隐画框

**印象派式结尾**：

```html
<footer class="footer-frame">
  <!-- 渐隐效果 -->
  <div class="footer-fade"></div>
  
  <div class="footer-content">
    <p class="footer-text">星光还在渗透...</p>
    <div class="footer-links">...</div>
  </div>
</footer>
```

```css
.footer-fade {
  /* 印象派渐隐：画作边缘 */
  height: 120px;
  background: linear-gradient(
    to bottom,
    transparent,
    var(--canvas-bg),
    var(--monet-sky-evening)  /* 渐隐到黄昏色 */
  );
  opacity: 0.6;
}
```

---

## 八、动画性能优化

### 8.1 动画层级与性能

| 层级 | 技术 | GPU | 性能影响 |
|------|------|-----|----------|
| 背景光影 | CSS gradient animation | ✅ | 低 |
| 光斑漂浮 | CSS transform + opacity | ✅ | 低 |
| 头像旋转 | CSS 3D transform | ✅ | 中 |
| 滚动触发 | Intersection Observer | - | 极低 |
| hover 反馈 | CSS transition | ✅ | 极低 |

**性能约束**：
- 同时运行的动画 ≤ 5 个
- 每个动画周期 ≥ 10s（降低帧率需求）
- 使用 `transform` 和 `opacity`（GPU 加速）
- 避免 `left/top/width/height` 动画（触发重排）

### 8.2 动画降级策略

```css
/* 移动端：简化动画 */
@media (max-width: 768px) {
  .light-particle {
    animation: none;  /* 禁用光斑 */
  }
  
  .hero-bg {
    animation-duration: 120s;  /* 延长周期，降低帧率 */
  }
  
  .avatar-crystal {
    animation-duration: 40s;   /* 减慢旋转 */
  }
}

/* 低性能设备：禁用复杂动画 */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
  }
}
```

---

## 九、响应式印象派

### 9.1 移动端印象派

**设计哲学**：
- 小屏幕 = 小画框
- 简化但不丢失氛围
- 动画减少，但光影保留

**具体调整**：

| 元素 | 桌面 | 移动 |
|------|------|------|
| Hero 高度 | 100vh | 80vh |
| 头像 | 200px | 150px |
| 光斑数量 | 5个 | 2个 |
| 动画周期 | 标准 | ×1.5 延长 |
| 卡片网格 | 3列 | 1列 |
| 字号 | 标准 | ×0.85 |

---

## 十、最终视觉效果预期

### 10.1 第一印象（3秒）

**视觉锚点**：
- 动态头像吸引目光
- 名字清晰可见
- 光影流动传达"活着"的感觉

**心理反应**：
- "这个网站有艺术感"
- "不是普通的模板网站"
- "想继续往下看"

### 10.2 浏览体验（30秒）

**注意力路径**：
```
头像 → 名字 → 副标题
    ↓
光斑漂浮（眼睛休息）
    ↓
画廊卡片（探索内容）
    ↓
技术栈 → 设计理念
```

**心理状态**：
- 不急躁（动画足够慢）
- 有探索欲（卡片可交互）
- 感到舒适（配色柔和）

### 10.3 深度体验（60秒+）

**细节发现**：
- 注意到光斑的模糊边缘
- 发现头像颜色的变化
- 意识到文字有微妙光晕
- 发现阴影不是黑色

**心理满足**：
- "这个设计师很用心"
- "我愿意推荐给朋友"
- "想再来看看"

---

## 十一、实现检查清单

### 11.1 动态元素检查

| 元素 | 检查项 | 状态 |
|------|--------|------|
| 背景光影 | 周期 ≥ 60s | ⬜ |
| 光斑漂浮 | 模糊 ≥ 20px | ⬜ |
| 头像旋转 | 周期 ≥ 20s | ⬜ |
| 颜色渐变 | 变化幅度 ≤ 30% | ⬜ |
| 位置 | 不在阅读区 | ⬜ |

### 11.2 印象派美学检查

| 检查项 | 要求 | 状态 |
|--------|------|------|
| 无纯黑 | #000000 禁用 | ⬜ |
| 无纯白 | #FFFFFF 禁用 | ⬜ |
| 阴影互补色 | 紫色代替黑色 | ⬜ |
| 模糊边界 | blur ≥ 10px | ⬜ |
| 光影动画 | 存在且足够慢 | ⬜ |

### 11.3 心理学应用检查

| 检查项 | 要求 | 状态 |
|--------|------|------|
| 认知负荷 | 每屏焦点 ≤ 3 | ⬜ |
| 格式塔 | 连续性引导线 | ⬜ |
| 软吸引力 | 动态低于意识阈值 | ⬜ |
| 留白 | ≥ 40% | ⬜ |
| 对比度 | 文字 ≥ 4.5:1 | ⬜ |

---

## 十二、下一步行动

设计规范已完成，下一步：

1. 创建 `index.html` 页面结构
2. 创建 `style.css` 样式系统（印象派配色）
3. 创建 `scripts/main.js` 动画控制
4. 实现动态头像
5. 测试动画性能

**确认后我将开始编码实现。**

---

*Impressionist Aesthetic Design Specification v1.0 · 2026-04-02*