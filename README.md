# InstaVideo

InstaVideo 是一个面向影视/动画内容创作者的**节点式无限画布 AI 图像生成工具**，专注于分镜图生成与图像资产管理。纯前端应用，无需后端，通过外部 LLM API（Gemini 或 OpenAI 兼容接口）驱动图像生成。

## 参考资源

- [momoLab画布功能，让你丝滑创作～](https://www.bilibili.com/video/BV1CdZUBHEwk/?buvid=XYD4D53D84262135A4832878215D444F68CC2&from_spmid=main.space-contribution.0.0&is_story_h5=false&mid=96xKhD1suI8WjI3s18775A%3D%3D&plat_id=116&share_from=ugc&share_medium=android&share_plat=android&share_session_id=787508f1-0e15-4b5c-8974-25b9c27ecdca&share_source=WEIXIN&share_tag=s_i&spmid=united.player-video-detail.0.0&timestamp=1771571515&unique_k=T6W99Sa&up_id=3461577015561160&vd_source=4455aacef5bcb5d446f39ae821eaf26b)

## 功能特性

### 画布与节点

- **无限画布**：基于 React Flow 的可视化画布，支持缩放、平移、小地图，节点自由连接
- **文生图节点**（Text-to-Image）：文本提示词驱动 AI 生成图片
- **图生图节点**（Image-to-Image）：上传/选择参考图 + 提示词生成新图
- **多图融合节点**（Multi-Input）：多个输入节点连接融合生成
- **图片节点**（Image）：静态图片展示，可作为生成结果承载
- **网格节点**（Grid）：N×N 宫格图片展示，支持切分操作
- **切分组节点**（Split Group）：网格切分后自动生成的分组容器

### AI 图像生成

- **生成参数**：支持网格尺寸（1×1 ~ 5×5）、宽高比（1:1 / 16:9 / 9:16 / 4:3 / 3:4 / 3:2 / 2:3）、图片尺寸（1K / 2K / 4K）
- **风格预设**：摄影写实、概念设计、手绘草图、美漫风格、日系动漫、3D渲染、水彩艺术、油画质感、赛博朋克、水墨丹青
- **任务管理**：通知中心实时追踪所有生成任务进度

### 图片编辑

点击节点图片后弹出浮动工具栏，提供以下操作：

- **预览**：全屏预览，支持左右切换导航
- **裁剪**：自由裁剪及多种预设比例（1:1 / 4:3 / 16:9 / 3:4 / 9:16）
- **重绘（Inpainting）**：画笔绘制遮罩区域 + 提示词，局部重新生成
- **扩图（Outpaint）**：选择目标比例，AI 智能扩展画面
- **切分**：将单图切分为 2×2 ~ 5×5 宫格
- **镜头角度**：3D 轨道 SVG 交互，设置方位角 / 仰角 / 焦距生成角度提示词
- **变清晰（Enhance）**：AI 提升画面清晰度
- **去水印**：AI 自动去除水印

### 布局与面板

- **工具栏**（顶部）：添加节点、撤销/重做、主题切换、通知中心、设置
- **素材库面板**（左侧）：搜索 + 分类过滤 + 网格展示，支持拖拽到画布或时间轴
- **属性面板**（右侧）：查看/编辑选中节点属性，AI 图片分析（Gemini SSE 流式 Markdown 输出）
- **时间轴**（底部）：帧序列管理，支持拖拽排序与位置定位

### 其他特性

- **深色/浅色主题**：一键切换，自定义设计 Token 覆盖全局配色
- **撤销/重做**：50 步操作历史
- **剪贴板**：节点复制 / 剪切 / 粘贴
- **右键菜单**：画布右键添加节点、节点右键操作、图片右键加入轨道/下载
- **快捷键体系**：完整的键盘快捷键支持

## 技术栈

| 类别 | 技术 | 版本 |
|------|------|------|
| 前端框架 | [React](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/) | ^19.2.0 / ~5.9.3 |
| 构建工具 | [Vite](https://vitejs.dev/) | ^7.3.1 |
| 画布引擎 | [@xyflow/react](https://reactflow.dev/) | ^12.10.1 |
| 样式 | [Tailwind CSS v4](https://tailwindcss.com/) + [@tailwindcss/vite](https://tailwindcss.com/docs/installation/vite) | ^4.2.1 |
| 状态管理 | [Zustand](https://zustand-demo.pmnd.rs/) | ^5.0.11 |
| 图标 | [Lucide React](https://lucide.dev/) | ^0.575.0 |
| 图片裁剪 | [react-image-crop](https://github.com/DominicTobias/react-image-crop) | ^11.0.10 |
| 画笔/遮罩 | [react-signature-canvas](https://github.com/agilgur5/react-signature-canvas) | ^1.1.0-alpha.2 |
| Markdown 渲染 | [react-markdown](https://github.com/remarkjs/react-markdown) + [remark-gfm](https://github.com/remarkjs/remark-gfm) | ^10.1.0 / ^4.0.1 |
| 文件下载 | [file-saver](https://github.com/eligrey/FileSaver.js) | ^2.0.5 |

## LLM 集成

### Gemini（默认）

- **图像生成模型**：`gemini-3-pro-image-preview`、`gemini-2.5-flash-image`
- **文本/视觉分析模型**：`gemini-3-flash-preview`、`gemini-3.1-pro-preview`
- **API**：Google Generative Language API (`/v1beta/models/{model}:generateContent`)
- **能力**：文生图、图生图、遮罩重绘、多图融合、SSE 流式图片分析

### 自定义（OpenAI 兼容）

- **接口**：`{baseUrl}/images/generations`（OpenAI Images API 格式）
- **默认模型**：`dall-e-3`
- **响应格式**：支持 `b64_json` 和 `url` 两种模式

> 首次使用前需在设置对话框中配置 API Key。

## 快速开始

### 环境要求

[Node.js](https://nodejs.org/) v18+

### 安装与运行

```bash
git clone https://github.com/iwangbowen/insta-video.git
cd insta-video
npm install
npm run dev
```

打开浏览器访问 `http://localhost:5173`。

## 可用脚本

| 命令 | 说明 |
|------|------|
| `npm run dev` | 启动 Vite 开发服务器（端口 5173） |
| `npm run build` | TypeScript 编译 + Vite 生产构建 |
| `npm run lint` | ESLint 代码质量检查（扁平化配置） |
| `npm run preview` | 本地预览生产构建 |

## 架构设计

```text
App
└── ReactFlowProvider
    ├── Toolbar                    ← 顶部工具栏
    ├── AssetPanel (可折叠)        ← 左侧素材库
    ├── InfiniteCanvas             ← 核心画布 (flex-1)
    ├── PropertyPanel (可折叠)     ← 右侧属性面板
    ├── Timeline (可折叠)          ← 底部时间轴
    └── ShortcutsDialog            ← 全局快捷键弹窗
```

**状态管理流**：

- `canvasStore` → 节点 / 边 / 选中状态 / 操作历史（50步）/ 剪贴板 / 所有生成操作
- `settingsStore` (persist) → LLM Provider 选择 + Gemini / Custom 配置
- `assetStore` → 资产列表（内存中，含 12 个示例数据）
- `taskStore` → 生成任务进度追踪（generating / done / error）
- `themeStore` (persist) → 深色/浅色主题
- `timelineStore` → 帧列表，拖拽排序与绝对位置定位

**服务层**：

`getLLMService()` 工厂函数读取 `settingsStore` 配置，实例化 `GeminiImageService` 或 `CustomImageService`。生成结果自动创建 ImageNode 子节点并建立连接边。

## 设计约定

- **节点 ID**：`node_${++counter}_${Date.now()}` 确保跨会话唯一性
- **主题**：通过 `.dark` 类名手动切换，CSS 自定义变量同步 React Flow 主题
- **拖拽协议**：素材使用 `application/instavideo-asset` MIME 类型，时间轴内部使用 `instavideo-timeline-item`
- **弹窗渲染**：所有对话框通过 `createPortal(…, document.body)` 渲染，避免 z-index 层叠问题
- **Tailwind 主题**：`index.css` 中通过 `@theme { }` 定义设计 Token，映射为 `bg-canvas-bg` 等工具类

## 许可证

本项目为私有及机密项目。
