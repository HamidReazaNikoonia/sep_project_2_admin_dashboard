import React, { memo, Suspense } from 'react'

import Box from '../../components/Box'
import Spinner from '../../components/Spinner'
import CoachList from './CoachList'

import styles from './index.module.css'
import { Button } from '@mui/material'
import { Link } from 'react-router'
import { useGetAllCoaches } from '@/API/Coach/coach.hook'

interface Props {}

const CoachPage: React.FC<Props> = memo(() => {
  // const { data: coaches, isLoading, error } = useGetAllCoaches({
  //   page: 1,
  //   limit: 10,
  // });

  return (
    <>
      <div className="flex justify-end">
        <div className="flex mt-6 px-8">
          <Link to="/coach/new">
            <Button variant="contained">افزودن مربی</Button>
          </Link>
        </div>
      </div>

      <div className="w-full px-4 md:px-12 mt-12">
        <Suspense fallback={<Spinner size="xl" />}>
          {/* <DocList /> */}
          <CoachList />
        </Suspense>
      </div>
    </>
  )
})
CoachPage.displayName = 'CoachPage'

export default CoachPage
