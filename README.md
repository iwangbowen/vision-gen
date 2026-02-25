# InstaVideo

InstaVideo 是一个基于 React 和 TypeScript 构建的节点式无限画布应用程序。它提供了一个强大的可视化界面，用于生成和管理视频/图像资产，集成了大语言模型（如 Gemini）以支持“文生图”和“图生图”工作流，并配备了时间轴和资产管理系统。

## 参考资源

- [momoLab画布功能，让你丝滑创作～](https://www.bilibili.com/video/BV1CdZUBHEwk/?buvid=XYD4D53D84262135A4832878215D444F68CC2&from_spmid=main.space-contribution.0.0&is_story_h5=false&mid=96xKhD1suI8WjI3s18775A%3D%3D&plat_id=116&share_from=ugc&share_medium=android&share_plat=android&share_session_id=787508f1-0e15-4b5c-8974-25b9c27ecdca&share_source=WEIXIN&share_tag=s_i&spmid=united.player-video-detail.0.0&timestamp=1771571515&unique_k=T6W99Sa&up_id=3461577015561160&vd_source=4455aacef5bcb5d446f39ae821eaf26b)

## 功能特性

- **无限画布编辑器**：基于 React Flow 构建，允许用户可视化地连接和管理生成节点。
- **AI 生成节点**：支持“文生图”（Text-to-Image）、“图生图”（Image-to-Image）和网格（Grid）节点。
- **大模型集成**：内置对 Gemini 和自定义 LLM 服务的支持。
- **时间轴与资产管理**：提供专用面板，用于管理生成的资产和时间轴序列。
- **现代化 UI**：使用 Tailwind CSS v4 和 Lucide React 图标进行样式设计。
- **状态管理**：使用 Zustand 进行健壮的全局状态处理。
- **深色/浅色主题**：内置主题切换支持。

## 技术栈

- **前端框架**：[React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **构建工具**：[Vite](https://vitejs.dev/)
- **画布/节点引擎**：[React Flow (@xyflow/react)](https://reactflow.dev/)
- **样式**：[Tailwind CSS v4](https://tailwindcss.com/)
- **状态管理**：[Zustand](https://zustand-demo.pmnd.rs/)
- **图标库**：[Lucide React](https://lucide.dev/)

## 快速开始

### 环境要求

请确保您的计算机上已安装 [Node.js](https://nodejs.org/)（推荐 v18 或更高版本）。

### 安装步骤

1. 克隆仓库：
   ```bash
   git clone <repository-url>
   cd insta-video
   ```

2. 安装依赖：
   ```bash
   npm install
   ```

3. 启动开发服务器：
   ```bash
   npm run dev
   ```

4. 打开浏览器并访问 `http://localhost:5173`。

## 项目结构

```text
src/
├── assets/         # 静态资源（图片、字体等）
├── components/     # React 组件
│   ├── canvas/     # 无限画布和 React Flow 配置
│   ├── layout/     # 主要布局组件（工具栏、面板、时间轴）
│   ├── nodes/      # 自定义 React Flow 节点（文生图、图生图等）
│   └── ui/         # 可复用的 UI 组件和对话框
├── services/       # 外部 API 和大模型集成（Gemini、自定义）
├── stores/         # Zustand 状态存储（画布、设置、主题等）
├── types/          # TypeScript 类型定义
└── utils/          # 辅助函数和示例数据
```

## 可用脚本

- `npm run dev` - 启动 Vite 开发服务器。
- `npm run build` - 编译 TypeScript 并构建生产版本。
- `npm run lint` - 运行 ESLint 检查代码质量问题。
- `npm run preview` - 在本地预览生产构建版本。

## 许可证

本项目为私有及机密项目。
