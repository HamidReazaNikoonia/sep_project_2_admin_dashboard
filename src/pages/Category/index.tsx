import {
  TextField,
  Button,
  CircularProgress,
  Alert,
  Box,
  Typography,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider
} from '@mui/material';
import { ExpandMore, ChevronRight, Folder, FolderOpen, Category as CategoryIcon } from '@mui/icons-material';
import { SimpleTreeView } from '@mui/x-tree-view/SimpleTreeView';
import { TreeItem } from '@mui/x-tree-view/TreeItem';

import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router';

// Import all category hooks
import { useCourseCategories, useCreateCourseCategory } from '../../API/Course/course.hook';
import { useCategories, useCreateCategory } from '../../API/Products/products.hook';
import { useCourseSessionCategories, useCreateCourseSessionCategory } from '../../API/CourseSession/courseSession.hook';

import { formatDate } from '../../utils/date';
import { showToast } from '../../utils/toast';


// Define the unified category interface based on the model you provided
interface UnifiedCategory {
  _id: string;
  name: string;
  parent: UnifiedCategory | null;
  children?: UnifiedCategory[];
  level: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Category type mapping
type CategoryType = 'product' | 'course' | 'course-session';

const CATEGORY_TYPE_LABELS: Record<CategoryType, string> = {
  'product': 'محصولات',
  'course': 'دوره‌ها',
  'course-session': 'جلسات دوره'
};

const getErrorMessage = (error: any): string | false => {
  if (error.response?.data?.message) {
    if (error.response.data.message.includes('Category name is required')) {
      return 'نام دسته‌بندی الزامی است';
    } else if (error.response.data.message.includes('Category name already taken')) {
      return 'نام دسته‌بندی تکراری است';
    }
    return error.response.data.message
  }
  return false;
}

const CategoriesPage = () => {
  const [searchParams] = useSearchParams();
  const categoryType = (searchParams.get('type') as CategoryType) || 'course';

  // State for create form
  const [categoryName, setCategoryName] = useState('');
  const [categoryParentId, setCategoryParentId] = useState('');
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  // Conditional hooks based on category type - only call the hook for current type
  const {
    data: productCategories,
    isLoading: isLoadingProducts,
    isError: isErrorProducts
  } = useCategories({
    enabled: categoryType === 'product'
  });

  const {
    data: courseCategories,
    isLoading: isLoadingCourse,
    isError: isErrorCourse
  } = useCourseCategories({
    enabled: categoryType === 'course'
  });

  const {
    data: courseSessionCategories,
    isLoading: isLoadingCourseSession,
    isError: isErrorCourseSession
  } = useCourseSessionCategories({
    enabled: categoryType === 'course-session'
  });

  // Conditional create hooks
  const {
    mutate: createProductCategory,
    isPending: isCreatingProduct,
    error: createProductError
  } = useCreateCategory();

  const {
    mutate: createCourseCategory,
    isPending: isCreatingCourse,
    isError: isCreatingCourseError,
    error: createCourseError
  } = useCreateCourseCategory();

  const {
    mutate: createCourseSessionCategory,
    isPending: isCreatingCourseSession,
    error: createCourseSessionError
  } = useCreateCourseSessionCategory();


  useEffect(() => {
    if (isCreatingCourseError) {
      console.log(createCourseError)
      const errorMessage = getErrorMessage(createCourseError)

      if (errorMessage) {
        showToast('خطا', errorMessage, 'error');
      } else {
        showToast('خطا', 'خطا در ایجاد دسته‌بندی', 'error');
      }
    }
  
    
  }, [isCreatingCourseError])

  

  // Get current data based on type
  const currentData = useMemo(() => {
    switch (categoryType) {
      case 'product':
        return {
          categories: productCategories,
          isLoading: isLoadingProducts,
          isError: isErrorProducts,
          createCategory: createProductCategory,
          isCreating: isCreatingProduct,
          createError: createProductError
        };
      case 'course':
        return {
          categories: courseCategories,
          isLoading: isLoadingCourse,
          isError: isErrorCourse,
          createCategory: createCourseCategory,
          isCreating: isCreatingCourse,
          createError: createCourseError
        };
      case 'course-session':
        return {
          categories: courseSessionCategories,
          isLoading: isLoadingCourseSession,
          isError: isErrorCourseSession,
          createCategory: createCourseSessionCategory,
          isCreating: isCreatingCourseSession,
          createError: createCourseSessionError
        };
      default:
        return {
          categories: [],
          isLoading: false,
          isError: false,
          createCategory: () => { },
          isCreating: false,
          createError: null
        };
    }
  }, [
    categoryType,
    productCategories, courseCategories, courseSessionCategories,
    isLoadingProducts, isLoadingCourse, isLoadingCourseSession,
    isErrorProducts, isErrorCourse, isErrorCourseSession,
    createProductCategory, createCourseCategory, createCourseSessionCategory,
    isCreatingProduct, isCreatingCourse, isCreatingCourseSession,
    createProductError, createCourseError, createCourseSessionError
  ]);

  // Build tree structure from flat category list
  const buildCategoryTree = (categories: any[]): UnifiedCategory[] => {
    if (!categories) return [];

    const categoryMap = new Map<string, UnifiedCategory>();
    const rootCategories: UnifiedCategory[] = [];

    // First pass: Create all category objects
    categories.forEach((cat: any) => {
      const category: UnifiedCategory = {
        _id: cat._id,
        name: cat.name,
        parent: null,
        children: cat.children || [],
        level: cat.level || 0,
        isActive: cat.isActive !== undefined ? cat.isActive : true,
        createdAt: cat.createdAt,
        updatedAt: cat.updatedAt
      };
      categoryMap.set(cat._id, category);
    });

    // Second pass: Build relationships
    categories.forEach((cat: any) => {
      const category = categoryMap.get(cat._id);
      if (!category) return;

      if (cat.parent && categoryMap.has(cat.parent._id || cat.parent)) {
        const parentId = cat.parent._id || cat.parent;
        const parent = categoryMap.get(parentId);
        if (parent) {
          category.parent = parent;
          parent.children = parent.children || [];
          parent.children.push(category);
        }
      } else {
        rootCategories.push(category);
      }
    });

    return rootCategories;
  };

  const categoryTree = useMemo(() => {
    return buildCategoryTree(currentData.categories as any[]);
  }, [currentData.categories]);

  // Render tree item
  const renderTreeItem = (category: UnifiedCategory) => {
    const hasChildren = category.children && category.children.length > 0;


    console.log('data-----', { hasChildren, category })

    return (
      <TreeItem
        key={category._id}
        itemId={category._id}
        label={
          <Box className="flex items-center justify-between py-2 px-2 hover:bg-gray-50 rounded">
            <Box className="flex items-center gap-2">
              {hasChildren ? (
                <FolderOpen className="text-blue-500" fontSize="small" />
              ) : (
                <CategoryIcon className="text-gray-500" fontSize="small" />
              )}
              <Typography className="font-medium">
                {category.name}
              </Typography>
              <Chip
                label={`سطح ${category.level}`}
                size="small"
                color={category.level === 0 ? 'primary' : 'default'}
                variant="outlined"
              />
              {!category.isActive && (
                <Chip
                  label="غیرفعال"
                  size="small"
                  color="error"
                  variant="outlined"
                />
              )}
            </Box>
            <Box className="flex items-center gap-2 text-sm text-gray-500">
              <span>{formatDate(category.createdAt)}</span>
              <span>ID: {category._id}</span>
            </Box>
          </Box>
        }
      >
        {hasChildren && category.children?.map(renderTreeItem)}
      </TreeItem>
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (categoryParentId) {
      if (!/^[0-9a-fA-F]{24}$/.test(categoryParentId)) {
        showToast('خطا', 'ID دسته‌بندی پدر معتبر نیست', 'error');
        return;
      }
    }

    if (categoryName.trim()) {
      currentData.createCategory({
        name: categoryName,
        ...(categoryParentId && /^[0-9a-fA-F]{24}$/.test(categoryParentId) ? { parent: categoryParentId } : {})
      });
      setCategoryName('');
      setCategoryParentId('');
    }
  };

  const handleExpandedItemsChange = (event: React.SyntheticEvent | null, itemIds: string[]) => {
    setExpandedItems(itemIds);
  };

  return (
    <div dir='rtl' className="p-6">
      {/* Header with category type indicator */}
      <Box className="mb-6">
        <Typography variant="h4" className="font-bold pb-4">
          مدیریت دسته‌بندی‌ها
        </Typography>
        <Chip
          label={`نوع: ${CATEGORY_TYPE_LABELS[categoryType]}`}
          color="primary"
          variant="outlined"
          className="mb-4"
        />
      </Box>

      {/* Categories List Section */}
      <section className="mb-12">
        <Typography variant="h5" className="pb-8 font-bold">
          لیست دسته‌بندی‌ها (نمایش درختی)
        </Typography>

        {currentData.isLoading ? (
          <Box className="flex justify-center py-8">
            <CircularProgress />
          </Box>
        ) : currentData.isError ? (
          <Alert severity="error" className="mb-4">
            خطا در دریافت لیست دسته‌بندی‌ها
          </Alert>
        ) : categoryTree.length === 0 ? (
          <Alert severity="info" className="mb-4">
            هیچ دسته‌بندی‌ای یافت نشد
          </Alert>
        ) : (
          <Box className="border rounded-lg p-4 bg-white" sx={{ minHeight: 300, minWidth: 250 }}>
            <SimpleTreeView
              dir='ltr'
              expandedItems={expandedItems}
              onExpandedItemsChange={handleExpandedItemsChange}
              sx={{
                '& .MuiTreeItem-root': {
                  '& .MuiTreeItem-content': {
                    padding: '4px 8px',
                    borderRadius: '8px',
                  },
                  '& .MuiTreeItem-content:hover': {
                    backgroundColor: 'rgba(0, 0, 0, 0.04)',
                  },
                }
              }}
            >
              {categoryTree.map(renderTreeItem)}
            </SimpleTreeView>
          </Box>
        )}
      </section>

      <Divider className="my-8" />

      {/* Create Category Section */}
      <section className='mt-8'>
        <Accordion defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Typography variant="h5" className="font-bold">
              ایجاد دسته‌بندی جدید
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <form onSubmit={handleSubmit} className="max-w-md">
              <Box className="mb-4 text-right">
                <TextField
                  dir='rtl'
                  fullWidth
                  label="نام دسته‌بندی"
                  variant="outlined"
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  required
                  helperText={`دسته‌بندی جدید در ${CATEGORY_TYPE_LABELS[categoryType]} ایجاد خواهد شد`}
                  sx={{
                    '& .MuiFormHelperText-root': {
                      textAlign: 'right'
                    }
                  }}
                />
              </Box>


              <Box className="mb-4 text-right">
                <TextField
                  dir='rtl'
                  fullWidth
                  label="ID دسته‌بندی پدر"
                  variant="outlined"
                  value={categoryParentId}
                  onChange={(e) => setCategoryParentId(e.target.value)}
                  helperText="از لیست بالا برای انتخاب ID دسته‌بندی پدر استفاده کنید"
                  sx={{
                    '& .MuiFormHelperText-root': {
                      textAlign: 'right'
                    }
                  }}
                />
              </Box>

              {currentData.createError && (
                <Alert severity="error" className="mb-4">
                  <div className='mr-4'>
                    {getErrorMessage(currentData.createError as any) || 'خطا در ایجاد دسته‌بندی'}
                  </div>
                </Alert>
              )}

              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={currentData.isCreating || !categoryName.trim()}
                startIcon={currentData.isCreating ? <CircularProgress size={20} /> : null}
              >
                {currentData.isCreating ? 'در حال ایجاد...' : 'ایجاد دسته‌بندی'}
              </Button>


            </form>
            <div className='w-full mt-4'>
              <Alert severity="info" className="mb-4">
                <div className='px-2 w-full flex justify-between items-center'>
                  <div>
                    در صورتی که بعد از ایجاد دسته بندی , لیست بالا آپدیت نشد , لطفا صفحه را رفرش کنید
                  </div>

                  <div className='mr-8 text-blue-500 cursor-pointer border px-4 py-0.5 rounded-md border-blue-500 hover:bg-blue-500 hover:text-white transition-all duration-300' onClick={() => window.location.reload()}>
                       بارگذاری مجدد
                  </div>
                </div>
              </Alert>
            </div>
          </AccordionDetails>
        </Accordion>
      </section>
    </div>
  );
};

export default CategoriesPage;