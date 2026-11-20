import { alpha, Box, IconButton, Menu, MenuItem, Theme, Tooltip, Typography, useTheme } from '@mui/material';
import { Language, LinkedIn, GitHub, X, Email, MenuBook } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { socialLinks } from '../../config/socialLinks';
import { useState } from 'react';

type SocialsIconEntry = {
  title: string;
  link: string;
  icon: React.ReactNode;
};

export const SocialIcons = () => {
  const theme = useTheme();
  const { t } = useTranslation();
  const sx = styles(theme);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const closeMenu = () => {
    setAnchorEl(null);
  };

  const socialsData: SocialsIconEntry[] = [
    {
      title: t('socialLinks.website'),
      link: socialLinks.website,
      icon: <Language />
    },
    {
      title: t('socialLinks.linkedin'),
      link: socialLinks.linkedin,
      icon: <LinkedIn />
    },
    {
      title: t('socialLinks.x'),
      link: socialLinks.x,
      icon: <X />
    },
    {
      title: t('socialLinks.github'),
      link: socialLinks.github,
      icon: <GitHub />
    },
    {
      title: t('socialLinks.email'),
      link: socialLinks.email,
      icon: <Email />
    },
    {
      title: t('socialLinks.documentation'),
      link: socialLinks.docs,
      icon: <MenuBook />
    }
  ];

  return (
    <Box>
      <Tooltip title={t('socialLinks.title')}>
        <IconButton
          sx={{ ...sx.triggerButton, ...(anchorEl ? sx.triggerButtonOpen : {}) }}
          onClick={(event) => setAnchorEl(event.currentTarget)}
        >
          <Box sx={sx.iconStack}>
            <Box sx={sx.stackBadge}>
              <Language />
            </Box>
            <Box sx={sx.stackBadge}>
              <LinkedIn />
            </Box>
            <Box sx={sx.stackBadge}>
              <GitHub />
            </Box>
          </Box>
        </IconButton>
      </Tooltip>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={closeMenu}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        sx={sx.menu}
      >
        {socialsData.map((entry) => (
          <MenuItem
            key={entry.link}
            component="a"
            href={entry.link}
            target="_blank"
            rel="noopener noreferrer"
            onClick={closeMenu}
            sx={sx.menuItem}
          >
            <Box sx={sx.menuIcon}>{entry.icon}</Box>
            <Typography sx={sx.menuTitle}>{entry.title}</Typography>
          </MenuItem>
        ))}
      </Menu>
    </Box>
  );
};

const styles = (theme: Theme) => ({
  triggerButton: {
    padding: '8px',
    '&:hover': {
      backgroundColor: 'transparent'
    }
  },
  triggerButtonOpen: {
    backgroundColor: alpha(theme.palette.gx.primary.white, 0.12)
  },
  iconStack: {
    display: 'flex',
    alignItems: 'center',
    paddingInline: '2px',
    '& > :not(:first-of-type)': {
      marginLeft: '-10px'
    },
    '& > :nth-of-type(1)': {
      zIndex: 1,
      transform: 'translateY(2px) rotate(-8deg)'
    },
    '& > :nth-of-type(1) .MuiSvgIcon-root': {
      transform: 'rotate(8deg)'
    },
    '& > :nth-of-type(2)': {
      zIndex: 2,
      transform: 'translateY(-2px)'
    },
    '& > :nth-of-type(3)': {
      zIndex: 3,
      transform: 'translateY(2px) rotate(8deg)'
    },
    '& > :nth-of-type(3) .MuiSvgIcon-root': {
      transform: 'rotate(-8deg)'
    }
  },
  stackBadge: {
    width: '26px',
    height: '26px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    boxSizing: 'border-box',
    borderRadius: '6px',
    border: `2px solid ${theme.palette.gx.darkGrey[300]}`,
    backgroundColor: theme.palette.gx.darkGrey[500],
    color: theme.palette.gx.lightGrey[500],
    '& .MuiSvgIcon-root': {
      fontSize: '18px'
    }
  },
  menu: {
    '& .MuiPaper-root': {
      minWidth: '190px',
      marginTop: '8px',
      background: theme.palette.gx.darkGrey[300],
      backgroundImage: 'none',
      border: `1px solid ${alpha(theme.palette.gx.primary.white, 0.12)}`,
      borderRadius: '8px',
      boxShadow: `0 12px 28px ${alpha(theme.palette.gx.primary.black, 0.35)}`
    },
    '& .MuiList-root': {
      padding: '6px'
    }
  },
  menuItem: {
    gap: '12px',
    minHeight: '40px',
    padding: '8px 12px',
    borderRadius: '6px',
    color: theme.palette.gx.lightGrey[500],
    '&:hover': {
      color: theme.palette.gx.lightGrey[300],
      backgroundColor: alpha(theme.palette.gx.primary.white, 0.08)
    }
  },
  menuIcon: {
    display: 'flex',
    '& .MuiSvgIcon-root': {
      color: 'inherit',
      fontSize: '20px'
    }
  },
  menuTitle: {
    color: 'inherit',
    fontSize: '14px',
    fontWeight: 600
  }
});
