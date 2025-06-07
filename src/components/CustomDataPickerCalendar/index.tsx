import React, { useState, forwardRef, useImperativeHandle } from 'react'
import momentJalaali from 'moment-jalaali'
// import * as momentJalaali from 'moment-jalaali';
import { Calendar } from 'react-datepicker2'

import { CircularProgress, Typography } from '@mui/material'
import { showToast } from '@/utils/toast'

// TEST
const timeSlotIsError = false
const timeSlotIsLoading = false

const timeSlotItemArray = [
  {
    startTime: '06:00',
    endTime: '07:00',
    isBooked: false,
  },
  {
    startTime: '07:00',
    endTime: '08:00',
    isBooked: false,
  },
  {
    startTime: '08:00',
    endTime: '09:00',
    isBooked: false,
  },
  {
    startTime: '09:00',
    endTime: '10:00',
    isBooked: false,
  },
  {
    startTime: '10:00',
    endTime: '11:00',
    isBooked: false,
  },
  {
    startTime: '11:00',
    endTime: '12:00',
    isBooked: false,
  },
  {
    startTime: '11:00',
    endTime: '13:00',
    isBooked: false,
  },
  {
    startTime: '13:00',
    endTime: '14:00',
    isBooked: false,
  },
  {
    startTime: '14:00',
    endTime: '15:00',
    isBooked: false,
  },
  {
    startTime: '15:00',
    endTime: '16:00',
    isBooked: false,
  },
  {
    startTime: '16:00',
    endTime: '17:00',
    isBooked: false,
  },
  {
    startTime: '17:00',
    endTime: '18:00',
    isBooked: false,
  },
  {
    startTime: '18:00',
    endTime: '19:00',
    isBooked: false,
  },
  {
    startTime: '19:00',
    endTime: '20:00',
    isBooked: false,
  },
  {
    startTime: '20:00',
    endTime: '21:00',
    isBooked: false,
  },
  {
    startTime: '21:00',
    endTime: '22:00',
    isBooked: true,
  },
  {
    startTime: '22:00',
    endTime: '23:00',
    isBooked: true,
  },
  {
    startTime: '23:00',
    endTime: '24:00',
    isBooked: true,
  },
]

