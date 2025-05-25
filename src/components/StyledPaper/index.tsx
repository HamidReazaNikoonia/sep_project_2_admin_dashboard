import { styled } from '@mui/material/styles';
import { Paper as MuiPaper } from '@mui/material';

const StyledPaper = styled(MuiPaper)(({ theme }) => ({
  borderRadius: '16px',
  boxShadow: 'rgba(145, 158, 171, 0.08) 0px 0px 8px 0px, rgba(145, 158, 171, 0.08) 0px 12px 24px -4px',
  backgroundColor: '#f4e9e9',
  transition: 'box-shadow 300ms cubic-bezier(0.4, 0, 0.2, 1) 0ms',
  '&:hover': {
    boxShadow: 'rgba(145, 158, 171, 0.12) 0px 0px 2px 0px, rgba(145, 158, 171, 0.12) 0px 12px 32px -4px',
  },
}));

export default StyledPaper;
