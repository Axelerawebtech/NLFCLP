import { useState } from 'react';
import { useRouter } from 'next/router';
import {
  Box,
  Typography,
  Button,
  Card,
  Checkbox,
  FormControlLabel,
} from '@mui/material';
import { motion } from 'framer-motion';

const ConsentForm = ({ userType, onAccept, formData }) => {
  const [accepted, setAccepted] = useState(false);
  const [declined, setDeclined] = useState(false);
  const router = useRouter();

  const studyDetails = {
    title: "The Impact of a Nurse-led Family Caregiver Program Among Cancer Patients at a Tertiary Care Hospital in Bangalore.",
    investigator: {
      name: "MR. James Raj K",
      role: "PHD Scholar",
      institution: "KLE Institute of Nursing Science, Belgaum",
      contact: "9500482944"
    },
    purpose: "The purpose of this study is to evaluate the impact of a nurse-led family caregiver program on alleviating caregiver burden, improving quality of life, and reducing stress among cancer patients and their caregivers.",
    procedures: [
      "Pre-test Assessment: to assess baseline caregiver burden, quality of life, and stress levels using standardized tools.",
      "Intervention: Participation in a nurse-led family caregiver program designed to address areas identified in the pre-test.",
      "Immediate Post-test Assessment: immediately following the intervention to reassess caregiver burden, quality of life, and stress levels.",
      "Follow-up Post-test Assessment: 12 weeks after the intervention to assess the long-term impact on caregiver burden, quality of life, and stress levels."
    ],
    duration: "Participation will last approximately 12 weeks, including the pre-test, intervention, and the two post-test assessments.",
    risks: [
      "There may be some emotional discomfort when discussing personal experiences and stressors.",
      "Participation in the program requires a time commitment that might be challenging for some caregivers."
    ],
    benefits: [
      "Potential improvement in caregiver burden, quality of life, and stress levels.",
      "Contribution to research that may help other caregivers in the future."
    ]
  };

  const handleConsent = () => {
    if (accepted) {
      onAccept();
      router.push('/login');
    }
  };

  const handleDecline = () => {
    setDeclined(true);
  };

  if (declined) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Card sx={{ maxWidth: 600, mx: 'auto', p: 4, textAlign: 'center' }}>
          <Typography variant="h5" sx={{ mb: 3 }}>
            Thank you for your response
          </Typography>
          <Typography variant="body1" sx={{ mb: 4 }}>
            Take your time and come back when you're ready.
          </Typography>
          <Button
            variant="contained"
            onClick={() => router.push('/')}
          >
            Return to Home
          </Button>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <Card sx={{ maxWidth: 800, mx: 'auto', p: 4 }}>
        <Typography variant="h4" sx={{ mb: 3, textAlign: 'center' }}>
          Consent Form
        </Typography>
        
        <Typography variant="h5" sx={{ mb: 2 }}>
          Title of Study:
        </Typography>
        <Typography variant="body1" sx={{ mb: 3 }}>
          {studyDetails.title}
        </Typography>

        <Typography variant="h6" sx={{ mb: 2 }}>
          Principal Investigator:
        </Typography>
        <Typography variant="body1" sx={{ mb: 3 }}>
          {studyDetails.investigator.name}<br />
          {studyDetails.investigator.role}<br />
          {studyDetails.investigator.institution}
        </Typography>

        <Typography variant="h6" sx={{ mb: 2 }}>
          Purpose of the Study:
        </Typography>
        <Typography variant="body1" sx={{ mb: 3 }}>
          {studyDetails.purpose}
        </Typography>

        <Typography variant="h6" sx={{ mb: 2 }}>
          Study Procedures:
        </Typography>
        <Box sx={{ mb: 3 }}>
          {studyDetails.procedures.map((proc, index) => (
            <Typography key={index} variant="body1" sx={{ mb: 1 }}>
              • {proc}
            </Typography>
          ))}
        </Box>

        <Typography variant="h6" sx={{ mb: 2 }}>
          Duration:
        </Typography>
        <Typography variant="body1" sx={{ mb: 3 }}>
          {studyDetails.duration}
        </Typography>

        <Typography variant="h6" sx={{ mb: 2 }}>
          Risks and Discomforts:
        </Typography>
        <Box sx={{ mb: 3 }}>
          {studyDetails.risks.map((risk, index) => (
            <Typography key={index} variant="body1" sx={{ mb: 1 }}>
              • {risk}
            </Typography>
          ))}
        </Box>

        <Typography variant="h6" sx={{ mb: 2 }}>
          Benefits:
        </Typography>
        <Box sx={{ mb: 3 }}>
          {studyDetails.benefits.map((benefit, index) => (
            <Typography key={index} variant="body1" sx={{ mb: 1 }}>
              • {benefit}
            </Typography>
          ))}
        </Box>

        <Typography variant="h6" sx={{ mb: 2 }}>
          Contact Information:
        </Typography>
        <Typography variant="body1" sx={{ mb: 3 }}>
          For questions or concerns, contact:<br />
          {studyDetails.investigator.name}<br />
          {studyDetails.investigator.role}<br />
          {studyDetails.investigator.institution}<br />
          Mob: {studyDetails.investigator.contact}
        </Typography>

        <Box sx={{ mb: 3 }}>
          <FormControlLabel
            control={
              <Checkbox 
                checked={accepted}
                onChange={(e) => setAccepted(e.target.checked)}
              />
            }
            label="I have read and understood the information above. I voluntarily agree to participate in this study and understand I can withdraw at any time without penalty."
          />
        </Box>

        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
          <Button
            variant="contained"
            color="error"
            onClick={handleDecline}
          >
            Decline
          </Button>
          <Button
            variant="contained"
            disabled={!accepted}
            onClick={handleConsent}
          >
            Accept and Continue to Login
          </Button>
        </Box>
      </Card>
    </motion.div>
  );
};

export default ConsentForm;
