export interface AppModule {
  id: string;
  name: string;
  component: React.ComponentType<any>;
  description?: string;
}

export interface AppInstance {
  id: string;
  appId: string;
  name: string;
  data?: any;
}

