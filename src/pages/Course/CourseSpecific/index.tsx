import { Edit as EditIcon } from '@mui/icons-material';
import {
  Box,
  Typography,
  Grid2 as Grid,
  CircularProgress,
  Switch,
  Button,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router';
import { useCourse, useUpdateCourse } from '../../../API/Course/course.hook';
import StyledPaper from '../../../components/StyledPaper';
import { showToast } from '../../../utils/toast';
import FolderIcon from '@mui/icons-material/Folder';
const label = { inputProps: { 'aria-label': 'Switch Course Status' } };

const SERVER_URL = process.env.REACT_APP_SERVER_URL;
const SERVER_FILE = process.env.REACT_APP_SERVER_FILE;


const CourseSpecific = () => {
  const [checked, setChecked] = useState(false);
  const { course_id } = useParams();
  const { data, isLoading, isError, error } = useCourse(course_id!);
  const updateCourse = useUpdateCourse(course_id!);

  const handleChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const newStatus = event.target.checked;
    setChecked(newStatus);

    try {
      await updateCourse.mutateAsync({
        course_status: newStatus,
      });
      showToast('بروزرسانی موفق', 'وضعیت دوره با موفقیت تغییر کرد', 'success');
    } catch (error) {
      setChecked(!newStatus);
      showToast('خطا', 'خطا در بروزرسانی وضعیت دوره', 'error');
      console.error('Error updating course status:', error);
    }
  };

  useEffect(() => {
    if (data) {
      setChecked(data?.course_status);
    }
  }, [data]);

  const handleFileDownload = (fileName: string) => {
    const fileUrl = `${SERVER_FILE}/${fileName}`;
    window.open(fileUrl, '_blank');
  };

  const course = data;

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (isError) {
    return (
      <Box p={3}>
        <Typography color="error">
          Error loading course details: {error?.message || 'Unknown error'}
        </Typography>
      </Box>
    );
  }

  if (!course) {
    return (
      <Box p={3}>
        <Typography>دوره یافت نشد</Typography>
      </Box>
    );
  }

  return (
    <Box dir="rtl" p={3}>
      <div className="flex justify-between items-center mb-4">
        <Typography className="text-right" variant="h4" gutterBottom>
          جزئیات دوره
        </Typography>
        <Link to={`/courses/${course_id}/edit`}>
          <Button endIcon={<EditIcon />} variant="contained" color="warning">
            ویرایش دوره&nbsp;&nbsp;
          </Button>
        </Link>
      </div>

      <Grid container spacing={3}>
        {/* Basic Information */}
        <Grid item size={{ xs: 12, md: 6 }}>
          <StyledPaper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              اطلاعات اصلی
            </Typography>
            <Grid container spacing={2}>
              <Grid size={12}>
                <Box>
                  <Typography variant="subtitle2" color="textSecondary">
                    عنوان دوره
                  </Typography>
                  <Typography>{course.title}</Typography>
                </Box>
              </Grid>

              {course.sub_title && (
                <Grid size={12}>
                  <Box>
                    <Typography variant="subtitle2" color="textSecondary">
                      زیرعنوان
                    </Typography>
                    <Typography>{course.sub_title}</Typography>
                  </Box>
                </Grid>
              )}

              <Grid size={6}>
                <Box>
                  <Typography variant="subtitle2" color="textSecondary">
                    نوع دوره
                  </Typography>
                  <Typography>
                    {course.course_type === 'HOZORI' ? 'حضوری' : 'آفلاین'}
                  </Typography>
                </Box>
              </Grid>

              <Grid size={6}>
                <Box>
                  <Typography variant="subtitle2" color="textSecondary">
                    دسته‌بندی
                  </Typography>
                  <Typography>
                    {course.course_category?.name || '-'}
                  </Typography>
                </Box>
              </Grid>

              <Grid size={6}>
                <Box>
                  <Typography variant="subtitle2" color="textSecondary">
                    مدت دوره
                  </Typography>
                  <Typography>
                    {course.course_duration ? `${course.course_duration} ساعت` : '-'}
                  </Typography>
                </Box>
              </Grid>

              <Grid size={6}>
                <Box>
                  <Typography variant="subtitle2" color="textSecondary">
                    زبان دوره
                  </Typography>
                  <Typography>{course.course_language || '-'}</Typography>
                </Box>
              </Grid>
            </Grid>
          </StyledPaper>
        </Grid>

        {/* Price and Capacity */}
        <Grid size={{ xs: 12, md: 3 }}>
          <StyledPaper sx={{ p: 3, minHeight: { xs: 'auto', md: '318px' } }}>
            <Typography variant="h6" gutterBottom>
              قیمت و ظرفیت
            </Typography>
            <Box mt={2}>
              <Typography variant="subtitle2" color="textSecondary">
                قیمت دوره
              </Typography>
              <Typography>{course.price.toLocaleString()} تومان</Typography>
            </Box>
            <Box mt={2}>
              <Typography variant="subtitle2" color="textSecondary">
                ظرفیت دوره
              </Typography>
              <Typography>
                {course.member.length} / {course.max_member_accept} نفر
              </Typography>
            </Box>
          </StyledPaper>
        </Grid>

        {/* Status and Coach */}
        <Grid size={{ xs: 12, md: 3 }}>
          <StyledPaper sx={{ p: 3, minHeight: { xs: 'auto', md: '318px' } }}>
            <div className="flex flex-col gap-4">
              <div>
                <Typography variant="h6" gutterBottom>
                  مدرس دوره
                </Typography>
                <Typography>
                  {course.coach_id?.name || '-'}
                </Typography>
              </div>

              {/* Status */}
              <div className="flex justify-between gap-2">
                <Typography variant="h6" gutterBottom>
                  وضعیت
                </Typography>
                <div className="flex items-center gap-2">
                  <div className="text-sm">{checked ? 'فعال' : 'غیر فعال'}</div>
                  <Switch
                    {...label}
                    size="medium"
                    color="warning"
                    checked={checked}
                    onChange={handleChange}
                    disabled={updateCourse.isPending}
                  />
                </div>
              </div>
            </div>
          </StyledPaper>
        </Grid>

        {/* Course Objects */}
        <Grid size={12}>
          <StyledPaper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              سرفصل‌های دوره <span className="text-sm text-gray-500">( {course.course_objects?.length} سرفصل ) </span>
            </Typography>
            <Grid container spacing={2}>
              {course.course_objects.map((object, index) => (
                <Grid key={index} size={12}>
                  <div className="flex flex-row md:flex-col justify-between md:justify-start items-center md:items-start">
                    <div className="flex items-center gap-2">
                    <Box sx={{ p: 2, border: '1px solid #eee', borderRadius: 1 }}>
                    <Typography variant="subtitle1">
                      {object.subject_title}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      مدت زمان: {object.duration} دقیقه
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      وضعیت: {object.status === 'PUBLIC' ? 'رایگان' : 'پرداختی'}
                    </Typography>
                  </Box>
                    </div>


                    {/* Files */}
                    <div className="flex items-center md:pr-4">
                    {object.files && (
                  <Button 
                    endIcon={<FolderIcon className='text-gray-400 mr-2' />} 
                    variant="outlined" 
                    size="small"
                    onClick={() => handleFileDownload(object.files.file_name)}
                  >
                    مشاهده فایل
                  </Button>
                )}
                    </div>
                  </div>
                </Grid>
              ))}
            </Grid>
          </StyledPaper>
        </Grid>

        {/* Sample Media */}
        <Grid size={12}>
          <StyledPaper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              نمونه‌های آموزشی
            </Typography>
            <Grid container spacing={2}>
              {course.sample_media.map((media, index) => (
                <Grid key={index} size={{ xs: 12, sm: 6, md: 4 }}>
                  <Box sx={{ p: 2, border: '1px solid #eee', borderRadius: 1 }}>
                    <Typography variant="subtitle1">
                      {media.media_title}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      نوع: {media.media_type}
                    </Typography>
                    {media.url_address && (
                      <Button
                        variant="outlined"
                        size="small"
                        href={media.url_address}
                        target="_blank"
                        sx={{ mt: 1 }}
                      >
                        مشاهده
                      </Button>
                    )}
                  </Box>
                </Grid>
              ))}
            </Grid>
          </StyledPaper>
        </Grid>

        {/* Thumbnail Image */}
        <Grid size={12}>
          <StyledPaper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              تصویر شاخص
            </Typography>
            <Box
              component="img"
              src={`${SERVER_FILE}/${course.tumbnail_image?.file_name || ''}`}
              alt="Course thumbnail"
              sx={{
                width: '100%',
                maxWidth: 400,
                height: 'auto',
                borderRadius: 1,
                objectFit: 'cover',
              }}
            />
          </StyledPaper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default CourseSpecific;