import { useState, useCallback, useMemo, useEffect } from 'react';
import { CommandConsole } from './components/CommandConsole';
import { TabManager, Tab } from './components/TabManager';
import { AppContainer, GridItem } from './components/AppContainer';
import { parseCommand } from './utils/commandParser';
import { appRegistry } from './apps/AppRegistry';
import { AppInstance } from './apps/types';
import { Layout } from 'react-grid-layout';

interface TabWithApps extends Tab {
  appInstances: AppInstance[];
  layouts: Layout[];
}

function App() {
  // Check for popped-out tab data in URL
  const getInitialTabs = (): TabWithApps[] => {
    const urlParams = new URLSearchParams(window.location.search);
    const popoutData = urlParams.get('popout');
    
    if (popoutData) {
      try {
        const tabData = JSON.parse(decodeURIComponent(popoutData));
        // Clean up URL
        window.history.replaceState({}, '', window.location.pathname);
        return [{
          id: tabData.id,
          name: tabData.name,
          isActive: true,
          appInstances: tabData.appInstances || [],
          layouts: tabData.layouts || [],
        }];
      } catch (e) {
        console.error('Failed to parse popout data:', e);
      }
    }
    
    return [
      {
        id: 'tab-1',
        name: 'Tab 1',
        isActive: true,
        appInstances: [],
        layouts: [],
      },
    ];
  };

  const [tabs, setTabs] = useState<TabWithApps[]>(getInitialTabs);
  const [activeTabId, setActiveTabId] = useState<string>(() => {
    const initialTabs = getInitialTabs();
    return initialTabs[0]?.id || 'tab-1';
  });
  const [draggingAppId, setDraggingAppId] = useState<string | null>(null);

  const activeTab = useMemo(() => {
    return tabs.find(t => t.id === activeTabId) || tabs[0];
  }, [tabs, activeTabId]);

  // Calculate split-screen layout for new apps
  // rowHeight is 30px, so calculate height based on viewport
  const calculateNewAppLayout = useCallback((existingAppsCount: number): Omit<Layout, 'i'> => {
    // Calculate available height in grid units (rowHeight = 30px)
    // Account for console (32px) + tab bar (40px) = 72px
    const availableHeight = Math.floor((window.innerHeight - 72) / 30);
    const fullHeight = Math.max(availableHeight, 20); // Minimum 20 rows
    
    if (existingAppsCount === 0) {
      // First app: full screen
      return {
        x: 0,
        y: 0,
        w: 12,
        h: fullHeight,
      };
    } else if (existingAppsCount === 1) {
      // Second app: split horizontally
      // Resize first app to half width, place second app on the right
      return {
        x: 6,
        y: 0,
        w: 6,
        h: fullHeight,
      };
    } else {
      // Third+ app: find available space or split further
      // Stack vertically, alternating sides
      const row = Math.floor((existingAppsCount - 1) / 2);
      const halfHeight = Math.floor(fullHeight / 2);
      return {
        x: existingAppsCount % 2 === 0 ? 0 : 6,
        y: row * halfHeight,
        w: 6,
        h: halfHeight,
      };
    }
  }, []);

  const handleCommand = useCallback((command: string) => {
    const parsed = parseCommand(command);

    switch (parsed.type) {
      case 'LOAD': {
        if (parsed.args.length === 0) {
          console.log('Usage: LOAD [app_name]');
          return;
        }
        const appName = parsed.args.join(' ');
        const app = appRegistry.findByName(appName);
        
        if (!app) {
          console.log(`App "${appName}" not found. Available apps: ${appRegistry.getAll().map(a => a.name).join(', ')}`);
          return;
        }

        const newInstance: AppInstance = {
          id: `app-${Date.now()}`,
          appId: app.id,
          name: app.name,
        };

        setTabs(prev => prev.map(tab => {
          if (tab.id === activeTabId) {
            const existingCount = tab.appInstances.length;
            let newLayouts = [...tab.layouts];
            
            // If this is the second app, resize the first app to half width
            if (existingCount === 1 && newLayouts.length > 0) {
              // Calculate full height
              const availableHeight = Math.floor((window.innerHeight - 72) / 30);
              const fullHeight = Math.max(availableHeight, 20);
              // Create new array with updated first layout to ensure React detects the change
              newLayouts = [
                {
                  ...newLayouts[0],
                  w: 6,
                  h: fullHeight,
                  x: 0,
                  y: 0,
                },
                ...newLayouts.slice(1)
              ];
            }
            
            // Calculate layout for new app
            const newLayoutTemplate = calculateNewAppLayout(existingCount);
            const newLayout: Layout = {
              ...newLayoutTemplate,
              i: newInstance.id,
            };
            
            // Create new array with the new layout
            newLayouts = [...newLayouts, newLayout];
            return {
              ...tab,
              appInstances: [...tab.appInstances, newInstance],
              layouts: newLayouts,
            };
          }
          return tab;
        }));
        break;
      }

      case 'NEW_TAB': {
        const newTab: TabWithApps = {
          id: `tab-${Date.now()}`,
          name: `Tab ${tabs.length + 1}`,
          isActive: false,
          appInstances: [],
          layouts: [],
        };
        setTabs(prev => prev.map(t => ({ ...t, isActive: false })).concat(newTab));
        setActiveTabId(newTab.id);
        break;
      }

      case 'CLOSE_TAB': {
        if (tabs.length <= 1) {
          console.log('Cannot close the last tab');
          return;
        }
        const tabIndex = parsed.args[0] ? parseInt(parsed.args[0]) - 1 : tabs.findIndex(t => t.id === activeTabId);
        if (tabIndex >= 0 && tabIndex < tabs.length) {
          const tabToClose = tabs[tabIndex];
          const newTabs = tabs.filter(t => t.id !== tabToClose.id);
          if (tabToClose.id === activeTabId) {
            setActiveTabId(newTabs[0].id);
          }
          setTabs(newTabs.map((t, idx) => ({ ...t, isActive: idx === 0 })));
        }
        break;
      }

      case 'MARKET_VIEW': {
        const marketApp = appRegistry.get('market-view');
        if (marketApp) {
          const newInstance: AppInstance = {
            id: `app-${Date.now()}`,
            appId: marketApp.id,
            name: marketApp.name,
          };
          setTabs(prev => prev.map(tab => {
            if (tab.id === activeTabId) {
              const existingCount = tab.appInstances.length;
              const newLayouts = [...tab.layouts];
              
              // If this is the second app, resize the first app to half width
              if (existingCount === 1 && newLayouts.length > 0) {
                // Calculate full height
                const availableHeight = Math.floor((window.innerHeight - 72) / 30);
                const fullHeight = Math.max(availableHeight, 20);
                // Resize first app to left half, preserve y position
                newLayouts[0] = {
                  ...newLayouts[0],
                  w: 6,
                  h: fullHeight,
                  x: 0, // Ensure it's on the left
                  y: 0, // Ensure it starts at top
                };
              }
              
              const newLayoutTemplate = calculateNewAppLayout(existingCount);
              const newLayout: Layout = {
                ...newLayoutTemplate,
                i: newInstance.id,
              };
              
              newLayouts.push(newLayout);
              return {
                ...tab,
                appInstances: [...tab.appInstances, newInstance],
                layouts: newLayouts,
              };
            }
            return tab;
          }));
        }
        break;
      }

      case 'SETTINGS': {
        const settingsApp = appRegistry.get('settings');
        if (settingsApp) {
          const newInstance: AppInstance = {
            id: `app-${Date.now()}`,
            appId: settingsApp.id,
            name: settingsApp.name,
          };
          setTabs(prev => prev.map(tab => {
            if (tab.id === activeTabId) {
              const existingCount = tab.appInstances.length;
              const newLayouts = [...tab.layouts];
              
              // If this is the second app, resize the first app to half width
              if (existingCount === 1 && newLayouts.length > 0) {
                // Calculate full height
                const availableHeight = Math.floor((window.innerHeight - 72) / 30);
                const fullHeight = Math.max(availableHeight, 20);
                // Resize first app to left half, preserve y position
                newLayouts[0] = {
                  ...newLayouts[0],
                  w: 6,
                  h: fullHeight,
                  x: 0, // Ensure it's on the left
                  y: 0, // Ensure it starts at top
                };
              }
              
              const newLayoutTemplate = calculateNewAppLayout(existingCount);
              const newLayout: Layout = {
                ...newLayoutTemplate,
                i: newInstance.id,
              };
              
              newLayouts.push(newLayout);
              return {
                ...tab,
                appInstances: [...tab.appInstances, newInstance],
                layouts: newLayouts,
              };
            }
            return tab;
          }));
        }
        break;
      }

      case 'HELP': {
        const helpApp = appRegistry.get('help');
        if (helpApp) {
          const newInstance: AppInstance = {
            id: `app-${Date.now()}`,
            appId: helpApp.id,
            name: helpApp.name,
          };
          setTabs(prev => prev.map(tab => {
            if (tab.id === activeTabId) {
              const existingCount = tab.appInstances.length;
              const newLayouts = [...tab.layouts];
              
              // If this is the second app, resize the first app to half width
              if (existingCount === 1 && newLayouts.length > 0) {
                // Calculate full height
                const availableHeight = Math.floor((window.innerHeight - 72) / 30);
                const fullHeight = Math.max(availableHeight, 20);
                // Resize first app to left half, preserve y position
                newLayouts[0] = {
                  ...newLayouts[0],
                  w: 6,
                  h: fullHeight,
                  x: 0, // Ensure it's on the left
                  y: 0, // Ensure it starts at top
                };
              }
              
              const newLayoutTemplate = calculateNewAppLayout(existingCount);
              const newLayout: Layout = {
                ...newLayoutTemplate,
                i: newInstance.id,
              };
              
              newLayouts.push(newLayout);
              return {
                ...tab,
                appInstances: [...tab.appInstances, newInstance],
                layouts: newLayouts,
              };
            }
            return tab;
          }));
        }
        break;
      }

      case 'UNKNOWN': {
        console.log(`Unknown command: "${parsed.raw}". Type HELP for available commands.`);
        break;
      }
    }
  }, [tabs, activeTabId]);

  const handleTabClick = useCallback((tabId: string) => {
    setTabs(prev => prev.map(t => ({ ...t, isActive: t.id === tabId })));
    setActiveTabId(tabId);
  }, []);

  const handleTabClose = useCallback((tabId: string) => {
    if (tabs.length <= 1) {
      return;
    }
    const newTabs = tabs.filter(t => t.id !== tabId);
    if (tabId === activeTabId) {
      setActiveTabId(newTabs[0].id);
    }
    setTabs(newTabs.map((t, idx) => ({ ...t, isActive: idx === 0 })));
  }, [tabs, activeTabId]);

  const handleTabRename = useCallback((tabId: string, newName: string) => {
    setTabs(prev => prev.map(t => t.id === tabId ? { ...t, name: newName } : t));
  }, []);

  const handleTabReorder = useCallback((draggedTabId: string, targetTabId: string) => {
    setTabs(prev => {
      const draggedIndex = prev.findIndex(t => t.id === draggedTabId);
      const targetIndex = prev.findIndex(t => t.id === targetTabId);
      
      if (draggedIndex === -1 || targetIndex === -1 || draggedIndex === targetIndex) {
        return prev;
      }

      const newTabs = [...prev];
      const [draggedTab] = newTabs.splice(draggedIndex, 1);
      newTabs.splice(targetIndex, 0, draggedTab);
      
      return newTabs;
    });
  }, []);

  const handleTabPopOut = useCallback((tabId: string) => {
    const tab = tabs.find(t => t.id === tabId);
    if (!tab) return;

    // Serialize the tab data
    const tabData = {
      id: tab.id,
      name: tab.name,
      appInstances: tab.appInstances,
      layouts: tab.layouts,
    };

    // Encode the data as a URL parameter
    const encodedData = encodeURIComponent(JSON.stringify(tabData));
    const url = `${window.location.origin}${window.location.pathname}?popout=${encodedData}`;

    // Open new window
    const newWindow = window.open(
      url,
      `dashboard-${tab.id}`,
      'width=1200,height=800,resizable=yes,scrollbars=yes'
    );

    if (newWindow) {
      // Remove the tab from current window after a short delay to ensure new window opens
      // Only remove if there's more than one tab (keep at least one tab)
      setTimeout(() => {
        if (tabs.length > 1) {
          setTabs(prev => {
            const filtered = prev.filter(t => t.id !== tabId);
            // Ensure at least one tab remains
            if (filtered.length === 0) {
              return [{
                id: 'tab-1',
                name: 'Tab 1',
                isActive: true,
                appInstances: [],
                layouts: [],
              }];
            }
            return filtered;
          });
          if (activeTabId === tabId) {
            const remainingTabs = tabs.filter(t => t.id !== tabId);
            if (remainingTabs.length > 0) {
              setActiveTabId(remainingTabs[0].id);
            } else {
              setActiveTabId('tab-1');
            }
          }
        }
      }, 100);
    }
  }, [tabs, activeTabId]);

  const handleNewTab = useCallback(() => {
    const newTab: TabWithApps = {
      id: `tab-${Date.now()}`,
      name: `Tab ${tabs.length + 1}`,
      isActive: false,
      appInstances: [],
      layouts: [],
    };
    setTabs(prev => prev.map(t => ({ ...t, isActive: false })).concat(newTab));
    setActiveTabId(newTab.id);
  }, [tabs.length]);

  const handleLayoutChange = useCallback((layouts: Layout[]) => {
    setTabs(prev => prev.map(tab => 
      tab.id === activeTabId ? { ...tab, layouts } : tab
    ));
  }, [activeTabId]);

  const handleDragStart = useCallback((_e: React.DragEvent, appId: string) => {
    setDraggingAppId(appId);
  }, []);

  const handleDragEnd = useCallback(() => {
    setDraggingAppId(null);
  }, []);

  const handleTabDrop = useCallback((targetTabId: string, appId: string) => {
    setTabs(prev => {
      // Find the source tab and app instance
      let sourceTab: TabWithApps | undefined;
      let appInstance: AppInstance | undefined;
      let appLayout: Layout | undefined;

      for (const tab of prev) {
        const instance = tab.appInstances.find(inst => inst.id === appId);
        if (instance) {
          sourceTab = tab;
          appInstance = instance;
          appLayout = tab.layouts.find(l => l.i === appId);
          break;
        }
      }

      if (!sourceTab || !appInstance || targetTabId === sourceTab.id) {
        return prev;
      }

      // Remove from source tab
      const updatedTabs = prev.map(tab => {
        if (tab.id === sourceTab!.id) {
          return {
            ...tab,
            appInstances: tab.appInstances.filter(inst => inst.id !== appId),
            layouts: tab.layouts.filter(l => l.i !== appId),
          };
        }
        return tab;
      });

      // Add to target tab with a new position
      return updatedTabs.map(tab => {
        if (tab.id === targetTabId) {
          const newLayout: Layout = appLayout 
            ? { ...appLayout, x: 0, y: 0 } // Reset position to top-left
            : {
                i: appInstance!.id,
                x: 0,
                y: 0,
                w: 3,
                h: 4,
              };
          
          return {
            ...tab,
            appInstances: [...tab.appInstances, appInstance!],
            layouts: [...tab.layouts, newLayout],
          };
        }
        return tab;
      });
    });

    setDraggingAppId(null);
    // Optionally switch to the target tab
    setActiveTabId(targetTabId);
  }, []);

  const tabManagerTabs: Tab[] = useMemo(() => {
    return tabs.map(t => ({
      id: t.id,
      name: t.name,
      isActive: t.id === activeTabId,
    }));
  }, [tabs, activeTabId]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts if user is typing in an input/textarea
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        return;
      }

      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const ctrlOrCmd = isMac ? e.metaKey : e.ctrlKey;

      // Ctrl+T / Cmd+T - New tab
      if (ctrlOrCmd && e.key === 't') {
        e.preventDefault();
        handleNewTab();
        return;
      }

      // Ctrl+W / Cmd+W - Close current tab
      if (ctrlOrCmd && e.key === 'w') {
        e.preventDefault();
        if (tabs.length > 1) {
          handleTabClose(activeTabId);
        }
        return;
      }

      // Ctrl+Tab / Cmd+Option+Right - Next tab
      if ((ctrlOrCmd && e.key === 'Tab' && !e.shiftKey) || 
          (isMac && e.metaKey && e.altKey && e.key === 'ArrowRight')) {
        e.preventDefault();
        const currentIndex = tabs.findIndex(t => t.id === activeTabId);
        const nextIndex = (currentIndex + 1) % tabs.length;
        handleTabClick(tabs[nextIndex].id);
        return;
      }

      // Ctrl+Shift+Tab / Cmd+Option+Left - Previous tab
      if ((ctrlOrCmd && e.key === 'Tab' && e.shiftKey) ||
          (isMac && e.metaKey && e.altKey && e.key === 'ArrowLeft')) {
        e.preventDefault();
        const currentIndex = tabs.findIndex(t => t.id === activeTabId);
        const prevIndex = (currentIndex - 1 + tabs.length) % tabs.length;
        handleTabClick(tabs[prevIndex].id);
        return;
      }

      // Ctrl+1-9 / Cmd+1-9 - Switch to tab by number
      if (ctrlOrCmd && e.key >= '1' && e.key <= '9') {
        e.preventDefault();
        const tabNumber = parseInt(e.key) - 1;
        if (tabNumber < tabs.length) {
          handleTabClick(tabs[tabNumber].id);
        }
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [tabs, activeTabId, handleNewTab, handleTabClose, handleTabClick]);

  return (
    <div className="h-screen w-screen bloomberg-bg-black flex flex-col overflow-hidden">
      <CommandConsole onCommand={handleCommand} position="top" />
      <div style={{ position: 'fixed', top: '32px', left: 0, right: 0, zIndex: 40, backgroundColor: '#000000' }}>
      <TabManager
        tabs={tabManagerTabs}
        activeTabId={activeTabId}
        onTabClick={handleTabClick}
        onTabClose={handleTabClose}
        onTabRename={handleTabRename}
        onNewTab={handleNewTab}
        onTabDrop={handleTabDrop}
        draggingAppId={draggingAppId}
        onTabReorder={handleTabReorder}
        onTabPopOut={handleTabPopOut}
      />
      </div>
      <div 
        className="overflow-hidden bloomberg-bg-black" 
        style={{ 
          marginTop: '72px',
          height: 'calc(100vh - 72px)',
          width: '100vw',
          position: 'relative'
        }}
      >
        <AppContainer
          layouts={activeTab.layouts}
          onLayoutChange={handleLayoutChange}
          draggingAppId={draggingAppId}
        >
          {activeTab.appInstances.map(instance => {
            const app = appRegistry.get(instance.appId);
            if (!app) return null;
            const AppComponent = app.component;
            return (
              <GridItem 
                key={instance.id} 
                id={instance.id}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
              >
                <AppComponent />
              </GridItem>
            );
          })}
        </AppContainer>
      </div>
    </div>
  );
}

export default App;

