import { useState, useEffect, useMemo } from 'react';
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
import { Line, Bar } from 'react-chartjs-2';
import { AgGridReact } from '@ag-grid-community/react';
import { RowClickedEvent, ValueFormatterParams, ModuleRegistry } from '@ag-grid-community/core';
import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import '@ag-grid-community/styles/ag-grid.css';
import '@ag-grid-community/styles/ag-theme-alpine.css';
import { AppModule } from './types';

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

const WorldDataApp = () => {
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

const MarketViewApp = () => {
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

interface SettingsData {
  username: string;
  timezone: string;
  fontSize: 'small' | 'medium' | 'large';
}

const SettingsApp = () => {
  const [settings, setSettings] = useState<SettingsData>(() => {
    // Load from localStorage or use defaults
    const saved = localStorage.getItem('dashboard-settings');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse settings:', e);
      }
    }
    return {
      username: '',
      timezone: 'UTC',
      fontSize: 'medium',
    };
  });

  useEffect(() => {
    // Save to localStorage whenever settings change
    localStorage.setItem('dashboard-settings', JSON.stringify(settings));
    
    // Apply font size globally
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
  }, [settings]);

  const timezones = [
    'UTC',
    'America/New_York (EST)',
    'America/Chicago (CST)',
    'America/Denver (MST)',
    'America/Los_Angeles (PST)',
    'Europe/London (GMT)',
    'Europe/Paris (CET)',
    'Asia/Tokyo (JST)',
    'Asia/Shanghai (CST)',
    'Australia/Sydney (AEDT)',
  ];

  const handleChange = (field: keyof SettingsData, value: string) => {
    setSettings(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const fontSizeOptions = [
    { value: 'small', label: 'Small (12px)' },
    { value: 'medium', label: 'Medium (14px)' },
    { value: 'large', label: 'Large (16px)' },
  ];

  return (
    <div className="p-4 h-full w-full overflow-auto bloomberg-bg-black">
      <h2 className="text-bloomberg-amber text-lg mb-6 font-mono">SETTINGS</h2>

      <div className="space-y-6 max-w-2xl">
        {/* Username */}
        <div className="bloomberg-border bloomberg-border-amber p-4">
          <label className="block text-bloomberg-amber text-sm font-mono mb-2">
            Username
          </label>
          <input
            type="text"
            value={settings.username}
            onChange={(e) => handleChange('username', e.target.value)}
            placeholder="Enter your username"
            className="bg-black text-white font-mono text-sm px-3 py-2 bloomberg-border bloomberg-border-amber outline-none w-full"
          />
          {settings.username && (
            <p className="text-white text-xs font-mono mt-2">
              Welcome, <span className="text-bloomberg-amber">{settings.username}</span>
            </p>
          )}
        </div>

        {/* Timezone */}
        <div className="bloomberg-border bloomberg-border-amber p-4">
          <label className="block text-bloomberg-amber text-sm font-mono mb-2">
            Timezone
          </label>
          <select
            value={settings.timezone}
            onChange={(e) => handleChange('timezone', e.target.value)}
            className="bg-black text-white font-mono text-sm px-3 py-2 bloomberg-border bloomberg-border-amber outline-none w-full cursor-pointer"
          >
            {timezones.map(tz => (
              <option key={tz} value={tz} className="bg-black">
                {tz}
              </option>
            ))}
          </select>
          <p className="text-white text-xs font-mono mt-2 opacity-70">
            Current time: {new Date().toLocaleString('en-US', { timeZone: settings.timezone.split(' ')[0] })}
          </p>
        </div>

        {/* Font Size */}
        <div className="bloomberg-border bloomberg-border-amber p-4">
          <label className="block text-bloomberg-amber text-sm font-mono mb-2">
            Font Size
          </label>
          <div className="space-y-3">
            {fontSizeOptions.map(option => (
              <label
                key={option.value}
                className="flex items-center cursor-pointer"
              >
                <input
                  type="radio"
                  name="fontSize"
                  value={option.value}
                  checked={settings.fontSize === option.value}
                  onChange={(e) => handleChange('fontSize', e.target.value as SettingsData['fontSize'])}
                  className="mr-3 accent-bloomberg-amber"
                />
                <span className="text-white font-mono text-sm">{option.label}</span>
              </label>
            ))}
          </div>
          <div className="mt-4 p-3 bloomberg-border bloomberg-border">
            <p className="text-white text-xs font-mono mb-2">Preview:</p>
            <p className="text-white font-mono" style={{ fontSize: settings.fontSize === 'small' ? '12px' : settings.fontSize === 'medium' ? '14px' : '16px' }}>
              The quick brown fox jumps over the lazy dog. 1234567890
            </p>
          </div>
        </div>

        {/* Theme (placeholder for future) */}
        <div className="bloomberg-border bloomberg-border-amber p-4">
          <label className="block text-bloomberg-amber text-sm font-mono mb-2">
            Theme
          </label>
          <div className="flex items-center">
            <span className="text-white font-mono text-sm">Bloomberg Terminal</span>
            <span className="ml-2 text-white text-xs font-mono opacity-50">(Default)</span>
          </div>
        </div>

        {/* Reset Button */}
        <div className="bloomberg-border bloomberg-border-amber p-4">
          <button
            onClick={() => {
              const defaults: SettingsData = {
                username: '',
                timezone: 'UTC',
                fontSize: 'medium',
              };
              setSettings(defaults);
              localStorage.setItem('dashboard-settings', JSON.stringify(defaults));
            }}
            className="bg-black text-bloomberg-amber font-mono text-sm px-4 py-2 bloomberg-border bloomberg-border-amber hover:bg-bloomberg-amber hover:text-black transition-colors cursor-pointer"
          >
            Reset to Defaults
          </button>
        </div>
      </div>
    </div>
  );
};

const NewsApp = () => {
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

const ViewsApp = () => {
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

