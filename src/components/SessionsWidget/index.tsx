import React, { useState, useRef } from 'react'
import { Calendar } from 'react-datepicker2'
import moment from 'moment-jalaali'
import { Paper, Typography, Button, Box } from '@mui/material'
import CustomTimePicker from '../CustomTimePicker'

interface SessionData {
    date: string
    startTime: string
    endTime: string
}

interface SessionsWidgetProps {
    onSessionSubmit?: (sessionData: SessionData) => void
    isAddingSession?: boolean
    programId?: string
}

const SessionsWidget: React.FC<SessionsWidgetProps> = ({
    onSessionSubmit,
    isAddingSession,
    programId
}) => {
    // States
    const [step, setStep] = useState<1 | 2>(1)
    const [selectedDate, setSelectedDate] = useState<string>(
        moment().locale('fa').format('jYYYY/jM/jD')
    )
    const [calendarValue, setCalendarValue] = useState(moment())
    const [startTime, setStartTime] = useState<string>('')
    const [endTime, setEndTime] = useState<string>('')
    const [errors, setErrors] = useState<{
        startTime?: string
        endTime?: string
        date?: string
    }>({})

    // Convert Persian digits to English
    const convertToEnglishDigits = (text: string) => {
        const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹']
        const englishDigits = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']

        let result = text
        persianDigits.forEach((persianDigit, index) => {
            result = result.replace(new RegExp(persianDigit, 'g'), englishDigits[index])
        })
        return result
    }

    // Convert English digits to Persian
    const convertToPersianDigits = (text: string) => {
        const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹']
        return text.replace(/[0-9]/g, (d) => persianDigits[parseInt(d)])
    }

    // Calendar change handler
    const handleCalendarChange = (selectedDate: any) => {
        setCalendarValue(selectedDate)
        const formattedDate = selectedDate.locale('fa').format('jYYYY/jM/jD')
        setSelectedDate(formattedDate)

        // Clear date error if exists
        if (errors.date) {
            setErrors(prev => ({ ...prev, date: undefined }))
        }
    }

    // Start time change handler
    const handleStartTimeChange = (time: string) => {
        setStartTime(time)

        // Clear start time error if exists
        if (errors.startTime) {
            setErrors(prev => ({ ...prev, startTime: undefined }))
        }

        // Validate end time if it exists
        if (endTime && time >= endTime) {
            setErrors(prev => ({
                ...prev,
                endTime: 'ساعت پایان باید بعد از ساعت شروع باشد'
            }))
        } else if (endTime && errors.endTime) {
            setErrors(prev => ({ ...prev, endTime: undefined }))
        }
    }

    // End time change handler
    const handleEndTimeChange = (time: string) => {
        setEndTime(time)

        // Validate end time
        if (startTime && time <= startTime) {
            setErrors(prev => ({
                ...prev,
                endTime: 'ساعت پایان باید بعد از ساعت شروع باشد'
            }))
        } else {
            setErrors(prev => ({ ...prev, endTime: undefined }))
        }
    }

    // Validation function
    const validateForm = () => {
        const newErrors: typeof errors = {}

        if (!startTime) {
            newErrors.startTime = 'ساعت شروع الزامی است'
        }

        if (!endTime) {
            newErrors.endTime = 'ساعت پایان الزامی است'
        }

        if (startTime && endTime && startTime >= endTime) {
            newErrors.endTime = 'ساعت پایان باید بعد از ساعت شروع باشد'
        }

        if (!selectedDate) {
            newErrors.date = 'انتخاب تاریخ الزامی است'
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    // Handle create session (move to step 2)
    const handleCreateSession = () => {
        if (validateForm()) {
            setStep(2)
        }
    }

    // Handle confirmation (submit session)
    const handleConfirmSession = () => {
        const sessionData: SessionData = {
            date: selectedDate,
            startTime,
            endTime
        }

        console.log('Session data:', sessionData)

        if (onSessionSubmit) {
            onSessionSubmit(sessionData)
        }

        // Reset form and go back to step 1
        resetForm()
    }

    // Reset form
    const resetForm = () => {
        setStartTime('')
        setEndTime('')
        setSelectedDate(moment().locale('fa').format('jYYYY/jM/jD'))
        setCalendarValue(moment())
        setErrors({})
        setStep(1)
    }

    // Go back to step 1
    const handleGoBack = () => {
        setStep(1)
    }

    // Calendar configuration
    const enabledRange = {
        min: moment().startOf('day')
    }

    // Render Step 1: Date and Time Selection
    const renderStep1 = () => (
        <>
            {/* Main Flex Container */}
            <div className="flex flex-col lg:flex-row gap-8 rounded-lg p-4">

                {/* Left Section - Time Inputs */}
                <div className="flex-1 space-y-6">
                    <Typography variant="subtitle1" className="text-gray-700 font-medium">
                        انتخاب زمان جلسه
                    </Typography>

                    {/* Time Display */}
                    <div className="bg-gray-300 p-4 mt-4 rounded-lg text-center">
                        <div className="text-gray-800 flex flex-row justify-center space-x-10">
                            <div className='flex flex-col gap-2'>
                                <div className='text-gray-500 text-xs'>زمان شروع</div>
                                <div className='text-gray-800 text-xl'>{startTime && convertToPersianDigits(startTime)}</div>
                            </div>
                          

                            <div className='flex flex-col gap-2'>
                                <div className='text-gray-500 text-xs'>زمان پایان</div>
                                <div className='text-gray-800 text-xl'>{endTime && convertToPersianDigits(endTime)}</div>
                            </div>
                        </div>
                    </div>

                    <div className='flex flex-col gap-6'>
                        {/* Start Time Picker */}
                        <CustomTimePicker
                            label="ساعت شروع"
                            value={startTime}
                            onChange={handleStartTimeChange}
                            error={!!errors.startTime}
                            helperText={errors.startTime}
                        />

                        {/* End Time Picker */}
                        <CustomTimePicker
                            label="ساعت پایان"
                            value={endTime}
                            onChange={handleEndTimeChange}
                            error={!!errors.endTime}
                            helperText={errors.endTime}
                        />
                    </div>

                    {/* Create Session Button */}
                    <Button
                        variant="contained"
                        color="primary"
                        fullWidth
                        onClick={handleCreateSession}
                        disabled={!startTime || !endTime || !!errors.startTime || !!errors.endTime}
                        className="mt-6"
                        size="large"
                    >
                        ایجاد جلسه
                    </Button>
                </div>

                {/* Right Section - Calendar */}
                <div className="flex-1">
                    <Typography variant="subtitle1" className="text-gray-700 font-medium mb-4">
                        انتخاب تاریخ جلسه
                    </Typography>

                    {/* Selected Date Display */}
                    <Box className="bg-blue-50 p-4 mt-4 rounded-lg text-center mb-4">
                        <Typography variant="body1" className="text-blue-800 font-medium">
                            تاریخ انتخاب شده: {convertToPersianDigits(selectedDate)}
                        </Typography>
                    </Box>

                    {/* Calendar Component */}
                    <div className="flex justify-center">
                        <Calendar
                            value={calendarValue}
                            isGregorian={false}
                            min={enabledRange.min}
                            onChange={handleCalendarChange}
                            className="shadow-sm border rounded-lg"
                        />
                    </div>

                    {errors.date && (
                        <Typography variant="caption" className="text-red-600 mt-2 block text-center">
                            {errors.date}
                        </Typography>
                    )}
                </div>
            </div>
        </>
    )

    // Render Step 2: Confirmation
    const renderStep2 = () => (
        <>

            {/* Session Summary */}
            <Box className="mb-8 p-6 bg-blue-50 rounded-lg border border-blue-200">
                <Typography variant="h5" className="text-blue-800 font-medium mb-4 text-center">
                    تایید جلسه
                </Typography>
                <Typography variant="body1" className="text-blue-700 pb-4">
                    📅 تاریخ: {convertToPersianDigits(selectedDate)}
                </Typography>
                <Typography variant="body1" className="text-blue-700">
                    🕐 زمان: {convertToPersianDigits(startTime)} تا {convertToPersianDigits(endTime)}
                </Typography>
            </Box>

            {/* Confirmation Text */}
            <Box className="mb-8 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <Typography variant="body1" className="text-yellow-800 text-center">
                    آیا مطمئن هستید که می‌خواهید جلسه را در تاریخ{' '}
                    <strong>{convertToPersianDigits(selectedDate)}</strong>{' '}
                    و ساعت{' '}
                    <strong>{convertToPersianDigits(startTime)} - {convertToPersianDigits(endTime)}</strong>{' '}
                    برگزار کنید؟
                </Typography>
            </Box>

            {/* Action Buttons */}
            <div className="flex gap-4">
                <Button
                    variant="contained"
                    disabled={isAddingSession}
                    loading={isAddingSession}
                    color="success"
                    fullWidth
                    onClick={handleConfirmSession}
                    size="large"
                >
                    بله، جلسه را ایجاد کن
                </Button>
                <Button
                    variant="outlined"
                    color="secondary"
                    fullWidth
                    onClick={handleGoBack}
                    size="large"
                >
                    بازگشت
                </Button>
            </div>
        </>
    )

    return (
        <div className="" dir="rtl">
            {step === 1 ? renderStep1() : renderStep2()}
        </div>
    )
}

export default SessionsWidget