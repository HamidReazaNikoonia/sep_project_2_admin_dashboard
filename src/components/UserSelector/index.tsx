import React, { useState, useEffect } from 'react'
import {
  TextField,
  Paper,
  List,
  ListItem,
  ListItemText,
  Box,
  Typography,
  CircularProgress,
  InputAdornment,
  Avatar,
  IconButton,
  Link,
} from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import PersonIcon from '@mui/icons-material/Person'
import DeleteIcon from '@mui/icons-material/Delete'
import { useUsers } from '@/API/Users/users.hook'

const SERVER_FILE = process.env.REACT_APP_SERVER_FILE

interface UserSelectorProps {
  selectedUser: any
  onUserSelect: (user: any) => void
  label?: string
}

const UserSelector: React.FC<UserSelectorProps> = ({
  selectedUser,
  onUserSelect,
  label = 'انتخاب کاربر',
}) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery)
    }, 500)

    return () => clearTimeout(timer)
  }, [searchQuery])

  // Fetch users
  const { data: usersData, isLoading } = useUsers({
    page: 1,
    limit: 10,
    q: debouncedSearch,
  }, {
    queryKey: ['users', debouncedSearch],
    enabled: debouncedSearch.length > 0,
  })

  const users = usersData?.results || []

  const handleUserSelect = (user: any) => {
    onUserSelect(user)
    setSearchQuery('')
    setIsDropdownOpen(false)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
    setIsDropdownOpen(true)
  }

  const handleInputFocus = () => {
    if (searchQuery.length > 0) {
      setIsDropdownOpen(true)
    }
  }

  const displayValue = selectedUser 
    ? `${selectedUser.first_name} ${selectedUser.last_name} (${selectedUser.mobile})`
    : ''

  return (
    <Box sx={{ position: 'relative' }}>
      <Typography variant="subtitle1" gutterBottom>
        {label}
      </Typography>
      
      <TextField
        fullWidth
        placeholder="جستجو بر اساس نام یا شماره موبایل..."
        value={selectedUser ? displayValue : searchQuery}
        onChange={handleInputChange}
        onFocus={handleInputFocus}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <PersonIcon />
            </InputAdornment>
          ),
          endAdornment: selectedUser ? (
            <InputAdornment position="end">
              <Avatar sx={{ width: 24, height: 24 }}>
                {selectedUser.first_name?.[0]}
              </Avatar>
            </InputAdornment>
          ) : (
            <InputAdornment position="end">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
        sx={{ mb: 1 }}
      />

        {/* Selected User Display */}
        {selectedUser && (
        <Paper
          variant="outlined"
          sx={{
            p: 2,
            mb: 2,
            backgroundColor: '#f5f5f5',
            display: 'flex',
            alignItems: 'center',
            gap: 2,
          }}
        >
          <Avatar
            sx={{ width: 90, height: 90, ml: 2 }}
            src={selectedUser?.avatar?.file_name ? `${SERVER_FILE}/${selectedUser.avatar.file_name}` : undefined}
          >
              {selectedUser.first_name?.[0]}
            </Avatar> 
          <Box sx={{ flexGrow: 1 }}>
            <Link href={`/users/${selectedUser.id}`}>
            <Typography variant="body1" fontWeight="bold">
              {selectedUser.first_name} {selectedUser.last_name}
            </Typography>
            </Link>
            <Typography variant="body2" color="text.secondary">
              {selectedUser.mobile} - شماره موبایل
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {selectedUser.student_id} - کد دانشجویی
            </Typography>
          </Box>
          <IconButton
            onClick={() => onUserSelect(undefined)}
            size="small"
            sx={{ 
              color: 'error.main',
              '&:hover': {
                backgroundColor: 'error.light',
                color: 'white',
              }
            }}
          >
            <DeleteIcon />
          </IconButton>
        </Paper>
      )}

      {/* Dropdown for search results */}
      {isDropdownOpen && searchQuery.length > 0 && (
        <Paper
          sx={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            zIndex: 1000,
            maxHeight: '300px',
            overflow: 'auto',
            boxShadow: 3,
          }}
        >
          {isLoading ? (
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                p: 4,
              }}
            >
              <CircularProgress size={24} />
            </Box>
          ) : users.length === 0 ? (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <Typography color="text.secondary">کاربری یافت نشد</Typography>
            </Box>
          ) : (
            <List dir="rtl">
              {users.map((user: any) => (
                <ListItem
                  dir="rtl"
                  key={user.id}
                  button
                  onClick={() => handleUserSelect(user)}
                  sx={{
                    borderBottom: '1px solid #e0e0e0',
                    '&:last-child': { borderBottom: 'none' },
                    textAlign: 'right',
                  }}
                >
                  <Avatar
                    sx={{ width: 60, height: 60, ml: 2 }}
                    src={user?.avatar?.file_name ? `${SERVER_FILE}/${user.avatar.file_name}` : undefined}
                  >
                    {user.first_name?.[0]}
                  </Avatar>
                  <ListItemText
                    primary={
                      <Typography variant="body1" fontWeight="bold">
                        {user.first_name} {user.last_name}
                      </Typography>
                    }
                    secondary={
                      <Box>
                        <Typography variant="body2" display="block">
                          موبایل: {user.mobile}
                        </Typography>
                        {user.email && (
                          <Typography variant="body2" display="block" color="text.secondary">
                            ایمیل: {user.email}
                          </Typography>
                        )}
                      </Box>
                    }
                  />
                </ListItem>
              ))}
            </List>
          )}
        </Paper>
      )}
    </Box>
  )
}

export default UserSelector