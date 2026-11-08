import { useEffect, useRef, useState } from 'react';
import {
  Box,
  Button,
  Chip,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Slider,
  TextField,
  Typography,
  useTheme
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DownloadIcon from '@mui/icons-material/Download';
import UploadIcon from '@mui/icons-material/Upload';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import { useTranslation } from 'react-i18next';
import { useSnackbar } from 'notistack';
import { GxThemeModeToggle } from '../../shared/components/GxThemeModeToggle';
import { ColorReferencePreview } from './ColorReferencePreview';
import {
  COLOR_DRAFT_STORAGE_KEY,
  COLOR_ELEMENTS,
  COLOR_TOKENS,
  ColorDrafts,
  ColorElement,
  ColorToken,
  createDefaultColorDraft,
  createDefaultColorDrafts,
  parseColorDrafts,
  REFERENCE_SWATCHES,
  resolveElementColor,
  serializeColorDrafts
} from './colorReference';

function loadDrafts(): ColorDrafts {
  try {
    const stored = localStorage.getItem(COLOR_DRAFT_STORAGE_KEY);
    if (stored) return parseColorDrafts(JSON.parse(stored));
  } catch {
    /* An incompatible or unavailable saved draft falls back to the repository theme. */
  }
  return createDefaultColorDrafts();
}

export const ColorReferenceView = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const mode = theme.palette.mode;
  const { enqueueSnackbar } = useSnackbar();
  const [drafts, setDrafts] = useState<ColorDrafts>(loadDrafts);
  const [activeElement, setActiveElement] = useState<ColorElement>('sectionHeader');
  const [saved, setSaved] = useState(true);
  const fileInput = useRef<HTMLInputElement>(null);
  const draft = drafts[mode];
  const activeToken = draft.assignments[activeElement];
  const color = draft.colors[activeToken];
  const [hexInput, setHexInput] = useState(color);
  const hexValid = /^#[\da-f]{6}([\da-f]{2})?$/i.test(hexInput);
  const opacity = color.length === 9 ? Math.round((parseInt(color.slice(7), 16) / 255) * 100) : 100;
  const sharedElements = COLOR_ELEMENTS.filter(
    (element) => element !== activeElement && draft.assignments[element] === activeToken
  );
  const elementName = (element: ColorElement) => t(`colorReference.elements.${element}`);

  useEffect(() => {
    setHexInput(color);
  }, [color, activeElement, mode]);
  useEffect(() => {
    try {
      localStorage.setItem(COLOR_DRAFT_STORAGE_KEY, serializeColorDrafts(drafts));
      setSaved(true);
    } catch {
      setSaved(false);
    }
  }, [drafts]);

  const setColor = (value: string) => {
    setDrafts((current) => ({
      ...current,
      [mode]: { ...current[mode], colors: { ...current[mode].colors, [activeToken]: value.toUpperCase() } }
    }));
  };
  const assign = (token: ColorToken) => {
    setDrafts((current) => ({
      ...current,
      [mode]: { ...current[mode], assignments: { ...current[mode].assignments, [activeElement]: token } }
    }));
  };
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(serializeColorDrafts(drafts));
      enqueueSnackbar(t('colorReference.copied'), { variant: 'success' });
    } catch {
      enqueueSnackbar(t('colorReference.copyFailed'), { variant: 'info' });
    }
  };
  const download = () => {
    const url = URL.createObjectURL(new Blob([serializeColorDrafts(drafts)], { type: 'application/json' }));
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'g4x-ui-colors.json';
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Box sx={sx.page}>
      <Box
        component="header"
        sx={sx.header}
      >
        <Box>
          <Typography sx={sx.eyebrow}>{t('colorReference.eyebrow')}</Typography>
          <Typography
            component="h1"
            sx={sx.title}
          >
            {t('colorReference.title')}
          </Typography>
        </Box>
        <Box sx={sx.actions}>
          <Button
            href="/ui-reference"
            size="small"
          >
            {t('colorReference.buttonsLink')}
          </Button>
          <GxThemeModeToggle />
        </Box>
      </Box>
      <Typography sx={sx.intro}>{t('colorReference.intro')}</Typography>
      <Box sx={sx.actionBar}>
        <Chip
          size="small"
          label={t(`colorReference.${mode}Palette`)}
          color="primary"
          variant="outlined"
        />
        <Typography sx={{ ...sx.help, flex: 1 }}>{t(`colorReference.${saved ? 'saved' : 'sessionOnly'}`)}</Typography>
        <Button
          startIcon={<ContentCopyIcon />}
          size="small"
          onClick={copy}
        >
          {t('colorReference.copy')}
        </Button>
        <Button
          startIcon={<DownloadIcon />}
          size="small"
          onClick={download}
        >
          {t('colorReference.export')}
        </Button>
        <Button
          startIcon={<UploadIcon />}
          size="small"
          onClick={() => fileInput.current?.click()}
        >
          {t('colorReference.import')}
        </Button>
        <Button
          startIcon={<RestartAltIcon />}
          size="small"
          onClick={() => setDrafts((current) => ({ ...current, [mode]: createDefaultColorDraft(mode) }))}
        >
          {t('colorReference.reset')}
        </Button>
        <input
          ref={fileInput}
          type="file"
          accept="application/json,.json"
          hidden
          onChange={async (event) => {
            const file = event.target.files?.[0];
            event.target.value = '';
            if (!file) return;
            try {
              setDrafts(parseColorDrafts(JSON.parse(await file.text())));
              enqueueSnackbar(t('colorReference.imported'), { variant: 'success' });
            } catch {
              enqueueSnackbar(t('colorReference.importFailed'), { variant: 'error' });
            }
          }}
        />
      </Box>

      <Box sx={sx.workspace}>
        <Box sx={sx.editor}>
          <Typography
            component="h2"
            sx={sx.sectionTitle}
          >
            {t('colorReference.editElement')}
          </Typography>
          <FormControl
            fullWidth
            size="small"
            sx={{ marginTop: '20px' }}
          >
            <InputLabel>{t('colorReference.element')}</InputLabel>
            <Select
              label={t('colorReference.element')}
              value={activeElement}
              onChange={(event) => setActiveElement(event.target.value as ColorElement)}
            >
              {COLOR_ELEMENTS.map((element) => (
                <MenuItem
                  key={element}
                  value={element}
                >
                  {elementName(element)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl
            fullWidth
            size="small"
            sx={{ marginTop: '20px' }}
          >
            <InputLabel>{t('colorReference.assignedToken')}</InputLabel>
            <Select
              label={t('colorReference.assignedToken')}
              value={activeToken}
              onChange={(event) => assign(event.target.value as ColorToken)}
              sx={{ fontSize: '12px' }}
            >
              {COLOR_TOKENS.map((token) => (
                <MenuItem
                  key={token}
                  value={token}
                  sx={{ fontSize: '12px', gap: '8px' }}
                >
                  <Box
                    component="span"
                    sx={{ ...sx.dot, backgroundColor: draft.colors[token] }}
                  />
                  {token}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Typography sx={{ ...sx.help, marginTop: '10px' }}>{t('colorReference.assignmentHelp')}</Typography>
          <Box sx={sx.colorInput}>
            <Box
              component="label"
              sx={{ ...sx.picker, backgroundColor: color }}
            >
              <input
                type="color"
                value={color.slice(0, 7)}
                aria-label={t('colorReference.pickColor')}
                onChange={(event) => setColor(event.target.value + (color.length === 9 ? color.slice(7) : ''))}
                style={{ opacity: 0, width: '100%', height: '100%', cursor: 'pointer' }}
              />
            </Box>
            <TextField
              size="small"
              label={t('colorReference.hex')}
              value={hexInput}
              error={!hexValid}
              onChange={(event) => {
                const value = event.target.value;
                setHexInput(value);
                if (/^#[\da-f]{6}([\da-f]{2})?$/i.test(value)) setColor(value);
              }}
              slotProps={{ htmlInput: { spellCheck: false, maxLength: 9 } }}
              sx={{ flex: 1 }}
            />
          </Box>
          {!hexValid && <Typography sx={{ ...sx.help, color: 'error.main' }}>{t('colorReference.hexHelp')}</Typography>}
          <Box sx={sx.opacityLabel}>
            <Typography sx={sx.help}>{t('colorReference.opacity')}</Typography>
            <Typography sx={sx.help}>{opacity}%</Typography>
          </Box>
          <Slider
            size="small"
            aria-label={t('colorReference.opacity')}
            value={opacity}
            onChange={(_, value) => {
              const alpha = Math.round(((value as number) / 100) * 255)
                .toString(16)
                .padStart(2, '0');
              setColor(color.slice(0, 7) + (alpha === 'ff' ? '' : alpha));
            }}
          />
          {sharedElements.length > 0 && (
            <Box sx={sx.sharedNotice}>
              <Typography sx={sx.help}>
                {t('colorReference.shared', { elements: sharedElements.map(elementName).join(', ') })}
              </Typography>
            </Box>
          )}
          <Typography sx={{ ...sx.eyebrow, marginTop: '24px' }}>{t('colorReference.swatches')}</Typography>
          <Box sx={sx.swatches}>
            {REFERENCE_SWATCHES.map((swatch) => (
              <Button
                key={swatch}
                aria-label={t('colorReference.useColor', { color: swatch })}
                title={swatch}
                onClick={() => setColor(swatch)}
                sx={{
                  minWidth: 0,
                  height: 26,
                  padding: 0,
                  borderRadius: '4px',
                  backgroundColor: swatch,
                  border: '1px solid',
                  borderColor: 'divider',
                  '&:hover': { backgroundColor: swatch, outline: '2px solid', outlineColor: 'primary.main' }
                }}
              />
            ))}
          </Box>
        </Box>
        <Box sx={{ minWidth: 0 }}>
          <ColorReferencePreview
            draft={draft}
            activeElement={activeElement}
            onSelect={setActiveElement}
          />
        </Box>
      </Box>

      <Box sx={{ marginTop: '36px' }}>
        <Typography
          component="h2"
          sx={sx.sectionTitle}
        >
          {t('colorReference.palette')}
        </Typography>
        <Typography sx={{ ...sx.help, margin: '6px 0 16px' }}>
          {t('colorReference.paletteHelp', { element: elementName(activeElement) })}
        </Typography>
        <Box sx={sx.paletteGrid}>
          {COLOR_TOKENS.map((token) => (
            <Button
              key={token}
              onClick={() => assign(token)}
              aria-pressed={token === activeToken}
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'stretch',
                padding: 0,
                border: '1px solid',
                borderColor: token === activeToken ? 'primary.main' : 'divider',
                borderRadius: '8px',
                overflow: 'hidden',
                textTransform: 'none',
                color: 'text.primary',
                textAlign: 'left',
                '&:hover': { borderColor: 'primary.main' }
              }}
            >
              <Box
                sx={{
                  height: 48,
                  backgroundColor: draft.colors[token],
                  width: '100%',
                  borderBottom: '1px solid',
                  borderColor: 'divider'
                }}
              />
              <Box sx={{ padding: '10px', width: '100%' }}>
                <Typography sx={sx.tokenName}>{token}</Typography>
                <Typography sx={sx.help}>{draft.colors[token]}</Typography>
              </Box>
            </Button>
          ))}
        </Box>
      </Box>
      <Box sx={{ marginTop: '32px' }}>
        <Typography
          component="h2"
          sx={sx.sectionTitle}
        >
          {t('colorReference.assignments')}
        </Typography>
        <Box sx={sx.assignmentGrid}>
          {COLOR_ELEMENTS.map((element) => (
            <Button
              key={element}
              onClick={() => setActiveElement(element)}
              sx={{
                color: 'text.primary',
                textTransform: 'none',
                padding: '12px',
                justifyContent: 'flex-start',
                gap: '10px',
                border: '1px solid',
                borderColor: activeElement === element ? 'primary.main' : 'divider',
                borderRadius: '6px',
                textAlign: 'left'
              }}
            >
              <Box
                component="span"
                sx={{ ...sx.dot, width: 24, height: 24, backgroundColor: resolveElementColor(draft, element) }}
              />
              <Box>
                <Typography sx={{ fontSize: '12px', fontWeight: 600 }}>{elementName(element)}</Typography>
                <Typography sx={sx.tokenName}>{draft.assignments[element]}</Typography>
              </Box>
            </Button>
          ))}
        </Box>
      </Box>
      <Typography sx={sx.footer}>{t('colorReference.footer')}</Typography>
    </Box>
  );
};

const sx = {
  page: { maxWidth: 1400, margin: '0 auto', padding: { xs: '24px 16px 48px', md: '36px 36px 64px' } },
  header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '20px', flexWrap: 'wrap' },
  actions: { display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' },
  eyebrow: { fontSize: '11px', color: 'text.secondary', fontWeight: 700, letterSpacing: '0.06em' },
  title: { fontSize: { xs: '30px', md: '38px' }, fontWeight: 700, letterSpacing: '-0.035em', marginTop: '6px' },
  intro: { maxWidth: 840, color: 'text.secondary', fontSize: '14px', lineHeight: 1.7, margin: '16px 0 24px' },
  help: { fontSize: '12px', color: 'text.secondary', lineHeight: 1.6 },
  sectionTitle: { fontSize: '18px', fontWeight: 700 },
  actionBar: { display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '8px', marginBottom: '24px' },
  workspace: {
    display: 'grid',
    gridTemplateColumns: { xs: '1fr', md: '300px minmax(0, 1fr)' },
    alignItems: 'start',
    gap: '24px'
  },
  editor: {
    backgroundColor: 'background.settingsPanel',
    border: '1px solid',
    borderColor: 'divider',
    borderRadius: '10px',
    padding: '20px',
    minWidth: 0
  },
  colorInput: { display: 'flex', alignItems: 'center', gap: '10px', marginTop: '24px' },
  picker: {
    display: 'block',
    width: 42,
    height: 40,
    border: '1px solid',
    borderColor: 'divider',
    borderRadius: '6px',
    overflow: 'hidden',
    flexShrink: 0
  },
  dot: {
    display: 'inline-block',
    width: 14,
    height: 14,
    borderRadius: '3px',
    border: '1px solid',
    borderColor: 'divider',
    flexShrink: 0,
    verticalAlign: 'middle'
  },
  opacityLabel: { display: 'flex', justifyContent: 'space-between', marginTop: '18px' },
  sharedNotice: { borderLeft: '2px solid', borderColor: 'primary.main', paddingLeft: '10px', marginTop: '10px' },
  swatches: { display: 'grid', gridTemplateColumns: 'repeat(6, minmax(0, 1fr))', gap: '6px', marginTop: '10px' },
  paletteGrid: {
    display: 'grid',
    gridTemplateColumns: {
      xs: 'repeat(2, minmax(0, 1fr))',
      sm: 'repeat(3, minmax(0, 1fr))',
      lg: 'repeat(5, minmax(0, 1fr))'
    },
    gap: '10px'
  },
  tokenName: { fontSize: '11px', fontFamily: 'monospace', color: 'text.secondary', overflowWrap: 'anywhere' },
  assignmentGrid: {
    display: 'grid',
    gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))', lg: 'repeat(3, minmax(0, 1fr))' },
    gap: '8px',
    marginTop: '16px'
  },
  footer: { fontSize: '12px', color: 'text.secondary', lineHeight: 1.7, marginTop: '28px' }
};
