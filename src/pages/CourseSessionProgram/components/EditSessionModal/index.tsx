import SessionsWidget from '@/components/SessionsWidget'
import { useAddNewSessionToProgram } from '@/API/CourseSession/courseSession.hook'
import React, { useEffect, useState } from 'react'
import { showToast } from '@/utils/toast'
import Spinner from '@/components/Spinner'

interface EditSessionModalProps {
    isOpen: boolean
    onClose: () => void
    programId: string
    sessionId?: string
    onSuccess?: () => void
}

const EditSessionModal: React.FC<EditSessionModalProps> = ({
    isOpen,
    onClose,
    programId,
    sessionId,
    onSuccess
}) => {
    if (!isOpen || !programId) return null

    const [loading, setLoading] = useState(false)

    const { mutate: addNewSessionToProgram, isPending: isAddingSession, isSuccess: isSessionAdded, isError: isSessionAddedError, error: sessionAddedError } = useAddNewSessionToProgram(programId)


    useEffect(() => {
        if (isSessionAdded) {
            setLoading(false);
            if (onSuccess) {
                onSuccess();
            }
            showToast('success', 'جلسه با موفقیت اضافه شد');
            onClose();
        }

        if (isSessionAddedError) {
            setLoading(false);
            showToast('error', 'خطا در اضافه کردن جلسه');

            if (sessionAddedError?.response?.data?.message && sessionAddedError?.response?.data?.message.includes('ClassProgram validation failed: sessions.3.date:')) {
                showToast('error', 'تاریخ و ساعت باید در آینده باشد ( تاریخ های امروز قابل قبول نیست )');
                return;
            } else if (sessionAddedError?.response?.data?.message && sessionAddedError?.response?.data?.message.includes('Coach has scheduling conflict on')) {
                const errorMessage = sessionAddedError?.response?.data?.message.replace('Coach has scheduling conflict on', 'این بازه زمانی رزرو شده است');
                showToast('error', errorMessage);
                return;
            } else {
                showToast('error', sessionAddedError?.response?.data?.message);
            }
        }


        if (sessionAddedError) {
            console.log({ sessionAddedError });
        }


    }, [isSessionAdded, isSessionAddedError, sessionAddedError])



    const addSessionHandler = (sessionData: any) => {
        // TODO: Implement submit logic
        console.log('Editing session for program:', programId);
        setLoading(true);

        // API Call
        addNewSessionToProgram({
            sessions: [
                {
                    date: sessionData.date,
                    startTime: sessionData.startTime,
                    endTime: sessionData.endTime
                }
            ]
        })

        // Success

        if (sessionData) {
            console.log('Session ID:', sessionData)
        }

        // Call success callback if provided
        // if (onSuccess) {
        //     onSuccess()
        // }

        // // Close modal
        // onClose()
    }

    return (
        <div style={{ zIndex: 9999 }} className="fixed inset-0 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-gray-300 opacity-80"
                onClick={onClose}
            />

            {/* Modal */}
            <div
                className="relative bg-white rounded-lg shadow-xl w-full max-w-6xl p-6 z-10 max-h-[97vh] overflow-y-auto"
                onClick={e => e.stopPropagation()}
                dir="rtl"
            >
                <div className="space-y-6">
                    {/* Header */}
                    <div className="border-b pb-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xl font-medium text-gray-900">
                                {sessionId ? 'ویرایش جلسه' : 'ایجاد جلسه جدید'}
                            </h3>
                            <button
                                onClick={onClose}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    {/* Content */}

                    <div className="space-y-1">
                        <div className=" rounded-lg p-4">
                            {loading ? (
                                <div className='flex items-center justify-center'>
                                    <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900'></div>
                                </div>
                            ) : (
                                <SessionsWidget
                                    onSessionSubmit={(sessionData) => addSessionHandler(sessionData)}
                                    programId={programId}
                                    isAddingSession={isAddingSession}
                                />
                            )}

                        </div>
                    </div>

                    {/* Footer */}
                    <div className="border-t pt-4">
                        <div className="flex justify-end gap-3">
                            <button
                                type="button"
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
                                onClick={onClose}
                            >
                                انصراف
                            </button>
                            {/* <button
                                type="button"
                                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                                onClick={handleSubmit}
                            >
                                {sessionId ? 'ذخیره تغییرات' : 'ایجاد جلسه'}
                            </button> */}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default EditSessionModal
