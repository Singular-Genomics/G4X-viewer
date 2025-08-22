import { Box } from '@mui/material';
import { useViewerStore } from '../../../../stores/ViewerStore';
import { GxDropzoneButton } from '../../../../shared/components/GxDropzoneButton';
import { useGeneralDetailsHandler } from './useGeneralDetailsButtonHandler';
import { useTranslation } from 'react-i18next';

export default function GeneralDetailsDropzoneButton() {
  const { t } = useTranslation();
  const dropzoneProps = useGeneralDetailsHandler();
  const isDisabled = !useViewerStore((store) => store.source?.description);
  const detailsName = useViewerStore((store) => store.generalDetails?.fileName);

  return (
    <Box>
      <GxDropzoneButton
        labelTitle={t('sourceFiles.metadataInputLabel')}
        labelText={detailsName}
        buttonText={t('sourceFiles.metadataUploadButton')}
        disabled={isDisabled}
        {...dropzoneProps}
      />
    </Box>
  );
}
