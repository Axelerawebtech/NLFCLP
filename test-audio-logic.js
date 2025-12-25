console.log('=== AUDIO LOCK BEHAVIOR AFTER FIX ===\n');

function testAudioLocking(day, isVideoCompleted) {
  const disabled = false;
  const shouldShowLock = !isVideoCompleted && day === 0;
  const isDisabled = disabled || (day === 0 && !isVideoCompleted);
  
  console.log(`Day ${day}, videoCompleted=${isVideoCompleted}:`);
  console.log(`  - Show lock overlay: ${shouldShowLock}`);
  console.log(`  - Audio disabled: ${isDisabled}`);
  console.log(`  - Result: ${shouldShowLock ? '🔒 LOCKED' : '✅ UNLOCKED'}`);
  console.log('');
}

// Test scenarios
testAudioLocking(0, false);  // Day 0, video not completed - SHOULD BE LOCKED
testAudioLocking(0, true);   // Day 0, video completed - SHOULD BE UNLOCKED
testAudioLocking(2, false);  // Day 2, no video completed - SHOULD BE UNLOCKED (FIX TARGET)
testAudioLocking(2, true);   // Day 2, video completed - SHOULD BE UNLOCKED
testAudioLocking(7, false);  // Day 7, no video completed - SHOULD BE UNLOCKED
