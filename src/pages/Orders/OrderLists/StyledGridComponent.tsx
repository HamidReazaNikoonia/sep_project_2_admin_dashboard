import { styled, Theme } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';

const StyledDataGrid = styled(DataGrid)(({ theme }: { theme: Theme }) => ({
  border: 0,
  direction: 'rtl',
  color: 'rgba(255,255,255,0.85)',
  fontFamily: [
    'Samim',
    'Arial',
    'sans-serif',
  ].join(','),
  WebkitFontSmoothing: 'auto',
  letterSpacing: 'normal',
  '& .MuiDataGrid-columnsContainer': {
    backgroundColor: '#1d1d1d',
    ...theme.applyStyles('light', {
      backgroundColor: '#fafafa',
    }),
  },
  '& .MuiDataGrid-footerContainer': {
    direction: 'ltr',
  },
  '& .MuiDataGrid-columnHeaders': {
    direction: 'rtl',
    textAlign: 'right',
  },
  '& .MuiDataGrid-iconSeparator': {
    display: 'none',
  },
  '& .MuiDataGrid-columnHeader, .MuiDataGrid-cell': {
    borderRight: '1px solid #303030',
    ...theme.applyStyles('light', {
      borderRightColor: '#f0f0f0',
    }),
  },
  '& .MuiDataGrid-columnHeaderTitle': {
    fontWeight: 'bold',
  },
  '& .MuiDataGrid-toolbarContainer': {
    direction: 'rtl',
    justifyContent: 'flex-start',
    '& .MuiButton-root': {
      direction: 'rtl',
    },
    '& .MuiButton-startIcon': {
      marginRight: '0',
      marginLeft: '8px',
    },
  },
  '& .MuiDataGrid-row:hover': {
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
  },
  '& .MuiDataGrid-cell': {
    color: 'rgba(255,255,255,0.65)',
    direction: 'rtl',
    textAlign: 'right',
    ...theme.applyStyles('light', {
      color: 'rgba(0,0,0,.85)',
    }),
  },
  '& .MuiPaginationItem-root': {
    borderRadius: 0,
  },
  ...theme.applyStyles('light', {
    color: 'rgba(0,0,0,.85)',
  }),
  '& .MuiDataGrid-toolbarQuickFilter': {
    direction: 'rtl',
    '& .MuiInputBase-root': {
      direction: 'rtl',
    },
  },
}));

export default StyledDataGrid;