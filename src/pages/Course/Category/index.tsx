import {
  TextField,
  Button,
  CircularProgress,
  Alert,
  Box,
  Typography
} from '@mui/material';

import {
  StyledTableContainer,
  StyledTable,
  StyledTableHead,
  StyledTableBody,
  StyledTableRow,
  StyledTableCell,
} from '../../../components/StyledTableContainer';

import { useState } from 'react';

import { useCourseCategories, useCreateCourseCategory } from '../../../API/Course/course.hook';

import { formatDate } from '../../../utils/date';

const CourseCategoriesPage = () => {
  // Categories list
  const { data: categories, isLoading, isError } = useCourseCategories();
  
  // Create category form
  const [categoryName, setCategoryName] = useState('');
  const { mutate: createCategory, isPending: isCreating, error: createError } = useCreateCourseCategory();
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (categoryName.trim()) {
      createCategory({ name: categoryName });
      setCategoryName('');
    }
  };

  return (
    <div dir='rtl' className="p-6">
      {/* Categories List Section */}
      <section className="mb-12">
        <Typography variant="h5" className="pb-8 font-bold">
          لیست دسته بندی ها
        </Typography>
        
        {isLoading ? (
          <Box className="flex justify-center py-8">
            <CircularProgress />
          </Box>
        ) : isError ? (
          <Alert severity="error" className="mb-4">
            خطا در دریافت لیست دسته بندی ها
          </Alert>
        ) : (
          <StyledTableContainer  >
            <StyledTable>
              <StyledTableHead>
                <StyledTableRow className="bg-gray-100">
                  <StyledTableCell className="font-bold text-rigth">عنوان دسته بندی</StyledTableCell>
                  <StyledTableCell className="font-bold">ID</StyledTableCell>
                  <StyledTableCell className="font-bold">تاریخ ایجاد</StyledTableCell>
                </StyledTableRow>
              </StyledTableHead>
              <StyledTableBody>
                {categories && categories?.map((category: any) => (
                  <StyledTableRow key={category._id} hover>
                    <StyledTableCell>{category.name}</StyledTableCell>
                    <StyledTableCell>{category._id}</StyledTableCell>
                    <StyledTableCell>
                      {formatDate(category.createdAt)}
                    </StyledTableCell>
                  </StyledTableRow>
                ))}
              </StyledTableBody>
            </StyledTable>
          </StyledTableContainer>
        )}
      </section>

      {/* Create Category Section */}
      <section className='mt-8 p-5 border-dashed border-2 '>
        <Typography variant="h5" className="pb-8 font-bold">
          ایجاد دسته بندی جدید
        </Typography>
        
        <form onSubmit={handleSubmit} className="max-w-md">
          <Box className="mb-4 text-right">
            <TextField
              dir='rtl'
              fullWidth
              label="نام دسته بندی"
              variant="outlined"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              required
            />
          </Box>
          
          {createError && (
            <Alert severity="error" className="mb-4">
              {(createError as Error).message || 'خطا در ایجاد دسته بندی'}
            </Alert>
          )}
          
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={isCreating || !categoryName.trim()}
            startIcon={isCreating ? <CircularProgress size={20} /> : null}
          >
            {isCreating ? 'در حال ایجاد...' : 'ایجاد دسته بندی'}
          </Button>
        </form>
      </section>
    </div>
  );
};

export default CourseCategoriesPage;