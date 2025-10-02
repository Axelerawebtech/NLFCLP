import { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  Grid,
  Checkbox,
  FormControlLabel,
  TextField,
  RadioGroup,
  Radio,
  FormControl,
  FormLabel,
  Stack,
  Select,
  MenuItem,
  OutlinedInput
} from '@mui/material';
import { motion } from 'framer-motion';
import { FaArrowRight } from 'react-icons/fa';

const CaregiverQuestions = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    relationshipToPatient: '',
    otherRelationship: '',
    hoursPerDay: '',
    yearsOfCaregiving: '',
    age: '',
    gender: '',
    otherGender: '',
    race: [],
    otherRace: '',
    ethnicity: '',
    education: '',
    income: '',
    employmentStatus: '',
    maritalStatus: '',
    healthConditions: [],
    otherHealthCondition: '',
    primaryLanguage: '',
    otherLanguage: '',
    zipCode: ''
  });

  const renderField = (field) => {
    if (field.type === 'multiSelect') {
      return (
        <FormControl fullWidth required={field.required}>
          <FormLabel>{field.label}</FormLabel>
          <Select
            multiple
            name={field.name}
            value={formData[field.name] || []}
            onChange={(event) => {
              const value = event.target.value;
              // Handle 'None' option if it exists in options
              if (field.options.includes('None')) {
                if (value.includes('None') && !formData[field.name]?.includes('None')) {
                  setFormData(prev => ({ ...prev, [field.name]: ['None'] }));
                } else if (value.length === 0) {
                  setFormData(prev => ({ ...prev, [field.name]: [] }));
                } else if (!value.includes('None')) {
                  setFormData(prev => ({ ...prev, [field.name]: value }));
                }
              } else {
                setFormData(prev => ({ ...prev, [field.name]: value }));
              }
            }}
            input={<OutlinedInput />}
            sx={{ mt: 1 }}
          >
            {field.options.map((option) => (
              <MenuItem
                key={option}
                value={option}
                disabled={option !== 'None' && formData[field.name]?.includes('None')}
              >
                {option}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      );
    }
    // Handle other field types as before...
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      const newValue = checked 
        ? [...formData[name], value]
        : formData[name].filter(item => item !== value);
      setFormData(prev => ({ ...prev, [name]: newValue }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%', maxWidth: 800, mx: 'auto', p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Demographic Information
      </Typography>

      {/* Relationship Section */}
      <Card sx={{ mb: 3, p: 3 }}>
        <FormControl fullWidth required>
          <FormLabel>What is your relationship to the patient?</FormLabel>
          <RadioGroup
            name="relationshipToPatient"
            value={formData.relationshipToPatient}
            onChange={handleChange}
          >
            {['Spouse', 'Parent', 'Child', 'Sibling', 'Other'].map((option) => (
              <FormControlLabel key={option} value={option} control={<Radio />} label={option} />
            ))}
          </RadioGroup>
        </FormControl>
        
        {formData.relationshipToPatient === 'Other' && (
          <TextField
            fullWidth
            name="otherRelationship"
            label="Please specify relationship"
            value={formData.otherRelationship}
            onChange={handleChange}
            sx={{ mt: 2 }}
          />
        )}
      </Card>

      {/* Caregiving Experience */}
      <Card sx={{ mb: 3, p: 3 }}>
        <FormControl fullWidth required>
          <FormLabel>How many hours per day do you spend caregiving?</FormLabel>
          <RadioGroup
            name="hoursPerDay"
            value={formData.hoursPerDay}
            onChange={handleChange}
          >
            {['Less than 2 hours', '2-4 hours', '4-8 hours', 'More than 8 hours'].map((option) => (
              <FormControlLabel key={option} value={option} control={<Radio />} label={option} />
            ))}
          </RadioGroup>
        </FormControl>

        <FormControl fullWidth required sx={{ mt: 3 }}>
          <FormLabel>How long have you been a caregiver?</FormLabel>
          <RadioGroup
            name="yearsOfCaregiving"
            value={formData.yearsOfCaregiving}
            onChange={handleChange}
          >
            {['Less than 1 year', '1-3 years', '3-5 years', 'More than 5 years'].map((option) => (
              <FormControlLabel key={option} value={option} control={<Radio />} label={option} />
            ))}
          </RadioGroup>
        </FormControl>
      </Card>

      {/* Demographics */}
      <Card sx={{ mb: 3, p: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth required>
              <FormLabel>Age</FormLabel>
              <RadioGroup
                name="age"
                value={formData.age}
                onChange={handleChange}
              >
                {['18-30', '31-45', '46-60', '61-75', 'Over 75'].map((option) => (
                  <FormControlLabel key={option} value={option} control={<Radio />} label={option} />
                ))}
              </RadioGroup>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControl fullWidth required>
              <FormLabel>Gender</FormLabel>
              <RadioGroup
                name="gender"
                value={formData.gender}
                onChange={handleChange}
              >
                {['Male', 'Female', 'Non-binary', 'Prefer not to say', 'Other'].map((option) => (
                  <FormControlLabel key={option} value={option} control={<Radio />} label={option} />
                ))}
              </RadioGroup>
            </FormControl>
            {formData.gender === 'Other' && (
              <TextField
                fullWidth
                name="otherGender"
                label="Please specify gender"
                value={formData.otherGender}
                onChange={handleChange}
                sx={{ mt: 2 }}
              />
            )}
          </Grid>

          <Grid item xs={12}>
            <FormControl fullWidth required>
              <FormLabel>Race (select all that apply)</FormLabel>
              {[
                'American Indian or Alaska Native',
                'Asian',
                'Black or African American',
                'Native Hawaiian or Other Pacific Islander',
                'White',
                'Other'
              ].map((option) => (
                <FormControlLabel
                  key={option}
                  control={
                    <Checkbox
                      checked={formData.race.includes(option)}
                      onChange={handleChange}
                      name="race"
                      value={option}
                    />
                  }
                  label={option}
                />
              ))}
            </FormControl>
            {formData.race.includes('Other') && (
              <TextField
                fullWidth
                name="otherRace"
                label="Please specify race"
                value={formData.otherRace}
                onChange={handleChange}
                sx={{ mt: 2 }}
              />
            )}
          </Grid>

          <Grid item xs={12}>
            <FormControl fullWidth required>
              <FormLabel>Ethnicity</FormLabel>
              <RadioGroup
                name="ethnicity"
                value={formData.ethnicity}
                onChange={handleChange}
              >
                {['Hispanic or Latino', 'Not Hispanic or Latino', 'Prefer not to say'].map((option) => (
                  <FormControlLabel key={option} value={option} control={<Radio />} label={option} />
                ))}
              </RadioGroup>
            </FormControl>
          </Grid>
        </Grid>
      </Card>

      {/* Socioeconomic Information */}
      <Card sx={{ mb: 3, p: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <FormControl fullWidth required>
              <FormLabel>Education Level</FormLabel>
              <RadioGroup
                name="education"
                value={formData.education}
                onChange={handleChange}
              >
                {[
                  'Less than high school',
                  'High school graduate',
                  'Some college',
                  'College graduate',
                  'Graduate degree'
                ].map((option) => (
                  <FormControlLabel key={option} value={option} control={<Radio />} label={option} />
                ))}
              </RadioGroup>
            </FormControl>
          </Grid>

          <Grid item xs={12}>
            <FormControl fullWidth required>
              <FormLabel>Annual Household Income</FormLabel>
              <RadioGroup
                name="income"
                value={formData.income}
                onChange={handleChange}
              >
                {[
                  'Less than $25,000',
                  '$25,000 - $49,999',
                  '$50,000 - $74,999',
                  '$75,000 - $99,999',
                  '$100,000 or more',
                  'Prefer not to say'
                ].map((option) => (
                  <FormControlLabel key={option} value={option} control={<Radio />} label={option} />
                ))}
              </RadioGroup>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControl fullWidth required>
              <FormLabel>Employment Status</FormLabel>
              <RadioGroup
                name="employmentStatus"
                value={formData.employmentStatus}
                onChange={handleChange}
              >
                {[
                  'Full-time',
                  'Part-time',
                  'Retired',
                  'Unemployed',
                  'Unable to work'
                ].map((option) => (
                  <FormControlLabel key={option} value={option} control={<Radio />} label={option} />
                ))}
              </RadioGroup>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControl fullWidth required>
              <FormLabel>Marital Status</FormLabel>
              <RadioGroup
                name="maritalStatus"
                value={formData.maritalStatus}
                onChange={handleChange}
              >
                {[
                  'Single',
                  'Married',
                  'Divorced',
                  'Widowed',
                  'Separated'
                ].map((option) => (
                  <FormControlLabel key={option} value={option} control={<Radio />} label={option} />
                ))}
              </RadioGroup>
            </FormControl>
          </Grid>
        </Grid>
      </Card>

      {/* Health and Language */}
      <Card sx={{ mb: 3, p: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <FormControl fullWidth required>
              <FormLabel>Do you have any of the following health conditions? (select all that apply)</FormLabel>
              <Stack>
                {[
                  'Diabetes',
                  'Heart Disease',
                  'High Blood Pressure',
                  'Arthritis',
                  'Depression/Anxiety',
                  'Other',
                  'None'
                ].map((option) => (
                  <FormControlLabel
                    key={option}
                    control={
                      <Checkbox
                        checked={formData.healthConditions.includes(option)}
                        onChange={(e) => {
                          const { checked } = e.target;
                          let newHealthConditions;
                          if (option === 'None') {
                            // If None is selected, clear all other selections
                            newHealthConditions = checked ? ['None'] : [];
                          } else {
                            // Remove 'None' if it exists and add/remove the selected option
                            const currentConditions = formData.healthConditions.filter(c => c !== 'None');
                            newHealthConditions = checked
                              ? [...currentConditions, option]
                              : currentConditions.filter(c => c !== option);
                          }
                          setFormData(prev => ({ ...prev, healthConditions: newHealthConditions }));
                        }}
                        value={option}
                      />
                    }
                    label={option}
                  />
                ))}
              </Stack>
            </FormControl>
            {formData.healthConditions.includes('Other') && (
              <TextField
                fullWidth
                name="otherHealthCondition"
                label="Please specify health condition"
                value={formData.otherHealthCondition}
                onChange={handleChange}
                sx={{ mt: 2 }}
              />
            )}
          </Grid>

          <Grid item xs={12}>
            <FormControl fullWidth required>
              <FormLabel>Primary Language</FormLabel>
              <RadioGroup
                name="primaryLanguage"
                value={formData.primaryLanguage}
                onChange={handleChange}
              >
                {['English', 'Spanish', 'Other'].map((option) => (
                  <FormControlLabel key={option} value={option} control={<Radio />} label={option} />
                ))}
              </RadioGroup>
            </FormControl>
            {formData.primaryLanguage === 'Other' && (
              <TextField
                fullWidth
                name="otherLanguage"
                label="Please specify language"
                value={formData.otherLanguage}
                onChange={handleChange}
                sx={{ mt: 2 }}
              />
            )}
          </Grid>

          <Grid item xs={12}>
            <FormControl fullWidth required>
              <FormLabel>Support System Available (select all that apply)</FormLabel>
              <Select
                multiple
                name="supportSystem"
                value={formData.supportSystem || []}
                onChange={(event) => {
                  const value = event.target.value;
                  // Handle 'None' option
                  if (value.includes('None') && !formData.supportSystem?.includes('None')) {
                    setFormData(prev => ({ ...prev, supportSystem: ['None'] }));
                  } else if (value.length === 0) {
                    setFormData(prev => ({ ...prev, supportSystem: [] }));
                  } else if (!value.includes('None')) {
                    setFormData(prev => ({ ...prev, supportSystem: value }));
                  }
                }}
                input={<OutlinedInput />}
                sx={{ mt: 1 }}
              >
                {[
                  'Family Support',
                  'Friends',
                  'Community Support Groups',
                  'Religious/Spiritual Support',
                  'None'
                ].map((option) => (
                  <MenuItem
                    key={option}
                    value={option}
                    disabled={option !== 'None' && formData.supportSystem?.includes('None')}
                  >
                    {option}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              required
              name="zipCode"
              label="ZIP Code"
              value={formData.zipCode}
              onChange={handleChange}
              inputProps={{ maxLength: 5, pattern: "[0-9]*" }}
              helperText="Enter your 5-digit ZIP code"
            />
          </Grid>
        </Grid>
      </Card>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
        <Button
          type="submit"
          variant="contained"
          color="primary"
          endIcon={<FaArrowRight />}
          size="large"
        >
          Continue
        </Button>
      </Box>
    </Box>
  );
};

export default CaregiverQuestions;