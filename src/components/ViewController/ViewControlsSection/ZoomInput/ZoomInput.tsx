import { InputBase, Theme } from '@mui/material';
import { useState, useCallback } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useViewerStore } from '../../../../stores/ViewerStore/ViewerStore';
import { makeBoundingBox } from '../../../ScaleBar/utils';
import { useTranslation } from 'react-i18next';

export const ZoomInput = () => {
  const { t } = useTranslation();

  const viewState = useViewerStore(useShallow((store) => store.viewState));
  const physicalSize = useViewerStore((store) => store.physicalSize);
  const [inputValue, setInputValue] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  const boundingBox = viewState ? makeBoundingBox(viewState) : null;
  const viewLength = boundingBox ? boundingBox[2][0] - boundingBox[0][0] : 0;
  const barLength = viewLength * 0.05;

  const size = physicalSize?.size ?? 1;

  const displayNumber = (barLength * size).toPrecision(5);
  const numericValue = parseFloat(displayNumber);
  const formattedNumber = numericValue.toFixed(1);

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

  return (
    <InputBase
      value={!viewState || !physicalSize ? '--' : isEditing ? inputValue : formattedNumber}
      disabled={!viewState || !physicalSize}
      onChange={handleInputChange}
      onFocus={handleInputFocus}
      onBlur={handleInputBlur}
      onKeyDown={handleKeyPress}
      fullWidth
      inputProps={{ 'aria-label': t('viewSettings.scale') }}
      sx={sx.input}
    />
  );
};

const sx = {
  input: {
    height: '28px',
    minWidth: 0,
    fontSize: '14px',
    borderRadius: '6px',
    backgroundColor: 'background.paper',
    '& .MuiInputBase-input': {
      textAlign: 'left',
      padding: '2px 10px'
    },
    '&.Mui-focused': {
      boxShadow: (theme: Theme) => `inset 0 -2px 0 ${theme.palette.primary.main}`
    }
  }
};
