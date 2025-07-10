import { cva, type VariantProps } from 'class-variance-authority';
import type { TextProps as RNTextProps } from 'react-native';
import { Text as RNText } from 'react-native';
import { theme } from '../../../lib/theme'; // Assuming theme file location

const textVariantsConfig = {
  h1: { fontSize: theme.fontSize['4xl'], fontWeight: 'bold' },
  h2: { fontSize: theme.fontSize['3xl'], fontWeight: 'bold' },
  h3: { fontSize: theme.fontSize['2xl'], fontWeight: 'bold' },
  h4: { fontSize: theme.fontSize['xl'], fontWeight: 'bold' },
  h5: { fontSize: theme.fontSize.lg, fontWeight: 'bold' },
  h6: { fontSize: theme.fontSize.base, fontWeight: 'bold' },
  body: { fontSize: theme.fontSize.base },
  small: { fontSize: theme.fontSize.sm },
};

export interface TextProps extends RNTextProps, VariantProps<typeof textVariants> {
  variant?: keyof typeof textVariantsConfig;
  color?: string; // Allow passing color as a prop
  center?: boolean;
  numberOfLines?: number; // Add this line
}

const textVariants = cva('text-base', {
  variants: {
    variant: {
      h1: 'text-4xl font-bold',
      h2: 'text-3xl font-bold',
      h3: 'text-2xl font-bold',
      h4: 'text-xl font-bold',
      h5: 'text-lg font-bold',
      h6: 'text-base font-bold',
      body: 'text-base',
      small: 'text-sm',
    },
  },
  defaultVariants: {
    variant: 'body',
  },
});


export function Text({
  style,
  variant = 'body',
  color,
  center,
  numberOfLines, // Add this line
  ...props
}: TextProps) {
  const variantStyle = textVariantsConfig[variant] || textVariantsConfig.body;
  const passedStyles = Array.isArray(style) ? Object.assign({}, ...style) : style;

  const combinedStyles = {
    ...variantStyle,
    color,
    textAlign: center ? 'center' : undefined,
    ...passedStyles,
  };

  return <RNText style={combinedStyles} numberOfLines={numberOfLines} {...props} />;
} 