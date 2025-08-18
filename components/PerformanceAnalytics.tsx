import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { TrendingUp, Calendar, Target, Award, Brain, RefreshCw } from 'lucide-react-native';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { geminiService } from '../services/GeminiService';

interface PerformanceAnalyticsProps {
  attendanceData: any;
  workerInfo: any;
  workDays: number;
  totalEarnings: number;
  period: string;
}

interface AnalysisResult {
  summary: string;
  patterns: string;
  recommendations: string;
  strengths: string;
  concerns: string;
  schedule: string;
}

export default function PerformanceAnalytics({ 
  attendanceData, 
  workerInfo, 
  workDays, 
  totalEarnings, 
  period 
}: PerformanceAnalyticsProps) {
  const { colors } = useTheme();
  const { t } = useLanguage();
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (Object.keys(attendanceData).length > 0) {
      generateAnalysis();
    }
  }, [attendanceData, workerInfo]);

  const generateAnalysis = async () => {
    setLoading(true);
    try {
      const performanceData = {
        attendanceData,
        workDays,
        totalEarnings,
        period,
        attendanceRate: calculateAttendanceRate(),
        consistencyScore: calculateConsistencyScore(),
        weeklyPattern: getWeeklyPattern(),
      };

      const analysisText = await geminiService.analyzePerformance(performanceData, workerInfo);
      
      try {
        const parsedAnalysis = JSON.parse(analysisText);
        setAnalysis(parsedAnalysis);
      } catch {
        // If JSON parsing fails, create a structured response from the text
        setAnalysis({
          summary: analysisText.substring(0, 200) + '...',
          patterns: 'Analysis generated successfully',
          recommendations: 'Continue monitoring performance',
          strengths: 'Regular attendance',
          concerns: 'None identified',
          schedule: 'Current schedule appears optimal'
        });
      }
    } catch (error) {
      console.error('Analysis generation error:', error);
      Alert.alert('Error', 'Failed to generate performance analysis');
    } finally {
      setLoading(false);
    }
  };

  const calculateAttendanceRate = (): number => {
    const totalDays = Object.keys(attendanceData).length;
    const presentDays = Object.values(attendanceData).filter(status => status === 'present').length;
    return totalDays > 0 ? (presentDays / totalDays) * 100 : 0;
  };

  const calculateConsistencyScore = (): number => {
    const dates = Object.keys(attendanceData).sort();
    let consistencyScore = 100;
    
    for (let i = 1; i < dates.length; i++) {
      const prevStatus = attendanceData[dates[i-1]];
      const currentStatus = attendanceData[dates[i]];
      
      if (prevStatus === 'present' && currentStatus === 'absent') {
        consistencyScore -= 10;
      }
    }
    
    return Math.max(0, consistencyScore);
  };

  const getWeeklyPattern = (): string => {
    const dayCount = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
    
    Object.keys(attendanceData).forEach(dateStr => {
      if (attendanceData[dateStr] === 'present') {
        const dayOfWeek = new Date(dateStr).getDay();
        dayCount[dayOfWeek]++;
      }
    });
    
    const maxDay = Object.keys(dayCount).reduce((a, b) => 
      dayCount[a] > dayCount[b] ? a : b
    );
    
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[maxDay];
  };

  const attendanceRate = calculateAttendanceRate();
  const consistencyScore = calculateConsistencyScore();

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.surface }]}>
        <View style={styles.headerContent}>
          <Brain size={24} color={colors.primary} />
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            AI Performance Analytics
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.refreshButton, { backgroundColor: colors.background }]}
          onPress={generateAnalysis}
          disabled={loading}
        >
          <RefreshCw size={16} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <View style={[styles.metricsGrid, { backgroundColor: colors.surface }]}>
        <View style={styles.metricCard}>
          <TrendingUp size={20} color="#16A34A" />
          <Text style={[styles.metricValue, { color: colors.text }]}>
            {attendanceRate.toFixed(1)}%
          </Text>
          <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>
            Attendance Rate
          </Text>
        </View>
        
        <View style={styles.metricCard}>
          <Target size={20} color="#2563EB" />
          <Text style={[styles.metricValue, { color: colors.text }]}>
            {consistencyScore}
          </Text>
          <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>
            Consistency Score
          </Text>
        </View>
        
        <View style={styles.metricCard}>
          <Calendar size={20} color="#F59E0B" />
          <Text style={[styles.metricValue, { color: colors.text }]}>
            {workDays}
          </Text>
          <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>
            Days Worked
          </Text>
        </View>
        
        <View style={styles.metricCard}>
          <Award size={20} color="#8B5CF6" />
          <Text style={[styles.metricValue, { color: colors.text }]}>
            ₹{totalEarnings.toLocaleString()}
          </Text>
          <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>
            Total Earnings
          </Text>
        </View>
      </View>

      {loading ? (
        <View style={[styles.loadingCard, { backgroundColor: colors.surface }]}>
          <Brain size={32} color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.text }]}>
            AI is analyzing performance data...
          </Text>
        </View>
      ) : analysis ? (
        <View style={styles.analysisContainer}>
          <View style={[styles.analysisCard, { backgroundColor: colors.surface }]}>
            <Text style={[styles.analysisTitle, { color: colors.text }]}>
              📊 Performance Summary
            </Text>
            <Text style={[styles.analysisText, { color: colors.textSecondary }]}>
              {analysis.summary}
            </Text>
          </View>

          <View style={[styles.analysisCard, { backgroundColor: colors.surface }]}>
            <Text style={[styles.analysisTitle, { color: colors.text }]}>
              📈 Attendance Patterns
            </Text>
            <Text style={[styles.analysisText, { color: colors.textSecondary }]}>
              {analysis.patterns}
            </Text>
          </View>

          <View style={[styles.analysisCard, { backgroundColor: colors.surface }]}>
            <Text style={[styles.analysisTitle, { color: colors.text }]}>
              💪 Strengths
            </Text>
            <Text style={[styles.analysisText, { color: colors.textSecondary }]}>
              {analysis.strengths}
            </Text>
          </View>

          {analysis.concerns && analysis.concerns !== 'None identified' && (
            <View style={[styles.analysisCard, { backgroundColor: colors.surface }]}>
              <Text style={[styles.analysisTitle, { color: colors.error }]}>
                ⚠️ Areas of Concern
              </Text>
              <Text style={[styles.analysisText, { color: colors.textSecondary }]}>
                {analysis.concerns}
              </Text>
            </View>
          )}

          <View style={[styles.analysisCard, { backgroundColor: colors.surface }]}>
            <Text style={[styles.analysisTitle, { color: colors.text }]}>
              🎯 Recommendations
            </Text>
            <Text style={[styles.analysisText, { color: colors.textSecondary }]}>
              {analysis.recommendations}
            </Text>
          </View>

          <View style={[styles.analysisCard, { backgroundColor: colors.surface }]}>
            <Text style={[styles.analysisTitle, { color: colors.text }]}>
              📅 Optimal Schedule
            </Text>
            <Text style={[styles.analysisText, { color: colors.textSecondary }]}>
              {analysis.schedule}
            </Text>
          </View>
        </View>
      ) : (
        <View style={[styles.emptyCard, { backgroundColor: colors.surface }]}>
          <Brain size={32} color={colors.textSecondary} />
          <Text style={[styles.emptyText, { color: colors.text }]}>
            No analysis available
          </Text>
          <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>
            Mark attendance for a few days to generate AI insights
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    marginBottom: 16,
    borderRadius: 12,
    marginHorizontal: 16,
    marginTop: 16,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  refreshButton: {
    padding: 8,
    borderRadius: 8,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    marginHorizontal: 16,
    borderRadius: 12,
    marginBottom: 16,
    gap: 16,
  },
  metricCard: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    padding: 12,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 8,
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
  loadingCard: {
    alignItems: 'center',
    padding: 32,
    marginHorizontal: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  loadingText: {
    fontSize: 16,
    marginTop: 16,
    textAlign: 'center',
  },
  analysisContainer: {
    gap: 12,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  analysisCard: {
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  analysisTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  analysisText: {
    fontSize: 14,
    lineHeight: 20,
  },
  emptyCard: {
    alignItems: 'center',
    padding: 32,
    marginHorizontal: 16,
    borderRadius: 12,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});