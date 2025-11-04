import React from 'react'
import { ListItem, ListItemText, Checkbox, Box, Typography } from '@mui/material'
import moment from 'moment-jalaali'

interface CoachListItemProps {
  coach: any
  isSelected: boolean
  onToggle: (id: string) => void
}

const CoachListItem: React.FC<CoachListItemProps> = ({
  coach,
  isSelected,
  onToggle,
}) => {
  const coachId = coach.id || coach._id
  const fullName = `${coach.first_name || ''} ${coach.last_name || ''}`.trim()

  return (
    <ListItem
      button
      onClick={() => onToggle(coachId)}
      sx={{
        borderBottom: '1px solid #e0e0e0',
        '&:last-child': { borderBottom: 'none' },
      }}
    >
      <Checkbox
        edge="start"
        checked={isSelected}
        tabIndex={-1}
        disableRipple
      />
      <ListItemText
        primary={
          <Box>
            <Typography variant="body1" fontWeight="bold">
              {fullName || 'بدون نام'}
            </Typography>
          </Box>
        }
        secondary={
          <Box sx={{ mt: 1 }}>
            {coach.mobile && (
              <Typography variant="caption" display="block">
                موبایل: {coach.mobile}
              </Typography>
            )}
            {coach.email && (
              <Typography variant="caption" display="block">
                ایمیل: {coach.email}
              </Typography>
            )}
            {coach.specialization && (
              <Typography variant="caption" display="block">
                تخصص: {coach.specialization}
              </Typography>
            )}
            {coach.createdAt && (
              <Typography variant="caption" display="block" color="text.secondary">
                تاریخ ایجاد: {moment(coach.createdAt).format('jYYYY/jMM/jDD')}
              </Typography>
            )}
          </Box>
        }
        sx={{ textAlign: 'right' }}
      />
    </ListItem>
  )
}

export default CoachListItem