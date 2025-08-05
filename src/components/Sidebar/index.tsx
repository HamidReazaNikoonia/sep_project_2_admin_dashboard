// @ts-nocheck
import { useState } from 'react'
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
  useMediaQuery,
  Theme,
  Collapse,
} from '@mui/material'
import {
  Menu,
  Dashboard,
  ShoppingCart,
  School,
  Settings,
  People,
  Ballot,
  Receipt,
  Class,
  PeopleOutline,
  ChevronLeft, // Changed back to ChevronLeft for closing right drawer
  Article,
  Discount,
  ExpandLess,
  ExpandMore,
  Add,
  Category,
  Assignment,
} from '@mui/icons-material'
import { Link, useLocation } from 'react-router'

// Define the menu item type
interface MenuItem {
  text: string
  icon: React.ReactNode
  path?: string
  children?: MenuItem[]
}

const Sidebar = ({ mobileOpen, handleDrawerToggle }) => {
  const isMobile = useMediaQuery((theme: Theme) => theme.breakpoints.down('md'))
  const location = useLocation()
  const [openSubMenus, setOpenSubMenus] = useState<{ [key: string]: boolean }>({})

  // Handle sub-menu toggle
  const handleSubMenuToggle = (menuText: string) => {
    setOpenSubMenus(prev => ({
      ...prev,
      [menuText]: !prev[menuText]
    }))
  }

  // Check if current path matches any menu item or its children
  const isActiveMenuItem = (item: MenuItem): boolean => {
    if (item.path && location.pathname === item.path) return true
    if (item.children) {
      return item.children.some(child => isActiveMenuItem(child))
    }
    return false
  }

  // Check if current path is exactly this item's path
  const isExactMatch = (path: string): boolean => {
    return location.pathname === path
  }

  const menuItems: MenuItem[] = [
    { 
      text: 'لیست کاربران', 
      icon: <People />, 
      path: '/users',
      children: [
        { text: 'مشاهده کاربران', icon: <People />, path: '/users' },
        { text: 'ایجاد کاربر', icon: <Add />, path: '/users/create' },
      ]
    },
    { 
      text: 'لیست محصولات', 
      icon: <ShoppingCart />, 
      path: '/products',
      children: [
        { text: 'مشاهده محصولات', icon: <ShoppingCart />, path: '/products' },
        { text: 'ایجاد محصول', icon: <Add />, path: '/products/new' },
        { text: 'دسته بندی محصولات', icon: <Category />, path: '/products-category' },
      ]
    },
    { 
      text: 'لیست اساتید', 
      icon: <PeopleOutline />, 
      path: '/coach',
      children: [
        { text: 'مشاهده اساتید', icon: <PeopleOutline />, path: '/coach' },
        { text: 'ایجاد استاد', icon: <Add />, path: '/coach/new' },
        { text: 'برنامه اساتید', icon: <Assignment />, path: '/coach/coach-course-program' },
      ]
    },
    { 
      text: 'لیست آموزش ها', 
      icon: <School />, 
      path: '/courses',
      children: [
        { text: 'مشاهده آموزش ها', icon: <School />, path: '/courses' },
        { text: 'ایجاد آموزش', icon: <Add />, path: '/courses/new' },
        { text: 'دسته بندی آموزش ها', icon: <Category />, path: '/course-category' },
      ]
    },
    { 
      text: 'لیست کلاس ها', 
      icon: <Class />, 
      path: '/courses-sessions',
      children: [
        { text: 'مشاهده کلاس ها', icon: <Class />, path: '/courses-sessions' },
        { text: 'ایجاد کلاس', icon: <Add />, path: '/courses-sessions/create' },
        { text: 'پکیج کلاس ها', icon: <School />, path: '/courses-sessions/implement-package' },
      ]
    },
    { text: 'لیست سفارش ها', icon: <Ballot />, path: '/orders' },
    { text: 'لیست تراکنش ها', icon: <Receipt />, path: '/transactions' },
    { 
      text: 'کد تخفیف', 
      icon: <Discount />, 
      path: '/coupon',
      children: [
        { text: 'مشاهده کدهای تخفیف', icon: <Discount />, path: '/coupon' },
        { text: 'ایجاد کد تخفیف', icon: <Add />, path: '/coupon/create' },
      ]
    },
    { text: 'مدیریت کلاس ها', icon: <Class />, path: '/class-room' },
    { 
      text: 'مدیریت دوره ها', 
      icon: <School />, 
      path: '/course-session-program',
      children: [
        { text: 'مشاهده دوره ها', icon: <School />, path: '/course-session-program' },
        { text: 'سفارش دوره ها', icon: <Ballot />, path: '/course-session-program/orders' },
      ]
    },
  ]

  // Render menu item (with or without children)
  const renderMenuItem = (item: MenuItem, level: number = 0) => {
    const hasChildren = item.children && item.children.length > 0
    const isActive = isActiveMenuItem(item)
    const isOpen = openSubMenus[item.text]

    return (
      <div key={item.text}>
        <ListItem disablePadding sx={{ display: 'block' }}>
          {hasChildren ? (
            // Parent item with children
            <ListItemButton
              onClick={() => handleSubMenuToggle(item.text)}
              sx={{
                justifyContent: 'initial',
                px: 2.5,
                pr: 2.5 + level * 2,
                backgroundColor: isActive ? 'rgba(25, 118, 210, 0.08)' : 'transparent',
                '&:hover': {
                  backgroundColor: 'rgba(25, 118, 210, 0.04)',
                },
                direction: 'rtl',
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 0,
                  ml: 3,
                  justifyContent: 'center',
                  color: isActive ? 'primary.main' : 'inherit',
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText 
                primary={item.text} 
                sx={{ 
                  color: isActive ? 'primary.main' : 'inherit',
                  textAlign: 'right',
                  '& .MuiListItemText-primary': {
                    fontWeight: isActive ? 600 : 400,
                  }
                }} 
              />
              {isOpen ? <ExpandLess sx={{ ml: 'auto' }} /> : <ExpandMore sx={{ ml: 'auto' }} />}
            </ListItemButton>
          ) : (
            // Regular item without children
            <Link
              to={item.path || '#'}
              className="block no-underline"
              style={{ textDecoration: 'none' }}
            >
              <ListItemButton
                sx={{
                  justifyContent: 'initial',
                  px: 2.5,
                  pr: 2.5 + level * 2,
                  backgroundColor: isExactMatch(item.path || '') ? 'rgba(25, 118, 210, 0.08)' : 'transparent',
                  '&:hover': {
                    backgroundColor: 'rgba(25, 118, 210, 0.04)',
                  },
                  direction: 'rtl',
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    ml: 3,
                    justifyContent: 'center',
                    color: isExactMatch(item.path || '') ? 'primary.main' : 'inherit',
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.text} 
                  sx={{ 
                    color: isExactMatch(item.path || '') ? 'primary.main' : 'inherit',
                    textAlign: 'right',
                    '& .MuiListItemText-primary': {
                      fontWeight: isExactMatch(item.path || '') ? 600 : 400,
                    }
                  }} 
                />
              </ListItemButton>
            </Link>
          )}
        </ListItem>

        {/* Render sub-menu items */}
        {hasChildren && (
          <Collapse in={isOpen} timeout="auto" unmountOnExit>
            <List component="div" disablePadding sx={{ direction: 'rtl' }}>
              {item.children?.map((child) => renderMenuItem(child, level + 1))}
            </List>
          </Collapse>
        )}
      </div>
    )
  }

  return (
    <Drawer
      anchor="right" // IMPORTANT: This positions the drawer on the right
      variant="temporary" // Use temporary for mobile-like behavior
      open={mobileOpen}
      onClose={handleDrawerToggle}
      ModalProps={{
        keepMounted: true,
      }}
      sx={{
        width: 240,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: 240,
          boxSizing: 'border-box',
          // REMOVED position: 'relative' - this was causing the issue
          // REMOVED zIndex override - let MUI handle the z-index
          direction: 'rtl',
        },
      }}
    >
      <div className="flex items-center justify-end p-2">
        <IconButton onClick={handleDrawerToggle}>
          <ChevronLeft />
        </IconButton>
      </div>

      <List sx={{ direction: 'rtl' }}>
        {menuItems.map((item) => renderMenuItem(item))}
      </List>
    </Drawer>
  )
}

export default Sidebar
