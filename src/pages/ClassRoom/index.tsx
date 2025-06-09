import React, { useState } from 'react'
import {
  useGetAllClassRooms,
  useCreateClassRoom,
} from '../../API/CourseSession/courseSession.hook'
import {
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  Typography,
  Grid2 as Grid,
  Card,
  CardContent,
  CircularProgress,
  Alert,
} from '@mui/material'
import StyledPaper from '@/components/StyledPaper'

const ClassRoom = () => {
  // State for the form
  const [classTitle, setClassTitle] = useState('')
  const [classStatus, setClassStatus] = useState('ACTIVE')
  const [classMaxStudentNumber, setClassMaxStudentNumber] = useState<number>(30)

  // Fetch all classrooms
  const {
    data: classRooms,
    isLoading: isLoadingClassRooms,
    error: classRoomError,
  } = useGetAllClassRooms()

  // Create classroom mutation
  const {
    mutate: createClassRoom,
    isPending: isCreating,
    error: createError,
  } = useCreateClassRoom()

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    createClassRoom({
      class_title: classTitle,
      class_status: classStatus,
      class_max_student_number: classMaxStudentNumber,
    })

    // Reset form after submission
    setClassTitle('')
    setClassStatus('active')
    setClassMaxStudentNumber(30)
  }

  return (
    <div>
      <Typography
        textAlign={'right'}
        variant="h5"
        fontWeight={'bold'}
        gutterBottom
      >
        مدیریت کلاس ها
      </Typography>

      {/* Section 1: Create New Class Room Form */}
      <StyledPaper elevation={3} sx={{ p: 3, mb: 4, py: 6 }}>
        <Typography textAlign={'right'} variant="h5" gutterBottom>
          ایجاد کلاس جدید
        </Typography>

        {createError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            خطایی رخ داده است: {createError.message}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                fullWidth
                label="عنوان کلاس"
                value={classTitle}
                onChange={(e) => setClassTitle(e.target.value)}
                required
                disabled={isCreating}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <FormControl fullWidth>
                <InputLabel>وضعیت</InputLabel>
                <Select
                  value={classStatus}
                  onChange={(e) => setClassStatus(e.target.value)}
                  label="وضعیت"
                  disabled={isCreating}
                >
                  <MenuItem value="ACTIVE">فعال</MenuItem>
                  <MenuItem value="INACTIVE">غیرفعال</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                fullWidth
                type="number"
                label="حداکثر دانشجو"
                value={classMaxStudentNumber}
                onChange={(e) =>
                  setClassMaxStudentNumber(parseInt(e.target.value))
                }
                required
                disabled={isCreating}
                InputProps={{ inputProps: { min: 1 } }}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={isCreating}
                startIcon={isCreating ? <CircularProgress size={20} /> : null}
              >
                {isCreating ? 'ایجاد...' : 'ایجاد کلاس'}
              </Button>
            </Grid>
          </Grid>
        </form>
      </StyledPaper>

      {/* Section 2: Class Room List */}
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography
          fontWeight={'bold'}
          textAlign={'right'}
          variant="h5"
          gutterBottom
        >
          لیست کلاس ها
        </Typography>

        {classRoomError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            خطایی رخ داده است: {classRoomError.message}
          </Alert>
        )}

        {isLoadingClassRooms ? (
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              padding: '2rem',
            }}
          >
            <CircularProgress />
          </div>
        ) : (
          <StyledPaper elevation={3} sx={{ p: 3, mb: 4, py: 6 }}>
            <Grid container spacing={2}>
              {classRooms && classRooms.length > 0 ? (
                classRooms.map((classroom: any) => (
                  <Grid size={{ xs: 12, md: 4 }} key={classroom.id}>
                    <Card>
                      <CardContent dir="rtl">
                        <Typography variant="h6">
                          {classroom.class_title}
                        </Typography>
                        <Typography color="textSecondary">
                          وضعیت:{' '}
                          <span
                            style={{
                              color:
                                classroom.class_status === 'active'
                                  ? 'green'
                                  : 'red',
                              fontWeight: 'bold',
                            }}
                          >
                            {classroom.class_status === 'ACTIVE'
                              ? 'فعال'
                              : 'غیرفعال'}
                          </span>
                        </Typography>
                        <Typography color="textSecondary">
                          حداکثر دانشجو: {classroom.class_max_student_number}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))
              ) : (
                <Grid size={{ xs: 12 }}>
                  <Typography align="center">هیچ کلاسی یافت نشد.</Typography>
                </Grid>
              )}
            </Grid>
          </StyledPaper>
        )}
      </Paper>
    </div>
  )
}

export default ClassRoom
