import React from 'react';
import { useParams } from 'react-router';
import { useCoachCoursePrograms } from '../../../../API/Coach/coach.hook';
import {
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Divider,
  Box,
  Button,
} from '@mui/material';

// utils
import { formatPrice } from '../../../../utils/price';

const SpecificCoachCoursePage = () => {
  const { id } = useParams();
  const { data, isLoading, error } = useCoachCoursePrograms({ _id: id });

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
        <CircularProgress />
      </div>
    );
  }

  if (error) {
    return (
      <Typography color="error" align="center">
        خطا در دریافت اطلاعات
      </Typography>
    );
  }

  const program = data?.[0];

  if (!program) {
    return (
      <Typography align="center">
        برنامه مورد نظر یافت نشد
      </Typography>
    );
  }

  return (
    <div dir="rtl" style={{ padding: '2rem' }}>
      {/* Main Program Details Card */}
      <Card sx={{  margin: '0 auto 2rem auto' }}>
        <CardContent>
          <Typography variant="h5" component="h2" gutterBottom>
            جزئیات برنامه
          </Typography>

          <TableContainer component={Paper} sx={{ mt: 2 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell 
                    align="right" 
                    sx={{ 
                      backgroundColor: '#f5f5f5',
                      fontWeight: 'bold',
                      color: '#1976d2'
                    }}
                  >
                    عنوان
                  </TableCell>
                  <TableCell 
                    align="right"
                    sx={{ 
                      backgroundColor: '#f5f5f5',
                      fontWeight: 'bold',
                      color: '#1976d2'
                    }}
                  >
                    مقدار
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell 
                    align="right"
                    sx={{ 
                      backgroundColor: '#f5f5f5',
                      fontWeight: 'bold',
                      color: '#1976d2'
                    }}
                  >
                    عنوان برنامه
                  </TableCell>
                  <TableCell align="right">{program.title}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell 
                    align="right"
                    sx={{ 
                      backgroundColor: '#f5f5f5',
                      fontWeight: 'bold',
                      color: '#1976d2'
                    }}
                  >
                    توضیحات
                  </TableCell>
                  <TableCell align="right">{program.description}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell 
                    align="right"
                    sx={{ 
                      backgroundColor: '#f5f5f5',
                      fontWeight: 'bold',
                      color: '#1976d2'
                    }}
                  >
                    مبلغ
                  </TableCell>
                  <TableCell align="right">{formatPrice(program.amount)}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell 
                    align="right"
                    sx={{ 
                      backgroundColor: '#f5f5f5',
                      fontWeight: 'bold',
                      color: '#1976d2'
                    }}
                  >
                    دارای جریمه
                  </TableCell>
                  <TableCell align="right">{program.is_have_penalty ? 'بله' : 'خیر'}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell 
                    align="right"
                    sx={{ 
                      backgroundColor: '#f5f5f5',
                      fontWeight: 'bold',
                      color: '#1976d2'
                    }}
                  >
                    مبلغ جریمه
                  </TableCell>
                  <TableCell align="right">{program.penalty_fee !== 0 ? formatPrice(program.penalty_fee) : '--'} </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell 
                    align="right"
                    sx={{ 
                      backgroundColor: '#f5f5f5',
                      fontWeight: 'bold',
                      color: '#1976d2'
                    }}
                  >
                    تعداد سرفصل‌ها
                  </TableCell>
                  <TableCell align="right">{program.course_subject_count.toLocaleString('fa-IR')}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell 
                    align="right"
                    sx={{ 
                      backgroundColor: '#f5f5f5',
                      fontWeight: 'bold',
                      color: '#1976d2'
                    }}
                  >
                    وضعیت انتشار
                  </TableCell>
                  <TableCell align="right">{program.isPublished ? 'منتشر شده' : 'منتشر نشده'}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Course Objects Card */}
      <Card sx={{  margin: '0 auto' }}>
        <CardContent>
          <Typography variant="h5" component="h2" gutterBottom>
            سرفصل‌های دوره
          </Typography>

          {program.course_object?.map((course: any, index: any) => (
            <div className='mb-12' key={course._id}>
                <div className='flex flex-col p-6 border-2 border-amber-950 rounded-xl'>
                <div className='border-b-2 pb-2 mb-6'>
                        <Typography variant="h6">
                          {(index + 1).toLocaleString('fa-IR')}. {course.title}
                        </Typography>
                    </div>
                    <div className='border-b-2 pb-2 mb-6'>
                      <div className='text-blue-900 font-semibold mb-2' >
                        توضیحات
                      </div>
                      <div >{course.description}</div>
                    </div>

                     {/* Show existing file if available */}
               

                {course.video_file?.file_name && (
                  <div className='pb-2 mt-6'>

                    

                  <div className='text-blue-900 font-semibold mb-2' >
                     نمایش فایل دوره
                  </div>
                  <Button
                      variant="outlined"
                      size="small"
                      href={`http://localhost:9000/file/${course.video_file?.file_name}`}
                      target="_blank"
                    >
                      مشاهده فایل
                    </Button>

                    <div className='flex my-3'>
                    <Typography className='' variant="body2" color="green">
                        نام فایل: {course.video_file?.file_name}
                    </Typography>
                    </div>
                </div>
                )}

                    
                </div>
              <TableContainer component={Paper} sx={{ mt: 2, borderRadius: "20px", border: '2px solid #1e1e62' }}>
                <Table>
                  <TableHead>
                    <Typography className='py-4' align='center'>
                    سوالات دوره
                    </Typography>
                    
                  </TableHead>
                  <TableBody>
                    {course.exam?.map((exam) => (
                      <React.Fragment key={exam._id}>
                        <TableRow sx={{ backgroundColor: '#6656cb' }}>
                          <TableCell  colSpan={2} align="right">
                            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: 'white' }}>
                              سوال: {exam.question_title}
                            </Typography>
                          </TableCell>
                        </TableRow>
                        {exam.options.map((option, optionIndex) => (
                          <TableRow key={option._id}>
                            <TableCell 
                              align="right"
                              sx={{ 
                                backgroundColor: '#f5f5f5',
                                fontWeight: 'bold',
                                color: '#1976d2'
                              }}
                            >
                              گزینه {(optionIndex + 1).toLocaleString('fa-IR')}
                            </TableCell>
                            <TableCell sx={{backgroundColor: option.isCorrect ? '#78c278' : 'white'}} align="right">
                              {option.text}
                              {option.isCorrect && ' (پاسخ صحیح)'}
                            </TableCell>
                          </TableRow>
                        ))}
                        <TableRow>
                          <TableCell 
                            align="right"
                            sx={{ 
                              backgroundColor: '#f5f5f5',
                              fontWeight: 'bold',
                              color: '#1976d2'
                            }}
                          >
                            امتیاز
                          </TableCell>
                          <TableCell align="right">{exam.points}</TableCell>
                        </TableRow>
                      </React.Fragment>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              {(program.course_object.length - 1 !==  index)  && <Divider sx={{paddingTop: '30px'}} />}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default SpecificCoachCoursePage;