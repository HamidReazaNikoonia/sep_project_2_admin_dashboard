import React from 'react'
import { ListItem, ListItemText, Checkbox, Box, Typography } from '@mui/material'

interface ProductListItemProps {
  product: any
  isSelected: boolean
  onToggle: (id: string) => void
}

const ProductListItem: React.FC<ProductListItemProps> = ({
  product,
  isSelected,
  onToggle,
}) => {
  return (
    <ListItem
      button
      onClick={() => onToggle(product.id)}
      sx={{
        borderBottom: '1px solid #e0e0e0',
        '&:last-child': { borderBottom: 'none' },
      }}
    >
      <Checkbox
        edge="start"
        sx={{
          '& .MuiSvgIcon-root': {
            fontSize: 28,
          },
          marginLeft: 1,
        }}
        checked={isSelected}
        tabIndex={-1}
        disableRipple
      />
      <ListItemText
        primary={
          <Box>
            <Typography variant="body1" fontWeight="bold">
              {product.title}
            </Typography>
            {product.subtitle && (
              <Typography variant="body2" color="text.secondary">
                {product.subtitle}
              </Typography>
            )}
          </Box>
        }
        secondary={
          <Box sx={{ mt: 1 }}>
            {product.price && (
              <Typography variant="caption" display="block">
                قیمت: {product.price.toLocaleString('fa-IR')} تومان
              </Typography>
            )}
            {product.brand && (
              <Typography variant="caption" display="block">
                برند: {product.brand}
              </Typography>
            )}
            {product.countInStock !== undefined && (
              <Typography variant="caption" display="block">
                موجودی: {product.countInStock}
              </Typography>
            )}
          </Box>
        }
        sx={{ textAlign: 'right' }}
      />
    </ListItem>
  )
}

export default ProductListItem