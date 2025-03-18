import React from 'react';
import { Box, Typography, Link, Container, Paper } from '@mui/material';

// Palette de couleurs du projet
const colors = {
  lighter: '#FFF2F2',
  light: '#A9B5DF',
  medium: '#7886C7',
  dark: '#2D336B'
};

/**
 * Composant du pied de page
 */
function Footer() {
  return (
    <Paper 
      component="footer" 
      className="footer" 
      elevation={4}
      sx={{
        py: 3,
        px: 2,
        mt: 'auto',
        backgroundColor: colors.dark,
        borderTop: `3px solid ${colors.medium}`,
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <Box 
        sx={{ 
          position: 'absolute', 
          top: 0, 
          right: 0, 
          left: 0, 
          bottom: 0, 
          opacity: 0.03, 
          background: `linear-gradient(90deg, ${colors.lighter} 0%, transparent 100%)`,
          clipPath: 'polygon(0 0, 100% 0, 80% 100%, 0% 100%)',
        }}
      />
      <Container maxWidth="lg">
        <Box className="footer-content" sx={{ textAlign: 'center', position: 'relative' }}>
          <Typography variant="body1" align="center" fontWeight="bold" sx={{ color: colors.lighter }}>
            VoteChain
          </Typography>
          <Typography variant="body2" align="center" sx={{ mt: 1, color: colors.light }}>
            Application décentralisée de vote sur Ethereum
          </Typography>
          <Typography variant="body2" align="center" sx={{ mt: 1, color: colors.light }}>
            &copy; {new Date().getFullYear()} - <Link href="https://jdsoft.fr" target="_blank" rel="noopener" sx={{ color: colors.lighter, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>JDSoft</Link>
          </Typography>
        </Box>
      </Container>
    </Paper>
  );
}

export default Footer; 