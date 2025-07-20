const EnrollmentsTable = ({ enrollments }: { enrollments: any[] }) => {
    return (
      <div className="mt-8 overflow-x-auto rounded-xl" dir="rtl">
        <table className="w-full text-right border-collapse shadow-md ">
          {/* Table Header */}
          <thead className="bg-blue-500 text-white">
            <tr>
              <th className="p-3 font-bold">عنوان دوره</th>
              <th className="p-3 font-bold">استاد</th>
              <th className="p-3 font-bold">عنوان کلاس</th>
              <th className="p-3 font-bold">نوع دوره</th>
              <th className="p-3 font-bold">تاریخ شروع</th>
            </tr>
          </thead>
          
          {/* Table Body */}
          <tbody>
            {enrollments?.map((session, index) => (
              <tr 
                key={index}
                className={`${index % 2 === 0 ? 'bg-gray-300' : 'bg-gray-400'} hover:bg-blue-50 transition-colors`}
              >
                <td className="p-3 border-b border-gray-200">
                  {session?.program?.course?.title || '---'}
                </td>
                <td className="p-3 border-b border-gray-200">
                  {session?.program?.coach 
                    ? `${session.program.coach.first_name || ''} ${session.program.coach.last_name || ''}`.trim() 
                    : '---'}
                </td>
                <td className="p-3 border-b border-gray-200">
                  {session?.program?.class_id?.class_title || '---'}
                </td>
                <td className="p-3 border-b border-gray-200">
                  {(() => {
                    switch(session?.program?.program_type) {
                      case 'standard': return 'عادی';
                      case 'intensive': return 'فشرده';
                      case 'online': return 'آنلاین';
                      default: return session?.program?.program_type || '---';
                    }
                  })()}
                </td>
                <td className="p-3 border-b border-gray-200">
                  {session?.startedAt 
                    ? new Date(session.startedAt).toLocaleDateString('fa-IR') 
                    : '---'}
                </td>
              </tr>
            ))}
            
            {/* Empty State */}
            {enrollments?.length === 0 && (
              <tr>
                <td colSpan="5" className="p-6 text-center text-gray-500">
                  هیچ دوره ای ثبت نام نشده است
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    );
  };


  export default EnrollmentsTable;