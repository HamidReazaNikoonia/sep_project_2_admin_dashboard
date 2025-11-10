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
import { useProducts } from '@/API/Products/products.hook'
import ProductListItem from './ProductListItem/index'
import ProductSelectedItem from './ProductSelectedItem/index'

interface ProductSelectorProps {
  selectedIds: string[]
  onSelectionChange: (ids: string[]) => void
  label?: string
  isExceptMode?: boolean
}

const ProductSelector: React.FC<ProductSelectorProps> = ({
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

  // Fetch products
  const { data: productsData, isLoading } = useProducts({
    page,
    limit: itemsPerPage,
    q: debouncedSearch,
  })

  const items = productsData?.results || []
  const totalPages = productsData?.totalPages || 1

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
        {label || 'محصولات'}
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
              : `محصولات انتخاب شده (${selectedIds.length})`}
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
            {selectedIds.map((id) => {
              const item = items.find((i: any) => i._id === id)
              if (!item) return null

              return (
                <ProductSelectedItem
                  key={id}
                  product={item}
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
              <ProductListItem
                key={item._id}
                product={item}
                isSelected={selectedIds.includes(item._id)}
                onToggle={handleToggleItem}
              />
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

export default ProductSelector