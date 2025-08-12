import { View, Text, TouchableOpacity, StyleSheet, Image, Dimensions } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Briefcase, Users } from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

export default function Welcome() {
  return (
    <LinearGradient colors={['#2563EB', '#1D4ED8']} style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Briefcase size={60} color="#FFFFFF" />
          <Text style={styles.title}>WorkConnect</Text>
          <Text style={styles.subtitle}>Connecting Daily Wage Workers with Opportunities</Text>
        </View>
        
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={[styles.button, styles.workerButton]}
            onPress={() => router.push('/auth/worker-auth')}
          >
            <Users size={24} color="#2563EB" />
            <Text style={[styles.buttonText, styles.workerButtonText]}>I'm Looking for Work</Text>
            <Text style={styles.buttonSubtext}>Find daily wage jobs near you</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.button, styles.organizationButton]}
            onPress={() => router.push('/auth/organization-auth')}
          >
            <Briefcase size={24} color="#FFFFFF" />
            <Text style={[styles.buttonText, styles.organizationButtonText]}>I'm an Employer</Text>
            <Text style={[styles.buttonSubtext, { color: '#E5E7EB' }]}>Post jobs and hire workers</Text>
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