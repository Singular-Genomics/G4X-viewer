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
_More info: [Conventional Commits](https://www.conventionalcommits.org/)_

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

Button labels and section headings preserve the casing of their translated text. The shared theme disables automatic uppercase button typography; retain acronyms such as UMAP and RNA as written.

### Light and dark mode

`src/themes/palette.ts` groups app-specific color assignments by section:

- `theme.palette.navBar`: header background, text, tab accent, and hover/selected backgrounds.
- `theme.palette.settingsPanel`: sidebar background, surfaces, text, section headers, layer switches, and toggle buttons.
- `theme.palette.viewport`: canvas background, tools (including the scale bar), object hover cards, and status panels.

Shared assignments live in `commonViewport` and `commonSettings`; each light/dark palette
adds its mode-specific values. Nested overrides must spread their shared object explicitly
because JavaScript object spread is shallow. For example, use
`theme.palette.viewport.tools.activeBackground` for the active ROI tool color and
`theme.palette.settingsPanel.sections.background` for the settings header background.

`gx` contains reusable color families; `muiColorRoles` contains MUI's required
`primary` / `secondary` roles. Standard MUI `background`, `text`, `divider`, and
`action` roles remain defaults for general components and dialogs. App section
assignments are independent of these defaults. Add new assignment fields to the
matching interfaces in `src/themes/types.ts`; the three groups are registered in
`src/mui.d.ts`.

Keep scientific data colors (channel colors, cluster colormaps, heatmap scales, and exported image annotations) independent of the interface theme. White lettering on brand gradients and black modal backdrops intentionally use `palette.common` for contrast.

Both app entry points use `CssBaseline` and `ThemeProvider` with `forceThemeRerender`. Custom styles and Plotly consume resolved palette values, so the provider must refresh those values when the color scheme changes. Plotly layouts should start with `getPlotTheme(theme)` from `src/themes/plotTheme.ts`; retain its axis colors when adding custom axis settings.

To check a styling change, switch **Light / Dark** in the main header, to the left of **Hide viewer controls** and inspect the sidebar, filter tables, Fill/Border toggles (including the last-active disabled button), dropdown menus, floating graphs, settings dialogs, tooltips, and dashboard plots. The `/components` route also has a theme switch for inspecting shared controls. Confirm that changing modes preserves selections and data colors.

## Web Workers

The application frequently processes large scientific datasets (cell segmentation, transcript data, imaging). Use web workers for advanced operations to prevent UI blocking.

**When to Use**:

- Complex data analysis and filtering operations
- Processing large datasets (thousands of cells/transcripts)
- Heavy computational tasks (cytometry analysis, UMAP calculations)
- File parsing and data transformation

**Location**: Place workers in `component/worker/` or `layer/worker/` directories

_Learn more: [Web Workers Guide](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Using_web_workers)_

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

### Theme color families

The shared color families are `theme.palette.gx.neutrals`, `blues`, `blueGreens`,
and `greens`. The neutral scale contains 21 sRGB shades at 5% intervals:
`black`, numeric keys `5, 10, …, 95`, and `white`, increasing from black to white. For example,
`theme.palette.gx.neutrals[25]` is `#404040`. Use semantic background, text, and
border roles for interface styling where possible; their light/dark defaults map
to this shared scale. `neutrals.black` and `neutrals.white` name its endpoints.

In `palette.ts`, color families live in `colors` and MUI color roles live in
`muiColorRoles`. App assignments live in the `navBar`, `settingsPanel`, and
`viewport` groups described above.

### Settings Info View

The bottom of the settings panel contains a fixed, collapsible Info View. Settings
scroll independently above it. Hovering a control or focusing it with the keyboard
shows its help; moving to an area without help clears it to a neutral prompt.
The Show/Hide preference is saved locally as `g4x-settings-info-view-visible`.

Wrap settings controls in `SettingsTooltip` from `shared/components/SettingsHelp`.
Its `title` is the help body and optional `helpTitle` is the heading (include the
channel name for repeated channel controls). Use translated strings in
`public/locales/en.json`, under `settingsHelp` or the existing `tooltips` keys.
Existing Tooltip props remain supported. Inside `SettingsHelpProvider`, help
appears in Info View with no floating tooltip; outside it, the component uses the
usual MUI Tooltip. `SettingsHelpRegion` delegates hover and focus events, including
nested controls and React portals. The filter table uses this same component for
its internal tooltip slot.

Manual checks: hover and keyboard-focus controls, move between channels and then
onto blank space, hide/reopen Info View, reload to check the preference, and scroll
settings while checking the footer stays in place. Also check filter table search,
color pickers, and menus, and confirm tooltips outside settings still float.
