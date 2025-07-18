# OpenAI API Setup Guide

## Overview
Your TJ Basketball App now includes AI-powered features using OpenAI's API. This guide will help you configure and use the AI functionality.

## Setup Steps

### 1. Get Your OpenAI API Key
1. Go to [OpenAI API Keys](https://platform.openai.com/api-keys)
2. Log in to your OpenAI account (or create one if needed)
3. Click "Create new secret key"
4. Copy the generated API key

### 2. Configure Environment Variables
1. Open your `.env` file in the app directory
2. Replace `your-openai-api-key-here` with your actual OpenAI API key:
   ```
   OPENAI_API_KEY="sk-your-actual-api-key-here"
   ```

### 3. Test the Setup
1. Start your development server:
   ```bash
   npm run dev
   ```
2. Navigate to the Parent Dashboard
3. Click on the "AI Assistant" tab
4. Try generating an assessment or comment

## AI Features Available

### 1. Bulk Assessments
- **Endpoint**: `/api/ai/bulk-assessment`
- **Purpose**: Generate comprehensive skill assessments for players
- **Usage**: Analyzes player performance data and provides detailed evaluations

### 2. Auto Comments
- **Endpoint**: `/api/ai/auto-comment`
- **Purpose**: Generate encouraging and constructive comments
- **Usage**: Creates personalized feedback for drills, workouts, and media uploads

### 3. Custom Drill Creation
- **Endpoint**: `/api/ai/create-custom-drill`
- **Purpose**: Create personalized basketball drills
- **Usage**: Generates drills based on player skill level and focus areas

### 4. Skill Evaluation
- **Endpoint**: `/api/ai/skill-evaluation`
- **Purpose**: Analyze player progress over time
- **Usage**: Provides detailed skill development analysis and recommendations

### 5. Parent Insights
- **Endpoint**: `/api/ai/parent-insights`
- **Purpose**: Generate family-focused basketball development insights
- **Usage**: Offers recommendations for home practice and family engagement

## AI Assistant Modes

### Manual Mode
- Parents handle all assessments and comments manually
- AI features are disabled
- Traditional coaching workflow

### Auto Mode
- AI handles all assessments and comments automatically
- Generates bulk assessments for all children
- Auto-comments on all activities
- Fully automated workflow

### Auto Mixed Mode
- Parents can choose which children get AI assistance
- Individual player settings for AI vs manual handling
- Flexible hybrid approach

## Usage in Parent Dashboard

### AI Assistant Tab
- Central control panel for all AI features
- Mode selection (Manual/Auto/Mixed)
- Bulk operations management
- Task monitoring and progress tracking

### Enhanced Existing Tabs
- **Children Tab**: AI-powered team management
- **Activity Tab**: Auto-commenting and skill analysis
- **Report Cards Tab**: AI report generation
- **Media Review Tab**: AI video analysis

## API Usage and Costs

### Token Usage
- Bulk Assessment: ~1,000-1,500 tokens per player
- Auto Comment: ~150-300 tokens per comment
- Custom Drill: ~800-1,200 tokens per drill
- Skill Evaluation: ~1,200-1,800 tokens per evaluation
- Parent Insights: ~1,000-1,500 tokens per family

### Cost Estimation (GPT-3.5-turbo)
- Input: $0.0015 per 1K tokens
- Output: $0.002 per 1K tokens
- Average cost per AI operation: $0.002-0.005

### Optimization Tips
1. Use Auto Mixed Mode to control AI usage
2. Generate assessments in batches
3. Monitor usage in OpenAI dashboard
4. Set usage limits if needed

## Troubleshooting

### Common Issues

1. **"Unauthorized" Error**
   - Check if your API key is correctly set in `.env`
   - Ensure the API key starts with `sk-`
   - Verify the key is active in OpenAI dashboard

2. **"Rate Limit" Error**
   - You've exceeded OpenAI's rate limits
   - Wait a few minutes and try again
   - Consider upgrading your OpenAI plan

3. **"Failed to generate" Error**
   - Check your internet connection
   - Verify OpenAI service status
   - Check console logs for detailed error messages

### Environment Variables Check
```bash
# Check if OpenAI key is set
echo $OPENAI_API_KEY

# Or check in your .env file
cat .env | grep OPENAI
```

## Security Best Practices

1. **Never commit your API key to version control**
2. **Use environment variables for all sensitive data**
3. **Regularly rotate your API keys**
4. **Monitor API usage for unusual activity**
5. **Set spending limits in OpenAI dashboard**

## Support

If you encounter any issues:
1. Check the browser console for error messages
2. Review the server logs in your terminal
3. Verify your OpenAI account has sufficient credits
4. Ensure your API key has the necessary permissions

## Next Steps

1. Configure your OpenAI API key
2. Test the AI features in the Parent Dashboard
3. Explore different AI modes to find what works best
4. Monitor usage and costs in the OpenAI dashboard
5. Provide feedback on AI-generated content quality

The AI system is designed to enhance your basketball coaching experience while giving you full control over when and how AI assistance is used. 