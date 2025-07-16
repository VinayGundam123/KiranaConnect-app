import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';
import { Text as NativeText, TextProps as NativeTextProps } from 'react-native';

import { theme } from '../../../lib/theme';

const textVariantStyles = {
  h1: { fontSize: theme.fontSize['4xl'], fontWeight: '800' as const },
  h2: { fontSize: theme.fontSize['3xl'], fontWeight: '700' as const },
  h3: { fontSize: theme.fontSize['2xl'], fontWeight: '600' as const },
  h4: { fontSize: theme.fontSize['xl'], fontWeight: '600' as const },
  body: { fontSize: theme.fontSize.base, lineHeight: 24 },
  muted: { fontSize: theme.fontSize.sm, color: theme.colors.gray[500] },
  p: { fontSize: theme.fontSize.base, lineHeight: 28 },
};

interface TextProps extends NativeTextProps, VariantProps<typeof textVariants> {}

const textVariants = cva('text-foreground', {
  variants: {
    variant: {
      h1: '', h2: '', h3: '', h4: '', body: '', muted: '', p: ''
    },
  },
  defaultVariants: {
    variant: 'body',
  },
});


const Text = React.forwardRef<NativeText, TextProps>(
  ({ className, variant, style, ...props }, ref) => {
    const variantStyle = textVariantStyles[variant || 'body'];
    
    return (
      <NativeText
        ref={ref}
        style={[variantStyle, style]}
        {...props}
      />
    );
  }
);
Text.displayName = 'Text';

export { Text, textVariants };
