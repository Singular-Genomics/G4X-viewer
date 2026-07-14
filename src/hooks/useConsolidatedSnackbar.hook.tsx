import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import { List, ListItem, ListItemText } from '@mui/material';
import { GxSnackbarModes } from '../shared/components/GxSnackbar/GxSnackbar.types';

type ConsolidatedSnackbarVariant = Extract<GxSnackbarModes, 'success' | 'warning' | 'error'>;

export const useConsolidatedSnackbar = () => {
  const { enqueueSnackbar } = useSnackbar();
  const { t } = useTranslation();

  const showConsolidatedMessages = (messages: string[], variant: ConsolidatedSnackbarVariant, summaryKey: string) => {
    if (messages.length === 0) return;

    if (messages.length === 1 && variant === 'success') {
      enqueueSnackbar({ message: messages[0], variant });
      return;
    }

    if (messages.length === 1) {
      enqueueSnackbar({
        message: `${t(summaryKey)}. ${messages[0]}`,
        variant: 'gxSnackbar',
        titleMode: variant
      });
      return;
    }

    enqueueSnackbar({
      message: t(summaryKey),
      variant: 'gxSnackbar',
      titleMode: variant,
      customContent: (
        <List dense>
          {messages.map((msg, index) => (
            <ListItem key={index}>
              <ListItemText primary={msg} />
            </ListItem>
          ))}
        </List>
      )
    });
  };

  return { showConsolidatedMessages };
};
