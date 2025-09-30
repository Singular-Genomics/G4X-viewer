import { Box, IconButton, Theme, useTheme } from '@mui/material';
import { Language, LinkedIn, GitHub, X, Email } from '@mui/icons-material';
import { socialLinks } from '../../config/socialLinks';

export const SocialIcons = () => {
  const theme = useTheme();
  const sx = styles(theme);

  return (
    <Box sx={sx.socialIconsContainer}>
      <IconButton
        sx={sx.iconButton}
        href={socialLinks.website}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Website"
      >
        <Language sx={sx.icon} />
      </IconButton>
      <IconButton
        sx={sx.iconButton}
        href={socialLinks.linkedin}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="LinkedIn"
      >
        <LinkedIn sx={sx.icon} />
      </IconButton>
      <IconButton
        sx={sx.iconButton}
        href={socialLinks.x}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="X"
      >
        <X sx={sx.icon} />
      </IconButton>
      <IconButton
        sx={sx.iconButton}
        href={socialLinks.github}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="GitHub"
      >
        <GitHub sx={sx.icon} />
      </IconButton>
      <IconButton
        sx={sx.iconButton}
        href={socialLinks.email}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Email"
      >
        <Email sx={sx.icon} />
      </IconButton>
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
      backgroundColor: 'rgba(255, 255, 255, 0.1)'
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
