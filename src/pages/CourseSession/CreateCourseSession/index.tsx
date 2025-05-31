import React, { useState, useRef } from 'react';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
  Box,
  TextField,
  Button,
  Typography,
  Grid2 as Grid,
  MenuItem,
  Switch,
  FormControlLabel,
  Alert,
} from '@mui/material';
import StyledPaper from '../../../components/StyledPaper';
import ImageUploader from 'react-images-upload';
// @ts-ignore
import StarterKit from "@tiptap/starter-kit";
import {
  MenuButtonBold,
  MenuButtonItalic,
  MenuControlsContainer,
  MenuDivider,
  MenuSelectHeading,
  RichTextEditor,
  type RichTextEditorRef,
} from "mui-tiptap";
import Editor from '@/components/TextEditor';
import CircularProgress from "@mui/material/CircularProgress";
import UploadIcon from "@mui/icons-material/Upload";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import { showToast } from '@/utils/toast';
import { useCreateCourseSession } from '@/API/CourseSession/courseSession.hook';
import { useNavigate } from 'react-router';

const SERVER_URL = process.env.REACT_APP_SERVER_URL;
const SERVER_FILE = process.env.REACT_APP_SERVER_FILE;

// Validation schema
yup.setLocale({
  mixed: {
    required: 'این فیلد الزامی است',
  },
  number: {
    min: 'عدد وارد شده معتبر نیست',
  },
});

const schema = yup.object().shape({
  title: yup.string().required(),
  sub_title: yup.string().required(),
  description: yup.string().required(),
  description_long: yup.string(),
  price: yup.number().required(),
  course_language: yup.string(),
  course_duration: yup.number(),
  course_type: yup.string().oneOf(['HOZORI', 'ONLINE']).required(),
  educational_level: yup.number(),
  is_have_licence: yup.boolean().required(),
});

interface FormData {
  title: string;
  sub_title: string;
  description: string;
  description_long: string;
  price: number;
  course_language: string;
  course_duration: number;
  course_type: 'HOZORI' | 'ONLINE';
  educational_level: number;
  is_have_licence: boolean;
  sample_media: {
    media_type: string;
    media_title: string;
    url_address: string;
  }[];
}

// Add this type for file upload state
type FileUploadState = {
  [key: string]: {
    file: File | null;
    uploading: boolean;
    error: string | null;
    uploadedFile: any | null;
  };
};

interface UploadedFile {
  _id: string;
  file_name: string;
}


