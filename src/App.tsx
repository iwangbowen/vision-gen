import { useState, useEffect, useRef } from 'react';
import { ReactFlowProvider } from '@xyflow/react';
import Toolbar from './components/layout/Toolbar';
import AssetPanel from './components/layout/AssetPanel';
import PropertyPanel from './components/layout/PropertyPanel';
import Timeline from './components/layout/Timeline';
import InfiniteCanvas from './components/canvas/InfiniteCanvas';
import ShortcutsDialog from './components/ui/ShortcutsDialog';
import { useThemeStore } from './stores/themeStore';
import { useCanvasStore } from './stores/canvasStore';
import { useTimelineStore } from './stores/timelineStore';

function App() {
  const [leftPanelOpen, setLeftPanelOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const { rightPanelOpen, setRightPanelOpen } = useCanvasStore();
  const { collapsed: timelineCollapsed, setCollapsed: setTimelineCollapsed } = useTimelineStore();
  const { theme, toggleTheme } = useThemeStore();
  const chordRef = useRef(false);

  // Initialize dark class on mount
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check if the user is typing in an input or textarea
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA' ||
        (document.activeElement as HTMLElement)?.isContentEditable
      ) {
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        if (e.altKey) {
          // Ctrl + Alt + B: Toggle right panel
          setRightPanelOpen(!rightPanelOpen);
        } else {
          // Ctrl + B: Toggle left panel
          setLeftPanelOpen((prev) => !prev);
        }
      }

      if ((e.ctrlKey || e.metaKey) && e.altKey && e.key.toLowerCase() === 'p') {
        e.preventDefault();
        // Ctrl + Alt + P: Toggle timeline
        setTimelineCollapsed(!timelineCollapsed);
      }

      if ((e.ctrlKey || e.metaKey) && e.altKey && e.key.toLowerCase() === 'm') {
        e.preventDefault();
        // Ctrl + Alt + M: Toggle minimap
        globalThis.dispatchEvent(new CustomEvent('toggle-minimap'));
      }

      if ((e.ctrlKey || e.metaKey) && e.altKey && e.key.toLowerCase() === 't') {
        e.preventDefault();
        // Ctrl + Alt + T: Toggle theme
        toggleTheme();
      }

      // Ctrl+K chord start
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        chordRef.current = true;
        // Reset chord after timeout
        setTimeout(() => { chordRef.current = false; }, 1000);
        return;
      }

      // Ctrl+K, Ctrl+S: Open shortcuts dialog
      if (chordRef.current && (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        chordRef.current = false;
        setShortcutsOpen(true);
        return;
      }

      // Reset chord on any other key
      chordRef.current = false;
    };

    globalThis.addEventListener('keydown', handleKeyDown);
    return () => globalThis.removeEventListener('keydown', handleKeyDown);
  }, [rightPanelOpen, setRightPanelOpen, timelineCollapsed, setTimelineCollapsed]);

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

      <ShortcutsDialog isOpen={shortcutsOpen} onClose={() => setShortcutsOpen(false)} />
    </ReactFlowProvider>
  );
}

export default App;
