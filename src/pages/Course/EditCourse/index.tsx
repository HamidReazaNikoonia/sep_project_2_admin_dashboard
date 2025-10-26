import React, { useState, useEffect, useRef } from 'react';
import CourseDescriptionForm from './CourseDescriptionForm';
import { useNavigate, useParams } from 'react-router';
import ImageUploader from 'react-images-upload';
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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { useForm } from 'react-hook-form';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Download as DownloadIcon,
  Upload as UploadIcon
} from '@mui/icons-material';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { useUpdateCourse, useCourse, useCourseCategories, useCreateOrUpdateSampleMedia, useCreateOrUpdateCourseObject } from '../../../API/Course/course.hook';
import StyledPaper from '../../../components/StyledPaper';
import { showPromiseToast, showToast } from '../../../utils/toast';

import {
  StyledTableContainer,
  StyledTable,
  StyledTableHead,
  StyledTableBody,
  StyledTableRow,
  StyledTableCell,
} from '../../../components/StyledTableContainer'
import CourseCategorySelection from '@/components/CourseCategorySelection';

const SERVER_URL = process.env.REACT_APP_SERVER_URL;
const SERVER_FILE = process.env.REACT_APP_SERVER_FILE;

// Updated validation schema without sample_media and course_objects
const schema = yup.object({
  title: yup.string().required('عنوان دوره الزامی است'),
  sub_title: yup.string().required('زیرعنوان دوره الزامی است'),
  price: yup
    .number()
    .required('قیمت دوره الزامی است')
    .min(10000, 'حداقل قیمت ۱۰,۰۰۰ ریال است'),
  price_with_discount: yup
    .number()
    .optional()
    .nullable(),
  // course_category: yup.string().required('دسته‌بندی دوره الزامی است'),
  course_language: yup.string(),
  course_duration: yup.number().required('مدت دوره الزامی است'),
  slug: yup.string(),
  is_have_licence: yup.boolean().default(false),
  course_status: yup.boolean().default(true),
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

interface Lesson {
  _id?: string;
  title: string;
  description: string;
  order: number;
  duration: number;
  status: 'PUBLIC' | 'PRIVATE';
  file: FileObject;
}

interface CourseObject {
  _id: string;
  subject_title: string;
  status: 'PUBLIC' | 'PRIVATE';
  duration: number;
  order: number;
  lessons: Lesson[];
}

interface FileUploadState {
  [key: string]: {
    file: File | null;
    uploading: boolean;
    error: string | null;
    uploadedFile: any | null;
  };
}

// Sample Media Form Component
interface SampleMediaFormProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  initialData?: SampleMedia | null;
}

const SampleMediaForm: React.FC<SampleMediaFormProps> = ({ open, onClose, onSave, initialData }) => {
  const [formData, setFormData] = useState({
    media_title: '',
    media_type: '',
    url_address: '',
  });
  const [fileUpload, setFileUpload] = useState<FileUploadState>({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        media_title: initialData?.media_title,
        media_type: initialData?.media_type,
        url_address: initialData?.url_address || '',
      });
    } else {
      setFormData({
        media_title: '',
        media_type: '',
        url_address: '',
      });
    }

    return () => {
      setFormData({
        media_title: '',
        media_type: '',
        url_address: '',
      });

      setFileUpload({});
    }


  }, [initialData, open]);

  const handleFileUpload = async () => {
    const fileState = fileUpload['sample_media_file'];
    if (!fileState?.file) return;

    setFileUpload(prev => ({
      ...prev,
      sample_media_file: { ...prev.sample_media_file, uploading: true, error: null }
    }));

    try {
      const formDataUpload = new FormData();
      formDataUpload.append('file', fileState.file);

      const response = await fetch(`${SERVER_URL}/admin/setting/upload`, {
        method: 'POST',
        body: formDataUpload,
      });

      if (!response.ok) throw new Error('Upload failed');

      const data = await response.json();
      setFileUpload(prev => ({
        ...prev,
        sample_media_file: { ...prev.sample_media_file, uploading: false, uploadedFile: data.uploadedFile }
      }));

      showToast('موفق', 'فایل با موفقیت آپلود شد', 'success');
    } catch (error) {
      setFileUpload(prev => ({
        ...prev,
        sample_media_file: { ...prev.sample_media_file, uploading: false, error: 'خطا در آپلود فایل' }
      }));
      showToast('خطا', 'خطا در آپلود فایل', 'error');
    }
  };

  const handleSave = () => {
    const saveData = {
      ...formData,
      file: fileUpload['sample_media_file']?.uploadedFile?._id || initialData?.file?._id,
      _id: initialData?._id,
    };
    console.log({ saveData })
    onSave(saveData);
    onClose();
  };

  return (
    <Dialog dir="rtl" open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{initialData ? 'ویرایش نمونه آموزشی' : 'افزودن نمونه آموزشی'}</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid size={12}>
            <TextField
              fullWidth
              label="عنوان"
              value={formData.media_title}
              onChange={(e) => setFormData(prev => ({ ...prev, media_title: e.target.value }))}
            />
          </Grid>
          <Grid size={12}>
            <TextField
              select
              fullWidth
              label="نوع رسانه"
              value={formData.media_type}
              onChange={(e) => setFormData(prev => ({ ...prev, media_type: e.target.value }))}
            >
              <MenuItem value="VIDEO">ویدیو</MenuItem>
              <MenuItem value="AUDIO">صوت</MenuItem>
              <MenuItem value="IMAGE">تصویر</MenuItem>
            </TextField>
          </Grid>
          <Grid dir="rtl" size={12}>
            {initialData?.file && (
              <Box mb={2}>
                <Typography className='py-3' variant="body2" color="green">
                  فایل فعلی: {initialData.file.file_name}
                </Typography>
                <Button
                  variant="outlined"
                  size="small"
                  href={`${SERVER_FILE}/${initialData.file.file_name}`}
                  target="_blank"
                  startIcon={<DownloadIcon className='ml-2' />}
                >
                  مشاهده فایل
                </Button>
              </Box>
            )}

            <input
              type="file"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  setFileUpload(prev => ({
                    ...prev,
                    sample_media_file: { file, uploading: false, error: null, uploadedFile: null }
                  }));
                }
              }}
              style={{ display: 'none' }}
              id="sample-media-file-input"
            />
            <Box display="flex" alignItems="center" gap={2}>
              <label htmlFor="sample-media-file-input">
                <Button variant="outlined" component="span">
                  {initialData?.file ? 'تغییر فایل' : 'انتخاب فایل'}
                </Button>
              </label>
              {fileUpload['sample_media_file']?.file && (
                <Button
                  variant="contained"
                  onClick={handleFileUpload}
                  disabled={fileUpload['sample_media_file']?.uploading}
                  startIcon={fileUpload['sample_media_file']?.uploading ?
                    <CircularProgress className='ml-2' size={20} /> :
                    <UploadIcon className='ml-2' />}
                >
                  آپلود فایل
                </Button>
              )}
              {fileUpload['sample_media_file']?.uploadedFile && (
                <Alert severity="success">فایل با موفقیت آپلود شد</Alert>
              )}
            </Box>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <div className='px-6 py-4'>
          <Button onClick={onClose}>لغو</Button>
          <Button onClick={handleSave} variant="contained">
            {initialData ? 'بروزرسانی' : 'ایجاد'}
          </Button>
        </div>
      </DialogActions>
    </Dialog>
  );
};

