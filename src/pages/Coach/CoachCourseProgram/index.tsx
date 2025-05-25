import React, { memo, Suspense } from 'react'

import Box from '../../../components/Box'
import Spinner from '../../../components/Spinner'
import Button from '@mui/material/Button';

import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper
} from '@mui/material'
import { Link, useNavigate } from 'react-router'


// utils
import { formatDate } from '../../../utils/date';

import styles from './index.module.css'
import { useCoachCoursePrograms, useDeleteCoachCourseProgram } from '@/API/Coach/coach.hook';

interface Props { }


  // Detele Handler
  const CoachCourseProgramPage: React.FC<Props> = memo(() => {


    const { data, isLoading, isError } = useCoachCoursePrograms();
    const deleteMutation = useDeleteCoachCourseProgram();
    
    const navigate = useNavigate();

    const handleDelete = (id: string, event: React.MouseEvent) => {
      event.stopPropagation(); // Prevent row click event
      deleteMutation.mutate(id);
    };

    const handleRowClick = (id: string) => {
      navigate(`/coach/coach-course-program/get/${id}`);
    };
  

    return (
      <>
        <div className='w-full flex justify-end px-6 mt-6'>
          <Link to="/coach/coach-course-program/create">
            <Button variant="contained">
              ایجاد سطح (دوره)
            </Button>
          </Link>
        </div>

        <>
          <Suspense fallback={<Spinner size="xl" />}>
            <div className='w-full'>
              <div className='w-full mt-12 px-6'>
                {isLoading && <div className='w-full flex justify-center items-center'>
                  <Spinner size="xl" />
                </div>}
                {(data?.length !== 0) ? (
                  <TableContainer
                    component={Paper}
                    sx={{
                      direction: 'rtl',
                      '& .MuiTableCell-root': {
                        textAlign: 'right',
                        fontFamily: 'Samim, Arial, sans-serif',
                      },
                      '& .MuiTableHead-root': {
                        backgroundColor: '#193c5a',
                        '& .MuiTableCell-root': {
                          color: 'white',
                          fontWeight: 'bold',
                        },
                      },
                      '& .MuiTableBody-root': {
                        '& .MuiTableRow-root': {
                          '&:hover': {
                            backgroundColor: 'rgba(0, 0, 0, 0.04)',
                          },
                        },
                        '& .MuiTableCell-root': {
                          color: 'black',
                        },
                      },
                    }}
                  >
                    <Table dir="rtl">
                      <TableHead>
                        <TableRow>
                          <TableCell>عنوان</TableCell>
                          <TableCell>وضعیت</TableCell>
                          <TableCell>آخرین تغییر</TableCell>
                          <TableCell>حذف</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>

                        {data && data?.map((program: any) => (
                          <TableRow
                            key={program.id}
                            onClick={() => handleRowClick(program.id)}
                            sx={{ cursor: 'pointer', '&:hover': { backgroundColor: '#f5f5f5' } }}
                          >
                            <TableCell>{program.title}</TableCell>
                            <TableCell>{program.isPublished ? 'فعال' : 'غیر فعال'}</TableCell>
                            <TableCell>{program.updatedAt && formatDate(program.updatedAt)}</TableCell>
                            <TableCell>
                              <Button
                                variant="contained"
                                color="error"
                                onClick={(e) => handleDelete(program._id, e)}
                                sx={{ minWidth: 'auto' }}
                              >
                                حذف
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                ): (
                  <div className="text-center">
                    هیچ سطح ایی وجود ندارد
                  </div>
                )}
                {!Array.isArray(data) && isError &&  (<div className="text-center">خطایی پیش آمده</div>)}
              </div>
            </div>
          </Suspense>
        </>
      </>
    )
  })
  CoachCourseProgramPage.displayName = 'CoachPage'

  export default CoachCourseProgramPage;
