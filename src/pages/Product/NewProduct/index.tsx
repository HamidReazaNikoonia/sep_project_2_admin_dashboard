import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import {
  Box,
  TextField,
  Switch,
  Button,
  Typography,
  Grid2 as Grid,
  MenuItem,
  FormControlLabel,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { useCreateProduct, useCategories } from '../../../API/Products/products.hook';
import StyledPaper from '../../../components/StyledPaper';
import { showToast } from '../../../utils/toast';
import ImageUploader from 'react-images-upload'; // You might want to use a different image uploader

const SERVER_URL = process.env.REACT_APP_SERVER_URL;
const SERVER_FILE = process.env.REACT_APP_SERVER_FILE;

// Validation schema
const schema = yup.object({
  title: yup.string().required('عنوان الزامی است'),
  subtitle: yup.string().required('زیرعنوان الزامی است'),
  description: yup
    .string()
    .required('توضیحات الزامی است')
    .min(30, 'توضیحات باید حداقل ۳۰ کاراکتر باشد'),
  slug: yup.string().required('اسلاگ الزامی است'),
  brand: yup.string(),
  category: yup.string().required('دسته‌بندی الزامی است'),
  countInStock: yup.number().min(0).default(0),
  price: yup.number().required('قیمت الزامی است').min(0, 'قیمت باید بزرگتر از صفر باشد'),
  discountable: yup.object({
    status: yup.boolean().default(false),
    percent: yup.number().when('status', {
      is: true,
      then: () => yup.number().required('درصد تخفیف الزامی است').min(0).max(100),
      otherwise: () => yup.number().nullable(),
    }),
  }),
});

type FormData = yup.InferType<typeof schema>;

const NewProduct = () => {
  const navigate = useNavigate();
  const [images, setImages] = useState<File[]>([]);
  const { data: categories = [] } = useCategories();
  const createProduct = useCreateProduct();

  const { control, handleSubmit, watch, formState: { errors } } = useForm<FormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      countInStock: 0,
      discountable: {
        status: false,
        percent: 0,
      },
    },
  });

  const discountableStatus = watch('discountable.status');

  const uploadImage = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const response = await fetch(`${SERVER_URL}/admin/setting/upload`, {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();

      if (!data.uploadedFile) {
        showToast('خطا', 'خطا در اپلود تصویر', 'error');
        return false;
      } else if (!data.uploadedFile?._id) {
        showToast('خطا', 'خطا در اپلود تصویر', 'error');
        return false;
      }
      return data.uploadedFile._id; // Adjust according to your API response
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  };

  const onSubmit = async (data: FormData) => {
    try {
      // Upload images first
      const imageIds = await Promise.all(images.map(uploadImage));
      
      // Create product with image IDs
      // @ts-ignore
      await createProduct.mutateAsync({
        ...data,
        images: imageIds,
        thumbnail: imageIds[0]
      });

      showToast('موفق', 'محصول با موفقیت ایجاد شد', 'success');
      navigate('/products');
    } catch (error) {
      showToast('خطا', 'خطا در ایجاد محصول', 'error');
    }
  };

  return (
    <Box dir="rtl" p={3}>
      <Typography variant="h4" gutterBottom>
        محصول جدید
      </Typography>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Grid container spacing={3}>
          {/* Basic Information */}
          <Grid size={12}>
            <StyledPaper sx={{ p: 3 }}>
              <Typography className='pb-4' variant="h6" gutterBottom>اطلاعات اصلی</Typography>
              <Grid dir="rtl" container spacing={2}>
                <Grid size={{xs: 12, md: 4}}>
                  <Controller
                    name="title"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="عنوان"
                        error={!!errors.title}
                        helperText={errors.title?.message}
                      />
                    )}
                  />
                </Grid>

                <Grid size={{xs: 12, md: 4}}>
                  <Controller
                    name="subtitle"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="زیرعنوان"
                        error={!!errors.subtitle}
                        helperText={errors.subtitle?.message}
                      />
                    )}
                  />
                </Grid>

                <Grid size={{xs: 12, md: 4}}>
                  <Controller
                    name="slug"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="عنوان کلیدی"
                        error={!!errors.slug}
                        helperText={errors.slug?.message}
                      />
                    )}
                  />
                </Grid>

                <Grid size={{xs: 12, md: 4}}>
                  <Controller
                    name="brand"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="برند"
                      />
                    )}
                  />
                </Grid>

                <Grid size={{xs: 12, md: 4}}>
                  <Controller
                    name="category"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        select
                        fullWidth
                        label="دسته‌بندی"
                        error={!!errors.category}
                        helperText={errors.category?.message}
                      >
                        {categories.map((category) => (
                          <MenuItem key={category._id} value={category._id}>
                            {category.name}
                          </MenuItem>
                        ))}
                      </TextField>
                    )}
                  />
                </Grid>

                <Grid  size={12}>
                  <Controller
                    name="description"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        multiline
                        rows={4}
                        label="توضیحات"
                        error={!!errors.description}
                        helperText={errors.description?.message}
                      />
                    )}
                  />
                </Grid>
              </Grid>
            </StyledPaper>
          </Grid>

          {/* Price and Stock */}
          <Grid  size={12}>
            <StyledPaper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>قیمت و موجودی</Typography>
              <Grid container spacing={2}>
                <Grid size={{xs: 12, md: 3}}>
                  <Controller
                    name="price"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        type="number"
                        label="قیمت"
                        error={!!errors.price}
                        helperText={errors.price?.message}
                      />
                    )}
                  />
                </Grid>

                <Grid size={{xs: 12, md: 3}}>
                  <Controller
                    name="countInStock"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        type="number"
                        label="موجودی"
                      />
                    )}
                  />
                </Grid>

                <Grid size={{xs: 12, md: 2}}>
                  <Controller
                    name="discountable.status"
                    control={control}
                    render={({ field }) => (
                      <FormControlLabel
                        control={<Switch {...field} checked={field.value} />}
                        label="تخفیف دارد"
                      />
                    )}
                  />
                </Grid>

                {discountableStatus && (
                  <Grid justifyContent="center" size={{xs: 12, md: 3}}>
                    <Controller
                      name="discountable.percent"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          type="number"
                          label="درصد تخفیف"
                          error={!!errors.discountable?.percent}
                          helperText={errors.discountable?.percent?.message}
                        />
                      )}
                    />
                  </Grid>
                )}
              </Grid>
            </StyledPaper>
          </Grid>

          {/* Images */}
          <Grid size={12}>
            <StyledPaper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>تصاویر</Typography>
              <ImageUploader
                withIcon={true}
                buttonText="انتخاب تصاویر"
                onChange={(files) => setImages(files)}
                imgExtension={['.jpg', '.jpeg', '.png']}
                maxFileSize={5242880}
                withPreview={true}
              />
            </StyledPaper>
          </Grid>

          <Grid  size={12}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              size="large"
              disabled={createProduct.isPending}
            >
              ایجاد محصول
            </Button>
          </Grid>
        </Grid>
      </form>
    </Box>
  );
};

export default NewProduct;