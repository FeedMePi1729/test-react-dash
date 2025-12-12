import { appRegistry } from './AppRegistry';

export const HelpApp = () => {
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
                        <div className="flex">
                            <span className="text-bloomberg-amber w-32 flex-shrink-0">SAVE [view_name]</span>
                            <span className="text-white">Save current tab as a view</span>
                        </div>
                        <div className="flex">
                            <span className="text-bloomberg-amber w-32 flex-shrink-0">LOAD VIEW [view_name]</span>
                            <span className="text-white">Load a saved view into current tab</span>
                        </div>
                        <div className="flex">
                            <span className="text-bloomberg-amber w-32 flex-shrink-0">LIST VIEWS</span>
                            <span className="text-white">List all saved views</span>
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
