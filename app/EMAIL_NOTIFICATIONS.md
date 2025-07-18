# Email Notification System

## Overview
The TJbasketballapp now includes a comprehensive email notification system that automatically sends emails to parents when their children complete drills or workouts.

## Features

### 🏀 **Drill Completion Notifications**
- Sent when a child completes any drill
- Includes drill name, duration, rating, and notes
- Shows points earned and current streak
- Beautiful HTML email template with basketball theme

### 💪 **Workout Completion Notifications**
- Sent when a child completes a full workout
- Includes workout name, total duration, and number of drills completed
- Shows points earned and current streak
- Distinct green-themed email template

## Implementation Details

### **Database Structure**
- Uses existing `User` model with parent-child relationships
- `parentId` field links children to their parents
- Parent emails are used for notifications

### **Email Service**
- Uses Resend API for reliable email delivery
- Configured in `lib/resend.ts`
- Supports both configured and mock modes
- Graceful fallback if email service is not configured

### **Integration Points**
1. **Drill Completion**: `/api/drills/complete` endpoint
2. **Workout Completion**: `/api/workouts/complete` endpoint

### **Email Templates**
- **Drill Completion**: Orange-themed template with drill details
- **Workout Completion**: Green-themed template with workout summary
- Responsive HTML design with inline CSS
- Includes branding and clear call-to-action

## Configuration

### **Environment Variables**
```bash
RESEND_API_KEY=your-resend-api-key-here
```

### **Email Domains**
- Emails are sent from the configured Resend domain
- Subject lines include "HoopsQuest" branding
- Professional HTML formatting with gradient headers

## Usage

### **Automatic Notifications**
- No manual intervention required
- Notifications are sent automatically when:
  - A child completes a drill
  - A child completes a workout
  - Parent email is available in the system

### **Error Handling**
- Email failures don't prevent drill/workout completion
- Errors are logged for debugging
- Graceful degradation if email service is unavailable

## Testing

### **Test Script**
Run the test script to verify email functionality:
```bash
node test-email.js
```

### **Mock Mode**
- When email is not configured, notifications are logged to console
- Useful for development and testing
- No actual emails are sent

## Email Content Examples

### **Drill Completion Email**
```
Subject: Alex completed a drill - HoopsQuest

🏀 Great Job!
Your child is making progress!

Alex completed a drill!
- Drill: Free Throw Practice
- Duration: 15:30
- Rating: ⭐⭐⭐⭐
- Notes: Great improvement in form!
- Points Earned: 15 points
```

### **Workout Completion Email**
```
Subject: Alex completed a workout - HoopsQuest

💪 Workout Complete!
Your child crushed their workout!

Alex completed a workout!
- Workout: Morning Basketball Training
- Duration: 45:00
- Drills Completed: 5
- Current Streak: 3 days
- Points Earned: 125 points
```

## Benefits

### **For Parents**
- Stay informed about their child's progress
- Receive immediate notifications of completions
- Track consistency and improvement over time
- Celebrate achievements with their children

### **For Children**
- Increased motivation knowing parents are notified
- Recognition for their hard work
- Encouragement to maintain streaks
- Positive reinforcement through parental engagement

### **For Coaches**
- Parents are automatically kept in the loop
- Reduced need for manual progress reports
- Better parent-coach communication
- Increased accountability

## Future Enhancements

### **Potential Additions**
- Weekly/monthly progress summaries
- Achievement unlock notifications
- Milestone celebrations
- Custom notification preferences
- SMS notifications option
- Parent dashboard integration

### **Customization Options**
- Notification frequency settings
- Email template customization
- Language preferences
- Notification categories (opt-in/opt-out)

## Security & Privacy

### **Data Protection**
- Only sends notifications to verified parent emails
- No sensitive data included in emails
- Secure API key management
- Graceful error handling

### **Privacy Considerations**
- Parents must be linked in the system to receive notifications
- No third-party data sharing
- Compliant with email best practices
- Unsubscribe functionality (future enhancement)

## Troubleshooting

### **Common Issues**
1. **No emails received**: Check RESEND_API_KEY configuration
2. **Parent not receiving emails**: Verify parent-child relationship in database
3. **Email delivery issues**: Check Resend dashboard for delivery status
4. **Template rendering issues**: Verify HTML template syntax

### **Debug Steps**
1. Check console logs for email notification attempts
2. Verify parent email exists in User model
3. Test with the provided test script
4. Check Resend API key validity
5. Verify domain configuration in Resend dashboard 