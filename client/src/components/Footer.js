import React from 'react';
import { Box, Typography, Link } from '@mui/material';

function Footer() {
  return (
    <Box 
      component="footer" 
      sx={{ 
        py: 1,
        bgcolor: '#f5f5f5',
        height: '40px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <Typography 
        variant="body2" 
        color="text.secondary" 
        align="center"
      >
        © {new Date().getFullYear()}{' '}
        <Link
          href="https://jdsoft.fr"
          target="_blank"
          rel="noopener noreferrer"
          sx={{
            color: '#3f51b5',
            textDecoration: 'none',
            '&:hover': {
              textDecoration: 'underline'
            }
          }}
        >
          JDSoft
        </Link>
      </Typography>
    </Box>
  );
}

export default Footer; 