const CreateCourseSession: React.FC = () => {
  const navigate = useNavigate();
  const [thumbnailImage, setThumbnailImage] = useState<string | null>(null);
  const [sampleMediaImage, setSampleMediaImage] = useState<string | null>(null);
  const [descriptionLong, setDescriptionLong] = useState('');
  const [fileUploads, setFileUploads] = useState<FileUploadState>({});

  // API Mutation
  const createCourseSessionMutation = useCreateCourseSession();

  //   const rteRef = useRef<RichTextEditorRef>(null);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    setValue,
    watch,
  } = useForm<FormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      is_have_licence: false,
      course_type: 'HOZORI',
      title: '',
      sub_title: '',
      description: '',
      //   description_long: 'sdsd',
      price: 0,
      course_language: '',
      course_duration: 0,
      educational_level: 0,
      sample_media: [],
    },
  });

  const {
    fields: sampleMediaFields,
    append: appendSampleMedia,
    remove: removeSampleMedia,
  } = useFieldArray({
    name: "sample_media",
    control,
  });

  // Keep description_long in sync with WYSIWYG
  // React.useEffect(() => {
  //   setValue('description_long', descriptionLong);
  // }, [descriptionLong, setValue]);

  const onSubmit = async (data: FormData) => {
    

    // Form Manual Validation
    if (!descriptionLong) {
      showToast('خطا', ' لطفا توضیحات را کامل کنید', 'error')
    }

    // For now, just log the data

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


    // omit => thumbnailImage, sampleMediaImage, 
    const courseSessionRequestBody = { ...data, tumbnail: "67620e2688dd804ab80f6c1a", sample_media: sampleMediaWithFiles, description_long: descriptionLong };
    console.log({courseSessionRequestBody})

    try {
      await createCourseSessionMutation.mutateAsync(courseSessionRequestBody);

      showToast('موفق', 'دوره با موفقیت ایجاد شد', 'success');
      navigate('/courses-sessions');

    } catch (error) {
      if (error instanceof Error) {
        showToast('خطا', error.message, 'error');
      } else {
        showToast('خطا', 'خطا در ایجاد دوره', 'error');
      }
      console.error('Error submitting form:', error);
    }


    // Attach Long Description 
    
    // const logDesc = rteRef.current?.editor?.getHTML();
    // console.log({text_editor:logDesc })
  };

  // const mainFormSubmitHandler = (e) => {
  //   e.preventDefault();

  //   // const logDesc = rteRef.current?.editor?.getHTML();
  //   // console.log({text_editor:logDesc })
  // }


  const submitHandlerForPassData = (data) => {
    console.log({ data });
    setDescriptionLong(data);
  }

  // Dummy upload function (replace with your real upload logic)
  // const uploadFile = async (file: File) => {
  //   // Simulate upload delay
  //   await new Promise((res) => setTimeout(res, 1000));
  //   // Return a fake uploaded file object
  //   return { _id: "fake_id", name: file.name };
  // };

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

  const handleFileUpload = async (key: string) => {
    console.log({ key })
    const fileState = fileUploads[key];
    if (!fileState?.file) return;

    setFileUploads((prev) => ({
      ...prev,
      [key]: { ...prev[key], uploading: true, error: null },
    }));

    try {
      const uploadedFile = await uploadFile(fileState.file);
      setFileUploads((prev) => ({
        ...prev,
        [key]: { ...prev[key], uploading: false, uploadedFile },
      }));
      // Optionally show a toast here
    } catch (error) {
      setFileUploads((prev) => ({
        ...prev,
        [key]: { ...prev[key], uploading: false, error: "خطا در آپلود فایل" },
      }));
    }
  };

  return (
    <Box dir="rtl" p={{ xs: 0, md: 4 }}>
      <Typography className="pb-4" variant="h4" gutterBottom>
        ایجاد جلسه جدید دوره
      </Typography>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Grid container spacing={3}>
          {/* Title */}
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              {...register('title')}
              fullWidth
              label="عنوان جلسه"
              error={!!errors.title}
              helperText={errors.title?.message}
            />
          </Grid>
          {/* Sub Title */}
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              {...register('sub_title')}
              fullWidth
              label="زیرعنوان"
              error={!!errors.sub_title}
              helperText={errors.sub_title?.message}
            />
          </Grid>
          {/* Description */}
          <Grid size={12}>
            <TextField
              {...register('description')}
              fullWidth
              multiline
              rows={3}
              label="توضیح کوتاه"
              error={!!errors.description}
              helperText={errors.description?.message}
            />
          </Grid>
          {/* Description Long (WYSIWYG) */}
          <Grid size={12}>
            <Typography fontWeight={800} variant="subtitle1" sx={{ mb: 1 }}>
              توضیح کامل
            </Typography>
            {/* <RichTextEditor
        ref={rteRef}
        extensions={[StarterKit]} // Or any Tiptap extensions you wish!
        content="<p>Hello world</p>" // Initial content for the editor
        // Optionally include `renderControls` for a menu-bar atop the editor:
        renderControls={() => (
          <MenuControlsContainer>
            <MenuSelectHeading />
            <MenuDivider />
            <MenuButtonBold />
            <MenuButtonItalic />
          </MenuControlsContainer>
        )}
      /> */}
            <Box sx={{ marginBottom: '60px' }}>
              <Editor submitHandlerForPassData={submitHandlerForPassData} />
            </Box>
            {errors.description_long && (
              <Typography color="error" variant="caption">
                {errors.description_long.message}
              </Typography>
            )}
          </Grid>
          {/* Thumbnail Image Uploader */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>
              تصویر جلسه
            </Typography>
            <ImageUploader
              withIcon={true}
              buttonText="انتخاب تصویر جلسه"
              onChange={(files: File[]) => setThumbnailImage(files[0])}
              imgExtension={['.jpg', '.jpeg', '.png']}
              maxFileSize={5242880}
              singleImage={true}
              withPreview={true}
            />
            {thumbnailImage && (
              <Alert severity="info" sx={{ mt: 1 }}>
                تصویر انتخاب شد: {thumbnailImage.name}
              </Alert>
            )}
          </Grid>
          {/* Sample Media Image Uploader */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>
              نمونه رسانه جلسه
            </Typography>
            <ImageUploader
              withIcon={true}
              buttonText="انتخاب نمونه رسانه"
              onChange={(files: File[]) => setSampleMediaImage(files[0])}
              imgExtension={['.jpg', '.jpeg', '.png']}
              maxFileSize={5242880}
              singleImage={true}
              withPreview={true}
            />
            {sampleMediaImage && (
              <Alert severity="info" sx={{ mt: 1 }}>
                نمونه رسانه انتخاب شد: {sampleMediaImage.name}
              </Alert>
            )}
          </Grid>
          {/* Price */}
          <Grid size={{ xs: 12, md: 4 }}>
            <TextField
              {...register('price')}
              fullWidth
              type="number"
              label="قیمت (تومان)"
              error={!!errors.price}
              helperText={errors.price?.message}
            />
          </Grid>
          {/* Course Language */}
          <Grid size={{ xs: 12, md: 4 }}>
            <TextField
              {...register('course_language')}
              fullWidth
              label="زبان جلسه"
              error={!!errors.course_language}
              helperText={errors.course_language?.message}
            />
          </Grid>
          {/* Course Duration */}
          <Grid size={{ xs: 12, md: 4 }}>
            <TextField
              {...register('course_duration')}
              fullWidth
              type="number"
              label="مدت جلسه (دقیقه)"
              error={!!errors.course_duration}
              helperText={errors.course_duration?.message}
            />
          </Grid>
          {/* Course Type */}
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              {...register('course_type')}
              select
              fullWidth
              label="نوع جلسه"
              error={!!errors.course_type}
              helperText={errors.course_type?.message}
            >
              <MenuItem value="HOZORI">حضوری</MenuItem>
              <MenuItem value="ONLINE">آنلاین</MenuItem>
            </TextField>
          </Grid>
          {/* Educational Level */}
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              {...register('educational_level')}
              fullWidth
              type="number"
              label="سطح آموزشی"
              error={!!errors.educational_level}
              helperText={errors.educational_level?.message}
            />
          </Grid>
          {/* Is Have Licence */}
          <Grid size={12}>
            <FormControlLabel
              control={
                <Controller
                  name="is_have_licence"
                  control={control}
                  render={({ field }) => (
                    <Switch
                      {...field}
                      checked={!!field.value}
                      color="primary"
                    />
                  )}
                />
              }
              label="دارای گواهینامه"
            />
          </Grid>
          {/* Sample Media Fields */}
          <Grid size={12}>
            <StyledPaper sx={{ p: 3 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">نمونه‌های آموزشی</Typography>
                <Button
                  startIcon={<AddIcon className="ml-2" />}
                  onClick={() =>
                    appendSampleMedia({
                      media_type: "",
                      media_title: "",
                      url_address: "",
                    })
                  }
                >
                  افزودن نمونه
                </Button>
              </Box>

              {sampleMediaFields.map((field, index) => (
                <Box
                  key={field.id}
                  sx={{ mb: 3, p: 2, border: "1px solid #eee", borderRadius: 1 }}
                >
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
                            setFileUploads((prev) => ({
                              ...prev,
                              [`sample_media_${index}`]: {
                                file,
                                uploading: false,
                                error: null,
                                uploadedFile: null,
                              },
                            }));
                          }
                        }}
                        style={{ display: "none" }}
                        id={`sample-media-file-${index}`}
                      />
                      <Box display="flex" alignItems="center" gap={2}>
                        <label htmlFor={`sample-media-file-${index}`}>
                          <Button variant="outlined" component="span">
                            انتخاب فایل
                          </Button>
                        </label>
                        {fileUploads[`sample_media_${index}`]?.file &&
                          !fileUploads[`sample_media_${index}`]?.uploadedFile && (
                            <Button
                              variant="contained"
                              onClick={() => handleFileUpload(`sample_media_${index}`)}
                              disabled={fileUploads[`sample_media_${index}`]?.uploading}
                              startIcon={
                                fileUploads[`sample_media_${index}`]?.uploading ? (
                                  <CircularProgress sx={{ marginLeft: '5px' }} size={20} />
                                ) : (
                                  <UploadIcon sx={{ marginLeft: '5px' }} />
                                )
                              }
                            >
                              آپلود فایل
                            </Button>
                          )}
                        {fileUploads[`sample_media_${index}`]?.uploadedFile && (
                          <Alert sx={{ marginLeft: '5px' }} severity="success">فایل با موفقیت آپلود شد</Alert>
                        )}
                      </Box>
                    </Grid>

                    <Grid size={12} display="flex" justifyContent="flex-end">
                      <Button
                        color="error"
                        startIcon={<DeleteIcon className="ml-2" />}
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
          {/* Submit Button */}
          <Grid size={12}>
            <Button type="submit" variant="contained" color="primary" size="large">
              ثبت جلسه
            </Button>
          </Grid>
        </Grid>
      </form>
    </Box>
  );
};

export default CreateCourseSession; 