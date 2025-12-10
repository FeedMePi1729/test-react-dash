import React from 'react';
import { AppModule } from './types';

// Placeholder app components
const WorldDataApp = () => (
  <div className="p-4 h-full w-full overflow-auto">
    <h2 className="text-bloomberg-amber text-lg mb-4">World Data</h2>
    <p className="text-white text-sm">Bubble chart visualization will be rendered here.</p>
    <div className="mt-4 p-4 bloomberg-border">
      <p className="text-white text-xs">Placeholder for World Data bubble charts</p>
    </div>
  </div>
);

const IrisAnalysisApp = () => (
  <div className="p-4 h-full w-full overflow-auto">
    <h2 className="text-bloomberg-amber text-lg mb-4">Iris Analysis</h2>
    <p className="text-white text-sm">3D scatter plot visualization will be rendered here.</p>
    <div className="mt-4 p-4 bloomberg-border">
      <p className="text-white text-xs">Placeholder for Iris Analysis 3D scatter plots</p>
    </div>
  </div>
);

const MontrealElectionsApp = () => (
  <div className="p-4 h-full w-full overflow-auto">
    <h2 className="text-bloomberg-amber text-lg mb-4">Montreal Elections</h2>
    <p className="text-white text-sm">Ternary plot visualization will be rendered here.</p>
    <div className="mt-4 p-4 bloomberg-border">
      <p className="text-white text-xs">Placeholder for Montreal Elections ternary plots</p>
    </div>
  </div>
);

const MarketViewApp = () => (
  <div className="p-4 h-full w-full overflow-auto">
    <h2 className="text-bloomberg-amber text-lg mb-4">Market View</h2>
    <p className="text-white text-sm">Financial analytics dashboard will be rendered here.</p>
    <div className="mt-4 p-4 bloomberg-border">
      <p className="text-white text-xs">Placeholder for Market View analytics</p>
    </div>
  </div>
);

const SettingsApp = () => (
  <div className="p-4 h-full w-full overflow-auto">
    <h2 className="text-bloomberg-amber text-lg mb-4">Settings</h2>
    <p className="text-white text-sm">Application settings panel.</p>
    <div className="mt-4 p-4 bloomberg-border">
      <p className="text-white text-xs">Settings configuration will be available here</p>
    </div>
  </div>
);

