import { useMemo } from 'react';
import { AgGridReact } from '@ag-grid-community/react';
import { ColDef, GridOptions } from '@ag-grid-community/core';
import '@ag-grid-community/styles/ag-grid.css';
import '@ag-grid-community/styles/ag-theme-alpine-dark.css';

interface DataGridProps {
  rowData?: any[];
  columnDefs?: ColDef[];
  gridOptions?: GridOptions;
  height?: string | number;
}

export const DataGrid = ({
  rowData = [],
  columnDefs = [],
  gridOptions = {},
  height = '100%'
}: DataGridProps) => {
  const defaultColDef = useMemo<ColDef>(() => ({
    resizable: true,
    sortable: true,
    filter: true,
  }), []);

  const customGridOptions: GridOptions = useMemo(() => ({
    ...gridOptions,
    defaultColDef,
    rowHeight: 28,
    headerHeight: 32,
    suppressRowHoverHighlight: false,
    rowSelection: 'multiple',
    animateRows: false,
    // Bloomberg Terminal styling
    getRowStyle: (_params) => {
      return {
        backgroundColor: '#000000',
        color: '#FFFFFF',
        fontFamily: "'Roboto Mono', 'Consolas', 'Courier New', monospace",
        fontSize: '12px',
      };
    },
    getHeaderClass: () => {
      return 'bloomberg-grid-header';
    },
  }), [defaultColDef, gridOptions]);

  return (
    <div
      className="ag-theme-alpine-dark bloomberg-bg-black"
      style={{
        height: typeof height === 'number' ? `${height}px` : height,
        width: '100%',
      }}
    >
      <style>{`
        .ag-theme-alpine-dark {
          --ag-background-color: #000000;
          --ag-header-background-color: #1a1a1a;
          --ag-odd-row-background-color: #0a0a0a;
          --ag-row-hover-color: #1a1a1a;
          --ag-selected-row-background-color: #FF9800;
          --ag-border-color: #333333;
          --ag-header-foreground-color: #FF9800;
          --ag-foreground-color: #FFFFFF;
          --ag-font-family: 'Roboto Mono', 'Consolas', 'Courier New', monospace;
          --ag-font-size: 12px;
          --ag-border-radius: 0;
        }
        .bloomberg-grid-header {
          background-color: #1a1a1a !important;
          color: #FF9800 !important;
          font-weight: 500;
          border-bottom: 1px solid #FF9800;
        }
        .ag-header-cell {
          border-right: 1px solid #333333;
        }
        .ag-cell {
          border-right: 1px solid #333333;
          border-bottom: 1px solid #333333;
        }
        .ag-row-selected {
          background-color: rgba(255, 152, 0, 0.2) !important;
        }
        .ag-row:hover {
          background-color: #1a1a1a !important;
        }
      `}</style>
      <AgGridReact
        rowData={rowData}
        columnDefs={columnDefs}
        gridOptions={customGridOptions}
      />
    </div>
  );
};

