import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { TextField, Button, Paper, Typography, Box, CircularProgress, Alert } from '@mui/material';
import { MuiChipsInput } from 'mui-chips-input';
import ImageUploader from 'react-images-upload';
import Editor from '../../../components/TextEditor';
import { useBlog, useUpdateBlog } from '../../../API/Blog/blog.hook';
import { Upload as UploadIcon, Save as SaveIcon, Cancel as CancelIcon } from '@mui/icons-material';
import { showToast } from '@/utils/toast';

const SERVER_URL = process.env.REACT_APP_SERVER_URL;
const SERVER_FILE = process.env.REACT_APP_SERVER_FILE;

const EditBlog = () => {
  const { blogId } = useParams<{ blogId: string }>();
  const navigate = useNavigate();
  
  // Hooks
  const { data: blogData, isLoading: blogLoading, error: blogError } = useBlog(blogId!);
  const { mutate: updateBlog, isPending: updatePending } = useUpdateBlog(blogId!);

  // Form state
  const [title, setTitle] = useState<string>('');
  const [subTitle, setSubTitle] = useState<string>('');
  const [content, setContent] = useState<string>('');
  const [thumbnailImage, setThumbnailImage] = useState<File | null>(null);
  const [thumbnailUploadedFile, setThumbnailUploadedFile] = useState<any>(null);
  const [thumbnailUploading, setThumbnailUploading] = useState<boolean>(false);
  const [tags, setTags] = useState<string[]>([]);
  const [dataLoaded, setDataLoaded] = useState<boolean>(false);

  // Error states
  const [titleError, setTitleError] = useState<string>('');
  const [contentError, setContentError] = useState<string>('');

  // Load blog data into form when data is available
  useEffect(() => {
    console.log({blogData});
    if (blogData && !dataLoaded) {
      const blog = blogData;
      
      setTitle(blog.title || '');
      setSubTitle(blog.sub_title || '');
      setContent(blog.content || '');
      setTags(blog.tags || []);
      
      // Set existing thumbnail if available
      if (blog.thumbnail) {
        setThumbnailUploadedFile(blog.thumbnail);
      }
      
      setDataLoaded(true);
    }
  }, [blogData, dataLoaded]);

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
    const blogUpdateData = {
      title,
      sub_title: subTitle,
      content,
      tags,
      ...(thumbnailUploadedFile?._id && { thumbnail: thumbnailUploadedFile._id }),
    };

    // Update blog
    updateBlog(blogUpdateData, {
      onSuccess: () => {
        // Redirect to blog list on success
        navigate('/blog');
        showToast('موفق', 'بلاگ با موفقیت به‌روزرسانی شد', 'success');
      },
      onError: (error) => {
        console.error('Error updating blog:', error);
        showToast('خطا', 'خطا در به‌روزرسانی بلاگ', 'error');
      },
    });
  };

  // File upload functionality
  const uploadFile = async (file: File): Promise<any> => {
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
      showToast('موفق', 'تصویر بلاگ با موفقیت آپلود شد', 'success');
    } catch (error) {
      console.error('Error uploading thumbnail:', error);
      showToast('خطا', 'خطا در آپلود تصویر بلاگ', 'error');
    } finally {
      setThumbnailUploading(false);
    }
  };

  // Loading state
  if (blogLoading) {
    return (
      <div className="w-full max-w-5xl mx-auto">
        <Paper className="p-6 mb-8">
          <div className="flex justify-center items-center h-64">
            <CircularProgress />
            <Typography className="mr-4">در حال بارگیری اطلاعات بلاگ...</Typography>
          </div>
        </Paper>
      </div>
    );
  }

  // Error state
  if (blogError) {
    return (
      <div className="w-full max-w-5xl mx-auto">
        <Paper className="p-6 mb-8">
          <Alert severity="error">
            خطا در بارگیری اطلاعات بلاگ. لطفا دوباره تلاش کنید.
          </Alert>
        </Paper>
      </div>
    );
  }

  // Not found state
  if (!blogData?.id) {
    return (
      <div className="w-full max-w-5xl mx-auto">
        <Paper className="p-6 mb-8">
          <Alert severity="warning">
            بلاگ مورد نظر یافت نشد.
          </Alert>
        </Paper>
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto">
      <Paper className="p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <Typography variant="h5" component="h1" className="font-bold" dir="rtl">
            ویرایش بلاگ
          </Typography>
          <div className="flex gap-2">
            <Button
              variant="outlined"
              endIcon={<CancelIcon className='mr-4' />}
              onClick={() => navigate('/blog')}
            >
              انصراف
            </Button>
          </div>
        </div>

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
            
            {/* Show current thumbnail if exists */}
            {thumbnailUploadedFile && !thumbnailImage && (
              <div className="mb-4">
                <Typography variant="body2" className="mb-2 text-gray-600">
                  تصویر فعلی:
                </Typography>
                <img
                  src={`${SERVER_FILE}/${thumbnailUploadedFile?.file_name}`}
                  alt="Current thumbnail"
                  className="w-48 h-32 object-cover rounded-lg border"
                />
              </div>
            )}
            
            <ImageUploader
              withIcon={true}
              buttonText="انتخاب تصویر جدید"
              onChange={(files) => {
                setThumbnailImage(files[0]);
              }}
              imgExtension={['.jpg', '.jpeg', '.png']}
              maxFileSize={5242880}
              singleImage={true}
              withPreview={true}
              label="حداکثر سایز فایل: 5MB، فرمت‌های مجاز: JPG, JPEG, PNG"
            />

            <div>
              {thumbnailImage && (
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
                  آپلود تصویر جدید
                </Button>
              )}
              {thumbnailImage && thumbnailUploadedFile && (
                <Alert severity="success" sx={{ mt: 2 }}>
                  تصویر جدید با موفقیت آپلود شد
                </Alert>
              )}
            </div>
          </div>

          {/* Content Editor */}
          <div className="mb-6">
            <Typography variant="subtitle1" className="mb-2">
              محتوای بلاگ
            </Typography>
            <Editor 
              submitHandlerForPassData={submitHandlerForPassData} 
              initialContent={content}
            />
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
              disabled={updatePending}
              endIcon={
                updatePending ? <CircularProgress className='mr-4' size={20} /> : <SaveIcon className='mr-4' />
              }
            >
              {updatePending ? 'در حال ذخیره...' : 'ذخیره تغییرات'}
            </Button>
          </Box>
        </form>
      </Paper>
    </div>
  );
};

export default EditBlog;
