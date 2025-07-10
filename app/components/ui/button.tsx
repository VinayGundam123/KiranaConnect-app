import { cva, type VariantProps } from 'class-variance-authority';
import type { PressableProps } from 'react-native';
import { Pressable } from 'react-native';

const buttonVariants = cva(
  'flex-row items-center justify-center rounded-md',
  {
    variants: {
      variant: {
        default: 'bg-blue-500',
        destructive: 'bg-red-500',
        outline: 'border border-gray-300 bg-transparent',
        secondary: 'bg-gray-200',
        ghost: 'bg-transparent',
        link: 'bg-transparent',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-11 rounded-md px-8',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps extends PressableProps, VariantProps<typeof buttonVariants> {
  children?: React.ReactNode;
  onPress?: () => void;
}

export function Button({ variant, size, ...props }: ButtonProps) {
  return (
    <Pressable {...props}>
      {props.children}
    </Pressable>
  );
}