import React, { useState, useEffect } from 'react'
import {
  Box,
  TextField,
  Paper,
  List,
  Pagination,
  Typography,
  CircularProgress,
  InputAdornment,
  Alert,
} from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import { useCourses } from '@/API/Course/course.hook'
import { useGetAllCourseSessionPrograms } from '@/API/CourseSession/courseSession.hook'
import CourseListItem from './component/CourseListItem'
import CourseSessionListItem from './component/CourseSessionListItem'
import CourseSelectedItem from './component/CourseSelectedItem'
import CourseSessionSelectedItem from './component/CourseSessionSelectedItem'

interface CourseSelectorProps {
  type: 'COURSE' | 'COURSE_SESSION'
  selectedIds: string[]
  onSelectionChange: (ids: string[]) => void
  label?: string
  isExceptMode?: boolean
}

const CourseSelector: React.FC<CourseSelectorProps> = ({
  type,
  selectedIds,
  onSelectionChange,
  label,
  isExceptMode = false,
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
    enabled: type === 'COURSE',
  })

  // Fetch course session programs - only enabled when type is COURSE_SESSION
  const { data: courseSessionProgramsData, isLoading: programsLoading } =
    useGetAllCourseSessionPrograms({
      page,
      limit: itemsPerPage,
      search: debouncedSearch,
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

      {/* Except Mode Info */}
      {isExceptMode && selectedIds.length > 0 && (
        <Alert severity="info" sx={{ mb: 2 }}>
          کوپن روی همه محصولات به جز {selectedIds.length} مورد انتخاب شده اعمال خواهد شد
        </Alert>
      )}

      {/* Selected Items Display */}
      {selectedIds.length > 0 && (
        <Paper
          variant="outlined"
          sx={{
            p: 2,
            mb: 2,
            backgroundColor: isExceptMode ? '#fff3e0' : '#f5f5f5',
            minHeight: '60px',
            border: isExceptMode ? '2px dashed #ff9800' : undefined,
          }}
        >
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {isExceptMode
              ? `موارد استثنا شده (${selectedIds.length})`
              : `موارد انتخاب شده (${selectedIds.length})`}
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
            {selectedIds.map((id) => {
              const item = items.find((i: any) => i.id === id)
              if (!item) return null

              return type === 'COURSE' ? (
                <CourseSelectedItem
                  key={id}
                  course={item}
                  onRemove={handleRemoveItem}
                />
              ) : (
                <CourseSessionSelectedItem
                  key={id}
                  courseSession={item}
                  onRemove={handleRemoveItem}
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
            {items.map((item: any) =>
              type === 'COURSE' ? (
                <CourseListItem
                  key={item.id}
                  course={item}
                  isSelected={selectedIds.includes(item.id)}
                  onToggle={handleToggleItem}
                />
              ) : (
                <CourseSessionListItem
                  key={item.id}
                  courseSession={item}
                  isSelected={selectedIds.includes(item.id)}
                  onToggle={handleToggleItem}
                />
              )
            )}
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