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