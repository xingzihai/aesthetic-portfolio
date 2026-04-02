# xingzihai · 冰水泡枸杞

> 星光落入冰水，温暖慢慢渗透

印象派美学个人网站，融合莫兰迪沉静与莫奈光影。

---

## 设计理念

### 印象派 × 莫兰迪

- **莫兰迪画布**：低饱和度灰调作为底色，传递沉静与永恒
- **莫奈光影**：动态光斑与渐变，捕捉时间的流动
- **融合策略**：灰调打底，光影点缀，层次分明

### 动态视觉系统

| 层级 | 元素 | 周期 | 技术 |
|------|------|------|------|
| L1 | 背景光影流动 | 60s | CSS gradient animation |
| L2 | 光斑粒子漂浮 | 30s | CSS transform + blur |
| L3 | 头像旋转 + 颜色变化 | 20s + 10s | CSS 3D transform |

### 配色系统

- 禁用纯黑纯白（用深褐 #3D3228 和米白 #FAF8F5）
- 阴影用互补色（紫色 rgba(152, 136, 152, 0.12) 代替黑色）
- 莫奈色彩叠加莫兰迪底色

---

## 技术栈

- **渲染**：纯静态 HTML/CSS
- **样式**：原生 CSS 变量系统
- **交互**：原生 JavaScript（无框架依赖）
- **字体**：Google Fonts CDN
  - 英文：Cormorant Garamond + Inter
  - 中文：Noto Serif SC + Noto Sans SC
- **部署**：Cloudflare Pages

---

## 文件结构

```
aesthetic-portfolio/
├── index.html              # 首页
├── style.css               # 主样式
├── scripts/
│   └── main.js             # 交互逻辑
│
├── color-reference/        # 配色参考库
│   ├── README.md
│   ├── css-variables.css
│   ├── scss-variables.scss
│   ├── json-palette.json
│   ├── individual/         # 单色系参考
│   └── combinations/       # 组合方案
│
├── DESIGN.md               # 美学设计规范
├── IMPRESSIONIST-DESIGN.md # 印象派设计规范
├── DESIGN-RATIONALE.md     # 设计理由与反思
├── DESIGN-FINAL.md         # 最终设计规范
├── ARCHITECTURE.md         # 架构设计
│
└── README.md               # 本文档
```

---

## 本地预览

```bash
# 进入项目目录
cd aesthetic-portfolio

# 使用任意 HTTP 服务器
python -m http.server 8080
# 或
npx serve .
# 或直接打开 index.html
```

---

## 部署到 Cloudflare Pages

1. 将项目推送到 GitHub 仓库
2. 在 Cloudflare Dashboard 创建 Pages 项目
3. 连接 GitHub 仓库
4. 构建设置：
   - 构建命令：无（静态站点）
   - 输出目录：`/`
5. 部署

---

## 设计文档

- [美学设计规范](DESIGN.md)
- [印象派设计规范](IMPRESSIONIST-DESIGN.md)
- [设计理由与反思](DESIGN-RATIONALE.md)
- [最终设计规范](DESIGN-FINAL.md)
- [架构设计](ARCHITECTURE.md)

---

## 配色参考

完整的配色参考库位于 `color-reference/` 目录：

- **css-variables.css**：可直接 link 引用
- **scss-variables.scss**：SCSS 项目 @import 引用
- **json-palette.json**：程序化使用

---

## 浏览器支持

- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

移动端支持：
- iOS Safari 13+
- Android Chrome 80+

---

## 性能指标（目标）

| 指标 | 目标值 |
|------|--------|
| 首屏渲染 (FCP) | < 1s |
| 可交互时间 (TTI) | < 1.5s |
| 最大内容渲染 (LCP) | < 2s |
| 累积布局偏移 (CLS) | < 0.1 |

---

## 无障碍支持

- WCAG 2.1 AA 级别
- 文字对比度 ≥ 4.5:1
- 键盘导航支持
- `prefers-reduced-motion` 支持

---

## License

MIT © 2026 xingzihai