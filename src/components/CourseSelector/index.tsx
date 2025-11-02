import React, { useState, useEffect } from 'react'
import {
  Box,
  TextField,
  Paper,
  List,
  ListItem,
  ListItemText,
  Checkbox,
  Pagination,
  Typography,
  Chip,
  IconButton,
  CircularProgress,
  InputAdornment,
} from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import CloseIcon from '@mui/icons-material/Close'
import { useCourses } from '@/API/Course/course.hook'
import { useGetAllCourseSessionPrograms } from '@/API/CourseSession/courseSession.hook'

interface CourseSelectorProps {
  type: 'COURSE' | 'COURSE_SESSION'
  selectedIds: string[]
  onSelectionChange: (ids: string[]) => void
  label?: string
}

const CourseSelector: React.FC<CourseSelectorProps> = ({
  type,
  selectedIds,
  onSelectionChange,
  label,
}) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [page, setPage] = useState(1)
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const itemsPerPage = 10

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery)
      setPage(1) // Reset to first page on new search
    }, 500)

    return () => clearTimeout(timer)
  }, [searchQuery])

  // Fetch courses - only enabled when type is COURSE
  const { data: coursesData, isLoading: coursesLoading } = useCourses({
    page,
    limit: itemsPerPage,
    q: debouncedSearch,
  }, {
    enabled: type === 'COURSE',
  })

  // Fetch course session programs - only enabled when type is COURSE_SESSION
  const { data: courseSessionProgramsData, isLoading: programsLoading } =
    useGetAllCourseSessionPrograms({
      page,
      limit: itemsPerPage,
      search: debouncedSearch,
    }, {
      enabled: type === 'COURSE_SESSION',
    })

  // Select the appropriate data and loading state based on type
  const isLoading = type === 'COURSE' ? coursesLoading : programsLoading
  const data = type === 'COURSE' ? coursesData : courseSessionProgramsData
  const items = data?.results || []
  const totalPages = data?.totalPages || 1

  // Handle item selection toggle
  const handleToggleItem = (itemId: string) => {
    if (selectedIds.includes(itemId)) {
      onSelectionChange(selectedIds.filter((id) => id !== itemId))
    } else {
      onSelectionChange([...selectedIds, itemId])
    }
  }

  // Handle remove selected item
  const handleRemoveItem = (itemId: string) => {
    onSelectionChange(selectedIds.filter((id) => id !== itemId))
  }

  // Handle page change
  const handlePageChange = (
    _event: React.ChangeEvent<unknown>,
    value: number,
  ) => {
    setPage(value)
  }

  return (
    <Box>
      <Typography variant="subtitle1" gutterBottom>
        {label || (type === 'COURSE' ? 'فیلم های آموزشی' : 'دوره ها')}
      </Typography>

      {/* Selected Items Display */}
      {selectedIds.length > 0 && (
        <Paper
          variant="outlined"
          sx={{
            p: 2,
            mb: 2,
            backgroundColor: '#f5f5f5',
            minHeight: '60px',
          }}
        >
          <Typography variant="body2" color="text.secondary" gutterBottom>
            موارد انتخاب شده ({selectedIds.length})
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
            {selectedIds.map((id) => {
              const item = items.find((i: any) => i.id === id)
              return (
                <Chip
                  key={id}
                  label={item?.title || id}
                  onDelete={() => handleRemoveItem(id)}
                  deleteIcon={<CloseIcon />}
                  color="primary"
                  variant="outlined"
                />
              )
            })}
          </Box>
        </Paper>
      )}

      {/* Search Input */}
      <TextField
        fullWidth
        placeholder="جستجو..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        sx={{ mb: 2 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
      />

      {/* Items List */}
      <Paper
        variant="outlined"
        sx={{
          maxHeight: '400px',
          overflow: 'auto',
          mb: 2,
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
            <CircularProgress />
          </Box>
        ) : items.length === 0 ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography color="text.secondary">موردی یافت نشد</Typography>
          </Box>
        ) : (
          <List>
            {items.map((item: any) => (
              <ListItem
                key={item.id}
                button
                onClick={() => handleToggleItem(item.id)}
                sx={{
                  borderBottom: '1px solid #e0e0e0',
                  '&:last-child': { borderBottom: 'none' },
                }}
              >
                <Checkbox
                  edge="start"
                  checked={selectedIds.includes(item.id)}
                  tabIndex={-1}
                  disableRipple
                />
                <ListItemText
                  primary={item.title}
                  secondary={item.description || ''}
                  sx={{ textAlign: 'right' }}
                />
              </ListItem>
            ))}
          </List>
        )}
      </Paper>

      {/* Pagination */}
      {totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={handlePageChange}
            color="primary"
            showFirstButton
            showLastButton
          />
        </Box>
      )}
    </Box>
  )
}

export default CourseSelector