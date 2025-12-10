import { useState } from 'react';

export interface Tab {
  id: string;
  name: string;
  isActive: boolean;
}

interface TabManagerProps {
  tabs: Tab[];
  activeTabId: string | null;
  onTabClick: (tabId: string) => void;
  onTabClose: (tabId: string) => void;
  onTabRename: (tabId: string, newName: string) => void;
  onNewTab: () => void;
  onTabDrop?: (tabId: string, appId: string) => void;
  draggingAppId?: string | null;
  onTabReorder?: (draggedTabId: string, targetTabId: string) => void;
  onTabPopOut?: (tabId: string) => void;
}

export const TabManager = ({
  tabs,
  activeTabId,
  onTabClick,
  onTabClose,
  onTabRename,
  onNewTab,
  onTabDrop,
  draggingAppId,
  onTabReorder,
  onTabPopOut,
}: TabManagerProps) => {
  const [renamingTabId, setRenamingTabId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [draggingTabId, setDraggingTabId] = useState<string | null>(null);

  const handleRenameStart = (tab: Tab) => {
    setRenamingTabId(tab.id);
    setRenameValue(tab.name);
  };

  const handleRenameSubmit = (tabId: string) => {
    if (renameValue.trim()) {
      onTabRename(tabId, renameValue.trim());
    }
    setRenamingTabId(null);
    setRenameValue('');
  };

  const handleRenameCancel = () => {
    setRenamingTabId(null);
    setRenameValue('');
  };

  const handleTabDragStart = (e: React.DragEvent, tabId: string) => {
    // Only allow dragging if not renaming
    if (renamingTabId === tabId) {
      e.preventDefault();
      return;
    }
    setDraggingTabId(tabId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('application/tab-id', tabId);
    // Create custom drag image
    const dragImage = document.createElement('div');
    dragImage.style.position = 'absolute';
    dragImage.style.top = '-1000px';
    dragImage.style.padding = '4px 8px';
    dragImage.style.backgroundColor = '#000000';
    dragImage.style.border = '1px solid #FF9800';
    dragImage.style.color = '#FF9800';
    dragImage.style.fontFamily = 'monospace';
    dragImage.style.fontSize = '12px';
    const tab = tabs.find(t => t.id === tabId);
    dragImage.textContent = tab?.name || 'Tab';
    document.body.appendChild(dragImage);
    e.dataTransfer.setDragImage(dragImage, 0, 0);
    setTimeout(() => document.body.removeChild(dragImage), 0);
  };

  const handleTabDragEnd = () => {
    setDraggingTabId(null);
  };

  const handleDragOver = (e: React.DragEvent, tabId: string) => {
    // Handle app drops on tabs
    if (draggingAppId && onTabDrop) {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      return;
    }
    // Handle tab reordering
    if (draggingTabId && draggingTabId !== tabId && onTabReorder) {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
    }
  };

  const handleDrop = (e: React.DragEvent, tabId: string) => {
    e.preventDefault();
    // Handle app drops
    if (draggingAppId && onTabDrop) {
      onTabDrop(tabId, draggingAppId);
      return;
    }
    // Handle tab reordering
    if (draggingTabId && draggingTabId !== tabId && onTabReorder) {
      onTabReorder(draggingTabId, tabId);
    }
    setDraggingTabId(null);
  };

  return (
    <div className="flex items-center bloomberg-bg-black h-10 overflow-x-auto" style={{ borderBottom: '1px solid #FF9800' }}>
      {tabs.map((tab) => (
        <div
          key={tab.id}
          draggable={renamingTabId !== tab.id}
          onDragStart={(e) => handleTabDragStart(e, tab.id)}
          onDragEnd={handleTabDragEnd}
          className={`
            flex items-center px-3 py-1 h-full cursor-move
            ${tab.id === activeTabId 
              ? 'bg-black' 
              : 'hover:bg-gray-900'
            }
            ${draggingAppId && tab.id !== activeTabId ? 'opacity-100' : ''}
            ${draggingTabId === tab.id ? 'opacity-50' : ''}
          `}
          style={{
            borderBottom: tab.id === activeTabId ? '2px solid #FF9800' : 'none',
            borderRight: tab.id !== activeTabId ? '1px solid #FF9800' : 'none',
            backgroundColor: (draggingAppId && tab.id !== activeTabId) || (draggingTabId && draggingTabId !== tab.id && tab.id !== activeTabId) ? 'rgba(255, 152, 0, 0.1)' : undefined,
          }}
          onClick={() => onTabClick(tab.id)}
          onDoubleClick={() => handleRenameStart(tab)}
          onDragOver={(e) => handleDragOver(e, tab.id)}
          onDrop={(e) => handleDrop(e, tab.id)}
        >
          {renamingTabId === tab.id ? (
            <input
              type="text"
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              onBlur={() => handleRenameSubmit(tab.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleRenameSubmit(tab.id);
                } else if (e.key === 'Escape') {
                  handleRenameCancel();
                }
              }}
              className="bg-black text-white font-mono text-xs px-1 outline-none bloomberg-border-amber"
              autoFocus
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <>
              <span className="text-white font-mono text-xs mr-2">{tab.name}</span>
              {onTabPopOut && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onTabPopOut(tab.id);
                  }}
                  className="text-bloomberg-amber hover:text-bloomberg-amber-dark font-mono text-xs ml-1 px-1"
                  title="Pop out tab"
                >
                  ↗
                </button>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onTabClose(tab.id);
                }}
                className="text-bloomberg-amber hover:text-bloomberg-amber-dark font-mono text-xs ml-1 px-1"
              >
                ×
              </button>
            </>
          )}
        </div>
      ))}
      <button
        onClick={onNewTab}
        className="px-3 py-1 h-full text-bloomberg-amber hover:bg-gray-900 font-mono text-xs"
        style={{ borderLeft: '1px solid #FF9800' }}
      >
        +
      </button>
    </div>
  );
};

