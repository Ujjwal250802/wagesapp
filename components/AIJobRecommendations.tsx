import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Sparkles, ChevronRight, MapPin, DollarSign } from 'lucide-react-native';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { geminiService } from '../services/GeminiService';
import { router } from 'expo-router';

interface AIJobRecommendationsProps {
  workerProfile: any;
  availableJobs: any[];
}

export default function AIJobRecommendations({ workerProfile, availableJobs }: AIJobRecommendationsProps) {
  const { colors } = useTheme();
  const { t } = useLanguage();
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (workerProfile && availableJobs.length > 0) {
      getRecommendations();
    }
  }, [workerProfile, availableJobs]);

  const getRecommendations = async () => {
    setLoading(true);
    try {
      const result = await geminiService.getJobRecommendations(workerProfile, availableJobs);
      if (result && result.recommendations) {
        setRecommendations(result.recommendations);
      }
    } catch (error) {
      console.error('Error getting AI recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.surface }]}>
        <View style={styles.header}>
          <Sparkles size={20} color={colors.primary} />
          <Text style={[styles.title, { color: colors.text }]}>AI Recommendations</Text>
        </View>
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
          Finding perfect jobs for you...
        </Text>
      </View>
    );
  }

  if (recommendations.length === 0) {
    return null;
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      <View style={styles.header}>
        <Sparkles size={20} color={colors.primary} />
        <Text style={[styles.title, { color: colors.text }]}>AI Recommended Jobs</Text>
      </View>
      
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scrollView}>
        {recommendations.map((rec, index) => {
          const job = availableJobs.find(j => j.id === rec.jobId);
          if (!job) return null;
          
          return (
            <TouchableOpacity
              key={index}
              style={[styles.recommendationCard, { backgroundColor: colors.background }]}
              onPress={() => router.push(`/job-details/${job.id}`)}
            >
              <Text style={[styles.jobTitle, { color: colors.text }]}>{job.category}</Text>
              <Text style={[styles.organizationName, { color: colors.textSecondary }]}>
                {job.organizationName}
              </Text>
              
              <View style={styles.jobDetails}>
                <View style={styles.detailRow}>
                  <MapPin size={14} color={colors.textSecondary} />
                  <Text style={[styles.detailText, { color: colors.textSecondary }]}>
                    {job.location}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <DollarSign size={14} color={colors.success} />
                  <Text style={[styles.salaryText, { color: colors.success }]}>
                    ₹{job.salary}/day
                  </Text>
                </View>
              </View>
              
              <Text style={[styles.matchReason, { color: colors.primary }]}>
                {rec.reason}
              </Text>
              
              <View style={styles.matchScore}>
                <Text style={[styles.matchText, { color: colors.text }]}>
                  {rec.matchScore}% Match
                </Text>
                <ChevronRight size={16} color={colors.primary} />
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    margin: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
  },
  loadingText: {
    fontSize: 14,
    textAlign: 'center',
    padding: 20,
  },
  scrollView: {
    marginHorizontal: -8,
  },
  recommendationCard: {
    width: 280,
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  jobTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  organizationName: {
    fontSize: 14,
    marginBottom: 12,
  },
  jobDetails: {
    gap: 6,
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailText: {
    fontSize: 12,
  },
  salaryText: {
    fontSize: 12,
    fontWeight: '600',
  },
  matchReason: {
    fontSize: 12,
    marginBottom: 12,
    lineHeight: 16,
  },
  matchScore: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  matchText: {
    fontSize: 12,
    fontWeight: '600',
  },
});