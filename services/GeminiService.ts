import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = 'AIzaSyDfO3oWskF7Pj99ua_72pZxEDQgfGEl8Fo'; // Add this to your environment variables
const genAI = new GoogleGenerativeAI(API_KEY);

export class GeminiService {
  private model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  async getJobRecommendations(workerProfile: any, availableJobs: any[]) {
    try {
      const prompt = `
        Based on this worker profile:
        - Name: ${workerProfile.name}
        - Experience: ${workerProfile.experience || 'Not specified'} years
        - Skills: ${workerProfile.skills || 'General labor'}
        - Location: ${workerProfile.location || 'Not specified'}
        - Previous work: ${workerProfile.bio || 'Not specified'}

        And these available jobs:
        ${availableJobs.map(job => `
        - ${job.category} at ${job.organizationName}
        - Location: ${job.location}
        - Salary: ₹${job.salary}/day
        - Description: ${job.description}
        `).join('\n')}

        Recommend the top 3 most suitable jobs for this worker and explain why each job is a good match.
        Consider location proximity, skill match, experience level, and salary expectations.
        
        Please respond with a valid JSON object in this exact format:
        {
          "recommendations": [
            {
              "jobId": "job_id_here",
              "matchScore": 85,
              "reason": "Brief explanation of why this job matches"
            }
          ]
        }
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Clean the response text to extract JSON
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      // Fallback if JSON parsing fails
      return {
        recommendations: availableJobs.slice(0, 3).map((job, index) => ({
          jobId: job.id,
          matchScore: 75 + (index * 5),
          reason: `Good match based on job category and location`
        }))
      };
    } catch (error) {
      console.error('Gemini job recommendation error:', error);
      // Return fallback recommendations instead of null
      return {
        recommendations: availableJobs.slice(0, 3).map((job, index) => ({
          jobId: job.id,
          matchScore: 70 + (index * 5),
          reason: `Recommended based on your profile`
        }))
      };
    }
  }

  async generateJobDescription(category: string, requirements: string) {
    try {
      const prompt = `
        Generate a professional job description for a ${category} position with these requirements: ${requirements}
        
        Include:
        - Clear job responsibilities
        - Required skills and experience
        - Working conditions
        - What the worker can expect
        
        Keep it concise but informative, suitable for daily wage workers.
        Write in simple, clear language.
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Gemini job description error:', error);
      // Return a fallback description
      return `We are looking for a skilled ${category} to join our team. 

Requirements: ${requirements}

Responsibilities:
- Perform ${category.toLowerCase()} duties as assigned
- Maintain quality standards
- Follow safety protocols
- Work collaboratively with team members

What we offer:
- Competitive daily wages
- Safe working environment
- Opportunity for skill development

Apply now if you have the required skills and experience!`;
    }
  }

