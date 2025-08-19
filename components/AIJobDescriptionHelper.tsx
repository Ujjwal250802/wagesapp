import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Modal } from 'react-native';
import { Sparkles, X, Copy } from 'lucide-react-native';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { geminiService } from '../services/GeminiService';

interface AIJobDescriptionHelperProps {
  visible: boolean;
  onClose: () => void;
  category: string;
  onDescriptionGenerated: (description: string) => void;
}

export default function AIJobDescriptionHelper({ 
  visible, 
  onClose, 
  category, 
  onDescriptionGenerated 
}: AIJobDescriptionHelperProps) {
  const { colors } = useTheme();
  const { t } = useLanguage();
  const [requirements, setRequirements] = useState('');
  const [generatedDescription, setGeneratedDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const generateDescription = async () => {
    if (!requirements.trim()) return;
    
    setLoading(true);
    try {
      const description = await geminiService.generateJobDescription(category, requirements);
      if (description) {
        setGeneratedDescription(description);
      }
    } catch (error) {
      console.error('Error generating description:', error);
    } finally {
      setLoading(false);
    }
  };

  const useDescription = () => {
    onDescriptionGenerated(generatedDescription);
    onClose();
    setRequirements('');
    setGeneratedDescription('');
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
          <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
            <View style={styles.headerLeft}>
              <Sparkles size={20} color={colors.primary} />
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                AI Job Description
              </Text>
            </View>
            <TouchableOpacity onPress={onClose}>
              <X size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <View style={styles.modalBody}>
            <Text style={[styles.categoryText, { color: colors.text }]}>
              Creating description for: {category}
            </Text>
            
            <Text style={[styles.label, { color: colors.text }]}>
              What are your specific requirements?
            </Text>
            <TextInput
              style={[styles.input, { 
                backgroundColor: colors.background, 
                borderColor: colors.border,
                color: colors.text 
              }]}
              placeholder="e.g., 2+ years experience, own tools, flexible hours..."
              placeholderTextColor={colors.textSecondary}
              value={requirements}
              onChangeText={setRequirements}
              multiline
              numberOfLines={3}
            />

            <TouchableOpacity
              style={[styles.generateButton, { 
                backgroundColor: colors.primary,
                opacity: loading || !requirements.trim() ? 0.5 : 1 
              }]}
              onPress={generateDescription}
              disabled={loading || !requirements.trim()}
            >
              <Sparkles size={16} color="#FFFFFF" />
              <Text style={styles.generateButtonText}>
                {loading ? 'Generating...' : 'Generate Description'}
              </Text>
            </TouchableOpacity>

            {generatedDescription && (
              <View style={[styles.resultContainer, { backgroundColor: colors.background }]}>
                <Text style={[styles.resultLabel, { color: colors.text }]}>
                  Generated Description:
                </Text>
                <Text style={[styles.resultText, { color: colors.text }]}>
                  {generatedDescription}
                </Text>
                
                <View style={styles.resultActions}>
                  <TouchableOpacity
                    style={[styles.useButton, { backgroundColor: colors.success }]}
                    onPress={useDescription}
                  >
                    <Text style={styles.useButtonText}>Use This Description</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[styles.regenerateButton, { borderColor: colors.border }]}
                    onPress={generateDescription}
                  >
                    <Text style={[styles.regenerateButtonText, { color: colors.primary }]}>
                      Regenerate
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
    borderRadius: 16,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  modalBody: {
    padding: 20,
  },
  categoryText: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    textAlignVertical: 'top',
    marginBottom: 16,
  },
  generateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
    marginBottom: 16,
  },
  generateButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  resultContainer: {
    padding: 16,
    borderRadius: 8,
  },
  resultLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  resultText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  resultActions: {
    flexDirection: 'row',
    gap: 12,
  },
  useButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  useButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  regenerateButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center',
    borderWidth: 1,
  },
  regenerateButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
});