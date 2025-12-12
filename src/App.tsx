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

interface SavedTabData {
  name: string;
  appInstances: AppInstance[];
  layouts: Layout[];
  minimizedAppIds: string[];
}

// Storage utilities for saved views
const saveView = (viewName: string, tabData: SavedTabData): void => {
  const key = `dashboard-view-${viewName}`;
  try {
    localStorage.setItem(key, JSON.stringify(tabData));
  } catch (e) {
    console.error('Failed to save view:', e);
  }
};

const loadView = (viewName: string): SavedTabData | null => {
  const key = `dashboard-view-${viewName}`;
  try {
    const stored = localStorage.getItem(key);
    if (stored) {
      return JSON.parse(stored) as SavedTabData;
    }
  } catch (e) {
    console.error('Failed to load view:', e);
  }
  return null;
};

// Parse popout data once, outside component to avoid StrictMode double-invocation issues
const parsePopoutData = (): { tabs: TabWithApps[]; activeTabId: string; popoutKey: string | null } => {
  const urlParams = new URLSearchParams(window.location.search);
  const popoutKey = urlParams.get('popout');

  if (popoutKey) {
    try {
      const storedData = localStorage.getItem(popoutKey);
      if (storedData) {
        const tabData = JSON.parse(storedData);
        return {
          tabs: [{
            id: tabData.id,
            name: tabData.name || 'Popped Out Tab',
            isActive: true,
            appInstances: tabData.appInstances || [],
            layouts: tabData.layouts || [],
          }],
          activeTabId: tabData.id,
          popoutKey,
        };
      }
    } catch (e) {
      console.error('Failed to parse popout data:', e);
    }
  }

  return {
    tabs: [{
      id: 'tab-1',
      name: 'Tab 1',
      isActive: true,
      appInstances: [],
      layouts: [],
    }],
    activeTabId: 'tab-1',
    popoutKey: null,
  };
};

// Parse once at module load time (before React renders)
const initialData = parsePopoutData();

