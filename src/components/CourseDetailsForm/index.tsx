import React, { useState } from 'react'
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Alert,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import Editor from '@/components/TextEditor'

interface DetailItem {
  header_title: string
  description: string
}

interface CourseDetailsFormProps {
  onDetailsChange: (details: DetailItem[]) => void
}

const CourseDetailsForm: React.FC<CourseDetailsFormProps> = ({ onDetailsChange }) => {
  const [details, setDetails] = useState<DetailItem[]>([])
  const [currentHeaderTitle, setCurrentHeaderTitle] = useState('')
  const [currentDescription, setCurrentDescription] = useState('')
  const [headerTitleError, setHeaderTitleError] = useState('')

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

    // Add new detail to the list
    const newDetail: DetailItem = {
      header_title: currentHeaderTitle,
      description: currentDescription,
    }

    const updatedDetails = [...details, newDetail]
    setDetails(updatedDetails)
    onDetailsChange(updatedDetails)

    // Reset form
    setCurrentHeaderTitle('')
    setCurrentDescription('')
    setHeaderTitleError('')
  }

  return (
    <Box>
      <Typography fontWeight={800} variant="subtitle1" sx={{ mb: 2 }}>
        افزودن جزئیات
      </Typography>

      <Paper sx={{ p: 3, mb: 3 }}>
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
              initialContent=""
            />
          </Box>
        </Box>

        <div className='mb-4'>
        <Alert severity="info">
          <div className='mr-2'>
          با کلیک روی دکمه "اضافه کردن سرفصل به جزئیات"، سرفصل را به جزئیات اضافه کنید.
         و از قسمت پایین صفحه میتوانید ترتیب جزئیات را مشاهده کنید. و یا حذف کنید.
          </div>
        </Alert>
        </div>

        <div className='mb-4'>
        <Alert severity="warning">
          <div className='mr-2'>
          لطفا قبل از اضافه کردن سرفصل به جزئیات، توضیحات را وارد کنید. و روی دکمه ذخیره کلیک کنید تا جزئیات ذخیره شود.
          </div>
        </Alert>
        </div>

        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon className="ml-2" />}
          onClick={handleSaveDetail}
        >
           اضافه کردن سرفصل به جزئیات
        </Button>
      </Paper>

      {details.length > 0 && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" color="text.secondary">
            تعداد جزئیات ذخیره شده: {details.length}
          </Typography>
        </Box>
      )}
    </Box>
  )
}

export default CourseDetailsForm

