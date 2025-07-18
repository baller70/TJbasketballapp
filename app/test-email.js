const { sendParentNotification } = require('./lib/resend.ts');

// Test the email notification system
async function testEmailNotification() {
  console.log('Testing email notification system...');
  
  try {
    // Test drill completion notification
    const drillResult = await sendParentNotification(
      'parent@example.com',
      'Alex',
      'DRILL_COMPLETED',
      {
        drillName: 'Free Throw Practice',
        duration: '15:30',
        rating: 4,
        notes: 'Great improvement in form!',
        pointsEarned: 15,
        currentStreak: 3,
      }
    );
    console.log('Drill completion notification:', drillResult);
    
    // Test workout completion notification
    const workoutResult = await sendParentNotification(
      'parent@example.com',
      'Alex',
      'WORKOUT_COMPLETED',
      {
        workoutName: 'Morning Basketball Training',
        duration: '45:00',
        drillsCompleted: 5,
        pointsEarned: 125,
        currentStreak: 3,
      }
    );
    console.log('Workout completion notification:', workoutResult);
    
  } catch (error) {
    console.error('Error testing email notifications:', error);
  }
}

testEmailNotification(); 