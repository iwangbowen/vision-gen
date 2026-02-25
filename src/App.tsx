import { useState, useEffect } from 'react';
import { ReactFlowProvider } from '@xyflow/react';
import Toolbar from './components/layout/Toolbar';
import AssetPanel from './components/layout/AssetPanel';
import PropertyPanel from './components/layout/PropertyPanel';
import Timeline from './components/layout/Timeline';
import InfiniteCanvas from './components/canvas/InfiniteCanvas';
import { useThemeStore } from './stores/themeStore';

function App() {
  const [leftPanelOpen, setLeftPanelOpen] = useState(true);
  const [rightPanelOpen, setRightPanelOpen] = useState(true);
  const { theme } = useThemeStore();

  // Initialize dark class on mount
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, []);

  return (
    <ReactFlowProvider>
      <div className="h-screen w-screen flex flex-col bg-canvas-bg dark:bg-canvas-bg-dark overflow-hidden">
        {/* Top Toolbar */}
        <Toolbar
          leftPanelOpen={leftPanelOpen}
          rightPanelOpen={rightPanelOpen}
          onToggleLeftPanel={() => setLeftPanelOpen(!leftPanelOpen)}
          onToggleRightPanel={() => setRightPanelOpen(!rightPanelOpen)}
        />

        {/* Main area */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Asset Panel */}
          {leftPanelOpen && <AssetPanel />}

          {/* Canvas */}
          <InfiniteCanvas />

          {/* Right Property Panel */}
          {rightPanelOpen && <PropertyPanel />}
        </div>

        {/* Bottom Timeline */}
        <Timeline />
      </div>
    </ReactFlowProvider>
  );
}

export default App;
