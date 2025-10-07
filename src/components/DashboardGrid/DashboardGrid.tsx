import { useState, useMemo, useEffect } from 'react';
import { Box, Theme, useTheme } from '@mui/material';
import GridLayout, { WidthProvider, Layout } from 'react-grid-layout';
import { GxGridItem } from '../../shared/components/GxGridItem';
import { DashboardGridProps } from './DashboardGrid.types';

const ReactGridLayout = WidthProvider(GridLayout);

export const DashboardGrid = ({ items, onLayoutChange, onRemoveItem, className }: DashboardGridProps) => {
  const theme = useTheme();
  const sx = styles(theme);

  const defaultLayout = useMemo(() => {
    return items.map((item, index) => ({
      i: item.id,
      x: (index % 2) * 24,
      y: Math.floor(index / 2) * 10,
      w: 24,
      h: 10,
      minW: 6,
      minH: 4
    }));
  }, [items]);

  const [layout, setLayout] = useState<Layout[]>(defaultLayout);

  // Update layout when items change
  useEffect(() => {
    const existingLayoutMap = new Map(layout.map((l) => [l.i, l]));
    const newLayout = items.map((item, index) => {
      const existing = existingLayoutMap.get(item.id);
      if (existing) {
        return existing;
      }
      return {
        i: item.id,
        x: (index % 2) * 24,
        y: Math.floor(index / 2) * 10,
        w: 24,
        h: 10,
        minW: 6,
        minH: 4
      };
    });
    setLayout(newLayout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items]);

  const handleLayoutChange = (newLayout: Layout[]) => {
    setLayout(newLayout);
    onLayoutChange?.(newLayout);
  };

  const handleRemoveItem = (itemId: string) => {
    onRemoveItem?.(itemId);
  };

  return (
    <Box
      className={className}
      sx={sx.container}
    >
      <ReactGridLayout
        className="layout"
        layout={layout}
        onLayoutChange={handleLayoutChange}
        cols={48}
        rowHeight={40}
        margin={[16, 16]}
        containerPadding={[16, 16]}
        useCSSTransforms={true}
        compactType="vertical"
        preventCollision={false}
        draggableHandle=".drag-handle"
      >
        {items.map((item) => (
          <div key={item.id}>
            <GxGridItem
              title={item.title}
              backgroundColor={item.backgroundColor}
              onRemove={item.removable ? () => handleRemoveItem(item.id) : undefined}
            >
              {item.content}
            </GxGridItem>
          </div>
        ))}
      </ReactGridLayout>
    </Box>
  );
};

const styles = (theme: Theme) => ({
  container: {
    width: '100%',
    minHeight: '100%',
    overflow: 'visible',
    '& .react-grid-item': {
      transition: 'all 200ms ease',
      transitionProperty: 'left, top'
    },
    '& .react-grid-item.cssTransforms': {
      transitionProperty: 'transform'
    },
    '& .react-grid-item.resizing': {
      transition: 'none',
      zIndex: 1
    },
    '& .react-grid-item.react-draggable-dragging': {
      transition: 'none',
      zIndex: 3
    },
    '& .react-grid-item.react-draggable-dragging .drag-handle': {
      cursor: 'grabbing !important'
    },
    '& .react-grid-item > .react-resizable-handle': {
      position: 'absolute',
      width: '20px',
      height: '20px',
      bottom: 0,
      right: 0,
      cursor: 'se-resize',
      opacity: 0.4,
      '&:hover': {
        opacity: 0.8
      },
      '&::after': {
        content: '""',
        position: 'absolute',
        right: '3px',
        bottom: '3px',
        width: '5px',
        height: '5px',
        borderRight: `2px solid ${theme.palette.gx.lightGrey[500]}`,
        borderBottom: `2px solid ${theme.palette.gx.lightGrey[500]}`
      }
    },
    '& .react-grid-placeholder': {
      background: theme.palette.gx.accent.greenBlue,
      opacity: 0.2,
      borderRadius: '8px'
    }
  }
});
