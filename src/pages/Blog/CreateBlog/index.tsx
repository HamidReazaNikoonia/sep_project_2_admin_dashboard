import { useState } from 'react';
import { TextField, Button, Paper, Typography, Box, CircularProgress, Alert } from '@mui/material';
import { MuiChipsInput } from 'mui-chips-input';
import ImageUploader from 'react-images-upload';
import Editor from '../../../components/TextEditor';
import { useCreateBlog } from '../../../API/Blog/blog.hook';
import { useNavigate } from 'react-router';
import { Upload as UploadIcon } from '@mui/icons-material';
import { showToast } from '@/utils/toast';

const SERVER_URL = process.env.REACT_APP_SERVER_URL

const CreateBlog = () => {
  const navigate = useNavigate();
  const { mutate: createBlog, isPending } = useCreateBlog();

  // Form state
  const [title, setTitle] = useState<string>('');
  const [subTitle, setSubTitle] = useState<string>('');
  const [content, setContent] = useState<string>('');
  const [thumbnailImage, setThumbnailImage] = useState<File | null>(null);
  const [thumbnailUploadedFile, setThumbnailUploadedFile] = useState<File | null>(null);
  const [thumbnailUploading, setThumbnailUploading] = useState<boolean>(false);
  const [tags, setTags] = useState<string[]>([]);

  // Error states
  const [titleError, setTitleError] = useState<string>('');
  const [contentError, setContentError] = useState<string>('');

  // Handle content from editor
  const submitHandlerForPassData = (data: string) => {
    setContent(data);
    if (data) setContentError('');
  };

  // Handle tags change
  const handleTagsChange = (newTags: string[]) => {
    setTags(newTags);
  };

  // Form validation
  const validateForm = (): boolean => {
    let isValid = true;

    if (!title.trim()) {
      setTitleError('عنوان بلاگ الزامی است');
      isValid = false;
    } else {
      setTitleError('');
    }

    if (!content.trim()) {
      setContentError('محتوای بلاگ الزامی است');
      isValid = false;
    } else {
      setContentError('');
    }

    return isValid;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    // Prepare blog data
    const blogData = {
      title,
      sub_title: subTitle,
      content,
      tags,
      ...(thumbnailUploadedFile?._id && { thumbnail: thumbnailUploadedFile._id }),
    };

    // Create blog
    createBlog(blogData, {
      onSuccess: () => {
        // Redirect to blog list on success
        navigate('/blog');
        showToast('موفق', 'بلاگ با موفقیت ایجاد شد', 'success')
      },
      onError: (error) => {
        console.error('Error creating blog:', error);
        showToast('خطا', 'خطا در ایجاد بلاگ', 'error')
      },
    });
  };

  // Convert file to base64 for API
  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const uploadFile = async (file: File): Promise<any> => {
    const formData = new FormData()
    formData.append('file', file)

    const response = await fetch(`${SERVER_URL}/admin/setting/upload`, {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      throw new Error('Upload failed')
    }

    const data = await response.json()
    return data.uploadedFile
  }

  const handleThumbnailUpload = async () => {
    if (!thumbnailImage) return

    setThumbnailUploading(true)
    try {
      const uploadedFile = await uploadFile(thumbnailImage)
      setThumbnailUploadedFile(uploadedFile);
      showToast('موفق', 'تصویر بلاگ با موفقیت آپلود شد', 'success')

    } catch (error) {
      console.error('Error uploading thumbnail:', error)
      showToast('خطا', 'خطا در آپلود تصویر بلاگ', 'error')
    }
    finally {
      setThumbnailUploading(false)
    }
  }

  return (
    <div className="w-full max-w-5xl mx-auto">
      <Paper className="p-6 mb-8">
        <Typography variant="h5" component="h1" className="mb-6 font-bold" dir="rtl">
          ایجاد بلاگ جدید
        </Typography>

        <form onSubmit={handleSubmit} dir="rtl">
          {/* Title */}
          <div className="mb-6">
            <TextField
              label="عنوان"
              variant="outlined"
              fullWidth
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (e.target.value) setTitleError('');
              }}
              error={!!titleError}
              helperText={titleError}
              required
            />
          </div>

          {/* Subtitle */}
          <div className="mb-6">
            <TextField
              label="زیرعنوان"
              variant="outlined"
              fullWidth
              value={subTitle}
              onChange={(e) => setSubTitle(e.target.value)}
              multiline
              rows={2}
            />
          </div>

          {/* Tags */}
          <div className="mb-6">
            <Typography variant="subtitle1" className="mb-2">
              برچسب‌ها
            </Typography>
            <MuiChipsInput 
              value={tags} 
              onChange={handleTagsChange} 
              fullWidth
              placeholder="برچسب را وارد کنید و Enter را بزنید"
            />
          </div>

          {/* Thumbnail */}
          <div className="mb-6">
            <Typography variant="subtitle1" className="mb-2">
              تصویر شاخص
            </Typography>
            <ImageUploader
              withIcon={true}
              buttonText="انتخاب تصویر شاخص"
              onChange={(files) => {
                setThumbnailImage(files[0]);
                setThumbnailUploadedFile(null)
              }}
              imgExtension={['.jpg', '.jpeg', '.png']}
              maxFileSize={5242880}
              singleImage={true}
              withPreview={true}
              label="حداکثر سایز فایل: 5MB، فرمت‌های مجاز: JPG, JPEG, PNG"
            />

            <div>
            {thumbnailImage && !thumbnailUploadedFile && (
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleThumbnailUpload}
                    disabled={thumbnailUploading}
                    startIcon={
                      thumbnailUploading ? (
                        <CircularProgress size={20} />
                      ) : (
                        <UploadIcon className="ml-2" />
                      )
                    }
                    sx={{ mt: 2 }}
                  >
                    آپلود تصویر بلاگ
                  </Button>
                )}
                {thumbnailUploadedFile && (
                  <Alert severity="success" sx={{ mt: 2 }}>
                    تصویر با موفقیت آپلود شد
                  </Alert>
                )}
            </div>
          </div>

          {/* Content Editor */}
          <div className="mb-6">
            <Typography variant="subtitle1" className="mb-2">
              محتوای بلاگ
            </Typography>
            <Editor submitHandlerForPassData={submitHandlerForPassData} initialContent="" />
            {contentError && (
              <Typography color="error" variant="caption" className="mt-1">
                {contentError}
              </Typography>
            )}
          </div>

          {/* Submit Button */}
          <Box className="flex justify-end mt-8">
            <Button
              variant="contained"
              color="primary"
              type="submit"
              disabled={isPending}
              startIcon={isPending ? <CircularProgress size={20} /> : null}
            >
              {isPending ? 'در حال ذخیره...' : 'ذخیره بلاگ'}
            </Button>
          </Box>
        </form>
      </Paper>
    </div>
  );
};

export default CreateBlog;