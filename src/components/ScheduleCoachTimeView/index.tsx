import React, { useEffect } from 'react'
import {
  List,
  ListItem,
  ListItemAvatar,
  Avatar,
  ListItemText,
  Typography,
  Paper,
  Divider,
} from '@mui/material' // Import your types
import { useGetAllProgramsOFSpecificCourse } from '@/API/CourseSession/courseSession.hook'

interface ScheduleCoachTimeViewProps {
  courseId: string
}

const ScheduleCoachTimeView: React.FC<ScheduleCoachTimeViewProps> = ({
  courseId,
}) => {
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

  return (
    <div className="flex flex-col md:flex-row h-full w-full gap-4 p-4">
      {/* Coaches List - Left Side */}
      <div className="w-full md:w-2/6">
        <div className="h-full p-2 bg-white border border-gray-200 rounded-lg shadow-md">
          <Typography variant="h6" className="p-2 text-right">
            مربیان
          </Typography>
          <Divider />
          <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
            {coaches.map((coach: any) => (
              <ListItem
                key={coach._id}
                alignItems="flex-start"
                className="hover:bg-gray-100 cursor-pointer items-center"
              >
                <ListItemAvatar>
                  <Avatar
                    alt={`${coach.first_name} ${coach.last_name}`}
                    sx={{
                      bgcolor: stringToColor(
                        coach.first_name + ' ' + coach.last_name,
                      ),
                    }}
                  >
                    {coach.first_name && coach.first_name.charAt(0)}
                    {coach.last_name && coach.last_name.charAt(0)}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={`${coach.first_name} ${coach.last_name}`}
                  secondary={
                    <React.Fragment>
                      {/* No mobile in new data, remove or replace */}
                      <br />
                      {programsByCoach[coach._id]?.length || 0} برنامه
                    </React.Fragment>
                  }
                  sx={{ textAlign: 'right' }}
                />
              </ListItem>
            ))}
          </List>
        </div>
      </div>

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
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 800 }}
                  className="text-right"
                >
                  نام استاد :‌ {`${coach.first_name} ${coach.last_name}`}
                </Typography>
                {/* For each program of this coach */}
                {programsByCoach[coach._id]?.map((program: any) => (
                  <div
                    key={program._id}
                    className="my-4 bg-amber-300 px-4 py-6 rounded-2xl shadow-md"
                  >
                    <Typography
                      variant="body"
                      className="text-right pb-2 text-gray-600"
                    >
                      نوع برنامه:{' '}
                      {program.program_type === 'ONLINE'
                        ? 'آنلاین مجازی'
                        : 'حضوری'}
                    </Typography>
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
                            className={`inline-block px-2 py-1 rounded-full mt-1 ${
                              session.status === 'scheduled'
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
