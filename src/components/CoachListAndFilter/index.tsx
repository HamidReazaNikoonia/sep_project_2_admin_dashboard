import React, { useState, useMemo } from 'react'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import Divider from '@mui/material/Divider'
import ListItemText from '@mui/material/ListItemText'
import ListItemAvatar from '@mui/material/ListItemAvatar'
import Avatar from '@mui/material/Avatar'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import InputAdornment from '@mui/material/InputAdornment'
import SearchIcon from '@mui/icons-material/Search'
import Box from '@mui/material/Box'

type Coach = {
  _id?: string
  id: string
  first_name: string
  last_name: string
  avatar_url?: string
  // ...other fields
}

interface CoachListAndFilterProps {
  coaches: Coach[]
  selectedCurentCoach: string | null
  changeCurentCoach: (coachId: string) => void
}

const CoachListAndFilter: React.FC<CoachListAndFilterProps> = ({
  coaches,
  selectedCurentCoach,
  changeCurentCoach,
}) => {
  const [search, setSearch] = useState('')

  // Filter logic
  const filteredCoaches = useMemo(() => {
    if (!search) return coaches
    const s = search.trim().toLowerCase()
    return coaches.filter(
      (c) =>
        c.first_name?.toLowerCase().includes(s) ||
        c.last_name?.toLowerCase().includes(s),
    )
  }, [search, coaches])

  return (
    <Box>
      <TextField
        fullWidth
        placeholder="جستجو مربی..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
        sx={{ mb: 2 }}
      />
      <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
        {filteredCoaches &&
          filteredCoaches?.results.map((coach, idx) => {
            const selected = coach.id === selectedCurentCoach
            return (
              <React.Fragment key={coach.id}>
                <ListItem
                  alignItems="flex-start"
                  button
                  onClick={() => changeCurentCoach(coach.id)}
                  sx={{
                    opacity: selected ? 0.6 : 1,
                    border: selected
                      ? '2px solid #1976d2'
                      : '2px solid transparent',
                    borderRadius: 2,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    textAlign: 'right',
                    alignItems: 'center',
                  }}
                >
                  <ListItemAvatar>
                    <Avatar
                      alt={`${coach.first_name} ${coach.last_name}`}
                      src={coach.avatar_url || undefined}
                    />
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Typography fontWeight={700}>
                        {coach.first_name} {coach.last_name}
                      </Typography>
                    }
                  />
                </ListItem>
                {idx < filteredCoaches.length - 1 && (
                  <Divider variant="inset" component="li" />
                )}
              </React.Fragment>
            )
          })}
        {filteredCoaches && filteredCoaches.length === 0 && (
          <Typography color="text.secondary" sx={{ p: 2 }}>
            هیچ مربی‌ای یافت نشد.
          </Typography>
        )}
      </List>
    </Box>
  )
}

export default CoachListAndFilter
