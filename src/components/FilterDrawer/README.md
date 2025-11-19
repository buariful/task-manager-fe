# FilterDrawer Component

A simple and flexible filter drawer component that opens from the right side with configurable tabs and dynamic content.

## Features

- **Dynamic Tabs**: Left side shows filter categories with active state highlighting
- **Dynamic Content**: Right side renders children components based on selected tab
- **Flexible**: Parent component controls all filter logic and content
- **Responsive Design**: Uses Tailwind CSS for modern styling
- **Accessible**: Built with Headless UI for accessibility

## Usage

```jsx
import { FilterDrawer } from "Components/FilterDrawer";

const MyComponent = () => {
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [filters, setFilters] = useState({});
  
  const filterTabs = [
    { key: "category", label: "Category" },
    { key: "type", label: "Type" },
    { key: "status", label: "Status" },
  ];

  const handleApplyFilters = () => {
    console.log("Applied filters:", filters);
    // Apply filters to your data
  };

  const handleClearFilters = () => {
    console.log("Cleared filters");
    setFilters({});
    // Clear all filters
  };

  // Filter content components
  const CategoryFilter = () => (
    <div>
      {/* Your category filter UI */}
      <input 
        type="checkbox" 
        onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
      />
    </div>
  );

  const TypeFilter = () => (
    <div>
      {/* Your type filter UI */}
      <select onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}>
        <option value="technical">Technical</option>
        <option value="performance">Performance</option>
      </select>
    </div>
  );

  return (
    <div>
      <button onClick={() => setIsFilterDrawerOpen(true)}>
        Open Filters
      </button>
      
      <FilterDrawer
        open={isFilterDrawerOpen}
        setOpen={setIsFilterDrawerOpen}
        filterTabs={filterTabs}
        onApplyFilters={handleApplyFilters}
        onClearFilters={handleClearFilters}
      >
        <CategoryFilter tabKey="category" />
        <TypeFilter tabKey="type" />
        <StatusFilter tabKey="status" />
      </FilterDrawer>
    </div>
  );
};
```

## Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `open` | boolean | Yes | Controls drawer visibility |
| `setOpen` | function | Yes | Function to control drawer state |
| `filterTabs` | array | Yes | Configuration for filter tabs |
| `children` | ReactNode | Yes | Filter content components with tabKey props |
| `onApplyFilters` | function | Yes | Callback when filters are applied |
| `onClearFilters` | function | Yes | Callback when filters are cleared |

## Filter Tab Configuration

Each tab in `filterTabs` should have:

```jsx
{
  key: "unique_key",           // Unique identifier
  label: "Display Name",       // Tab display name
}
```

## Children Components

Each child component should have a `tabKey` prop that matches one of the filter tab keys:

```jsx
<MyFilterComponent tabKey="category" />
```

The FilterDrawer will automatically show the child component when its corresponding tab is active.

## Benefits of This Approach

1. **Separation of Concerns**: FilterDrawer only handles UI, parent handles logic
2. **Flexibility**: Each filter can have completely custom UI
3. **Reusability**: FilterDrawer can be used with any type of filter content
4. **Maintainability**: Filter logic stays in the parent component
5. **Testability**: Easy to test filter logic separately from UI

## Styling

The component uses Tailwind CSS classes and follows the project's design system. The active tab has a gray background (`bg-gray-200`) and the drawer slides in from the right side.
