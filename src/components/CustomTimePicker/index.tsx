import React from 'react'
import { FormControl, InputLabel, MenuItem, Select, SelectChangeEvent } from '@mui/material'

interface CustomTimePickerProps {
  label: string
  value: string
  onChange: (value: string) => void
  error?: boolean
  helperText?: string
}

const CustomTimePicker: React.FC<CustomTimePickerProps> = ({
  label,
  value,
  onChange,
  error = false,
  helperText
}) => {
  // Generate time options in 24-hour format (every 30 minutes)
  const generateTimeOptions = () => {
    const options = []
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const hourStr = hour.toString().padStart(2, '0')
        const minuteStr = minute.toString().padStart(2, '0')
        const timeValue = `${hourStr}:${minuteStr}`
        options.push({
          value: timeValue,
          label: timeValue
        })
      }
    }
    return options
  }

  const timeOptions = generateTimeOptions()

  const handleChange = (event: SelectChangeEvent<string>) => {
    onChange(event.target.value)
  }

  return (
    <FormControl fullWidth error={error} variant="outlined">
      <InputLabel id={`time-picker-${label}`}>{label}</InputLabel>
      <Select
        labelId={`time-picker-${label}`}
        value={value}
        onChange={handleChange}
        label={label}
        MenuProps={{
          sx: {
            zIndex: '999999999 !important',
            '& .MuiPaper-root': {
              maxHeight: 300,
              overflow: 'auto',
              zIndex: '999999999 !important',
            },
          },
        }}
      >
        <MenuItem value="">
          <em>انتخاب کنید</em>
        </MenuItem>
        {timeOptions.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </Select>
      {helperText && (
        <div className={`text-xs mt-1 ${error ? 'text-red-600' : 'text-gray-600'}`}>
          {helperText}
        </div>
      )}
    </FormControl>
  )
}

export default CustomTimePicker