// Course Object Form Component
interface CourseObjectFormProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  initialData?: CourseObject | null;
  onDeleteLesson: (course_object_id: string, lesson_id: string) => void;
  onSaveNewLesson: (course_object_id: string, data: Lesson) => void;
}

const CourseObjectForm: React.FC<CourseObjectFormProps> = ({ open, onClose, onSave, onDeleteLesson, onSaveNewLesson, initialData }) => {
  const [formData, setFormData] = useState({
    subject_title: '',
    // status: 'PRIVATE' as 'PUBLIC' | 'PRIVATE',
    duration: 0,
    order: 1,
  });
  const [lessons, setLessons] = useState<Lesson[]>([]);

  // New lesson form state
  const [showNewLessonForm, setShowNewLessonForm] = useState(false);
  const newLessonFormRef = useRef<HTMLDivElement>(null);
  const [newLessonData, setNewLessonData] = useState({
    title: '',
    description: '',
    duration: 0,
    order: 1,
    status: 'PRIVATE' as 'PUBLIC' | 'PRIVATE',
  });
  const [lessonFileUpload, setLessonFileUpload] = useState<FileUploadState>({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        subject_title: initialData.subject_title,
        // status: initialData.status,
        duration: initialData.duration,
        order: initialData.order,
      });
      setLessons(initialData.lessons || []);
    } else {
      setFormData({
        subject_title: '',
        // status: 'PRIVATE',
        duration: 0,
        order: 1,
      });
      setLessons([]);
    }

    // Reset new lesson form
    setShowNewLessonForm(false);
    setNewLessonData({
      title: '',
      description: '',
      duration: 0,
      order: 1,
      status: 'PRIVATE',
    });
    setLessonFileUpload({});
  }, [initialData, open]);


  // Effect to handle scrolling when new lesson form is shown
  useEffect(() => {
    if (showNewLessonForm && newLessonFormRef.current) {
      newLessonFormRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  }, [showNewLessonForm]);

  // Delete specific lesson handler
  const deleteSpecificLessonHandler = (course_object_id: string, lesson_id: string) => {
    if (!lesson_id) {
      showToast('خطا', 'شناسه درس الزامی است', 'error');
      return;
    }
    // setLessons(prev => prev.filter(lesson => lesson._id !== lesson_id));
    onDeleteLesson(course_object_id, lesson_id);
    onClose();
    // showToast('موفق', 'درس با موفقیت حذف شد', 'success');
  };

  // Handle lesson file upload
  const handleLessonFileUpload = async () => {
    const fileState = lessonFileUpload['lesson_file'];
    if (!fileState?.file) return;

    setLessonFileUpload(prev => ({
      ...prev,
      lesson_file: { ...prev.lesson_file, uploading: true, error: null }
    }));

    try {
      const formDataUpload = new FormData();
      formDataUpload.append('file', fileState.file);

      const response = await fetch(`${SERVER_URL}/admin/setting/upload`, {
        method: 'POST',
        body: formDataUpload,
      });

      if (!response.ok) throw new Error('Upload failed');

      const data = await response.json();
      setLessonFileUpload(prev => ({
        ...prev,
        lesson_file: { ...prev.lesson_file, uploading: false, uploadedFile: data.uploadedFile }
      }));

      showToast('موفق', 'فایل با موفقیت آپلود شد', 'success');
    } catch (error) {
      setLessonFileUpload(prev => ({
        ...prev,
        lesson_file: { ...prev.lesson_file, uploading: false, error: 'خطا در آپلود فایل' }
      }));
      showToast('خطا', 'خطا در آپلود فایل', 'error');
    }
  };

  // Handle new lesson submit
  const handleNewLessonSubmit = () => {
    if (!newLessonData.title.trim()) {
      showToast('خطا', 'عنوان درس الزامی است', 'error');
      return;
    }

    const newLesson: Lesson = {
      // _id: Date.now().toString(), // Generate temporary ID
      title: newLessonData.title,
      description: newLessonData.description,
      duration: newLessonData.duration,
      order: newLessonData.order,
      status: newLessonData.status,
      file: lessonFileUpload['lesson_file']?.uploadedFile || null,
    };

    // setLessons(prev => [...prev, newLesson]);
    onSaveNewLesson(initialData?._id || '', newLesson);

    // Reset form
    setNewLessonData({
      title: '',
      description: '',
      duration: 0,
      order: 1,
      status: 'PRIVATE',
    });
    setLessonFileUpload({});
    setShowNewLessonForm(false);


    onClose();

    // showToast('موفق', 'درس جدید اضافه شد', 'success');
  };

  const handleSave = () => {
    const saveData = {
      ...formData,
      // lessons,
      _id: initialData?._id,
    };
    onSave(saveData);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle dir="rtl">{initialData ? 'ویرایش سرفصل دوره' : 'افزودن سرفصل دوره'}</DialogTitle>
      <DialogContent>
        <Grid dir="rtl" container spacing={2} sx={{ mt: 1 }}>
          <Grid size={6}>
            <TextField
              fullWidth
              label="عنوان سرفصل"
              value={formData.subject_title}
              onChange={(e) => setFormData(prev => ({ ...prev, subject_title: e.target.value }))}
            />
          </Grid>
          <Grid size={3}>
            <TextField
              fullWidth
              type="number"
              label="مدت زمان (دقیقه)"
              value={formData.duration}
              onChange={(e) => setFormData(prev => ({ ...prev, duration: Number(e.target.value) }))}
            />
          </Grid>
          <Grid size={3}>
            <TextField
              fullWidth
              type="number"
              label="ترتیب"
              value={formData.order}
              onChange={(e) => setFormData(prev => ({ ...prev, order: Number(e.target.value) }))}
            />
          </Grid>
          {/* <Grid size={12}>
            <TextField
              dir="rtl"
              sx={{textAlign: 'right'}}
              select
              fullWidth
              label="وضعیت"
              value={formData.status}
              onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as 'PUBLIC' | 'PRIVATE' }))}
            >
              <MenuItem value="PUBLIC">عمومی</MenuItem>
              <MenuItem value="PRIVATE">خصوصی</MenuItem>
            </TextField>
          </Grid> */}

          {/* Lessons Section */}
          {initialData ? (
            <Grid size={12}>
              <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mt: 2, mb: 1 }}>
                <Typography variant="h6">درس‌ها</Typography>
                <Button
                  startIcon={<AddIcon className='ml-2' />}
                  onClick={() => setShowNewLessonForm(true)}
                  variant="outlined"
                  size="small"
                >
                  افزودن درس جدید
                </Button>
              </Box>

              {lessons.length > 0 && (
                <StyledTableContainer>
                  <StyledTable>
                    <StyledTableHead>
                      <StyledTableRow>
                        <StyledTableCell>شناسه</StyledTableCell>
                        <StyledTableCell>عنوان</StyledTableCell>
                        <StyledTableCell>ترتیب</StyledTableCell>
                        <StyledTableCell>مدت زمان</StyledTableCell>
                        <StyledTableCell>فایل</StyledTableCell>
                        <StyledTableCell>عملیات</StyledTableCell>
                      </StyledTableRow>
                    </StyledTableHead>
                    <StyledTableBody>
                      {lessons.map((lesson) => (
                        <StyledTableRow key={lesson._id}>
                          <StyledTableCell>{lesson._id}</StyledTableCell>
                          <StyledTableCell>{lesson.title}</StyledTableCell>
                          <StyledTableCell>{lesson.order}</StyledTableCell>
                          <StyledTableCell>{lesson.duration} دقیقه</StyledTableCell>
                          <StyledTableCell>
                            {lesson.file && (
                              <Button
                                size="small"
                                startIcon={<DownloadIcon />}
                                href={`${SERVER_FILE}/${lesson.file.file_name}`}
                                target="_blank"
                              >
                                دانلود
                              </Button>
                            )}
                          </StyledTableCell>
                          <StyledTableCell>
                            <IconButton
                              color="error"
                              size="small"
                              onClick={() => deleteSpecificLessonHandler(initialData?._id || '', lesson._id)}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </StyledTableCell>
                        </StyledTableRow>
                      ))}
                    </StyledTableBody>
                  </StyledTable>
                </StyledTableContainer>
              )}

              {/* New Lesson Form */}
              {showNewLessonForm && (
                <Box ref={newLessonFormRef} sx={{ mt: 3, p: 3, border: '1px solid #ddd', borderRadius: 2, backgroundColor: '#f9f9f9' }}>
                  <Typography variant="h6" sx={{ mb: 2 }}>افزودن درس جدید</Typography>

                  <Grid container spacing={2}>
                    <Grid size={6}>
                      <TextField
                        fullWidth
                        label="عنوان درس"
                        value={newLessonData.title}
                        onChange={(e) => setNewLessonData(prev => ({ ...prev, title: e.target.value }))}
                        required
                      />
                    </Grid>
                    <Grid size={3}>
                      <TextField
                        fullWidth
                        type="number"
                        label="مدت زمان (دقیقه)"
                        value={newLessonData.duration}
                        onChange={(e) => setNewLessonData(prev => ({ ...prev, duration: Number(e.target.value) }))}
                      />
                    </Grid>
                    <Grid size={3}>
                      <TextField
                        fullWidth
                        type="number"
                        label="ترتیب"
                        value={newLessonData.order}
                        onChange={(e) => setNewLessonData(prev => ({ ...prev, order: Number(e.target.value) }))}
                      />
                    </Grid>
                    <Grid size={12}>
                      <TextField
                        fullWidth
                        multiline
                        rows={3}
                        label="توضیحات"
                        value={newLessonData.description}
                        onChange={(e) => setNewLessonData(prev => ({ ...prev, description: e.target.value }))}
                      />
                    </Grid>
                    <Grid size={6}>
                      <TextField
                        select
                        fullWidth
                        label="وضعیت"
                        value={newLessonData.status}
                        onChange={(e) => setNewLessonData(prev => ({ ...prev, status: e.target.value as 'PUBLIC' | 'PRIVATE' }))}
                      >
                        <MenuItem value="PUBLIC">عمومی</MenuItem>
                        <MenuItem value="PRIVATE">خصوصی</MenuItem>
                      </TextField>
                    </Grid>

                    {/* File Upload Section */}
                    <Grid size={12}>
                      <Typography variant="subtitle2" sx={{ mb: 1 }}>فایل درس</Typography>
                      <input
                        type="file"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setLessonFileUpload(prev => ({
                              ...prev,
                              lesson_file: { file, uploading: false, error: null, uploadedFile: null }
                            }));
                          }
                        }}
                        style={{ display: 'none' }}
                        id="lesson-file-input"
                      />
                      <Box display="flex" alignItems="center" gap={2}>
                        <label htmlFor="lesson-file-input">
                          <Button variant="outlined" component="span" size="small">
                            انتخاب فایل
                          </Button>
                        </label>
                        {lessonFileUpload['lesson_file']?.file && (
                          <Button
                            variant="contained"
                            size="small"
                            onClick={handleLessonFileUpload}
                            disabled={lessonFileUpload['lesson_file']?.uploading}
                            startIcon={lessonFileUpload['lesson_file']?.uploading ?
                              <CircularProgress className='ml-2' size={16} /> :
                              <UploadIcon className='ml-2' />}
                          >
                            آپلود فایل
                          </Button>
                        )}
                        {lessonFileUpload['lesson_file']?.uploadedFile && (
                          <Alert severity="success" sx={{ py: 0 }}>
                            فایل با موفقیت آپلود شد
                          </Alert>
                        )}
                      </Box>
                    </Grid>

                    {/* Form Actions */}
                    <Grid size={12}>
                      <Box display="flex" gap={2} sx={{ mt: 2 }}>
                        <Button
                          variant="contained"
                          onClick={handleNewLessonSubmit}
                          startIcon={<AddIcon className='ml-4' />}
                        >
                          افزودن درس
                        </Button>
                        <Button
                          variant="outlined"
                          onClick={() => {
                            setShowNewLessonForm(false);
                            setNewLessonData({
                              title: '',
                              description: '',
                              duration: 0,
                              order: 1,
                              status: 'PRIVATE',
                            });
                            setLessonFileUpload({});
                          }}
                        >
                          لغو
                        </Button>
                      </Box>
                    </Grid>
                  </Grid>
                </Box>
              )}
            </Grid>
          ) : (
            <div className='w-full h-full bg-gray-100'>
              <Alert severity="info">
                <h4 className='px-3'>
                  برای ثبت فایل هایی ویدیویی , ابتدا مشخصات سر فصل را وارد کنید و سر فصل را ایجاد کنید , سپس از لیست سر فصل ها با کلیک روی گزینه تغییر فایل هایی ویدیویی را ایجاد کنید
                </h4>
              </Alert>
            </div>
          )}
        </Grid>
      </DialogContent>
      <DialogActions>
        <div className='px-6 py-4'>
          <Button onClick={onClose}>لغو</Button>
          <Button onClick={handleSave} variant="contained">
            {initialData ? 'بروزرسانی' : 'ایجاد'}
          </Button>
        </div>
      </DialogActions>
    </Dialog>
  );
};

