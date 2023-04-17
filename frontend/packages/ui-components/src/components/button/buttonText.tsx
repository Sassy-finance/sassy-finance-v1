import React from 'react';
import styled from 'styled-components';

import {ButtonBase} from './buttonBase';
import type {ButtonBaseProps} from './buttonBase';

// Omit label to make it required
export type ButtonTextProps = Omit<ButtonBaseProps, 'label' | 'iconOnly'> & {
  bgWhite?: boolean;
  label: string;
  isActive?: boolean;
  className?: string;
};

export const ButtonText = React.forwardRef<HTMLButtonElement, ButtonTextProps>(
  (
    {
      bgWhite = false,
      label,
      isActive = false,
      mode = 'primary',
      size = 'medium',
      className,
      ...props
    },
    ref
  ) => {
    return (
      <StyledButton
        ref={ref}
        {...props}
        bgWhite={bgWhite}
        label={label}
        isActive={isActive}
        mode={mode}
        size={size}
        inputClassName={className}
      />
    );
  }
);

ButtonText.displayName = 'ButtonText';

const paddingStyles = {
  small: 'py-0.5 px-2',
  medium: 'py-1.5 px-2',
  large: 'py-1.5 px-2',
};

type StyledButtonProps = {
  bgWhite: boolean;
  isActive: boolean;
  mode: ButtonBaseProps['mode'];
  size: ButtonBaseProps['size'];
  inputClassName?: string;
};
const StyledButton = styled(ButtonBase).attrs(
  ({
    bgWhite,
    isActive,
    mode,
    size = 'medium',
    inputClassName,
  }: StyledButtonProps) => {
    let className: string | undefined;

    switch (mode) {
      case 'secondary':
        className = `${bgWhite ? 'bg-ui-50' : 'bg-ui-0'} ${
          isActive ? 'text-ui-800 bg-ui-200' : 'text-ui-600'
        } ${
          paddingStyles[size]
        } hover:text-ui-800 hover:bg-ui-100 active:text-ui-800 active:bg-ui-200 disabled:text-ui-300 disabled:bg-ui-100`;
        break;

      case 'ghost':
        className = `${
          bgWhite
            ? `${isActive ? 'bg-primary-50' : 'bg-ui-0'} active:bg-primary-50`
            : `${isActive ? 'bg-ui-0' : 'bg-transparent'}  active:bg-ui-0`
        } ${isActive ? 'text-primary-500' : 'text-ui-600'} ${
          paddingStyles[size]
        } hover:text-primary-500 active:text-primary-500 disabled:text-ui-300 disabled:bg-transparent`;
        break;

      default:
        className = `${isActive ? 'bg-primary-700' : 'bg-primary-400'} ${
          paddingStyles[size]
        } text-ui-0 hover:bg-primary-500 active:bg-primary-700 disabled:text-primary-300 disabled:bg-primary-100`;
    }

    return {className: `${className} ${inputClassName}`};
  }
)<StyledButtonProps>``;
