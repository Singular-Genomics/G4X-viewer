import { Box, Typography } from '@mui/material';
import { useState, useCallback } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useViewerStore } from '../../../../stores/ViewerStore/ViewerStore';
import { useChannelsStore } from '../../../../stores/ChannelsStore';
import { GxInput } from '../../../../shared/components/GxInput';
import { makeBoundingBox } from '../../../ScaleBar/utils';
import { useTranslation } from 'react-i18next';

export const ZoomInput = () => {
  const sx = styles();
  const { t } = useTranslation();

  const viewState = useViewerStore(useShallow((store) => store.viewState));
  const getLoader = useChannelsStore((store) => store.getLoader);
  const [inputValue, setInputValue] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  const loader = getLoader();
  const physicalSize = loader[0]?.meta?.physicalSizes?.x;

  const boundingBox = viewState ? makeBoundingBox(viewState) : null;
  const viewLength = boundingBox ? boundingBox[2][0] - boundingBox[0][0] : 0;
  const barLength = viewLength * 0.05;

  const unit = physicalSize?.unit || 'μm';
  const size = physicalSize?.size || 1;

  const displayNumber = (barLength * size).toPrecision(5);
  const numericValue = parseFloat(displayNumber);
  const formattedNumber = numericValue.toFixed(1);
  const displayValue = `${formattedNumber} ${unit}`;

  const handleInputChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
  }, []);

  const handleInputFocus = useCallback(() => {
    setIsEditing(true);
    setInputValue(formattedNumber);
  }, [formattedNumber]);

  const handleInputBlur = useCallback(() => {
    setIsEditing(false);
    const inputNumericValue = parseFloat(inputValue);

    if (!isNaN(inputNumericValue) && inputNumericValue > 0 && physicalSize && viewState) {
      const targetBarLength = inputNumericValue / size;
      const targetViewLength = targetBarLength / 0.05;
      const currentViewLength = viewLength;
      const zoomFactor = currentViewLength / targetViewLength;
      const newZoom = viewState.zoom + Math.log2(zoomFactor);
      const clampedZoom = Math.max(-10, Math.min(10, newZoom));

      useViewerStore.setState({
        viewState: {
          ...viewState,
          zoom: clampedZoom
        }
      });
    }
    setInputValue('');
  }, [inputValue, viewState, physicalSize, size, viewLength]);

  const handleKeyPress = useCallback((event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      (event.target as HTMLInputElement).blur();
    }
  }, []);

  if (!viewState || !physicalSize) return null;

  return (
    <Box sx={sx.container}>
      <Typography sx={sx.label}>{t('viewSettings.scale')}</Typography>
      <Box sx={sx.inputContainer}>
        <GxInput
          value={isEditing ? inputValue : displayValue}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          onKeyPress={handleKeyPress}
          size="small"
          sx={sx.input}
        />
      </Box>
    </Box>
  );
};

const styles = () => ({
  container: {
    display: 'flex',
    flexDirection: 'row' as const,
    alignItems: 'center',
    gap: '8px',
    paddingLeft: '8px',
    paddingRight: '8px'
  },
  label: {
    fontWeight: 500,
    minWidth: '80px'
  },
  inputContainer: {
    flex: 1,
    maxWidth: '120px'
  },
  input: {
    '& .MuiOutlinedInput-root': {
      height: '32px',
      fontSize: '14px'
    },
    '& .MuiOutlinedInput-input': {
      textAlign: 'center' as const
    }
  }
});
