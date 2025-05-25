import React, { memo, Suspense, useState } from 'react'
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router'
import toast from 'react-hot-toast';
import axios from '@/API/axios';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import {
  Box,
  TextField,
  Button,
  IconButton,
  Typography,
  Grid2 as Grid,
  FormControlLabel,
  Switch,
  Radio,
  LinearProgress,
  Alert,
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import AttachFileIcon from '@mui/icons-material/AttachFile';

import StyledPaper from '../../../../components/StyledPaper';


// API
import { useCreateCoachCourseProgram } from '../../../../API/Coach/coach.hook';



import Spinner from '../../../../components/Spinner'




interface Props { }

interface ExamOption {
  text: string;
  isCorrect: boolean;
}

interface ExamQuestion {
  question_title: string;
  options: ExamOption[];
  points: number;
}

interface CourseSubject {
  title: string;
  description: string;
  video_file: string | null;
  order: number;
  exam: ExamQuestion[];
}

// Validation schema
const schema = yup.object({
  title: yup.string().required('عنوان الزامی است'),
  description: yup.string().required('توضیحات الزامی است'),
  amount: yup
    .number()
    .required('مبلغ الزامی است')
    .min(0, 'مبلغ باید بزرگتر از صفر باشد'),
  course_subject_count: yup
    .number()
    .required('تعداد سرفصل‌ها الزامی است')
    .min(1, 'تعداد سرفصل‌ها باید حداقل 1 باشد'),
  is_have_penalty: yup.boolean().default(false),
  penalty_fee: yup.mixed().when('is_have_penalty', {
    is: true,
    then: (schema) => schema
      .test('is-number', 'مبلغ جریمه باید عدد باشد', (value) => !isNaN(value))
      .test('is-positive', 'مبلغ جریمه باید بزرگتر از صفر باشد', (value) => value > 0)
      .required('مبلغ جریمه الزامی است'),
    otherwise: (schema) => schema.nullable().optional(),
  }),
});

type FormData = yup.InferType<typeof schema>;

interface UploadedFile {
  _id: string;
  file_name: string;
}


const CreateCoachCoursePage: React.FC<Props> = memo(() => {

  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [courseSubjects, setCourseSubjects] = useState<CourseSubject[]>([]);
  const [finalFormState, setfinalFormState] = useState({});
  // Add new state for tracking upload progress
  const [uploadProgress, setUploadProgress] = useState<{ [key: number]: number }>({});
  const [uploadedResponseState, setUploadedResponseState] = useState<{ [key: number]: any }>({});


  // Add state to store selected files for each subject
  const [selectedFiles, setSelectedFiles] = useState<{ [key: number]: File | null }>({});

  const { mutate: createCoachCourseProgram, isLoading } = useCreateCoachCourseProgram();


  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<FormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      is_have_penalty: false,
      course_subject_count: 1,
      amount: 0,
    },
  });

  const isHavePenalty = watch('is_have_penalty');

  const onSubmit = (data: FormData) => {

    const formData = Object.assign({}, data);


    if (!formData.penalty_fee || formData.penalty_fee?.length == 0 || !formData.is_have_penalty) {
      delete formData.penalty_fee
    }
    setfinalFormState(formData);
    const initialSubjects = Array(data.course_subject_count).fill(null).map((_, index) => ({
      title: '',
      description: '',
      video_file: "",
      order: index + 1,
      exam: [], // Initialize empty exam array
    }));
    setCourseSubjects(initialSubjects);
    setStep(2);
  };

  // Add handler for course subject changes
  const handleSubjectChange = (index: number, field: keyof CourseSubject, value: string | File) => {
    const updatedSubjects = [...courseSubjects];
    updatedSubjects[index] = {
      ...updatedSubjects[index],
      [field]: value,
    };
    setCourseSubjects(updatedSubjects);
  };

  // Add handler for adding new exam question
  const handleAddExamQuestion = (subjectIndex: number) => {
    const updatedSubjects = [...courseSubjects];
    const newQuestion: ExamQuestion = {
      question_title: '',
      options: [
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
      ],
      points: 0,
    };

    updatedSubjects[subjectIndex].exam = [
      ...(updatedSubjects[subjectIndex].exam || []),
      newQuestion,
    ];
    setCourseSubjects(updatedSubjects);
  };

  // Add handler for updating exam question
  const handleExamChange = (
    subjectIndex: number,
    questionIndex: number,
    field: keyof ExamQuestion,
    value: any
  ) => {
    const updatedSubjects = [...courseSubjects];
    const exam = updatedSubjects[subjectIndex].exam;
    if (exam) {
      exam[questionIndex] = {
        ...exam[questionIndex],
        [field]: value,
      };
      setCourseSubjects(updatedSubjects);
    }
  };

  // Add handler for updating exam option
  const handleOptionChange = (
    subjectIndex: number,
    questionIndex: number,
    optionIndex: number,
    field: keyof ExamOption,
    value: any
  ) => {
    const updatedSubjects = [...courseSubjects];
    const exam = updatedSubjects[subjectIndex].exam;
    if (exam) {
      exam[questionIndex].options[optionIndex] = {
        ...exam[questionIndex].options[optionIndex],
        [field]: value,
      };
      setCourseSubjects(updatedSubjects);
    }
  };

  // Add handler for final submission
  const handleFinalSubmit = () => {

    const finalData = {
      ...finalFormState,
      course_object: courseSubjects,
    };
    console.log('Final Data:', finalData);
    // send the data to your API
    createCoachCourseProgram(finalData, {
      onSuccess: () => {
        // Optionally redirect or show success message
        navigate('/coach/coach-course-program');
      },
    });

  };


  // const uploadFile = async (file: File): Promise<UploadedFile> => {
  //   const formData = new FormData();
  //   formData.append('file', file);

  //   const response = await fetch('http://localhost:9000/v1/admin/setting/upload', {
  //     method: 'POST',
  //     body: formData,
  //   });

  //   if (!response.ok) {
  //     throw new Error('Upload failed');
  //   }

  //   const data = await response.json();
  //   return data.uploadedFile;
  // };

  const handleFileSelect = (file: File | null, subjectIndex: number) => {
    setSelectedFiles(prev => ({
      ...prev,
      [subjectIndex]: file
    }));
  };

  // const handleFileUpload = async (subjectIndex: number) => {
  //   const file = selectedFiles[subjectIndex];
  //   if (!file) {
  //     toast.error('لطفا ابتدا فایل را انتخاب کنید');
  //     return;
  //   }

  //   try {
  //     const uploadedFile = await uploadFile(file);
  //     handleSubjectChange(subjectIndex, 'video_file', uploadedFile._id);
  //     toast.success('فایل با موفقیت آپلود شد');
  //     // Clear the selected file after successful upload
  //     setSelectedFiles(prev => ({
  //       ...prev,
  //       [subjectIndex]: null
  //     }));
  //   } catch (error) {
  //     toast.error('خطا در آپلود فایل');
  //     console.error('Upload error:', error);
  //   }
  // };

  const handleFileUpload = async (subjectIndex: number) => {
    const file = selectedFiles[subjectIndex];
    if (!file) {
      toast.error('لطفا ابتدا فایل را انتخاب کنید');
      return;
    }

    try {
      setUploadProgress(prev => ({ ...prev, [subjectIndex]: 0 }));

      const formData = new FormData();
      formData.append('file', file);

      const response = await axios.post(
        'http://localhost:9000/v1/admin/setting/upload',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          onUploadProgress: (progressEvent: any) => {
            const progress = Math.round(
              (progressEvent.loaded * 100) / (progressEvent.total || 1)
            );
            setUploadProgress(prev => ({ ...prev, [subjectIndex]: progress }));
          },
        }
      );

      const uploadedFile = response.data.uploadedFile;
      setUploadedResponseState(prev => ({
        ...prev,
        [subjectIndex]: response.data.uploadedFile
      }))
      handleSubjectChange(subjectIndex, 'video_file', uploadedFile._id);
      toast.success('فایل با موفقیت آپلود شد');

      // Clear states after successful upload
      setSelectedFiles(prev => ({
        ...prev,
        [subjectIndex]: null
      }));
      setUploadProgress(prev => ({ ...prev, [subjectIndex]: 0 }));

    } catch (error) {
      toast.error('خطا در آپلود فایل');
      console.error('Upload error:', error);
      setUploadProgress(prev => ({ ...prev, [subjectIndex]: 0 }));
    }
  };


  return (
    <>
      <div className='flex justify-start pb-8 px-4 md:px-8' >
        <div className='flex '>
          <Link to="/coach/coach-course-program">
            <Button variant="outlined">
              بازگشت
            </Button>
          </Link>
        </div>

      </div>

      <div dir="rtl" className='px-4 md:px-8'>
        <Suspense fallback={<Spinner size="xl" />}>
          {step === 1 && (
            <form onSubmit={handleSubmit(onSubmit)}>
              <Grid container spacing={3}>
                <Grid size={12}>
                  <StyledPaper sx={{ p: 3 }}>
                    <Typography variant="h6" gutterBottom>
                      اطلاعات اصلی
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid size={12}>
                        <TextField
                          {...register('title')}
                          fullWidth
                          label="عنوان"
                          error={!!errors.title}
                          helperText={errors.title?.message}
                        />
                      </Grid>

                      <Grid size={12}>
                        <TextField
                          {...register('description')}
                          fullWidth
                          multiline
                          rows={4}
                          label="توضیحات"
                          error={!!errors.description}
                          helperText={errors.description?.message}
                        />
                      </Grid>

                      <Grid size={{ xs: 12, md: 6 }}>
                        <TextField
                          {...register('amount')}
                          fullWidth
                          type="number"
                          label="مبلغ"
                          error={!!errors.amount}
                          helperText={errors.amount?.message}
                        />
                      </Grid>

                      <Grid size={{ xs: 12, md: 6 }}>
                        <TextField
                          {...register('course_subject_count')}
                          fullWidth
                          type="number"
                          label="تعداد سرفصل‌ها"
                          error={!!errors.course_subject_count}
                          helperText={errors.course_subject_count?.message}
                        />
                      </Grid>

                      <Grid size={12}>
                        <FormControlLabel
                          control={
                            <Switch
                              {...register('is_have_penalty')}
                            />
                          }
                          label="دارای جریمه"
                        />
                      </Grid>

                      <Grid size={12}>
                        <TextField
                          {...register('penalty_fee')}
                          fullWidth
                          type="number"
                          label="مبلغ جریمه"
                          disabled={!isHavePenalty}
                          error={!!errors.penalty_fee}
                          helperText={errors.penalty_fee?.message}
                        />
                      </Grid>
                    </Grid>
                  </StyledPaper>
                </Grid>

                <Grid size={12}>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    size="large"
                    sx={{ mt: 3 }}
                  >
                    مرحله بعد
                  </Button>
                </Grid>
              </Grid>
            </form>
          )}

          {step === 2 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                سرفصل‌های دوره
              </Typography>
              <form onSubmit={(e) => { e.preventDefault(); handleFinalSubmit(); }}>
                <Grid container spacing={3}>
                  {courseSubjects.map((subject, subjectIndex) => (
                    <Grid size={12} key={subjectIndex}>
                      <StyledPaper sx={{ p: 3 }}>
                        <Typography variant="subtitle1" gutterBottom>
                          سرفصل {subjectIndex + 1}
                        </Typography>
                        <Grid container spacing={2}>
                          <Grid size={12}>
                            <TextField
                              fullWidth
                              label="عنوان"
                              value={subject.title}
                              onChange={(e) => handleSubjectChange(subjectIndex, 'title', e.target.value)}
                            />
                          </Grid>

                          <Grid size={12}>
                            <TextField
                              fullWidth
                              multiline
                              rows={4}
                              label="توضیحات"
                              value={subject.description}
                              onChange={(e) => handleSubjectChange(subjectIndex, 'description', e.target.value)}
                            />
                          </Grid>

                          {/* <Grid size={12}>
                            <div className='flex flex-col py-6'>
                              <Typography variant='h6' fontWeight={800}>
                                فایل دوره را آینجا آپلود کنید
                              </Typography>
                              <input
                              type="file"
                              className={styles.input}
                              accept="video/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0] || null;
                                handleSubjectChange(subjectIndex, 'video_file', file);
                              }}
                            />
                            </div>
                            
                          </Grid> */}


                          <Grid sx={{ marginBottom: '50px', marginTop: '50px' }} size={{ xs: 12, md: 6 }} container spacing={2} alignItems="center">
                            <Grid size={12}>
                              <Typography variant='h6' fontWeight={500}>
                                فایل دوره را آینجا آپلود کنید
                              </Typography>
                            </Grid>


                            {uploadedResponseState[subjectIndex]?._id && (
                              <div className='w-full border-2 px-8 py-2 rounded-4xl'>
                                <div className='flex flex-col'>
                                  <Typography variant="body1" > فایل آپلود شده </Typography>
                                  <a>{uploadedResponseState[subjectIndex]?._id}</a>
                                </div>
                              </div>
                            )}

                            {uploadedResponseState[subjectIndex]?._id && (
                              <div>
                                <Alert severity="success">
                                  فایل با موفقیت آپلود شد
                                </Alert>
                              </div>
                            )}


                            {selectedFiles[subjectIndex]?.name && (
                              <div className='w-full border-2 px-8 py-2 rounded-4xl'>
                                <div className='flex flex-col'>
                                  <div className='flex space-x-1 text-gray-600 mb-2'>
                                    <AttachFileIcon fontSize="small" color="inherit" />
                                    <div className='text-gray-600'>فایل انتخاب شده</div>
                                  </div>

                                  <div className='font-bold'> {selectedFiles[subjectIndex]?.name} </div>

                                  {uploadProgress[subjectIndex] !== undefined && (
                                    <div className='mt-2'>
                                      <LinearProgress
                                        variant="determinate"
                                        value={uploadProgress[subjectIndex]}
                                        sx={{ height: 8, borderRadius: 4 }}
                                      />
                                      <Typography
                                        variant="body2"
                                        color="textSecondary"
                                        align="right"
                                        sx={{ mt: 1 }}
                                      >
                                        {uploadProgress[subjectIndex]}% آپلود شده
                                      </Typography>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}


                            <Grid size={{ xs: 12, md: 8 }}>
                              <input
                                type="file"
                                accept="video/*"
                                onChange={(e) => {
                                  const file = e.target.files?.[0] || null;
                                  handleFileSelect(file, subjectIndex);
                                }}
                                style={{ display: 'none' }}
                                id={`video-upload-${subjectIndex}`}
                              />
                              <label htmlFor={`video-upload-${subjectIndex}`}>
                                <Button
                                  variant="outlined"
                                  component="span"
                                  startIcon={<CloudUploadIcon sx={{ marginLeft: '10px' }} />}
                                  fullWidth
                                >
                                  {selectedFiles[subjectIndex] ? 'فایل انتخاب شده' : 'انتخاب فایل'}
                                </Button>
                              </label>
                            </Grid>
                            <Grid size={{ xs: 12, md: 4 }}>
                              <Button
                                variant="contained"
                                color="primary"
                                onClick={() => handleFileUpload(subjectIndex)}
                                disabled={!selectedFiles[subjectIndex]}
                                fullWidth
                              >
                                آپلود فایل
                              </Button>
                            </Grid>
                          </Grid>

                          <Grid size={12}>
                            <TextField
                              fullWidth
                              type="number"
                              label="ترتیب"
                              value={subject.order}
                              onChange={(e) => handleSubjectChange(subjectIndex, 'order', parseInt(e.target.value))}
                            />
                          </Grid>

                          {/* Exam Section */}
                          <Grid size={12}>
                            <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                              سوالات آزمون
                            </Typography>
                            {subject.exam?.map((question, questionIndex) => (
                              <Box key={questionIndex} sx={{ mt: 2, p: 2, border: '1px solid #ddd', borderRadius: 1 }}>
                                <Grid container spacing={2}>
                                  <Grid size={12}>
                                    <TextField
                                      fullWidth
                                      label="عنوان سوال"
                                      value={question.question_title}
                                      onChange={(e) => handleExamChange(subjectIndex, questionIndex, 'question_title', e.target.value)}
                                    />
                                  </Grid>
                                  <Grid size={12}>
                                    <TextField
                                      fullWidth
                                      type="number"
                                      label="نمره"
                                      value={question.points}
                                      onChange={(e) => handleExamChange(subjectIndex, questionIndex, 'points', parseInt(e.target.value))}
                                    />
                                  </Grid>
                                  {question.options.map((option, optionIndex) => (
                                    <Grid size={12} key={optionIndex}>
                                      <FormControlLabel
                                        control={
                                          <Radio
                                            checked={option.isCorrect}
                                            onChange={(e) => handleOptionChange(subjectIndex, questionIndex, optionIndex, 'isCorrect', e.target.checked)}
                                          />
                                        }
                                        label={
                                          <TextField
                                            fullWidth
                                            label={`گزینه ${optionIndex + 1}`}
                                            value={option.text}
                                            onChange={(e) => handleOptionChange(subjectIndex, questionIndex, optionIndex, 'text', e.target.value)}
                                          />
                                        }
                                      />
                                    </Grid>
                                  ))}
                                </Grid>
                              </Box>
                            ))}
                            <Button
                              variant="outlined"
                              onClick={() => handleAddExamQuestion(subjectIndex)}
                              sx={{ mt: 2 }}
                            >
                              افزودن سوال
                            </Button>
                          </Grid>
                        </Grid>
                      </StyledPaper>
                    </Grid>
                  ))}

                  <Grid size={12}>
                    <Button
                      type="submit"
                      variant="contained"
                      color="primary"
                      size="large"
                      sx={{ mt: 3 }}
                    >
                      ثبت دوره
                    </Button>
                  </Grid>
                </Grid>
              </form>
            </Box>
          )}
        </Suspense>
      </div>
    </>
  )
})
CreateCoachCoursePage.displayName = 'CreateCoachCoursePage'

export default CreateCoachCoursePage
