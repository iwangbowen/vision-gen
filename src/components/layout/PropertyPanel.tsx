import {
  Save,
  Trash2,
  X,
  ScanSearch,
  Loader2,
  SlidersHorizontal,
  Type,
  ImageIcon,
  Layers,
  Grid3X3,
  Group,
} from 'lucide-react';
import { useCanvasStore } from '../../stores/canvasStore';
import { useAssetStore } from '../../stores/assetStore';
import { useSettingsStore } from '../../stores/settingsStore';
import { analyzeImageWithGemini } from '../../services/llm/gemini';
import type { AssetCategory, Text2ImageData, Image2ImageData, MultiInputData } from '../../types';
import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import ImagePreviewDialog from '../ui/ImagePreviewDialog';
import {
  ASSET_CATEGORIES,
  GRID_OPTIONS,
  ASPECT_RATIO_OPTIONS,
  IMAGE_SIZE_OPTIONS,
  IMAGE_STYLE_OPTIONS,
} from '../../utils/constants';

type PanelTab = 'properties' | 'analysis';

export default function PropertyPanel() {
  const { nodes, selectedNodeId, removeNode, setSelectedNodeId, updateNodeData } = useCanvasStore();
  const { addAsset } = useAssetStore();
  const { provider, gemini } = useSettingsStore();
  const [activeTab, setActiveTab] = useState<PanelTab>('properties');
  const [saveCategory, setSaveCategory] = useState<AssetCategory>('scene');
  const [saveName, setSaveName] = useState('');
  const [showSaveForm, setShowSaveForm] = useState(false);
  const [analysisPrompt, setAnalysisPrompt] = useState('');
  const [analysisResult, setAnalysisResult] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState('');
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const resultScrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll result box as content streams in
  useEffect(() => {
    if (resultScrollRef.current) {
      resultScrollRef.current.scrollTop = resultScrollRef.current.scrollHeight;
    }
  }, [analysisResult]);

  const selectedNode = nodes.find((n) => n.id === selectedNodeId);

  if (!selectedNode) {
    return (
      <div className="w-72 h-full flex flex-col items-center justify-center
        bg-panel-bg dark:bg-panel-bg-dark
        border-l border-border dark:border-border-dark">
        <p className="text-sm text-text-secondary dark:text-text-secondary-dark">
          选择一个节点查看属性
        </p>
      </div>
    );
  }

  // Get image from node depending on type
  const getNodeImage = (): string | undefined => {
    const data = selectedNode.data as Record<string, unknown>;
    return (data.generatedImage as string) || (data.image as string) || (data.sourceImage as string);
  };

  const nodeImage = getNodeImage();

  const handleSaveAsAsset = () => {
    if (!nodeImage || !saveName.trim()) return;
    addAsset({
      name: saveName.trim(),
      category: saveCategory,
      thumbnail: nodeImage,
    });
    setShowSaveForm(false);
    setSaveName('');
  };

  const handleAnalyzeImage = async () => {
    if (!nodeImage || !analysisPrompt.trim()) return;
    if (provider !== 'gemini' || !gemini.apiKey) {
      setAnalysisError('请先在设置中配置 Gemini API Key');
      return;
    }
    setIsAnalyzing(true);
    setAnalysisResult('');
    setAnalysisError('');
    try {
      await analyzeImageWithGemini({
        apiKey: gemini.apiKey,
        baseUrl: gemini.baseUrl,
        textModel: gemini.textModel || 'gemini-3-flash-preview',
        prompt: analysisPrompt,
        imageUrl: nodeImage,
        onChunk: (chunk) => setAnalysisResult((prev) => prev + chunk),
      });
    } catch (e) {
      setAnalysisError(e instanceof Error ? e.message : String(e));
    } finally {
      setIsAnalyzing(false);
    }
  };

  const isGenerativeNode = selectedNode.type === 'text2image' || selectedNode.type === 'image2image' || selectedNode.type === 'multiInput';
  const generativeData = isGenerativeNode ? (selectedNode.data as unknown as Text2ImageData | Image2ImageData | MultiInputData) : null;

  const tabClass = (tab: PanelTab) =>
    `flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium border-b-2 transition-colors ${
      activeTab === tab
        ? 'border-accent text-accent'
        : 'border-transparent text-text-secondary dark:text-text-secondary-dark hover:text-text-primary dark:hover:text-text-primary-dark'
    }`;

  return (
    <div className="w-72 h-full flex flex-col
      bg-panel-bg dark:bg-panel-bg-dark
      border-l border-border dark:border-border-dark">
      {/* Header */}
      <div className="px-4 py-2 border-b border-border dark:border-border-dark
        flex items-center justify-between">
        <div className="flex items-center gap-2">
          {(() => {
            const iconClass = "text-accent";
            const iconSize = 16;
            switch (selectedNode.type) {
              case 'text2image': return <Type size={iconSize} className={iconClass} />;
              case 'image2image': return <ImageIcon size={iconSize} className={iconClass} />;
              case 'multiInput': return <Layers size={iconSize} className={iconClass} />;
              case 'grid': return <Grid3X3 size={iconSize} className={iconClass} />;
              case 'splitGroup': return <Group size={iconSize} className={iconClass} />;
              default: return <ImageIcon size={iconSize} className={iconClass} />;
            }
          })()}
          <span className="text-sm font-medium text-text-primary dark:text-text-primary-dark">
            {(selectedNode.data as { label: string }).label}
          </span>
        </div>
        <button
          onClick={() => setSelectedNodeId(null)}
          className="p-1 rounded hover:bg-surface-hover dark:hover:bg-surface-hover-dark
            text-text-secondary dark:text-text-secondary-dark"
        >
          <X size={16} />
        </button>
      </div>

      {/* Tab bar */}
      <div className="flex border-b border-border dark:border-border-dark bg-panel-bg dark:bg-panel-bg-dark">
        <button className={tabClass('properties')} onClick={() => setActiveTab('properties')}>
          <SlidersHorizontal size={12} />
          属性
        </button>
        <button className={tabClass('analysis')} onClick={() => setActiveTab('analysis')}>
          <ScanSearch size={12} />
          图片分析
        </button>
      </div>

      {/* Tab: Properties */}
      {activeTab === 'properties' && (
        <div className="flex-1 overflow-y-auto flex flex-col">
          <div className="flex-1">
            {/* Generative Settings */}
            {isGenerativeNode && generativeData && (
              <div className="px-4 py-3 border-b border-border dark:border-border-dark space-y-4">
                <p className="text-xs font-medium text-text-secondary dark:text-text-secondary-dark">
                  生成设置
                </p>

                {/* Grid size selector */}
                <div>
                  <p className="text-[10px] text-text-secondary dark:text-text-secondary-dark mb-1.5">
                    生成规格
                  </p>
                  <div className="flex gap-1.5 flex-wrap">
                    {GRID_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => updateNodeData(selectedNode.id, { gridSize: opt.value })}
                        className={`px-2.5 py-1.5 rounded-md text-[10px] font-medium transition-colors
                          ${(generativeData.gridSize || '1x1') === opt.value
                            ? 'bg-accent text-white dark:text-black'
                            : 'bg-canvas-bg dark:bg-canvas-bg-dark text-text-secondary dark:text-text-secondary-dark border border-border dark:border-border-dark hover:border-accent/50'
                          }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Aspect Ratio selector */}
                <div>
                  <p className="text-[10px] text-text-secondary dark:text-text-secondary-dark mb-1.5">
                    画面比例
                  </p>
                  <div className="flex gap-1.5 flex-wrap">
                    {ASPECT_RATIO_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => updateNodeData(selectedNode.id, { aspectRatio: opt.value })}
                        className={`px-2.5 py-1.5 rounded-md text-[10px] font-medium transition-colors
                          ${(generativeData.aspectRatio || '16:9') === opt.value
                            ? 'bg-accent text-white dark:text-black'
                            : 'bg-canvas-bg dark:bg-canvas-bg-dark text-text-secondary dark:text-text-secondary-dark border border-border dark:border-border-dark hover:border-accent/50'
                          }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Image Size selector */}
                <div>
                  <p className="text-[10px] text-text-secondary dark:text-text-secondary-dark mb-1.5">
                    图片尺寸
                  </p>
                  <div className="flex gap-1.5 flex-wrap">
                    {IMAGE_SIZE_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => updateNodeData(selectedNode.id, { imageSize: opt.value })}
                        className={`px-2.5 py-1.5 rounded-md text-[10px] font-medium transition-colors
                          ${(generativeData.imageSize || '1k') === opt.value
                            ? 'bg-accent text-white dark:text-black'
                            : 'bg-canvas-bg dark:bg-canvas-bg-dark text-text-secondary dark:text-text-secondary-dark border border-border dark:border-border-dark hover:border-accent/50'
                          }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Image Style selector */}
                <div>
                  <p className="text-[10px] text-text-secondary dark:text-text-secondary-dark mb-1.5">
                    画面风格
                  </p>
                  <div className="flex gap-1.5 flex-wrap">
                    {IMAGE_STYLE_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => updateNodeData(selectedNode.id, { style: opt.value })}
                        className={`px-2.5 py-1.5 rounded-md text-[10px] font-medium transition-colors
                          ${(generativeData.style || '') === opt.value
                            ? 'bg-accent text-white dark:text-black'
                            : 'bg-canvas-bg dark:bg-canvas-bg-dark text-text-secondary dark:text-text-secondary-dark border border-border dark:border-border-dark hover:border-accent/50'
                          }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Image preview */}
            {nodeImage && (
              <div className="px-4 py-3 border-b border-border dark:border-border-dark">
                <p className="text-xs font-medium text-text-secondary dark:text-text-secondary-dark mb-2">
                  预览
                </p>
                <div className="rounded-lg overflow-hidden border border-border dark:border-border-dark">
                  <img
                    src={nodeImage}
                    alt="preview"
                    className="w-full aspect-square object-cover"
                  />
                </div>
              </div>
            )}

            {/* Save as asset */}
            {nodeImage && (
              <div className="px-4 py-3 border-b border-border dark:border-border-dark">
                {showSaveForm ? (
                  <div className="space-y-2">
                    <input
                      type="text"
                      placeholder="资产名称..."
                      value={saveName}
                      onChange={(e) => setSaveName(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-md text-xs
                        bg-canvas-bg dark:bg-canvas-bg-dark
                        text-text-primary dark:text-text-primary-dark
                        border border-border dark:border-border-dark
                        focus:outline-none focus:border-accent"
                    />
                    <select
                      value={saveCategory}
                      onChange={(e) => setSaveCategory(e.target.value as AssetCategory)}
                      className="w-full px-3 py-1.5 rounded-md text-xs
                        bg-canvas-bg dark:bg-canvas-bg-dark
                        text-text-primary dark:text-text-primary-dark
                        border border-border dark:border-border-dark"
                    >
                      {ASSET_CATEGORIES.map((cat) => (
                        <option key={cat.value} value={cat.value}>{cat.label}</option>
                      ))}
                    </select>
                    <div className="flex gap-1.5">
                      <button
                        onClick={handleSaveAsAsset}
                        className="flex-1 px-3 py-1.5 rounded-md text-xs font-medium
                          bg-accent text-white dark:text-black hover:bg-accent-hover transition-colors"
                      >
                        保存
                      </button>
                      <button
                        onClick={() => setShowSaveForm(false)}
                        className="px-3 py-1.5 rounded-md text-xs font-medium
                          bg-canvas-bg dark:bg-canvas-bg-dark
                          text-text-secondary dark:text-text-secondary-dark
                          hover:bg-surface-hover dark:hover:bg-surface-hover-dark
                          border border-border dark:border-border-dark"
                      >
                        取消
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowSaveForm(true)}
                    className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium
                      bg-accent text-white dark:text-black hover:bg-accent-hover transition-colors"
                  >
                    <Save size={14} />
                    保存为资产
                  </button>
                )}
              </div>
            )}

            {/* Position info */}
            <div className="px-4 py-3 border-b border-border dark:border-border-dark">
              <p className="text-xs font-medium text-text-secondary dark:text-text-secondary-dark mb-2">
                位置
              </p>
              <div className="grid grid-cols-2 gap-2 text-xs text-text-primary dark:text-text-primary-dark">
                <div>
                  <span className="text-text-secondary dark:text-text-secondary-dark">X: </span>
                  {Math.round(selectedNode.position.x)}
                </div>
                <div>
                  <span className="text-text-secondary dark:text-text-secondary-dark">Y: </span>
                  {Math.round(selectedNode.position.y)}
                </div>
              </div>
            </div>
          </div>

          {/* Footer actions */}
          <div className="px-4 py-3 border-t border-border dark:border-border-dark">
            <button
              onClick={() => {
                removeNode(selectedNode.id);
                setSelectedNodeId(null);
              }}
              className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium
                bg-danger/10 text-danger hover:bg-danger/20 transition-colors"
            >
              <Trash2 size={14} />
              删除节点
            </button>
          </div>
        </div>
      )}

      {/* Tab: Image Analysis */}
      {activeTab === 'analysis' && (
        <div className="flex-1 overflow-y-auto flex flex-col">
          {nodeImage ? (
            <div className="flex-1 flex flex-col gap-0">
              {/* Thumbnail */}
              <div className="px-4 py-3 border-b border-border dark:border-border-dark">
                <button
                  onClick={() => setIsPreviewOpen(true)}
                  className="w-full rounded-lg overflow-hidden border border-border dark:border-border-dark
                    bg-canvas-bg dark:bg-canvas-bg-dark flex items-center justify-center
                    hover:opacity-90 hover:border-accent transition-all cursor-zoom-in"
                  title="点击查看大图"
                >
                  <img src={nodeImage} alt="preview" className="max-w-full max-h-24 object-contain" />
                </button>
              </div>

              {/* Prompt + button */}
              <div className="px-4 py-3 space-y-2 flex-1">
                <p className="text-[10px] font-medium text-text-secondary dark:text-text-secondary-dark uppercase tracking-wide">
                  分析提示词
                </p>
                <textarea
                  placeholder="输入提示词，例如：描述这张图片的内容、风格和情绪..."
                  value={analysisPrompt}
                  onChange={(e) => setAnalysisPrompt(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg text-xs resize-none
                    bg-canvas-bg dark:bg-canvas-bg-dark
                    text-text-primary dark:text-text-primary-dark
                    border border-border dark:border-border-dark
                    focus:outline-none focus:border-accent
                    placeholder:text-text-secondary dark:placeholder:text-text-secondary-dark"
                />
                <button
                  onClick={handleAnalyzeImage}
                  disabled={isAnalyzing || !analysisPrompt.trim()}
                  className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium
                    bg-accent text-white dark:text-black hover:bg-accent-hover transition-colors
                    disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isAnalyzing ? (
                    <><Loader2 size={13} className="animate-spin" />分析中...</>
                  ) : (
                    <><ScanSearch size={13} />开始分析</>
                  )}
                </button>

                {/* Error */}
                {analysisError && (
                  <p className="text-xs text-danger bg-danger/10 rounded-lg px-3 py-2">
                    {analysisError}
                  </p>
                )}

                {/* Result */}
                {(analysisResult || isAnalyzing) && (
                  <div className="space-y-1">
                    <p className="text-[10px] font-medium text-text-secondary dark:text-text-secondary-dark uppercase tracking-wide flex items-center gap-1.5">
                      分析结果
                      {isAnalyzing && <Loader2 size={10} className="animate-spin" />}
                    </p>
                    <div
                      ref={resultScrollRef}
                      className="text-xs text-text-primary dark:text-text-primary-dark
                        bg-canvas-bg dark:bg-canvas-bg-dark rounded-lg px-3 py-2.5
                        border border-border dark:border-border-dark
                        max-h-64 overflow-y-auto
                        prose prose-xs dark:prose-invert prose-p:my-1 prose-headings:my-1.5
                        prose-li:my-0.5 prose-pre:text-[10px] max-w-none">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {analysisResult || '...'}
                      </ReactMarkdown>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center px-6 text-center gap-2">
              <ScanSearch size={32} className="text-text-secondary dark:text-text-secondary-dark opacity-40" />
              <p className="text-xs text-text-secondary dark:text-text-secondary-dark">
                当前节点暂无图片，生成图片后可在此进行分析
              </p>
            </div>
          )}
        </div>
      )}

      {nodeImage && (
        <ImagePreviewDialog
          isOpen={isPreviewOpen}
          onClose={() => setIsPreviewOpen(false)}
          images={[{ url: nodeImage }]}
          currentIndex={0}
          onIndexChange={() => {}}
        />
      )}
    </div>
  );
}