function App() {
  const [tabs, setTabs] = useState<TabWithApps[]>(initialData.tabs);
  const [activeTabId, setActiveTabId] = useState<string>(initialData.activeTabId);
  const [minimizedApps, setMinimizedApps] = useState<Set<string>>(new Set());
  const [isLayoutLocked, setIsLayoutLocked] = useState(false);

  // Clean up localStorage and URL after component mounts (only once)
  // Also initialize font size from localStorage
  useEffect(() => {
    if (initialData.popoutKey) {
      localStorage.removeItem(initialData.popoutKey);
      window.history.replaceState({}, '', window.location.pathname);
    }

    // Initialize font size from localStorage
    const saved = localStorage.getItem('dashboard-settings');
    if (saved) {
      try {
        const settings = JSON.parse(saved);
        const root = document.documentElement;
        switch (settings.fontSize) {
          case 'small':
            root.style.setProperty('--font-size-base', '12px');
            break;
          case 'medium':
            root.style.setProperty('--font-size-base', '14px');
            break;
          case 'large':
            root.style.setProperty('--font-size-base', '16px');
            break;
        }
      } catch (e) {
        // Ignore parse errors
      }
    }
  }, []);
  const [draggingAppId, setDraggingAppId] = useState<string | null>(null);

  const activeTab = useMemo(() => {
    return tabs.find(t => t.id === activeTabId) || tabs[0];
  }, [tabs, activeTabId]);

  // Calculate smart layouts for all apps in a tab
  // Arranges apps in a 2-column grid pattern
  const calculateSmartLayouts = useCallback((appInstances: AppInstance[], _existingLayouts: Layout[]): Layout[] => {
    const availableHeight = Math.floor((window.innerHeight - 72) / 30);
    const fullHeight = Math.max(availableHeight, 20);
    const totalApps = appInstances.length;

    if (totalApps === 0) return [];

    // Grid configuration: 2 apps per row
    const appsPerRow = 2;
    const widthPerApp = 12 / appsPerRow; // 6 columns per app
    const rowsNeeded = Math.ceil(totalApps / appsPerRow);
    const heightPerApp = Math.floor(fullHeight / rowsNeeded);

    return appInstances.map((instance, idx) => {
      const row = Math.floor(idx / appsPerRow);
      const col = idx % appsPerRow;

      // For single app, use full width
      if (totalApps === 1) {
        return {
          i: instance.id,
          x: 0,
          y: 0,
          w: 12,
          h: fullHeight,
        };
      }

      // For multiple apps, calculate grid position
      // Special case: if odd number of apps, last app in bottom row gets full width
      const isLastAppInIncompleteRow = (idx === totalApps - 1) && (totalApps % appsPerRow !== 0);

      return {
        i: instance.id,
        x: isLastAppInIncompleteRow ? 0 : col * widthPerApp,
        y: row * heightPerApp,
        w: isLastAppInIncompleteRow ? 12 : widthPerApp,
        h: heightPerApp,
      };
    });
  }, []);


  const spawnApp = useCallback((appId: string) => {
    const app = appRegistry.get(appId);
    if (app) {
      const newInstance: AppInstance = {
        id: `app-${Date.now()}`,
        appId: app.id,
        name: app.name,
      };
      setIsLayoutLocked(true);
      setTabs(prev => prev.map(tab => {
        if (tab.id === activeTabId) {
          // Add new app to existing apps
          const updatedAppInstances = [...tab.appInstances, newInstance];
          const newLayouts = calculateSmartLayouts(updatedAppInstances, tab.layouts);

          return {
            ...tab,
            appInstances: updatedAppInstances,
            layouts: newLayouts,
          };
        }
        return tab;
      }));
      setTimeout(() => setIsLayoutLocked(false), 100);
    } else {
      console.error(`App with ID ${appId} not found`);
    }
  }, [activeTabId, calculateSmartLayouts]);

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

  const handleCommand = useCallback((command: string) => {
    const parsed = parseCommand(command);

    const handlers: Partial<Record<string, (args: string[]) => void>> = {
      'LOAD': (args) => {
        if (args.length === 0) {
          console.log('Usage: LOAD [app_name]');
          return;
        }
        const appName = args.join(' ');
        const app = appRegistry.findByName(appName);

        if (!app) {
          console.log(`App "${appName}" not found. Available apps: ${appRegistry.getAll().map(a => a.name).join(', ')}`);
          return;
        }
        spawnApp(app.id);
      },
      'NEW_TAB': () => handleNewTab(),
      'CLOSE_TAB': (args) => {
        if (tabs.length <= 1) {
          console.log('Cannot close the last tab');
          return;
        }
        const tabIndex = args[0] ? parseInt(args[0]) - 1 : tabs.findIndex(t => t.id === activeTabId);
        if (tabIndex >= 0 && tabIndex < tabs.length) {
          handleTabClose(tabs[tabIndex].id);
        }
      },
      'SETTINGS': () => spawnApp('settings'),
      'HELP': () => spawnApp('help'),
      'SAVE': (args) => {
        if (args.length === 0) {
          console.log('Usage: SAVE [view_name]');
          return;
        }
        // Extract view name from original input to preserve case
        const viewName = parsed.raw.replace(/^save\s+/i, '').trim();
        const activeTab = tabs.find(t => t.id === activeTabId);
        if (!activeTab) {
          console.log('No active tab to save');
          return;
        }

        // Filter minimized apps to only include those in the active tab
        const minimizedAppIds = Array.from(minimizedApps).filter(appId =>
          activeTab.appInstances.some(inst => inst.id === appId)
        );

        const savedData: SavedTabData = {
          name: activeTab.name,
          appInstances: activeTab.appInstances,
          layouts: activeTab.layouts,
          minimizedAppIds,
        };

        saveView(viewName, savedData);
        console.log(`View "${viewName}" saved successfully`);
      },
      'LOAD_VIEW': (args) => {
        if (args.length === 0) {
          console.log('Usage: LOAD VIEW [view_name]');
          return;
        }
        // Extract view name from original input to preserve case
        const viewName = parsed.raw.replace(/^load\s+view\s+/i, '').trim();
        const savedData = loadView(viewName);

        if (!savedData) {
          console.log(`View "${viewName}" not found. Use LIST VIEWS to see available views.`);
          return;
        }

        // Lock layout to prevent react-grid-layout from overwriting
        setIsLayoutLocked(true);
        setTabs(prev => prev.map(tab => {
          if (tab.id === activeTabId) {
            return {
              ...tab,
              name: savedData.name,
              appInstances: savedData.appInstances,
              layouts: savedData.layouts,
            };
          }
          return tab;
        }));

        // Restore minimized apps state
        setMinimizedApps(prev => {
          const newSet = new Set(prev);
          // Remove minimized state for apps not in the loaded view
          savedData.appInstances.forEach(inst => {
            if (savedData.minimizedAppIds.includes(inst.id)) {
              newSet.add(inst.id);
            } else {
              newSet.delete(inst.id);
            }
          });
          // Remove minimized state for apps that are no longer in the tab
          Array.from(newSet).forEach(appId => {
            if (!savedData.appInstances.some(inst => inst.id === appId)) {
              newSet.delete(appId);
            }
          });
          return newSet;
        });

        setTimeout(() => setIsLayoutLocked(false), 100);
        console.log(`View "${viewName}" loaded successfully`);
      },
      'LIST_VIEWS': () => spawnApp('views'),
      'UNKNOWN': () => {
        console.log(`Unknown command: "${parsed.raw}". Type HELP for available commands.`);
      }
    };

    const handler = handlers[parsed.type];
    if (handler) {
      handler(parsed.args);
    } else {
      // Should match UNKNOWN if not found, but just in case
      console.log(`Unknown command: "${parsed.raw}". Type HELP for available commands.`);
    }

  }, [tabs, activeTabId, handleNewTab, handleTabClose, minimizedApps, spawnApp]);

  const handleTabClick = useCallback((tabId: string) => {
    setTabs(prev => prev.map(t => ({ ...t, isActive: t.id === tabId })));
    setActiveTabId(tabId);
  }, []);

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

    // Store data in localStorage with a unique key (avoids URL length limits)
    const popoutKey = `popout-${tab.id}-${Date.now()}`;
    localStorage.setItem(popoutKey, JSON.stringify(tabData));

    // Pass only the key in the URL
    const url = `${window.location.origin}${window.location.pathname}?popout=${popoutKey}`;

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



  const handleLayoutChange = useCallback((layouts: Layout[]) => {
    // Skip layout changes if we're programmatically updating layouts
    if (isLayoutLocked) return;

    setTabs(prev => prev.map(tab => {
      if (tab.id === activeTabId) {
        // Update layouts, preserving minimized state
        const updatedLayouts = layouts.map(layout => {
          const isMinimized = minimizedApps.has(layout.i);
          if (isMinimized && layout.h > 1) {
            // If user tries to resize a minimized app, keep it minimized
            return { ...layout, h: 1 };
          }
          return layout;
        });
        return { ...tab, layouts: updatedLayouts };
      }
      return tab;
    }));
  }, [activeTabId, minimizedApps, isLayoutLocked]);

  const handleMinimize = useCallback((appId: string) => {
    setMinimizedApps(prev => new Set(prev).add(appId));
    // Update layout to minimize height
    setTabs(prev => prev.map(tab => {
      if (tab.id === activeTabId) {
        const updatedLayouts = tab.layouts.map(layout => {
          if (layout.i === appId) {
            return { ...layout, h: 1 }; // 1 row = 30px
          }
          return layout;
        });
        return { ...tab, layouts: updatedLayouts };
      }
      return tab;
    }));
  }, [activeTabId]);

  const handleMaximize = useCallback((appId: string) => {
    setMinimizedApps(prev => {
      const newSet = new Set(prev);
      newSet.delete(appId);
      return newSet;
    });
    // Restore layout using smart layout calculation
    setIsLayoutLocked(true);
    setTabs(prev => prev.map(tab => {
      if (tab.id === activeTabId) {
        // Recalculate all layouts to get proper heights for all apps
        const newLayouts = calculateSmartLayouts(tab.appInstances, tab.layouts);
        return { ...tab, layouts: newLayouts };
      }
      return tab;
    }));
    setTimeout(() => setIsLayoutLocked(false), 100);
  }, [activeTabId, calculateSmartLayouts]);

  const handleCloseApp = useCallback((appId: string) => {
    // Remove minimized state if it was minimized
    setMinimizedApps(prev => {
      const newSet = new Set(prev);
      newSet.delete(appId);
      return newSet;
    });
    // Remove app from tab and recalculate layouts
    setIsLayoutLocked(true);
    setTabs(prev => prev.map(tab => {
      if (tab.id === activeTabId) {
        const updatedAppInstances = tab.appInstances.filter(inst => inst.id !== appId);
        const newLayouts = calculateSmartLayouts(updatedAppInstances, tab.layouts);
        return {
          ...tab,
          appInstances: updatedAppInstances,
          layouts: newLayouts,
        };
      }
      return tab;
    }));
    setTimeout(() => setIsLayoutLocked(false), 100);
  }, [activeTabId, calculateSmartLayouts]);

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

      for (const tab of prev) {
        const instance = tab.appInstances.find(inst => inst.id === appId);
        if (instance) {
          sourceTab = tab;
          appInstance = instance;
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

      // Replace app in target tab (only one app per tab)
      return updatedTabs.map(tab => {
        if (tab.id === targetTabId) {
          // Calculate full-screen layout for the moved app
          const availableHeight = Math.floor((window.innerHeight - 72) / 30);
          const fullHeight = Math.max(availableHeight, 20);

          const newLayout: Layout = {
            i: appInstance!.id,
            x: 0,
            y: 0,
            w: 12, // Full width
            h: fullHeight, // Full height
          };

          return {
            ...tab,
            appInstances: [appInstance!], // Replace, don't add
            layouts: [newLayout], // Single layout
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
            const isMinimized = minimizedApps.has(instance.id);
            return (
              <GridItem
                key={instance.id}
                id={instance.id}
                appName={app.name}
                isMinimized={isMinimized}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                onMinimize={handleMinimize}
                onMaximize={handleMaximize}
                onClose={handleCloseApp}
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

