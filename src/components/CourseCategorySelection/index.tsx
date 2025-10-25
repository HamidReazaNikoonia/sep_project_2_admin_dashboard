'use client'

import type React from 'react'
import { useState, useEffect } from 'react'
import {
  Checkbox,
  FormControlLabel,
  CircularProgress,
  Button,
} from '@mui/material'
import { useCourseCategories } from '@/API/Course/course.hook'
import { showToast } from '@/utils/toast'


// Mock hook - replace with your actual hook

interface Category {
  _id: string
  name: string
  level: number
  parent: string | null
  isActive: boolean
  children: Category[]
  path?: string
  createdAt: string
  updatedAt: string
  __v: number
}

// Add this new interface for the server category structure
interface ServerCategory {
  id: string
  name: string
  level: number
  isActive: boolean
  path?: string
  parent: ServerCategory | null
}

interface CategoryItemProps {
  category: Category
  selectedCategories: string[]
  onCategoryToggle: (categoryId: string) => void
  level?: number
}

const CategoryItem: React.FC<CategoryItemProps> = ({
  category,
  selectedCategories,
  onCategoryToggle,
  level = 0,
}) => {
  const isSelected = selectedCategories.includes(category._id)
  const hasChildren = category.children && category.children.length > 0

  const handleToggle = () => {
    onCategoryToggle(category._id)
  }

  return (
    <div className="w-full">
      <div
        className={`flex items-center py-1 ${level > 0 ? `mr-${level * 6}` : ''}`}
        style={{ marginRight: level * 24 }}
      >
        <FormControlLabel
          control={
            <Checkbox
              checked={isSelected}
              onChange={handleToggle}
              size="small"
              sx={{
                '& .MuiSvgIcon-root': {
                  fontSize: 18,
                },
              }}
            />
          }
          label={
            <span
              className={`text-sm ${level === 0 ? 'font-semibold text-gray-800' : 'text-gray-600'}`}
            >
              {category.name}
            </span>
          }
          sx={{
            margin: 0,
            '& .MuiFormControlLabel-label': {
              fontSize: '14px',
            },
          }}
        />
      </div>

      {hasChildren && (
        <div className="mt-1">
          {category.children.map((child) => (
            <CategoryItem
              key={child._id}
              category={child}
              selectedCategories={selectedCategories}
              onCategoryToggle={onCategoryToggle}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// Add this new interface for component props
interface CourseCategorySelectionProps {
  passSelectedCategories: (categories: string[]) => void
  defaultCategories?: ServerCategory[] | null
}

// Helper function to extract all category IDs from a single hierarchical category
const extractCategoryIds = (category: ServerCategory | null): string[] => {
  if (!category) return []
  
  const ids: string[] = []
  let current: ServerCategory | null = category
  
  // Traverse from the deepest category to the root
  while (current) {
    ids.unshift(current.id) // Add to the beginning to maintain order
    current = current.parent
  }
  
  return ids
}

// Helper using the path string (more efficient)
const extractCategoryIdsFromPath = (category: ServerCategory | null): string[] => {
  if (!category) return []
  
  // If path exists, split it and add the current category ID
  if (category.path) {
    const pathIds = category.path.split(',').filter(id => id.trim())
    return [...pathIds, category.id]
  }
  
  // Fallback to traversing parent hierarchy
  return extractCategoryIds(category)
}

// Extract all category IDs from an array of categories
const extractAllCategoryIds = (categories: ServerCategory[] | null): string[] => {
  if (!categories || categories.length === 0) return []
  
  const allIds = new Set<string>()
  
  categories.forEach(category => {
    const categoryIds = extractCategoryIdsFromPath(category)
    categoryIds.forEach(id => allIds.add(id))
  })
  
  return Array.from(allIds)
}

const CourseCategorySelection: React.FC<CourseCategorySelectionProps> = ({ 
  passSelectedCategories,
  defaultCategories = null 
}) => {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [categoriesData, setCategoriesData] = useState(null)

  const { data, isLoading, isSuccess, isError } = useCourseCategories()

  useEffect(() => {
    if (data && isSuccess) {
      setCategoriesData(data)
    }
  }, [data, isSuccess])

  // Initialize selected categories with default values from array
  useEffect(() => {
    if (defaultCategories && defaultCategories.length > 0) {
      const categoryIds = extractAllCategoryIds(defaultCategories)
      setSelectedCategories(categoryIds)
    }
  }, [defaultCategories])

  const handleCategoryToggle = (categoryId: string) => {
    setSelectedCategories((prev) => {
      if (prev.includes(categoryId)) {
        return prev.filter((id) => id !== categoryId)
      } else {
        return [...prev, categoryId]
      }
    })
  }

  const implementCategories = () => {
    passSelectedCategories(selectedCategories)
    console.log(selectedCategories)
    showToast('موفقیت', 'دسته بندی ها اضافه شد', 'success')
  }

  const clearSelection = () => {
    setSelectedCategories([])
  }

  if (isLoading) {
    return (
      <div className="w-full p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">
          انتخاب دسته‌بندی
        </h3>
        <div className="flex justify-center items-center py-8">
          <CircularProgress size={24} />
          <span className="ml-2 text-gray-600">
            در حال بارگذاری دسته‌بندی‌ها...
          </span>
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="w-full p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">
          انتخاب دسته‌بندی
        </h3>
        <div className="text-red-500 text-sm">
          خطا در بارگذاری دسته‌بندی‌ها. لطفاً دوباره تلاش کنید.
        </div>
      </div>
    )
  }

  return (
    <div className="w-full p-6 bg-white rounded-lg border border-gray-200">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800">
          انتخاب دسته‌بندی
        </h3>
        {selectedCategories.length > 0 && (
          <button
            onClick={clearSelection}
            className="text-sm text-blue-600 hover:text-blue-800 underline"
          >
            پاک کردن انتخاب‌ها
          </button>
        )}
      </div>

      {selectedCategories.length > 0 && (
        <div className="mb-4 p-3 bg-blue-50 rounded-md">
          <p className="text-sm text-blue-800 mb-2">
            دسته‌بندی‌های انتخاب شده: {selectedCategories.length}
          </p>
          <div className="text-xs text-blue-600">
            شناسه‌ها: {selectedCategories.join(', ')}
          </div>
        </div>
      )}

      <div className="max-h-96 overflow-y-auto border border-gray-100 rounded-md p-3">
        {categoriesData && categoriesData?.length > 0 ? (
          <div className="space-y-2">
            {categoriesData.map((category) => (
              <CategoryItem
                key={category._id}
                category={category}
                selectedCategories={selectedCategories}
                onCategoryToggle={handleCategoryToggle}
              />
            ))}
          </div>
        ) : (
          <div className="text-gray-500 text-sm text-center py-4">
            هیچ دسته‌بندی‌ای یافت نشد
          </div>
        )}
      </div>

      <div className="flex flex-col md:flex-row justify-between items-center py-2 mt-4 ">
        <Button onClick={implementCategories} size="small" variant="contained">
          {' '}
          ثبت{' '}
        </Button>
        <div className="text-xs mt-4 md:mt-0 text-gray-500">
          می‌توانید چندین دسته‌بندی را انتخاب کنید
        </div>
      </div>
    </div>
  )
}

export default CourseCategorySelection