  async analyzeWorkerProfile(profileData: any) {
    try {
      const prompt = `
        Analyze this worker profile and provide suggestions for improvement:
        
        Profile:
        - Name: ${profileData.name}
        - Experience: ${profileData.experience || 'Not specified'}
        - Bio: ${profileData.bio || 'Not provided'}
        - Phone: ${profileData.phone ? 'Provided' : 'Missing'}
        
        Please respond with a valid JSON object in this format:
        {
          "completenessScore": 75,
          "suggestions": ["Add more details about your experience", "Include specific skills"],
          "skillsToHighlight": ["Reliability", "Hard work"],
          "tips": ["Add a professional photo", "Write a compelling bio"]
        }
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Clean the response text to extract JSON
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      // Fallback response
      return {
        completenessScore: 60,
        suggestions: ["Add more details about your work experience", "Include your skills and specializations"],
        skillsToHighlight: ["Reliability", "Punctuality", "Hard work"],
        tips: ["Write a brief bio about yourself", "Add your contact information"]
      };
    } catch (error) {
      console.error('Gemini profile analysis error:', error);
      return {
        completenessScore: 50,
        suggestions: ["Complete your profile with more details"],
        skillsToHighlight: ["Work experience", "Skills"],
        tips: ["Add a profile photo", "Write about your experience"]
      };
    }
  }

  async generateApplicationMessage(jobDetails: any, workerProfile: any) {
    try {
      const prompt = `
        Generate a personalized application message for this worker applying to this job:
        
        Job: ${jobDetails.category} at ${jobDetails.organizationName}
        Job Description: ${jobDetails.description}
        Salary: ₹${jobDetails.salary}/day
        
        Worker: ${workerProfile.name}
        Experience: ${workerProfile.experience || 0} years
        Bio: ${workerProfile.bio || 'Hardworking individual'}
        
        Create a professional but friendly application message that:
        - Shows enthusiasm for the role
        - Highlights relevant experience
        - Mentions availability
        - Keeps it concise (2-3 sentences)
        
        Write in simple, respectful language appropriate for the Indian job market.
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Gemini application message error:', error);
      // Return a fallback message
      return `Dear Sir/Madam,

I am interested in the ${jobDetails.category} position at ${jobDetails.organizationName}. I have ${workerProfile.experience || 'relevant'} experience and am available to start immediately. I am hardworking, reliable, and committed to doing quality work.

Thank you for considering my application.

Best regards,
${workerProfile.name}`;
    }
  }

  async translateContent(text: string, targetLanguage: string) {
    try {
      const languageMap = {
        'hi': 'Hindi',
        'mr': 'Marathi',
        'pa': 'Punjabi',
        'gu': 'Gujarati',
        'bn': 'Bengali',
        'te': 'Telugu',
        'kn': 'Kannada',
        'bh': 'Bhojpuri'
      };

      const prompt = `
        Translate this text to ${languageMap[targetLanguage] || targetLanguage}:
        "${text}"
        
        Keep the translation natural and appropriate for daily wage workers.
        Maintain the original meaning and tone.
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Gemini translation error:', error);
      return text; // Return original text if translation fails
    }
  }

  async generateWorkReport(attendanceData: any, workerName: string, period: string) {
    try {
      const workDays = Object.values(attendanceData).filter(status => status === 'present').length;
      const totalDays = Object.keys(attendanceData).length;
      
      const prompt = `
        Generate a work performance report for ${workerName} for ${period}:
        
        Attendance Data:
        - Total working days: ${totalDays}
        - Days present: ${workDays}
        - Days absent: ${totalDays - workDays}
        - Attendance rate: ${((workDays / totalDays) * 100).toFixed(1)}%
        
        Create a brief, positive report that:
        - Summarizes attendance performance
        - Highlights reliability
        - Provides constructive feedback
        - Suggests areas for improvement if needed
        
        Keep it professional but encouraging.
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Gemini work report error:', error);
      // Return a fallback report
      const attendanceRate = totalDays > 0 ? ((workDays / totalDays) * 100).toFixed(1) : 0;
      return `Work Performance Report for ${workerName}

Period: ${period}
Attendance Rate: ${attendanceRate}%
Days Present: ${workDays} out of ${totalDays}

${attendanceRate >= 90 ? 'Excellent attendance record!' : 
  attendanceRate >= 75 ? 'Good attendance with room for improvement.' : 
  'Attendance needs improvement for better performance.'}

${workerName} shows commitment to work and maintains professional standards.`;
    }
  }

  async chatWithAI(message: string, context: string = '') {
    try {
      const prompt = `
        You are a helpful assistant for ROZGAR, a daily wage job app in India.
        Context: ${context}
        
        User message: ${message}
        
        Provide helpful, accurate information about:
        - Finding daily wage jobs
        - Job application tips
        - Worker rights and safety
        - Payment and wage information
        - App features and usage
        
        Keep responses concise, practical, and supportive.
        Use simple language appropriate for daily wage workers.
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Gemini chat error:', error);
      return "I'm sorry, I couldn't process your request right now. Please try again later.";
    }
  }
}

export const geminiService = new GeminiService();