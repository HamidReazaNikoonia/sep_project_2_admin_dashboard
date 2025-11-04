import React from 'react'
import { Chip, Box } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'

interface CourseSessionSelectedItemProps {
  courseSession: any
  onRemove: (id: string) => void
}

const CourseSessionSelectedItem: React.FC<CourseSessionSelectedItemProps> = ({
  courseSession,
  onRemove,
}) => {
  const label = courseSession?.course?.title || courseSession?.title || courseSession.id
  const coachName = courseSession?.coach?.first_name
  
  return (
    <Chip
      label={
        <Box component="span">
          {label}
          {coachName && (
            <Box component="span" sx={{ fontSize: '0.85em', opacity: 0.8, mr: 0.5 }}>
              {' '}({coachName})
            </Box>
          )}
        </Box>
      }
      onDelete={() => onRemove(courseSession.id)}
      deleteIcon={<CloseIcon />}
      color="primary"
      variant="outlined"
      dir="ltr"
    />
  )
}

export default CourseSessionSelectedItem