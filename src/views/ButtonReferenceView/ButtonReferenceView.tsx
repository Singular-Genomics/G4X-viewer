import { useState } from 'react';
import {
  Box,
  Button,
  Chip,
  Divider,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Select,
  Switch,
  ToggleButton,
  Typography,
  useTheme
} from '@mui/material';
import LayersOutlinedIcon from '@mui/icons-material/LayersOutlined';
import AddIcon from '@mui/icons-material/Add';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import { useTranslation } from 'react-i18next';
import { useSnackbar } from 'notistack';
import { GxThemeModeToggle } from '../../shared/components/GxThemeModeToggle';
import {
  BUTTON_METRICS,
  BUTTON_REFERENCES,
  ButtonSpec,
  DEFAULT_BUTTON_SPEC,
  getReferenceButtonStyles,
  ReferenceState
} from './buttonReference';

function ReferenceButton({
  spec,
  selected = false,
  state = 'rest',
  onClick
}: {
  spec: ButtonSpec;
  selected?: boolean;
  state?: ReferenceState;
  onClick?: () => void;
}) {
  const theme = useTheme();
  const { t } = useTranslation();
  const icon = spec.behavior === 'toggle' ? <LayersOutlinedIcon /> : <AddIcon />;
  const label = t(`buttonReference.${spec.behavior === 'toggle' ? 'layers' : 'addChannel'}`);
  const children = (
    <>
      {(spec.icon === 'leading' || spec.icon === 'only') && icon}
      {spec.icon !== 'only' && label}
      {spec.icon === 'trailing' && icon}
    </>
  );
  const common = {
    sx: getReferenceButtonStyles(theme, spec, selected, state),
    disabled: state === 'disabled',
    'aria-label': label,
    onClick,
    children
  };
  return spec.behavior === 'toggle' ? (
    <ToggleButton
      {...common}
      value="reference"
      selected={selected}
    />
  ) : (
    <Button {...common} />
  );
}

