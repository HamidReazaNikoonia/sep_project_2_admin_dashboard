import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Grid2 as Grid,
  CircularProgress,
  Switch,
  FormControlLabel,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  Chip,
  IconButton,
} from '@mui/material';
import { PhotoCamera, Delete, Upload } from '@mui/icons-material';
import { useUserById, useUpdateUser } from '../../../API/Users/users.hook';
import { useForm, Controller } from 'react-hook-form';
import { showToast } from '../../../utils/toast'
import momentJalaali from 'moment-jalaali';
import DatePicker from 'react-datepicker2'

const SERVER_URL = process.env.REACT_APP_SERVER_URL;

interface FormData {
  first_name: string;
  last_name: string;
  father_name: string;
  mariage_status: string;
  address: string;
  province: string;
  city: string;
  gender: string;
  birth_date: string;
  age: string;
  tel: string;
  nationalId: string;
  isVerified: boolean;
  isNationalIdVerified: boolean;
  wallet_amount: number;
  personal_img: string;
  avatar: string;
  national_card_images: string[];
}

interface FileUploadState {
  file: File | null;
  uploading: boolean;
  uploadedFile: any;
  error: string | null;
}

const EditUser: React.FC = () => {
  const { user_id } = useParams<{ user_id: string }>();
  const navigate = useNavigate();
  const { data: user, isLoading, error } = useUserById(user_id!);
  const updateUserMutation = useUpdateUser();

  const { control, handleSubmit, setValue, reset, watch } = useForm<FormData>();

  // File upload states
  const [fileUploads, setFileUploads] = useState<Record<string, FileUploadState>>({
    personal_img: { file: null, uploading: false, uploadedFile: null, error: null },
    avatar: { file: null, uploading: false, uploadedFile: null, error: null },
  });

  // Multiple files for national cards
  const [nationalCardFiles, setNationalCardFiles] = useState<File[]>([]);
  const [nationalCardUploads, setNationalCardUploads] = useState<any[]>([]);
  const [uploadingNationalCards, setUploadingNationalCards] = useState(false);

  // Add this to your component's state declarations
  const [birthDate, setBirthDate] = useState<any>(null);

  // Set default values when user data is loaded
  useEffect(() => {
    if (user) {
      reset({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        father_name: user.father_name || '',
        mariage_status: user.mariage_status || '',
        address: user.address || '',
        province: user.province || '',
        city: user.city || '',
        gender: user.gender || '',
        birth_date: user.birth_date || '',
        age: user.age || '',
        tel: user.tel || '',
        nationalId: user.nationalId || '',
        isVerified: user.isVerified || false,
        isNationalIdVerified: user.isNationalIdVerified || false,
        wallet_amount: user.wallet?.amount || 0,
        personal_img: user.personal_img?._id || '',
        avatar: user.avatar?._id || '',
        national_card_images: user?.national_card_images?.map((img: { _id: any; }) => img._id) || [],
      });
      // Add this useEffect to set initial birth date when user data loads
      if (user?.birth_date) {
        setBirthDate(momentJalaali(user.birth_date));
      }
    }
  }, [user, reset]);

  // File upload handler
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

  // Handle single file upload
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
      
      // Update form value
      setValue(key as keyof FormData, uploadedFile._id);
      showToast('موفق', 'فایل با موفقیت آپلود شد', 'success');
    } catch (error) {
      setFileUploads(prev => ({
        ...prev,
        [key]: { ...prev[key], uploading: false, error: 'خطا در آپلود فایل' }
      }));
      showToast('خطا', 'خطا در آپلود فایل', 'error');
    }
  };

  // Handle multiple national card images upload
  const handleNationalCardUpload = async () => {
    if (nationalCardFiles.length === 0) return;

    setUploadingNationalCards(true);
    try {
      const uploadPromises = nationalCardFiles.map(file => uploadFile(file));
      const uploadedFiles = await Promise.all(uploadPromises);
      
      setNationalCardUploads(prev => [...prev, ...uploadedFiles]);
      setValue('national_card_images', [...nationalCardUploads, ...uploadedFiles].map(f => f._id));
      setNationalCardFiles([]);
      
      showToast('موفق', 'تصاویر کارت ملی با موفقیت آپلود شدند', 'success');
    } catch (error) {
      showToast('خطا', 'خطا در آپلود تصاویر کارت ملی', 'error');
    } finally {
      setUploadingNationalCards(false);
    }
  };

  // Handle form submission - Alternative approach
  const onSubmit = async (data: FormData) => {
    try {
      // Helper function to check if a value should be included
      const shouldInclude = (value: any): boolean => {
        if (value === null || value === undefined || value === '') return false;
        if (Array.isArray(value) && value.length === 0) return false;
        return true;
      };

      // data validation 
      // Validate wallet amount
      if (data.wallet_amount) {
        const walletAmount = parseInt(data.wallet_amount, 10);
        if (walletAmount < 100000) {
          showToast('خطا', 'حداقل مقدار کیف پول باید ۱۰۰,۰۰۰ ریال باشد', 'error');
          return false;
        }
        if (walletAmount > 1000000000) {
          showToast('خطا', 'حداکثر مقدار کیف پول باید ۱,۰۰۰,۰۰۰,۰۰۰ ریال باشد', 'error');
          return false;
        }
      }

      // Create base update object
      const baseUpdateData = {
        first_name: data.first_name,
        last_name: data.last_name,
        father_name: data.father_name,
        mariage_status: data.mariage_status,
        address: data.address,
        province: data.province,
        city: data.city,
        gender: data.gender,
        age: data.age,
        tel: data.tel,
        nationalId: data.nationalId,
        personal_img: data.personal_img,
        avatar: data.avatar,
        national_card_images: data.national_card_images,
      };

      // Filter out empty values
      const updateData = Object.entries(baseUpdateData)
        .filter(([key, value]) => shouldInclude(value))
        .reduce((acc, [key, value]) => {
          acc[key] = value;
          return acc;
        }, {} as any);

      // Add birth_date if exists
      if (birthDate) {
        updateData.birth_date = birthDate.format('YYYY-MM-DD');
      }

      // Always include boolean fields
      updateData.isVerified = data.isVerified;
      updateData.isNationalIdVerified = data.isNationalIdVerified;

      // Handle wallet amount separately
      if (data.wallet_amount !== null && data.wallet_amount !== undefined && data.wallet_amount >= 0) {
        updateData.wallet = data.wallet_amount ? parseInt(data.wallet_amount, 10) : 0 ;
      }

      // Check if we have any data to update
      if (Object.keys(updateData).length <= 2) { // Only boolean fields
        showToast('هیچ تغییری برای ذخیره وجود ندارد', 'warning');
        return;
      }

      console.log('Sending updateData:', updateData); // For debugging

      await updateUserMutation.mutateAsync({
        userId: user_id!,
        userData: updateData
      });

      showToast('موفق', 'اطلاعات کاربر با موفقیت به‌روزرسانی شد', 'success');
      navigate(`/users/${user_id}`);
    } catch (error) {
      showToast('خطا', 'خطا در به‌روزرسانی اطلاعات کاربر', 'error');
      console.error('Error updating user:', error);
    }
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        خطا در بارگذاری اطلاعات کاربر
      </Alert>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }} dir='rtl'>
      <Paper sx={{ p: 3 }}>
        <Typography pb={5} fontWeight={600} variant="h5" component="h1" gutterBottom>
          ویرایش اطلاعات کاربر
        </Typography>

        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={3}>
            {/* Basic Information */}
            <Grid size={{ xs: 12 }}>
              <Typography variant="h6" gutterBottom color="primary">
                اطلاعات پایه
              </Typography>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="first_name"
                control={control}
                defaultValue=""
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="نام"
                    fullWidth
                    variant="outlined"
                  />
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="last_name"
                control={control}
                defaultValue=""
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="نام خانوادگی"
                    fullWidth
                    variant="outlined"
                  />
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="father_name"
                control={control}
                defaultValue=""
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="نام پدر"
                    fullWidth
                    variant="outlined"
                  />
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="tel"
                control={control}
                defaultValue=""
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="تلفن"
                    fullWidth
                    variant="outlined"
                  />
                )}
              />
            </Grid>

            {/* Personal Information */}
            <Grid size={{ xs: 12 }}>
              <Typography variant="h6" gutterBottom color="primary" sx={{ mt: 2 }}>
                اطلاعات شخصی
              </Typography>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="gender"
                control={control}
                defaultValue=""
                render={({ field }) => (
                  <FormControl fullWidth>
                    <InputLabel>جنسیت</InputLabel>
                    <Select {...field} label="جنسیت">
                      <MenuItem value="M">مرد</MenuItem>
                      <MenuItem value="W">زن</MenuItem>
                    </Select>
                  </FormControl>
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="mariage_status"
                control={control}
                defaultValue=""
                render={({ field }) => (
                  <FormControl fullWidth>
                    <InputLabel>وضعیت تاهل</InputLabel>
                    <Select {...field} label="وضعیت تاهل">
                      <MenuItem value="single">مجرد</MenuItem>
                      <MenuItem value="married">متاهل</MenuItem>
                    </Select>
                  </FormControl>
                )}
              />
            </Grid>
           

            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="age"
                control={control}
                defaultValue=""
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="سن"
                    type="number"
                    fullWidth
                    variant="outlined"
                  />
                )}
              />
            </Grid>

            {/* Address Information */}
            <Grid size={{ xs: 12 }}>
              <Typography variant="h6" gutterBottom color="primary" sx={{ mt: 2 }}>
                اطلاعات آدرس
              </Typography>
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Controller
                name="address"
                control={control}
                defaultValue=""
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="آدرس"
                    fullWidth
                    multiline
                    rows={3}
                    variant="outlined"
                  />
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="province"
                control={control}
                defaultValue=""
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="استان"
                    fullWidth
                    variant="outlined"
                  />
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="city"
                control={control}
                defaultValue=""
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="شهر"
                    fullWidth
                    variant="outlined"
                  />
                )}
              />
            </Grid>

            {/* National ID and Verification */}
            <Grid size={{ xs: 12 }}>
              <Typography variant="h6" gutterBottom color="primary" sx={{ mt: 2 }}>
                اطلاعات هویتی
              </Typography>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="nationalId"
                control={control}
                defaultValue=""
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="کد ملی"
                    fullWidth
                    variant="outlined"
                  />
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="wallet_amount"
                control={control}
                defaultValue={0}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="موجودی کیف پول"
                    type="number"
                    fullWidth
                    variant="outlined"
                  />
                )}
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Typography variant="subtitle2" gutterBottom>
                تاریخ تولد
              </Typography>
              <Box sx={{ 
                '& .datepicker-input': {
                  width: '100%',
                  padding: '15px',
                  zIndex: 99999,
                  border: '1px solid rgba(0, 0, 0, 0.23)',
                  borderRadius: '4px',
                  '&:focus': {
                    borderColor: '#1976d2',
                    outline: 'none'
                  }
                }
              }}>
                <DatePicker
                  value={birthDate}
                  onChange={(value) => setBirthDate(value)}
                  isGregorian={false}
                  timePicker={false}
                  inputFormat="jYYYY/jMM/jDD"
                  className="datepicker-input z-50"
                />
              </Box>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="isVerified"
                control={control}
                defaultValue={false}
                render={({ field }) => (
                  <FormControlLabel
                    control={<Switch {...field} checked={field.value} />}
                    label="تایید شده"
                  />
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="isNationalIdVerified"
                control={control}
                defaultValue={false}
                render={({ field }) => (
                  <FormControlLabel
                    control={<Switch {...field} checked={field.value} />}
                    label="کد ملی تایید شده"
                  />
                )}
              />
            </Grid>

            {/* File Uploads */}
            <Grid size={{ xs: 12 }}>
              <Typography variant="h6" gutterBottom color="primary" sx={{ mt: 2 }}>
                تصاویر
              </Typography>
            </Grid>

            {/* Personal Image Upload */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="subtitle1" gutterBottom>
                تصویر شخصی
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                <input
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  id="personal_img"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setFileUploads(prev => ({
                        ...prev,
                        personal_img: { ...prev.personal_img, file }
                      }));
                    }
                  }}
                />
                <label htmlFor="personal_img">
                  <IconButton color="primary" component="span">
                    <PhotoCamera />
                  </IconButton>
                </label>
                {fileUploads.personal_img.file && (
                  <Typography variant="caption">
                    {fileUploads.personal_img.file.name}
                  </Typography>
                )}
                <Button
                  onClick={() => handleFileUpload('personal_img')}
                  disabled={!fileUploads.personal_img.file || fileUploads.personal_img.uploading}
                  variant="outlined"
                  size="small"
                >
                  {fileUploads.personal_img.uploading ? <CircularProgress size={20} /> : 'آپلود'}
                </Button>
              </Box>
            </Grid>

            {/* Avatar Upload */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="subtitle1" gutterBottom>
                آواتار
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                <input
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  id="avatar"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setFileUploads(prev => ({
                        ...prev,
                        avatar: { ...prev.avatar, file }
                      }));
                    }
                  }}
                />
                <label htmlFor="avatar">
                  <IconButton color="primary" component="span">
                    <PhotoCamera />
                  </IconButton>
                </label>
                {fileUploads.avatar.file && (
                  <Typography variant="caption">
                    {fileUploads.avatar.file.name}
                  </Typography>
                )}
                <Button
                  onClick={() => handleFileUpload('avatar')}
                  disabled={!fileUploads.avatar.file || fileUploads.avatar.uploading}
                  variant="outlined"
                  size="small"
                >
                  {fileUploads.avatar.uploading ? <CircularProgress size={20} /> : 'آپلود'}
                </Button>
              </Box>
            </Grid>

            {/* National Card Images */}
            <Grid size={{ xs: 12 }}>
              <Typography variant="subtitle1" gutterBottom>
                تصاویر کارت ملی
              </Typography>
              <Box sx={{ mb: 2 }}>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  style={{ display: 'none' }}
                  id="national_cards"
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    setNationalCardFiles(files);
                  }}
                />
                <label htmlFor="national_cards">
                  <Button variant="outlined" component="span" startIcon={<Upload />}>
                    انتخاب تصاویر کارت ملی
                  </Button>
                </label>
              </Box>
              
              {nationalCardFiles.length > 0 && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="caption" gutterBottom>
                    فایل‌های انتخاب شده:
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                    {nationalCardFiles.map((file, index) => (
                      <Chip
                        key={index}
                        label={file.name}
                        onDelete={() => {
                          setNationalCardFiles(prev => prev.filter((_, i) => i !== index));
                        }}
                        deleteIcon={<Delete />}
                      />
                    ))}
                  </Box>
                  <Button
                    onClick={handleNationalCardUpload}
                    disabled={uploadingNationalCards}
                    variant="contained"
                    size="small"
                  >
                    {uploadingNationalCards ? <CircularProgress size={20} /> : 'آپلود تصاویر'}
                  </Button>
                </Box>
              )}

              {nationalCardUploads.length > 0 && (
                <Box>
                  <Typography variant="caption" gutterBottom>
                    تصاویر آپلود شده:
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {nationalCardUploads.map((upload, index) => (
                      <Chip
                        key={index}
                        label={`تصویر ${index + 1}`}
                        color="success"
                      />
                    ))}
                  </Box>
                </Box>
              )}
            </Grid>

            {/* Submit Button */}
            <Grid size={{ xs: 12 }}>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 3 }}>
                <Button
                  variant="outlined"
                  onClick={() => navigate(`/users/${user_id}`)}
                >
                  انصراف
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={updateUserMutation.isPending}
                >
                  {updateUserMutation.isPending ? (
                    <CircularProgress size={20} />
                  ) : (
                    'ذخیره تغییرات'
                  )}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
};

export default EditUser;
