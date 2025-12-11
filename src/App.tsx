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
  
  // Clean up localStorage and URL after component mounts (only once)
  useEffect(() => {
    if (initialData.popoutKey) {
      localStorage.removeItem(initialData.popoutKey);
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);
  const [draggingAppId, setDraggingAppId] = useState<string | null>(null);

  const activeTab = useMemo(() => {
    return tabs.find(t => t.id === activeTabId) || tabs[0];
  }, [tabs, activeTabId]);

  // Calculate full-screen layout for a single app
  // Each tab can only have one app, which takes the full screen
  const calculateFullScreenLayout = useCallback((appInstance: AppInstance): Layout => {
    const availableHeight = Math.floor((window.innerHeight - 72) / 30);
    const fullHeight = Math.max(availableHeight, 20);
    
    return {
      i: appInstance.id,
      x: 0,
      y: 0,
      w: 12, // Full width (all 12 columns)
      h: fullHeight, // Full height
    };
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
            // Replace existing app with new one (only one app per tab)
            const newLayout = calculateFullScreenLayout(newInstance);
            
            return {
              ...tab,
              appInstances: [newInstance], // Replace, don't add
              layouts: [newLayout], // Single layout for single app
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
              // Replace existing app with new one (only one app per tab)
              const newLayout = calculateFullScreenLayout(newInstance);
              
              return {
                ...tab,
                appInstances: [newInstance], // Replace, don't add
                layouts: [newLayout], // Single layout for single app
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
              // Replace existing app with new one (only one app per tab)
              const newLayout = calculateFullScreenLayout(newInstance);
              
              return {
                ...tab,
                appInstances: [newInstance], // Replace, don't add
                layouts: [newLayout], // Single layout for single app
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
              // Replace existing app with new one (only one app per tab)
              const newLayout = calculateFullScreenLayout(newInstance);
              
              return {
                ...tab,
                appInstances: [newInstance], // Replace, don't add
                layouts: [newLayout], // Single layout for single app
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

