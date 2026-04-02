# Color Reference · 配色参考库

> 莫兰迪配色系统参考文件，用于后续项目快速引用

---

## 📁 目录结构

```
color-reference/
├── README.md                 # 本说明文件
├── css-variables.css         # CSS 变量（可直接 link）
├── scss-variables.scss       # SCSS 变量（@import 引用）
├── json-palette.json         # JSON 格式（程序化使用）
│
├── individual/               # 单色系参考
│   ├── dusty-pink/           # 灰粉家族
│   ├── haze-blue/            # 雾霾蓝家族
│   ├── sage-green/           # 灰绿家族
│   ├── dusty-purple/         # 灰紫家族
│   ├── dusty-orange/         # 灰橙家族
│   ├── dusty-yellow/         # 灰黄家族
│   └── dusty-rose/           # 灰玫红家族
│
└── combinations/             # 组合方案参考
    ├── warm-theme/           # 温暖主题
    ├── cool-theme/           # 冷静主题
    ├── neutral-theme/        # 中性主题
    └── artistic-theme/       # 艺术主题
```

---

## 🎨 快速引用

### HTML/CSS 项目

```html
<link rel="stylesheet" href="color-reference/css-variables.css">
```

```css
/* 使用变量 */
.my-button {
  background: var(--pink-200);
  color: var(--text-200);
}
```

### SCSS/Sass 项目

```scss
@import 'color-reference/scss-variables.scss';

.my-button {
  background: $pink-200;
  color: $text-200;
}
```

### JavaScript/程序化使用

```js
import palette from './color-reference/json-palette.json';

const bgColor = palette.pink['200']; // '#D4C4BC'
```

---

## 📊 色系家族概览

| 家族 | 主色 (200) | 心理效应 | 适用场景 |
|------|------------|----------|----------|
| 灰粉 | #D4C4BC | 温暖、安全、怀旧 | 亲和力内容、卡片背景 |
| 雾霾蓝 | #A8B4B8 | 冷静、信任、理性 | 专业内容、导航、边框 |
| 灰绿 | #9CAA9C | 自然、平和、治愈 | 成功状态、自然主题 |
| 灰紫 | #B8A8B8 | 优雅、神秘、艺术 | 创意内容、高端主题 |
| 灰橙 | #D8C8A8 | 温暖、活力、友好 | 强调、行动号召 |
| 灰黄 | #D8D0B8 | 柔和、明亮、温和 | 警示、提示信息 |
| 灰玫红 | #D8B0C0 | 浪漫、优雅 | 情感内容、艺术展示 |

---

## 🔢 明度层级说明

每个色系家族包含 5 个明度层级：

| 层级 | 用途 |
|------|------|
| 100 | 浅色 · 柔和背景、次要元素 |
| 200 | 基础色 · 主要元素、标准色 |
| 300 | 中色 · 次级强调、hover 状态 |
| 400 | 深色 · 重点强调、按钮深色 |
| 500 | 最深 · 标题、最高对比度 |

---

## 🎯 使用建议

1. **背景层级**：使用 `bg-100` ~ `bg-500` 构建视觉深度
2. **文字层级**：使用 `text-100` ~ `text-500` 确保对比度
3. **主色调**：选择一个色系作为主色调（如灰粉），使用其 200/300/400 层级
4. **辅助色**：选择一个对比色系作为辅助（如雾霾蓝）
5. **功能色**：使用预定义的状态色（success/warning/error/info）

---

*创建于 2026-04-02 · Morandi Professional Palette System*