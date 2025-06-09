import React, { useState } from 'react'
import { useParams } from 'react-router'
import {
  Card,
  CardContent,
  Button,
  Typography,
  Modal,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Box,
  Chip,
  Alert,
  CircularProgress,
} from '@mui/material'
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward'
import { useGetCoachById } from '../../../API/Coach/coach.hook'

import {
  StyledTableContainer,
  StyledTable,
  StyledTableHead,
  StyledTableBody,
  StyledTableRow,
  StyledTableCell,
} from '../../../components/StyledTableContainer'

import QuizResults from '../../../components/QuestionAndAnswer'

const SERVER_FILE = process.env.REACT_APP_SERVER_FILE
const SpecificCoachPage = () => {
  const [selectedAnswers, setSelectedAnswers] = useState<any[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)

  const { id } = useParams()

  const { data: coach, isLoading, error } = useGetCoachById(id)

  const handleOpenModal = ({ subject, relatedCourse }) => {
    console.log('answers', subject)

    // get current subjectId
    const currentSubject = subject?.subjectId
    const relatedSubjectFromCoachCourseProgram =
      relatedCourse?.course_object.find((item) => item._id == currentSubject)

    console.log(
      'relatedSubjectFromCoachCourseProgram',
      relatedSubjectFromCoachCourseProgram,
    )

    // collect question from relatedCourse and get answers from current subject
    const questionAndanswers: React.SetStateAction<any[]> = []

    subject?.examAnswers.map((question) => {
      // find question
      const curentQuest = relatedSubjectFromCoachCourseProgram?.exam.find(
        (ex) => ex._id == question.questionId,
      )

      if (curentQuest) {
        questionAndanswers.push({
          selectedOptionId: question?.selectedOptionId,
          isCorrect: question.isCorrect,
          curentQuest,
        })
      }
    })

    console.log('ans', questionAndanswers)
    setSelectedAnswers(questionAndanswers)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedAnswers([])
  }

  if (isLoading) {
    return (
      <div className="w-full flex justify-center items-center">
        <CircularProgress />
      </div>
    )
  }

  if (error) {
    return (
      <div className="w-full flex justify-center items-center">
        <Alert severity="error">مشکلی پیش آمده</Alert>
      </div>
    )
  }

  if (!coach) {
    return (
      <div className="w-full flex justify-center items-center">
        <Alert severity="error">مربی یافت نشده</Alert>
      </div>
    )
  }

  return (
    <div className="p-3" dir="rtl">
      {/* Coach Information Card */}
      <div className="relative">
        <div className="relative">
          <div className="absolute -top-5 left-8">
            {coach.avatar?.file_name ? (
              <img
                src={`${SERVER_FILE}/${coach.avatar.file_name}`}
                alt="avatar"
                className="w-[200px] h-[200px] rounded-full object-cover border-4 border-white shadow-lg"
              />
            ) : (
              <div className="w-[200px] h-[200px] rounded-full bg-gray-200 flex items-center justify-center border-4 border-white shadow-lg">
                <span className="text-gray-500 text-center text-lg">
                  بدون عکس
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
      <Card raised sx={{ mb: 3 }}>
        <CardContent>
          <Typography
            sx={{ margin: '20px 0' }}
            className="mb-12"
            fontWeight={600}
            variant="h5"
            gutterBottom
          >
            اطلاعات مربی
          </Typography>
          <StyledTableContainer>
            <StyledTable>
              <StyledTableBody>
                <StyledTableRow>
                  <StyledTableCell
                    sx={{ fontWeight: 800 }}
                    component="th"
                    scope="row"
                  >
                    ID
                  </StyledTableCell>
                  <StyledTableCell sx={{ fontWeight: 800 }}>
                    {coach.id}
                  </StyledTableCell>
                </StyledTableRow>
                <StyledTableRow>
                  <StyledTableCell
                    sx={{ fontWeight: 800 }}
                    component="th"
                    scope="row"
                  >
                    نام و نام خانوادگی
                  </StyledTableCell>
                  <StyledTableCell>
                    {coach.first_name} {coach.last_name}
                  </StyledTableCell>
                </StyledTableRow>
                <StyledTableRow>
                  <StyledTableCell
                    sx={{ fontWeight: 800 }}
                    component="th"
                    scope="row"
                  >
                    تصویر
                  </StyledTableCell>
                  <StyledTableCell>
                    {coach.avatar?.file_name ? (
                      <img
                        src={`${SERVER_FILE}/${coach.avatar.file_name}`}
                        alt="avatar"
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-500 text-center text-[10px]">
                          بدون عکس
                        </span>
                      </div>
                    )}
                  </StyledTableCell>
                </StyledTableRow>
                <StyledTableRow>
                  <StyledTableCell
                    sx={{ fontWeight: 800 }}
                    component="th"
                    scope="row"
                  >
                    شماره موبایل
                  </StyledTableCell>
                  <StyledTableCell>{coach.mobile}</StyledTableCell>
                </StyledTableRow>
                <StyledTableRow>
                  <StyledTableCell
                    sx={{ fontWeight: 800 }}
                    component="th"
                    scope="row"
                  >
                    نقش
                  </StyledTableCell>
                  <StyledTableCell>
                    <Chip
                      label={coach.role === 'coach' ? 'مربی' : 'کاربر'}
                      color={coach.role === 'coach' ? 'success' : 'default'}
                    />
                  </StyledTableCell>
                </StyledTableRow>
                <StyledTableRow>
                  <StyledTableCell
                    sx={{ fontWeight: 800 }}
                    component="th"
                    scope="row"
                  >
                    سطح فعال
                  </StyledTableCell>
                  <StyledTableCell>
                    <Chip
                      label={
                        coach.access_level === 'none'
                          ? 'بدون دسترسی'
                          : coach.access_level
                      }
                      color={
                        coach.access_level === 'none' ? 'error' : 'success'
                      }
                    />
                  </StyledTableCell>
                </StyledTableRow>
                <StyledTableRow>
                  <StyledTableCell
                    sx={{ fontWeight: 800 }}
                    component="th"
                    scope="row"
                  >
                    سطح درخواستی
                  </StyledTableCell>
                  <StyledTableCell>
                    <Chip
                      label={
                        coach.access_level_request === 'none'
                          ? 'بدون درخواست'
                          : coach.access_level_request
                      }
                      color={
                        coach.access_level_request === 'none'
                          ? 'default'
                          : 'info'
                      }
                    />
                  </StyledTableCell>
                </StyledTableRow>
              </StyledTableBody>
            </StyledTable>
          </StyledTableContainer>
        </CardContent>
      </Card>

      {/* Enrolled Courses Card */}
      <Card raised sx={{ py: '30px' }}>
        <CardContent>
          <Typography
            sx={{ mb: '30px' }}
            variant="h5"
            fontWeight={600}
            gutterBottom
          >
            دوره‌های ثبت‌نام شده
          </Typography>
          {coach.enrolledCourses.map((course, index) => (
            <Accordion defaultExpanded={index === 0} key={course._id}>
              <AccordionSummary
                expandIcon={<ArrowDownwardIcon />}
                aria-controls={`panel${index}-content`}
                id={`panel${index}-header`}
              >
                <Typography sx={{ fontWeight: 800 }}>
                  {course.coach_course_program_id.title}
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    تاریخ شروع دوره:{' '}
                    {new Date(course.enrolled_at).toLocaleDateString('fa-IR')}
                  </Typography>
                  <Typography variant="subtitle2" gutterBottom>
                    وضعیت دوره:
                    <Chip
                      label={course.is_active ? 'فعال' : 'غیرفعال'}
                      color={course.is_active ? 'success' : 'error'}
                      size="small"
                      sx={{ mr: 1 }}
                    />
                  </Typography>
                </Box>

                <StyledTableContainer>
                  <StyledTable size="small">
                    <StyledTableHead>
                      <StyledTableRow>
                        <StyledTableCell>ترتیب</StyledTableCell>
                        <StyledTableCell>وضعیت تکمیل</StyledTableCell>
                        <StyledTableCell>تاریخ انقضا</StyledTableCell>
                        <StyledTableCell> تاریخ انجام آزمون </StyledTableCell>
                        <StyledTableCell>نمره آزمون</StyledTableCell>
                        <StyledTableCell>پاسخ کاربر</StyledTableCell>
                      </StyledTableRow>
                    </StyledTableHead>
                    <StyledTableBody>
                      {course.completedSubjects.map((subject) => (
                        <StyledTableRow key={subject._id}>
                          <StyledTableCell>{subject.order}</StyledTableCell>
                          <StyledTableCell>
                            <Chip
                              label={
                                subject.isCompleted ? 'تکمیل شده' : 'تکمیل نشده'
                              }
                              color={
                                subject.isCompleted ? 'success' : 'warning'
                              }
                              size="small"
                            />
                          </StyledTableCell>
                          <StyledTableCell>
                            {new Date(subject.expireDate).toLocaleDateString(
                              'fa-IR',
                            )}
                          </StyledTableCell>
                          <StyledTableCell>
                            {subject?.completedAt
                              ? new Date(
                                  subject.completedAt,
                                ).toLocaleDateString('fa-IR')
                              : '-'}
                          </StyledTableCell>
                          <StyledTableCell>
                            {subject.examScore !== undefined
                              ? subject.examScore
                              : '-'}
                          </StyledTableCell>

                          <StyledTableCell>
                            {subject.examAnswers && subject.isCompleted ? (
                              <Button
                                variant="contained"
                                size="small"
                                onClick={() =>
                                  handleOpenModal({
                                    subject,
                                    relatedCourse:
                                      course.coach_course_program_id,
                                  })
                                }
                              >
                                مشاهده پاسخ‌ها
                              </Button>
                            ) : (
                              '-'
                            )}
                          </StyledTableCell>
                        </StyledTableRow>
                      ))}
                    </StyledTableBody>
                  </StyledTable>
                </StyledTableContainer>
              </AccordionDetails>
            </Accordion>
          ))}
        </CardContent>
      </Card>

      {/* Answer Modal */}
      <Modal
        open={isModalOpen}
        onClose={handleCloseModal}
        aria-labelledby="answers-modal"
      >
        <div
          className=" relative top-1/2 left-1/2 bg-white py-4  shadow-2xl w-full text-right px-8 md:px-12"
          style={{
            transform: 'translate(-50%, -50%)',
            overflowY: 'scroll',
            maxHeight: '100vh',
          }}
        >
          <Typography
            className="pt-4"
            fontWeight={500}
            variant="h4"
            component="h2"
            gutterBottom
          >
            پاسخ‌های کاربر
          </Typography>

          <Typography
            className="pt-2"
            fontWeight={200}
            variant="h6"
            component="h6"
            gutterBottom
          >
            گزینه انتخاب شده توسط کاربر با کادر آبی رنگ مشخص شده
          </Typography>
          {selectedAnswers?.length > 0 ? (
            <div className="px-4 py-8 flex justify-center items-center w-full">
              <QuizResults questions={selectedAnswers} />
            </div>
          ) : (
            <div className="px-4 text-2xl font-bold text-red-400 py-8 flex justify-center items-center w-full">
              پاسخی وجود ندارد
            </div>
          )}
          <Button
            variant="contained"
            onClick={handleCloseModal}
            sx={{ mt: 2, width: '100%', textAlign: 'center', mb: 4 }}
          >
            بستن
          </Button>
        </div>
      </Modal>
    </div>
  )
}

export default SpecificCoachPage
