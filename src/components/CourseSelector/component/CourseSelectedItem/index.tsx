import React from 'react'
import { Chip } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'

interface CourseSelectedItemProps {
  course: any
  onRemove: (id: string) => void
}

const CourseSelectedItem: React.FC<CourseSelectedItemProps> = ({
  course,
  onRemove,
}) => {
  return (
    <Chip
      label={course?.title || course.id}
      onDelete={() => onRemove(course.id)}
      deleteIcon={<CloseIcon />}
      color="primary"
      dir="ltr"
      variant="outlined"
    />
  )
}

export default CourseSelectedItem