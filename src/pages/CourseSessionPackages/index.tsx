import { useState } from 'react'
import {
  CircularProgress,
  Alert,
  Box,
  Typography,
  TextField,
  Button,
  Avatar,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material'
import { CloudUpload, Delete, Edit } from '@mui/icons-material'

import {
  StyledTableContainer,
  StyledTable,
  StyledTableHead,
  StyledTableBody,
  StyledTableRow,
  StyledTableCell,
} from '../../components/StyledTableContainer'

import {
  useGetAllPackages,
  useCreateCourseSessionPackage,
  useUpdateCourseSessionPackage,
  useDeleteCourseSessionPackage,
} from '../../API/CourseSession/courseSession.hook'

const SERVER_URL = process.env.REACT_APP_SERVER_URL;
const SERVER_FILE = process.env.REACT_APP_SERVER_FILE;

const uploadFile = async (file: File): Promise<any> => {
  const formData = new FormData()
  formData.append('file', file)

  const response = await fetch(`${SERVER_URL}/admin/setting/upload`, {
    method: 'POST',
    body: formData,
  })

  if (!response.ok) {
    throw new Error('Upload failed')
  }

  const data = await response.json()
  return data.uploadedFile
}

const PackagesPage = () => {
  const { data: packages, isLoading, isError } = useGetAllPackages()

  // State for create form
  const [title, setTitle] = useState('')
  const [price, setPrice] = useState('')
  const [avatar, setAvatar] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string>('')
  const [formError, setFormError] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  // State for edit dialog
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editingPackage, setEditingPackage] = useState<any>(null)
  const [editTitle, setEditTitle] = useState('')
  const [editPrice, setEditPrice] = useState('')
  const [editAvatar, setEditAvatar] = useState<File | null>(null)
  const [editAvatarPreview, setEditAvatarPreview] = useState<string>('')
  const [editFormError, setEditFormError] = useState<string | null>(null)
  const [isEditUploading, setIsEditUploading] = useState(false)

  const {
    mutate: createPackage,
    isPending: isCreating,
    error: createError,
  } = useCreateCourseSessionPackage()

  const {
    mutate: updatePackage,
    isPending: isUpdating,
  } = useUpdateCourseSessionPackage(editingPackage?._id || '')

  const {
    mutate: deletePackage,
    isPending: isDeleting,
  } = useDeleteCourseSessionPackage(editingPackage?._id || '')

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (!file.type.startsWith('image/')) {
        setFormError('لطفاً یک فایل تصویری انتخاب کنید.')
        return
      }
      
      if (file.size > 5 * 1024 * 1024) {
        setFormError('حجم فایل نباید بیشتر از ۵ مگابایت باشد.')
        return
      }

      setAvatar(file)
      
      const reader = new FileReader()
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
      setFormError(null)
    }
  }

  const handleEditFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (!file.type.startsWith('image/')) {
        setEditFormError('لطفاً یک فایل تصویری انتخاب کنید.')
        return
      }
      
      if (file.size > 5 * 1024 * 1024) {
        setEditFormError('حجم فایل نباید بیشتر از ۵ مگابایت باشد.')
        return
      }

      setEditAvatar(file)
      
      const reader = new FileReader()
      reader.onloadend = () => {
        setEditAvatarPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
      setEditFormError(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)

    if (!price) {
      setFormError('عنوان و قیمت الزامی است.')
      return
    }
    
    const priceValue = Number(price)
    if (isNaN(priceValue) || priceValue < 5000) {
      setFormError('قیمت باید عددی و بیشتر از ۵۰۰۰ باشد.')
      return
    }

    try {
      let avatarId = undefined

      // Only upload if avatar exists
      if (avatar) {
        setIsUploading(true)
        const uploadedFile = await uploadFile(avatar)
        avatarId = uploadedFile._id
        setIsUploading(false)
      }

      createPackage(
        { 
          title, 
          price: priceValue, 
          avatar: avatarId 
        },
        {
          onSuccess: () => {
            setTitle('')
            setPrice('')
            setAvatar(null)
            setAvatarPreview('')
          },
          onError: (error) => {
            setFormError('خطا در ایجاد پکیج')
          }
        }
      )
    } catch (error) {
      setIsUploading(false)
      setFormError('خطا در آپلود فایل')
    }
  }

  const handleEditClick = (pkg: any) => {
    setEditingPackage(pkg)
    setEditTitle(pkg.title || '')
    setEditPrice(pkg.price?.toString() || '')
    setEditAvatar(null)
    setEditAvatarPreview(pkg.avatar?.file_name ? `${SERVER_FILE}/${pkg.avatar.file_name}` : '')
    setEditFormError(null)
    setEditDialogOpen(true)
  }

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setEditFormError(null)

    if (!editPrice) {
      setEditFormError('عنوان و قیمت الزامی است.')
      return
    }
    
    const priceValue = Number(editPrice)
    if (isNaN(priceValue) || priceValue < 5000) {
      setEditFormError('قیمت باید عددی و بیشتر از ۵۰۰۰ باشد.')
      return
    }

    try {
      let avatarId = editingPackage?.avatar?._id

      // Only upload if user selected a new avatar
      if (editAvatar) {
        setIsEditUploading(true)
        const uploadedFile = await uploadFile(editAvatar)
        avatarId = uploadedFile._id
        setIsEditUploading(false)
      }

      updatePackage(
        { 
          title: editTitle, 
          price: priceValue, 
          avatar: avatarId 
        },
        {
          onSuccess: () => {
            setEditDialogOpen(false)
            setEditingPackage(null)
            setEditTitle('')
            setEditPrice('')
            setEditAvatar(null)
            setEditAvatarPreview('')
          },
          onError: (error) => {
            setEditFormError('خطا در ویرایش پکیج')
          }
        }
      )
    } catch (error) {
      setIsEditUploading(false)
      setEditFormError('خطا در آپلود فایل')
    }
  }

  const handleDeleteClick = (pkg: any) => {
    if (window.confirm(`آیا از حذف پکیج "${pkg.title}" اطمینان دارید؟`)) {
      setEditingPackage(pkg)
      deletePackage(undefined, {
        onSuccess: () => {
          setEditingPackage(null)
        },
        onError: () => {
          alert('خطا در حذف پکیج')
          setEditingPackage(null)
        }
      })
    }
  }

  return (
    <div dir="rtl" className="p-6">
      <section>
        <Typography variant="h5" className="pb-8 font-bold">
          لیست پکیج‌ها
        </Typography>

        <div className='w-full mb-4'>
          <Alert severity="warning">
            <div className='mr-2'>
              لطفا در تغییر و حذف پکیج ها دقت کنید, زیرا پکیج هایی که در دوره ها استفاده می شوند 
             </div>
          </Alert>
        </div>

        {isLoading ? (
          <Box className="flex justify-center py-8">
            <CircularProgress />
          </Box>
        ) : isError ? (
          <Alert severity="error" className="mb-4">
            خطا در دریافت لیست پکیج‌ها
          </Alert>
        ) : (
          <StyledTableContainer>
            <StyledTable>
              <StyledTableHead>
                <StyledTableRow className="bg-gray-100">
                  <StyledTableCell className="font-bold">
                    تصویر
                  </StyledTableCell>
                  <StyledTableCell className="font-bold">
                    عنوان پکیج
                  </StyledTableCell>
                  <StyledTableCell className="font-bold">
                    قیمت (ریال)
                  </StyledTableCell>
                  <StyledTableCell className="font-bold">
                    عملیات
                  </StyledTableCell>
                </StyledTableRow>
              </StyledTableHead>
              <StyledTableBody>
                {packages &&
                  packages?.map((pkg: any) => (
                    <StyledTableRow key={pkg._id} hover>
                      <StyledTableCell>
                        <Avatar
                          src={pkg?.avatar?.file_name ? `${SERVER_FILE}/${pkg?.avatar?.file_name}` : ''}
                          alt={pkg?.title}
                          sx={{ width: 50, height: 50 }}
                        />
                      </StyledTableCell>
                      <StyledTableCell>{pkg?.title}</StyledTableCell>
                      <StyledTableCell>
                        {pkg?.price && pkg?.price.toLocaleString()}
                      </StyledTableCell>
                      <StyledTableCell>
                        <Box className="flex gap-2">
                          <IconButton
                            color="primary"
                            onClick={() => handleEditClick(pkg)}
                            size="small"
                            title="ویرایش"
                          >
                            <Edit />
                          </IconButton>
                          <IconButton
                            color="error"
                            onClick={() => handleDeleteClick(pkg)}
                            size="small"
                            title="حذف"
                            disabled={isDeleting && editingPackage?._id === pkg._id}
                          >
                            {isDeleting && editingPackage?._id === pkg._id ? (
                              <CircularProgress size={20} />
                            ) : (
                              <Delete />
                            )}
                          </IconButton>
                        </Box>
                      </StyledTableCell>
                    </StyledTableRow>
                  ))}
                {packages && packages.length === 0 && (
                  <StyledTableRow>
                    <StyledTableCell colSpan={4}>
                      <div className="p-4 text-center">پکیجی وجود ندارد</div>
                    </StyledTableCell>
                  </StyledTableRow>
                )}
              </StyledTableBody>
            </StyledTable>
          </StyledTableContainer>
        )}
      </section>

      {/* Create Package Section */}
      <section className="mt-8 max-w-md mx-auto">
        <div className="bg-white rounded-lg shadow p-6">
          <Typography variant="h6" className="pb-4 font-bold">
            ایجاد پکیج جدید
          </Typography>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="w-full">
              <TextField
                fullWidth
                label="عنوان پکیج"
                variant="outlined"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                dir="rtl"
              />
            </div>

            <div className="w-full">
              <TextField
                fullWidth
                label="قیمت (ریال)"
                variant="outlined"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
                dir="rtl"
                type="number"
                inputMode="numeric"
              />
            </div>

            {/* File Upload Section */}
            <div className="w-full">
              <Box
                sx={{
                  border: '2px dashed #ccc',
                  borderRadius: 2,
                  p: 3,
                  textAlign: 'center',
                  cursor: 'pointer',
                  '&:hover': {
                    borderColor: 'primary.main',
                    backgroundColor: 'rgba(0, 0, 0, 0.02)',
                  },
                }}
              >
                <input
                  accept="image/*"
                  style={{ display: 'none' }}
                  id="avatar-upload"
                  type="file"
                  onChange={handleFileChange}
                />
                <label htmlFor="avatar-upload" style={{ cursor: 'pointer' }}>
                  {avatarPreview ? (
                    <Box className="flex flex-col items-center gap-2">
                      <Avatar
                        src={avatarPreview}
                        sx={{ width: 100, height: 100 }}
                      />
                      <Typography variant="body2" color="text.secondary">
                        کلیک کنید برای تغییر تصویر
                      </Typography>
                    </Box>
                  ) : (
                    <Box className="flex flex-col items-center gap-2">
                      <CloudUpload sx={{ fontSize: 48, color: 'text.secondary' }} />
                      <Typography variant="body1">
                        انتخاب تصویر پکیج
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        (حداکثر ۵ مگابایت)
                      </Typography>
                    </Box>
                  )}
                </label>
              </Box>
            </div>

            {(formError || createError) && (
              <Alert severity="error">
                {formError ||
                  (createError as Error)?.message ||
                  'خطا در ایجاد پکیج'}
              </Alert>
            )}
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={isCreating || isUploading}
              startIcon={(isCreating || isUploading) ? <CircularProgress size={20} /> : null}
              fullWidth
            >
              {isUploading ? 'در حال آپلود...' : isCreating ? 'در حال ایجاد...' : 'ایجاد پکیج'}
            </Button>
          </form>
        </div>
      </section>

      {/* Edit Package Dialog */}
      <Dialog 
        open={editDialogOpen} 
        onClose={() => !isUpdating && !isEditUploading && setEditDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        dir="rtl"
      >
        <DialogTitle>ویرایش پکیج</DialogTitle>
        <DialogContent>
          <form onSubmit={handleEditSubmit} className="space-y-4 pt-4">
            <div className="w-full">
              <TextField
                fullWidth
                label="عنوان پکیج"
                variant="outlined"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                required
                dir="rtl"
              />
            </div>

            <div className="w-full">
              <TextField
                fullWidth
                label="قیمت (ریال)"
                variant="outlined"
                value={editPrice}
                onChange={(e) => setEditPrice(e.target.value)}
                required
                dir="rtl"
                type="number"
                inputMode="numeric"
              />
            </div>

            {/* File Upload Section */}
            <div className="w-full">
              <Box
                sx={{
                  border: '2px dashed #ccc',
                  borderRadius: 2,
                  p: 3,
                  textAlign: 'center',
                  cursor: 'pointer',
                  '&:hover': {
                    borderColor: 'primary.main',
                    backgroundColor: 'rgba(0, 0, 0, 0.02)',
                  },
                }}
              >
                <input
                  accept="image/*"
                  style={{ display: 'none' }}
                  id="edit-avatar-upload"
                  type="file"
                  onChange={handleEditFileChange}
                />
                <label htmlFor="edit-avatar-upload" style={{ cursor: 'pointer' }}>
                  {editAvatarPreview ? (
                    <Box className="flex flex-col items-center gap-2">
                      <Avatar
                        src={editAvatarPreview}
                        sx={{ width: 100, height: 100 }}
                      />
                      <Typography variant="body2" color="text.secondary">
                        کلیک کنید برای تغییر تصویر
                      </Typography>
                    </Box>
                  ) : (
                    <Box className="flex flex-col items-center gap-2">
                      <CloudUpload sx={{ fontSize: 48, color: 'text.secondary' }} />
                      <Typography variant="body1">
                        انتخاب تصویر جدید (اختیاری)
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        (حداکثر ۵ مگابایت)
                      </Typography>
                    </Box>
                  )}
                </label>
              </Box>
            </div>

            {editFormError && (
              <Alert severity="error">{editFormError}</Alert>
            )}
          </form>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button 
            onClick={() => setEditDialogOpen(false)}
            disabled={isUpdating || isEditUploading}
          >
            انصراف
          </Button>
          <Button
            onClick={handleEditSubmit}
            variant="contained"
            color="primary"
            disabled={isUpdating || isEditUploading}
            startIcon={(isUpdating || isEditUploading) ? <CircularProgress size={20} /> : null}
          >
            {isEditUploading ? 'در حال آپلود...' : isUpdating ? 'در حال ویرایش...' : 'ذخیره تغییرات'}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  )
}

export default PackagesPage
