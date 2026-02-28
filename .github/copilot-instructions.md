# VisionGen 项目指南

## 代码风格
- **语言**: React 19 + TypeScript 5.9 (严格类型检查, ES2020 目标)。
- **样式**: Tailwind CSS v4 通过 `@tailwindcss/vite` 集成 (现代方法，无需 PostCSS 配置)。使用 `dark:` 前缀实现深色模式。
- **状态管理**: Zustand 5。直接使用 `create()` 钩子。复杂状态参考 `src/stores/canvasStore.ts`，`persist` 中间件用法参考 `src/stores/settingsStore.ts`。
- **类型系统**: 节点数据强类型 (`Text2ImageData`, `Image2ImageData`, `ImageData`)。状态字段使用 `'idle' | 'generating' | 'done'`。参考 `src/types/index.ts`。

## 架构设计
- **前端技术栈**: Vite 7 + React Flow (`@xyflow/react` v12.10.1) 用于基于节点的无限画布。
- **组件布局**: `App` 在最外层包裹 `ReactFlowProvider`。主要组件包括 `Toolbar`、`AssetPanel`、`InfiniteCanvas`、`PropertyPanel` 和 `Timeline`。
- **LLM 服务工厂**: 插件式架构位于 `src/services/llm/factory.ts`。`getLLMService()` 读取 `useSettingsStore.getState()` 来实例化 Gemini 或自定义提供商。
- **无后端**: 纯前端应用。图像生成依赖外部 LLM API。资产管理在内存中进行 (示例数据来自 `src/utils/sampleData.ts`)。

## 构建与测试
- **安装**: `npm install`
- **开发服务器**: `npm run dev` (Vite 开发服务器，端口 5173)
- **构建**: `npm run build` (TypeScript 编译 + Vite 构建)
- **代码检查**: `npm run lint` (使用扁平化配置 `eslint.config.js` 进行 ESLint 检查)
- **注意**: 没有专门的测试套件。代码检查 (Linting) 是主要的质量保证手段。

## 约定与常见陷阱
- **React Flow**: 自定义节点类型必须在 `nodeTypes` 对象中注册。子组件必须在应用级别被 `ReactFlowProvider` 包裹 (已在 `src/App.tsx` 中完成)。
- **节点 ID 生成**: 使用计数器 + 时间戳 (`node_${++nodeIdCounter}_${Date.now()}`) 确保跨会话的唯一性。
- **LLM 设置**: `settingsStore` 初始化时 API 密钥为空。必须在生成工作前于设置对话框中配置它们。Gemini 默认模型为 `gemini-2.5-pro`。
- **主题处理**: 在 `document.documentElement` 上手动切换类名 (`.dark` 类)。
