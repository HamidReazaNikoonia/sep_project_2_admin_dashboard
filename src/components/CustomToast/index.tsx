import React from 'react';
import { Toast } from 'react-hot-toast';
import { CheckCircle, Error, Warning, Info } from '@mui/icons-material';
import toast from 'react-hot-toast';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface CustomToastProps {
  t: Toast;
  title: string;
  message: string;
  type?: ToastType;
}

const getIcon = (type: ToastType = 'info') => {
  switch (type) {
    case 'success':
      return <CheckCircle className="text-green-500" />;
    case 'error':
      return <Error className="text-red-500" />;
    case 'warning':
      return <Warning className="text-yellow-500" />;
    case 'info':
    default:
      return <Info className="text-blue-500" />;
  }
};

const CustomToast: React.FC<CustomToastProps> = ({ t, title, message, type = 'info' }) => {
  return (
    <div
      className={`${
        t.visible ? 'animate-enter' : 'animate-leave'
      } max-w-md w-full bg-gray-600 shadow-lg rounded-lg pointer-events-auto flex flex-row-reverse ring-1 ring-black ring-opacity-5`}
    >
      <div dir="rtl" className="flex-1 w-0 p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0 pt-0.5">
            {getIcon(type)}
          </div>
          <div className="mr-3 flex-1">
            <p className="text-sm font-medium text-white">
              {title}
            </p>
            <p className="mt-1 text-sm text-gray-300">
              {message}
            </p>
          </div>
        </div>
      </div>
      <div className="flex border-r border-gray-200">
        <button
          onClick={() => toast.dismiss(t.id)}
          className="w-full border border-transparent rounded-none rounded-l-lg p-4 flex items-center justify-center text-sm font-medium text-white cursor-pointer hover:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          بستن
        </button>
      </div>
    </div>
  );
};

export default CustomToast; 