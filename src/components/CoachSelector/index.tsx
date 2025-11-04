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
import { useGetAllCoaches } from '@/API/Coach/coach.hook'
import CoachListItem from './component/CoachListItem'
import CoachSelectedItem from './component/CoachSelectedItem/index'

interface CoachSelectorProps {
  selectedIds: string[]
  onSelectionChange: (ids: string[]) => void
  label?: string
  isExceptMode?: boolean
}

const CoachSelector: React.FC<CoachSelectorProps> = ({
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

  // Fetch coaches
  const { data: coachesData, isLoading } = useGetAllCoaches({
    page,
    limit: itemsPerPage,
    q: debouncedSearch,
  })

  const coaches = coachesData?.results || []
  const totalPages = coachesData?.totalPages || 1

  // Handle coach selection toggle
  const handleToggleCoach = (coachId: string) => {
    if (selectedIds.includes(coachId)) {
      onSelectionChange(selectedIds.filter((id) => id !== coachId))
    } else {
      onSelectionChange([...selectedIds, coachId])
    }
  }

  // Handle remove selected coach
  const handleRemoveCoach = (coachId: string) => {
    onSelectionChange(selectedIds.filter((id) => id !== coachId))
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
        {label || 'مربیان'}
      </Typography>

      {/* Except Mode Info */}
      {isExceptMode && selectedIds.length > 0 && (
        <Alert severity="info" sx={{ mb: 2 }}>
          کوپن روی همه مربیان به جز {selectedIds.length} مورد انتخاب شده اعمال خواهد شد
        </Alert>
      )}

      {/* Selected Coaches Display */}
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
              ? `مربیان استثنا شده (${selectedIds.length})`
              : `مربیان انتخاب شده (${selectedIds.length})`}
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
            {selectedIds.map((id) => {
              const coach = coaches.find((c: any) => c.id === id || c._id === id)
              return (
                <CoachSelectedItem
                  key={id}
                  coach={coach}
                  onRemove={handleRemoveCoach}
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

      {/* Coaches List */}
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
        ) : coaches.length === 0 ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography color="text.secondary">موردی یافت نشد</Typography>
          </Box>
        ) : (
          <List>
            {coaches.map((coach: any) => {
              const coachId = coach.id || coach._id
              return (
                <CoachListItem
                  key={coachId}
                  coach={coach}
                  isSelected={selectedIds.includes(coachId)}
                  onToggle={handleToggleCoach}
                />
              )
            })}
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

export default CoachSelector