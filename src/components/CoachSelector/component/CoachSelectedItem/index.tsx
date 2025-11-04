import React from 'react'
import { Chip } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'

interface CoachSelectedItemProps {
  coach: any
  onRemove: (id: string) => void
}

const CoachSelectedItem: React.FC<CoachSelectedItemProps> = ({
  coach,
  onRemove,
}) => {
  const coachId = coach?.id || coach?._id
  const fullName = coach 
    ? `${coach.first_name || ''} ${coach.last_name || ''}`.trim() 
    : coachId

  return (
    <Chip
      label={fullName || coachId}
      onDelete={() => onRemove(coachId)}
      deleteIcon={<CloseIcon />}
      color="primary"
      variant="outlined"
    />
  )
}

export default CoachSelectedItem