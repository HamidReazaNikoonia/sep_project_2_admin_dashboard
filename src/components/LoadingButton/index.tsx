import React, { ButtonHTMLAttributes } from 'react';
import { Button, ButtonProps } from '@mui/material';
import { CircularProgress } from '@mui/material';

type LoadingButtonProps = ButtonProps & {
  loading?: boolean;
};

const LoadingButton: React.FC<LoadingButtonProps> = ({
  loading = false,
  disabled,
  children,
  ...props
}) => {
  return (
    <Button
      {...props}
      disabled={disabled || loading}
      endIcon={props.endIcon && !loading ? props.endIcon : undefined}
      startIcon={props.startIcon && !loading ? props.startIcon : undefined}
    >
      {loading ? <CircularProgress size={20} color="inherit" /> : children}
    </Button>
  );
};

export default LoadingButton;