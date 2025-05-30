import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import {
  Box,
  TextField,
  Button,
  Typography,
  Grid2 as Grid,
  MenuItem,
  FormControlLabel,
  Switch,
  CircularProgress,
  Alert,
} from '@mui/material';
import { useForm, useFieldArray } from 'react-hook-form';
import { Add as AddIcon, Delete as DeleteIcon, Upload as UploadIcon } from '@mui/icons-material';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { useUpdateCourse, useCourse, useCourseCategories } from '../../../API/Course/course.hook';
import StyledPaper from '../../../components/StyledPaper';
import { showToast } from '../../../utils/toast';

const SERVER_URL = process.env.REACT_APP_SERVER_URL;
const SERVER_FILE = process.env.REACT_APP_SERVER_FILE;

// Validation schema
const schema = yup.object({
    title: yup.string().required('عنوان دوره الزامی است'),
    sub_title: yup.string().required('زیرعنوان دوره الزامی است'),
    price: yup
      .number()
      .required('قیمت دوره الزامی است')
      .min(10000, 'حداقل قیمت ۱۰,۰۰۰ تومان است'),
    course_type: yup.string().required('نوع دوره الزامی است'),
    course_category: yup.string().required('دسته‌بندی دوره الزامی است'),
    max_member_accept: yup
      .number()
      .required('حداکثر ظرفیت الزامی است')
      .min(1, 'حداقل ظرفیت ۱ نفر است')
      .integer('ظرفیت باید عدد صحیح باشد'),
    course_language: yup.string().required('زبان دوره الزامی است'),
    course_duration: yup.number().required('مدت دوره الزامی است'),
    slug: yup.string(),
    // educational_level: yup.number().required('سطح آموزشی الزامی است'),
    is_have_licence: yup.boolean().default(false),
    // coach_id: yup.string().required('انتخاب مدرس الزامی است'),
    course_status: yup.boolean().default(true),
    sample_media: yup.array().of(
      yup.object({
        media_type: yup.string().required('نوع رسانه الزامی است'),
        media_title: yup.string().required('عنوان رسانه الزامی است'),
        url_address: yup.string(),
        file: yup.mixed(),
      })
    ).min(1, 'حداقل یک نمونه رسانه الزامی است'),
    course_objects: yup.array().of(
      yup.object({
        subject_title: yup.string().required('عنوان سرفصل الزامی است'),
        status: yup.string().oneOf(['PUBLIC', 'PRIVATE']).default('PRIVATE'),
        duration: yup.number().required('مدت زمان الزامی است'),
        files: yup.mixed(),
      })
    ),
  });
  

type FormData = yup.InferType<typeof schema>;

interface FileObject {
  _id: string;
  field_name: string;
  file_name: string;
  updatedAt: string;
  createdAt: string;
}

interface SampleMedia {
  _id: string;
  media_title: string;
  media_type: string;
  url_address: string;
  file: FileObject;
}

interface CourseObject {
  _id: string;
  subject_title: string;
  status: 'PUBLIC' | 'PRIVATE';
  duration: number;
  files: FileObject;
}

