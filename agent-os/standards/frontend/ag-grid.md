# AG Grid Best Practices for FlexPlan

This document outlines best practices for implementing AG Grid within the FlexPlan application, optimized for Claude Skills and the AG Grid MCP Server.

## Table of Contents

1. [Module Registration](#module-registration)
2. [TypeScript Integration](#typescript-integration)
3. [Component Architecture](#component-architecture)
4. [Column Definitions](#column-definitions)
5. [Data Management](#data-management)
6. [Performance Optimization](#performance-optimization)
7. [Styling & Theming](#styling--theming)
8. [Export Functionality](#export-functionality)
9. [Testing Patterns](#testing-patterns)
10. [Common Patterns in FlexPlan](#common-patterns-in-flexplan)

## Module Registration

### Register Modules Once at Application Root

```typescript
import { AllCommunityModule, ModuleRegistry } from 'ag-grid-community';

// Register at the top level, once per application
ModuleRegistry.registerModules([AllCommunityModule]);
```

**Key Points:**
- Register modules before any AG Grid component is rendered
- Use `AllCommunityModule` for community features or register specific modules
- Registration is global and only needs to happen once

## TypeScript Integration

### Strongly Type Grid Components and Data

```typescript
import type {
  GridApi,
  ColDef,
  ColGroupDef,
  GetRowIdParams,
  ValueGetterFunc,
  ValueFormatterFunc,
  CellClassFunc
} from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';

// Define your row data type
interface GridRow {
  id: string;
  cells: Record<string, ReportCell>;
}

// Type the AgGridReact component
<AgGridReact<GridRow>
  ref={gridRef}
  rowData={data}
  columnDefs={columnDefs}
/>
```

**Key Points:**
- Always provide generic type parameter to `AgGridReact<T>`
- Use AG Grid's built-in types for column definitions, APIs, and functions
- Define interfaces for custom data structures (rows, cells, etc.)

## Component Architecture

### Use Refs and State for Grid API Access

```typescript
const gridRef = useRef<AgGridReact>(null);
const [gridApi, setGridApi] = useState<GridApi>();

// Access API via gridRef.current or stored gridApi
const exportToCsv = useCallback(() => {
  gridApi?.exportDataAsCsv({
    fileName: `report-${new Date().toISOString()}.csv`,
  });
}, [gridApi]);
```

**Key Points:**
- Store grid ref using `useRef<AgGridReact>(null)`
- Optionally maintain separate `gridApi` state for easier access
- Use `useCallback` for functions that depend on grid API

### Manage Grid Lifecycle with Effects

```typescript
useEffect(() => {
  const cleanup = effect(() => {
    // React to signal changes
    const staleInfo = reportStore.reportDataStale;
    if (staleInfo) {
      setHasPendingUpdates(true);
    }
  });

  return cleanup;
}, []);
```

**Key Points:**
- Use effects for monitoring external state changes
- Clean up subscriptions properly
- Separate concerns: grid rendering vs data updates

## Column Definitions

### Build Column Definitions Programmatically

```typescript
// Union type for flat columns and column groups
type GridColumn = ColDef | ColGroupDef;

// Create column definitions from data structure
const createColumnsFromTree = (
  rows: ReportElement[],
  columns: ReportDimensionTree[],
  values: ReportElement[],
  categoryLookup: CategoryLookup,
  attributeLookup: AttributeLookup,
): GridColumn[] => {
  const result: GridColumn[] = [];

  // Build row columns
  result.push(...createDefFromRows(rows, categoryLookup, attributeLookup));

  // Build value columns
  result.push(...createDefFromColumnsAndValues(
    columns,
    values,
    categoryLookup,
    attributeLookup
  ));

  return result;
};
```

**Key Points:**
- Use `ColDef | ColGroupDef` union type for flexible column definitions
- Build columns programmatically from data structures
- Support both flat columns and nested column groups
- Separate concerns: row columns, value columns, hierarchical columns

### Use Custom Value Getters and Formatters

```typescript
const valueGetter: ValueGetterFunc<GridRow, any> = (params) => {
  const colId = params.colDef.colId ?? params.column?.getColId();
  if (!colId) return '-';
  const cell = params.data?.cells?.[colId];
  return cell?.value ?? '-';
};

const valueFormatter: ValueFormatterFunc = (params) => {
  return formatAttributeValue(
    category,
    params.value,
    categoryLookup,
    attributeLookup
  );
};
```

**Key Points:**
- `valueGetter`: Extract data from complex data structures
- `valueFormatter`: Format values for display (dates, numbers, currency)
- Always handle null/undefined cases with fallback values
- Keep formatters pure functions

### Apply Dynamic Cell Styling

```typescript
const cellClass: CellClassFunc = (params) => {
  const classes: string[] = [];

  // Alignment based on data type
  switch (category.categoryType) {
    case 'integer':
    case 'float':
    case 'currency':
      classes.push('ag-right-aligned-cell');
      break;
    case 'boolean':
      classes.push('ag-center-aligned-cell');
      break;
    default:
      classes.push('ag-left-aligned-cell');
  }

  // Conditional styling
  if (params.value === null || params.value === undefined) {
    classes.push('no-data');
  }

  return classes.join(' ');
};
```

**Key Points:**
- Use `CellClassFunc` for dynamic CSS classes
- Apply alignment based on data type (numbers right, text left, booleans center)
- Handle null/empty states visually
- Return space-separated class names

### Implement Hierarchical Column Groups

```typescript
const buildColumnGroup = (node: ReportDimensionTree): ColGroupDef => {
  return {
    groupId: node.id,
    headerName: node.category.name,
    children: node.children.length
      ? node.children.map(buildColumnGroup)
      : [createLeafColumn(node)]
  } satisfies ColGroupDef;
};
```

**Key Points:**
- Use `ColGroupDef` for nested column headers
- Provide unique `groupId` for each group
- Recursively build nested structures
- Leaf nodes use `ColDef`, groups use `ColGroupDef`

## Data Management

### Provide Stable Row IDs

```typescript
const getRowId = (params: GetRowIdParams<GridRow>): string => {
  // Use existing ID if available
  if (params.data?.id) return params.data.id;

  // Create deterministic ID as fallback
  const dataStr = JSON.stringify(params.data || {});
  return `row-${dataStr.length}-${hashCode(dataStr)}`;
};

<AgGridReact
  rowData={data}
  getRowId={getRowId}
/>
```

**Key Points:**
- Always provide `getRowId` function for stable row identity
- Use existing IDs from data when available
- Create deterministic fallback IDs (avoid random values)
- Stable IDs prevent unnecessary re-renders

### Handle Loading and Error States

```typescript
// Show loading state
if (gridDataResource?.state === 'pending') {
  return (
    <Stack alignItems="center" justifyContent="center" p={4}>
      <CircularProgress />
    </Stack>
  );
}

// Show error state
if (gridDataResource?.state === 'errored') {
  return (
    <Alert severity="error" sx={{ mt: 2 }}>
      Failed to compute grid data. Please try refreshing.
    </Alert>
  );
}
```

**Key Points:**
- Don't render grid until data is ready
- Provide clear loading indicators
- Display user-friendly error messages
- Consider retry mechanisms

### Use Signal-Based Reactivity (FlexPlan Pattern)

```typescript
// Consume signal resource from store
const gridDataResource = useComputed(() => ({
  state: reportStore.reportGridData.state,
  latest: reportStore.reportGridData.latest,
})).value;

// Fallback to local computation
const localGridData = useReportGrid({
  eventDetails: reportDataResource.latest?.reportDetails || [],
  elementTree: elementTree || null,
  categoryLookup,
  attributeLookup,
});

// Use signal data if available, otherwise fallback
const gridData =
  gridDataResource?.state === 'ready' && gridDataResource.latest
    ? gridDataResource.latest
    : localGridData;
```

**Key Points:**
- Leverage Preact Signals for reactive data updates
- Provide fallback computation paths
- Use `useComputed` from FlexPlan's signal utilities
- Validate signal vs local computation in dev mode

## Performance Optimization

### Set Optimal Default Column Properties

```typescript
const defaultColDef: ColDef = {
  sortable: true,
  resizable: true,
  filter: true,
  minWidth: 100,
};

<AgGridReact
  defaultColDef={defaultColDef}
/>
```

**Key Points:**
- Define `defaultColDef` to avoid repetition
- Enable sortable, resizable, filter by default
- Set sensible `minWidth` to prevent column squashing
- Override in specific column definitions when needed

### Memoize Complex Computations

```typescript
// Use signals for reactive memoization (FlexPlan pattern)
const gridData = useComputed(() =>
  useReportGrid({
    eventDetails: reportStore.reportDetails.value,
    elementTree: reportStore.elementTree.value,
    categoryLookup,
    attributeLookup,
  })
);
```

**Key Points:**
- Use FlexPlan's signal-based `useComputed` for memoization
- Don't use `useMemo` directly (use signal utilities instead)
- Memoize column definitions, formatters, and getters
- Compute data transformations outside render cycle

### Avoid Inline Function Definitions

```typescript
// L Bad: Creates new function every render
<AgGridReact
  valueGetter={(params) => params.data?.cells?.[params.colDef.colId]}
/>

//  Good: Define once, reuse
const valueGetter: ValueGetterFunc<GridRow, any> = (params) => {
  const colId = params.colDef.colId;
  return params.data?.cells?.[colId] ?? '-';
};

<AgGridReact valueGetter={valueGetter} />
```

**Key Points:**
- Define functions outside component or use `useCallback`
- Avoid creating new function instances on every render
- Share value getters, formatters, and class functions across columns
- Use stable references for better performance

## Styling & Theming

### Use AG Grid Themes

```typescript
import 'ag-grid-community/styles/ag-theme-alpine.css';

<div className="ag-theme-alpine" style={{ height: 600 }}>
  <AgGridReact {...props} />
</div>
```

**Key Points:**
- Import theme CSS at component top
- Wrap grid in theme class container (`ag-theme-alpine`, `ag-theme-material`, etc.)
- Set explicit height on container (required for grid rendering)
- Use `ag-theme-alpine` as FlexPlan standard

### Apply Custom Cell Classes

```css
/* In your CSS/SCSS */
.ag-right-aligned-cell {
  text-align: right;
}

.ag-center-aligned-cell {
  text-align: center;
}

.ag-left-aligned-cell {
  text-align: left;
}

.no-data {
  color: #999;
  font-style: italic;
}
```

**Key Points:**
- Use semantic class names
- Leverage AG Grid's built-in classes when possible
- Create custom classes for domain-specific styling
- Apply via `cellClass` function in column definitions

## Export Functionality

### Implement CSV and Excel Export

```typescript
const exportToCsv = useCallback(() => {
  gridApi?.exportDataAsCsv({
    fileName: `report-${new Date().toISOString()}.csv`,
  });
}, [gridApi]);

const exportToExcel = useCallback(() => {
  gridApi?.exportDataAsExcel({
    fileName: `report-${new Date().toISOString()}.xlsx`,
  });
}, [gridApi]);

<Button onClick={exportToCsv} variant="outlined">
  Export CSV
</Button>
<Button onClick={exportToExcel} variant="outlined">
  Export Excel
</Button>
```

**Key Points:**
- Use `gridApi.exportDataAsCsv()` and `gridApi.exportDataAsExcel()`
- Generate timestamped filenames
- Wrap in `useCallback` to prevent recreation
- Check for `gridApi` availability before calling
- Excel export requires AG Grid Enterprise or community plugin

## Testing Patterns

### Unit Test Grid Utilities

```typescript
import { describe, it, expect } from 'vitest';
import { useReportGrid, __testing__ } from './useReportGrid';

describe('useReportGrid', () => {
  it('creates column definitions from tree structure', () => {
    const { createColumnsFromTree } = __testing__;

    const columns = createColumnsFromTree(
      mockRows,
      mockColumns,
      mockValues,
      categoryLookup,
      attributeLookup
    );

    expect(columns).toHaveLength(expectedCount);
    expect(columns[0]).toHaveProperty('colId');
  });
});
```

**Key Points:**
- Export test utilities via `__testing__` namespace
- Test grid utility functions separately from components
- Mock lookup services and data structures
- Verify column structure, count, and properties

### Storybook Tests for Grid Components

```typescript
import { expect } from '@storybook/test';
import { within } from '@storybook/test';

export const Default = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Wait for grid to render
    const grid = await canvas.findByRole('treegrid');
    expect(grid).toBeInTheDocument();

    // Verify column headers
    const headers = canvas.getAllByRole('columnheader');
    expect(headers).toHaveLength(expectedColumnCount);
  },
};
```

**Key Points:**
- Use Storybook's test utilities for component testing
- Query by semantic roles (`treegrid`, `columnheader`, `row`)
- Test grid rendering, not implementation details
- Verify user-visible behavior

## Common Patterns in FlexPlan

### Pattern 1: Dynamic Column Generation from Report Structure

FlexPlan generates grid columns dynamically from report dimension trees:

```typescript
// Transform report elements into grid columns
const columns = createColumnsFromTree(
  elementTree.rows,      // Row categories (shown as columns on left)
  columnDimensions,      // Column dimension tree (hierarchical headers)
  valueElements,         // Value categories (data to aggregate)
  categoryLookup,
  attributeLookup
);
```

### Pattern 2: Cell-Based Data Model

FlexPlan uses a cell-based data model where each row contains a map of cells:

```typescript
interface GridRow {
  id: string;
  cells: Record<string, ReportCell>; // keyed by column ID
}

// Access cell data in value getter
const valueGetter: ValueGetterFunc<GridRow, any> = (params) => {
  const colId = params.colDef.colId;
  return params.data?.cells?.[colId]?.value ?? '-';
};
```

### Pattern 3: Classifier-Based Filtering

FlexPlan filters segments using classifier arrays for row/column intersections:

```typescript
// Each dimension has a classifier (Category + Attribute pairs)
interface ReportDimension {
  id: string;
  classifier: [Category, Attribute][];
  // ...
}

// Filter segments matching classifier
const filterByClassifiers = (
  classifier: ReportClassifier[],
  categoryLookup: CategoryLookup,
  attributeLookup: AttributeLookup
) => (segment: Segment): boolean => {
  return classifier.every((c) =>
    filterByClassifier(segment, c, categoryLookup, attributeLookup)
  );
};
```

### Pattern 4: Validation Logging in Development

FlexPlan includes comprehensive validation logging:

```typescript
useEffect(() => {
  console.log('[ReportBuilderGrid Validation]', {
    dataSource: isSignalSource ? 'signal-resource' : 'local-computation',
    signalResourceState: gridDataResource?.state ?? 'unknown',
    rowCount: gridData.data?.length ?? 0,
    columnCount: gridData.columnDefs?.length ?? 0,
  });

  // Compare signal vs local computation
  if (isSignalSource && localGridData) {
    if (signalRowCount !== localRowCount) {
      console.warn('[ReportBuilderGrid] Mismatch detected', { ... });
    }
  }
}, [gridData, gridDataResource, localGridData]);
```

**Key Points:**
- Log data sources and computation paths
- Compare signal-based vs local computation
- Track row/column counts and data availability
- Warn on mismatches or unexpected states

## AG Grid MCP Server Integration

When using the AG Grid MCP Server, leverage these resources:

### Query Documentation

```typescript
// Use MCP server to get latest documentation
const response = await mcp.query({
  type: 'documentation',
  topic: 'column-definitions',
  version: '33.3.2' // Match package.json version
});
```

### Get Examples

```typescript
// Request specific examples from MCP
const examples = await mcp.getExamples({
  feature: 'hierarchical-column-groups',
  framework: 'react'
});
```

### Validate Configuration

```typescript
// Validate column definitions against schema
const validation = await mcp.validate({
  columnDefs: myColumnDefs,
  gridOptions: myGridOptions
});
```

**Key Points:**
- Query MCP for version-specific documentation (FlexPlan uses v33.3.2)
- Request React-specific examples
- Validate complex configurations before implementation
- Use MCP for discovering new features and APIs

## Quick Reference

### Essential Imports

```typescript
import type { GridApi, ColDef, ColGroupDef, GetRowIdParams } from 'ag-grid-community';
import { AllCommunityModule, ModuleRegistry } from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-theme-alpine.css';
```

### Minimal Grid Setup

```typescript
interface RowData {
  id: string;
  [key: string]: any;
}

const MyGrid: FC = () => {
  const [rowData] = useState<RowData[]>([]);
  const [columnDefs] = useState<ColDef[]>([
    { field: 'id', headerName: 'ID' },
  ]);

  return (
    <div className="ag-theme-alpine" style={{ height: 600 }}>
      <AgGridReact<RowData>
        rowData={rowData}
        columnDefs={columnDefs}
        defaultColDef={{
          sortable: true,
          resizable: true,
          filter: true,
        }}
      />
    </div>
  );
};
```

### Common Column Definition Patterns

```typescript
// Simple column
const simpleCol: ColDef = {
  field: 'name',
  headerName: 'Name',
};

// Column with custom getter and formatter
const customCol: ColDef = {
  colId: 'customId',
  headerName: 'Custom',
  valueGetter: (params) => params.data?.customField,
  valueFormatter: (params) => formatValue(params.value),
  cellClass: (params) => getCellClass(params),
};

// Column group
const groupCol: ColGroupDef = {
  groupId: 'group1',
  headerName: 'Group Name',
  children: [
    { field: 'child1', headerName: 'Child 1' },
    { field: 'child2', headerName: 'Child 2' },
  ],
};
```

## Troubleshooting

### Grid Not Rendering

1. Verify theme class is applied: `<div className="ag-theme-alpine">`
2. Check container has explicit height: `style={{ height: 600 }}`
3. Ensure modules are registered before component renders
4. Verify `rowData` and `columnDefs` are provided

### Performance Issues

1. Move function definitions outside render cycle
2. Use `useCallback` for event handlers
3. Implement `getRowId` for stable row identity
4. Use FlexPlan's signal-based memoization
5. Avoid inline object/array creation in props

### TypeScript Errors

1. Provide generic type to `AgGridReact<T>`
2. Import types from `ag-grid-community`, not `ag-grid-react`
3. Use `ColDef | ColGroupDef` for flexible column definitions
4. Type custom value getters, formatters, and class functions

### Export Not Working

1. Verify `gridApi` is initialized before calling export methods
2. Check API reference is not null/undefined
3. For Excel export, ensure proper module or enterprise license
4. Validate export permissions in browser

## Additional Resources

- **AG Grid Documentation**: https://www.ag-grid.com/react-data-grid/
- **AG Grid MCP Server**: https://blog.ag-grid.com/introducing-the-ag-grid-model-context-protocol-mcp-server/
- **FlexPlan Package Version**: ag-grid-community@33.3.2, ag-grid-react@33.3.2
- **FlexPlan Report Grid**: `src/features/report/widgets/ReportBuilderGrid.tsx`
- **FlexPlan Grid Logic**: `src/features/report/store/useReportGrid.ts`

---

*This document is maintained by the FlexPlan team and optimized for use with Claude Skills and the AG Grid MCP Server.*
