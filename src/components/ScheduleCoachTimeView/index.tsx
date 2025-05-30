import React from 'react';
import {
  List,
  ListItem,
  ListItemAvatar,
  Avatar,
  ListItemText,
  Typography,
  Paper,
  Divider
} from '@mui/material'; // Import your types

interface ScheduleCoachTimeViewProps {
  sessions: any[];
  coaches: any[];
}

const ScheduleCoachTimeView: React.FC<ScheduleCoachTimeViewProps> = ({ sessions, coaches }) => {
  // Group sessions by coach
  const sessionsByCoach = sessions.reduce((acc, session) => {
    if (!acc[session.coach]) {
      acc[session.coach] = [];
    }
    acc[session.coach].push(session);
    return acc;
  }, {} as Record<string, any>);

  console.log({coaches, sessions })

  // Find coach by ID
//   const getCoachById = (coachId: string) => {
//     return coaches.find(coach => coach.id === coachId);
//   };

  // Format time slot
  const formatSessionTime = (session: any) => {
    const date = new Date(session.date).toLocaleDateString('fa-IR');
    return `${date} | ${session.startTime} - ${session.endTime}`;
  };

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
            {coaches.map((coach) => (
              <ListItem 
                key={coach.id} 
                alignItems="flex-start"
                className="hover:bg-gray-100 cursor-pointer"
              >
                <ListItemAvatar>
                  <Avatar 
                    alt={`${coach.first_name} ${coach.last_name}`}
                    sx={{ bgcolor: stringToColor(coach.first_name + ' ' + coach.last_name) }}
                  >
                    {coach.first_name && coach.first_name.charAt(0)}{coach.last_name && coach.last_name.charAt(0)}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={`${coach.first_name} ${coach.last_name}`}
                  secondary={
                    <React.Fragment>
                      <Typography
                        component="span"
                        variant="body2"
                        sx={{ color: 'text.primary', display: 'inline' }}
                      >
                        {coach.mobile}
                      </Typography>
                      <br />
                      {sessionsByCoach[coach.id]?.length || 0} جلسه
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
            {coaches.map((coach) => (
              <div key={coach.id} className="pb-6 border-b last:border-b-0">
                <Typography variant="subtitle1" sx={{fontWeight: 800}} className="text-right">
                    نام استاد :‌ {`${coach.first_name} ${coach.last_name}`}
                </Typography>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mt-2">
                  {sessionsByCoach[coach.id]?.map((session) => (
                    <div 
                      key={session._id}  
                      className="px-4 py-3 bg-white border border-gray-200 rounded-lg shadow hover:shadow-lg   transition-shadow"
                    >
                      <Typography variant="body2" className="text-right pb-2">
                        {formatSessionTime(session)}
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
                        {session.status === 'scheduled' ? 'برنامه ریزی شده' : 
                         session.status === 'completed' ? 'تکمیل شده' : 'لغو شده'}
                      </Typography>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper function to generate avatar color from name
function stringToColor(string: string) {
  let hash = 0;
  for (let i = 0; i < string.length; i++) {
    hash = string.charCodeAt(i) + ((hash << 5) - hash);
  }
  let color = '#';
  for (let i = 0; i < 3; i++) {
    const value = (hash >> (i * 8)) & 0xFF;
    color += `00${value.toString(16)}`.slice(-2);
  }
  return color;
}

export default ScheduleCoachTimeView;