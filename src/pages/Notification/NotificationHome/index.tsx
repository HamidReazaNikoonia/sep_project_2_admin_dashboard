// @ts-nocheck
import React from 'react';
import { Box } from '@mui/material';
import NotificationSummary from '../NotificationSummary';
import NotificationList from '../NotificationList';

const NotificationPage = () => {
  return (
    <Box className="notification-page p-4">
      <NotificationSummary />
      <NotificationList />
    </Box>
  );
};

export default NotificationPage;