import { Radio, RadioProps } from '@mui/material';
import React, { ForwardedRef } from 'react';

export const GxRadio = React.forwardRef(
  ({ sx: customSx, ...restProps }: RadioProps, ref: ForwardedRef<HTMLButtonElement>) => (
    <Radio
      ref={ref}
      // sx={{ ...sx.radio, ...customSx }}
      {...restProps}
    />
  )
);

// const sx = {
//   radio: {
//     // '&, &.Mui-checked': {
//     //   color: (theme: Theme) => theme.palette.primary.main
//     // }
//   }
// };
