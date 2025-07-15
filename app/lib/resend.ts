import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

// Check if email service is properly configured
const isEmailConfigured = () => {
  const apiKey = process.env.RESEND_API_KEY;
  return apiKey && apiKey !== 'your-resend-api-key-here' && apiKey !== 'demo-key';
};

// Email template for parent notifications
export const sendParentNotification = async (
  parentEmail: string,
  childName: string,
  notificationType: 'DRILL_COMPLETED' | 'ACHIEVEMENT_UNLOCKED' | 'MEDIA_UPLOADED' | 'STREAK_MILESTONE',
  data: any
) => {
  // If email is not configured, log the notification instead of failing
  if (!isEmailConfigured()) {
    console.log('📧 Email notification (would be sent if configured):', {
      to: parentEmail,
      subject: `${childName} - ${notificationType}`,
      data,
    });
    return { success: true, message: 'Email notification logged (not configured)' };
  }

  try {
    let subject = '';
    let htmlContent = '';
    
    switch (notificationType) {
      case 'DRILL_COMPLETED':
        subject = `${childName} completed a drill - HoopsQuest`;
        htmlContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #ea580c, #f97316); color: white; padding: 20px; border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; font-size: 24px;">🏀 Great Job!</h1>
              <p style="margin: 10px 0 0 0; opacity: 0.9;">Your child is making progress!</p>
            </div>
            <div style="background: #f8fafc; padding: 20px; border-radius: 0 0 8px 8px;">
              <h2 style="color: #1e293b; margin: 0 0 15px 0;">${childName} completed a drill!</h2>
              <div style="background: white; padding: 15px; border-radius: 6px; border-left: 4px solid #ea580c;">
                <p><strong>Drill:</strong> ${data.drillName}</p>
                <p><strong>Duration:</strong> ${data.duration || 'N/A'}</p>
                <p><strong>Rating:</strong> ${data.rating ? '⭐'.repeat(data.rating) : 'Not rated'}</p>
                ${data.notes ? `<p><strong>Notes:</strong> ${data.notes}</p>` : ''}
              </div>
              <div style="margin-top: 20px; padding: 15px; background: #ecfdf5; border-radius: 6px;">
                <p style="margin: 0; color: #065f46;">
                  <strong>Points Earned:</strong> ${data.pointsEarned || 10} points
                </p>
              </div>
            </div>
          </div>
        `;
        break;
        
      case 'ACHIEVEMENT_UNLOCKED':
        subject = `${childName} unlocked a new achievement - HoopsQuest`;
        htmlContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #fbbf24, #f59e0b); color: white; padding: 20px; border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; font-size: 24px;">🏆 Achievement Unlocked!</h1>
              <p style="margin: 10px 0 0 0; opacity: 0.9;">Celebrating your child's success!</p>
            </div>
            <div style="background: #f8fafc; padding: 20px; border-radius: 0 0 8px 8px;">
              <h2 style="color: #1e293b; margin: 0 0 15px 0;">${childName} unlocked a new achievement!</h2>
              <div style="background: white; padding: 15px; border-radius: 6px; border-left: 4px solid #fbbf24;">
                <p><strong>Achievement:</strong> ${data.achievementName}</p>
                <p><strong>Description:</strong> ${data.description}</p>
                <p><strong>Rarity:</strong> ${data.rarity}</p>
                <p><strong>Points Earned:</strong> ${data.points} points</p>
              </div>
              <div style="margin-top: 20px; padding: 15px; background: #fef3c7; border-radius: 6px;">
                <p style="margin: 0; color: #92400e;">
                  <strong>Total Points:</strong> ${data.totalPoints} points
                </p>
              </div>
            </div>
          </div>
        `;
        break;
        
      case 'MEDIA_UPLOADED':
        subject = `${childName} uploaded practice media - HoopsQuest`;
        htmlContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #8b5cf6, #7c3aed); color: white; padding: 20px; border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; font-size: 24px;">📸 Media Upload!</h1>
              <p style="margin: 10px 0 0 0; opacity: 0.9;">Your child shared their practice!</p>
            </div>
            <div style="background: #f8fafc; padding: 20px; border-radius: 0 0 8px 8px;">
              <h2 style="color: #1e293b; margin: 0 0 15px 0;">${childName} uploaded practice media!</h2>
              <div style="background: white; padding: 15px; border-radius: 6px; border-left: 4px solid #8b5cf6;">
                <p><strong>Drill:</strong> ${data.drillName}</p>
                <p><strong>Uploaded:</strong> ${new Date(data.uploadedAt).toLocaleDateString()}</p>
                <p><strong>Type:</strong> ${data.mediaType}</p>
              </div>
              <div style="margin-top: 20px; padding: 15px; background: #f3e8ff; border-radius: 6px;">
                <p style="margin: 0; color: #6b21a8;">
                  <strong>Action Required:</strong> Please review and provide feedback to help ${childName} improve!
                </p>
              </div>
            </div>
          </div>
        `;
        break;
        
      case 'STREAK_MILESTONE':
        subject = `${childName} reached a ${data.streakDays}-day streak - HoopsQuest`;
        htmlContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 20px; border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; font-size: 24px;">🔥 Streak Milestone!</h1>
              <p style="margin: 10px 0 0 0; opacity: 0.9;">Consistency is key to success!</p>
            </div>
            <div style="background: #f8fafc; padding: 20px; border-radius: 0 0 8px 8px;">
              <h2 style="color: #1e293b; margin: 0 0 15px 0;">${childName} reached a ${data.streakDays}-day streak!</h2>
              <div style="background: white; padding: 15px; border-radius: 6px; border-left: 4px solid #10b981;">
                <p><strong>Current Streak:</strong> ${data.streakDays} days</p>
                <p><strong>Longest Streak:</strong> ${data.longestStreak} days</p>
                <p><strong>Bonus Points:</strong> ${data.bonusPoints} points</p>
              </div>
              <div style="margin-top: 20px; padding: 15px; background: #d1fae5; border-radius: 6px;">
                <p style="margin: 0; color: #065f46;">
                  <strong>Keep it up!</strong> Consistency is the foundation of excellence in basketball!
                </p>
              </div>
            </div>
          </div>
        `;
        break;
        
      default:
        throw new Error(`Unknown notification type: ${notificationType}`);
    }

    const response = await resend.emails.send({
      from: 'HoopsQuest <notifications@hoopsquest.com>',
      to: parentEmail,
      subject,
      html: htmlContent,
    });

    return { success: true, data: response };
  } catch (error) {
    console.error('Error sending email notification:', error);
    
    // Log the notification details for debugging
    console.log('📧 Failed email notification details:', {
      to: parentEmail,
      subject: `${childName} - ${notificationType}`,
      data,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to send email notification' 
    };
  }
};

// Helper function to send a welcome email to new parents
export const sendWelcomeEmail = async (parentEmail: string, parentName: string) => {
  if (!isEmailConfigured()) {
    console.log('📧 Welcome email (would be sent if configured):', {
      to: parentEmail,
      subject: 'Welcome to HoopsQuest!'
    });
    return { success: true, message: 'Welcome email logged (not configured)' };
  }

  try {
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #ea580c, #f97316); color: white; padding: 20px; border-radius: 8px 8px 0 0;">
          <h1 style="margin: 0; font-size: 24px;">🏀 Welcome to HoopsQuest!</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">The ultimate basketball training platform for kids</p>
        </div>
        <div style="background: #f8fafc; padding: 20px; border-radius: 0 0 8px 8px;">
          <h2 style="color: #1e293b; margin: 0 0 15px 0;">Hi ${parentName}!</h2>
          <p>Welcome to HoopsQuest! We're excited to help your child develop their basketball skills and build confidence on the court.</p>
          
          <div style="background: white; padding: 15px; border-radius: 6px; border-left: 4px solid #ea580c; margin: 20px 0;">
            <h3 style="margin: 0 0 10px 0; color: #ea580c;">What you can do as a parent:</h3>
            <ul style="margin: 0; padding-left: 20px;">
              <li>Monitor your child's progress and achievements</li>
              <li>Review practice videos and provide feedback</li>
              <li>Track daily streaks and completed drills</li>
              <li>Receive notifications about milestones</li>
              <li>Schedule practice sessions</li>
            </ul>
          </div>
          
          <div style="background: #ecfdf5; padding: 15px; border-radius: 6px; margin: 20px 0;">
            <h3 style="margin: 0 0 10px 0; color: #065f46;">Getting Started:</h3>
            <ol style="margin: 0; padding-left: 20px;">
              <li>Log into your parent dashboard</li>
              <li>Help your child complete their first drill</li>
              <li>Watch for notifications about their progress</li>
              <li>Provide encouragement and feedback</li>
            </ol>
          </div>
          
          <p style="margin: 20px 0 0 0; color: #6b7280;">
            Questions? Reply to this email or contact our support team. We're here to help!
          </p>
        </div>
      </div>
    `;

    const response = await resend.emails.send({
      from: 'HoopsQuest <welcome@hoopsquest.com>',
      to: parentEmail,
      subject: 'Welcome to HoopsQuest - Let\'s Get Started!',
      html: htmlContent,
    });

    return { success: true, data: response };
  } catch (error) {
    console.error('Error sending welcome email:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to send welcome email' 
    };
  }
};

// Export email configuration check
export { isEmailConfigured }; 