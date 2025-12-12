import { useState, useMemo } from 'react';
import { AgGridReact } from '@ag-grid-community/react';
import { RowClickedEvent, ValueFormatterParams } from '@ag-grid-community/core';
import '@ag-grid-community/styles/ag-grid.css';
import '@ag-grid-community/styles/ag-theme-alpine.css';

// Mock economic data for countries
const generateWorldData = () => {
    const baseData = [
        { country: 'United States', gdp: 25462.7, gdpPerCapita: 76535, population: 332.9, growthRate: 2.1 },
        { country: 'China', gdp: 17963.2, gdpPerCapita: 12720, population: 1412.3, growthRate: 5.2 },
        { country: 'Japan', gdp: 4231.1, gdpPerCapita: 33950, population: 124.6, growthRate: 1.6 },
        { country: 'Germany', gdp: 4072.2, gdpPerCapita: 48598, population: 83.8, growthRate: 0.1 },
        { country: 'United Kingdom', gdp: 3088.9, gdpPerCapita: 45954, population: 67.2, growthRate: 0.5 },
        { country: 'France', gdp: 2782.9, gdpPerCapita: 42560, population: 65.4, growthRate: 0.7 },
        { country: 'India', gdp: 3386.4, gdpPerCapita: 2389, population: 1417.2, growthRate: 6.1 },
        { country: 'Brazil', gdp: 1929.5, gdpPerCapita: 9041, population: 213.4, growthRate: 2.9 },
        { country: 'Canada', gdp: 2139.8, gdpPerCapita: 56308, population: 38.0, growthRate: 1.1 },
        { country: 'South Korea', gdp: 1810.9, gdpPerCapita: 34897, population: 51.9, growthRate: 1.4 },
        { country: 'Australia', gdp: 1542.7, gdpPerCapita: 59934, population: 25.7, growthRate: 1.8 },
        { country: 'Mexico', gdp: 1289.2, gdpPerCapita: 10040, population: 128.3, growthRate: 3.2 },
    ];

    // Add slight randomization for variety
    return baseData.map(item => ({
        ...item,
        gdp: item.gdp * (0.95 + Math.random() * 0.1),
        gdpPerCapita: item.gdpPerCapita * (0.95 + Math.random() * 0.1),
        growthRate: item.growthRate + (Math.random() - 0.5) * 0.5,
    }));
};

