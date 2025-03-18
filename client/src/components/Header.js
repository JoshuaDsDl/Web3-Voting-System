import React from 'react';
import { AppBar, Box, Toolbar, Typography } from '@mui/material';
import HowToVoteIcon from '@mui/icons-material/HowToVote';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';

function Header({ isOwner, isVoter }) {
  return (
    <AppBar position="sticky" elevation={3} sx={{ background: 'linear-gradient(90deg, #3f51b5, #5c6bc0)' }}>
      <Toolbar className="container" sx={{ justifyContent: 'space-between' }}>
        <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center' }}>
          <Typography 
            variant="h5" 
            component="div" 
            sx={{ 
              fontWeight: 600,
              background: 'linear-gradient(90deg, #e3f2fd, #ffffff)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}
          >
            <HowToVoteIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            VoteChain
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          {isOwner && (
            <AdminPanelSettingsIcon fontSize="small" sx={{ color: 'white' }} />
          )}
          {isVoter && (
            <HowToVoteIcon fontSize="small" sx={{ color: 'white' }} />
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default Header; 