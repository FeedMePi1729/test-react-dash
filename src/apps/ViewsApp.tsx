import { useState, useEffect } from 'react';

export const ViewsApp = () => {
    const [views, setViews] = useState<string[]>([]);

    useEffect(() => {
        // List all saved views from localStorage
        const loadViews = () => {
            const savedViews: string[] = [];
            try {
                for (let i = 0; i < localStorage.length; i++) {
                    const key = localStorage.key(i);
                    if (key && key.startsWith('dashboard-view-')) {
                        const viewName = key.replace('dashboard-view-', '');
                        savedViews.push(viewName);
                    }
                }
            } catch (e) {
                console.error('Failed to list views:', e);
            }
            setViews(savedViews.sort());
        };

        loadViews();
        // Refresh list when storage changes (in case user saves/loads from another tab)
        const handleStorageChange = () => loadViews();
        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    return (
        <div className="p-4 h-full w-full overflow-auto bloomberg-bg-black">
            <h2 className="text-bloomberg-amber text-lg mb-4 font-mono">SAVED VIEWS</h2>

            {views.length === 0 ? (
                <div className="bloomberg-border bloomberg-border-amber p-4">
                    <p className="text-white text-sm font-mono">No saved views</p>
                    <p className="text-bloomberg-amber text-xs font-mono mt-2">
                        Use "SAVE [view_name]" to save the current tab as a view
                    </p>
                </div>
            ) : (
                <div className="bloomberg-border bloomberg-border-amber p-4">
                    <p className="text-bloomberg-amber text-sm font-mono mb-3">
                        Saved views ({views.length}):
                    </p>
                    <div className="space-y-1">
                        {views.map((view, index) => (
                            <div
                                key={view}
                                className="text-white text-xs font-mono py-1 px-2 hover:bg-bloomberg-amber hover:text-black transition-colors"
                            >
                                <span className="text-bloomberg-amber mr-2">{index + 1}.</span>
                                {view}
                            </div>
                        ))}
                    </div>
                    <p className="text-bloomberg-amber text-xs font-mono mt-4">
                        Use "LOAD VIEW [view_name]" to load a saved view
                    </p>
                </div>
            )}
        </div>
    );
};
