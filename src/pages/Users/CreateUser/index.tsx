import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
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
  Chip,
  IconButton,
} from '@mui/material';
import { PhotoCamera, Delete, Upload } from '@mui/icons-material';
import { useCreateUser } from '../../../API/Users/users.hook';
import { useProvinces, useCitiesByProvinceId } from '../../../API/SiteInfo/siteInfo.hook';
import { useForm, Controller } from 'react-hook-form';
import { showToast } from '../../../utils/toast'
import momentJalaali from 'moment-jalaali';
import DatePicker from 'react-datepicker2'
import PromptModal from '@/components/PromptModal';

const SERVER_URL = process.env.REACT_APP_SERVER_URL;
const SERVER_FILE = process.env.REACT_APP_SERVER_FILE;

interface FormData {
  first_name: string;
  last_name: string;
  father_name: string;
  mariage_status: string;
  address: string;
  gender: string;
  birth_date: string;
  age: string;
  tel: string;
  mobile: string;
  nationalId: string;
  role: string;
  isVerified: boolean;
  isNationalIdVerified: boolean;
  wallet_amount: number;
  personal_img: string;
  avatar: string;
  job_title: string;
  national_card_images: string[];
}

interface FileUploadState {
  file: File | null;
  uploading: boolean;
  uploadedFile: any;
  error: string | null;
}

