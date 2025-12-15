import { alpha, Box, IconButton, Theme, Tooltip, useTheme } from '@mui/material';
import { Language, LinkedIn, GitHub, X, Email, MenuBook } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { socialLinks } from '../../config/socialLinks';

export const SocialIcons = () => {
  const theme = useTheme();
  const { t } = useTranslation();
  const sx = styles(theme);

  return (
    <Box sx={sx.socialIconsContainer}>
      <Tooltip
        title={t('socialLinks.website')}
        arrow
      >
        <IconButton
          sx={sx.iconButton}
          href={socialLinks.website}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={t('socialLinks.website')}
        >
          <Language sx={sx.icon} />
        </IconButton>
      </Tooltip>
      <Tooltip
        title={t('socialLinks.linkedin')}
        arrow
      >
        <IconButton
          sx={sx.iconButton}
          href={socialLinks.linkedin}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={t('socialLinks.linkedin')}
        >
          <LinkedIn sx={sx.icon} />
        </IconButton>
      </Tooltip>
      <Tooltip
        title={t('socialLinks.x')}
        arrow
      >
        <IconButton
          sx={sx.iconButton}
          href={socialLinks.x}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={t('socialLinks.x')}
        >
          <X sx={sx.icon} />
        </IconButton>
      </Tooltip>
      <Tooltip
        title={t('socialLinks.github')}
        arrow
      >
        <IconButton
          sx={sx.iconButton}
          href={socialLinks.github}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={t('socialLinks.github')}
        >
          <GitHub sx={sx.icon} />
        </IconButton>
      </Tooltip>
      <Tooltip
        title={t('socialLinks.email')}
        arrow
      >
        <IconButton
          sx={sx.iconButton}
          href={socialLinks.email}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={t('socialLinks.email')}
        >
          <Email sx={sx.icon} />
        </IconButton>
      </Tooltip>
      <Tooltip
        title={t('socialLinks.documentation')}
        arrow
      >
        <IconButton
          sx={sx.iconButton}
          href={socialLinks.docs}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={t('socialLinks.documentation')}
        >
          <MenuBook sx={sx.icon} />
        </IconButton>
      </Tooltip>
    </Box>
  );
};

const styles = (theme: Theme) => ({
  socialIconsContainer: {
    display: 'flex',
    justifyContent: 'center',
    gap: '10px',
    padding: '5px'
  },
  iconButton: {
    padding: '6px',
    '&:hover': {
      backgroundColor: alpha(theme.palette.gx.primary.white, 0.1)
    }
  },
  icon: {
    color: theme.palette.gx.lightGrey[500],
    fontSize: '20px',
    transition: 'color 0.3s ease',
    '.MuiIconButton-root:hover &': {
      color: theme.palette.gx.lightGrey[300]
    }
  }
});
