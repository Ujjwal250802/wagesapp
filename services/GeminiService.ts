import { GoogleGenerativeAI } from '@google/generative-ai';

// You need to add your Gemini API key here
const GEMINI_API_KEY = 'AIzaSyDc_9EjeOOoXpnaZn8lvIde_mTA4Nazkqg'; // Replace with your actual API key

class GeminiService {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor() {
    if (!GEMINI_API_KEY || GEMINI_API_KEY === 'AIzaSyDc_9EjeOOoXpnaZn8lvIde_mTA4Nazkqg') {
      console.warn('Gemini API key not configured. AI features will be disabled.');
      return;
    }
    
    this.genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });
  }

  async analyzePerformance(attendanceData: any, workerInfo: any): Promise<string> {
    if (!this.model) {
      return 'AI analysis not available. Please configure Gemini API key.';
    }

    try {
      const prompt = `
        Analyze the following worker performance data and provide insights:
        
        Worker Information:
        - Name: ${workerInfo.name}
        - Job Category: ${workerInfo.jobCategory}
        - Experience: ${workerInfo.experience} years
        
        Attendance Data:
        ${JSON.stringify(attendanceData, null, 2)}
        
        Please provide:
        1. Performance summary (2-3 sentences)
        2. Attendance pattern analysis
        3. Recommendations for improvement
        4. Strengths and areas of concern
        5. Suggested optimal work schedule
        
        Keep the response professional and constructive. Format as JSON with keys: summary, patterns, recommendations, strengths, concerns, schedule.
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Gemini performance analysis error:', error);
      return 'Unable to generate performance analysis at this time.';
    }
  }

  async generateJobDescription(category: string, basicInfo: string): Promise<string> {
    if (!this.model) {
      return basicInfo;
    }

    try {
      const prompt = `
        Create a professional job description for a ${category} position based on this basic information: "${basicInfo}"
        
        Include:
        - Clear job responsibilities
        - Required skills and experience
        - Working conditions
        - Safety requirements (if applicable)
        
        Keep it concise but comprehensive, suitable for daily wage workers. Return only the enhanced description.
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Gemini job description error:', error);
      return basicInfo;
    }
  }

  async transcribeAndEnhance(text: string, context: 'job_posting' | 'application'): Promise<string> {
    if (!this.model) {
      return text;
    }

    try {
      const prompt = context === 'job_posting' 
        ? `Clean up and enhance this job posting text: "${text}". Make it professional and clear while keeping the original meaning.`
        : `Clean up and enhance this job application text: "${text}". Make it professional while keeping the original meaning and personal touch.`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Gemini text enhancement error:', error);
      return text;
    }
  }

  async generateSafetyTips(jobCategory: string, location: string): Promise<string[]> {
    if (!this.model) {
      return ['Stay safe at work', 'Follow safety protocols', 'Report any hazards'];
    }

    try {
      const prompt = `
        Generate 5 specific safety tips for a ${jobCategory} working in ${location}.
        Focus on practical, actionable advice. Return as a JSON array of strings.
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      try {
        return JSON.parse(text);
      } catch {
        return text.split('\n').filter(tip => tip.trim().length > 0).slice(0, 5);
      }
    } catch (error) {
      console.error('Gemini safety tips error:', error);
      return ['Stay safe at work', 'Follow safety protocols', 'Report any hazards'];
    }
  }
}

export const geminiService = new GeminiService();