const EditCourse = () => {

  const [fileUploads, setFileUploads] = useState<FileUploadState>({});


  const navigate = useNavigate();
  const { course_id } = useParams();
  const { data: courseData, isLoading: isLoadingCourse } = useCourse(course_id!);
  const { data: categories = [] } = useCourseCategories();
  const updateCourse = useUpdateCourse(course_id!);

  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
    reset,
  } = useForm<FormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      is_have_licence: false,
      course_status: true,
      course_type: '',
      sample_media: [],
      course_objects: [],
    },
  });

  const { fields: sampleMediaFields, append: appendSampleMedia, remove: removeSampleMedia } = 
    useFieldArray({
      name: 'sample_media',
      control,
    });

  const { fields: courseObjectFields, append: appendCourseObject, remove: removeCourseObject } = 
    useFieldArray({
      name: 'course_objects',
      control,
    });

  // Set form default values when course data is loaded
  useEffect(() => {
    if (courseData) {
      const course = courseData;
      console.log('Course Data:', course);
      reset({
        title: course.title,
        sub_title: course.sub_title,
        price: course.price,
        course_type: course.course_type,
        course_category: course.course_category?._id,
        max_member_accept: course.max_member_accept,
        course_language: course.course_language,
        course_duration: course.course_duration,
        educational_level: course.educational_level,
        is_have_licence: course.is_have_licence,
        coach_id: course.coach_id?._id,
        course_status: course.course_status,
        sample_media: course.sample_media,
        course_objects: course.course_objects,
        slug: course.slug,
      });
    }
  }, [courseData, reset]);

  const onSubmit = async (data: FormData) => {
    try {
      // Transform sample_media data
      const transformedSampleMedia = data.sample_media.map((media, index) => {
        const uploadKey = `sample_media_${index}`;
        const newUploadedFile = fileUploads[uploadKey]?.uploadedFile;

        console.log('newUploadedFile', {newUploadedFile, t:media.media_title});
        console.log('media', {media, fileUploads});
  
        return {
          media_type: media.media_type,
          media_title: media.media_title,
          // url_address: media.url_address,
          // If there's a new file uploaded, use its ID, otherwise use existing file ID
          file: newUploadedFile?._id || (media.file?._id || media.file),
        };
      });
  
      // Transform course_objects data
      const transformedCourseObjects = data.course_objects.map((object, index) => {
        const uploadKey = `course_object_${index}`;
        const newUploadedFile = fileUploads[uploadKey]?.uploadedFile;
  
        return {
          subject_title: object.subject_title,
          status: object.status,
          duration: object.duration,
          // If there's a new file uploaded, use its ID, otherwise use existing file ID
          files: newUploadedFile?._id || (object.files?._id || object.files),
        };
      });
  
      // Prepare the final payload
      const payload = {
        title: data.title,
        sub_title: data.sub_title,
        price: data.price,
        course_type: data.course_type,
        course_category: data.course_category,
        max_member_accept: data.max_member_accept,
        course_language: data.course_language,
        course_duration: data.course_duration,
        is_have_licence: data.is_have_licence,
        course_status: data.course_status,
        slug: data.slug,
        sample_media: transformedSampleMedia,
        course_objects: transformedCourseObjects,
      };
  
      await updateCourse.mutateAsync(payload);
      showToast('موفق', 'دوره با موفقیت بروزرسانی شد', 'success');
      navigate('/courses');
    } catch (error) {
      showToast('خطا', 'خطا در بروزرسانی دوره', 'error');
      console.error('Error updating course:', error);
    }
  };
   // File upload handler
   const handleFileUpload = async (key: string) => {
    const fileState = fileUploads[key];
    if (!fileState?.file) return;

    setFileUploads(prev => ({
      ...prev,
      [key]: { ...prev[key], uploading: true, error: null }
    }));

    try {
      const formData = new FormData();
      formData.append('file', fileState.file);
      
      const response = await fetch(`${SERVER_URL}/admin/setting/upload`, {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) throw new Error('Upload failed');
      
      const data = await response.json();
      setFileUploads(prev => ({
        ...prev,
        [key]: { ...prev[key], uploading: false, uploadedFile: data.uploadedFile }
      }));
      
      showToast('موفق', 'فایل با موفقیت آپلود شد', 'success');
    } catch (error) {
      setFileUploads(prev => ({
        ...prev,
        [key]: { ...prev[key], uploading: false, error: 'خطا در آپلود فایل' }
      }));
      showToast('خطا', 'خطا در آپلود فایل', 'error');
    }
  };

  if (isLoadingCourse) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box dir="rtl" p={{xs: 0, md:4}}>
      <Typography variant="h4" gutterBottom>
        ویرایش دوره
      </Typography>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Grid container spacing={3}>
          {/* Basic Information */}
          <Grid size={12}>
            <StyledPaper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                اطلاعات پایه
              </Typography>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    {...register('title')}
                    fullWidth
                    label="عنوان دوره"
                    error={!!errors.title}
                    helperText={errors.title?.message}
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    {...register('sub_title')}
                    fullWidth
                    label="زیرعنوان"
                    error={!!errors.sub_title}
                    helperText={errors.sub_title?.message}
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 4 }}>
                  <TextField
                    {...register('course_type')}
                    select
                    fullWidth
                    label="نوع دوره"
                    error={!!errors.course_type}
                    helperText={errors.course_type?.message}
                    defaultValue={courseData?.course_type}
                  >
                    <MenuItem value="HOZORI">حضوری</MenuItem>
                    <MenuItem value="OFFLINE">آفلاین</MenuItem>
                  </TextField>
                </Grid>

                <Grid size={{ xs: 12, md: 4 }}>
                  <TextField
                    {...register('course_category')}
                    select
                    fullWidth
                    label="دسته‌بندی"
                    error={!!errors.course_category}
                    helperText={errors.course_category?.message}
                    defaultValue={courseData?.course_category?._id}
                  >
                    {categories.map((category) => (
                      <MenuItem key={category._id} value={category._id}>
                        {category.name}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>

                <Grid size={{ xs: 12, md: 4 }}>
                  <TextField
                    {...register('price')}
                    fullWidth
                    type="number"
                    label="قیمت دوره (تومان)"
                    error={!!errors.price}
                    helperText={errors.price?.message}
                  />
                </Grid>
              </Grid>
            </StyledPaper>
          </Grid>

          {/* Course Details */}
          <Grid size={12}>
            <StyledPaper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                جزئیات دوره
              </Typography>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 3 }}>
                  <TextField
                    {...register('max_member_accept')}
                    fullWidth
                    type="number"
                    label="حداکثر ظرفیت"
                    error={!!errors.max_member_accept}
                    helperText={errors.max_member_accept?.message}
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 3 }}>
                  <TextField
                    {...register('course_duration')}
                    fullWidth
                    type="number"
                    label="مدت دوره (ساعت)"
                    error={!!errors.course_duration}
                    helperText={errors.course_duration?.message}
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 3 }}>
                  <TextField
                    {...register('course_language')}
                    fullWidth
                    label="زبان دوره"
                    error={!!errors.course_language}
                    helperText={errors.course_language?.message}
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 3 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        {...register('is_have_licence')}
                        defaultChecked={courseData?.is_have_licence}
                      />
                    }
                    label="دارای گواهینامه"
                  />
                </Grid>
              </Grid>
            </StyledPaper>
          </Grid>


           {/* Sample Media Section */}
    <Grid size={12}>
      <StyledPaper sx={{ p: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">نمونه‌های آموزشی</Typography>
          <Button
            startIcon={<AddIcon className='ml-2' />}
            onClick={() => appendSampleMedia({ 
              media_type: '', 
              media_title: '', 
              url_address: '' 
            })}
          >
            افزودن نمونه
          </Button>
        </Box>

        {sampleMediaFields.map((field, index) => (
          <Box key={field.id} sx={{ mb: 3, p: 2, border: '1px solid #eee', borderRadius: 1 }}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  {...register(`sample_media.${index}.media_title`)}
                  fullWidth
                  label="عنوان"
                  error={!!errors.sample_media?.[index]?.media_title}
                  helperText={errors.sample_media?.[index]?.media_title?.message}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  {...register(`sample_media.${index}.media_type`)}
                  select
                  fullWidth
                  label="نوع رسانه"
                  error={!!errors.sample_media?.[index]?.media_type}
                  helperText={errors.sample_media?.[index]?.media_type?.message}
                  defaultValue={courseData?.sample_media?.[index]?.media_type}
                >
                  <MenuItem value="video">ویدیو</MenuItem>
                  <MenuItem value="AUDIO">صوت</MenuItem>
                  <MenuItem value="PDF">PDF</MenuItem>
                </TextField>
              </Grid>

              <Grid size={12}>
                {/* Show existing file if available */}
                {field.file && (
                  <Box mb={2}>
                    <Typography className='pt-2 pb-4' variant="body2" color="green">
                      فایل فعلی: {field.file.file_name}
                    </Typography>
                    <Button
                      variant="outlined"
                      size="small"
                      href={`${SERVER_FILE}/${field.file.file_name}`}
                      target="_blank"
                    >
                      مشاهده فایل
                    </Button>
                  </Box>
                )}

                {/* File upload section */}
                <input
                  type="file"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      register(`sample_media.${index}.file`).onChange(file);
                      setFileUploads(prev => ({
                        ...prev,
                        [`sample_media_${index}`]: { file, uploading: false, error: null, uploadedFile: null }
                      }));
                    }
                  }}
                  name={`sample_media.${index}.file`}
                  style={{ display: 'none' }}
                  id={`sample-media-file-${index}`}
                />
                <Box display="flex" alignItems="center" gap={2}>
                  <label htmlFor={`sample-media-file-${index}`}>
                    <Button variant="outlined" component="span">
                      {field.file ? 'تغییر فایل' : 'انتخاب فایل'}
                    </Button>
                  </label>
                  {fileUploads[`sample_media_${index}`]?.file && (
                    <Button
                      variant="contained"
                      onClick={() => handleFileUpload(`sample_media_${index}`)}
                      disabled={fileUploads[`sample_media_${index}`]?.uploading}
                      startIcon={fileUploads[`sample_media_${index}`]?.uploading ? 
                        <CircularProgress size={20} /> : 
                        <UploadIcon />}
                    >
                      آپلود فایل جدید
                    </Button>
                  )}
                </Box>
              </Grid>

              <Grid size={12} display="flex" justifyContent="flex-end">
                <Button
                  color="error"
                  startIcon={<DeleteIcon className='ml-2' />}
                  onClick={() => removeSampleMedia(index)}
                >
                  حذف
                </Button>
              </Grid>
            </Grid>
          </Box>
        ))}
      </StyledPaper>
    </Grid>



