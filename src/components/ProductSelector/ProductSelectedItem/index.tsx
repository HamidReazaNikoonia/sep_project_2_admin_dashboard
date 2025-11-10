import React from 'react'
import { Chip } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'

interface ProductSelectedItemProps {
  product: any
  onRemove: (id: string) => void
}

const ProductSelectedItem: React.FC<ProductSelectedItemProps> = ({
  product,
  onRemove,
}) => {
  return (
    <Chip
      label={product?.title || product._id}
      onDelete={() => onRemove(product._id)}
      deleteIcon={<CloseIcon />}
      color="secondary"
      dir="ltr"
      variant="outlined"
    />
  )
}

export default ProductSelectedItem