# Development Guide

Quick reference for developers working on G4X Viewer - a React-based application for visualizing scientific imaging data.

## Project Structure

```
src/
├── assets/          # Static assets (images, logos)
├── components/      # React components (organized by feature)
├── config/          # Application configuration
├── hooks/           # Custom React hooks
├── layers/          # Custom DeckGL layers
├── shared/          # Shared components and utilities
├── stores/          # Zustand state management
├── themes/          # Material-UI themes
└── utils/           # Utility functions
```

## Technology Stack

**Core**: React 19, TypeScript 5+, Material-UI 7+, Zustand 4+  
**Visualization**: DeckGL 9+, Viv 0.17+, Plotly.js  
**Dev Tools**: Vite 5+, ESLint, Prettier, Husky  
**Other**: i18next, notistack, lodash

_See [package.json](../package.json) for complete dependencies_

## Development Workflow

### Setup

```bash
pnpm install
pnpm dev  # Starts on http://localhost:5173
```

### Available Scripts

- `pnpm dev` - Development server
- `pnpm build` - Production build
- `pnpm lint` - Code linting
- `pnpm format` - Code formatting
- `pnpm type-check` - TypeScript validation

### Before Committing

- [ ] `pnpm lint` - Fix linting issues
- [ ] `pnpm type-check` - Resolve TypeScript errors
- [ ] Test functionality manually
- [ ] Check console for errors

**Note**: Husky automatically runs linting, formatting, and type-checking on pre-commit hooks.

### Commit Messages

Use conventional commits format (enforced by commitlint):

```
feat: add new image viewer component
fix: resolve memory leak in layer rendering
docs: update development guide
refactor: simplify store structure
```

**Types**: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`  
*More info: [Conventional Commits](https://www.conventionalcommits.org/)*

## Naming Conventions

- **Components**: `PascalCase` directories and files (`ViewController/ViewController.tsx`)
- **Hooks**: `camelCase` with `.hook.ts` suffix (`useProteinImage.hook.ts`)
- **Stores**: `PascalCase` directories (`ViewerStore/ViewerStore.ts`)
- **Types**: `.types.ts` suffix
- **Helpers**: `.helpers.ts` suffix
- **Variables**: `camelCase`
- **Constants**: `UPPER_SNAKE_CASE`
- **Types**: Prefer `type` over `interface` for new definitions

## Adding New Code

### Components

**Feature-specific components**: `src/components/NewComponent/`
**Reusable components**: `src/shared/components/NewComponent/`

```
src/components/NewComponent/
├── NewComponent.tsx
├── NewComponent.helpers.ts    # (optional)
├── NewComponent.types.ts      # (optional)
└── index.ts                   # Re-export
```

### Zustand Stores

```
src/stores/NewFeatureStore/
├── NewFeatureStore.ts
├── NewFeatureStore.types.ts
└── index.ts
```

## Key Patterns

- Use **functional components** with hooks
- **Zustand stores** for global state management
- **Material-UI** components for consistent UI
- **TypeScript** for all new code
- **Feature-based** component organization
- **Named exports** preferred over default

## Git Workflow

1. Create feature branch from `staging`
2. Make changes following conventions
3. Run quality checks
4. Commit with conventional messages
5. Submit PR for review (fill out PR template)

## Internationalization

All user-facing strings should be placed in translation files, not hardcoded in components.

```tsx
import { useTranslation } from 'react-i18next';

const { t } = useTranslation();
return <Button>{t('buttons.save')}</Button>;

// With variables: "welcome": "Hello {{name}}"
const message = t('welcome', { name: 'John' });
```

**Translation files**: Located in `public/locales/[lang]/` directories

## Styling with MUI

Use the `styles` function pattern with theme access:

```tsx
import { Box, Theme, useTheme } from '@mui/material';

export const MyComponent = () => {
  const theme = useTheme();
  const sx = styles(theme);
  return <Box sx={sx.container}>Content</Box>;
};

const styles = (theme: Theme) => ({
  container: {
    padding: theme.spacing(2),
    backgroundColor: theme.palette.primary.main
  }
});
```

### Light and dark mode

`src/themes/palette.ts` defines the shared brand colors and the light/dark semantic palettes. Use `theme.palette.background.settingsPanel` for the settings sidebar, `background.viewport` for the imaging viewport, `background.default` for other application surfaces, `background.paper` for controls and floating panels, `text.primary` / `text.secondary` for text, `divider` for borders, and `action.*` for hover, selected, and disabled states. Fixed neutral colors from `palette.gx` should not be used for interface surfaces or text.

Keep scientific data colors (channel colors, cluster colormaps, heatmap scales, and exported image annotations) independent of the interface theme. White lettering on brand gradients and black modal backdrops intentionally use `palette.common` for contrast.

Both app entry points use `CssBaseline` and `ThemeProvider` with `forceThemeRerender`. Custom styles and Plotly consume resolved palette values, so the provider must refresh those values when the color scheme changes. Plotly layouts should start with `getPlotTheme(theme)` from `src/themes/plotTheme.ts`; retain its axis colors when adding custom axis settings.

To check a styling change, switch **Light / Dark** in View Settings and inspect the sidebar, filter tables, Fill/Border toggles (including the last-active disabled button), dropdown menus, floating graphs, settings dialogs, tooltips, and dashboard plots. The `/components` route also has a theme switch for inspecting shared controls. Confirm that changing modes preserves selections and data colors.

## Web Workers

The application frequently processes large scientific datasets (cell segmentation, transcript data, imaging). Use web workers for advanced operations to prevent UI blocking.

**When to Use**:

- Complex data analysis and filtering operations
- Processing large datasets (thousands of cells/transcripts)
- Heavy computational tasks (cytometry analysis, UMAP calculations)
- File parsing and data transformation

**Location**: Place workers in `component/worker/` or `layer/worker/` directories

*Learn more: [Web Workers Guide](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Using_web_workers)*

## User Notifications

Use notistack for user feedback and error handling:

```tsx
import { useSnackbar } from 'notistack';

const { enqueueSnackbar } = useSnackbar();

// Success
enqueueSnackbar(t('messages.success'), { variant: 'success' });

// Error
enqueueSnackbar(t('errors.loadFailed'), { variant: 'error' });

// Info/Warning
enqueueSnackbar(t('info.processing'), { variant: 'info' });
```

## Quick Reference

**Need help?**: Check existing similar components first  
**State management**: Local state with `useState`, global with Zustand  
**Styling**: Material-UI components + custom themes  
**Types**: Create `.types.ts` files for complex types  
**Errors**: Use notistack for user notifications  
**Strings**: Use translation keys, never hardcode text
