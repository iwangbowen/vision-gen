# VisionGen

VisionGen is a **node-based infinite canvas AI image generation tool** for film/animation content creators, focused on storyboard generation and image asset management. It's a pure frontend application — no backend required — powered by external LLM APIs (Gemini or OpenAI-compatible endpoints).

## References

- [momoLab Canvas Feature Demo](https://www.bilibili.com/video/BV1CdZUBHEwk/?buvid=XYD4D53D84262135A4832878215D444F68CC2&from_spmid=main.space-contribution.0.0&is_story_h5=false&mid=96xKhD1suI8WjI3s18775A%3D%3D&plat_id=116&share_from=ugc&share_medium=android&share_plat=android&share_session_id=787508f1-0e15-4b5c-8974-25b9c27ecdca&share_source=WEIXIN&share_tag=s_i&spmid=united.player-video-detail.0.0&timestamp=1771571515&unique_k=T6W99Sa&up_id=3461577015561160&vd_source=4455aacef5bcb5d446f39ae821eaf26b)

## Features

### Canvas & Nodes

- **Infinite Canvas**: React Flow-based visual canvas with zoom, pan, minimap, and free node connections
- **Text-to-Image Node**: Generate images from text prompts via AI
- **Image-to-Image Node**: Upload/select a reference image + prompt to generate new images
- **Multi-Input Node**: Combine multiple input nodes for fusion generation
- **Image Node**: Static image display, serves as a container for generation results
- **Grid Node**: N×N grid image display with split operations
- **Split Group Node**: Auto-generated group container after grid splitting

### AI Image Generation

- **Generation Parameters**: Grid size (1×1 – 5×5), aspect ratio (1:1 / 16:9 / 9:16 / 4:3 / 3:4 / 3:2 / 2:3), image size (1K / 2K / 4K)
- **Style Presets**: Photorealistic, Concept Art, Hand-drawn Sketch, American Comic, Anime, 3D Render, Watercolor, Oil Painting, Cyberpunk, Chinese Ink Wash
- **Task Management**: Notification center for real-time tracking of all generation tasks

### Image Editing

Click on a node image to reveal a floating toolbar with the following operations:

- **Preview**: Fullscreen preview with left/right navigation
- **Crop**: Free crop and preset ratios (1:1 / 4:3 / 16:9 / 3:4 / 9:16)
- **Inpainting**: Brush-paint a mask region + prompt for localized regeneration
- **Outpaint**: Select a target ratio for AI-powered canvas extension
- **Split**: Split a single image into a 2×2 – 5×5 grid
- **Camera Angle**: 3D orbit SVG interaction to set azimuth / elevation / focal length for angle prompts
- **Enhance**: AI-powered image clarity enhancement
- **Remove Watermark**: AI-powered automatic watermark removal

### Layout & Panels

- **Toolbar** (top): Add nodes, undo/redo, theme toggle, notification center, settings
- **Asset Panel** (left): Search + category filter + grid view, drag & drop to canvas or timeline
- **Property Panel** (right): View/edit selected node properties, AI image analysis (Gemini SSE streaming Markdown output)
- **Timeline** (bottom): Frame sequence management with drag-to-reorder and position targeting

### Other Features

- **Dark / Light Theme**: One-click toggle with custom design tokens for global theming
- **Undo / Redo**: 50-step operation history
- **Clipboard**: Node copy / cut / paste
- **Context Menus**: Canvas right-click to add nodes, node right-click operations, image right-click to add to timeline / download
- **Keyboard Shortcuts**: Comprehensive shortcut support

## Tech Stack

| Category | Technology | Version |
|----------|-----------|---------|
| Framework | [React](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/) | ^19.2.0 / ~5.9.3 |
| Build Tool | [Vite](https://vitejs.dev/) | ^7.3.1 |
| Canvas Engine | [@xyflow/react](https://reactflow.dev/) | ^12.10.1 |
| Styling | [Tailwind CSS v4](https://tailwindcss.com/) + [@tailwindcss/vite](https://tailwindcss.com/docs/installation/vite) | ^4.2.1 |
| State Management | [Zustand](https://zustand-demo.pmnd.rs/) | ^5.0.11 |
| Icons | [Lucide React](https://lucide.dev/) | ^0.575.0 |
| Image Cropping | [react-image-crop](https://github.com/DominicTobias/react-image-crop) | ^11.0.10 |
| Brush / Mask | [react-signature-canvas](https://github.com/agilgur5/react-signature-canvas) | ^1.1.0-alpha.2 |
| Markdown Rendering | [react-markdown](https://github.com/remarkjs/react-markdown) + [remark-gfm](https://github.com/remarkjs/remark-gfm) | ^10.1.0 / ^4.0.1 |
| File Download | [file-saver](https://github.com/eligrey/FileSaver.js) | ^2.0.5 |

## LLM Integration

### Gemini (Default)

- **Image Generation Models**: `gemini-3-pro-image-preview`, `gemini-2.5-flash-image`
- **Text / Vision Analysis Models**: `gemini-3-flash-preview`, `gemini-3.1-pro-preview`
- **API**: Google Generative Language API (`/v1beta/models/{model}:generateContent`)
- **Capabilities**: Text-to-image, image-to-image, mask inpainting, multi-image fusion, SSE streaming image analysis

### Custom (OpenAI-Compatible)

- **Endpoint**: `{baseUrl}/images/generations` (OpenAI Images API format)
- **Default Model**: `dall-e-3`
- **Response Format**: Supports both `b64_json` and `url` modes

> Configure your API Key in the settings dialog before first use.

## Getting Started

### Prerequisites

[Node.js](https://nodejs.org/) v18+

### Installation

```bash
git clone https://github.com/iwangbowen/vision-gen.git
cd vision-gen
npm install
npm run dev
```

Open your browser at `http://localhost:5173`.

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server (port 5173) |
| `npm run build` | TypeScript compilation + Vite production build |
| `npm run lint` | ESLint code quality check (flat config) |
| `npm run preview` | Preview production build locally |

## Architecture

```text
App
└── ReactFlowProvider
    ├── Toolbar                    ← Top toolbar
    ├── AssetPanel (collapsible)   ← Left asset library
    ├── InfiniteCanvas             ← Core canvas (flex-1)
    ├── PropertyPanel (collapsible)← Right property panel
    ├── Timeline (collapsible)     ← Bottom timeline
    └── ShortcutsDialog            ← Global shortcuts dialog
```

**State Management**:

- `canvasStore` → Nodes / edges / selection / operation history (50 steps) / clipboard / all generation operations
- `settingsStore` (persist) → LLM provider selection + Gemini / Custom configuration
- `assetStore` → Asset list (in-memory, with 12 sample entries)
- `taskStore` → Generation task progress tracking (generating / done / error)
- `themeStore` (persist) → Dark / light theme
- `timelineStore` → Frame list, drag-to-reorder and absolute position targeting

**Service Layer**:

The `getLLMService()` factory reads `settingsStore` config to instantiate either `GeminiImageService` or `CustomImageService`. Generation results automatically create ImageNode children and establish connection edges.

## Design Conventions

- **Node IDs**: `node_${++counter}_${Date.now()}` ensures cross-session uniqueness
- **Theming**: Manual `.dark` class toggle on `documentElement`, CSS custom properties sync with React Flow theme
- **Drag & Drop Protocol**: Assets use `application/visiongen-asset` MIME type; timeline internals use `visiongen-timeline-item`
- **Dialog Rendering**: All dialogs rendered via `createPortal(…, document.body)` to avoid z-index stacking issues
- **Tailwind Theming**: Design tokens defined in `index.css` via `@theme { }`, mapped to utilities like `bg-canvas-bg`

## License

This project is private and confidential.
