import React from 'react';
import {
  Box,
  FormControl,
  Select,
  MenuItem,
  Typography,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import { useLanguage } from '../contexts/LanguageContext';

const LanguageSelector = ({ sx = {} }) => {
  const { currentLanguage, changeLanguage } = useLanguage();

  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸', nativeName: 'English' },
    { code: 'hi', name: 'Hindi', flag: '🇮🇳', nativeName: 'हिंदी' },
    { code: 'kn', name: 'Kannada', flag: '🇮🇳', nativeName: 'ಕನ್ನಡ' }
  ];

  const handleLanguageChange = (event) => {
    changeLanguage(event.target.value);
  };

  const getCurrentLanguage = () => {
    return languages.find(lang => lang.code === currentLanguage) || languages[0];
  };

  return (
    <Box sx={{ minWidth: 120, ...sx }}>
      <FormControl fullWidth size="small">
        <Select
          value={currentLanguage}
          onChange={handleLanguageChange}
          displayEmpty
          sx={{
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            color: 'white',
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: 'rgba(255, 255, 255, 0.3)',
            },
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: 'rgba(255, 255, 255, 0.5)',
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: 'rgba(255, 255, 255, 0.7)',
            },
            '& .MuiSelect-icon': {
              color: 'white',
            },
          }}
          renderValue={(selected) => {
            const lang = getCurrentLanguage();
            return (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <span style={{ fontSize: '1.2em' }}>{lang.flag}</span>
                <Typography variant="body2" sx={{ color: 'white' }}>
                  {lang.nativeName}
                </Typography>
              </Box>
            );
          }}
        >
          {languages.map((language) => (
            <MenuItem key={language.code} value={language.code}>
              <ListItemIcon sx={{ minWidth: 'auto', mr: 1 }}>
                <span style={{ fontSize: '1.2em' }}>{language.flag}</span>
              </ListItemIcon>
              <ListItemText 
                primary={language.nativeName}
                secondary={language.name}
              />
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
};

export default LanguageSelector;