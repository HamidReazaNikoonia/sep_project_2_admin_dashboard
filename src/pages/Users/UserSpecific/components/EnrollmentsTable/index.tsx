import { useEffect, useState } from "react";

    // Helper function to filter programs by status
    const excludeProgramByStatus = (programs: any[], status: 'active' | 'inactive' | 'completed') => {
      return programs.filter(program => program.status === status);
  };

const EnrollmentsTable = ({ enrollments }: { enrollments: any[] }) => {

  const [selectedProgramStatus, setselectedPetprogramStatus] = useState('active');
  const [filteredProgram, setFilteredProgram] = useState((enrollments && excludeProgramByStatus(enrollments, 'active')));

  useEffect(() => {
    setFilteredProgram(excludeProgramByStatus(enrollments, selectedProgramStatus as 'active' | 'inactive' | 'completed'));
  }, [selectedProgramStatus]);

    // Helper function to render status with appropriate styling
    const renderStatus = (status: boolean | undefined, label: string) => {
        if (status === undefined) return '---';
        
        return (
            <span className={`px-2 py-1 rounded-full text-sm ${
                status 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
            }`}>
                {status ? label : `غیر ${label}`}
            </span>
        );
    };

    return (
      <div className="mt-8 overflow-x-auto rounded-xl shadow-xl" dir="rtl">

        <div className="flex gap-4 mb-4 mr-2">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox" 
              checked={selectedProgramStatus === 'active'}
              onChange={() => setselectedPetprogramStatus('active')}
              className="form-checkbox h-5 w-5 text-blue-600"
            />
            <span className="mr-2">فعال</span>
          </label>

          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={selectedProgramStatus === 'inactive'} 
              onChange={() => setselectedPetprogramStatus('inactive')}
              className="form-checkbox h-5 w-5 text-blue-600"
            />
            <span className="mr-2">غیر فعال</span>
          </label>


          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={selectedProgramStatus === 'completed'}
              onChange={() => setselectedPetprogramStatus('completed')}
              className="form-checkbox h-5 w-5 text-blue-600" 
            />
            <span className="mr-2">به اتمام رسیده</span>
          </label>
        </div>

        <table className="w-full text-right border-collapse shadow-md ">
          {/* Table Header */}
          <thead className="bg-blue-500 text-white">
            <tr>
              <th className="p-3 font-bold">عنوان دوره</th>
              <th className="p-3 font-bold">استاد</th>
              <th className="p-3 font-bold">عنوان کلاس</th>
              <th className="p-3 font-bold">نوع دوره</th>
              <th className="p-3 font-bold">تاریخ شروع</th>
              <th className="p-3 font-bold">وضعیت فعال</th>
              <th className="p-3 font-bold">وضعیت اعتبار</th>
              <th className="p-3 font-bold">وضعیت تکمیل</th>
            </tr>
          </thead>
          
          {/* Table Body */}
          <tbody>
            {!!filteredProgram.length && filteredProgram?.map((session, index) => (
              <tr 
                key={index}
                className={`${index % 2 === 0 ? 'bg-gray-100' : 'bg-gray-200'} hover:bg-blue-50 transition-colors`}
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
                <td className="p-3 border-b border-gray-200">
                  {renderStatus(session?.is_active, 'فعال')}
                </td>
                <td className="p-3 border-b border-gray-200">
                  {renderStatus(session?.is_valid, 'معتبر')}
                </td>
                <td className="p-3 border-b border-gray-200">
                  {renderStatus(session?.is_completed, 'تکمیل شده')}
                </td>
              </tr>
            ))}
            
            {/* Empty State */}
            {filteredProgram?.length === 0 && (
              <tr>
                <td colSpan={8} className="p-6 text-center text-gray-500">
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