{/* Course Objects Section */}
<Grid size={12}>
  <StyledPaper sx={{ p: 3 }}>
    <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
      <Typography variant="h6">سرفصل‌های دوره</Typography>
      <Button
        startIcon={<AddIcon className='ml-2' />}
        onClick={() => appendCourseObject({ 
          subject_title: '', 
          status: 'PRIVATE', 
          duration: 0,
        })}
      >
        افزودن سرفصل
      </Button>
    </Box>

    {courseObjectFields.map((field, index) => (
      <Box key={field.id} sx={{ mb: 3, p: 2, border: '1px solid #eee', borderRadius: 1 }}>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              {...register(`course_objects.${index}.subject_title`)}
              fullWidth
              label="عنوان سرفصل"
              error={!!errors.course_objects?.[index]?.subject_title}
              helperText={errors.course_objects?.[index]?.subject_title?.message}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 3 }}>
            <TextField
              {...register(`course_objects.${index}.duration`)}
              fullWidth
              type="number"
              label="مدت زمان (دقیقه)"
              error={!!errors.course_objects?.[index]?.duration}
              helperText={errors.course_objects?.[index]?.duration?.message}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 3 }}>
            <TextField
              {...register(`course_objects.${index}.status`)}
              select
              fullWidth
              label="وضعیت"
              error={!!errors.course_objects?.[index]?.status}
              helperText={errors.course_objects?.[index]?.status?.message}
              defaultValue={courseData?.course_objects?.[index]?.status}
            >
              <MenuItem value="PUBLIC">عمومی</MenuItem>
              <MenuItem value="PRIVATE">خصوصی</MenuItem>
            </TextField>
          </Grid>

          <Grid size={12}>
            {/* Show existing file if available */}
            {field.files && (
              <Box mb={2}>
                <Typography className='pt-2 pb-4' variant="body2" color="green">
                  فایل فعلی: {field.files.file_name}
                </Typography>
                <Button
                  variant="outlined"
                  size="small"
                  href={`${SERVER_FILE}/${field.files.file_name}`}
                  target="_blank"
                >
                  مشاهده فایل
                </Button>
              </Box>
            )}

            {/* File upload section */}
            <input
              type="file"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  register(`course_objects.${index}.files`).onChange(file);
                  setFileUploads(prev => ({
                    ...prev,
                    [`course_object_${index}`]: { 
                      file, 
                      uploading: false, 
                      error: null, 
                      uploadedFile: null 
                    }
                  }));
                }
              }}
              style={{ display: 'none' }}
              id={`course-object-file-${index}`}
            />
            <Box display="flex" alignItems="center" gap={2}>
              <label htmlFor={`course-object-file-${index}`}>
                <Button variant="outlined" component="span">
                  {field.files ? 'تغییر فایل' : 'انتخاب فایل'}
                </Button>
              </label>
              {fileUploads[`course_object_${index}`]?.file && !fileUploads[`course_object_${index}`]?.uploadedFile && (
                <Button
                  variant="contained"
                  onClick={() => handleFileUpload(`course_object_${index}`)}
                  disabled={fileUploads[`course_object_${index}`]?.uploading}
                  startIcon={fileUploads[`course_object_${index}`]?.uploading ? 
                    <CircularProgress size={20} /> : 
                    <UploadIcon />}
                >
                  آپلود فایل جدید
                </Button>
              )}
              {fileUploads[`course_object_${index}`]?.uploadedFile && (
                <Alert severity="success">
                  فایل با موفقیت آپلود شد
                </Alert>
              )}
            </Box>
          </Grid>

          <Grid size={12} display="flex" justifyContent="flex-end">
            <Button
              color="error"
              startIcon={<DeleteIcon className='ml-2' />}
              onClick={() => removeCourseObject(index)}
            >
              حذف سرفصل
            </Button>
          </Grid>
        </Grid>
      </Box>
    ))}
  </StyledPaper>
</Grid>

          {/* Submit Button */}
          <Grid size={12}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              size="large"
              disabled={updateCourse.isPending}
              sx={{ mt: 3 }}
            >
              {updateCourse.isPending ? 'در حال بروزرسانی...' : 'بروزرسانی دوره'}
            </Button>
          </Grid>
        </Grid>
      </form>
    </Box>
  );
};

export default EditCourse; 