export const WorldDataApp = () => {
    const [worldData] = useState(generateWorldData());
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
    const [hoveredCountry, setHoveredCountry] = useState<string | null>(null);
    const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

    const filteredData = useMemo(() => {
        if (!searchTerm) return worldData;
        return worldData.filter(item =>
            item.country.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [worldData, searchTerm]);

    // Calculate bubble chart dimensions
    const maxGdpPerCapita = Math.max(...worldData.map(d => d.gdpPerCapita));
    const maxGrowthRate = Math.max(...worldData.map(d => d.growthRate));
    const minGrowthRate = Math.min(...worldData.map(d => d.growthRate));
    const maxPopulation = Math.max(...worldData.map(d => d.population));

    const chartWidth = 600;
    const chartHeight = 400;
    const padding = 60;

    const getBubbleSize = (population: number) => {
        const minSize = 10;
        const maxSize = 50;
        return minSize + (population / maxPopulation) * (maxSize - minSize);
    };

    const getBubbleX = (gdpPerCapita: number) => {
        return padding + (gdpPerCapita / maxGdpPerCapita) * (chartWidth - padding * 2);
    };

    const getBubbleY = (growthRate: number) => {
        const range = maxGrowthRate - minGrowthRate;
        return chartHeight - padding - ((growthRate - minGrowthRate) / range) * (chartHeight - padding * 2);
    };

    return (
        <div className="p-4 h-full w-full overflow-auto bloomberg-bg-black">
            <h2 className="text-bloomberg-amber text-lg mb-4 font-mono">WORLD DATA</h2>

            {/* Search */}
            <div className="mb-4">
                <input
                    type="text"
                    placeholder="Search countries..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="bg-black text-white font-mono text-xs px-3 py-2 bloomberg-border bloomberg-border-amber outline-none w-full max-w-md"
                />
            </div>

            {/* Bubble Chart */}
            <div
                className="bloomberg-border bloomberg-border-amber p-4 mb-6 relative"
                onMouseMove={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    setTooltipPosition({
                        x: e.clientX - rect.left,
                        y: e.clientY - rect.top,
                    });
                }}
                onMouseLeave={() => setHoveredCountry(null)}
            >
                <h3 className="text-bloomberg-amber text-sm font-mono mb-3">Economic Overview</h3>
                <div className="flex items-center justify-center">
                    <svg
                        width={chartWidth}
                        height={chartHeight}
                        className="bloomberg-bg-black"
                    >
                        {/* Axes */}
                        <line
                            x1={padding}
                            y1={chartHeight - padding}
                            x2={chartWidth - padding}
                            y2={chartHeight - padding}
                            stroke="#FF9800"
                            strokeWidth="2"
                        />
                        <line
                            x1={padding}
                            y1={padding}
                            x2={padding}
                            y2={chartHeight - padding}
                            stroke="#FF9800"
                            strokeWidth="2"
                        />

                        {/* Axis Labels */}
                        <text
                            x={chartWidth / 2}
                            y={chartHeight - 10}
                            fill="#FF9800"
                            fontSize="12"
                            fontFamily="monospace"
                            textAnchor="middle"
                        >
                            GDP per Capita ($)
                        </text>
                        <text
                            x={15}
                            y={chartHeight / 2}
                            fill="#FF9800"
                            fontSize="12"
                            fontFamily="monospace"
                            textAnchor="middle"
                            transform={`rotate(-90, 15, ${chartHeight / 2})`}
                        >
                            GDP Growth Rate (%)
                        </text>

                        {/* Bubbles */}
                        {worldData.map((item, i) => {
                            const x = getBubbleX(item.gdpPerCapita);
                            const y = getBubbleY(item.growthRate);
                            const size = getBubbleSize(item.population);
                            const isSelected = selectedCountry === item.country;
                            const isHovered = hoveredCountry === item.country;
                            const isFiltered = filteredData.includes(item);

                            if (!isFiltered) return null;

                            return (
                                <g key={i}>
                                    <circle
                                        cx={x}
                                        cy={y}
                                        r={size}
                                        fill={isSelected ? '#FF9800' : isHovered ? 'rgba(255, 152, 0, 0.7)' : 'rgba(255, 152, 0, 0.5)'}
                                        stroke="#FF9800"
                                        strokeWidth={isSelected || isHovered ? '2' : '1'}
                                        onClick={() => setSelectedCountry(item.country)}
                                        onMouseEnter={() => setHoveredCountry(item.country)}
                                        onMouseLeave={() => setHoveredCountry(null)}
                                        style={{ cursor: 'pointer' }}
                                    />
                                    {isSelected && (
                                        <text
                                            x={x}
                                            y={y - size - 5}
                                            fill="#FF9800"
                                            fontSize="10"
                                            fontFamily="monospace"
                                            textAnchor="middle"
                                        >
                                            {item.country}
                                        </text>
                                    )}
                                </g>
                            );
                        })}
                    </svg>
                </div>

                {/* Tooltip */}
                {hoveredCountry && (() => {
                    const countryData = worldData.find(d => d.country === hoveredCountry);
                    if (!countryData) return null;

                    // Calculate tooltip position with bounds checking
                    const tooltipWidth = 220;
                    const tooltipHeight = 120;
                    const offset = 15;

                    let left = tooltipPosition.x + offset;
                    let top = tooltipPosition.y - offset;

                    // Adjust if tooltip would overflow right edge
                    if (left + tooltipWidth > chartWidth + 32) { // 32px for padding
                        left = tooltipPosition.x - tooltipWidth - offset;
                    }

                    // Adjust if tooltip would overflow bottom edge
                    if (top + tooltipHeight > chartHeight + 60) { // 60px for header + padding
                        top = tooltipPosition.y - tooltipHeight - offset;
                    }

                    // Ensure tooltip doesn't go above container
                    if (top < 40) {
                        top = tooltipPosition.y + offset;
                    }

                    return (
                        <div
                            className="absolute z-10 bloomberg-border bloomberg-border-amber bloomberg-bg-black p-3 pointer-events-none shadow-lg"
                            style={{
                                left: `${left}px`,
                                top: `${top}px`,
                                minWidth: `${tooltipWidth}px`,
                            }}
                        >
                            <div className="text-bloomberg-amber font-mono text-sm font-bold mb-2 border-b bloomberg-border-amber pb-1">
                                {countryData.country}
                            </div>
                            <div className="space-y-1 text-white text-xs font-mono">
                                <div className="flex justify-between">
                                    <span className="text-bloomberg-amber">GDP:</span>
                                    <span>${countryData.gdp.toFixed(1)}B</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-bloomberg-amber">GDP/Capita:</span>
                                    <span>${countryData.gdpPerCapita.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-bloomberg-amber">Population:</span>
                                    <span>{countryData.population.toFixed(1)}M</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-bloomberg-amber">Growth Rate:</span>
                                    <span className={countryData.growthRate >= 0 ? 'text-green-500' : 'text-red-500'}>
                                        {countryData.growthRate >= 0 ? '+' : ''}{countryData.growthRate.toFixed(1)}%
                                    </span>
                                </div>
                            </div>
                        </div>
                    );
                })()}
                <div className="mt-4 text-white text-xs font-mono">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-bloomberg-amber opacity-50"></div>
                            <span>Bubble size = Population</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Data Table - AG Grid */}
            <div className="bloomberg-border bloomberg-border-amber p-4">
                <h3 className="text-bloomberg-amber text-sm font-mono mb-3">Economic Statistics</h3>
                <div
                    className="ag-theme-alpine"
                    style={{
                        height: '400px',
                        width: '100%',
                        '--ag-background-color': '#000000',
                        '--ag-header-background-color': '#000000',
                        '--ag-header-foreground-color': '#FF9800',
                        '--ag-odd-row-background-color': '#000000',
                        '--ag-row-hover-color': 'rgba(255, 152, 0, 0.1)',
                        '--ag-selected-row-background-color': 'rgba(255, 152, 0, 0.2)',
                        '--ag-border-color': '#333333',
                        '--ag-header-cell-hover-background-color': '#000000',
                        '--ag-font-family': 'monospace',
                        '--ag-font-size': '12px',
                        '--ag-border-width': '1px',
                    } as React.CSSProperties}
                >
                    <AgGridReact
                        rowData={filteredData}
                        columnDefs={[
                            {
                                field: 'country',
                                headerName: 'Country',
                                sortable: true,
                                filter: true,
                                flex: 1,
                                cellStyle: { color: '#FFFFFF', fontFamily: 'monospace' },
                                headerClass: 'bloomberg-header',
                            },
                            {
                                field: 'gdp',
                                headerName: 'GDP ($B)',
                                sortable: true,
                                filter: 'agNumberColumnFilter',
                                flex: 1,
                                valueFormatter: (params: ValueFormatterParams) => {
                                    if (params.value == null) return '';
                                    return params.value.toFixed(1);
                                },
                                cellStyle: { color: '#FFFFFF', fontFamily: 'monospace', textAlign: 'right' },
                                headerClass: 'bloomberg-header',
                            },
                            {
                                field: 'gdpPerCapita',
                                headerName: 'GDP/Capita ($)',
                                sortable: true,
                                filter: 'agNumberColumnFilter',
                                flex: 1,
                                valueFormatter: (params: ValueFormatterParams) => {
                                    if (params.value == null) return '';
                                    return params.value.toLocaleString();
                                },
                                cellStyle: { color: '#FFFFFF', fontFamily: 'monospace', textAlign: 'right' },
                                headerClass: 'bloomberg-header',
                            },
                            {
                                field: 'population',
                                headerName: 'Population (M)',
                                sortable: true,
                                filter: 'agNumberColumnFilter',
                                flex: 1,
                                valueFormatter: (params: ValueFormatterParams) => {
                                    if (params.value == null) return '';
                                    return params.value.toFixed(1);
                                },
                                cellStyle: { color: '#FFFFFF', fontFamily: 'monospace', textAlign: 'right' },
                                headerClass: 'bloomberg-header',
                            },
                            {
                                field: 'growthRate',
                                headerName: 'Growth Rate (%)',
                                sortable: true,
                                filter: 'agNumberColumnFilter',
                                flex: 1,
                                valueFormatter: (params: ValueFormatterParams) => {
                                    if (params.value == null) return '';
                                    const value = params.value as number;
                                    return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
                                },
                                cellStyle: (params: any) => {
                                    const value = params.value as number;
                                    return {
                                        color: value >= 0 ? '#10B981' : '#EF4444',
                                        fontFamily: 'monospace',
                                        textAlign: 'right',
                                    };
                                },
                                headerClass: 'bloomberg-header',
                            },
                        ]}
                        defaultColDef={{
                            resizable: true,
                        }}
                        rowSelection="single"
                        onRowClicked={(event: RowClickedEvent) => {
                            setSelectedCountry(event.data.country);
                        }}
                        getRowStyle={(params: any) => {
                            if (params.data && selectedCountry === (params.data as typeof filteredData[0]).country) {
                                return { backgroundColor: 'rgba(255, 152, 0, 0.2)' };
                            }
                            return { backgroundColor: '#000000' };
                        }}
                        suppressCellFocus={true}
                        animateRows={false}
                    />
                </div>
            </div>
        </div>
    );
};
