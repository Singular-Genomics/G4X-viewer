import { Button } from '@mui/material';
import { useDropzone } from '../../../hooks/useDropzone';

export default function DropzoneButton() {
  const { getRootProps, getInputProps } = useDropzone();

  return (
    <Button
      fullWidth
      variant="outlined"
      sx={sx.dropDownButton}
      size="small"
      {...getRootProps()}
    >
      <input {...getInputProps({ accept: '.tif, .tiff' })} />
      Choose a file
    </Button>
  );
}

const sx = {
  dropDownButton: {
    borderStyle: 'dashed',
    width: '100%',
    height: '40px',
    borderColor: 'rgba(0, 177, 164, 1)',
    color: 'rgba(0, 177, 164, 1)',
    '&:hover': {
      borderColor: 'rgba(0, 177, 164, 1)',
      backgroundColor: 'rgba(0, 177, 164, 0.2)',
    }
  }
}
