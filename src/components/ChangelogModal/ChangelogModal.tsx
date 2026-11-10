import { Box, Button, Collapse, Link, SxProps, Theme, Typography, useTheme } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { GxModal } from '../../shared/components/GxModal';
import { socialLinks } from '../../config/socialLinks';
import { ChangelogModalProps, ChangelogModalVersionSectionProps } from './ChangelogModal.types';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useCallback, useRef, useState } from 'react';

const MAX_VISIBLE_ITEMS_PER_SECTION = 5;

const ChangelogModalVersionSection = ({ entry, openByDefault }: ChangelogModalVersionSectionProps) => {
  const theme = useTheme();
  const sx = styles(theme);
  const { t } = useTranslation();

  const sectionRef = useRef<HTMLDivElement>(null);
  const [expanded, setExpanded] = useState<boolean>(!!openByDefault);
  const [showAllItems, setShowAllItems] = useState<boolean>(false);

  const totalItems = entry.sections.reduce((sum, section) => sum + section.items.length, 0);
  const hasHiddenItems = entry.sections.some((section) => section.items.length > MAX_VISIBLE_ITEMS_PER_SECTION);

  const handleIconClick = useCallback(() => {
    setExpanded((previousState) => !previousState);
  }, []);

  const handleToggleShowAll = useCallback(() => {
    setShowAllItems((previousState) => !previousState);
  }, []);

  const handleExpandScroll = useCallback(() => {
    if (sectionRef.current) {
      sectionRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'nearest'
      });
    }
  }, []);

  return (
    <Box>
      <Button
        sx={sx.sectionHeader}
        onClick={handleIconClick}
      >
        <Box sx={sx.versionHeader}>
          <Typography sx={sx.versionLabel}>{entry.version}</Typography>
          <Typography sx={sx.versionDate}>{entry.date}</Typography>
        </Box>
        <ExpandMoreIcon
          style={{
            transform: `rotate(${expanded ? '180deg' : '0deg'})`,
            transition: 'transform 300ms ease-in-out'
          }}
          sx={sx.collapseIcon}
          fontSize="medium"
        />
      </Button>
      <Collapse
        onEntered={handleExpandScroll}
        in={expanded}
        ref={sectionRef}
        timeout="auto"
        unmountOnExit
      >
        {entry.sections.map((section) => {
          const visibleItems = showAllItems ? section.items : section.items.slice(0, MAX_VISIBLE_ITEMS_PER_SECTION);

          return (
            <Box key={section.title}>
              <Typography sx={sx.sectionTitle}>{section.title}</Typography>
              <Box
                component="ul"
                sx={sx.sectionList}
              >
                {visibleItems.map((item) => (
                  <Typography
                    key={item}
                    component="li"
                    sx={sx.sectionItem}
                  >
                    {item}
                  </Typography>
                ))}
              </Box>
            </Box>
          );
        })}
        {hasHiddenItems && (
          <Button
            size="small"
            onClick={handleToggleShowAll}
            sx={sx.showAllButton}
          >
            {showAllItems ? t('changelog.showFewerChanges') : t('changelog.showAllChanges', { total: totalItems })}
          </Button>
        )}
      </Collapse>
    </Box>
  );
};

export const ChangelogModal = ({ isOpen, onClose, entries, showMore }: ChangelogModalProps) => {
  const theme = useTheme();
  const sx = styles(theme);
  const { t } = useTranslation();

  return (
    <GxModal
      isOpen={isOpen}
      onContinue={onClose}
      title={t('changelog.title')}
      continueText={t('changelog.gotIt')}
      colorVariant="singular"
      iconVariant="info"
      size="small"
      hideCancel
    >
      <Box sx={sx.contentWrapper}>
        {entries?.length ? (
          entries.map((entry, index) => (
            <ChangelogModalVersionSection
              key={entry.version}
              entry={entry}
              openByDefault={index === 0}
            />
          ))
        ) : (
          <Typography sx={sx.sectionItem}>{t('changelog.noEntries')}</Typography>
        )}
        {showMore && (
          <Box sx={sx.moreWrapper}>
            <Typography sx={sx.moreTitle}>{t('general.more')}...</Typography>
            <Typography>{t('changelog.moreDescription')}</Typography>
          </Box>
        )}
        <Box sx={sx.linksWrapper}>
          <Typography sx={sx.legacyNote}>{t('changelog.legacyNote')}</Typography>
          <Link
            href={socialLinks.legacy}
            target="_blank"
            rel="noopener noreferrer"
            underline="none"
            sx={sx.link}
          >
            {t('changelog.legacyLinkLabel')}
          </Link>
          <Link
            href={socialLinks.docs}
            target="_blank"
            rel="noopener noreferrer"
            underline="none"
            sx={sx.link}
          >
            {t('changelog.docsLinkLabel')}
          </Link>
          <Link
            href={socialLinks.latestRelease}
            target="_blank"
            rel="noopener noreferrer"
            underline="none"
            sx={sx.link}
          >
            {t('changelog.latestReleaseLinkLabel')}
          </Link>
        </Box>
      </Box>
    </GxModal>
  );
};

const styles = (theme: Theme): Record<string, SxProps> => ({
  contentWrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    minWidth: { md: '500px' },
    maxHeight: '70vh',
    overflowY: 'auto'
  },
  sectionHeader: {
    width: '100%'
  },
  versionHeader: {
    display: 'flex',
    alignItems: 'baseline',
    gap: '8px'
  },
  versionLabel: {
    fontSize: '16px',
    fontWeight: 700,
    color: theme.palette.text.primary
  },
  versionDate: {
    fontSize: '12px',
    color: theme.palette.text.secondary
  },
  sectionTitle: {
    fontSize: '14px',
    fontWeight: 700,
    color: theme.palette.text.primary
  },
  sectionList: {
    margin: '4px 0 0',
    paddingLeft: '24px'
  },
  sectionItem: {
    fontSize: '14px',
    color: theme.palette.text.primary
  },
  linksWrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    paddingTop: '8px',
    borderTop: `1px solid ${theme.palette.gx.mediumGrey[500]}`
  },
  legacyNote: {
    fontSize: '13px',
    color: theme.palette.text.primary
  },
  link: {
    fontSize: '13px',
    color: theme.palette.gx.accent.info,
    width: 'fit-content'
  },
  moreWrapper: {
    borderTop: '1px dashed',
    borderColor: theme.palette.gx.mediumGrey[500],
    paddingTop: '6px',
    paddingInline: '8px',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
  },
  moreTitle: {
    fontSize: '16px',
    fontWeight: 700,
    color: theme.palette.text.primary
  },
  showAllButton: {
    marginTop: '8px',
    fontSize: '13px',
    textTransform: 'none',
    color: theme.palette.gx.accent.info
  },
  collapseIcon: {
    marginLeft: 'auto'
  }
});
