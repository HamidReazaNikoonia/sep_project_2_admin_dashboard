import React, { useState } from 'react';
import { useParams, Link } from 'react-router';
import moment from 'moment-jalaali';
import {
    ArrowBack,
    Person,
    Email,
    Phone,
    Assignment,
    Schedule,
    PriorityHigh,
    AttachFile,
    QuestionAnswer,
    Edit,
    Save,
    Cancel,
    CheckCircle,
    Error,
    Visibility,
    VisibilityOff,
    AdminPanelSettings,
    School,
    SupportAgent,
    Payment,
    Security,
    Help,
    BugReport,
    LocalOffer,
    Info,
    LiveHelp,
    Settings,
    Send,
    CloudUpload,
    Close,
} from '@mui/icons-material';
import { Avatar, Chip, Button, Select, MenuItem, FormControl, InputLabel, TextareaAutosize } from '@mui/material';
import { useTicket, useUpdateTicketGeneral, useMarkTicketAsReadGeneral, useReplyToTicket } from '../../../API/Ticket/ticket.hook';
import { Ticket } from '../../../API/Ticket/types';
import { a } from 'vitest/dist/chunks/suite.B2jumIFP.js';
import { convertToPersianDigits } from '@/utils/helper';

const SERVER_FILE = process.env.REACT_APP_SERVER_FILE;

