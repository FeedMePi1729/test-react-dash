import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { ModuleRegistry } from '@ag-grid-community/core';
import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import '@ag-grid-community/styles/ag-grid.css';
import '@ag-grid-community/styles/ag-theme-alpine.css';
import { AppModule } from './types';

import { WorldDataApp } from './WorldDataApp';
import { IrisAnalysisApp } from './IrisAnalysisApp';
import { MontrealElectionsApp } from './MontrealElectionsApp';
import { MarketViewApp } from './MarketViewApp';
import { SettingsApp } from './SettingsApp';
import { HelpApp } from './HelpApp';
import { NewsApp } from './NewsApp';
import { ViewsApp } from './ViewsApp';

// Register AG Grid modules
ModuleRegistry.registerModules([ClientSideRowModelModule]);

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// Configure Chart.js defaults for Bloomberg theme
ChartJS.defaults.color = '#FF9800';
ChartJS.defaults.borderColor = '#333333';
ChartJS.defaults.backgroundColor = '#000000';

class AppRegistry {
  private apps: Map<string, AppModule> = new Map();

  constructor() {
    this.register({
      id: 'world-data',
      name: 'World Data',
      component: WorldDataApp,
      description: 'Economic statistics and bubble chart visualization',
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
      description: 'Financial charts, market indices, and stock analytics',
    });

    this.register({
      id: 'settings',
      name: 'Settings',
      component: SettingsApp,
      description: 'Configure username, timezone, font size, and preferences',
    });

    this.register({
      id: 'help',
      name: 'Help',
      component: HelpApp,
      description: 'Command reference and keyboard shortcuts',
    });

    this.register({
      id: 'news',
      name: 'News',
      component: NewsApp,
      description: 'BBC News front page',
    });

    this.register({
      id: 'views',
      name: 'Views',
      component: ViewsApp,
      description: 'List and manage saved views',
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
