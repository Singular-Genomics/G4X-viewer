import { useState, type MouseEvent } from 'react';
import { Box, Button, FormControlLabel, MenuItem, Slider, Switch, TextField, Typography } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AddIcon from '@mui/icons-material/Add';
import TuneIcon from '@mui/icons-material/Tune';
import LayersIcon from '@mui/icons-material/Layers';
import { useTranslation } from 'react-i18next';
import { ColorDraft, ColorElement, resolveElementColor } from './colorReference';

export const ColorReferencePreview = ({
  draft,
  activeElement,
  onSelect
}: {
  draft: ColorDraft;
  activeElement: ColorElement;
  onSelect: (element: ColorElement) => void;
}) => {
  const { t } = useTranslation();
  const [inspect, setInspect] = useState(true);
  const [enabled, setEnabled] = useState(true);
  const [opacity, setOpacity] = useState(70);
  const [expanded, setExpanded] = useState(true);
  const c = (element: ColorElement) => resolveElementColor(draft, element);
  const target = (element: ColorElement) => ({ 'data-color-element': element });
  const pick = (event: MouseEvent<HTMLDivElement>) => {
    if (!inspect || !(event.target instanceof Element)) return;
    const element = event.target.closest<HTMLElement>('[data-color-element]')?.dataset.colorElement as
      | ColorElement
      | undefined;
    if (element) {
      event.preventDefault();
      event.stopPropagation();
      onSelect(element);
    }
  };
  const border = `1px solid ${c('border')}`;
  const text = { color: c('primaryText') };
  const outlineButton = {
    border,
    borderColor: enabled ? c('accent') : c('border'),
    color: enabled ? c('accent') : c('secondaryText'),
    backgroundColor: c('controlSurface'),
    borderRadius: '6px',
    textTransform: 'none',
    fontWeight: 600,
    '&:hover': { backgroundColor: c('controlSurface') }
  };

  return (
    <Box>
      <Box sx={sx.previewHeading}>
        <Box>
          <Typography sx={{ fontWeight: 700 }}>{t('colorReference.preview')}</Typography>
          <Typography sx={sx.hint}>{t('colorReference.previewHelp')}</Typography>
        </Box>
        <FormControlLabel
          label={t('colorReference.inspect')}
          control={
            <Switch
              size="small"
              checked={inspect}
              onChange={(event) => setInspect(event.target.checked)}
            />
          }
        />
      </Box>
      <Box
        onClickCapture={pick}
        onPointerDownCapture={pick}
        sx={{
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: '10px',
          overflow: 'hidden',
          ...(inspect && {
            [`& [data-color-element="${activeElement}"]`]: {
              outline: '2px dashed',
              outlineColor: 'primary.main',
              outlineOffset: '-3px'
            },
            '& [data-color-element]': { cursor: 'crosshair' }
          })
        }}
      >
        <Box
          {...target('topBar')}
          sx={{
            backgroundColor: c('topBar'),
            padding: '14px 18px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <Typography
            {...target('primaryText')}
            sx={{ ...text, fontWeight: 700, fontSize: '16px' }}
          >
            G4X Viewer
          </Typography>
          <Box sx={{ display: 'flex', gap: '8px' }}>
            <Button
              {...target('accent')}
              size="small"
              sx={{ color: c('accent'), fontWeight: 700 }}
            >
              {t('colorReference.viewer')}
            </Button>
            <Button
              size="small"
              sx={{ color: c('secondaryText') }}
            >
              {t('colorReference.dashboard')}
            </Button>
          </Box>
        </Box>
        <Box
          sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: 'minmax(140px, 0.7fr) minmax(300px, 1fr)' } }}
        >
          <Box
            {...target('viewport')}
            sx={{
              backgroundColor: c('viewport'),
              position: 'relative',
              minHeight: { xs: 220, lg: 510 },
              overflow: 'hidden'
            }}
          >
            <Box
              aria-hidden
              sx={{
                position: 'absolute',
                inset: '25% 10%',
                opacity: 0.7,
                background:
                  'radial-gradient(ellipse at 25% 30%, #3e887855, transparent 50%), radial-gradient(ellipse at 70% 65%, #6358a855, transparent 45%)',
                filter: 'blur(12px)'
              }}
            />
            <Box
              {...target('statusBubble')}
              sx={{
                position: 'relative',
                margin: '14px',
                padding: '10px',
                width: 'fit-content',
                borderRadius: '6px',
                backgroundColor: c('statusBubble'),
                display: 'flex',
                gap: '8px',
                alignItems: 'center'
              }}
            >
              <Box
                {...target('accentText')}
                sx={{
                  backgroundColor: c('accent'),
                  color: c('accentText'),
                  padding: '1px 6px',
                  borderRadius: '4px',
                  fontSize: '12px'
                }}
              >
                2
              </Box>
              <Typography sx={{ ...text, fontSize: '12px', fontWeight: 600 }}>
                {t('colorReference.hiddenLayers')}
              </Typography>
              <ExpandMoreIcon sx={{ color: c('secondaryText'), fontSize: 18 }} />
            </Box>
            <Box
              sx={{
                position: 'absolute',
                bottom: 14,
                left: 14,
                padding: '6px 10px',
                borderRadius: '6px',
                backgroundColor: c('statusBubble'),
                ...text,
                fontSize: '12px'
              }}
            >
              ├─────┤ 100 µm
            </Box>
          </Box>
          <Box
            {...target('settingsPanel')}
            sx={{ backgroundColor: c('settingsPanel'), padding: '14px', minWidth: 0 }}
          >
            <Box
              {...target('sectionHeader')}
              onClick={() => setExpanded((value) => !value)}
              role="button"
              tabIndex={0}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  if (!inspect) setExpanded((value) => !value);
                }
              }}
              aria-expanded={expanded}
              sx={{
                backgroundColor: c('sectionHeader'),
                borderRadius: '6px',
                padding: '10px',
                display: 'flex',
                gap: '8px',
                alignItems: 'center'
              }}
            >
              <LayersIcon sx={{ ...text, fontSize: 20 }} />
              <Typography sx={{ ...text, fontSize: '16px', fontWeight: 700, flex: 1 }}>
                {t('colorReference.multiChannel')}
              </Typography>
              <ExpandMoreIcon sx={{ color: c('secondaryText'), transform: expanded ? 'rotate(180deg)' : 'none' }} />
            </Box>
            {expanded && (
              <Box sx={{ paddingTop: '16px' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '18px' }}>
                  <Button
                    {...target('accent')}
                    aria-pressed={enabled}
                    onClick={() => setEnabled((value) => !value)}
                    size="small"
                    sx={outlineButton}
                  >
                    fH&E
                  </Button>
                  <Slider
                    {...target('accent')}
                    aria-label={t('colorReference.opacity')}
                    value={opacity}
                    onChange={(_, value) => setOpacity(value as number)}
                    size="small"
                    sx={{
                      color: c('accent'),
                      flex: 1,
                      minWidth: 0,
                      marginInline: '4px',
                      '& .MuiSlider-thumb': { width: 4, height: 16, borderRadius: '3px' }
                    }}
                  />
                  <Box
                    {...target('valueField')}
                    sx={{
                      backgroundColor: c('valueField'),
                      color: c('primaryText'),
                      borderRadius: '6px',
                      padding: '4px 10px',
                      fontSize: '13px'
                    }}
                  >
                    {opacity}
                  </Box>
                </Box>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '8px',
                    marginBottom: '10px'
                  }}
                >
                  <Typography sx={{ ...text, fontSize: '14px', fontWeight: 700 }}>
                    {t('colorReference.channelControls')}
                  </Typography>
                  <Button
                    {...target('border')}
                    startIcon={<AddIcon />}
                    size="small"
                    sx={{ ...outlineButton, whiteSpace: 'nowrap', minWidth: 0 }}
                  >
                    {t('colorReference.add')}
                  </Button>
                </Box>
                <Box
                  {...target('controlSurface')}
                  sx={{
                    backgroundColor: c('controlSurface'),
                    borderRadius: '6px',
                    padding: '12px',
                    marginBottom: '16px'
                  }}
                >
                  <Typography
                    {...target('primaryText')}
                    sx={{ ...text, fontSize: '13px', fontWeight: 600 }}
                  >
                    DAPI
                  </Typography>
                  <Typography
                    {...target('secondaryText')}
                    sx={{ color: c('secondaryText'), fontSize: '12px', margin: '4px 0 12px' }}
                  >
                    {t('colorReference.channelHint')}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Box
                      {...target('valueField')}
                      sx={{
                        backgroundColor: c('valueField'),
                        color: c('primaryText'),
                        padding: '3px 8px',
                        borderRadius: '4px',
                        fontSize: '12px'
                      }}
                    >
                      0
                    </Box>
                    <Box
                      {...target('accent')}
                      sx={{
                        height: 3,
                        flex: 1,
                        backgroundColor: c('accent'),
                        position: 'relative',
                        '&::after': {
                          content: '""',
                          position: 'absolute',
                          right: '20%',
                          top: -6,
                          width: 4,
                          height: 15,
                          borderRadius: '3px',
                          backgroundColor: c('accent')
                        }
                      }}
                    />
                    <Box sx={{ color: c('primaryText'), fontSize: '12px' }}>4095</Box>
                  </Box>
                </Box>
                <Box
                  {...target('sectionHeader')}
                  sx={{
                    backgroundColor: c('sectionHeader'),
                    borderRadius: '6px',
                    padding: '8px',
                    marginLeft: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <TuneIcon sx={{ ...text, fontSize: 18 }} />
                  <Typography sx={{ ...text, fontSize: '14px', fontWeight: 700 }}>
                    {t('colorReference.advanced')}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '14px 0 18px 12px' }}>
                  <Typography sx={{ ...text, fontSize: '12px', flex: 1 }}>{t('colorReference.colorMode')}</Typography>
                  <TextField
                    {...target('controlSurface')}
                    select
                    size="small"
                    value="additive"
                    slotProps={{ htmlInput: { 'aria-label': t('colorReference.colorMode') } }}
                    sx={{
                      width: 126,
                      '& .MuiInputBase-root': {
                        height: 32,
                        borderRadius: '6px',
                        backgroundColor: c('controlSurface'),
                        color: c('primaryText'),
                        fontSize: '12px'
                      },
                      '& fieldset': { borderColor: c('border') },
                      '& .MuiSelect-icon': { color: c('secondaryText') }
                    }}
                  >
                    <MenuItem value="additive">{t('colorReference.additive')}</MenuItem>
                  </TextField>
                </Box>
                <Box
                  {...target('separator')}
                  sx={{ height: 3, width: '90%', margin: '0 auto', backgroundColor: c('separator') }}
                />
              </Box>
            )}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};
const sx = {
  previewHeading: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '12px',
    flexWrap: 'wrap',
    marginBottom: '12px'
  },
  hint: { fontSize: '12px', color: 'text.secondary', marginTop: '4px' }
};