const EditCourse = () => {
  const navigate = useNavigate();
  const { course_id } = useParams();
  const { data: courseData, isLoading: isLoadingCourse } = useCourse(course_id!);
  const { data: categories = [] } = useCourseCategories();
  const updateCourse = useUpdateCourse(course_id!);


  // create or Update Sample media on course
  const createOrUpdateSampleMediaMutation = useCreateOrUpdateSampleMedia(course_id!);
  const createOrUpdateCourseObjectMutation = useCreateOrUpdateCourseObject(course_id!);

  // State for sample media and course objects
  const [sampleMedia, setSampleMedia] = useState<SampleMedia[]>([]);
  const [courseObjects, setCourseObjects] = useState<CourseObject[]>([]);

  // State for forms
  const [sampleMediaFormOpen, setSampleMediaFormOpen] = useState(false);
  const [courseObjectFormOpen, setCourseObjectFormOpen] = useState(false);
  const [editingSampleMedia, setEditingSampleMedia] = useState<SampleMedia | null>(null);
  const [editingCourseObject, setEditingCourseObject] = useState<CourseObject | null>(null);


  // State for Description
  const [shortDescription, setShortDescription] = useState<string>(courseData?.description || '');
  const [longDescription, setLongDescription] = useState<string>(courseData?.description_long || '');


  // state for categories
  const [categoriesState, setCategoriesState] = useState<string[]>([]);
  
  // state for thumbnail
  const [tumbnailImage, setTumbnailImage] = useState<string | null>(null);
  const [newTumbnailImageId, setNewTumbnailImageId] = useState<string | null>(null);


  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      is_have_licence: false,
      course_status: true,
      price_with_discount: 0,
    },
  });

  // Set form default values and state when course data is loaded
  useEffect(() => {
    if (courseData) {
      const course = courseData;
      console.log('Course Data:', course);

      // Set form data
      reset({
        title: course.title,
        sub_title: course.sub_title,
        price: course.price_real,
        price_with_discount: course.price_discount || 0,
        // course_category: course.course_category?._id,
        course_language: course.course_language,
        course_duration: course.course_duration,
        is_have_licence: course.is_have_licence,
        course_status: course.course_status,
        slug: course.slug,
      });

      // Set sample media and course objects state
      setSampleMedia(course.sample_media || []);
      setCourseObjects(course.course_objects || []);

      // Set tumbnail image
      if (course.tumbnail_image?.file_name) {
        setTumbnailImage(`${process.env.REACT_APP_SERVER_FILE}/${course.tumbnail_image?.file_name}`);
      }

      // details
      // setShortDescription(course.description || '');
      // setLongDescription(course.description_long || '');
    }
  }, [courseData, reset]);


  // use effect for create and update Sample media
  useEffect(() => {
    if (createOrUpdateSampleMediaMutation.isSuccess) {
      showToast('موفق', 'نمونه آموزشی بروزرسانی شد', 'success');
    }

    if (createOrUpdateSampleMediaMutation.isError) {
      showToast('خطا', 'خطا در بروزرسانی نمونه آموزشی', 'error');
    }
  }, [createOrUpdateSampleMediaMutation.isSuccess, createOrUpdateSampleMediaMutation.isError]);



  useEffect(() => {
    if (createOrUpdateCourseObjectMutation.isSuccess) {
      showToast('موفق', 'سرفصل دوره بروزرسانی شد', 'success');
    }

    if (createOrUpdateCourseObjectMutation.isError) {
      showToast('خطا', 'خطا در بروزرسانی سرفصل دوره', 'error');
    }
  }, [createOrUpdateCourseObjectMutation.isSuccess, createOrUpdateCourseObjectMutation.isError]);

  // Upload Thumbnail Image Handler 
  const handleUploadThumbnailImage = async (file: File): Promise<void> => {
    const formData = new FormData();
    formData.append('file', file);
    
    const uploadPromise = fetch(`${process.env.REACT_APP_SERVER_URL}/admin/setting/upload`, {
      method: 'POST',
      body: formData,
    }).then(response => response.json());

    try {
      const data = await showPromiseToast(uploadPromise, {
        loading: 'در حال آپلود تصویر...',
        success: 'تصویر با موفقیت آپلود شد',
        error: 'خطا در آپلود تصویر'
      });

      if (!data.uploadedFile) {
        return;
      }

      if (!data?.uploadedFile?.file_name) {
        return;
      }

      setTumbnailImage(`${process.env.REACT_APP_SERVER_FILE}/${data.uploadedFile.file_name}`);
      setNewTumbnailImageId(data?.uploadedFile?._id);

    } catch (error) {
      showToast('خطا', 'خطا در آپلود تصویر', 'error');
    }
  }
  
  
  // Sample Media Handlers
  const handleDeleteSampleMedia = (id: string) => {
    createOrUpdateSampleMediaMutation.mutate({
      delete_id: id,
    });
    // setSampleMedia(prev => prev.filter(item => item._id !== id));
    // showToast('موفق', 'نمونه آموزشی حذف شد', 'success');
  };

  const handleEditSampleMedia = (id: string) => {
    // TODO: EDIT API
    const item = sampleMedia.find(media => media._id === id);
    if (item) {
      setEditingSampleMedia(item);
      setSampleMediaFormOpen(true);
    }
  };


  /**
   * This handler could save new sample media when data have not `_id` property
   * and update existing sample media when data have `id` property
   */
  const handleSaveSampleMedia = (data: any) => {
    console.log({ data })
    // Case 1 : update Sample Media by id for This course
    if (data._id) {
      createOrUpdateSampleMediaMutation.mutate({
        id: data._id,
        ...(data.media_title && { media_title: data.media_title }),
        ...(data.media_type && { media_type: data.media_type }),
        ...(data.file && { file: data.file }),
      });

      // Update existing
      // setSampleMedia(prev => prev.map(item => 
      //   item._id === data._id ? { ...item, ...data } : item
      // ));
    } else {
      // Case 2 : Add new Sample media for this course
      if (!data.file) {
        showToast('خطا', 'لطفا فایل را انتخاب کنید', 'error');
        return;
      }

      if (!data.media_title) {
        showToast('خطا', 'عنوان نمونه آموزشی الزامی است', 'error');
        return;
      }

      if (!data.media_type) {
        showToast('خطا', 'نوع نمونه آموزشی الزامی است', 'error');
        return;
      }
      const newItem = {
        media_title: data.media_title,
        media_type: data.media_type,
        file: data.file,
      };
      createOrUpdateSampleMediaMutation.mutate({
        ...newItem,
      });
    }
  };

  // Course Object Handlers
  const handleDeleteCourseObject = (id: string) => {
    // setCourseObjects(prev => prev.filter(item => item._id !== id));
    console.log({ id })
    createOrUpdateCourseObjectMutation.mutate({
      id: id,
      controller: 'delete_course_object',
    });
    // showToast('موفق', 'سرفصل دوره حذف شد', 'success');
  };

  const handleEditCourseObject = (id: string) => {
    const item = courseObjects.find(obj => obj._id === id);
    if (item) {
      setEditingCourseObject(item);
      setCourseObjectFormOpen(true);
    }
  };

  // Create new Course object or update Specific
  const handleSaveCourseObject = (data: any) => {
    console.log({ data });
    // if data include `_id` we should update course object
    if (data._id) {
      // Update existing
      // setCourseObjects(prev => prev.map(item => 
      //   item._id === data._id ? { ...item, ...data } : item
      // ));

      createOrUpdateCourseObjectMutation.mutate({
        id: data._id,
        controller: 'update_course_object',
        ...(data.subject_title && { subject_title: data.subject_title }),
        // ...(data.status && { status: data.status }),
        ...(data.duration && { duration: data.duration }),
        ...(data.order && { order: data.order }),
      });
      // showToast('موفق', 'سرفصل دوره بروزرسانی شد', 'success');
    } else {
      // Add new Course Object

      // validate for create new course object

      if (!data.subject_title) {
        showToast('خطا', 'عنوان سرفصل الزامی است', 'error');
        return;
      }

      // if (!data.status) {
      //   showToast('خطا', 'وضعیت سرفصل الزامی است', 'error');
      //   return;
      // }

      if (!data.duration) {
        showToast('خطا', 'مدت زمان سرفصل الزامی است', 'error');
        return;
      }

      if (!data.order) {
        showToast('خطا', 'ترتیب سرفصل الزامی است', 'error');
        return;
      }

      createOrUpdateCourseObjectMutation.mutate({
        ...(data.subject_title && { subject_title: data.subject_title }),
        // ...(data.status && { status: data.status }),
        ...(data.duration && { duration: data.duration }),
        ...(data.order && { order: data.order }),
      });
      showToast('موفق', 'سرفصل دوره اضافه شد', 'success');
    }
    setEditingCourseObject(null);
  };


  const handleSaveNewLesson = (course_object_id: string, data: Lesson) => {
    if (!course_object_id) {
      showToast('خطا', 'شناسه به درستی انتخاب نشده ', 'error');
      return;
    }

    if (!data.title || !data.order || !data.status || !data.duration || !data.file) {
      showToast('خطا', 'اطلاعات به درستی وارد نشده است', 'error');
      return;
    }


    createOrUpdateCourseObjectMutation.mutate({
      id: course_object_id,
      controller: 'add_new_lesson',
      title: data.title,
      order: data.order,
      status: data.status,
      duration: data.duration,
      file: data.file._id,
      ...(data.description && { description: data.description }),
    });



    console.log({ course_object_id, data });
  };

  const handleDeleteLesson = (course_object_id: string, lesson_id: string) => {
    if (!course_object_id || !lesson_id) {
      showToast('خطا', 'شناسه به درستی انتخاب نشده ', 'error');
      return;
    }

    createOrUpdateCourseObjectMutation.mutate({
      id: course_object_id,
      controller: 'delete_lesson',
      lesson_id: lesson_id,
    });
  };


  const handleSaveDescription = (description: string, descriptionType: string) => {
    if (descriptionType === 'short') {
      setShortDescription(description);
    } else if (descriptionType === 'long') {
      setLongDescription(description);
    }
    console.log({ descriptionType })
  }


  const implementCategories = (data: [string] | any) => {
    setCategoriesState(data);
  }

  const onSubmit = async (data: FormData) => {
    try {
      // Prepare the final payload
      const payload = {
        title: data.title,
        sub_title: data.sub_title,
        price_real: data.price,
        price_discount: data.price_with_discount > 0 ? data.price_with_discount : null,
        is_fire_sale: data.price_with_discount ? true : false,
        // course_category: data.course_category,
        course_language: data.course_language,
        course_duration: data.course_duration,
        is_have_licence: data.is_have_licence,
        course_status: data.course_status,
        slug: data.slug,
        sample_media: sampleMedia,
        course_objects: courseObjects,
        ...(shortDescription && { description: shortDescription }),
        ...(longDescription && { description_long: longDescription }),
      };


      if (newTumbnailImageId && /^[0-9a-fA-F]{24}$/.test(newTumbnailImageId) && newTumbnailImageId !== courseData?.tumbnail_image?._id) {
        payload.tumbnail_image = newTumbnailImageId;
      }


      if (categoriesState?.length > 0) {
        payload.course_category = categoriesState;
      }



      await updateCourse.mutateAsync(payload);
      showToast('موفق', 'دوره با موفقیت بروزرسانی شد', 'success');
      navigate('/courses');
    } catch (error) {
      showToast('خطا', 'خطا در بروزرسانی دوره', 'error');
      console.error('Error updating course:', error);
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
    <Box dir="rtl" p={{ xs: 0, md: 4 }}>
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

                {/* <Grid size={{ xs: 12, md: 4 }}>
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
                </Grid> */}

                <Grid size={{ xs: 12, md: 4 }}>
                  <TextField
                    {...register('price')}
                    fullWidth
                    type="number"
                    label="قیمت دوره (ریال)"
                    error={!!errors.price}
                    helperText={errors.price?.message}
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 4 }}>
                  <TextField
                    {...register('price_with_discount')}
                    fullWidth
                    type="number"
                    label="قیمت با تخفیف (ریال)"
                    error={!!errors.price_with_discount}
                    helperText={errors.price_with_discount?.message}
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

          {/* Category */}
          <Grid size={12}>
            <StyledPaper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                دسته بندی دوره
              </Typography>
              <CourseCategorySelection
                passSelectedCategories={implementCategories}
                defaultCategories={courseData?.course_category}
              />
            </StyledPaper>
          </Grid>

          {/* Sample Media Section */}
          <Grid size={12}>
            <StyledPaper sx={{ p: 3, border: '1px solid gray' }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">نمونه‌های آموزشی</Typography>
                <Button
                  startIcon={<AddIcon className="ml-2" />}
                  onClick={() => {
                    setEditingSampleMedia(null);
                    setSampleMediaFormOpen(true);
                  }}
                  variant="contained"
                >
                  افزودن نمونه
                </Button>
              </Box>

              {sampleMedia.length > 0 ? (
                <StyledTableContainer>
                  <StyledTable>
                    <StyledTableHead>
                      <StyledTableRow>
                        <StyledTableCell>شناسه</StyledTableCell>
                        <StyledTableCell>عنوان</StyledTableCell>
                        <StyledTableCell>فایل</StyledTableCell>
                        <StyledTableCell>عملیات</StyledTableCell>
                      </StyledTableRow>
                    </StyledTableHead>
                    <StyledTableBody>
                      {sampleMedia.map((media) => (
                        <StyledTableRow key={media._id}>
                          <StyledTableCell>{media._id}</StyledTableCell>
                          <StyledTableCell>{media.media_title}</StyledTableCell>
                          <StyledTableCell>
                            {media.file && (
                              <Button
                                size="small"
                                startIcon={<DownloadIcon />}
                                href={`${SERVER_FILE}/${media.file.file_name}`}
                                target="_blank"
                              >
                                دانلود
                              </Button>
                            )}
                          </StyledTableCell>
                          <StyledTableCell>
                            <IconButton
                              color="primary"
                              onClick={() => handleEditSampleMedia(media._id)}
                            >
                              <EditIcon />
                            </IconButton>
                            <IconButton
                              color="error"
                              onClick={() => handleDeleteSampleMedia(media._id)}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </StyledTableCell>
                        </StyledTableRow>
                      ))}
                    </StyledTableBody>
                  </StyledTable>
                </StyledTableContainer>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  هیچ نمونه آموزشی وجود ندارد
                </Typography>
              )}
            </StyledPaper>
          </Grid>

          {/* Course Objects Section */}
          <Grid size={12}>
            <StyledPaper sx={{ p: 3, border: '1px solid gray' }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">سرفصل‌های دوره</Typography>
                <Button
                  startIcon={<AddIcon className="ml-2" />}
                  onClick={() => {
                    setEditingCourseObject(null);
                    setCourseObjectFormOpen(true);
                  }}
                  variant="contained"
                >
                  افزودن سرفصل
                </Button>
              </Box>

              {courseObjects.length > 0 ? (
                <StyledTableContainer>
                  <StyledTable>
                    <StyledTableHead>
                      <StyledTableRow>
                        <StyledTableCell>شناسه</StyledTableCell>
                        <StyledTableCell>عنوان سرفصل</StyledTableCell>
                        <StyledTableCell>ترتیب</StyledTableCell>
                        <StyledTableCell>عملیات</StyledTableCell>
                      </StyledTableRow>
                    </StyledTableHead>
                    <StyledTableBody>
                      {courseObjects.map((obj) => (
                        <StyledTableRow key={obj._id}>
                          <StyledTableCell>{obj._id}</StyledTableCell>
                          <StyledTableCell>{obj.subject_title}</StyledTableCell>
                          <StyledTableCell>{obj.order}</StyledTableCell>
                          <StyledTableCell>
                            <IconButton
                              color="primary"
                              onClick={() => handleEditCourseObject(obj._id)}
                            >
                              <EditIcon />
                            </IconButton>
                            <IconButton
                              color="error"
                              onClick={() => handleDeleteCourseObject(obj._id)}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </StyledTableCell>
                        </StyledTableRow>
                      ))}
                    </StyledTableBody>
                  </StyledTable>
                </StyledTableContainer>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  هیچ سرفصلی وجود ندارد
                </Typography>
              )}
            </StyledPaper>
          </Grid>

          {/* Description Section */}
          <CourseDescriptionForm shortDescription={courseData?.description} longDescription={courseData?.description_long} setShortDescription={(data) => handleSaveDescription(data, 'short')} setLongDescription={(data) => handleSaveDescription(data, 'long')} />


          {/* Thumbnail Image */}
          <Grid size={12}>
            <StyledPaper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              تصویر شاخص
            </Typography>

            <div className='mb-4'>
              {tumbnailImage && (
                <img src={tumbnailImage} alt="Tumbnail" className='w-full max-w-xl h-auto rounded-lg border' />
              )}
            </div>
            <ImageUploader
              withIcon={true}
              buttonText="انتخاب تصویر شاخص"
              onChange={(files) => handleUploadThumbnailImage(files[0])}
              imgExtension={['.jpg', '.jpeg', '.png']}
              maxFileSize={5242880}
                singleImage={true}
                withPreview={true}
              />
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

      {/* Sample Media Form Dialog */}
      <SampleMediaForm
        open={sampleMediaFormOpen}
        onClose={() => {
          setSampleMediaFormOpen(false);
          setEditingSampleMedia(null);
        }}
        onSave={handleSaveSampleMedia}
        initialData={editingSampleMedia}
      />

      {/* Course Object Form Dialog */}
      <CourseObjectForm
        open={courseObjectFormOpen}
        onClose={() => {
          setCourseObjectFormOpen(false);
          setEditingCourseObject(null);
        }}
        onSave={handleSaveCourseObject}
        onDeleteLesson={handleDeleteLesson}
        onSaveNewLesson={handleSaveNewLesson}
        initialData={editingCourseObject}
      />

      {(updateCourse.isPending || createOrUpdateSampleMediaMutation.isPending || createOrUpdateCourseObjectMutation.isPending) && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 9999,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            backdropFilter: 'blur(1px)'
          }}
        >
          <CircularProgress size={60} color="primary" />
        </Box>
      )}
    </Box>
  );
};

export default EditCourse; 