const TicketSpecific = () => {
    const { ticket_id } = useParams<{ ticket_id: string }>();
    const { data: ticketData, isLoading, error, refetch } = useTicket(ticket_id!);

    // Mutations
    const updateTicketMutation = useUpdateTicketGeneral();
    const markAsReadMutation = useMarkTicketAsReadGeneral();
    const replyToTicketMutation = useReplyToTicket(ticket_id!);

    // Edit mode state
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({
        status: '',
        priority: '',
        category: '',
    });

    // 2. Add reply form state
    const [replyForm, setReplyForm] = useState({
        message: '',
        attachments: [] as File[]
    });

    const ticket = ticketData;

    // Initialize edit form when ticket data loads
    React.useEffect(() => {
        if (ticket && !isEditing) {
            setEditForm({
                status: ticket.status,
                priority: ticket.priority,
                category: ticket.category,
            });
        }
    }, [ticket, isEditing]);

    // Mark as read when component loads
    React.useEffect(() => {
        if (ticket && !ticket.is_read_by_admin) {
            markAsReadMutation.mutate(ticket_id!);
        }
    }, [ticket, ticket_id, markAsReadMutation]);

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (error || !ticket) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                <Error className="text-red-500 text-4xl mb-2" />
                <p className="text-red-700">خطا در بارگذاری اطلاعات تیکت</p>
                <button
                    onClick={() => refetch()}
                    className="mt-3 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                    تلاش مجدد
                </button>
            </div>
        );
    }

    // Helper functions
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'open': return 'bg-orange-100 text-orange-800';
            case 'in_progress': return 'bg-yellow-100 text-yellow-800';
            case 'resolved': return 'bg-green-100 text-green-800';
            case 'closed': return 'bg-gray-100 text-gray-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'low': return 'bg-blue-100 text-blue-800';
            case 'medium': return 'bg-yellow-100 text-yellow-800';
            case 'high': return 'bg-orange-100 text-orange-800';
            case 'urgent': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getCategoryIcon = (category: string) => {
        switch (category) {
            case 'technical_support': return <SupportAgent />;
            case 'course_content': return <School />;
            case 'payment_issue': return <Payment />;
            case 'access_problem': return <Security />;
            case 'general_inquiry': return <Help />;
            case 'bug_report': return <BugReport />;
            case 'feature_request': return <LocalOffer />;
            default: return <Info />;
        }
    };

    const getCategoryLabel = (category: string) => {
        const categoryMap = {
            'technical_support': 'پشتیبانی فنی',
            'course_content': 'محتوای دوره',
            'payment_issue': 'مشکل پرداخت',
            'access_problem': 'مشکل دسترسی',
            'general_inquiry': 'سوال عمومی',
            'bug_report': 'گزارش باگ',
            'feature_request': 'درخواست ویژگی',
            'other': 'سایر'
        };
        return categoryMap[category as keyof typeof categoryMap] || category;
    };

    const getStatusLabel = (status: string) => {
        const statusMap = {
            'open': 'باز',
            'in_progress': 'در حال بررسی',
            'resolved': 'حل شده',
            'closed': 'بسته شده'
        };
        return statusMap[status as keyof typeof statusMap] || status;
    };

    const getPriorityLabel = (priority: string) => {
        const priorityMap = {
            'low': 'کم',
            'medium': 'متوسط',
            'high': 'بالا',
            'urgent': 'فوری'
        };
        return priorityMap[priority as keyof typeof priorityMap] || priority;
    };

    const handleSave = () => {
        updateTicketMutation.mutate({
            ticketId: ticket_id!,
            payload: editForm
        }, {
            onSuccess: () => {
                setIsEditing(false);
                refetch();
            }
        });
    };

    const handleCancel = () => {
        setEditForm({
            status: ticket.status,
            priority: ticket.priority,
            category: ticket.category,
        });
        // Reset reply form
        setReplyForm({
            message: '',
            attachments: []
        });
        setIsEditing(false);
    };

    // 2. Add file upload handlers
    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(event.target.files || []);
        setReplyForm(prev => ({
            ...prev,
            attachments: [...prev.attachments, ...files]
        }));
    };

    const removeFile = (index: number) => {
        setReplyForm(prev => ({
            ...prev,
            attachments: prev.attachments.filter((_, i) => i !== index)
        }));
    };

    // 3. Submit reply handler
    const submitReplyForm = async () => {
        // Check if message is not empty
        if (!replyForm.message.trim()) {
            alert('لطفا پیام خود را وارد کنید');
            return;
        }

        try {
            const payload = {
                message: replyForm.message.trim(),
                // attachments: [] // Add uploaded file IDs here after implementing file upload
            };

            await replyToTicketMutation.mutateAsync(payload);

            // Reset form and exit edit mode
            setReplyForm({
                message: '',
                attachments: []
            });
            setIsEditing(false);
            refetch();
        } catch (error) {
            console.error('Error submitting reply:', error);
            alert('خطا در ارسال پاسخ');
        }
    };

    const renderUserCard = (user: any, title: string, icon: React.ReactNode) => {
        if (!user) return null;

        const avatarUrl = user.avatar?.file_name
            ? `${SERVER_FILE}/${user.avatar.file_name}`
            : null;


        const userRoleMap = {
            'admin': 'ادمین',
            'user': 'کاربر',
            'coach': 'مربی',
        }

        return (
            <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center mb-4">
                    {icon}
                    <h3 className="text-lg font-semibold mr-2">{title}</h3>
                </div>

                <div className="flex items-center space-x-4 space-x-reverse">
                    {avatarUrl ? (
                        <img
                            src={avatarUrl}
                            alt={`${user.first_name} ${user.last_name}`}
                            className="w-16 h-16 rounded-full object-cover"
                        />
                    ) : (
                        <div className="w-16 h-16 rounded-full bg-gray-300 flex items-center justify-center">
                            <Person className="text-gray-600 text-2xl" />
                        </div>
                    )}

                    <div className="flex-1 mr-3">
                        <h4 className="text-xl font-medium text-gray-900">
                            {user.first_name} {user.last_name}
                        </h4>

                        <div className="mt-2 space-y-1">
                            {user.email && (
                                <div className="flex items-center text-gray-600">
                                    <Email className="w-4 h-4 ml-2" />
                                    <span className="text-sm">{user.email}</span>
                                </div>
                            )}

                            {user.mobile && (
                                <div className="flex items-center text-gray-600">
                                    <Phone className="w-4 h-4 ml-2" />
                                    <span className="text-sm">{user.mobile}</span>
                                </div>
                            )}

                            {user.student_id && (
                                <div className="flex items-center text-gray-600">
                                    <span className="text-sm"> کد دانشجویی {user.student_id}</span>
                                </div>
                            )}

                            {user.role && (
                                <div className="flex items-center text-gray-600">
                                    <AdminPanelSettings className="w-4 h-4 ml-2" />
                                    <span className="text-sm">{userRoleMap[user.role as keyof typeof userRoleMap]}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div dir="rtl" className="max-w-7xl mx-auto p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-row-reverse items-center justify-between bg-white rounded-lg shadow-md p-4">
                <div className="flex items-center space-x-4 space-x-reverse">
                    <Link
                        to="/tickets"
                        className="flex items-center text-blue-600 hover:text-blue-800"
                    >
                        بازگشت به لیست تیکت‌ها
                        <ArrowBack className="w-5 h-5 mx-2" />
                    </Link>
                    {/* <div className="h-6 w-px bg-gray-300" /> */}
                </div>

                <div className="flex items-center space-x-2 space-x-reverse">
                    <div className='flex gap-2 w-3xs'>
                        {!isEditing ? (
                            <Button
                                variant="outlined"
                                sx={{
                                    pl: 3,
                                    textAlign: 'center',
                                }}
                                startIcon={<Edit className='ml-2' />}
                                onClick={() => setIsEditing(true)}
                            >
                                ویرایش
                            </Button>
                        ) : (
                            <>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    startIcon={<Save className='ml-2' />}
                                    onClick={handleSave}
                                    sx={{
                                        pl: 3,
                                        textAlign: 'center',
                                    }}
                                    disabled={updateTicketMutation.isPending}
                                >
                                    ذخیره
                                </Button>
                                <Button
                                    sx={{
                                        pl: 3,
                                        textAlign: 'center',
                                    }}
                                    variant="outlined"
                                    startIcon={<Cancel className='ml-2' />}
                                    onClick={handleCancel}
                                >
                                    لغو
                                </Button>
                            </>
                        )}
                    </div>

                    {/* <h1 className="text-2xl mr-12 font-bold text-gray-900">جزئیات تیکت</h1> */}
                </div>

            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - User and Assigned Info */}
                <div className="space-y-6">
                    {/* User Information */}
                    {renderUserCard(
                        ticket.user,
                        'اطلاعات کاربر',
                        <Person className="text-blue-600" />
                    )}

                    {/* Assigned To Information */}
                    {ticket.assigned_to && renderUserCard(
                        ticket.assigned_to,
                        'تخصیص داده شده به',
                        <AdminPanelSettings className="text-green-600" />
                    )}

                    {/* Quick Stats */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h3 className="text-lg font-semibold mb-4 flex items-center">
                            <Assignment className="ml-2 text-purple-600" />
                            آمار سریع
                        </h3>

                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-gray-600">تعداد پاسخ‌ها:</span>
                                <span className="font-medium">{ticket.replies.length}</span>
                            </div>

                            <div className="flex items-center justify-between">
                                <span className="text-gray-600">آخرین پاسخ:</span>
                                <span className="font-medium">
                                    {ticket.last_reply_by === 'admin' ? 'ادمین' : 'کاربر'}
                                </span>
                            </div>

                            <div className="flex items-center justify-between">
                                <span className="text-gray-600">خوانده شده  ( ادمین ):</span>
                                {ticket.is_read_by_admin ? (
                                    <Visibility className="text-green-500" />
                                ) : (
                                    <VisibilityOff className="text-red-500" />
                                )}
                            </div>

                            <div className="flex items-center justify-between">
                                <span className="text-gray-600">خوانده شده  ( کاربر ):</span>
                                {ticket.is_read_by_user ? (
                                    <Visibility className="text-green-500" />
                                ) : (
                                    <VisibilityOff className="text-red-500" />
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column - Ticket Information */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Ticket Details */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-semibold">اطلاعات تیکت</h2>
                            <div className="flex items-center space-x-2 space-x-reverse">
                                {ticket.program_id && (
                                    <Chip
                                        icon={<Assignment />}
                                        label="مرتبط با برنامه"
                                        size="small"
                                        color="primary"
                                    />
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Title */}
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    عنوان تیکت
                                </label>
                                <h3 className="text-lg font-medium text-gray-900 bg-gray-50 p-3 rounded-md">
                                    {ticket.title}
                                </h3>
                            </div>

                            {/* Description */}
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    توضیحات
                                </label>
                                <div className="bg-gray-50 p-4 rounded-md">
                                    <p className="text-gray-900 whitespace-pre-wrap">{ticket.description}</p>
                                </div>
                            </div>

                            {/* Status */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    وضعیت
                                </label>
                                {isEditing ? (
                                    <FormControl fullWidth size="small">
                                        <Select
                                            value={editForm.status}
                                            onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                                        >
                                            <MenuItem value="open">باز</MenuItem>
                                            <MenuItem value="in_progress">در حال بررسی</MenuItem>
                                            <MenuItem value="resolved">حل شده</MenuItem>
                                            <MenuItem value="closed">بسته شده</MenuItem>
                                        </Select>
                                    </FormControl>
                                ) : (
                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(ticket.status)}`}>
                                        {getStatusLabel(ticket.status)}
                                    </span>
                                )}
                            </div>

                            {/* Priority */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    اولویت
                                </label>
                                {isEditing ? (
                                    <FormControl fullWidth size="small">
                                        <Select
                                            value={editForm.priority}
                                            onChange={(e) => setEditForm({ ...editForm, priority: e.target.value })}
                                        >
                                            <MenuItem value="low">کم</MenuItem>
                                            <MenuItem value="medium">متوسط</MenuItem>
                                            <MenuItem value="high">بالا</MenuItem>
                                            <MenuItem value="urgent">فوری</MenuItem>
                                        </Select>
                                    </FormControl>
                                ) : (
                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(ticket.priority)}`}>
                                        <PriorityHigh className="w-4 h-4 ml-1" />
                                        {getPriorityLabel(ticket.priority)}
                                    </span>
                                )}
                            </div>

                            {/* Category */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    دسته‌بندی
                                </label>
                                {isEditing ? (
                                    <FormControl fullWidth size="small">
                                        <Select
                                            value={editForm.category}
                                            onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                                        >
                                            <MenuItem value="technical_support">پشتیبانی فنی</MenuItem>
                                            <MenuItem value="course_content">محتوای دوره</MenuItem>
                                            <MenuItem value="payment_issue">مشکل پرداخت</MenuItem>
                                            <MenuItem value="access_problem">مشکل دسترسی</MenuItem>
                                            <MenuItem value="general_inquiry">سوال عمومی</MenuItem>
                                            <MenuItem value="bug_report">گزارش باگ</MenuItem>
                                            <MenuItem value="feature_request">درخواست ویژگی</MenuItem>
                                            <MenuItem value="other">سایر</MenuItem>
                                        </Select>
                                    </FormControl>
                                ) : (
                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                                        {getCategoryIcon(ticket.category)}
                                        <span className="mr-1">{getCategoryLabel(ticket.category)}</span>
                                    </span>
                                )}
                            </div>

                            {/* Dates */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    تاریخ ایجاد
                                </label>
                                <div className="flex items-center text-gray-900">
                                    <Schedule className="w-4 h-4 ml-2 text-gray-500" />
                                    {ticket.createdAt && convertToPersianDigits(moment(ticket.createdAt).format('jYYYY/jMM/jDD HH:mm'))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    آخرین بروزرسانی
                                </label>
                                <div className="flex items-center text-gray-900">
                                    <Schedule className="w-4 h-4 ml-2 text-gray-500" />
                                    {ticket.updatedAt && convertToPersianDigits(moment(ticket.updatedAt).format('jYYYY/jMM/jDD HH:mm'))}
                                </div>
                            </div>

                            {/* Show resolution_notes only when not editing and it exists */}
                            {ticket.resolution_notes && (
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        یادداشت  
                                    </label>
                                    <div className="bg-gray-50 p-4 rounded-md">
                                        <p className="text-gray-900 whitespace-pre-wrap">{ticket.resolution_notes}</p>
                                    </div>
                                </div>
                            )}

                        </div>

                        {/* Attachments */}
                        {ticket.attachments && ticket.attachments.length > 0 && (
                            <div className="mt-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    فایل‌های پیوست
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {ticket.attachments.map((attachment, index) => (
                                        <a
                                            key={index}
                                            href={`${SERVER_FILE}/${attachment.file_name}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center px-3 py-2 bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100"
                                        >
                                            <AttachFile className="w-4 h-4 ml-1" />
                                            {attachment.original_name || attachment.file_name}
                                        </a>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                </div>
            </div>
            
            {/* Reply Form */}
            <div className='w-full bg-green-400 p-4 rounded-lg shadow-2xl'>
                {/* Replace resolution_notes section with reply form */}
                { (
                                <div className="md:col-span-2 mt-6">
                                    <h4 className="text-lg font-medium text-gray-900 mb-4">ارسال پاسخ جدید</h4>

                                    <div className="space-y-4">
                                        {/* Message Textarea */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-800 mb-2">
                                                پیام <span className="text-red-500">*</span>
                                            </label>
                                            <TextareaAutosize
                                                minRows={4}
                                                maxRows={10}
                                                value={replyForm.message}
                                                onChange={(e) => setReplyForm({...replyForm, message: e.target.value})}
                                                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                                                placeholder="پیام خود را اینجا بنویسید..."
                                            />
                                        </div>

                                        {/* File Upload */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-800 mb-2">
                                                فایل‌های پیوست
                                            </label>

                                            {/* Upload Button */}
                                            <div className="flex items-center space-x-2 space-x-reverse mb-2">
                                                <input
                                                    type="file"
                                                    id="attachments"
                                                    multiple
                                                    onChange={handleFileUpload}
                                                    className="hidden"
                                                    accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif"
                                                />
                                                <label
                                                    htmlFor="attachments"
                                                    className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer"
                                                >
                                                    <CloudUpload className="w-4 h-4 ml-1" />
                                                    انتخاب فایل
                                                </label>
                                                <span className="text-xs mr-3 text-gray-700">
                                                    فرمت‌های مجاز: PDF, DOC, TXT, JPG, PNG
                                                </span>
                                            </div>

                                            {/* Selected Files List */}
                                            {replyForm.attachments.length > 0 && (
                                                <div className="space-y-2">
                                                    {replyForm.attachments.map((file, index) => (
                                                        <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                                                            <div className="flex items-center">
                                                                <AttachFile className="w-4 h-4 ml-2 text-gray-500" />
                                                                <span className="text-sm text-gray-700">{file.name}</span>
                                                                <span className="text-xs text-gray-500 mr-2">
                                                                    ({Math.round(file.size / 1024)} KB)
                                                                </span>
                                                            </div>
                                                            <button
                                                                type="button"
                                                                onClick={() => removeFile(index)}
                                                                className="text-red-500 hover:text-red-700"
                                                            >
                                                                <Close className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        <div className='flex justify-end'>
                                            
                                        <Button
                                                    sx={{
                                                        pl: 3,
                                                        textAlign: 'center',
                                                    }}
                                                    variant="contained"
                                                    color="primary"
                                                    startIcon={<Send className='ml-3' />}
                                                    onClick={submitReplyForm}
                                                >
                                                    ارسال پاسخ
                                                </Button>
                                        </div>
                                    </div>
                                </div>
                            )}
            </div>

            {/* Reply List */}
            <div className='w-full'>
                 {/* Replies Section */}
                 {ticket.replies && ticket.replies.length > 0 && (
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h3 className="text-lg font-semibold mb-4 flex items-center">
                                <QuestionAnswer className="ml-2 text-blue-600" />
                                پاسخ‌ها ({ticket.replies.length})
                            </h3>

                            <div className="space-y-4">
                                {ticket.replies.map((reply, index) => {
                                    const isAdmin = reply.sender_type === 'admin';
                                    const avatarUrl = reply.sender.avatar?.file_name
                                        ? `${SERVER_FILE}/${reply.sender.avatar.file_name}`
                                        : null;

                                    return (
                                        <div key={reply._id} className={`p-4 rounded-lg border ${isAdmin ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'}`}>
                                            <div className="flex items-start space-x-3 space-x-reverse">
                                                {avatarUrl ? (
                                                    <img
                                                        src={avatarUrl}
                                                        alt={`${reply.sender.first_name} ${reply.sender.last_name}`}
                                                        className="w-8 h-8 rounded-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
                                                        <Person className="text-gray-600 text-sm" />
                                                    </div>
                                                )}

                                                <div className="flex-1">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <h4 className="font-medium text-gray-900">
                                                            {reply.sender.first_name} {reply.sender.last_name}
                                                            {isAdmin && (
                                                                <span className="mr-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                                                    ادمین
                                                                </span>
                                                            )}
                                                        </h4>
                                                        <div className="flex items-center gap-2 space-x-reverse">
                                                            <span className="text-sm text-gray-500">
                                                                {convertToPersianDigits(moment(reply.createdAt).format('jYYYY/jMM/jDD HH:mm'))}
                                                            </span>
                                                            {/* Add is_read indicator */}
                                                            <div className="flex items-center" title="مشاهده توسط کاربر">
                                                                {reply.is_read ? (
                                                                    <Visibility className="w-4 h-4 text-green-500" />
                                                                ) : (
                                                                    <VisibilityOff className="w-4 h-4 text-red-500" />
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <p className="text-gray-700 whitespace-pre-wrap mb-3">
                                                        {reply.message}
                                                    </p>

                                                    {reply.attachments && reply.attachments.length > 0 && (
                                                        <div className="flex flex-wrap gap-2">
                                                            {reply.attachments.map((attachment, attachIndex) => (
                                                                <a
                                                                    key={attachIndex}
                                                                    href={`${SERVER_FILE}/${attachment.file_name}`}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="inline-flex items-center px-2 py-1 bg-white text-blue-700 rounded text-sm hover:bg-gray-100"
                                                                >
                                                                    <AttachFile className="w-3 h-3 ml-1" />
                                                                    {attachment.original_name || attachment.file_name}
                                                                </a>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
            </div>
        </div>
    );
};

export default TicketSpecific;