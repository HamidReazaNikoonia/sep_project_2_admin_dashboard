import React, { useEffect, useState } from 'react'
import {
  List,
  ListItem,
  ListItemAvatar,
  Avatar,
  ListItemText,
  Typography,
  Paper,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material' // Import your types
import { Class, ExpandMore } from '@mui/icons-material'
import { useGetAllProgramsOFSpecificCourse } from '@/API/CourseSession/courseSession.hook'
import { Link } from 'react-router'

interface ScheduleCoachTimeViewProps {
  courseId: string
}

const SERVER_FILE = process.env.REACT_APP_SERVER_FILE

const ScheduleCoachTimeView: React.FC<ScheduleCoachTimeViewProps> = ({
  courseId,
}) => {
  // Add state for accordion
  const [expandedPrograms, setExpandedPrograms] = useState<Record<string, boolean>>({})

  // Fetch programs for the course
  console.log(courseId)
  const { data, isLoading, isError } =
    useGetAllProgramsOFSpecificCourse(courseId)

  // Handle loading and error states
  if (isLoading) return <div>در حال بارگذاری...</div>
  if (isError) return <div>خطا در دریافت داده‌ها</div>

  // Extract programs
  const programs = data.data.programs

  // Group programs by coach
  const programsByCoach = programs.reduce(
    (acc: Record<string, any[]>, program: any) => {
      const coachId = program.coach?._id
      if (!coachId) return acc
      if (!acc[coachId]) acc[coachId] = []
      acc[coachId].push(program)
      return acc
    },
    {},
  )

  // Get unique coaches from programs
  const coaches = Object.values(programsByCoach).map(
    (programs: any[]) => programs[0].coach,
  )

  // useEffect(() => {
  //   console.log(data)
  //   console.log({courseId})

  // }, [])

  // Format time slot
  const formatSessionTime = (session: any) => {
    const date = new Date(session.date).toLocaleDateString('fa-IR')
    return `${date} | ${session.startTime} - ${session.endTime}`
  }

  // Handle accordion toggle
  const handleProgramAccordionChange = (programId: string) => {
    setExpandedPrograms(prev => ({
      ...prev,
      [programId]: !prev[programId]
    }))
  }

  return (
    <div className="flex flex-col md:flex-row h-full w-full gap-4 p-4">
      {/* Coaches List - Left Side */}

      {/* Schedule - Right Side */}
      <div className="w-full">
        <div className="h-full px-2 md:px-5 py-6 bg-white border border-gray-200 rounded-lg shadow-md">
          <Typography variant="h6" className="text-right mb-4">
            برنامه زمانی
          </Typography>
          <Divider />
          <div className="mt-4 space-y-4 py-4">
            {coaches.map((coach: any) => (
              <div key={coach._id} className="pb-6 border-b last:border-b-0">
                <div
                  className="text-right flex items-center gap-2"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Avatar
                      src={coach?.avatar?.file_name ? `${SERVER_FILE}/${coach.avatar.file_name}` : undefined}
                      alt={`${coach.first_name} ${coach.last_name}`}
                      sx={{ width: 48, height: 48 }}
                    >
                      {coach.first_name?.[0]}
                      {coach.last_name?.[0]}
                    </Avatar>
                  </div>
                  <div className="text-lg font-semibold text-gray-900">
                    نام استاد :‌ {`${coach.first_name} ${coach.last_name}`}

                  </div>
                </div>

                {/* For each program of this coach */}
                {programsByCoach[coach._id]?.map((program: any) => (
                  <div
                    key={program._id}
                    className="my-4 bg-amber-300 px-4 py-6 rounded-2xl shadow-md"
                  >
                    <Link to={`/course-session-program/${program._id}`}>
                      <div className="flex items-center gap-1 mb-2">
                        <Class fontSize="small" className="inline-block ml-1 text-xs text-gray-600" />
                        مشاهده جزئیات کلاس
                      </div>
                    </Link>
                    <div
                      className="text-right pb-1 text-gray-600"
                    >
                      نوع کلاس:{' '}
                      {program.program_type === 'ONLINE'
                        ? 'آنلاین مجازی'
                        : 'حضوری'}
                    </div>
                    
                    <Accordion 
                      sx={{ backgroundColor: "#f0f0f0", boxShadow: "0px 10px 15px -3px rgba(0,0,0,0.1)", mt: 2 }} 
                      expanded={expandedPrograms[program._id] || false} 
                      onChange={() => handleProgramAccordionChange(program._id)}
                    >
                      <AccordionSummary
                        expandIcon={<ExpandMore />}
                        aria-controls={`program-${program._id}-content`}
                        id={`program-${program._id}-header`}
                      >
                        <Typography className="text-right">
                          جلسات کلاس ({program.sessions.length} جلسه)
                        </Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mt-2">
                          {program.sessions.map((session: any) => (
                            <div
                              key={session._id}
                              className="px-4 py-3 bg-white border border-gray-200 rounded-lg shadow hover:shadow-lg transition-shadow"
                            >
                              <Typography
                                variant="body2"
                                className="text-right pb-2"
                                fontWeight={600}
                              >
                                {session.date} | {session.startTime} -{' '}
                                {session.endTime}
                              </Typography>
                              <Typography
                                variant="caption"
                                className={`inline-block px-2 py-1 rounded-full mt-1 ${session.status === 'scheduled'
                                    ? 'bg-blue-100 text-blue-800'
                                    : session.status === 'completed'
                                      ? 'bg-green-100 text-green-800'
                                      : 'bg-red-100 text-red-800'
                                  }`}
                              >
                                {session.status === 'scheduled'
                                  ? 'برنامه ریزی شده'
                                  : session.status === 'completed'
                                    ? 'تکمیل شده'
                                    : 'لغو شده'}
                              </Typography>
                            </div>
                          ))}
                        </div>
                      </AccordionDetails>
                    </Accordion>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// Helper function to generate avatar color from name
function stringToColor(string: string) {
  let hash = 0
  for (let i = 0; i < string.length; i++) {
    hash = string.charCodeAt(i) + ((hash << 5) - hash)
  }
  let color = '#'
  for (let i = 0; i < 3; i++) {
    const value = (hash >> (i * 8)) & 0xff
    color += `00${value.toString(16)}`.slice(-2)
  }
  return color
}

export default ScheduleCoachTimeView
