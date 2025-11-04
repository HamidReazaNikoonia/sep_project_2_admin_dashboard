import React from 'react'
import { ListItem, ListItemText, Checkbox, Box, Typography } from '@mui/material'
import moment from 'moment-jalaali'

interface CourseListItemProps {
  course: any
  isSelected: boolean
  onToggle: (id: string) => void
}

const CourseListItem: React.FC<CourseListItemProps> = ({
  course,
  isSelected,
  onToggle,
}) => {
  return (
    <ListItem
      button
      onClick={() => onToggle(course.id)}
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
              {course.title}
            </Typography>
            {course.sub_title && (
              <Typography variant="body2" color="text.secondary">
                {course.sub_title}
              </Typography>
            )}
          </Box>
        }
        secondary={
          <Box sx={{ mt: 1 }}>
            {course.price_real && (
              <Typography variant="caption" display="block">
                قیمت: {course.price_real.toLocaleString('fa-IR')} تومان
              </Typography>
            )}
            {course.coach_id?.first_name && (
              <Typography variant="caption" display="block">
                مدرس: {course.coach_id.first_name}
              </Typography>
            )}
            {course.createdAt && (
              <Typography variant="caption" display="block" color="text.secondary">
                تاریخ ایجاد: {moment(course.createdAt).format('jYYYY/jMM/jDD')}
              </Typography>
            )}
          </Box>
        }
        sx={{ textAlign: 'right' }}
      />
    </ListItem>
  )
}

export default CourseListItem