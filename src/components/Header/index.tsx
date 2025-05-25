import React from 'react';
import { AppBar, Toolbar, Typography } from '@mui/material';

const Header: React.FC = ({children}) => {
  return (
    <AppBar position="fixed">
      <Toolbar classes="text-center">
        {children}
      </Toolbar>
    </AppBar>
  );
};

export default Header;