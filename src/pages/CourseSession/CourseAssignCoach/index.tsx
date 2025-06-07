// @ts-nocheck
import React, { useEffect, useState, useRef } from 'react'
import { useParams } from 'react-router'
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Grid2 as Grid,
  TextField,
  MenuItem,
  Button,
  IconButton,
} from '@mui/material'
import UploadIcon from '@mui/icons-material/Upload'
import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/Delete'
import {
  useAssignCoachToCourseSession,
  useCourseSession,
  useCourseSessionClasses,
} from '@/API/CourseSession/courseSession.hook'
import { showToast } from '@/utils/toast'
import { useGetAllCoaches } from '@/API/Coach/coach.hook'
import CoachListAndFilter from '@/components/CoachListAndFilter'
import CustomDataPickerCalendar from '@/components/CustomDataPickerCalendar'
import momentJalaali from 'moment-jalaali'
import clsx from 'clsx'
// import * as momentJalaali from 'moment-jalaali';

const SERVER_URL = process.env.REACT_APP_SERVER_URL
const SERVER_FILE = process.env.REACT_APP_SERVER_FILE

const CourseAssignCoach: React.FC = () => {
  const childRef = useRef()
  // Get course_id from route params
  const { course_id } = useParams<{ course_id: string }>()
  // Store course_id in state
  const [courseId, setCourseId] = useState<string | null>(null)
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null)
  const [selectedCurentCoach, setSelectedCurentCoach] = useState<string | null>(
    null,
  )
  const [selectedSession, setselectedSession] = useState([])

  // DATA STATE
  const [formData, setformData] = useState({
    course_type: 'HOZORI',
    price_real: 0,
    price_discounted: 0,
    max_member_accept: 0,
  })

  // Errors State
  const [errors, setErrors] = useState({
    course_type: false,
    price_real: false,
    price_discounted: false,
    max_member_accept: false,
  })
  // Reservation time state
  const [selectedDateState, setSelectedDateState] = useState(
    momentJalaali().locale('fa').format('jYYYY/jM/jD'),
  )
  const [timeSlotItem, settimeSlotItem] = useState(null)

  // sample media state
  const [sampleMedias, setSampleMedias] = useState([
    { media_type: '', media_title: '' },
  ])
  const [fileUploads, setFileUploads] = useState({})

  // Fetch course session data
  const { data, isLoading, isError, error } = useCourseSession(course_id!)

  const assignCoachMutation = useAssignCoachToCourseSession(course_id)

  // Handler to assign a coach to a program
  const handleAssignCoach = () => {
    console.log(selectedClassId)
    // const requestBody = {
    //   coach_id: selectedCurentCoach,
    //   class_id: selectedClassId,
    //   program_type: ,
    //   max_member_accept,
    //   sessions:
    // }
    // assignCoachMutation.mutate(course_id, requestBody);
  }

  // Fetch All Coaches Data
  const {
    data: coachesData,
    isLoading: coachesIsLoading,
    isError: coachesIsError,
  } = useGetAllCoaches()

  // fetch All Classes
  const {
    data: ClassesData,
    isLoading: ClassesIsLoading,
    isError: ClassesIsError,
  } = useCourseSessionClasses()

  const dateChangeHandler = (date) => {
    setSelectedDateState(date)
    console.log('date', date)
  }

  const timeSlotChangeHandler = (slot) => {
    settimeSlotItem(slot)
    console.log('slot', slot)
  }

  useEffect(() => {
    if (course_id) {
      setCourseId(course_id)
    }

    if (!course_id) {
      showToast('خطا', 'دوره در دسترس نیست', 'error')
    }
  }, [course_id])

  const handleReset = () => {
    if (childRef.current) {
      childRef.current.reset()
    }
  }

  const addProgramTimeSlot = () => {
    if (!timeSlotItem) {
      showToast('خطا', 'لطفا بازه زمانی را انتخاب کنید', 'error')
      return false
    }

    if (!timeSlotItem?.startTime || !timeSlotItem?.endTime) {
      showToast('خطا', 'لطفا بازه زمانی را انتخاب کنید', 'error')
      return false
    }
    // ------------------------
    // const selectedTimeSlotVar = timeSlotItem && timeSlotItem[0]
    // const selectedDateVar = selectedDateState
    // console.log({ selectedTimeSlotVar })
    // console.log({ selectedDateVar })

    // add session to list
    const _session = {
      date: selectedDateState,
      // @ts-expect-error
      startTime: timeSlotItem?.startTime,
      // @ts-expect-error
      endTime: timeSlotItem?.endTime,
    }

    console.log({ _session })

    // @ts-expect-error
    setselectedSession([...selectedSession, _session])

    // Reset Time Slot and Calendar
    setSelectedDateState(momentJalaali().locale('fa').format('jYYYY/jM/jD'))
    settimeSlotItem(null)
    handleReset()
  }

  // sample media handler
  const handleAddMedia = () => {
    setSampleMedias([...sampleMedias, { media_type: '', media_title: '' }])
  }

  const handleRemoveMedia = (index: number) => {
    const newMedias = [...sampleMedias]
    newMedias.splice(index, 1)
    setSampleMedias(newMedias)

    // Also remove the corresponding file upload state if it exists
    const key = `sample_media_${index}`
    if (fileUploads[key]) {
      const newFileUploads = { ...fileUploads }
      delete newFileUploads[key]
      setFileUploads(newFileUploads)
    }
  }

  const handleMediaChange = (
    index: number,
    field: keyof SampleMedia,
    value: string,
  ) => {
    const newMedias = [...sampleMedias]
    newMedias[index] = { ...newMedias[index], [field]: value }
    setSampleMedias(newMedias)
  }

  const uploadFile = async (file: File) => {
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

  const handleFileUpload = async (key: string) => {
    const fileState = fileUploads[key]
    if (!fileState?.file) return

    setFileUploads((prev) => ({
      ...prev,
      [key]: { ...prev[key], uploading: true, error: null },
    }))

    try {
      // Replace with your actual file upload function
      const uploadedFile = await uploadFile(fileState.file)
      setFileUploads((prev) => ({
        ...prev,
        [key]: { ...prev[key], uploading: false, uploadedFile },
      }))

      // Update the corresponding sample media with the uploaded file reference
      const index = parseInt(key.split('_')[2])
      const newMedias = [...sampleMedias]
      newMedias[index].file = uploadedFile
      setSampleMedias(newMedias)
    } catch (error) {
      setFileUploads((prev) => ({
        ...prev,
        [key]: { ...prev[key], uploading: false, error: 'خطا در آپلود فایل' },
      }))
    }
  }

  const submitFormHandler = () => {
    console.log(formData)
    console.log({ fileUploads, sampleMedias })
    // handleAssignCoach()
  }

  if (isLoading) {
    return (
      <Box p={3}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>در حال بارگذاری اطلاعات دوره...</Typography>
      </Box>
    )
  }

  if (isError) {
    return (
      <Box p={3}>
        <Alert severity="error">
          خطا در دریافت اطلاعات دوره: {error?.message || 'خطای ناشناخته'}
        </Alert>
      </Box>
    )
  }

  return (
    <div dir="rtl" className="py-8 px-4 min-h-screen">
      <Typography fontWeight={600} variant="h5" gutterBottom>
        انتساب مربی به دوره
      </Typography>
      <Typography dir="ltr">Course ID: {courseId}</Typography>

      <div className="flex flex-col w-full bg-white rounded-2xl shadow-md py-12">
        {/* Header */}
        <div></div>

        {/* CoachList and coach time-slot */}
        <div className="flex justify-around items-center flex-col">
          {/* CoachList*/}
          <div dir="rtl" className="w-full px-8 md:px-12">
            {coachesIsLoading && (
              <div className="w-full p-12">
                <CircularProgress />
                <Typography sx={{ mt: 2 }}>
                  در حال بارگذاری اطلاعات دوره...
                </Typography>
              </div>
            )}
            <CoachListAndFilter
              coaches={coachesData}
              selectedCurentCoach={selectedCurentCoach}
              changeCurentCoach={setSelectedCurentCoach}
            />
          </div>

          {/* Select Specific Class */}
          {/* Select Specific Class */}
          <div className="w-full px-8 md:px-12 my-8 border-t py-8">
            <h2 className="font-semibold text-lg mb-4">انتخاب کلاس</h2>
            <div className="flex flex-wrap gap-4">
              {ClassesIsLoading && (
                <div className="w-full p-8 flex justify-center">
                  <CircularProgress />
                  <Typography sx={{ mt: 2 }}>
                    در حال بارگذاری کلاس‌ها...
                  </Typography>
                </div>
              )}
              {ClassesIsError && (
                <Alert severity="error" className="w-full">
                  خطا در دریافت اطلاعات کلاس‌ها
                </Alert>
              )}
              {ClassesData && ClassesData.length > 0
                ? ClassesData.map((cls) => (
                    <div
                      key={cls._id}
                      className={`cursor-pointer border rounded-lg p-4 flex-1 min-w-[200px] max-w-xs transition-all
                                        ${
                                          selectedClassId === cls._id
                                            ? 'border-blue-600 bg-blue-50 shadow-lg'
                                            : 'border-gray-200 bg-white hover:border-blue-400'
                                        }
                                    `}
                      onClick={() => setSelectedClassId(cls._id)}
                    >
                      <h3
                        className={clsx(
                          'font-bold text-base mb-2',
                          cls.class_status === 'ACTIVE'
                            ? 'text-green-800'
                            : 'text-red-600',
                        )}
                      >
                        وضعیت کلاس :{' '}
                        {cls.class_status === 'ACTIVE' ? 'فعال' : 'غیر فعال'}
                      </h3>
                      <h3 className="font-semibold text-sm mb-2">
                        {' '}
                        کلاس : {cls.class_title}
                      </h3>
                      <h3 className="font-semibold text-sm mb-2">
                        ظرفیت : {cls.class_max_student_number} نفر
                      </h3>

                      {/* Add more class info here if needed */}
                      <p className="text-sm text-gray-600">
                        کد کلاس: {cls._id}
                      </p>
                    </div>
                  ))
                : !ClassesIsLoading && <Typography>کلاسی یافت نشد.</Typography>}
            </div>
          </div>

          {/* Coach Time Slot Calendar */}
          {/* Select Time/Date Section */}
          <div
            dir="ltr"
            className="flex w-full flex-col border-y-2 px-8 pt-16 pb-12"
          >
            <h2 className="text-center font-semibold text-lg">
              لطفا تاریخ و ساعت مورد نظر خود را انتخاب کنید
            </h2>

            <div className="flex justify-center mt-8">
              <Button variant="outlined" onClick={addProgramTimeSlot}>
                اضافه کردن جلسه +
              </Button>
            </div>

            {/* Calendar Wrapper */}
            <div className="py-14">
              <CustomDataPickerCalendar
                timeSlotChangeHandler={timeSlotChangeHandler}
                dateChangeHandler={dateChangeHandler}
                ref={childRef}
              />
            </div>
          </div>

          {/* Selected Time Slot Program List */}
          <div className="flex w-full flex-col border-y-2 px-8 py-12">
            <h2 className="text-center font-bold text-lg mb-8">
              لیست جلسات انتخاب شده
            </h2>

            <div className="w-full flex flex-col space-y-2">
              {selectedSession &&
                selectedSession.map((item) => (
                  <div className="w-full flex justify-between items-center px-2 md:px-8 py-4 bg-[#385773] border rounded-xl">
                    {/* Letf Side */}
                    <div className="flex flex-1 space-x-5 font-bold text-white">
                      <div>{item.date}</div>

                      <div>{`${item.startTime} - ${item.endTime}`}</div>
                    </div>

                    {/* Rigth Side */}
                    <div>
                      <Button variant="contained" color="error">
                        حذف
                      </Button>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Program Form Section */}
          <div
            dir="rtl"
            className="flex flex-col items-start w-full px-12 py-12"
          >
            <h2 className="text-center font-semibold text-lg">
              اطلاعات تکمیلی
            </h2>

            <div className="flex justify-center items-center pt-8">
              {/* Course Type */}
              <div style={{ width: '280px' }}>
                <TextField
                  select
                  value={formData.course_type}
                  onChange={(e) =>
                    setformData({ ...formData, course_type: e.target.value })
                  }
                  fullWidth
                  label="نوع جلسه"
                  error={!!errors.course_type}
                >
                  <MenuItem value="HOZORI">حضوری</MenuItem>
                  <MenuItem value="ONLINE">آنلاین</MenuItem>
                </TextField>
              </div>

              {/* Course Max Member */}
              <div className=""></div>
            </div>

            <div className="w-full flex flex-col md:flex-row  mt-8 space-x-4">
              {/* Real Price */}
              <div className="w-full md:w-1/3">
                <label
                  className="pb-2 text-gray-600 text-xs"
                  htmlFor="price_real"
                >
                  قیمت اصلی
                </label>
                <TextField
                  id="price_real"
                  value={formData.price_real}
                  onChange={(e) =>
                    setformData({
                      ...formData,
                      price_real: parseInt(e.target.value),
                    })
                  }
                  fullWidth
                  type="number"
                  label="قیمت (تومان)"
                  error={!!errors.price_real}
                  helperText={errors.price_real?.message}
                />
              </div>

              {/* Discounted Price */}
              <div className="w-full mt-8 md:mt-0 md:w-1/3">
                <label
                  className="pb-2 text-gray-600 text-xs"
                  htmlFor="price_discounted"
                >
                  قیمت قبل تخفیف
                </label>
                <TextField
                  id="price_discounted"
                  value={formData.price_discounted}
                  onChange={(e) =>
                    setformData({
                      ...formData,
                      price_discounted: parseInt(e.target.value),
                    })
                  }
                  fullWidth
                  type="number"
                  label="قیمت (تومان)"
                  error={!!errors.price_discounted}
                  helperText={errors.price_discounted?.message}
                />
              </div>
            </div>

            {/* max_member_accept */}
            <div className="w-full mt-8 space-x-4">
              <div className="w-full">
                <label
                  className="pb-2 text-gray-600 text-xs"
                  htmlFor="max_member_accept"
                >
                  حداکثر شرکت کننده ها
                </label>
                <TextField
                  id="max_member_accept"
                  value={formData.max_member_accept}
                  onChange={(e) =>
                    setformData({
                      ...formData,
                      max_member_accept: parseInt(e.target.value),
                    })
                  }
                  fullWidth
                  type="number"
                  label="تعداد شرکت کننده ها"
                  error={!!errors.max_member_accept}
                  helperText={errors.max_member_accept?.message}
                />
              </div>
            </div>

            <div className="w-full pt-16 border-t">
              {/* Sample Media Fields */}

              <div className="p-3">
                <Box sx={{ mt: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    نمونه رسانه‌های دوره
                  </Typography>

                  {sampleMedias.map((media, index) => (
                    <Box
                      key={index}
                      sx={{
                        mb: 4,
                        p: 2,
                        border: '1px solid #eee',
                        borderRadius: 1,
                      }}
                    >
                      <Grid container spacing={2}>
                        <Grid size={{ xs: 12, md: 4 }}>
                          <TextField
                            fullWidth
                            label="عنوان رسانه"
                            value={media.media_title}
                            onChange={(e) =>
                              handleMediaChange(
                                index,
                                'media_title',
                                e.target.value,
                              )
                            }
                          />
                        </Grid>

                        <Grid size={{ xs: 12, md: 4 }}>
                          <TextField
                            select
                            fullWidth
                            label="نوع رسانه"
                            value={media.media_type}
                            onChange={(e) =>
                              handleMediaChange(
                                index,
                                'media_type',
                                e.target.value,
                              )
                            }
                          >
                            <MenuItem value="VIDEO">ویدیو</MenuItem>
                            <MenuItem value="IMAGE">عکس</MenuItem>
                            <MenuItem value="PDF">PDF</MenuItem>
                          </TextField>
                        </Grid>

                        <Grid size={12}>
                          <input
                            type="file"
                            onChange={(e) => {
                              const file = e.target.files?.[0]
                              if (file) {
                                setFileUploads((prev) => ({
                                  ...prev,
                                  [`sample_media_${index}`]: {
                                    file,
                                    uploading: false,
                                    error: null,
                                    uploadedFile: null,
                                  },
                                }))
                              }
                            }}
                            style={{ display: 'none' }}
                            id={`sample-media-file-${index}`}
                          />
                          <label htmlFor={`sample-media-file-${index}`}>
                            <Button variant="contained" component="span">
                              انتخاب فایل
                            </Button>
                          </label>

                          {fileUploads[`sample_media_${index}`]?.file && (
                            <Typography
                              variant="caption"
                              display="block"
                              sx={{ mt: 1 }}
                            >
                              {fileUploads[`sample_media_${index}`].file.name}
                            </Typography>
                          )}

                          {fileUploads[`sample_media_${index}`]?.file &&
                            !fileUploads[`sample_media_${index}`]
                              ?.uploadedFile && (
                              <Button
                                variant="contained"
                                onClick={() =>
                                  handleFileUpload(`sample_media_${index}`)
                                }
                                disabled={
                                  fileUploads[`sample_media_${index}`]
                                    ?.uploading
                                }
                                startIcon={
                                  fileUploads[`sample_media_${index}`]
                                    ?.uploading ? (
                                    <CircularProgress className="" size={20} />
                                  ) : (
                                    <UploadIcon className="ml-3" />
                                  )
                                }
                                sx={{ mt: 1 }}
                                fullWidth
                              >
                                آپلود فایل
                              </Button>
                            )}

                          {fileUploads[`sample_media_${index}`]
                            ?.uploadedFile && (
                            <Alert severity="success" sx={{ mt: 1 }}>
                              &nbsp; فایل با موفقیت آپلود شد&nbsp;
                            </Alert>
                          )}

                          {fileUploads[`sample_media_${index}`]?.error && (
                            <Alert severity="error" sx={{ mt: 1 }}>
                              {fileUploads[`sample_media_${index}`].error}
                            </Alert>
                          )}
                        </Grid>

                        {sampleMedias.length > 1 && (
                          <Grid size={12}>
                            <IconButton
                              onClick={() => handleRemoveMedia(index)}
                              color="error"
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Grid>
                        )}
                      </Grid>
                    </Box>
                  ))}

                  <Button
                    variant="outlined"
                    startIcon={<AddIcon />}
                    onClick={handleAddMedia}
                    sx={{ mt: 2 }}
                  >
                    افزودن رسانه جدید
                  </Button>
                </Box>
              </div>
            </div>
          </div>
          {/* Next: Add coach/class selection and time slot form here */}

          <div className="w-full text-center mt-12">
            <Button
              sx={{ minWidth: '90%' }}
              size="large"
              variant="contained"
              color="primary"
              onClick={submitFormHandler}
            >
              ثبت
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CourseAssignCoach
