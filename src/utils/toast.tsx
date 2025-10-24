import React from 'react';
import toast from 'react-hot-toast';
import type { Toast } from 'react-hot-toast';
import CustomToast from '../components/CustomToast/index';

type ToastType = 'success' | 'error' | 'warning' | 'info';

export const showToast = (
  title: string,
  message: string,
  type: ToastType = 'info'
): void => {
  toast.custom(
    (t) => (
      <CustomToast
        t={t}
        title={title}
        message={message}
        type={type}
      />
    ),
    {
      duration: 6000,
      position: 'bottom-center',
    }
  );
};


export const showPromiseToast = <T,>(
  promise: Promise<T>,
  messages: {
    loading?: string;
    success?: string | React.ReactNode;
    error?: string | React.ReactNode;
  } = {}
): Promise<T> => {
  const {
    loading = 'Processing...',
    success = 'Operation successful!',
    error = 'Operation failed.'
  } = messages;

  return toast.promise(promise, {
    loading: (
      <CustomToast
        t={{ id: 'loading' } as Toast}
        title="Loading"
        message={loading as unknown as string}
        type="info"
        fullWidth={true}
      />
    ),
    success: (
      <CustomToast
        t={{ id: 'success' } as Toast}
        title="Success"
        message={success as unknown as string}
        type="success"
        fullWidth={true}
      />
    ),
    error: (
      <CustomToast
        t={{ id: 'error' } as Toast}
        title="Error"
        message={error as unknown as string}
        type="error"
        fullWidth={true}
      />
    ),
  });
};
