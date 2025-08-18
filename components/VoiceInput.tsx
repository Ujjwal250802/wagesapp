import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Mic, MicOff, Volume2, Wand as Wand2 } from 'lucide-react-native';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { voiceService } from '../services/VoiceService';

interface VoiceInputProps {
  onTextReceived: (text: string) => void;
  context: 'job_posting' | 'application';
  placeholder?: string;
}

export default function VoiceInput({ onTextReceived, context, placeholder }: VoiceInputProps) {
  const { colors } = useTheme();
  const { t } = useLanguage();
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleStartRecording = async () => {
    try {
      const success = await voiceService.startRecording();
      if (success) {
        setIsRecording(true);
        voiceService.speak('Recording started. Speak now.');
      } else {
        Alert.alert('Error', 'Failed to start recording. Please check microphone permissions.');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to start voice recording');
    }
  };

  const handleStopRecording = async () => {
    try {
      setIsRecording(false);
      setIsProcessing(true);
      
      const result = await voiceService.stopRecording();
      
      if (result.success && result.text) {
        // Enhance the transcribed text with AI
        const enhancedText = await voiceService.enhanceWithAI(result.text, context);
        onTextReceived(enhancedText);
        voiceService.speak('Text processed and enhanced successfully.');
      } else {
        Alert.alert('Error', result.error || 'Failed to process voice input');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to process voice recording');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleVoiceToggle = () => {
    if (isRecording) {
      handleStopRecording();
    } else {
      handleStartRecording();
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Volume2 size={16} color={colors.textSecondary} />
        </View>
        <Text style={[styles.label, { color: colors.text }]}>
          {isRecording ? 'Recording...' : isProcessing ? 'Processing...' : 'Voice Input'}
        </Text>
        <Text style={[styles.description, { color: colors.textSecondary }]}>
          {placeholder || 'Tap to speak and AI will enhance your text'}
        </Text>
      </View>
      
      <TouchableOpacity
        style={[
          styles.recordButton,
          { 
            backgroundColor: isRecording ? colors.error : colors.primary,
            opacity: isProcessing ? 0.6 : 1,
          }
        ]}
        onPress={handleVoiceToggle}
        disabled={isProcessing}
      >
        {isProcessing ? (
          <Wand2 size={24} color="#FFFFFF" />
        ) : isRecording ? (
          <MicOff size={24} color="#FFFFFF" />
        ) : (
          <Mic size={24} color="#FFFFFF" />
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  content: {
    flex: 1,
  },
  iconContainer: {
    marginBottom: 4,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  description: {
    fontSize: 12,
    lineHeight: 16,
  },
  recordButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
});