import React, { useState, useEffect } from 'react'
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Alert,
  IconButton,
  Divider,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import SaveIcon from '@mui/icons-material/Save'
import CancelIcon from '@mui/icons-material/Cancel'
import Editor from '@/components/TextEditor'

export interface DetailItem {
  header_title: string
  description: string
}

interface CourseDetailsFormEditableProps {
  initialDetails?: DetailItem[]
  onDetailsChange: (details: DetailItem[]) => void
}

const CourseDetailsFormEditable: React.FC<CourseDetailsFormEditableProps> = ({ 
  initialDetails = [],
  onDetailsChange 
}) => {
  const [details, setDetails] = useState<DetailItem[]>(initialDetails)
  const [currentHeaderTitle, setCurrentHeaderTitle] = useState('')
  const [currentDescription, setCurrentDescription] = useState('')
  const [headerTitleError, setHeaderTitleError] = useState('')
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [isFormVisible, setIsFormVisible] = useState(false)

  // Update details when initialDetails changes
  useEffect(() => {
    if (initialDetails && initialDetails.length > 0) {
      setDetails(initialDetails)
    }
  }, [initialDetails])

  const handleDescriptionChange = (data: string) => {
    setCurrentDescription(data)
  }

  const handleSaveDetail = () => {
    // Validation
    if (!currentHeaderTitle.trim()) {
      setHeaderTitleError('عنوان الزامی است')
      return
    }

    if (!currentDescription.trim()) {
      setHeaderTitleError('توضیحات الزامی است')
      return
    }

    let updatedDetails: DetailItem[]

    if (editingIndex !== null) {
      // Update existing detail
      updatedDetails = details.map((detail, index) =>
        index === editingIndex
          ? { header_title: currentHeaderTitle, description: currentDescription }
          : detail
      )
      setEditingIndex(null)
    } else {
      // Add new detail
      const newDetail: DetailItem = {
        header_title: currentHeaderTitle,
        description: currentDescription,
      }
      updatedDetails = [...details, newDetail]
    }

    setDetails(updatedDetails)
    onDetailsChange(updatedDetails)

    // Reset form
    resetForm()
  }

  const handleEditDetail = (index: number) => {
    const detail = details[index]
    setCurrentHeaderTitle(detail.header_title)
    setCurrentDescription(detail.description)
    setEditingIndex(index)
    setIsFormVisible(true)
  }

  const handleDeleteDetail = (index: number) => {
    const updatedDetails = details.filter((_, i) => i !== index)
    setDetails(updatedDetails)
    onDetailsChange(updatedDetails)

    // If we're editing this detail, cancel the edit
    if (editingIndex === index) {
      resetForm()
    }
  }

  const handleCancelEdit = () => {
    resetForm()
  }

  const resetForm = () => {
    setCurrentHeaderTitle('')
    setCurrentDescription('')
    setHeaderTitleError('')
    setEditingIndex(null)
    setIsFormVisible(false)
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography fontWeight={800} variant="subtitle1">
          جزئیات دوره
        </Typography>
        {!isFormVisible && (
          <Button
            variant="outlined"
            startIcon={<AddIcon className="ml-2" />}
            onClick={() => setIsFormVisible(true)}
            size="small"
          >
            افزودن سرفصل جدید
          </Button>
        )}
      </Box>

      {/* List of existing details */}
      {details.length > 0 && (
        <Box sx={{ mb: 3 }}>
          {details.map((detail, index) => (
            <Paper
              key={index}
              sx={{
                p: 2,
                mb: 2,
                border: editingIndex === index ? '2px solid #1976d2' : '1px solid #e0e0e0',
              }}
            >
              <Box display="flex" justifyContent="space-between" alignItems="start">
                <Box flex={1}>
                  <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
                    {detail.header_title}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                    }}
                  >
                    {detail.description.replace(/<[^>]*>/g, '').substring(0, 100)}...
                  </Typography>
                </Box>
                <Box display="flex" gap={1}>
                  <IconButton
                    size="small"
                    color="primary"
                    onClick={() => handleEditDetail(index)}
                    disabled={editingIndex !== null && editingIndex !== index}
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => handleDeleteDetail(index)}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
              </Box>
            </Paper>
          ))}
        </Box>
      )}

      {/* Form for adding/editing details */}
      {isFormVisible && (
        <Paper sx={{ p: 3, mb: 3, bgcolor: '#f5f5f5' }}>
          <Typography fontWeight={700} variant="subtitle2" sx={{ mb: 2 }}>
            {editingIndex !== null ? 'ویرایش سرفصل' : 'افزودن سرفصل جدید'}
          </Typography>

          <Box sx={{ mb: 3 }}>
            <TextField
              fullWidth
              label="عنوان بخش"
              value={currentHeaderTitle}
              onChange={(e) => {
                setCurrentHeaderTitle(e.target.value)
                setHeaderTitleError('')
              }}
              error={!!headerTitleError}
              helperText={headerTitleError}
              sx={{ mb: 3 }}
            />

            <Typography fontWeight={600} variant="body2" sx={{ mb: 1 }}>
              توضیحات
            </Typography>
            <Box sx={{ marginBottom: '20px' }}>
              <Editor
                submitHandlerForPassData={handleDescriptionChange}
                initialContent={currentDescription}
              />
            </Box>
          </Box>

          <div className="mb-4">
            <Alert severity="info">
              <div className="mr-2">
                با کلیک روی دکمه "ذخیره"، سرفصل را به جزئیات اضافه کنید. و از قسمت
                بالا میتوانید ترتیب جزئیات را مشاهده کنید و یا حذف کنید.
              </div>
            </Alert>
          </div>

          <div className="mb-4">
            <Alert severity="warning">
              <div className="mr-2">
                لطفا قبل از ذخیره سرفصل، توضیحات را وارد کنید و روی دکمه ذخیره در
                ادیتور کلیک کنید تا جزئیات ذخیره شود.
              </div>
            </Alert>
          </div>

          <Box display="flex" gap={2}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<SaveIcon className="ml-2" />}
              onClick={handleSaveDetail}
            >
              {editingIndex !== null ? 'بروزرسانی سرفصل' : 'ذخیره سرفصل'}
            </Button>
            <Button
              variant="outlined"
              color="secondary"
              startIcon={<CancelIcon className="ml-2" />}
              onClick={handleCancelEdit}
            >
              انصراف
            </Button>
          </Box>
        </Paper>
      )}

      {details.length === 0 && !isFormVisible && (
        <Alert severity="info">
          هیچ سرفصلی برای نمایش وجود ندارد. برای افزودن سرفصل جدید روی دکمه "افزودن
          سرفصل جدید" کلیک کنید.
        </Alert>
      )}

      {details.length > 0 && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" color="text.secondary">
            تعداد سرفصل‌های ذخیره شده: {details.length}
          </Typography>
        </Box>
      )}
    </Box>
  )
}

export default CourseDetailsFormEditable