const CreateUser: React.FC = () => {
  const navigate = useNavigate();
  const createUserMutation = useCreateUser();

  const { control, handleSubmit, setValue, reset } = useForm<FormData>({
    defaultValues: {
      first_name: '',
      last_name: '',
      father_name: '',
      mariage_status: '',
      address: '',
      gender: '',
      birth_date: '',
      age: '',
      tel: '',
      mobile: '',
      nationalId: '',
      role: 'user',
      isVerified: false,
      isNationalIdVerified: false,
      wallet_amount: 0,
      personal_img: '',
      avatar: '',
      national_card_images: [],
      job_title: '',
    }
  });

  // File upload states
  const [fileUploads, setFileUploads] = useState<Record<string, FileUploadState>>({
    personal_img: { file: null, uploading: false, uploadedFile: null, error: null },
    avatar: { file: null, uploading: false, uploadedFile: null, error: null },
  });

  // Multiple files for national cards
  const [nationalCardFiles, setNationalCardFiles] = useState<File[]>([]);
  const [nationalCardUploads, setNationalCardUploads] = useState<any[]>([]);
  const [uploadingNationalCards, setUploadingNationalCards] = useState(false);

  // Birth date state
  const [birthDate, setBirthDate] = useState<any>(null);

  // Province and city state
  const [selectedProvinceId, setSelectedProvinceId] = useState<string>('');
  const [selectedCityId, setSelectedCityId] = useState<string>('');

  // Hooks for provinces and cities
  const { data: provincesData, isLoading: provincesLoading } = useProvinces();
  const { data: citiesData, isLoading: citiesLoading } = useCitiesByProvinceId(selectedProvinceId);

  const [isWalletEditing, setIsWalletEditing] = useState(true);


  // Prompt Model
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);


  useEffect(() => {
    if (createUserMutation.isError) {
      // navigate('/users')
      console.log('error')
      console.log(createUserMutation.error)
      if (createUserMutation.error?.response?.data?.message) {
        showToast('خطا', createUserMutation.error?.response?.data?.message, 'error')
      }
    }
    
    
  }, [createUserMutation.isError ])
  

  const kir = () => {
    setIsWalletEditing(!isWalletEditing)
  }

  const handleDeleteUser = () => {
    // Open modal with delete action
    setPendingAction(() => kir);
    setIsModalOpen(true);
  };

  const deleteUser = () => {
    console.log("User deleted!");
    // Your actual delete logic here
  };

  const handleConfirm = () => {
    if (pendingAction) {
      pendingAction();
    }
  };

  const provinces = (provincesData || []) as any[];
  const cities = (citiesData?.cities || []) as any[];

  // Province and city handlers
  const handleProvinceChange = (provinceId: string) => {
    setSelectedProvinceId(provinceId);
    setSelectedCityId(''); // Reset city when province changes
  };

  const handleCityChange = (cityId: string) => {
    setSelectedCityId(cityId);
  };

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


  const checkStringEmpty = (value: string) => {
    if (!value || value.trim() === '') {
      return true;
    }
    return false;
  }

  // Handle form submission
  const onSubmit = async (data: FormData) => {
    try {
      // Helper function to check if a value should be included
      const shouldInclude = (value: any): boolean => {
        if (value === null || value === undefined || value === '') return false;
        if (Array.isArray(value) && value.length === 0) return false;
        return true;
      };

      // Validate wallet amount
      if (data.wallet_amount) {
        const walletAmount = Number(data.wallet_amount);
        if (walletAmount < 0) {
          showToast('خطا', 'مقدار کیف پول نمی‌تواند منفی باشد', 'error');
          return false;
        }
        if (walletAmount > 1000000000) {
          showToast('خطا', 'حداکثر مقدار کیف پول باید ۱,۰۰۰,۰۰۰,۰۰۰ ریال باشد', 'error');
          return false;
        }
      }

      // Create base user data object
      const baseUserData = {
        first_name: data.first_name,
        last_name: data.last_name,
        father_name: data.father_name,
        mariage_status: data.mariage_status,
        address: data.address,
        gender: data.gender,
        age: data.age,
        tel: data.tel,
        mobile: data.mobile,
        nationalId: data.nationalId,
        role: data.role,
        personal_img: data.personal_img,
        avatar: data.avatar,
        national_card_images: nationalCardUploads.map(img => img._id),
      };

      // validation
      if (!data.first_name || checkStringEmpty(data.first_name)) {
        showToast('خطا', 'نام الزامی است', 'error');
        return false;
      }
      if (!data.last_name || checkStringEmpty(data.last_name)) {
        showToast('خطا', 'نام خانوادگی الزامی است', 'error');
      }

      if (!data.mobile || checkStringEmpty(data.mobile)) {
        showToast('خطا', 'شماره موبایل الزامی است', 'error');
        return false;
      }

      if (!data.nationalId || checkStringEmpty(data.nationalId)) {
        showToast('خطا', 'کد ملی الزامی است', 'error');
        return false;
      }
      
      
      

      // Filter out empty values
      const userData = Object.entries(baseUserData)
        .filter(([key, value]) => shouldInclude(value))
        .reduce((acc, [key, value]) => {
          acc[key] = value;
          return acc;
        }, {} as any);

      // Add birth_date if exists
      if (birthDate) {
        userData.birth_date = birthDate.format('YYYY-MM-DD');
      }

      // Add province and city if selected
      if (selectedProvinceId) {
        const selectedProvince = provinces.find((p: any) => p.id.toString() === selectedProvinceId);
        if (selectedProvince) {
          userData.province = selectedProvince.id;
        }
      }

      if (selectedCityId) {
        const selectedCity = cities.find((c: any) => c.id.toString() === selectedCityId);
        if (selectedCity) {
          userData.city = selectedCity.id;
        }
      }

      // Always include boolean fields
      userData.isVerified = data.isVerified;
      userData.isNationalIdVerified = data.isNationalIdVerified;

      // Handle wallet amount
      if (data.wallet_amount !== null && data.wallet_amount !== undefined && data.wallet_amount >= 0) {
        userData.wallet = Number(data.wallet_amount);
      }

      console.log('Creating user with data:', userData); // For debugging

      const result = await createUserMutation.mutateAsync(userData);

      showToast('موفق', 'کاربر جدید با موفقیت ایجاد شد', 'success');
      navigate('/users');
    } catch (error) {
      showToast('خطا', 'خطا در ایجاد کاربر جدید', 'error');
      console.error('Error creating user:', error);
    }
  };

  
  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }} dir='rtl'>
      <Paper sx={{ p: 3 }}>
        <Typography pb={5} fontWeight={600} variant="h5" component="h1" gutterBottom>
          ایجاد کاربر جدید
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
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="نام"
                    fullWidth
                    variant="outlined"
                    required
                    helperText="نام الزامی است"
                  />
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="last_name"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="نام خانوادگی"
                    fullWidth
                    variant="outlined"
                    required
                    helperText="نام خانوادگی الزامی است"
                  />
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="father_name"
                control={control}
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

            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="mobile"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="موبایل"
                    fullWidth
                    variant="outlined"
                    required
                    type="tel"
                    helperText="شماره موبایل الزامی است"
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
                render={({ field }) => (
                  <FormControl required fullWidth>
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



            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="job_title"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="شغل"
                    type="number"
                    fullWidth
                    variant="outlined"
                  />
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="role"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth>
                    <InputLabel>نقش کاربر</InputLabel>
                    <Select {...field} label="نقش کاربر">
                      <MenuItem value="user">کاربر عادی</MenuItem>
                      <MenuItem value="admin">ادمین</MenuItem>
                      {/* <MenuItem value="coach">مربی</MenuItem> */}
                    </Select>
                  </FormControl>
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
              <FormControl fullWidth>
                <InputLabel>استان</InputLabel>
                <Select 
                  value={selectedProvinceId} 
                  label="استان"
                  onChange={(e) => handleProvinceChange(e.target.value)}
                  disabled={provincesLoading}
                                                  >
                    {provinces.map((province: any) => (
                     <MenuItem key={province.id} value={province.id.toString()}>
                       {province.name}
                     </MenuItem>
                   ))}
                </Select>
              </FormControl>
            </Grid>

                        <Grid size={{ xs: 12, md: 6 }}>
              <FormControl fullWidth>
                <InputLabel>شهر</InputLabel>
                <Select 
                  value={selectedCityId} 
                  label="شهر"
                  onChange={(e) => handleCityChange(e.target.value)}
                  disabled={!selectedProvinceId || citiesLoading}
                  displayEmpty
                >
                  {!selectedProvinceId ? (
                    <MenuItem value="" disabled>
                      ابتدا استان را انتخاب کنید
                    </MenuItem>
                  ) : (
                    cities && cities.length > 0 && cities.map((city: any) => (
                      <MenuItem key={city.id} value={city.id.toString()}>
                        {city.name}
                      </MenuItem>
                    ))
                  )}
                </Select>
              </FormControl>
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
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="کد ملی"
                    fullWidth
                    variant="outlined"
                    required
                    helperText="کد ملی الزامی است"
                  />
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="wallet_amount"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="موجودی کیف پول"
                    type="number"
                    fullWidth
                    variant="outlined"
                    helperText="حداقل ۱۰۰,۰۰۰ ریال"
                    disabled={isWalletEditing}
                  />
                )}
              />
              <Box sx={{ mt: 1 }}>
              <Button
                variant="outlined"
                size="small"
                onClick={handleDeleteUser}
              >
                ویرایش موجودی
              </Button>
            </Box>
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Typography variant="subtitle2" gutterBottom>
                تاریخ تولد
              </Typography>
              <Box sx={{ 
                '& .datepicker-input': {
                  width: '100%',
                  padding: '10px',
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
            <div className="w-full flex flex-col md:flex-row items-center border-t py-12">
              <div className='w-full md:w-1/2 flex flex-col'>
                <div className='text-sm md:text-base pb-4'>
                  تصویر شخصی
                </div>
                <div className='flex flex-col items-start md:flex-row gap-2 md:items-center'>
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
                    <div className='text-[10px] md:text-sm'>
                      {fileUploads.personal_img.file.name}
                    </div>
                  )}
                  <Button
                    sx={{pl: 2, mr:2}}
                    onClick={() => handleFileUpload('personal_img')}
                    disabled={!fileUploads.personal_img.file || fileUploads.personal_img.uploading}
                    variant="outlined"
                    size="small"
                    startIcon={!fileUploads.personal_img.uploading && <Upload className='ml-2' />}
                  >
                    {fileUploads.personal_img.uploading ? <CircularProgress size={20} /> : 'آپلود فایل'}
                  </Button>
                </div>
              </div>

              <div className='pt-6 md:pt-0 flex items-center gap-4 md:gap-6'>
                {fileUploads.personal_img.uploadedFile && (
                  <div className="bg-white">
                    <div className='text-center text-sm pb-2 md:text-base'>
                      تصویر شخصی آپلود شده
                    </div>
                    <div className="w-24 h-24 md:w-32 md:h-32 rounded border-2 border-gray-400 overflow-hidden">
                      <a href={`${SERVER_FILE}/${fileUploads.personal_img.uploadedFile.file_name}`} target="_blank" rel="noopener noreferrer">
                        <img
                          src={`${SERVER_FILE}/${fileUploads.personal_img.uploadedFile.file_name}`}
                          alt="New Personal Image"
                          className="w-full h-full object-cover"
                        />
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Avatar Upload */}
            <div className="w-full flex flex-col md:flex-row items-center border-y pt-4 pb-6">
              <div className='w-full md:w-1/2'>
                <Typography variant="subtitle1" gutterBottom>
                  آواتار
                </Typography>
                <div className='flex flex-col items-start md:flex-row gap-2 md:items-center'>
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
                    <div className='text-[10px] md:text-sm'>
                      {fileUploads.avatar.file.name}
                    </div>
                  )}
                  <Button
                    sx={{pl: 2, mr:2}}
                    onClick={() => handleFileUpload('avatar')}
                    disabled={!fileUploads.avatar.file || fileUploads.avatar.uploading}
                    variant="outlined"
                    size="small"
                    startIcon={!fileUploads.avatar.uploading && <Upload className='ml-2' />}
                  >
                    {fileUploads.avatar.uploading ? <CircularProgress size={20} /> : 'آپلود فایل'}
                  </Button>
                </div>
              </div>

              <div className='pt-6 md:pt-0 flex items-center gap-4 md:gap-6'>
                {fileUploads.avatar.uploadedFile && (
                  <div className="bg-white">
                    <div className='text-center text-sm pb-2 md:text-base'>
                      آواتار آپلود شده
                    </div>
                    <div className="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden">
                      <a href={`${SERVER_FILE}/${fileUploads.avatar.uploadedFile.file_name}`} target="_blank" rel="noopener noreferrer">
                        <img
                          src={`${SERVER_FILE}/${fileUploads.avatar.uploadedFile.file_name}`}
                          alt="New Avatar"
                          className="w-full h-full object-cover"
                        />
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* National Card Images */}
            <Grid size={{ xs: 12 }}>
              <Typography variant="subtitle1" gutterBottom>
                تصاویر کارت ملی
              </Typography>
              
              {/* Upload Section */}
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
                  <Button className='pl-2' variant="outlined" component="span" startIcon={<Upload className='ml-2' />}>
                    انتخاب تصاویر کارت ملی
                  </Button>
                </label>
              </Box>
              
              {/* Selected Files for Upload */}
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

              {/* Display Uploaded National Card Images */}
              {nationalCardUploads.length > 0 && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="caption" gutterBottom sx={{ display: 'block', mb: 1 }}>
                    تصاویر آپلود شده:
                  </Typography>
                  <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 2 }}>
                    {nationalCardUploads.map((upload, index) => (
                      <Box key={index} sx={{ 
                        border: '2px solid #4caf50', 
                        borderRadius: 2, 
                        overflow: 'hidden',
                        backgroundColor: '#fff'
                      }}>
                        <a 
                          href={`${SERVER_FILE}/${upload?.file_name}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          style={{ textDecoration: 'none' }}
                        >
                          <img 
                            src={`${SERVER_FILE}/${upload?.file_name}`}
                            alt={`تصویر ${index + 1}`}
                            style={{ 
                              width: '100%', 
                              height: '150px', 
                              objectFit: 'cover',
                              display: 'block'
                            }}
                          />
                          <Box sx={{ p: 1, borderTop: '1px solid #4caf50', backgroundColor: '#f1f8e9' }}>
                            <Typography 
                              variant="caption" 
                              sx={{ 
                                fontSize: '0.75rem',
                                color: '#2e7d32',
                                wordBreak: 'break-all'
                              }}
                            >
                              {upload?.file_name}
                            </Typography>
                            <Chip 
                              label="جدید" 
                              size="small" 
                              color="success" 
                              sx={{ ml: 1, height: '16px', fontSize: '0.6rem' }}
                            />
                          </Box>
                        </a>
                      </Box>
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
                  onClick={() => navigate('/users')}
                >
                  انصراف
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={createUserMutation.isPending}
                >
                  {createUserMutation.isPending ? (
                    <CircularProgress size={20} />
                  ) : (
                    'ایجاد کاربر'
                  )}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>

      {/* Prompt Modal for Wallet */}
      <PromptModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirm}
        title="تغییر یا افزایش موجودی کیف پول"
        message="آیا می خواهید موجودی کیف پول را تغییر دهید؟"
        confirmText="بلی"
        cancelText="انصراف"
      />
    </Box>
  );
};

export default CreateUser;
