import { useMemo } from 'react';
import Plot from 'react-plotly.js';

// Mock Iris Data
const generateIrisData = () => {
    const n = 50; // points per species

    // Helper to generate random numbers around a mean
    const rand = (mean: number, variance: number) =>
        Array.from({ length: n }, () => mean + (Math.random() - 0.5) * variance);

    return [
        {
            species: 'Setosa',
            sepalLength: rand(5.0, 0.6),
            sepalWidth: rand(3.4, 0.8),
            petalLength: rand(1.5, 0.4),
            petalWidth: rand(0.2, 0.2),
            color: '#FF9F0A'
        },
        {
            species: 'Versicolor',
            sepalLength: rand(5.9, 1.0),
            sepalWidth: rand(2.7, 0.6),
            petalLength: rand(4.2, 0.8),
            petalWidth: rand(1.3, 0.4),
            color: '#00A8E8' // contrasting blue, still vibrant
        },
        {
            species: 'Virginica',
            sepalLength: rand(6.5, 1.2),
            sepalWidth: rand(2.9, 0.6),
            petalLength: rand(5.5, 1.0),
            petalWidth: rand(2.0, 0.5),
            color: '#FF3B30' // red for contrast
        }
    ];
};

export const IrisAnalysisApp = () => {
    const data = useMemo(() => generateIrisData(), []);

    // Bloomberg Theme Defaults
    const layoutDefaults = {
        paper_bgcolor: 'rgba(0,0,0,0)',
        plot_bgcolor: 'rgba(0,0,0,0)',
        font: {
            family: 'Roboto, sans-serif',
            color: '#FF9F0A' // bloomberg-amber
        },
        xaxis: {
            gridcolor: '#333333',
            zerolinecolor: '#333333',
            tickfont: { color: '#FF9F0A' },
            titlefont: { color: '#FF9F0A' }
        },
        yaxis: {
            gridcolor: '#333333',
            zerolinecolor: '#333333',
            tickfont: { color: '#FF9F0A' },
            titlefont: { color: '#FF9F0A' }
        },
        legend: {
            font: { color: '#FF9F0A' },
            bgcolor: 'rgba(0,0,0,0.5)'
        },
        margin: { t: 40, r: 20, b: 40, l: 60 }
    };

    const scatter3DData = data.map(d => ({
        x: d.sepalLength,
        y: d.sepalWidth,
        z: d.petalLength,
        mode: 'markers' as const,
        type: 'scatter3d' as const,
        name: d.species,
        marker: {
            size: 4,
            color: d.color,
            opacity: 0.8
        }
    }));

    const scatterMatrixData = data.map(d => ({
        x: d.sepalLength,
        y: d.petalWidth,
        mode: 'markers' as const,
        type: 'scatter' as const,
        name: d.species,
        marker: { color: d.color }
    }));

    return (
        <div className="p-4 h-full w-full overflow-y-auto bg-black text-bloomberg-amber scrollbar-thin scrollbar-thumb-bloomberg-amber scrollbar-track-zinc-900">
            <h2 className="text-xl font-bold mb-6 border-b border-bloomberg-amber/30 pb-2 uppercase tracking-wider">
                Iris Dataset Analysis
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* 3D Scatter Plot */}
                <div className="border border-bloomberg-amber/30 p-2 rounded bg-zinc-900/30">
                    <h3 className="text-sm uppercase mb-2 pl-2 border-l-2 border-bloomberg-amber">3D Cluster Analysis</h3>
                    <div className="h-[400px] w-full">
                        <Plot
                            className="w-full h-full"
                            data={scatter3DData}
                            layout={{
                                ...layoutDefaults,
                                title: { text: 'Sepal Dim vs Petal Length' },
                                scene: {
                                    xaxis: { title: { text: 'Sepal L' }, backgroundcolor: 'rgba(0,0,0,0)', gridcolor: '#444', showbackground: false },
                                    yaxis: { title: { text: 'Sepal W' }, backgroundcolor: 'rgba(0,0,0,0)', gridcolor: '#444', showbackground: false },
                                    zaxis: { title: { text: 'Petal L' }, backgroundcolor: 'rgba(0,0,0,0)', gridcolor: '#444', showbackground: false },
                                },
                                margin: { t: 30, l: 0, r: 0, b: 0 },
                                autosize: true
                            }}
                            useResizeHandler={true}
                            config={{ displayModeBar: false }}
                        />
                    </div>
                </div>

                {/* 2D Scatter Plot */}
                <div className="border border-bloomberg-amber/30 p-2 rounded bg-zinc-900/30">
                    <h3 className="text-sm uppercase mb-2 pl-2 border-l-2 border-bloomberg-amber">Sepal Length vs Petal Width</h3>
                    <div className="h-[400px] w-full">
                        <Plot
                            className="w-full h-full"
                            data={scatterMatrixData}
                            layout={{
                                ...layoutDefaults,
                                title: { text: 'Correlation View' },
                                xaxis: { ...layoutDefaults.xaxis, title: { text: 'Sepal Length' } },
                                yaxis: { ...layoutDefaults.yaxis, title: { text: 'Petal Width' } },
                                autosize: true
                            }}
                            useResizeHandler={true}
                            config={{ displayModeBar: false }}
                        />
                    </div>
                </div>

            </div>
        </div>
    );
};
