import { useState, useEffect } from 'react';

export const NewsApp = () => {
    const [articles, setArticles] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Fetch BBC News RSS feed (using a CORS proxy or direct RSS parsing)
        const fetchNews = async () => {
            try {
                setLoading(true);
                // Using RSS2JSON or similar service, or we can parse RSS directly
                // For now, let's use a CORS proxy to fetch BBC RSS
                const rssUrl = 'https://feeds.bbci.co.uk/news/rss.xml';
                const proxyUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}`;

                const response = await fetch(proxyUrl);
                if (!response.ok) {
                    throw new Error('Failed to fetch news');
                }

                const data = await response.json();
                if (data.status === 'ok' && data.items) {
                    setArticles(data.items.slice(0, 20)); // Get top 20 articles
                } else {
                    throw new Error('Invalid response format');
                }
            } catch (err) {
                console.error('Error fetching news:', err);
                setError('Failed to load news. Please try again later.');
                // Fallback: create some mock articles with links to BBC
                setArticles([
                    {
                        title: 'BBC News - Home',
                        link: 'https://www.bbc.com/news',
                        pubDate: new Date().toISOString(),
                        description: 'Visit BBC News for the latest headlines',
                    },
                ]);
            } finally {
                setLoading(false);
            }
        };

        fetchNews();
    }, []);

    return (
        <div className="h-full w-full bloomberg-bg-black overflow-auto flex flex-col">
            <div className="bloomberg-border-b bloomberg-border-amber p-3 flex items-center justify-between sticky top-0 bg-black z-10">
                <h2 className="text-bloomberg-amber text-lg font-mono">BBC NEWS</h2>
                <a
                    href="https://www.bbc.com/news"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-bloomberg-amber text-xs font-mono hover:underline"
                >
                    Open BBC News ↗
                </a>
            </div>

            <div className="p-4">
                {loading && (
                    <div className="text-bloomberg-amber text-sm font-mono text-center py-8">
                        Loading news...
                    </div>
                )}

                {error && (
                    <div className="text-red-500 text-sm font-mono mb-4 p-3 bloomberg-border bloomberg-border-amber">
                        {error}
                    </div>
                )}

                {!loading && articles.length > 0 && (
                    <div className="space-y-3">
                        {articles.map((article, index) => (
                            <div
                                key={index}
                                className="bloomberg-border bloomberg-border-amber p-3 hover:bg-opacity-10 hover:bg-bloomberg-amber transition-colors"
                            >
                                <a
                                    href={article.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block"
                                >
                                    <h3 className="text-bloomberg-amber text-sm font-mono font-bold mb-2 hover:underline">
                                        {article.title}
                                    </h3>
                                    {article.description && (
                                        <p className="text-white text-xs font-mono mb-2 line-clamp-2">
                                            {article.description.replace(/<[^>]*>/g, '').substring(0, 200)}...
                                        </p>
                                    )}
                                    {article.pubDate && (
                                        <p className="text-white text-xs font-mono opacity-70">
                                            {new Date(article.pubDate).toLocaleDateString('en-US', {
                                                month: 'short',
                                                day: 'numeric',
                                                year: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit',
                                            })}
                                        </p>
                                    )}
                                </a>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
