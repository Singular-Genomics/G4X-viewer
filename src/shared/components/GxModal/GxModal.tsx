import { useCallback, useMemo, useRef } from 'react';
import { GxModalProps } from './GxModal.types';
import { alpha, Box, Button, FormControlLabel, IconButton, Modal, Theme, Typography, useTheme } from '@mui/material';
import { GxCheckbox } from '../GxCheckbox';
import WarningRoundedIcon from '@mui/icons-material/WarningRounded';
import ReportRoundedIcon from '@mui/icons-material/ReportRounded';
import InfoIcon from '@mui/icons-material/Info';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import { useTranslation } from 'react-i18next';

export const GxModal = ({
  isOpen,
  onContinue,
  onClose,
  title,
  size = 'default',
  children,
  colorVariant = 'singular',
  iconVariant = 'info',
  dontShowFlag,
  hideCancel = false,
  continueText
}: GxModalProps) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const sx = styles(theme, size);
  const stylesVariant = colorVariants[colorVariant as keyof typeof colorVariants];

  const modalIcon = useMemo(() => {
    switch (iconVariant) {
      case 'danger':
        return <WarningRoundedIcon sx={sx.modalIcon} />;
      case 'warning':
        return <ReportRoundedIcon sx={sx.modalIcon} />;
      case 'info':
        return <InfoIcon sx={sx.modalIcon} />;
    }
  }, [iconVariant, sx]);

  const checkboxRef = useRef<HTMLInputElement>(null);

  const handleContinue = useCallback(() => {
    if (checkboxRef.current?.checked && dontShowFlag) {
      localStorage.setItem(dontShowFlag, 'true');
    }
    onContinue?.();
  }, [onContinue, dontShowFlag]);

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      slotProps={{
        backdrop: {
          sx: sx.backdrop
        }
      }}
    >
      <Box sx={sx.modalContainer}>
        <Box sx={{ ...sx.headerWrapper, ...stylesVariant.banner }}>
          <Box sx={sx.iconWrapper}>{modalIcon}</Box>
          <Typography sx={sx.modalTitle}>{title}</Typography>
          {onClose && (
            <IconButton
              onClick={onClose}
              sx={sx.closeButton}
              aria-label={t('general.close')}
            >
              <CloseRoundedIcon />
            </IconButton>
          )}
        </Box>
        <Box sx={sx.modalContentWrapper}>
          <Box sx={sx.modalBody}>{children}</Box>
          <Box sx={sx.modalButtonsWrapper}>
            {onContinue && (
              <Button
                variant="contained"
                sx={{
                  ...sx.modalButtonBase,
                  ...sx.continueButton,
                  ...stylesVariant.button
                }}
                onClick={handleContinue}
              >
                {continueText ?? t('general.confirm')}
              </Button>
            )}
            {!hideCancel && (
              <Button
                variant="outlined"
                sx={{ ...sx.modalButtonBase, ...sx.cancelButton }}
                onClick={onClose}
              >
                {t('general.cancel')}
              </Button>
            )}
          </Box>

          {dontShowFlag && (
            <FormControlLabel
              sx={sx.checkboxWrapper}
              label={t('general.dontAskAgain')}
              control={
                <GxCheckbox
                  slotProps={{
                    input: {
                      ref: checkboxRef
                    }
                  }}
                />
              }
            />
          )}
        </Box>
      </Box>
    </Modal>
  );
};

