import { useState } from 'react'
import {
  CircularProgress,
  Alert,
  Box,
  Typography,
  TextField,
  Button,
} from '@mui/material'

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
} from '../../API/CourseSession/courseSession.hook'

const PackagesPage = () => {
  const { data: packages, isLoading, isError } = useGetAllPackages()

  // State for form
  const [title, setTitle] = useState('')
  const [price, setPrice] = useState('')
  const [formError, setFormError] = useState<string | null>(null)

  const {
    mutate: createPackage,
    isPending: isCreating,
    error: createError,
  } = useCreateCourseSessionPackage()

  const handleSubmit = (e: React.FormEvent) => {
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

    createPackage({ title, price: priceValue })
    setTitle('')
    setPrice('')
  }

  return (
    <div dir="rtl" className="p-6">
      <section>
        <Typography variant="h5" className="pb-8 font-bold">
          لیست پکیج‌ها
        </Typography>

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
                    عنوان پکیج
                  </StyledTableCell>
                  <StyledTableCell className="font-bold">
                    قیمت (تومان)
                  </StyledTableCell>
                </StyledTableRow>
              </StyledTableHead>
              <StyledTableBody>
                {packages &&
                  packages?.map((pkg: any) => (
                    <StyledTableRow key={pkg._id} hover>
                      <StyledTableCell>{pkg?.title}</StyledTableCell>
                      <StyledTableCell>
                        {pkg?.price && pkg?.price.toLocaleString()}
                      </StyledTableCell>
                    </StyledTableRow>
                  ))}
                {packages && packages.length === 0 && (
                  <div className="p-4">پکیجی وجود ندارد</div>
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
                label="قیمت (تومان)"
                variant="outlined"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
                dir="rtl"
                type="number"
                inputMode="numeric"
              />
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
              disabled={isCreating}
              startIcon={isCreating ? <CircularProgress size={20} /> : null}
              fullWidth
            >
              {isCreating ? 'در حال ایجاد...' : 'ایجاد پکیج'}
            </Button>
          </form>
        </div>
      </section>
    </div>
  )
}

export default PackagesPage
