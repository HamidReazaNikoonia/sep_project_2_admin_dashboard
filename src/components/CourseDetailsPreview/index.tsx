import React, { useState } from 'react'
import {
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Paper,
  Grid2 as Grid,
  IconButton,
} from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import DeleteIcon from '@mui/icons-material/Delete'
import { RichTextReadOnly } from 'mui-tiptap'
import useExtensions from '@/components/TextEditor/useExtensions'

interface DetailItem {
  header_title: string
  description: string
}

interface CourseDetailsPreviewProps {
  details: DetailItem[]
  onDelete?: (index: number) => void
}

const CourseDetailsPreview: React.FC<CourseDetailsPreviewProps> = ({ 
  details,
  onDelete 
}) => {
  const [selectedIndex, setSelectedIndex] = useState<number>(0)
  const extensions = useExtensions({
    placeholder: '',
  })

  if (!details || details.length === 0) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          هیچ جزئیاتی برای نمایش وجود ندارد
        </Typography>
      </Box>
    )
  }

  return (
    <Box>
      <Typography fontWeight={800} variant="subtitle1" sx={{ mb: 2 }}>
        پیش‌نمایش جزئیات
      </Typography>

      <Accordion defaultExpanded>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="details-content"
          id="details-header"
        >
          <Typography fontWeight={600}>جزئیات دوره</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={2}>
            {/* Right side - List of headers */}
            <Grid size={{ xs: 12, md: 4 }}>
              <Paper variant="outlined" sx={{ p: 1 }}>
                <List>
                  {details.map((detail, index) => (
                    <ListItem
                      key={index}
                      disablePadding
                      secondaryAction={
                        onDelete && (
                          <IconButton
                            edge="end"
                            aria-label="delete"
                            onClick={(e) => {
                              e.stopPropagation()
                              onDelete(index)
                              if (selectedIndex === index && details.length > 1) {
                                setSelectedIndex(0)
                              }
                            }}
                            size="small"
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        )
                      }
                    >
                      <ListItemButton
                        selected={selectedIndex === index}
                        onClick={() => setSelectedIndex(index)}
                      >
                        <ListItemText
                          primary={detail.header_title}
                          primaryTypographyProps={{
                            fontSize: '0.9rem',
                            fontWeight: selectedIndex === index ? 600 : 400,
                          }}
                        />
                      </ListItemButton>
                    </ListItem>
                  ))}
                </List>
              </Paper>
            </Grid>

            {/* Left side - Description content */}
            <Grid size={{ xs: 12, md: 8 }}>
              <Paper variant="outlined" sx={{ p: 3, minHeight: '300px' }}>
                {details[selectedIndex] && (
                  <>
                    <Typography variant="h6" sx={{ mb: 2 }}>
                      {details[selectedIndex].header_title}
                    </Typography>
                    <Box
                      sx={{
                        '& .ProseMirror': {
                          padding: 0,
                        },
                      }}
                    >
                      <RichTextReadOnly
                        content={details[selectedIndex].description}
                        extensions={extensions}
                      />
                    </Box>
                  </>
                )}
              </Paper>
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>
    </Box>
  )
}

export default CourseDetailsPreview