const HelpApp = () => {
  const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
  const cmdKey = isMac ? 'Cmd' : 'Ctrl';

  return (
    <div className="p-4 h-full w-full overflow-auto bloomberg-bg-black">
      <h2 className="text-bloomberg-amber text-lg mb-4 font-mono">HELP</h2>
      
      <div className="space-y-6">
        {/* Commands Section */}
        <div className="bloomberg-border bloomberg-border-amber p-4">
          <h3 className="text-bloomberg-amber text-sm font-mono mb-3">COMMANDS</h3>
          <div className="space-y-2 text-white text-xs font-mono">
            <div className="flex">
              <span className="text-bloomberg-amber w-32 flex-shrink-0">LOAD [app_name]</span>
              <span className="text-white">Load an app in the current tab</span>
            </div>
            <div className="flex">
              <span className="text-bloomberg-amber w-32 flex-shrink-0">NEW TAB</span>
              <span className="text-white">Create a new tab</span>
            </div>
            <div className="flex">
              <span className="text-bloomberg-amber w-32 flex-shrink-0">CLOSE TAB [index]</span>
              <span className="text-white">Close a tab (index optional)</span>
            </div>
            <div className="flex">
              <span className="text-bloomberg-amber w-32 flex-shrink-0">MARKET VIEW</span>
              <span className="text-white">Open market analytics view</span>
            </div>
            <div className="flex">
              <span className="text-bloomberg-amber w-32 flex-shrink-0">SETTINGS</span>
              <span className="text-white">Open settings panel</span>
            </div>
            <div className="flex">
              <span className="text-bloomberg-amber w-32 flex-shrink-0">HELP</span>
              <span className="text-white">Show this help message</span>
            </div>
          </div>
        </div>

        {/* Keyboard Shortcuts Section */}
        <div className="bloomberg-border bloomberg-border-amber p-4">
          <h3 className="text-bloomberg-amber text-sm font-mono mb-3">KEYBOARD SHORTCUTS</h3>
          <div className="space-y-2 text-white text-xs font-mono">
            <div className="flex">
              <span className="text-bloomberg-amber w-40 flex-shrink-0">{cmdKey}+T</span>
              <span className="text-white">Create a new tab</span>
            </div>
            <div className="flex">
              <span className="text-bloomberg-amber w-40 flex-shrink-0">{cmdKey}+W</span>
              <span className="text-white">Close current tab</span>
            </div>
            <div className="flex">
              <span className="text-bloomberg-amber w-40 flex-shrink-0">{cmdKey}+Tab</span>
              <span className="text-white">Switch to next tab</span>
            </div>
            <div className="flex">
              <span className="text-bloomberg-amber w-40 flex-shrink-0">{cmdKey}+Shift+Tab</span>
              <span className="text-white">Switch to previous tab</span>
            </div>
            <div className="flex">
              <span className="text-bloomberg-amber w-40 flex-shrink-0">{cmdKey}+1-9</span>
              <span className="text-white">Switch to tab by number</span>
            </div>
          </div>
        </div>

        {/* Available Apps Section */}
        <div className="bloomberg-border bloomberg-border-amber p-4">
          <h3 className="text-bloomberg-amber text-sm font-mono mb-3">AVAILABLE APPS</h3>
          <div className="space-y-2 text-white text-xs font-mono">
            {appRegistry.getAll().map((app) => (
              <div key={app.id} className="flex">
                <span className="text-bloomberg-amber w-48 flex-shrink-0">{app.name}</span>
                <span className="text-white">{app.description || 'No description'}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Drag & Drop Section */}
        <div className="bloomberg-border bloomberg-border-amber p-4">
          <h3 className="text-bloomberg-amber text-sm font-mono mb-3">DRAG & DROP</h3>
          <div className="space-y-2 text-white text-xs font-mono">
            <div className="flex">
              <span className="text-bloomberg-amber w-40 flex-shrink-0">Drag Handle (≡)</span>
              <span className="text-white">Drag apps to move between tabs</span>
            </div>
            <div className="flex">
              <span className="text-bloomberg-amber w-40 flex-shrink-0">Tab Headers</span>
              <span className="text-white">Drop apps on tab headers to move them</span>
            </div>
            <div className="flex">
              <span className="text-bloomberg-amber w-40 flex-shrink-0">Grid Layout</span>
              <span className="text-white">Drag within a tab to rearrange apps</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

class AppRegistry {
  private apps: Map<string, AppModule> = new Map();

  constructor() {
    this.register({
      id: 'world-data',
      name: 'World Data',
      component: WorldDataApp,
      description: 'Bubble charts for world data visualization',
    });

    this.register({
      id: 'iris-analysis',
      name: 'Iris Analysis',
      component: IrisAnalysisApp,
      description: '3D scatter plots for iris dataset analysis',
    });

    this.register({
      id: 'montreal-elections',
      name: 'Montreal Elections',
      component: MontrealElectionsApp,
      description: 'Ternary plots for Montreal election data',
    });

    this.register({
      id: 'market-view',
      name: 'Market View',
      component: MarketViewApp,
      description: 'Financial analytics and market data',
    });

    this.register({
      id: 'settings',
      name: 'Settings',
      component: SettingsApp,
      description: 'Application settings',
    });

    this.register({
      id: 'help',
      name: 'Help',
      component: HelpApp,
      description: 'Command reference and keyboard shortcuts',
    });
  }

  register(app: AppModule): void {
    this.apps.set(app.id, app);
    // Also register by name for command matching
    this.apps.set(app.name.toLowerCase().replace(/\s+/g, '-'), app);
  }

  get(id: string): AppModule | undefined {
    return this.apps.get(id.toLowerCase().replace(/\s+/g, '-'));
  }

  getAll(): AppModule[] {
    return Array.from(this.apps.values()).filter((app, index, self) =>
      index === self.findIndex(a => a.id === app.id)
    );
  }

  findByName(name: string): AppModule | undefined {
    const normalized = name.toLowerCase().replace(/\s+/g, '-');
    return this.apps.get(normalized);
  }
}

export const appRegistry = new AppRegistry();