function SpecSelector({
  label,
  value,
  options,
  onChange
}: {
  label: string;
  value: string;
  options: readonly string[];
  onChange: (value: string) => void;
}) {
  const { t } = useTranslation();
  return (
    <FormControl
      fullWidth
      size="small"
    >
      <InputLabel>{label}</InputLabel>
      <Select
        label={label}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        {options.map((option) => (
          <MenuItem
            key={option}
            value={option}
          >
            {t(`buttonReference.${option}`)}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}

export const ButtonReferenceView = () => {
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
  const [spec, setSpec] = useState<ButtonSpec>(DEFAULT_BUTTON_SPEC);
  const [selected, setSelected] = useState(false);
  const [copied, setCopied] = useState(false);
  const [actionCount, setActionCount] = useState(0);
  const describe = (button: ButtonSpec) =>
    [button.size, button.surface, button.behavior, button.icon].map((key) => t(`buttonReference.${key}`)).join(' · ');
  const description = describe(spec);
  const stateLabel = selected ? 'on' : 'off';
  const matchingReference = BUTTON_REFERENCES.find((entry) => describe(entry.spec) === description);
  const update = (key: keyof ButtonSpec, value: string) => {
    setSpec((current) => ({ ...current, [key]: value }));
    setCopied(false);
  };
  const copySpec = async () => {
    try {
      await navigator.clipboard.writeText(
        `${description}${spec.behavior === 'toggle' ? ` · ${t(`buttonReference.${stateLabel}`)}` : ''}`
      );
      setCopied(true);
    } catch {
      enqueueSnackbar(t('buttonReference.copyFailed'), { variant: 'info' });
    }
  };

  return (
    <Box sx={sx.page}>
      <Box
        component="header"
        sx={sx.header}
      >
        <Box>
          <Typography sx={sx.eyebrow}>{t('buttonReference.eyebrow')}</Typography>
          <Typography
            component="h1"
            sx={sx.title}
          >
            {t('buttonReference.title')}
          </Typography>
        </Box>
        <Box sx={sx.headerActions}>
          <Button
            href="/ui-reference/colors"
            size="small"
          >
            {t('buttonReference.colorsLink')}
          </Button>
          <Button
            href="/components"
            size="small"
          >
            {t('buttonReference.allComponents')}
          </Button>
          <GxThemeModeToggle />
        </Box>
      </Box>
      <Typography sx={sx.intro}>{t('buttonReference.intro')}</Typography>

      <Box sx={sx.explorer}>
        <Box sx={sx.configuration}>
          <Typography
            component="h2"
            sx={sx.sectionTitle}
          >
            {t('buttonReference.configure')}
          </Typography>
          <Typography sx={sx.help}>{t('buttonReference.configureHelp')}</Typography>
          <Box sx={sx.selectors}>
            <SpecSelector
              label={t('buttonReference.size')}
              value={spec.size}
              options={['small', 'medium', 'large']}
              onChange={(value) => update('size', value)}
            />
            <SpecSelector
              label={t('buttonReference.surface')}
              value={spec.surface}
              options={['filled', 'outlined', 'tonal', 'text']}
              onChange={(value) => update('surface', value)}
            />
            <SpecSelector
              label={t('buttonReference.behavior')}
              value={spec.behavior}
              options={['action', 'toggle']}
              onChange={(value) => update('behavior', value)}
            />
            <SpecSelector
              label={t('buttonReference.icon')}
              value={spec.icon}
              options={['none', 'leading', 'trailing', 'only']}
              onChange={(value) => update('icon', value)}
            />
          </Box>
          <Box sx={sx.definition}>
            <Typography sx={sx.eyebrow}>{t('buttonReference.callIt')}</Typography>
            <Typography sx={sx.specName}>{description}</Typography>
            <Button
              size="small"
              startIcon={copied ? <CheckIcon /> : <ContentCopyIcon />}
              onClick={copySpec}
            >
              {t(`buttonReference.${copied ? 'copied' : 'copy'}`)}
            </Button>
          </Box>
        </Box>
        <Box sx={sx.preview}>
          <Box sx={sx.previewHeader}>
            <Typography sx={sx.eyebrow}>{t('buttonReference.livePreview')}</Typography>
            <Chip
              size="small"
              label={matchingReference?.id ?? t('buttonReference.custom')}
              variant="outlined"
            />
          </Box>
          <Box sx={sx.previewStage}>
            <ReferenceButton
              spec={spec}
              selected={selected}
              onClick={() => {
                if (spec.behavior === 'toggle') setSelected((value) => !value);
                else setActionCount((value) => value + 1);
              }}
            />
            <Typography sx={sx.previewHint}>
              {spec.behavior === 'toggle'
                ? t(`buttonReference.${selected ? 'previewOn' : 'previewOff'}`)
                : t('buttonReference.actionCount', { count: actionCount })}
            </Typography>
          </Box>
          <Box sx={sx.previewFooter}>
            <Typography sx={sx.help}>
              {t('buttonReference.measurements', {
                height: BUTTON_METRICS[spec.size].height,
                font: BUTTON_METRICS[spec.size].font
              })}
            </Typography>
            {spec.behavior === 'toggle' && (
              <FormControlLabel
                label={t('buttonReference.selected')}
                control={
                  <Switch
                    size="small"
                    checked={selected}
                    onChange={(event) => setSelected(event.target.checked)}
                  />
                }
              />
            )}
          </Box>
        </Box>
      </Box>

      <Box sx={sx.sectionHeading}>
        <Typography
          component="h2"
          sx={sx.sectionTitle}
        >
          {t('buttonReference.states')}
        </Typography>
        <Typography sx={sx.help}>{t('buttonReference.statesHelp')}</Typography>
      </Box>
      <Box sx={sx.stateGrid}>
        {(['rest', 'hover', 'focus', 'disabled'] as const).map((state) => (
          <Box
            key={state}
            sx={sx.stateCell}
          >
            <Box sx={sx.stateSample}>
              <ReferenceButton
                spec={spec}
                selected={selected}
                state={state}
              />
            </Box>
            <Typography sx={sx.caption}>{t(`buttonReference.${state}`)}</Typography>
          </Box>
        ))}
      </Box>

      <Box sx={sx.sectionHeading}>
        <Typography
          component="h2"
          sx={sx.sectionTitle}
        >
          {t('buttonReference.catalogue')}
        </Typography>
        <Typography sx={sx.help}>{t('buttonReference.catalogueHelp')}</Typography>
      </Box>
      <Box sx={sx.catalogue}>
        {BUTTON_REFERENCES.map((reference) => (
          <Box
            key={reference.id}
            sx={sx.card}
          >
            <Box sx={sx.cardHeader}>
              <Typography sx={sx.referenceId}>{reference.id}</Typography>
              <Typography sx={sx.caption}>{t(`buttonReference.${reference.spec.behavior}`)}</Typography>
            </Box>
            <Typography
              component="h3"
              sx={sx.cardTitle}
            >
              {t(`buttonReference.${reference.spec.surface}`)}
            </Typography>
            <Box sx={sx.cardSamples}>
              <Box sx={sx.sampleWithLabel}>
                <ReferenceButton
                  spec={reference.spec}
                  selected={false}
                />
                <Typography sx={sx.caption}>
                  {t(`buttonReference.${reference.spec.behavior === 'toggle' ? 'off' : 'rest'}`)}
                </Typography>
              </Box>
              {reference.spec.behavior === 'toggle' && (
                <Box sx={sx.sampleWithLabel}>
                  <ReferenceButton
                    spec={reference.spec}
                    selected
                  />
                  <Typography sx={sx.caption}>{t('buttonReference.on')}</Typography>
                </Box>
              )}
            </Box>
            <Divider />
            <Button
              size="small"
              sx={{ alignSelf: 'flex-start' }}
              onClick={() => {
                setSpec(reference.spec);
                setCopied(false);
                document.getElementById('root')?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              {t('buttonReference.inspect', { id: reference.id })}
            </Button>
          </Box>
        ))}
      </Box>

      <Box sx={sx.sectionHeading}>
        <Typography
          component="h2"
          sx={sx.sectionTitle}
        >
          {t('buttonReference.sizes')}
        </Typography>
        <Typography sx={sx.help}>{t('buttonReference.sizesHelp')}</Typography>
      </Box>
      <Box sx={sx.sizeGrid}>
        {(['small', 'medium', 'large'] as const).map((size) => (
          <Box
            key={size}
            sx={sx.stateCell}
          >
            <Box sx={sx.stateSample}>
              <ReferenceButton
                spec={{ ...spec, size }}
                selected={selected}
              />
            </Box>
            <Typography sx={sx.cardTitle}>{t(`buttonReference.${size}`)}</Typography>
            <Typography sx={sx.help}>
              {t('buttonReference.sizeDimensions', {
                height: BUTTON_METRICS[size].height,
                padding: BUTTON_METRICS[size].padding,
                font: BUTTON_METRICS[size].font
              })}
            </Typography>
          </Box>
        ))}
      </Box>
      <Typography sx={sx.footer}>{t('buttonReference.footer')}</Typography>
    </Box>
  );
};

const sx = {
  page: { maxWidth: 1200, margin: '0 auto', padding: { xs: '24px 16px 48px', md: '40px 40px 64px' } },
  header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '24px', flexWrap: 'wrap' },
  headerActions: { display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' },
  eyebrow: { fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', color: 'text.secondary' },
  title: { fontSize: { xs: '30px', md: '38px' }, fontWeight: 700, letterSpacing: '-0.035em', marginTop: '6px' },
  intro: { maxWidth: 760, color: 'text.secondary', fontSize: '15px', lineHeight: 1.7, margin: '16px 0 28px' },
  explorer: {
    display: 'grid',
    gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
    border: '1px solid',
    borderColor: 'divider',
    borderRadius: '12px',
    overflow: 'hidden'
  },
  configuration: { padding: { xs: '22px', md: '28px' }, backgroundColor: 'background.settingsPanel' },
  sectionTitle: { fontSize: '20px', fontWeight: 700, letterSpacing: '-0.02em' },
  help: { fontSize: '12px', color: 'text.secondary', lineHeight: 1.6 },
  selectors: { display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '20px 12px', marginTop: '24px' },
  definition: { borderTop: '1px solid', borderColor: 'divider', marginTop: '24px', paddingTop: '18px' },
  specName: { fontSize: '14px', fontWeight: 600, margin: '8px 0' },
  preview: {
    backgroundColor: 'background.paper',
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    minHeight: 350
  },
  previewHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  previewStage: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '20px',
    padding: '40px 0'
  },
  previewHint: { color: 'text.secondary', fontSize: '12px' },
  previewFooter: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: '8px'
  },
  sectionHeading: { margin: '36px 0 16px' },
  stateGrid: {
    display: 'grid',
    gridTemplateColumns: { xs: 'repeat(2, minmax(0, 1fr))', md: 'repeat(4, minmax(0, 1fr))' },
    gap: '1px',
    backgroundColor: 'divider',
    border: '1px solid',
    borderColor: 'divider',
    borderRadius: '10px',
    overflow: 'hidden'
  },
  stateCell: { padding: '20px 12px', textAlign: 'center', backgroundColor: 'background.settingsPanel' },
  stateSample: { minHeight: 68, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  caption: { fontSize: '11px', color: 'text.secondary' },
  catalogue: {
    display: 'grid',
    gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))', lg: 'repeat(4, minmax(0, 1fr))' },
    gap: '12px'
  },
  card: {
    display: 'flex',
    flexDirection: 'column',
    padding: '16px',
    border: '1px solid',
    borderColor: 'divider',
    borderRadius: '10px',
    backgroundColor: 'background.settingsPanel',
    gap: '12px'
  },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  referenceId: { color: 'primary.main', fontSize: '11px', fontWeight: 700, letterSpacing: '0.05em' },
  cardTitle: { fontSize: '15px', fontWeight: 600 },
  cardSamples: {
    display: 'flex',
    justifyContent: 'center',
    gap: '12px',
    flexWrap: 'wrap',
    minHeight: 84,
    alignItems: 'center'
  },
  sampleWithLabel: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' },
  sizeGrid: {
    display: 'grid',
    gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, minmax(0, 1fr))' },
    border: '1px solid',
    borderColor: 'divider',
    borderRadius: '10px',
    overflow: 'hidden'
  },
  footer: { marginTop: '32px', color: 'text.secondary', fontSize: '12px', lineHeight: 1.7 }
};
