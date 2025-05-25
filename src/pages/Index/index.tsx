import React, { memo, Suspense, useEffect } from 'react'
import { useNavigate } from 'react-router';


import Box from '../../components/Box'
import Spinner from '../../components/Spinner'
import logo from '../../logo.svg'
import Button from '@mui/material/Button';

import Counter from './Counter'
import DocList from './DocList'
import styles from './index.module.css'

interface Props {}

const Index: React.FC<Props> = memo(() => {

  const navigate = useNavigate();


  useEffect(() => {
    const token = localStorage.getItem('__token__');

    if (!token) {
      navigate("/login");
    }
  
  }, [navigate])
  


  return (
    <>
      <Box>
        
      </Box>
      
      <Box>
        <Suspense fallback={<Spinner size="xl" />}>
          {/* <DocList /> */}
        </Suspense>
      </Box>
    </>
  )
})
Index.displayName = 'Index'

export default Index
