import React from 'react'
import { ListItem, ListItemText, Checkbox, Box, Typography } from '@mui/material'
import moment from 'moment-jalaali'

interface CourseSessionListItemProps {
  courseSession: any
  isSelected: boolean
  onToggle: (id: string) => void
}

const CourseSessionListItem: React.FC<CourseSessionListItemProps> = ({
  courseSession,
  isSelected,
  onToggle,
}) => {
  return (
    <ListItem
      button
      onClick={() => onToggle(courseSession.id)}
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
              {courseSession?.course?.title || courseSession.title}
            </Typography>
          </Box>
        }
        secondary={
          <Box sx={{ mt: 1 }}>
            {courseSession.coach?.first_name && (
              <Typography variant="caption" display="block">
                مربی: {courseSession.coach.first_name}
              </Typography>
            )}
            {courseSession.price_real && (
              <Typography variant="caption" display="block">
                قیمت: {courseSession.price_real.toLocaleString('fa-IR')} تومان
              </Typography>
            )}
            {courseSession.createdAt && (
              <Typography variant="caption" display="block" color="text.secondary">
                تاریخ ایجاد: {moment(courseSession.createdAt).format('jYYYY/jMM/jDD')}
              </Typography>
            )}
          </Box>
        }
        sx={{ textAlign: 'right' }}
      />
    </ListItem>
  )
}

export default CourseSessionListItem