import { useState, useEffect, useMemo } from 'react';
import { Line, Bar } from 'react-chartjs-2';

// Generate mock stock price data (30 days)
const generateStockData = () => {
    const days = 30;
    const data = [];
    let price = 150 + Math.random() * 50; // Start between 150-200

    for (let i = 0; i < days; i++) {
        // Random walk with slight upward trend
        const change = (Math.random() - 0.45) * 3; // Slight upward bias
        price = Math.max(100, price + change);
        data.push(Number(price.toFixed(2)));
    }

    return data;
};

// Generate mock market indices data
const generateIndicesData = () => {
    return [
        { name: 'S&P 500', value: 4523.45, change: 1.23, changePercent: 0.027 },
        { name: 'NASDAQ', value: 14123.67, change: -45.32, changePercent: -0.32 },
        { name: 'Dow Jones', value: 34567.89, change: 234.56, changePercent: 0.68 },
    ];
};

export const MarketViewApp = () => {
    const [stockData, setStockData] = useState<number[]>([]);
    const [indicesData] = useState(generateIndicesData());

    useEffect(() => {
        setStockData(generateStockData());
    }, []);

    const labels = useMemo(() => {
        const days = [];
        const today = new Date();
        for (let i = 29; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            days.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
        }
        return days;
    }, []);

    const lineChartData = {
        labels,
        datasets: [
            {
                label: 'Stock Price',
                data: stockData,
                borderColor: '#FF9800',
                backgroundColor: 'rgba(255, 152, 0, 0.1)',
                fill: true,
                tension: 0.4,
                pointRadius: 2,
                pointHoverRadius: 4,
            },
        ],
    };

    const barChartData = {
        labels: indicesData.map(idx => idx.name),
        datasets: [
            {
                label: 'Index Value',
                data: indicesData.map(idx => idx.value),
                backgroundColor: '#FF9800',
                borderColor: '#FF9800',
                borderWidth: 1,
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: true,
                labels: {
                    color: '#FF9800',
                    font: {
                        family: 'monospace',
                        size: 12,
                    },
                },
            },
            tooltip: {
                backgroundColor: '#000000',
                borderColor: '#FF9800',
                borderWidth: 1,
                titleColor: '#FF9800',
                bodyColor: '#FFFFFF',
                font: {
                    family: 'monospace',
                },
            },
        },
        scales: {
            x: {
                ticks: {
                    color: '#FFFFFF',
                    font: {
                        family: 'monospace',
                        size: 10,
                    },
                },
                grid: {
                    color: '#333333',
                },
            },
            y: {
                ticks: {
                    color: '#FFFFFF',
                    font: {
                        family: 'monospace',
                        size: 10,
                    },
                },
                grid: {
                    color: '#333333',
                },
            },
        },
    };

    const currentPrice = stockData[stockData.length - 1] || 0;
    const previousPrice = stockData[stockData.length - 2] || currentPrice;
    const priceChange = currentPrice - previousPrice;
    const priceChangePercent = previousPrice ? ((priceChange / previousPrice) * 100) : 0;
    const volume = Math.floor(Math.random() * 50000000) + 10000000;

    return (
        <div className="p-4 h-full w-full overflow-auto bloomberg-bg-black">
            <h2 className="text-bloomberg-amber text-lg mb-4 font-mono">MARKET VIEW</h2>

            {/* Stats Cards */}
            <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bloomberg-border bloomberg-border-amber p-3">
                    <div className="text-white text-xs font-mono mb-1">Current Price</div>
                    <div className="text-bloomberg-amber text-xl font-mono">${currentPrice.toFixed(2)}</div>
                    <div className={`text-xs font-mono mt-1 ${priceChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {priceChange >= 0 ? '+' : ''}{priceChange.toFixed(2)} ({priceChangePercent >= 0 ? '+' : ''}{priceChangePercent.toFixed(2)}%)
                    </div>
                </div>
                <div className="bloomberg-border bloomberg-border-amber p-3">
                    <div className="text-white text-xs font-mono mb-1">Volume</div>
                    <div className="text-bloomberg-amber text-xl font-mono">{(volume / 1000000).toFixed(1)}M</div>
                </div>
                <div className="bloomberg-border bloomberg-border-amber p-3">
                    <div className="text-white text-xs font-mono mb-1">52W High</div>
                    <div className="text-bloomberg-amber text-xl font-mono">${Math.max(...stockData).toFixed(2)}</div>
                </div>
            </div>

            {/* Line Chart - Stock Price Over Time */}
            <div className="bloomberg-border bloomberg-border-amber p-4 mb-6" style={{ height: '300px' }}>
                <h3 className="text-bloomberg-amber text-sm font-mono mb-2">Stock Price (30 Days)</h3>
                <Line data={lineChartData} options={chartOptions} />
            </div>

            {/* Bar Chart - Market Indices */}
            <div className="bloomberg-border bloomberg-border-amber p-4 mb-6" style={{ height: '250px' }}>
                <h3 className="text-bloomberg-amber text-sm font-mono mb-2">Market Indices</h3>
                <Bar data={barChartData} options={chartOptions} />
            </div>

            {/* Indices Table */}
            <div className="bloomberg-border bloomberg-border-amber p-4">
                <h3 className="text-bloomberg-amber text-sm font-mono mb-3">Index Performance</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-xs font-mono">
                        <thead>
                            <tr className="bloomberg-border-b bloomberg-border-amber">
                                <th className="text-left text-bloomberg-amber p-2">Index</th>
                                <th className="text-right text-bloomberg-amber p-2">Value</th>
                                <th className="text-right text-bloomberg-amber p-2">Change</th>
                                <th className="text-right text-bloomberg-amber p-2">% Change</th>
                            </tr>
                        </thead>
                        <tbody>
                            {indicesData.map((idx, i) => (
                                <tr key={i} className="bloomberg-border-b bloomberg-border">
                                    <td className="text-white p-2">{idx.name}</td>
                                    <td className="text-white text-right p-2">{idx.value.toLocaleString()}</td>
                                    <td className={`text-right p-2 ${idx.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                        {idx.change >= 0 ? '+' : ''}{idx.change.toFixed(2)}
                                    </td>
                                    <td className={`text-right p-2 ${idx.changePercent >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                        {idx.changePercent >= 0 ? '+' : ''}{idx.changePercent.toFixed(2)}%
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
