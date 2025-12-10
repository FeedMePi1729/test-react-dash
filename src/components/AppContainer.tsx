import { ReactNode, useState, useEffect } from 'react';
import GridLayout, { Layout } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

interface AppContainerProps {
  children: ReactNode;
  layouts: Layout[];
  onLayoutChange: (layouts: Layout[]) => void;
  onDrop?: (appId: string) => void;
  draggingAppId?: string | null;
}

export const AppContainer = ({ children, layouts, onLayoutChange, onDrop, draggingAppId }: AppContainerProps) => {
  const [width, setWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => {
      setWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleDragOver = (e: React.DragEvent) => {
    if (draggingAppId && onDrop) {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (draggingAppId && onDrop) {
      onDrop(draggingAppId);
    }
  };

  return (
    <div 
      className="h-full w-full bloomberg-bg-black"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      style={{
        backgroundColor: draggingAppId ? 'rgba(255, 152, 0, 0.05)' : '#000000',
        height: '100%',
        width: '100%',
        overflow: 'auto',
      }}
    >
      <GridLayout
        className="layout"
        layout={layouts}
        cols={12}
        rowHeight={30}
        width={width}
        onLayoutChange={onLayoutChange}
        draggableHandle=".drag-handle"
        isResizable={true}
        resizeHandles={['se', 's', 'e', 'sw', 'w', 'nw', 'n', 'ne']}
        compactType={null}
        preventCollision={true}
        allowOverlap={false}
        minW={2}
        minH={2}
        style={{
          backgroundColor: '#000000',
          minHeight: '100%',
        }}
      >
        {children}
      </GridLayout>
    </div>
  );
};

interface GridItemProps {
  id: string;
  children: ReactNode;
  onDragStart?: (e: React.DragEvent, appId: string) => void;
  onDragEnd?: () => void;
}

export const GridItem = ({ id, children, onDragStart, onDragEnd }: GridItemProps) => {
  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('application/app-id', id);
    // Create a custom drag image
    const dragImage = document.createElement('div');
    dragImage.style.position = 'absolute';
    dragImage.style.top = '-1000px';
    dragImage.style.padding = '8px';
    dragImage.style.backgroundColor = '#000000';
    dragImage.style.border = '1px solid #FF9800';
    dragImage.style.color = '#FF9800';
    dragImage.style.fontFamily = 'monospace';
    dragImage.style.fontSize = '12px';
    dragImage.textContent = 'Moving app...';
    document.body.appendChild(dragImage);
    e.dataTransfer.setDragImage(dragImage, 0, 0);
    setTimeout(() => document.body.removeChild(dragImage), 0);
    
    if (onDragStart) {
      onDragStart(e, id);
    }
  };

  const handleDragEnd = (e: React.DragEvent) => {
    if (onDragEnd) {
      onDragEnd();
    }
  };

  return (
    <div
      className="bloomberg-border bloomberg-border-amber bloomberg-bg-black h-full w-full overflow-hidden"
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="drag-handle h-6 flex items-center px-2 bloomberg-border-b bloomberg-border-amber cursor-move">
        <span className="text-bloomberg-amber font-mono text-xs">≡</span>
      </div>
      <div className="h-[calc(100%-1.5rem)] overflow-auto">
        {children}
      </div>
    </div>
  );
};

