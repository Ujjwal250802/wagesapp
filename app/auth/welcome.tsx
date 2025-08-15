import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Briefcase, Users } from 'lucide-react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import ThemeToggle from '../../components/ThemeToggle';
import LanguageSelector from '../../components/LanguageSelector';

const { width, height } = Dimensions.get('window');

export default function Welcome() {
  const { colors } = useTheme();
  const { t } = useLanguage();

  return (
    <LinearGradient colors={[colors.primary, '#1D4ED8']} style={styles.container}>
      <View style={styles.topControls}>
        <LanguageSelector />
        <ThemeToggle />
      </View>
      
      <View style={styles.content}>
        <View style={styles.header}>
          <Briefcase size={60} color="#FFFFFF" />
          <Text style={styles.title}>{t('appName')}</Text>
          <Text style={styles.subtitle}>{t('appSubtitle')}</Text>
        </View>
        
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={[styles.button, styles.workerButton]}
            onPress={() => router.push('/auth/worker-auth')}
          >
            <Users size={24} color="#2563EB" />
            <Text style={[styles.buttonText, styles.workerButtonText]}>{t('lookingForWork')}</Text>
            <Text style={styles.buttonSubtext}>{t('findJobsSubtext')}</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.button, styles.organizationButton]}
            onPress={() => router.push('/auth/organization-auth')}
          >
            <Briefcase size={24} color="#FFFFFF" />
            <Text style={[styles.buttonText, styles.organizationButtonText]}>{t('employer')}</Text>
            <Text style={[styles.buttonSubtext, { color: '#E5E7EB' }]}>{t('postJobsSubtext')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 60,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 20,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#E5E7EB',
    textAlign: 'center',
    lineHeight: 22,
  },
  buttonContainer: {
    width: '100%',
    gap: 16,
  },
  button: {
    paddingVertical: 20,
    paddingHorizontal: 24,
    borderRadius: 16,
    alignItems: 'center',
    flexDirection: 'column',
    gap: 8,
  },
  workerButton: {
    backgroundColor: '#FFFFFF',
  },
  organizationButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '600',
  },
  workerButtonText: {
    color: '#2563EB',
  },
  organizationButtonText: {
    color: '#FFFFFF',
  },
  buttonSubtext: {
    fontSize: 14,
    color: '#6B7280',
  },
});