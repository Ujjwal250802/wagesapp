import * as Speech from 'expo-speech';
import { Audio } from 'expo-av';
import { Platform } from 'react-native';
import { geminiService } from './GeminiService';

export interface VoiceRecordingResult {
  success: boolean;
  text?: string;
  error?: string;
}

class VoiceService {
  private recording: Audio.Recording | null = null;
  private isRecording = false;

  async requestPermissions(): Promise<boolean> {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('Permission request error:', error);
      return false;
    }
  }

  async startRecording(): Promise<boolean> {
    try {
      if (this.isRecording) {
        return false;
      }

      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        return false;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      this.recording = recording;
      this.isRecording = true;
      return true;
    } catch (error) {
      console.error('Start recording error:', error);
      return false;
    }
  }

  async stopRecording(): Promise<VoiceRecordingResult> {
    try {
      if (!this.recording || !this.isRecording) {
        return { success: false, error: 'No active recording' };
      }

      await this.recording.stopAndUnloadAsync();
      const uri = this.recording.getURI();
      this.isRecording = false;
      this.recording = null;

      if (!uri) {
        return { success: false, error: 'Failed to get recording' };
      }

      // For demo purposes, simulate speech-to-text conversion
      // In a real implementation, you would send the audio to a speech-to-text service
      const simulatedText = await this.simulateSpeechToText();
      
      return {
        success: true,
        text: simulatedText
      };
    } catch (error) {
      console.error('Stop recording error:', error);
      this.isRecording = false;
      this.recording = null;
      return { success: false, error: 'Failed to process recording' };
    }
  }

  private async simulateSpeechToText(): Promise<string> {
    // Simulate speech-to-text with sample responses
    const sampleTexts = [
      "I need a plumber for fixing pipes in my building. The work should be completed within 2 days.",
      "Looking for an electrician to install new wiring. Must have 3 years experience.",
      "Need a cook for our restaurant. Should know Indian cuisine and work morning shift.",
      "Hiring security guard for night shift. Must be reliable and have good communication skills."
    ];
    
    return sampleTexts[Math.floor(Math.random() * sampleTexts.length)];
  }

  async enhanceWithAI(text: string, context: 'job_posting' | 'application'): Promise<string> {
    try {
      return await geminiService.transcribeAndEnhance(text, context);
    } catch (error) {
      console.error('AI enhancement error:', error);
      return text;
    }
  }

  speak(text: string): void {
    Speech.speak(text, {
      language: 'en-IN',
      pitch: 1.0,
      rate: 0.8,
    });
  }

  stop(): void {
    Speech.stop();
  }

  getAvailableLanguages(): Promise<Speech.Voice[]> {
    return Speech.getAvailableVoicesAsync();
  }
}

export const voiceService = new VoiceService();