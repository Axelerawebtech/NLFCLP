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
import { useTheme } from '../contexts/ThemeContext';

const LanguageSelector = ({ sx = {} }) => {
  const { currentLanguage, changeLanguage } = useLanguage();
  const { isDarkMode } = useTheme();

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

  const selectSx = isDarkMode
    ? {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        color: '#f8fafc',
        '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255, 255, 255, 0.3)' },
        '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255, 255, 255, 0.5)' },
        '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255, 255, 255, 0.7)' }
      }
    : {
        backgroundColor: 'rgba(15, 23, 42, 0.04)',
        color: '#0f172a',
        '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(15, 23, 42, 0.2)' },
        '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(15, 23, 42, 0.3)' },
        '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(15, 23, 42, 0.45)' }
      };

  const textColor = isDarkMode ? '#f8fafc' : '#0f172a';

  return (
    <Box sx={{ minWidth: 120, ...sx }}>
      <FormControl fullWidth size="small">
        <Select
          value={currentLanguage}
          onChange={handleLanguageChange}
          displayEmpty
          sx={{
            ...selectSx,
            '& .MuiSelect-icon': { color: textColor }
          }}
          renderValue={(selected) => {
            const lang = getCurrentLanguage();
            return (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <span style={{ fontSize: '1.2em' }}>{lang.flag}</span>
                <Typography variant="body2" sx={{ color: textColor }}>
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