const styles = (theme: Theme, size: string) => {
  // Base styles for all sizes
  const baseStyles = {
    backdrop: {
      backgroundColor: alpha(theme.palette.gx.primary.black, 0.58),
      backdropFilter: 'blur(3px)'
    },
    modalContainer: {
      width: { xs: '90vw', sm: 'fit-content' },
      maxWidth: '90vw',
      maxHeight: '90vh',
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      display: 'flex',
      flexDirection: 'column',
      borderRadius: '14px',
      border: `1px solid ${alpha(theme.palette.divider, 0.45)}`,
      backgroundColor: theme.palette.background.paper,
      boxShadow: `0 24px 64px ${alpha(theme.palette.gx.primary.black, 0.32)}`,
      overflow: 'hidden',
      outline: 'none'
    },
    headerWrapper: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      minHeight: '60px',
      padding: '12px 16px 12px 20px',
      flexShrink: 0
    },
    iconWrapper: {
      width: '36px',
      height: '36px',
      display: 'grid',
      placeItems: 'center',
      flexShrink: 0,
      borderRadius: '10px',
      color: theme.palette.gx.primary.white,
      backgroundColor: alpha(theme.palette.gx.primary.white, 0.14),
      border: `1px solid ${alpha(theme.palette.gx.primary.white, 0.18)}`
    },
    closeButton: {
      marginLeft: 'auto',
      color: theme.palette.gx.primary.white,
      '&:hover': {
        backgroundColor: alpha(theme.palette.gx.primary.white, 0.14)
      }
    },
    modalContentWrapper: {
      minHeight: 0,
      padding: { xs: '20px', sm: '24px' },
      overflowY: 'auto',
      backgroundColor: theme.palette.background.paper,
      color: theme.palette.text.primary
    },
    modalBody: {
      '& > :first-of-type': {
        marginTop: 0
      },
      '& > :last-child': {
        marginBottom: 0
      }
    },
    modalButtonsWrapper: {
      display: 'flex',
      flexDirection: 'row-reverse',
      justifyContent: 'flex-start',
      alignItems: 'center',
      gap: '10px',
      marginTop: '32px'
    },
    modalButtonBase: {
      minHeight: '38px',
      minWidth: '104px',
      borderRadius: '8px',
      padding: '6px 20px',
      fontWeight: 700,
      textTransform: 'none',
      transition: 'transform 160ms ease, box-shadow 160ms ease, background-color 160ms ease',
      '&:hover': {
        transform: 'translateY(-1px)'
      }
    },
    continueButton: {
      color: theme.palette.gx.primary.white,
      boxShadow: `0 6px 16px ${alpha(theme.palette.gx.primary.black, 0.18)}`,
      '&:hover': {
        boxShadow: `0 8px 20px ${alpha(theme.palette.gx.primary.black, 0.24)}`
      }
    },
    cancelButton: {
      color: theme.palette.text.primary,
      borderColor: alpha(theme.palette.text.primary, 0.32),
      '&:hover': {
        borderColor: alpha(theme.palette.text.primary, 0.56),
        backgroundColor: alpha(theme.palette.text.primary, 0.04)
      }
    },
    checkboxWrapper: {
      width: '100%',
      margin: '20px 0 0',
      paddingTop: '12px',
      borderTop: `1px solid ${alpha(theme.palette.divider, 0.4)}`,
      color: theme.palette.text.secondary,
      '& .MuiFormControlLabel-label': {
        fontSize: '0.875rem'
      }
    }
  };

  // Size-specific styles
  if (size === 'small') {
    return {
      ...baseStyles,
      modalIcon: {
        height: '22px',
        width: '22px'
      },
      modalTitle: {
        fontSize: '18px',
        lineHeight: 1.3,
        fontWeight: 700,
        color: theme.palette.gx.primary.white,
        letterSpacing: '0.01em'
      },
      modalButtonBase: {
        ...baseStyles.modalButtonBase,
        minWidth: '96px'
      }
    };
  }

  // Default size styles
  return {
    ...baseStyles,
    modalIcon: {
      height: '24px',
      width: '24px'
    },
    modalTitle: {
      fontSize: '22px',
      lineHeight: 1.3,
      fontWeight: 700,
      color: theme.palette.gx.primary.white,
      letterSpacing: '0.01em'
    }
  };
};

const colorVariants = {
  danger: {
    banner: {
      background: (theme: Theme) => theme.palette.gx.gradients.danger()
    },
    button: {
      background: (theme: Theme) => theme.palette.gx.gradients.danger()
    }
  },
  warning: {
    banner: {
      background: (theme: Theme) => theme.palette.gx.gradients.warning()
    },
    button: {
      background: (theme: Theme) => theme.palette.gx.gradients.warning()
    }
  },
  info: {
    banner: {
      background: (theme: Theme) => theme.palette.gx.gradients.info()
    },
    button: {
      background: (theme: Theme) => theme.palette.gx.gradients.info()
    }
  },
  singular: {
    banner: {
      background: (theme: Theme) => theme.palette.gx.gradients.brand()
    },
    button: {
      background: (theme: Theme) => theme.palette.gx.gradients.brand()
    }
  }
};
