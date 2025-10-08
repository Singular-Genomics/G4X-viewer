import React from 'react';

export type GxModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onContinue?: () => void;
  title: string;
  children: React.ReactNode;
  colorVariant?: GxModalColorVaraints;
  iconVariant?: GxModalIconVariant;
  dontShowFlag?: string;
  size?: GxModalSize;
  hideButtons?: boolean;
};

type GxModalColorVaraints = 'danger' | 'warning' | 'info' | 'singular';

type GxModalIconVariant = 'danger' | 'warning' | 'info' | 'settings';

type GxModalSize = 'default' | 'small';
