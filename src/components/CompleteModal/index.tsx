// src/components/CompleteModal/index.tsx
import { useGetProgramMembers } from '@/API/CourseSession/courseSession.hook'
import React, { useState } from 'react'
import moment from 'moment-jalaali'
import { convertToPersianDigits } from '@/utils/helper'

interface User {
  _id: string
  first_name: string
  last_name: string
  avatar?: {
    file_name: string
  }
}

interface CompleteModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: { presentUsers: string[], description: string }) => void
  programId: string
}

const SERVER_FILE = process.env.REACT_APP_SERVER_FILE

const CompleteModal: React.FC<CompleteModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  programId
}) => {
  const [presentUsers, setPresentUsers] = useState<string[]>([])
  const [description, setDescription] = useState('')

  const { data: members } = useGetProgramMembers(programId)

  if (!isOpen) return null;
  if (!members) return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-gray-300 opacity-80" />
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-2xl p-6 z-10 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    </div>
  );

  console.log('members', members)

  const handleUserToggle = (userId: string) => {
    setPresentUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    )
  }

  const handleSubmit = () => {
    onSubmit({
      presentUsers,
      description
    })
    // Reset form
    setPresentUsers([])
    setDescription('')
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-gray-300 opacity-80"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div 
        className="relative bg-white rounded-lg shadow-xl w-full max-w-2xl p-6 z-10 max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
        dir="rtl"
      >
        <div className="space-y-6">
          {/* Header */}
          <div className="border-b pb-4">
            <h3 className="text-xl font-medium text-gray-900">
              تکمیل جلسه
            </h3>
          </div>

          {/* Members List */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-700">لیست حضور و غیاب</h4>
            <div className="space-y-2">
              {members.map((member: any) => (
                <div 
                  key={member._id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center space-x-3 space-x-reverse">
                    {/* Avatar */}
                    <div className="w-10 h-10 rounded-full overflow-hidden">
                      {member?.user?.avatar?.file_name ? (
                        <img
                          src={`${SERVER_FILE}/${member.user.avatar.file_name}`}
                          alt={`${member.user.first_name} ${member.user.last_name}`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                          <span className="text-gray-600 text-sm">
                            {member.user.first_name[0]}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    {/* Name */}
                    <span className="font-medium text-gray-800">
                      {member.user.first_name} {member.user.last_name}
                    </span>

                    <span className="font-medium text-xs text-gray-800 mr-4">
                        تاریخ ثبت نام: &nbsp;
                        {member?.enrolledAt ? convertToPersianDigits(moment(member.enrolledAt).format('jYYYY/jM/jD')) : '-'}
                    </span>
                  </div>

                  {/* Checkbox */}
                  <div 
                    className={`w-6 h-6 rounded border cursor-pointer flex items-center justify-center transition-colors
                      ${presentUsers.includes(member.user.id) 
                        ? 'bg-green-500 border-green-500' 
                        : 'border-gray-300 hover:border-green-500'
                      }`}
                    onClick={() => handleUserToggle(member.user.id)}
                  >
                    {presentUsers.includes(member.user.id) && (
                      <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label htmlFor="description" className="block font-medium text-gray-700">
              توضیحات جلسه
            </label>
            <textarea
              id="description"
              rows={4}
              className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="توضیحات خود را وارد کنید..."
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 space-x-reverse pt-4 border-t">
            <button
              type="button"
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              onClick={onClose}
            >
              انصراف
            </button>
            <button
              type="button"
              className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              onClick={handleSubmit}
            >
              ثبت حضور و غیاب
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CompleteModal