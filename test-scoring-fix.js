// Test script to verify Zarit burden assessment scoring

console.log('=== Zarit Burden Assessment Scoring Test ===\n');

// Test the scoring logic
const testScoring = (selectedOption, questionsCount = 22) => {
  // Standard options scoring (0-indexed, but values are score)
  const optionScores = [0, 1, 2, 3, 4]; // Never, Rarely, Sometimes, Quite Frequently, Nearly Always
  
  const scorePerQuestion = optionScores[selectedOption];
  const totalScore = questionsCount * scorePerQuestion;
  
  // Score ranges as fixed
  let burdenLevel;
  if (totalScore <= 40) {
    burdenLevel = 'mild';
  } else if (totalScore <= 60) {
    burdenLevel = 'moderate';
  } else {
    burdenLevel = 'severe';
  }
  
  console.log(`Option ${selectedOption + 1} (${getOptionLabel(selectedOption)}):`);
  console.log(`  Score per question: ${scorePerQuestion}`);
  console.log(`  Total score: ${totalScore} (${questionsCount} × ${scorePerQuestion})`);
  console.log(`  Burden level: ${burdenLevel}`);
  console.log('');
  
  return { totalScore, burdenLevel };
};

const getOptionLabel = (optionIndex) => {
  const labels = ['Never (0)', 'Rarely (1)', 'Sometimes (2)', 'Quite Frequently (3)', 'Nearly Always (4)'];
  return labels[optionIndex];
};

// Test all options
console.log('Testing all options for 22 questions:\n');
for (let i = 0; i < 5; i++) {
  testScoring(i);
}

console.log('=== Score Range Boundaries ===');
console.log('0-40: mild');
console.log('41-60: moderate'); 
console.log('61-88: severe\n');

console.log('=== Key Test Cases ===');
console.log('If user selects Option 2 (Rarely) for all questions:');
testScoring(1); // Option 2 is index 1

console.log('If user selects Option 3 (Sometimes) for all questions:');
testScoring(2); // Option 3 is index 2

console.log('Maximum possible score (Option 5 for all):');
testScoring(4); // Option 5 is index 4