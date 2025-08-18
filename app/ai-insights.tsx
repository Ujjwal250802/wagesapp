import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { router } from 'expo-router';
import { ArrowLeft, Brain, TrendingUp, Users, Briefcase, DollarSign } from 'lucide-react-native';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { auth, db } from '../firebase-config';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { geminiService } from '../services/GeminiService';

export default function AIInsights() {
  const { colors } = useTheme();
  const { t } = useLanguage();
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalJobs: 0,
    totalApplications: 0,
    totalWorkers: 0,
    totalPayments: 0,
  });

  useEffect(() => {
    fetchDataAndGenerateInsights();
  }, []);

  const fetchDataAndGenerateInsights = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      // Fetch organization stats
      const jobsQuery = query(collection(db, 'jobs'), where('postedBy', '==', user.uid));
      const jobsSnapshot = await getDocs(jobsQuery);
      const jobs = jobsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const jobIds = jobs.map(job => job.id);

      let applications = [];
      let payments = [];

      if (jobIds.length > 0) {
        const applicationsQuery = query(collection(db, 'applications'), where('jobId', 'in', jobIds));
        const applicationsSnapshot = await getDocs(applicationsQuery);
        applications = applicationsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        const paymentsQuery = query(collection(db, 'payments'), where('employerId', '==', user.uid));
        const paymentsSnapshot = await getDocs(paymentsQuery);
        payments = paymentsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      }

      const acceptedWorkers = applications.filter(app => app.status === 'accepted');

      setStats({
        totalJobs: jobs.length,
        totalApplications: applications.length,
        totalWorkers: acceptedWorkers.length,
        totalPayments: payments.length,
      });

      // Generate AI insights
      await generateBusinessInsights(jobs, applications, payments);
    } catch (error) {
      console.error('Error fetching data:', error);
      Alert.alert('Error', 'Failed to load insights');
    } finally {
      setLoading(false);
    }
  };

  const generateBusinessInsights = async (jobs, applications, payments) => {
    try {
      const businessData = {
        jobsPosted: jobs.length,
        totalApplications: applications.length,
        acceptanceRate: applications.length > 0 ? (applications.filter(app => app.status === 'accepted').length / applications.length) * 100 : 0,
        popularCategories: getPopularCategories(jobs),
        averageSalary: jobs.length > 0 ? jobs.reduce((sum, job) => sum + job.salary, 0) / jobs.length : 0,
        totalPaymentsMade: payments.reduce((sum, payment) => sum + payment.amount, 0),
        averageWorkDays: payments.length > 0 ? payments.reduce((sum, payment) => sum + (payment.workDays || 0), 0) / payments.length : 0,
      };

      const analysisText = await geminiService.analyzePerformance(businessData, {
        name: 'Organization',
        type: 'employer',
        businessData: true,
      });

      setInsights(analysisText);
    } catch (error) {
      console.error('Error generating insights:', error);
      setInsights('Unable to generate insights at this time.');
    }
  };

  const getPopularCategories = (jobs) => {
    const categoryCount = {};
    jobs.forEach(job => {
      categoryCount[job.category] = (categoryCount[job.category] || 0) + 1;
    });
    
    return Object.entries(categoryCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([category, count]) => ({ category, count }));
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <Brain size={48} color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.text }]}>
          AI is analyzing your business data...
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.surface }]}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color={colors.primary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          AI Business Insights
        </Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={[styles.statsGrid, { backgroundColor: colors.surface }]}>
          <View style={styles.statCard}>
            <Briefcase size={24} color="#2563EB" />
            <Text style={[styles.statValue, { color: colors.text }]}>{stats.totalJobs}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Jobs Posted</Text>
          </View>
          
          <View style={styles.statCard}>
            <Users size={24} color="#16A34A" />
            <Text style={[styles.statValue, { color: colors.text }]}>{stats.totalApplications}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Applications</Text>
          </View>
          
          <View style={styles.statCard}>
            <TrendingUp size={24} color="#F59E0B" />
            <Text style={[styles.statValue, { color: colors.text }]}>{stats.totalWorkers}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Active Workers</Text>
          </View>
          
          <View style={styles.statCard}>
            <DollarSign size={24} color="#8B5CF6" />
            <Text style={[styles.statValue, { color: colors.text }]}>{stats.totalPayments}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Payments Made</Text>
          </View>
        </View>

        <View style={[styles.insightsCard, { backgroundColor: colors.surface }]}>
          <View style={styles.insightsHeader}>
            <Brain size={24} color={colors.primary} />
            <Text style={[styles.insightsTitle, { color: colors.text }]}>
              AI-Generated Business Insights
            </Text>
          </View>
          
          {insights ? (
            <Text style={[styles.insightsText, { color: colors.textSecondary }]}>
              {insights}
            </Text>
          ) : (
            <Text style={[styles.noInsightsText, { color: colors.textSecondary }]}>
              Post more jobs and manage workers to get detailed AI insights about your business performance.
            </Text>
          )}
        </View>

        <TouchableOpacity
          style={[styles.refreshButton, { backgroundColor: colors.primary }]}
          onPress={fetchDataAndGenerateInsights}
          disabled={loading}
        >
          <Brain size={20} color="#FFFFFF" />
          <Text style={styles.refreshButtonText}>
            {loading ? 'Generating Insights...' : 'Refresh AI Analysis'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  backButton: {
    padding: 8,
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    gap: 16,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    padding: 12,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
  insightsCard: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  insightsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  insightsTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  insightsText: {
    fontSize: 14,
    lineHeight: 22,
  },
  noInsightsText: {
    fontSize: 14,
    lineHeight: 22,
    fontStyle: 'italic',
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  refreshButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    fontSize: 16,
    marginTop: 16,
    textAlign: 'center',
  },
});