const CoachCourseProgramList = ({ programs }: { programs: any[] }) => {

    // Helper get frist date from sessions
    const getFirstProgramSessionDate = (sessions: any[]) => {
        return sessions.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0].date;
    }

    // Helper function to render status with appropriate styling
    const renderStatus = (status: string | undefined) => {
        if (!status) return '---';
        
        const statusConfig = {
            'active': {
                label: 'فعال',
                classes: 'bg-green-100 text-green-800'
            },
            'inactive': {
                label: 'غیر فعال', 
                classes: 'bg-red-100 text-red-800'
            },
            'completed': {
                label: 'به اتمام رسیده',
                classes: 'bg-gray-100 text-gray-800' 
            }
        };

        const config = statusConfig[status as keyof typeof statusConfig];
        
        return (
            <span className={`px-2 py-1 rounded-full text-sm ${config?.classes}`}>
                {config?.label || status}
            </span>
        );
    };

    return (
      <div className="mt-8 overflow-x-auto rounded-xl shadow-xl" dir="rtl">
        <table className="w-full text-right border-collapse shadow-md ">
          {/* Table Header */}
          <thead className="bg-blue-500 text-white">
            <tr>
              <th className="p-3 font-bold">عنوان دوره</th>
              <th className="p-3 font-bold">عنوان کلاس</th>
              <th className="p-3 font-bold">نوع دوره</th>
              <th className="p-3 font-bold">تاریخ شروع</th>
              <th className="p-3 font-bold">وضعیت فعال</th>
              <th className="p-3 font-bold">تعداد دانشجو</th>
              <th className="p-3 font-bold">تاریخ ایجاد</th>
            </tr>
          </thead>
          
          {/* Table Body */}
          <tbody>
            {programs?.map((session, index) => (
              <tr 
                key={index}
                className={`${index % 2 === 0 ? 'bg-gray-100' : 'bg-gray-200'} hover:bg-blue-50 transition-colors`}
              >
                <td className="p-3 border-b border-gray-200">
                  {session?.course?.title || '---'}
                </td>
                {/* <td className="p-3 border-b border-gray-200">
                  {session?.program?.coach 
                    ? `${session.program.coach.first_name || ''} ${session.program.coach.last_name || ''}`.trim() 
                    : '---'}
                </td> */}
                <td className="p-3 border-b border-gray-200">
                  {session?.class_id?.class_title || '---'}
                </td>
                <td className="p-3 border-b border-gray-200">
                  {(() => {
                    switch(session?.program_type) {
                      case 'ONLINE': return 'آنلاین';
                      case 'ON-SITE': return 'حضوری';
                      default: return session?.program_type || '---';
                    }
                  })()}
                </td>
                <td className="p-3 border-b border-gray-200">
                  {getFirstProgramSessionDate(session?.sessions) 
                    ? new Date(getFirstProgramSessionDate(session?.sessions)).toLocaleDateString('fa-IR') 
                    : '---'}
                </td>
                <td className="p-3 border-b border-gray-200">
                  {renderStatus(session?.status)}
                </td>

                <td className="p-3 border-b border-gray-200">
                  {session?.members?.length || 0}
                </td>

                <td className="p-3 border-b border-gray-200">
                  {session?.createdAt 
                    ? session?.createdAt 
                    : '---'}
                </td>
              </tr>
            ))}
            
            {/* Empty State */}
            {programs?.length === 0 && (
              <tr>
                <td colSpan="8" className="p-6 text-center text-gray-500">
                  هیچ دوره ای ثبت نام نشده است
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    );
  };

  export default CoachCourseProgramList;