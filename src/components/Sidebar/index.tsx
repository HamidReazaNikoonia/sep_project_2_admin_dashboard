// @ts-nocheck
import { useState } from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
  useMediaQuery,
  Theme
} from '@mui/material';
import {
  Menu,
  Dashboard,
  ShoppingCart,
  School,
  Settings,
  People,
  Ballot,
  Receipt,
  ChevronLeft
} from '@mui/icons-material';
import { Link, useLocation } from 'react-router'; // Import from react-router

const Sidebar = ({ mobileOpen, handleDrawerToggle }) => {
  const isMobile = useMediaQuery((theme: Theme) => theme.breakpoints.down('md'));
  const location = useLocation(); // Get current location for active route styling

  const menuItems = [
    { text: 'لیست کاربران', icon: <People />, path: '/users' },
    { text: 'لیست محصولات', icon: <ShoppingCart />, path: '/products' },
    { text: 'لیست دوره ها', icon: <School />, path: '/courses' },
    { text: 'لیست سفارش ها', icon: <Ballot />, path: '/orders' },
    { text: 'لیست تراکنش ها', icon: <Receipt />, path: '/transactions' },
  ];


  return (
    <Drawer
      variant={true ? 'temporary' : 'permanent'}
      open={mobileOpen}
      onClose={handleDrawerToggle}
      ModalProps={{
        keepMounted: true, // Better performance on mobile
      }}
      sx={{
        width: 240,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: 240,
          boxSizing: 'border-box',
          position: 'relative',
          zIndex: (theme) => theme.zIndex.drawer + 1,
        },
      }}
    >
      <div className="flex items-center justify-end p-2">
        <IconButton onClick={handleDrawerToggle}>
          <ChevronLeft />
        </IconButton>
      </div>

      <List>
        {menuItems.map((item) => (
          <ListItem
            key={item.text}
            disablePadding
            sx={{ display: 'block' }}
          >
            <Link
              to={item.path}
              className={`block no-underline ${location.pathname === item.path
                  ? 'text-primary-600 bg-gray-100'
                  : 'text-gray-700'
                }`}
            >
              <ListItemButton
                sx={{
                  justifyContent: 'initial',
                  px: 2.5,
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    mr: 3,
                    justifyContent: 'center',
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            </Link>
          </ListItem>
        ))}
      </List>
    </Drawer>
  );
};

export default Sidebar;