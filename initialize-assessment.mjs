// Quick script to initialize caregiver assessment
import fetch from 'node-fetch';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';

async function initializeAssessment() {
  try {
    console.log('🔧 Initializing Caregiver Assessment...\n');
    
    const response = await fetch(`${API_URL}/api/admin/caregiver-assessment/config`);
    const data = await response.json();
    
    if (data.success) {
      console.log('✅ Success! Caregiver Assessment initialized');
      console.log(`   - Sections: ${data.data.sections?.length || 0}`);
      data.data.sections?.forEach((section, idx) => {
        console.log(`   - Section ${idx + 1}: ${section.sectionId} (${section.questions?.length || 0} questions)`);
      });
      console.log('\n✨ Caregivers can now access the questionnaire!\n');
    } else {
      console.log('❌ Failed:', data.message);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

initializeAssessment();
