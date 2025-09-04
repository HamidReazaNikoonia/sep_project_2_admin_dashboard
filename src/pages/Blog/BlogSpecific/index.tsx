import React from 'react';
import { useParams, Link, useNavigate } from 'react-router';
import {
    Box,
    Typography,
    Grid2 as Grid,
    CircularProgress,
    Button,
    Chip,
    Avatar,
    Divider,
    Paper,
    Alert
} from '@mui/material';
import {
    Edit as EditIcon,
    ArrowBack as ArrowBackIcon,
    CalendarToday as CalendarIcon,
    Person as PersonIcon,
    Schedule as ScheduleIcon,
    LocalOffer as TagIcon
} from '@mui/icons-material';
import he from 'he';
import { useBlog } from '../../../API/Blog/blog.hook';
import StyledPaper from '../../../components/StyledPaper';
import { formatDate } from '../../../utils/date';

const SERVER_FILE = process.env.REACT_APP_SERVER_FILE;

const BlogSpecific = () => {
    const { blogId } = useParams<{ blogId: string }>();
    const navigate = useNavigate();

    const { data: blogData, isLoading, isError, error } = useBlog(blogId!);

    const blog = blogData;

    if (isLoading) {
        return (
            <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
                minHeight="400px"
            >
                <CircularProgress />
                <Typography className="mr-4">در حال بارگیری اطلاعات بلاگ...</Typography>
            </Box>
        );
    }

    if (isError) {
        return (
            <Box p={3}>
                <Alert severity="error">
                    خطا در بارگیری اطلاعات بلاگ: {error?.message || 'خطای ناشناخته'}
                </Alert>
            </Box>
        );
    }

    if (!blog) {
        return (
            <Box p={3}>
                <Alert severity="warning">
                    بلاگ مورد نظر یافت نشد
                </Alert>
            </Box>
        );
    }

    // Format date helper
    const formatBlogDate = (dateString?: string) => {
        if (!dateString) return 'تاریخ نامشخص';
        try {
            return formatDate(dateString);
        } catch {
            return new Date(dateString).toLocaleDateString('fa-IR');
        }
    };

    return (
        <Box dir="rtl" p={3} className="max-w-6xl mx-auto">
            {/* Header */}
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <div className="flex items-center gap-3">
                    <Typography variant="h4" component="h1" className="font-bold">
                        جزئیات بلاگ
                    </Typography>
                    <Button
                        variant="outlined"
                        endIcon={<ArrowBackIcon className='mr-4' />}
                        onClick={() => navigate('/blog')}
                    >
                        بازگشت به لیست بلاگ‌ها
                    </Button>

                </div>

                <Button
                    variant="contained"
                    endIcon={<EditIcon className='mr-4' />}
                    component={Link}
                    to={`/blog/${blogId}/edit`}
                    color="primary"
                >
                    ویرایش بلاگ
                </Button>
            </Box>

            <Grid container spacing={3}>
                {/* Main Content */}
                <Grid size={{ xs: 12, lg: 8 }}>
                    <StyledPaper className="p-6">
                        {/* Blog Thumbnail */}
                        {blog.thumbnail ? (
                            <Box mb={4}>
                                <img
                                    src={`${SERVER_FILE}/${blog.thumbnail.file_name}`}
                                    alt={blog.title}
                                    className="w-full h-64 md:h-80 object-cover rounded-lg shadow-lg"
                                />
                            </Box>
                        ) : (
                            <Box mb={4}>
                                <img
                                    src="/public/images/placeholder.jpg"
                                    alt={blog.title}
                                    className="w-full h-64 md:h-80 object-cover rounded-lg shadow-lg"
                                />
                            </Box>
                        )}

                        {/* Blog Title */}
                        <div className='mb-2'>
                            <Typography variant="h4" component="h1" className="font-bold mb-4">
                                {blog.title}
                            </Typography>

                        </div>
                        {/* Blog Subtitle */}
                        {blog.sub_title && (
                            <Typography variant="h6" color="text.secondary" className="mb-6 text-sm leading-relaxed">
                                {blog.sub_title}
                            </Typography>
                        )}

                        <Divider className="mb-6" />

                        {/* Blog Content */}
                        <Box className="prose mt-6 prose-lg max-w-none">
                            <Typography variant="body1" className="whitespace-pre-wrap leading-6">
                                <div className="rounded-lg bg-gray-50 p-3">
                                    <div
                                        dangerouslySetInnerHTML={{ __html: he.decode(blog.content || '') }}
                                        className="text-sm leading-7 text-gray-700"
                                    />
                                </div>
                            </Typography>
                        </Box>
                    </StyledPaper>
                </Grid>

                {/* Sidebar */}
                <Grid size={{ xs: 12, lg: 4 }}>
                    {/* Blog Info Card */}
                    <StyledPaper className="p-4 mb-4">
                        <Typography variant="h6" className="font-semibold mb-4 flex items-center">
                            <PersonIcon className="ml-2" />
                            اطلاعات بلاگ
                        </Typography>

                        {/* Author */}
                        <Box className="flex items-center mb-4">
                            <Avatar className="ml-3">
                                {blog.author?.first_name?.[0] || 'ن'}
                            </Avatar>
                            <div>
                                <Typography variant="subtitle2" className="font-medium">
                                    نویسنده
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {blog.author?.first_name} {blog.author?.last_name || 'بدون نام'}
                                </Typography>
                            </div>
                        </Box>

                        <Divider className="mb-4" />

                        {/* Reading Time */}
                        <Box className="flex items-center my-2 ">
                            <ScheduleIcon className="ml-2 text-gray-500" />
                            <div>
                                <Typography variant="subtitle2" className="font-medium">
                                    زمان مطالعه
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {blog.readingTime} دقیقه
                                </Typography>
                            </div>
                        </Box>

                        <Divider className="mb-4" />

                        {/* Created Date */}
                        <Box className="flex items-center my-2 ">
                            <CalendarIcon className="ml-2 text-gray-500" />
                            <div>
                                <Typography variant="subtitle2" className="font-medium">
                                    تاریخ انتشار
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {formatBlogDate(blog.createdAt)}
                                </Typography>
                            </div>
                        </Box>

                        {/* Updated Date */}
                        {blog.updatedAt && blog.updatedAt !== blog.createdAt && (
                            <>
                                <Divider className="mb-4" />
                                <Box className="flex items-center my-2 ">
                                    <CalendarIcon className="ml-2 text-gray-500" />
                                    <div>
                                        <Typography variant="subtitle2" className="font-medium">
                                            آخرین بروزرسانی
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            {formatBlogDate(blog.updatedAt)}
                                        </Typography>
                                    </div>
                                </Box>
                            </>
                        )}
                    </StyledPaper>

                    {/* Tags Card */}
                    {blog.tags && blog.tags.length > 0 && (
                        <StyledPaper className="p-4 mb-4">
                            <Typography variant="h6" className="font-semibold pb-4 flex items-center">
                                <TagIcon className="ml-2" />
                                برچسب‌ها
                            </Typography>
                            <Box className="flex flex-wrap gap-2">
                                {blog.tags.map((tag, index) => (
                                    <Chip
                                        key={index}
                                        label={tag}
                                        variant="outlined"
                                        size="small"
                                        className="cursor-pointer hover:bg-gray-100"
                                    />
                                ))}
                            </Box>
                        </StyledPaper>
                    )}

                    {/* Blog Statistics Card */}
                    <StyledPaper className="p-4">
                        <Typography variant="h6" className="font-semibold mb-4">
                            آمار بلاگ
                        </Typography>

                        <div className="space-y-3">
                            <div className="flex justify-between items-center mt-4">
                                <Typography variant="body2" color="text.secondary">
                                    شناسه بلاگ:
                                </Typography>
                                <Typography variant="body2" className="font-mono">
                                    {blog.id || blog._id}
                                </Typography>
                            </div>

                            <Divider />

                            <div className="flex justify-between items-center mt-2">
                                <Typography variant="body2" color="text.secondary">
                                    تعداد کلمات:
                                </Typography>
                                <Typography variant="body2">
                                    {blog.content ? blog.content.replace(/<[^>]*>/g, '').split(' ').length : 0} کلمه
                                </Typography>
                            </div>

                            <Divider />

                            <div className="flex justify-between items-center mt-2">
                                <Typography variant="body2" color="text.secondary">
                                    تعداد کاراکتر:
                                </Typography>
                                <Typography variant="body2">
                                    {blog.content ? blog.content.replace(/<[^>]*>/g, '').length : 0} کاراکتر
                                </Typography>
                            </div>

                            {blog.tags && (
                                <>
                                    <Divider />
                                    <div className="flex justify-between items-center mt-2">
                                        <Typography variant="body2" color="text.secondary">
                                            تعداد برچسب:
                                        </Typography>
                                        <Typography variant="body2">
                                            {blog.tags.length} برچسب
                                        </Typography>
                                    </div>
                                </>
                            )}
                        </div>
                    </StyledPaper>
                </Grid>
            </Grid>

            {/* Additional Actions */}
            <Box mt={4} className="flex justify-center gap-3">
                <Button
                    variant="contained"
                    endIcon={<EditIcon className='mr-4' />}
                    component={Link}
                    to={`/blog/${blogId}/edit`}
                    size="large"
                >
                    ویرایش این بلاگ
                </Button>
                <Button
                    variant="outlined"
                    onClick={() => navigate('/blog')}
                    size="large"
                >
                    بازگشت به لیست
                </Button>
            </Box>

            {/* Custom CSS for blog content */}
            <style jsx>{`
        .blog-content {
          line-height: 1.8;
        }
        .blog-content h1,
        .blog-content h2,
        .blog-content h3,
        .blog-content h4,
        .blog-content h5,
        .blog-content h6 {
          margin: 1.5rem 0 1rem 0;
          font-weight: bold;
        }
        .blog-content p {
          margin: 1rem 0;
        }
        .blog-content ul,
        .blog-content ol {
          margin: 1rem 0;
          padding-right: 2rem;
        }
        .blog-content blockquote {
          border-right: 4px solid #e0e0e0;
          padding-right: 1rem;
          margin: 1rem 0;
          font-style: italic;
          color: #666;
        }
        .blog-content img {
          max-width: 100%;
          height: auto;
          border-radius: 0.5rem;
          margin: 1rem 0;
        }
      `}</style>
        </Box>
    );
};

export default BlogSpecific;