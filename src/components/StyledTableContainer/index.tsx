import { styled } from '@mui/material/styles';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';

export const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  direction: 'rtl',
  '& .MuiTableCell-root': {
    borderRight: '1px solid rgba(224, 224, 224, 1)',
    borderLeft: 'none',
    textAlign: 'right',
    padding: '12px 16px',
    ...theme.applyStyles('light', {
      borderRightColor: 'rgba(224, 224, 224, 1)',
    }),
  },
  '& .MuiTableHead-root': {
    '& .MuiTableCell-root': {
      backgroundColor: theme.palette.mode === 'dark' ? '#1d1d1d' : '#fafafa',
      fontWeight: 'bold',
      color: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.85)' : 'rgba(0,0,0,0.85)',
    },
  },
  '& .MuiTableBody-root': {
    '& .MuiTableRow-root:hover': {
      backgroundColor: theme.palette.mode === 'dark' 
        ? 'rgba(255, 255, 255, 0.04)' 
        : 'rgba(0, 0, 0, 0.04)',
    },
  },
}));

export const StyledTable = styled(Table)({
  minWidth: 650,
});

export const StyledTableHead = styled(TableHead)({
  '& .MuiTableCell-root': {
    fontWeight: 'bold',
  },
});

export const StyledTableBody = styled(TableBody)({});

export const StyledTableRow = styled(TableRow)({});

export const StyledTableCell = styled(TableCell)({
  '&.MuiTableCell-head': {
    fontWeight: 'bold',
  },
});