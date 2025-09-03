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
npm install
npm run dev  # Starts on http://localhost:5173
```

### Available Scripts

- `npm run dev` - Development server
- `npm run build` - Production build
- `npm run lint` - Code linting
- `npm run format` - Code formatting
- `npm run type-check` - TypeScript validation

### Before Committing

- [ ] `npm run lint` - Fix linting issues
- [ ] `npm run type-check` - Resolve TypeScript errors
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
