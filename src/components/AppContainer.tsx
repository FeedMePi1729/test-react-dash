import { ReactNode, useState, useEffect, forwardRef } from 'react';
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
  appName?: string;
  isMinimized?: boolean;
  onDragStart?: (e: React.DragEvent, appId: string) => void;
  onDragEnd?: () => void;
  onMinimize?: (appId: string) => void;
  onMaximize?: (appId: string) => void;
  onClose?: (appId: string) => void;
}

// Use forwardRef so react-grid-layout can attach refs for drag/resize functionality
export const GridItem = forwardRef<HTMLDivElement, GridItemProps>(
  ({ id, children, appName, isMinimized = false, onDragStart, onDragEnd, onMinimize, onMaximize, onClose, ...rest }, ref) => {
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

    const handleDragEnd = () => {
      if (onDragEnd) {
        onDragEnd();
      }
    };

    const handleMinimize = (e: React.MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();
      if (onMinimize) {
        onMinimize(id);
      }
    };

    const handleMaximize = (e: React.MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();
      if (onMaximize) {
        onMaximize(id);
      }
    };

    const handleClose = (e: React.MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();
      if (onClose) {
        onClose(id);
      }
    };

    const handleButtonMouseDown = (e: React.MouseEvent) => {
      // Prevent drag from starting when clicking the button
      e.stopPropagation();
      e.preventDefault();
    };

    const handleDragStartWithCheck = (e: React.DragEvent) => {
      // Don't start drag if clicking on the minimize button
      const target = e.target as HTMLElement;
      if (target.closest('button')) {
        e.preventDefault();
        return;
      }
      handleDragStart(e);
    };

    return (
      <div
        ref={ref}
        className="bloomberg-border bloomberg-border-amber bloomberg-bg-black h-full w-full overflow-hidden flex flex-col"
        draggable
        onDragStart={handleDragStartWithCheck}
        onDragEnd={handleDragEnd}
        {...rest}
      >
        <div className="drag-handle h-6 flex items-center justify-between px-2 bloomberg-border-b bloomberg-border-amber cursor-move">
          <div className="flex items-center gap-2 flex-1">
            <span className="text-bloomberg-amber font-mono text-xs">≡</span>
            {appName && (
              <span className="text-bloomberg-amber font-mono text-xs">{appName}</span>
            )}
          </div>
          <div className="flex items-center">
            <button
              onClick={isMinimized ? handleMaximize : handleMinimize}
              onMouseDown={handleButtonMouseDown}
              className="text-bloomberg-amber hover:text-white font-mono text-sm px-2 py-1 transition-colors min-w-[28px] flex items-center justify-center cursor-pointer"
              style={{ pointerEvents: 'auto', userSelect: 'none' }}
              title={isMinimized ? 'Maximize' : 'Minimize'}
            >
              {isMinimized ? '□' : '−'}
            </button>
            {onClose && (
              <button
                onClick={handleClose}
                onMouseDown={handleButtonMouseDown}
                className="text-bloomberg-amber hover:text-red-500 font-mono text-sm px-2 py-1 transition-colors min-w-[28px] flex items-center justify-center cursor-pointer"
                style={{ pointerEvents: 'auto', userSelect: 'none' }}
                title="Close"
              >
                ×
              </button>
            )}
          </div>
        </div>
        {!isMinimized && (
          <div className="flex-1 overflow-auto">
            {children}
          </div>
        )}
      </div>
    );
  }
);

