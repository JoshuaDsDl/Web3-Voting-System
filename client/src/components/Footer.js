import React from 'react';
import { Box, Container, Typography, Link } from '@mui/material';
import GitHubIcon from '@mui/icons-material/GitHub';
import LinkedInIcon from '@mui/icons-material/LinkedIn';

function Footer() {
  return (
    <Box 
      component="footer" 
      sx={{ 
        mt: 'auto',
        py: 3,
        background: 'linear-gradient(90deg, #303f9f, #3f51b5)',
        color: 'rgba(255, 255, 255, 0.8)',
        boxShadow: '0 -2px 10px rgba(0, 0, 0, 0.1)'
      }}
    >
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="body2" sx={{ mb: { xs: 2, sm: 0 } }}>
            © {new Date().getFullYear()} VoteChain — Tous droits réservés
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Link 
              href="https://github.com/JoshuaDsDl/Web3-Voting-System" 
              target="_blank"
              rel="noopener noreferrer"
              color="inherit" 
              sx={{ display: 'flex', alignItems: 'center' }}
            >
              <GitHubIcon fontSize="small" sx={{ mr: 0.5 }} />
              <Typography variant="body2">GitHub</Typography>
            </Link>
            <Link 
              href="https://www.linkedin.com/in/joshua-de-schietere/" 
              target="_blank"
              rel="noopener noreferrer"
              color="inherit" 
              sx={{ display: 'flex', alignItems: 'center' }}
            >
              <LinkedInIcon fontSize="small" sx={{ mr: 0.5 }} />
              <Typography variant="body2">LinkedIn</Typography>
            </Link>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}

export default Footer; 