import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import {
  Box,
  TextField,
  Button,
  Typography,
  Grid2 as Grid,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  CircularProgress,
  Chip,
  IconButton,
  Card,
  CardContent,
  CardMedia,
  Pagination,
  FormHelperText,
  Divider,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Search as SearchIcon,
} from '@mui/icons-material';

// API Hooks
import { useCreateCampaign } from '../../../API/Campain/campain.hook';
import { useProducts } from '../../../API/Products/products.hook';
import { useCourses } from '../../../API/Course/course.hook';
import { useCourseSessions } from '../../../API/CourseSession/courseSession.hook';
import { useGetAllCourseSessionPrograms } from '../../../API/CourseSession/courseSession.hook';

// Types
import type { 
  Campaign, 
  CampaignType, 
  CampaignStatus,
  CampaignItem 
} from '../../../API/Campain/types';

// Utils
import { showToast } from '../../../utils/toast';

const SERVER_FILE = process.env.REACT_APP_SERVER_FILE;

// Campaign Type Options
const campaignTypeOptions: { value: CampaignType; label: string }[] = [
  { value: 'course', label: 'فیلم های آموزشی' },
  { value: 'course-session', label: 'دوره ها' }, 
  { value: 'classProgram', label: 'کلاس ها' },
  { value: 'product', label: 'محصول' },
];

// Campaign Status Options
const campaignStatusOptions: { value: CampaignStatus; label: string }[] = [
  { value: 'draft', label: 'ذخیره' },
  { value: 'active', label: 'فعال' },
  { value: 'paused', label: 'متوقف' },
  { value: 'completed', label: 'تکمیل شده' },
  { value: 'cancelled', label: 'لغو شده' },
];

interface FormData {
  title: string;
  shortDescription: string;
  description: string;
  type: CampaignType | '';
  status: CampaignStatus;
  startDate: string;
  endDate: string;
  isFeatured: boolean;
  priority: number;
  primaryColor: string;
  secondaryColor: string;
  limitPerUser: number | '';
  totalLimit: number | '';
  slug: string;
  metaTitle: string;
  metaDescription: string;
  tags: string[];
  shareText: string;
  hashtags: string[];
  items: string[]; // Selected item IDs
}

