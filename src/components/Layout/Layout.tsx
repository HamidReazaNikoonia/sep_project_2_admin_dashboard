// @ts-nocheck
import { useState } from 'react';
import { Box, CssBaseline, Toolbar, IconButton, Typography } from '@mui/material';
import { Menu } from '@mui/icons-material';
import Header from '../Header';
import Sidebar from '../Sidebar';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mobileOpen, setMobileOpen] = useState(false); // Changed to false by default

  const handleDrawerToggle = () => {
    console.log('handleDrawerToggle', mobileOpen);
    setMobileOpen(!mobileOpen);
  };

  return (
    <Box sx={{ display: 'flex', backgroundColor: '#f3f3f3', minHeight: '100vh', direction: 'rtl' }}>
      <CssBaseline />
      <Header position="fixed" sx={{ zIndex: 99999 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1, textAlign: 'right' }}>
            پنل مدیریت
          </Typography>
          <IconButton
            color="inherit"
            edge="end"
            onClick={handleDrawerToggle}
            sx={{ ml: 2 }}
          >
            <Menu />
          </IconButton>
        </Box>
      </Header>
      
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: {xs: 2, md: 4},
          width: '100%',
          overflowX: 'hidden',
          // Removed marginRight since we're using temporary drawer
        }}
      >
        <Toolbar />
        {children}
      </Box>
      
      <Sidebar mobileOpen={mobileOpen} handleDrawerToggle={handleDrawerToggle} />
    </Box>
  );
};

export default Layout;
