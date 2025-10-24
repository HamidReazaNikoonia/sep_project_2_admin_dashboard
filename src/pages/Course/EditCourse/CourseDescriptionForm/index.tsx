import StyledPaper from '@/components/StyledPaper';
import { Alert, Box, Button, TextField, Typography } from '@mui/material';
import Editor from '@/components/TextEditor'
import { Grid2 as Grid } from '@mui/material';
import { useState } from 'react'


const CourseDescriptionForm = ({ shortDescription, longDescription, setShortDescription, setLongDescription }: { shortDescription: string, longDescription: string, setShortDescription: (value: string) => void, setLongDescription: (value: string) => void }) => {

    const [descriptionLong, setDescriptionLong] = useState(longDescription);
    const [descriptionShort, setDescriptionShort] = useState(shortDescription);

    const submitHandlerForPassData = (data: any) => {
        console.log({ data })
        setLongDescription(data)
        setDescriptionLong(data)
      }


  return (
    <div className='w-full'>
        <div className='w-full flex flex-col'>
        <Grid size={12}>
            <StyledPaper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                توضیحات
              </Typography>
              <TextField
                value={descriptionShort}
                onChange={(e) => setDescriptionShort(e.target.value)}
                fullWidth
                multiline
                rows={3}
                label="توضیح کوتاه"
              />
            </StyledPaper>
          </Grid>

          <Grid sx={{ px: 3 }} size={12}>
            <Alert severity="info">
              <Typography sx={{ px: 1 }} variant="body2">
                    در صورت اصلاح متن روی دکمه  (‌ ثبت توضیح کوتاه ) کلیک کنید تا متن جدید آپدیت شود
                    و برای تغییر نهایی دوره را بروز رسانی کنید
              </Typography>
            </Alert>
            <Button 
            variant="outlined" 
            color="primary" 
            onClick={() => setShortDescription(descriptionShort)}>ثبت توضیح کوتاه</Button>
          </Grid>
        </div>

           {/* Description Long (WYSIWYG) */}
           <Grid sx={{ pt: 3 }} size={12}>
            <StyledPaper sx={{ p: 3 }}>
              <Typography fontWeight={800} variant="body1" sx={{ mb: 1 }}>
                توضیح کامل
              </Typography>
              <Box sx={{ marginBottom: '60px' }}>
                <Editor submitHandlerForPassData={submitHandlerForPassData} initialContent={descriptionLong} />
              </Box>
            </StyledPaper>
          </Grid>
    </div>
  )
}

export default CourseDescriptionForm