const CreateCampaign: React.FC = () => {
  const navigate = useNavigate();
  const createCampaignMutation = useCreateCampaign();

  // Form State
  const [formData, setFormData] = useState<FormData>({
    title: '',
    shortDescription: '',
    description: '',
    type: '',
    status: 'draft',
    startDate: '',
    endDate: '',
    isFeatured: false,
    priority: 0,
    primaryColor: '#FF6B6B',
    secondaryColor: '#4ECDC4',
    limitPerUser: '',
    totalLimit: '',
    slug: '',
    metaTitle: '',
    metaDescription: '',
    tags: [],
    shareText: '',
    hashtags: [],
    items: [],
  });

  // Item Selection States
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  
  // Tag and Hashtag Input States
  const [tagInput, setTagInput] = useState('');
  const [hashtagInput, setHashtagInput] = useState('');

  // Validation Errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  const itemsPerPage = 12;

  // Conditional Data Hooks - Only call when type is selected
  const { 
    data: productsData, 
    isLoading: productsLoading 
  } = useProducts(
    formData.type === 'product' ? {
      page: currentPage,
      limit: itemsPerPage,
      q: searchQuery,
    } : undefined,
    {
      enabled: formData.type === 'product', // Only enable when type is product
    }
  );

  const { 
    data: coursesData, 
    isLoading: coursesLoading 
  } = useCourses(
    formData.type === 'course' ? {
      page: currentPage,
      limit: itemsPerPage,
      q: searchQuery,
    } : undefined,
    {
      enabled: formData.type === 'course', // Only enable when type is course
    }
  );

  const { 
    data: courseSessionsData, 
    isLoading: courseSessionsLoading 
  } = useCourseSessions(
    formData.type === 'course-session' ? {
      page: currentPage,
      limit: itemsPerPage,
      q: searchQuery,
    } : undefined,
    {
      enabled: formData.type === 'course-session', // Only enable when type is course-session
    }
  );

  const { 
    data: programsData, 
    isLoading: programsLoading 
  } = useGetAllCourseSessionPrograms(
    formData.type === 'classProgram' ? {
      page: currentPage,
      limit: itemsPerPage,
      search: searchQuery,
    } : {
      page: 1,
      limit: 1,
      search: '',
    },
    {
      enabled: formData.type === 'classProgram', // Only enable when type is classProgram
    }
  );

  // Get current data based on selected type
  const getCurrentData = () => {
    switch (formData.type) {
      case 'product':
        return {
          data: productsData?.data?.results || [],
          totalPages: Math.ceil((productsData?.data?.totalResults || 0) / itemsPerPage),
          loading: productsLoading,
        };
      case 'course':
        return {
          data: coursesData?.courses || [],
          totalPages: Math.ceil((coursesData?.count || 0) / itemsPerPage),
          loading: coursesLoading,
        };
      case 'course-session':
        return {
          data: courseSessionsData?.courses || [],
          totalPages: Math.ceil((courseSessionsData?.count || 0) / itemsPerPage),
          loading: courseSessionsLoading,
        };
      case 'classProgram':
        return {
          data: programsData?.results || [],
          totalPages: Math.ceil((programsData?.totalResults || 0) / itemsPerPage),
          loading: programsLoading,
        };
      default:
        return { data: [], totalPages: 0, loading: false };
    }
  };

  // Handle form field changes
  const handleInputChange = (field: keyof FormData) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | any
  ) => {
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  // Handle type change and reset pagination
  const handleTypeChange = (event: any) => {
    const newType = event.target.value;
    
    setFormData(prev => ({
      ...prev,
      type: newType,
      items: [] // Reset selected items when type changes
    }));
    
    // Reset all item-related states when type changes
    setSelectedItems([]);
    setCurrentPage(1);
    setSearchQuery('');
    
    // Clear any previous errors
    if (errors.type) {
      setErrors(prev => ({
        ...prev,
        type: ''
      }));
    }
  };

  // Reset pagination and search when type changes
  useEffect(() => {
    if (formData.type) {
      setCurrentPage(1);
      setSearchQuery('');
    }
  }, [formData.type]);

  // Handle item selection
  const handleItemToggle = (itemId: string) => {
    setSelectedItems(prev => {
      const newSelection = prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId];
      
      // Update form data
      setFormData(prevForm => ({
        ...prevForm,
        items: newSelection
      }));
      
      return newSelection;
    });
  };

  // Handle tag addition
  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  // Handle tag removal
  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  // Handle hashtag addition
  const handleAddHashtag = () => {
    if (hashtagInput.trim() && !formData.hashtags.includes(hashtagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        hashtags: [...prev.hashtags, hashtagInput.trim()]
      }));
      setHashtagInput('');
    }
  };

  // Handle hashtag removal
  const handleRemoveHashtag = (hashtagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      hashtags: prev.hashtags.filter(hashtag => hashtag !== hashtagToRemove)
    }));
  };

  // Form validation
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) newErrors.title = 'عنوان الزامی است';
    if (!formData.description.trim()) newErrors.description = 'توضیحات الزامی است';
    if (!formData.type) newErrors.type = 'نوع کمپین الزامی است';
    if (!formData.startDate) newErrors.startDate = 'تاریخ شروع الزامی است';
    if (!formData.endDate) newErrors.endDate = 'تاریخ پایان الزامی است';
    
    if (formData.startDate && formData.endDate && new Date(formData.startDate) >= new Date(formData.endDate)) {
      newErrors.endDate = 'تاریخ پایان باید بعد از تاریخ شروع باشد';
    }
    
    if (formData.priority < 0 || formData.priority > 10) {
      newErrors.priority = 'اولویت باید بین 0 تا 10 باشد';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      showToast('خطا', 'لطفا فیلدهای الزامی را تکمیل کنید', 'error');
      return;
    }

    try {
      const campaignData: Partial<Campaign> = {
        title: formData.title,
        shortDescription: formData.shortDescription,
        description: formData.description,
        type: formData.type as CampaignType,
        status: formData.status,
        startDate: formData.startDate,
        endDate: formData.endDate,
        isFeatured: formData.isFeatured,
        priority: formData.priority,
        primaryColor: formData.primaryColor,
        secondaryColor: formData.secondaryColor,
        limitPerUser: formData.limitPerUser || null,
        totalLimit: formData.totalLimit || null,
        slug: formData.slug,
        metaTitle: formData.metaTitle,
        metaDescription: formData.metaDescription,
        tags: formData.tags,
        socialMedia: {
          shareText: formData.shareText,
          hashtags: formData.hashtags,
        },
        // Items will need to be processed with additional data like prices
        items: selectedItems.map(itemId => ({
          itemType: formData.type as CampaignType,
          itemId,
          originalPrice: 0, // These would need to be set in a next step
          campaignPrice: 0,
          isActive: true,
        })) as CampaignItem[],
        isActive: true,
        autoActivate: false,
        autoDeactivate: true,
        globalDiscount: {
          isEnabled: false,
          type: 'percentage' as const,
        },
        notifications: {
          emailNotification: true,
          smsNotification: false,
          pushNotification: true,
        },
      };

      await createCampaignMutation.mutateAsync(campaignData);
      showToast('موفقیت', 'کمپین با موفقیت ایجاد شد', 'success');
      navigate('/campaigns');
    } catch (error) {
      console.error('Error creating campaign:', error);
      showToast('خطا', 'خطا در ایجاد کمپین', 'error');
    }
  };

  // Render item card based on type
  const renderItemCard = (item: any) => {
    const isSelected = selectedItems.includes(item._id || item.id);
    
    switch (formData.type) {
      case 'product':
        return (
          <Card 
            key={item._id}
            className={`cursor-pointer transition-all duration-200 ${
              isSelected ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:shadow-md'
            }`}
            onClick={() => handleItemToggle(item._id)}
          >
            <CardMedia
              component="img"
              height="120"
              image={item.thumbnail ? `${SERVER_FILE}/${item.thumbnail}` : '/placeholder-image.jpg'}
              alt={item.title}
              className="h-32 object-cover"
            />
            <CardContent className="p-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <Typography variant="subtitle2" className="font-semibold line-clamp-2">
                    {item.title}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" className="line-clamp-1">
                    {item.subtitle}
                  </Typography>
                </div>
                <Checkbox
                  checked={isSelected}
                  onChange={() => handleItemToggle(item._id)}
                  size="small"
                />
              </div>
            </CardContent>
          </Card>
        );

      case 'course':
        return (
          <Card 
            key={item._id}
            className={`cursor-pointer transition-all duration-200 ${
              isSelected ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:shadow-md'
            }`}
            onClick={() => handleItemToggle(item._id)}
          >
            <CardMedia
              component="img"
              height="120"
              image={item.tumbnail_image?.file_name ? `${SERVER_FILE}/${item.tumbnail_image.file_name}` : '/placeholder-image.jpg'}
              alt={item.title}
              className="h-32 object-cover"
            />
            <CardContent className="p-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <Typography variant="subtitle2" className="font-semibold line-clamp-2">
                    {item.title}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" className="line-clamp-1">
                    {item.sub_title}
                  </Typography>
                </div>
                <Checkbox
                  checked={isSelected}
                  onChange={() => handleItemToggle(item._id)}
                  size="small"
                />
              </div>
            </CardContent>
          </Card>
        );

      case 'course-session':
        return (
          <Card 
            key={item._id}
            className={`cursor-pointer transition-all duration-200 ${
              isSelected ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:shadow-md'
            }`}
            onClick={() => handleItemToggle(item._id)}
          >
            <CardMedia
              component="img"
              height="120"
              image={item.tumbnail?.file_name ? `${SERVER_FILE}/${item.tumbnail.file_name}` : '/placeholder-image.jpg'}
              alt={item.title}
              className="h-32 object-cover"
            />
            <CardContent className="p-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <Typography variant="subtitle2" className="font-semibold line-clamp-2">
                    {item.title}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" className="line-clamp-1">
                    {item.sub_title}
                  </Typography>
                </div>
                <Checkbox
                  checked={isSelected}
                  onChange={() => handleItemToggle(item._id)}
                  size="small"
                />
              </div>
            </CardContent>
          </Card>
        );

      case 'classProgram':
        return (
          <Card 
            key={item._id}
            className={`cursor-pointer transition-all duration-200 ${
              isSelected ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:shadow-md'
            }`}
            onClick={() => handleItemToggle(item._id)}
          >
            <CardMedia
              component="img"
              height="120"
              image={item.course?.tumbnail?.file_name ? `${SERVER_FILE}/${item.course.tumbnail.file_name}` : '/placeholder-image.jpg'}
              alt={item.course?.title}
              className="h-32 object-cover"
            />
            <CardContent className="p-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <Typography variant="subtitle2" className="font-semibold line-clamp-2">
                    {item.course?.title}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" className="line-clamp-1">
                    {item.course?.sub_title}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" className="block mt-1">
                    مدرس: {item.coach?.first_name} {item.coach?.last_name}
                  </Typography>
                </div>
                <Checkbox
                  checked={isSelected}
                  onChange={() => handleItemToggle(item._id)}
                  size="small"
                />
              </div>
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  const { data: currentData, totalPages, loading } = getCurrentData();

  return (
    <Box className="p-6 max-w-7xl mx-auto">
      <Paper className="p-6">
        <div className="flex items-center justify-between mb-6">
          <Typography variant="h4" className="font-bold">
            ایجاد کمپین جدید
          </Typography>
          <div className="flex gap-2">
            <Button
              variant="outlined"
              startIcon={<CancelIcon />}
              onClick={() => navigate('/campaigns')}
            >
              انصراف
            </Button>
            <Button
              variant="contained"
              startIcon={<SaveIcon />}
              onClick={handleSubmit}
              disabled={createCampaignMutation.isLoading}
            >
              {createCampaignMutation.isLoading ? (
                <CircularProgress size={20} />
              ) : (
                'ذخیره کمپین'
              )}
            </Button>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {/* Basic Information */}
            <Grid size={{ xs: 12 }}>
              <Typography variant="h6" className="mb-4 font-semibold border-b pb-2">
                اطلاعات پایه
              </Typography>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="عنوان کمپین *"
                value={formData.title}
                onChange={handleInputChange('title')}
                error={!!errors.title}
                helperText={errors.title}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="توضیح کوتاه"
                value={formData.shortDescription}
                onChange={handleInputChange('shortDescription')}
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="توضیحات کمپین *"
                value={formData.description}
                onChange={handleInputChange('description')}
                error={!!errors.description}
                helperText={errors.description}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl fullWidth error={!!errors.type}>
                <InputLabel>نوع کمپین *</InputLabel>
                <Select
                  value={formData.type}
                  onChange={handleTypeChange}
                  label="نوع کمپین *"
                >
                  {campaignTypeOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
                {errors.type && <FormHelperText>{errors.type}</FormHelperText>}
              </FormControl>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl fullWidth>
                <InputLabel>وضعیت</InputLabel>
                <Select
                  value={formData.status}
                  onChange={handleInputChange('status')}
                  label="وضعیت"
                >
                  {campaignStatusOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Timing */}
            <Grid size={{ xs: 12 }}>
              <Typography variant="h6" className="mb-4 font-semibold border-b pb-2 mt-6">
                زمان‌بندی
              </Typography>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                type="datetime-local"
                label="تاریخ شروع *"
                value={formData.startDate}
                onChange={handleInputChange('startDate')}
                error={!!errors.startDate}
                helperText={errors.startDate}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                type="datetime-local"
                label="تاریخ پایان *"
                value={formData.endDate}
                onChange={handleInputChange('endDate')}
                error={!!errors.endDate}
                helperText={errors.endDate}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            {/* Display Settings */}
            <Grid size={{ xs: 12 }}>
              <Typography variant="h6" className="mb-4 font-semibold border-b pb-2 mt-6">
                تنظیمات نمایش
              </Typography>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.isFeatured}
                    onChange={handleInputChange('isFeatured')}
                  />
                }
                label="کمپین ویژه"
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                type="number"
                label="اولویت (0-10)"
                value={formData.priority}
                onChange={handleInputChange('priority')}
                error={!!errors.priority}
                helperText={errors.priority}
                inputProps={{ min: 0, max: 10 }}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                type="color"
                label="رنگ اصلی"
                value={formData.primaryColor}
                onChange={handleInputChange('primaryColor')}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                type="color"
                label="رنگ فرعی"
                value={formData.secondaryColor}
                onChange={handleInputChange('secondaryColor')}
              />
            </Grid>

            {/* Limits */}
            <Grid size={{ xs: 12 }}>
              <Typography variant="h6" className="mb-4 font-semibold border-b pb-2 mt-6">
                محدودیت‌های خرید
              </Typography>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                type="number"
                label="محدودیت هر کاربر"
                value={formData.limitPerUser}
                onChange={handleInputChange('limitPerUser')}
                helperText="خالی بودن به معنای بدون محدودیت است"
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                type="number"
                label="محدودیت کل"
                value={formData.totalLimit}
                onChange={handleInputChange('totalLimit')}
                helperText="خالی بودن به معنای بدون محدودیت است"
              />
            </Grid>

            {/* SEO */}
            <Grid size={{ xs: 12 }}>
              <Typography variant="h6" className="mb-4 font-semibold border-b pb-2 mt-6">
                سئو و بازاریابی
              </Typography>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                fullWidth
                label="اسلاگ"
                value={formData.slug}
                onChange={handleInputChange('slug')}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                fullWidth
                label="عنوان متا"
                value={formData.metaTitle}
                onChange={handleInputChange('metaTitle')}
                inputProps={{ maxLength: 60 }}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                fullWidth
                label="توضیحات متا"
                value={formData.metaDescription}
                onChange={handleInputChange('metaDescription')}
                inputProps={{ maxLength: 160 }}
              />
            </Grid>

            {/* Tags */}
            <Grid size={{ xs: 12, md: 6 }}>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <TextField
                    fullWidth
                    label="تگ‌ها"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                  />
                  <Button
                    variant="outlined"
                    onClick={handleAddTag}
                    disabled={!tagInput.trim()}
                  >
                    <AddIcon />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-1">
                  {formData.tags.map((tag, index) => (
                    <Chip
                      key={index}
                      label={tag}
                      onDelete={() => handleRemoveTag(tag)}
                      size="small"
                    />
                  ))}
                </div>
              </div>
            </Grid>

            {/* Social Media */}
            <Grid size={{ xs: 12, md: 6 }}>
              <div className="space-y-2">
                <TextField
                  fullWidth
                  label="متن اشتراک‌گذاری"
                  value={formData.shareText}
                  onChange={handleInputChange('shareText')}
                />
                <div className="flex gap-2">
                  <TextField
                    fullWidth
                    label="هشتگ‌ها"
                    value={hashtagInput}
                    onChange={(e) => setHashtagInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddHashtag())}
                  />
                  <Button
                    variant="outlined"
                    onClick={handleAddHashtag}
                    disabled={!hashtagInput.trim()}
                  >
                    <AddIcon />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-1">
                  {formData.hashtags.map((hashtag, index) => (
                    <Chip
                      key={index}
                      label={`#${hashtag}`}
                      onDelete={() => handleRemoveHashtag(hashtag)}
                      size="small"
                    />
                  ))}
                </div>
              </div>
            </Grid>

            {/* Items Selection - Only show if type is selected */}
            {formData.type && (
              <>
                <Grid size={{ xs: 12 }}>
                  <Typography variant="h6" className="mb-4 font-semibold border-b pb-2 mt-6">
                    انتخاب آیتم‌ها
                  </Typography>
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <div className="space-y-4">
                    {/* Search */}
                    <TextField
                      fullWidth
                      placeholder="جستجو..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      InputProps={{
                        startAdornment: <SearchIcon className="ml-2 text-gray-400" />,
                      }}
                    />

                    {/* Selected Items Count */}
                    {selectedItems.length > 0 && (
                      <Typography variant="body2" color="primary">
                        {selectedItems.length} آیتم انتخاب شده
                      </Typography>
                    )}

                    {/* Items Grid */}
                    {loading ? (
                      <div className="flex justify-center p-8">
                        <CircularProgress />
                        <Typography className="ml-2">در حال بارگیری...</Typography>
                      </div>
                    ) : currentData.length === 0 ? (
                      <div className="text-center p-8 text-gray-500">
                        <Typography>هیچ آیتمی یافت نشد</Typography>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {currentData.map(renderItemCard)}
                      </div>
                    )}

                    {/* Pagination */}
                    {totalPages > 1 && (
                      <div className="flex justify-center mt-4">
                        <Pagination
                          count={totalPages}
                          page={currentPage}
                          onChange={(_, page) => setCurrentPage(page)}
                          color="primary"
                        />
                      </div>
                    )}
                  </div>
                </Grid>
              </>
            )}
          </Grid>
        </form>
      </Paper>
    </Box>
  );
};

export default CreateCampaign;