const CustomDataPickerCalendar = forwardRef(
  ({ timeSlotChangeHandler, dateChangeHandler }, ref) => {
    // States
    const [calendarValue, setcalendarValue] = useState(momentJalaali())
    const [selectedDateState, setSelectedDateState] = useState(
      momentJalaali().locale('fa').format('jYYYY/jM/jD'),
    )
    const [timeSlotItem, settimeSlotItem] = useState([])
    const [sessionTime, setsessionTime] = useState({
      startTime: '',
      endTime: '',
    })

    // Expose the reset function to parent via ref
    useImperativeHandle(ref, () => ({
      reset,
    }))

    const calendarHandler = (selectedDate: any) => {
      setcalendarValue(selectedDate)

      setSelectedDateState(selectedDate.locale('fa').format('jYYYY/jM/jD'))
      dateChangeHandler(selectedDate.locale('fa').format('jYYYY/jM/jD'))
      console.log(selectedDateState)
    }

    const enabledRange = {
      min: momentJalaali().startOf('day'),
    }

    // Handle card click to toggle selection
    // @ts-ignore
    const handleSelectSlot = (index, slot) => {
      if (slot.isBooked) {
        showToast('خطا', 'این تایم قبلا رزرو شده', 'error')
        return false
      }
      const updatedSlots = timeSlotItem.map(
        (slot, i) => {
          return { ...slot, isSelected: i === index ? !slot.isSelected : false }
        },
        // i === index ? { ...slot, isSelected: !slot.isSelected } : slot
      )
      settimeSlotItem(updatedSlots)
      const selectedTimeSlotTime = updatedSlots.filter(
        (slot) => slot.isSelected,
      )
      timeSlotChangeHandler(selectedTimeSlotTime)
      console.log(selectedTimeSlotTime)
    }

    // ... existing code ...
    const startTimeAndEndTimeChangeHandler = (e, key) => {
      const newSessionTime = { ...sessionTime, [key]: e.target.value }
      setsessionTime(newSessionTime)
      timeSlotChangeHandler(newSessionTime)
    }
    // ... existing code ...

    const reset = () => {
      console.log('Reset function called')
      // Your reset logic here
      // settimeSlotItem(timeSlotItemArray)
      setsessionTime({ startTime: '', endTime: '' })
      setSelectedDateState(momentJalaali().locale('fa').format('jYYYY/jM/jD'))
      setcalendarValue(momentJalaali())
    }

    return (
      <div className="w-full flex flex-col">
        {/* Time Slot Inputs */}
        <div className="w-full flex flex-col px-8">
          <Typography variant="h5" className="text-center pb-2">
            {sessionTime.startTime} - {sessionTime.endTime}
          </Typography>

          <div>
            <div className="flex flex-col gap-2 mb-2">
              <label className="flex flex-col text-sm">
                ساعت شروع:
                <input
                  type="time"
                  value={sessionTime.startTime}
                  onChange={(e) => {
                    setsessionTime({
                      ...sessionTime,
                      startTime: e.target.value,
                    })
                    startTimeAndEndTimeChangeHandler(e, 'startTime')
                    // You can implement a handler to update session.startTime here
                    // For now, just log the value
                    console.log(
                      'New start time:',
                      e.target.value,
                      'for session',
                    )
                  }}
                  className="border rounded px-2 py-1 mt-1"
                />
              </label>
              <label className="flex flex-col text-sm">
                ساعت پایان:
                <input
                  type="time"
                  value={sessionTime.endTime}
                  onChange={(e) => {
                    setsessionTime({ ...sessionTime, endTime: e.target.value })
                    startTimeAndEndTimeChangeHandler(e, 'endTime')
                    // You can implement a handler to update session.endTime here
                    // For now, just log the value
                    console.log('New end time:', e.target.value, 'for session')
                  }}
                  className="border rounded px-2 py-1 mt-1"
                />
              </label>
            </div>
          </div>
        </div>

        {/* Calendar Wrapper */}
        <div className="w-full flex flex-col md:flex-row pt-8 justify-around px-0 md:px-8 items-center md:items-start">
          <div>
            <Calendar
              value={calendarValue}
              isGregorian={false}
              min={enabledRange.min}
              onChange={(value) => calendarHandler(value)}
            />
          </div>

          {/* Time Slot Wrapper */}
          <div className="w-full mt-10 md:mt-0">
            <div
              id="timeslot_box"
              className="flex  flex-wrap gap-4 justify-center text-center items-center max-h-385 overflow-y-auto"
            >
              {timeSlotIsError ? (
                <div>An error occurred: SERVER BROKEN</div>
              ) : null}
              <>
                {timeSlotIsLoading ? (
                  <div className="flex p-7 justify-center items-center w-full">
                    <CircularProgress />
                  </div>
                ) : (
                  <>
                    {timeSlotItem &&
                      timeSlotItem.map((slot, index) => (
                        <div
                          key={index}
                          className="w-[300px] p-4 rounded-2xl"
                          onClick={() => handleSelectSlot(index, slot)}
                          style={{
                            opacity: slot.isBooked ? 0.4 : 1,
                            color: slot.isSelected ? '#fff' : 'black',
                            cursor: slot.isBooked ? 'not-allowed' : 'pointer',
                            backgroundColor: slot.isSelected
                              ? 'rgb(33 48 127)'
                              : 'rgb(245 245 245)',
                          }}
                        >
                          {/* {slot.isBooked && (
                             <Typography>This Slot Booked By User</Typography>
                           )} */}
                          <h5>{`شروع: ${slot.startTime} - پایان: ${slot.endTime}`}</h5>
                        </div>
                      ))}
                  </>
                )}
              </>
            </div>
          </div>
        </div>
      </div>
    )
  },
)

export default CustomDataPickerCalendar
