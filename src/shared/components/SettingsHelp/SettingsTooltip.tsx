import { Box, Tooltip } from '@mui/material';
import type { TooltipProps } from '@mui/material';
import { cloneElement, useEffect, useId } from 'react';
import type { ReactElement, ReactNode } from 'react';
import { useSettingsHelp } from './SettingsHelpContext';

type SettingsTooltipProps = TooltipProps & { helpTitle?: ReactNode };

// Existing Tooltip API: settings use the fixed Info View; other app areas retain floating tooltips.
export const SettingsTooltip = ({ title, helpTitle, children, ...props }: SettingsTooltipProps) => {
  const help = useSettingsHelp();
  const id = useId();
  const register = help?.register;
  const unregister = help?.unregister;
  const hasContent = title !== undefined && title !== null && title !== false && title !== '';

  useEffect(() => {
    if (hasContent) register?.(id, { title: helpTitle, content: title });
    else unregister?.(id);
  }, [id, title, helpTitle, hasContent, register, unregister]);
  useEffect(() => () => unregister?.(id), [id, unregister]);

  if (!help)
    return (
      <Tooltip
        title={title}
        {...props}
      >
        {children}
      </Tooltip>
    );
  if (!hasContent) return children;

  const child = children as ReactElement<{ 'aria-describedby'?: string }>;
  const descriptionId = `${id}-description`;
  return (
    <Box
      component="span"
      sx={{ display: 'contents' }}
      data-settings-help={id}
    >
      {cloneElement(child, {
        'aria-describedby': [child.props['aria-describedby'], descriptionId].filter(Boolean).join(' ')
      })}
      <Box
        component="span"
        id={descriptionId}
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '1px',
          height: '1px',
          padding: 0,
          margin: '-1px',
          overflow: 'hidden',
          clipPath: 'inset(50%)',
          whiteSpace: 'nowrap',
          border: 0
        }}
      >
        {title}
      </Box>
    </Box>
  );
};
