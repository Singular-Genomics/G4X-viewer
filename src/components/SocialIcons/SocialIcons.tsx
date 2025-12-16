import { alpha, Box, IconButton, Theme, Tooltip, useTheme } from '@mui/material';
import { Language, LinkedIn, GitHub, X, Email, MenuBook } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { socialLinks } from '../../config/socialLinks';

type SocialsIconEntry = {
  title: string;
  link: string;
  icon: React.ReactNode;
};

export const SocialIcons = () => {
  const theme = useTheme();
  const { t } = useTranslation();
  const sx = styles(theme);

  const socialsData: SocialsIconEntry[] = [
    {
      title: t('socialLinks.website'),
      link: socialLinks.website,
      icon: <Language sx={sx.icon} />
    },
    {
      title: t('socialLinks.linkedin'),
      link: socialLinks.linkedin,
      icon: <LinkedIn sx={sx.icon} />
    },
    {
      title: t('socialLinks.x'),
      link: socialLinks.x,
      icon: <X sx={sx.icon} />
    },
    {
      title: t('socialLinks.github'),
      link: socialLinks.github,
      icon: <GitHub sx={sx.icon} />
    },
    {
      title: t('socialLinks.email'),
      link: socialLinks.email,
      icon: <Email sx={sx.icon} />
    },
    {
      title: t('socialLinks.documentation'),
      link: socialLinks.docs,
      icon: <MenuBook sx={sx.icon} />
    }
  ];

  return (
    <Box sx={sx.socialIconsContainer}>
      {socialsData.map((entry) => (
        <Tooltip
          title={entry.title}
          arrow
        >
          <IconButton
            sx={sx.iconButton}
            href={socialLinks.website}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={entry.title}
          >
            {entry.icon}
          </IconButton>
        </Tooltip>
      ))}
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
