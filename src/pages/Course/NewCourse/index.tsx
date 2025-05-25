//@ts-nocheck
import React, { useState } from 'react';
import { useFieldArray } from 'react-hook-form';
import { Add as AddIcon, Delete as DeleteIcon, Upload as UploadIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router';
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
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { useCreateCourse, useCourseCategories } from '../../../API/Course/course.hook';
import StyledPaper from '../../../components/StyledPaper';
import { showToast } from '../../../utils/toast';
import ImageUploader from 'react-images-upload';

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

interface UploadedFile {
  _id: string;
  file_name: string;
}

interface FileUploadState {
  [key: string]: {
    uploading: boolean;
    error: string | null;
    file: File | null;
    uploadedFile: UploadedFile | null;
  };
}

const NewCourse = () => {
  const navigate = useNavigate();
  const [thumbnailImage, setThumbnailImage] = useState<File | null>(null);
  const [thumbnailUploading, setThumbnailUploading] = useState(false);
  const [thumbnailUploadedFile, setThumbnailUploadedFile] = useState<UploadedFile | null>(null);
  const [fileUploads, setFileUploads] = useState<FileUploadState>({});
  const { data: categories = [] } = useCourseCategories();
  const createCourse = useCreateCourse();

  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
    watch,
    setValue,
    reset,
  } = useForm<FormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      is_have_licence: false,
      course_status: true,
      sample_media: [{ media_type: '', media_title: '', url_address: '' }],
      course_objects: [],
    },
  });

  const { fields: sampleMediaFields, append: appendSampleMedia, remove: removeSampleMedia } = 
    useFieldArray({
      name: 'sample_media',
      control
    });

  const { fields: courseObjectFields, append: appendCourseObject, remove: removeCourseObject } = 
    useFieldArray({
      name: 'course_objects',
      control
    });

  const uploadFile = async (file: File): Promise<UploadedFile> => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch(`${SERVER_URL}/admin/setting/upload`, {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error('Upload failed');
    }
    
    const data = await response.json();
    return data.uploadedFile;
  };

  const handleThumbnailUpload = async () => {
    if (!thumbnailImage) return;

    setThumbnailUploading(true);
    try {
      const uploadedFile = await uploadFile(thumbnailImage);
      setThumbnailUploadedFile(uploadedFile);
      showToast('موفق', 'تصویر دوره با موفقیت آپلود شد', 'success');
    } catch (error) {
      showToast('خطا', 'خطا در آپلود تصویر دوره', 'error');
    } finally {
      setThumbnailUploading(false);
    }
  };

  const handleFileUpload = async (key: string) => {
    const fileState = fileUploads[key];
    if (!fileState?.file) return;

    setFileUploads(prev => ({
      ...prev,
      [key]: { ...prev[key], uploading: true, error: null }
    }));

    try {
      const uploadedFile = await uploadFile(fileState.file);
      setFileUploads(prev => ({
        ...prev,
        [key]: { ...prev[key], uploading: false, uploadedFile }
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

  const onSubmit = async (data: FormData) => {
    console.log({kir:data});
    try {
      // Check if thumbnail is uploaded
      if (!thumbnailUploadedFile?._id) {
        showToast('خطا', 'لطفا تصویر دوره را آپلود کنید', 'error');
        return;
      }

      // Prepare sample media with uploaded file IDs
      const sampleMediaWithFiles = data.sample_media.map((media, index) => {
        const uploadKey = `sample_media_${index}`;
        const uploadedFile = fileUploads[uploadKey]?.uploadedFile;
        if (!uploadedFile?._id) {
          throw new Error(`لطفا فایل نمونه ${index + 1} را آپلود کنید`);
        }
        return {
          media_type: media.media_type,
          media_title: media.media_title,
          url_address: media.url_address,
          file: uploadedFile._id,
        };
      });

      // Prepare course objects with uploaded file IDs
      const courseObjectsWithFiles = data.course_objects.map((object, index) => {
        const uploadKey = `course_object_${index}`;
        const uploadedFile = fileUploads[uploadKey]?.uploadedFile;
        if (!uploadedFile?._id) {
          throw new Error(`لطفا فایل سرفصل ${index + 1} را آپلود کنید`);
        }
        return {
          subject_title: object.subject_title,
          status: object.status,
          duration: object.duration,
          files: uploadedFile._id,
        };
      });

      const courseData = {
        ...data,
        tumbnail_image: thumbnailUploadedFile._id,
        sample_media: sampleMediaWithFiles,
        course_objects: courseObjectsWithFiles,
      };

      console.log('Submitting course data:', courseData);

      await createCourse.mutateAsync(courseData);

      showToast('موفق', 'دوره با موفقیت ایجاد شد', 'success');
      navigate('/courses');
    } catch (error) {
      if (error instanceof Error) {
        showToast('خطا', error.message, 'error');
      } else {
        showToast('خطا', 'خطا در ایجاد دوره', 'error');
      }
      console.error('Error submitting form:', error);
    }
  };

  return (
    <Box dir="rtl" p={3}>
      <Typography className='pb-4' variant="h4" gutterBottom>
        ایجاد دوره جدید
      </Typography>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Grid container spacing={3}>
          {/* Basic Information */}
          <Grid size={12}>
            <StyledPaper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                اطلاعات اصلی
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


                <Grid size={{ xs: 12, md: 4 }}>
                  <TextField
                    {...register('slug')}
                    fullWidth
                    label="کلمه کلیدی"
                    error={!!errors.slug}
                    helperText={errors.slug?.message}
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
                      />
                    }
                    label="دارای گواهینامه"
                  />
                </Grid>
              </Grid>
            </StyledPaper>
          </Grid>

          {/* Thumbnail Image */}
          <Grid size={12}>
            <StyledPaper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                تصویر دوره
              </Typography>
              <Box>
                <ImageUploader
                  withIcon={true}
                  buttonText="انتخاب تصویر دوره"
                  onChange={(files) => {
                    setThumbnailImage(files[0]);
                    setThumbnailUploadedFile(null);
                  }}
                  imgExtension={['.jpg', '.jpeg', '.png']}
                  maxFileSize={5242880}
                  singleImage={true}
                  withPreview={true}
                />
                {thumbnailImage && !thumbnailUploadedFile && (
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleThumbnailUpload}
                    disabled={thumbnailUploading}
                    startIcon={thumbnailUploading ? <CircularProgress size={20} /> : <UploadIcon />}
                    sx={{ mt: 2 }}
                  >
                    آپلود تصویر دوره
                  </Button>
                )}
                {thumbnailUploadedFile && (
                  <Alert severity="success" sx={{ mt: 2 }}>
                    تصویر با موفقیت آپلود شد
                  </Alert>
                )}
              </Box>
            </StyledPaper>
          </Grid>

          {/* Uploader Sample Media */}
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
                      >
                        <MenuItem value="VIDEO">ویدیو</MenuItem>
                        <MenuItem value="AUDIO">صوت</MenuItem>
                        <MenuItem value="PDF">PDF</MenuItem>
                      </TextField>
                    </Grid>

                    <Grid size={{ xs: 12, md: 4 }}>
                      <TextField
                        {...register(`sample_media.${index}.url_address`)}
                        fullWidth
                        label="آدرس URL"
                        error={!!errors.sample_media?.[index]?.url_address}
                        helperText={errors.sample_media?.[index]?.url_address?.message}
                      />
                    </Grid>

                    <Grid size={12}>
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
                        style={{ display: 'none' }}
                        id={`sample-media-file-${index}`}
                      />
                      <Box display="flex" alignItems="center" gap={2}>
                        <label htmlFor={`sample-media-file-${index}`}>
                          <Button variant="outlined" component="span">
                            انتخاب فایل
                          </Button>
                        </label>
                        {fileUploads[`sample_media_${index}`]?.file && !fileUploads[`sample_media_${index}`]?.uploadedFile && (
                          <Button
                            variant="contained"
                            onClick={() => handleFileUpload(`sample_media_${index}`)}
                            disabled={fileUploads[`sample_media_${index}`]?.uploading}
                            startIcon={fileUploads[`sample_media_${index}`]?.uploading ? <CircularProgress size={20} /> : <UploadIcon />}
                          >
                            آپلود فایل
                          </Button>
                        )}
                        {fileUploads[`sample_media_${index}`]?.uploadedFile && (
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
                      >
                        <MenuItem value="PUBLIC">عمومی</MenuItem>
                        <MenuItem value="PRIVATE">خصوصی</MenuItem>
                      </TextField>
                    </Grid>

                    <Grid size={12}>
                      <input
                        type="file"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            register(`course_objects.${index}.files`).onChange(file);
                            setFileUploads(prev => ({
                              ...prev,
                              [`course_object_${index}`]: { file, uploading: false, error: null, uploadedFile: null }
                            }));
                          }
                        }}
                        style={{ display: 'none' }}
                        id={`course-object-file-${index}`}
                      />
                      <Box display="flex" alignItems="center" gap={2}>
                        <label htmlFor={`course-object-file-${index}`}>
                          <Button variant="outlined" component="span">
                            انتخاب فایل
                          </Button>
                        </label>
                        {fileUploads[`course_object_${index}`]?.file && !fileUploads[`course_object_${index}`]?.uploadedFile && (
                          <Button
                            variant="contained"
                            onClick={() => handleFileUpload(`course_object_${index}`)}
                            disabled={fileUploads[`course_object_${index}`]?.uploading}
                            startIcon={fileUploads[`course_object_${index}`]?.uploading ? <CircularProgress size={20} /> : <UploadIcon />}
                          >
                            آپلود فایل
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
              disabled={createCourse.isPending}
              sx={{ mt: 3 }}
            >
              {createCourse.isPending ? 'در حال ایجاد...' : 'ایجاد دوره'}
            </Button>
          </Grid>
        </Grid>
      </form>
    </Box>
  );
};

export default NewCourse;