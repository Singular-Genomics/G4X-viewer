import { Box, Divider, FormControlLabel, Theme, Typography, useTheme } from '@mui/material';
import { GxSwitch } from '../../../shared/components/GxSwitch/GxSwitch';
import { useImageOverlaysStore } from '../../../stores/ImageOverlaysStore';
import { useState } from 'react';
import { GxSlider } from '../../../shared/components/GxSlider';
import { OmeTiffImageSelector } from './OmeTiffImageSelector/OmeTiffImageSelector';
import { useTranslation } from 'react-i18next';

export const ImageOverlaysSection = () => {
  const theme = useTheme();
  const sx = styles(theme);
  const { t } = useTranslation();

  const {
    brightfieldImageSource,
    opacity,
    availableImages,
    setActiveImage,
    omeTiffImageSource,
    omeTiffOpacity,
    availableOmeTiffImages
  } = useImageOverlaysStore();

  const handleHeToggle = () => {
    if (brightfieldImageSource) {
      setActiveImage(null);
    } else if (availableImages.length > 0) {
      setActiveImage(availableImages[0]);
    }
  };

  const [heOpacityValue, setHeOpacityValue] = useState<number>(opacity * 100);
  const [omeTiffOpacityValue, setOmeTiffOpacityValue] = useState<number>(omeTiffOpacity * 100);

  return (
    <Box sx={sx.sectionContainer}>
      <Box>
        <Typography sx={sx.subSectionHeader}>{t('imageOverlays.heSectionTitle')}</Typography>
        <Box sx={sx.subSectionContent}>
          <Box>
            <Typography sx={sx.fieldLabel}>{t('imageOverlays.layerOpacityLabel')}</Typography>
            <Box sx={sx.opacityRow}>
              <Typography>0%</Typography>
              <GxSlider
                value={heOpacityValue}
                onChange={(_, newValue) => {
                  setHeOpacityValue(Array.isArray(newValue) ? newValue[0] : newValue);
                }}
                onChangeCommitted={() =>
                  useImageOverlaysStore.setState({
                    opacity: +(heOpacityValue / 100).toFixed(2)
                  })
                }
                min={0}
                max={100}
                step={1}
                disabled={!brightfieldImageSource}
              />
              <Typography>100%</Typography>
            </Box>
          </Box>
          <FormControlLabel
            control={
              <GxSwitch
                checked={!!brightfieldImageSource}
                onChange={handleHeToggle}
                disabled={availableImages.length === 0}
              />
            }
            label={t('imageOverlays.heLayerVisible')}
          />
        </Box>
      </Box>

      <Divider sx={sx.divider} />

      <Box>
        <Typography sx={sx.subSectionHeader}>{t('imageOverlays.omeTiffSectionTitle')}</Typography>
        <Box sx={sx.subSectionContent}>
          <Box>
            <Typography sx={sx.fieldLabel}>{t('imageOverlays.layerOpacityLabel')}</Typography>
            <Box sx={sx.opacityRow}>
              <Typography>0%</Typography>
              <GxSlider
                value={omeTiffOpacityValue}
                onChange={(_, newValue) => {
                  setOmeTiffOpacityValue(Array.isArray(newValue) ? newValue[0] : newValue);
                }}
                onChangeCommitted={() =>
                  useImageOverlaysStore.setState({
                    omeTiffOpacity: +(omeTiffOpacityValue / 100).toFixed(2)
                  })
                }
                min={0}
                max={100}
                step={1}
                disabled={!omeTiffImageSource}
              />
              <Typography>100%</Typography>
            </Box>
          </Box>
          <Box>
            <Typography sx={sx.fieldLabel}>{t('imageOverlays.availableOmeTiffImages')}</Typography>
            <OmeTiffImageSelector images={availableOmeTiffImages} />
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

const styles = (theme: Theme) => ({
  sectionContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  subSectionHeader: {
    fontWeight: 700,
    fontSize: '15px',
    color: theme.palette.gx.primary.black,
    marginLeft: '8px',
    marginBottom: '12px'
  },
  subSectionContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    paddingLeft: '8px'
  },
  fieldLabel: {
    fontWeight: 700,
    marginLeft: '8px',
    marginBottom: '8px'
  },
  opacityRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '16px',
    marginLeft: '8px'
  },
  divider: {
    borderColor: theme.palette.gx.mediumGrey[300]
  }
});
