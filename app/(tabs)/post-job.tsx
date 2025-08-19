import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, Switch } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { collection, addDoc } from 'firebase/firestore';
import { auth, db } from '../../firebase-config';
import { Building, Mail, Phone, MapPin, DollarSign, FileText, Briefcase, Navigation } from 'lucide-react-native';
import * as Location from 'expo-location';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import ThemeToggle from '../../components/ThemeToggle';
import LanguageSelector from '../../components/LanguageSelector';
import AIJobDescriptionHelper from '../../components/AIJobDescriptionHelper';

const JOB_CATEGORIES = [
  'Electrician', 'Plumber', 'Mechanic', 'Cook', 'Peon', 
  'Driver', 'House Keeping', 'Construction Site Workers', 'Security Guard'
];

export default function PostJob() {
  const { colors } = useTheme();
  const { t } = useLanguage();
  const [organizationName, setOrganizationName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [salary, setSalary] = useState('');
  const [loading, setLoading] = useState(false);
  const [useCurrentLocation, setUseCurrentLocation] = useState(false);
  const [coordinates, setCoordinates] = useState(null);
  const [gettingLocation, setGettingLocation] = useState(false);
  const [aiHelperVisible, setAiHelperVisible] = useState(false);

  const getCurrentLocation = async () => {
    setGettingLocation(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Location permission is required to use current location');
        setUseCurrentLocation(false);
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({});
      const address = await Location.reverseGeocodeAsync({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
      });

      if (address.length > 0) {
        const addr = address[0];
        const fullAddress = `${addr.street || ''} ${addr.city || ''} ${addr.region || ''} ${addr.postalCode || ''}`.trim();
        setLocation(fullAddress);
        setCoordinates({
          latitude: currentLocation.coords.latitude,
          longitude: currentLocation.coords.longitude,
        });
        Alert.alert('Success', 'Current location added successfully!');
      }
    } catch (error) {
      console.error('Location error:', error);
      Alert.alert('Error', 'Failed to get current location');
      setUseCurrentLocation(false);
    } finally {
      setGettingLocation(false);
    }
  };

  const handlePostJob = async () => {
    if (!organizationName || !email || !phone || !category || !description || !location || !salary) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      await addDoc(collection(db, 'jobs'), {
        organizationName,
        email,
        phone,
        category,
        description,
        location,
        salary: parseInt(salary),
        coordinates: coordinates,
        language: t('language') || 'en', // Store the language the job was posted in
        createdAt: new Date(),
        postedBy: auth.currentUser?.uid || 'anonymous',
      });

      Alert.alert('Success', 'Job posted successfully!', [
        { text: 'OK', onPress: resetForm }
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to post job. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setOrganizationName('');
    setEmail('');
    setPhone('');
    setCategory('');
    setDescription('');
    setLocation('');
    setSalary('');
    setUseCurrentLocation(false);
    setCoordinates(null);
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.surface }]}>
        <View style={styles.headerTop}>
          <View style={styles.headerContent}>
            <Text style={[styles.headerTitle, { color: colors.text }]}>{t('postAJob')}</Text>
            <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>{t('findRightWorker')}</Text>
          </View>
          <View style={styles.headerControls}>
            <LanguageSelector />
            <ThemeToggle />
          </View>
        </View>
      </View>
      
      <AIJobDescriptionHelper
        visible={aiHelperVisible}
        onClose={() => setAiHelperVisible(false)}
        category={category}
        onDescriptionGenerated={setDescription}
      />

      <View style={styles.form}>
        <View style={[styles.inputContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Building size={20} color={colors.textSecondary} style={styles.inputIcon} />
          <TextInput
            style={[styles.input, { color: colors.text }]}
            placeholder={t('organizationName')}
            placeholderTextColor={colors.textSecondary}
            value={organizationName}
            onChangeText={setOrganizationName}
            autoCapitalize="words"
          />
        </View>

        <View style={[styles.inputContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Mail size={20} color={colors.textSecondary} style={styles.inputIcon} />
          <TextInput
            style={[styles.input, { color: colors.text }]}
            placeholder={t('contactEmail')}
            placeholderTextColor={colors.textSecondary}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View style={[styles.inputContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Phone size={20} color={colors.textSecondary} style={styles.inputIcon} />
          <TextInput
            style={[styles.input, { color: colors.text }]}
            placeholder={t('contactNumber')}
            placeholderTextColor={colors.textSecondary}
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />
        </View>

        <View style={[styles.pickerContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Briefcase size={20} color={colors.textSecondary} style={styles.inputIcon} />
          <Picker
            selectedValue={category}
            onValueChange={setCategory}
            style={[styles.picker, { color: colors.text }]}
          >
            <Picker.Item label={t('selectJobCategory')} value="" />
            {JOB_CATEGORIES.map((cat) => (
              <Picker.Item key={cat} label={t(cat.toLowerCase().replace(/\s+/g, ''))} value={cat} />
            ))}
          </Picker>
        </View>

        <View style={[styles.inputContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <MapPin size={20} color={colors.textSecondary} style={styles.inputIcon} />
          <TextInput
            style={[styles.input, { color: colors.text }]}
            placeholder={t('jobLocation')}
            placeholderTextColor={colors.textSecondary}
            value={location}
            onChangeText={setLocation}
            autoCapitalize="words"
          />
        </View>

        <View style={[styles.locationToggleContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.toggleRow}>
            <Navigation size={20} color={colors.textSecondary} />
            <Text style={[styles.toggleLabel, { color: colors.text }]}>
              {gettingLocation ? t('loading') : t('useCurrentLocation')}
            </Text>
            <Switch
              value={useCurrentLocation}
              onValueChange={(value) => {
                setUseCurrentLocation(value);
                if (value) {
                  getCurrentLocation();
                } else {
                  setCoordinates(null);
                }
              }}
              disabled={gettingLocation}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={useCurrentLocation ? '#FFFFFF' : '#F3F4F6'}
            />
          </View>
          
          <TouchableOpacity
            style={[styles.aiHelperButton, { backgroundColor: colors.background, borderColor: colors.primary }]}
            onPress={() => setAiHelperVisible(true)}
          >
            <Text style={[styles.aiHelperButtonText, { color: colors.primary }]}>
              ✨ Get AI Help with Description
            </Text>
          </TouchableOpacity>
          {coordinates && (
            <View style={[styles.coordinatesDisplay, { backgroundColor: colors.background }]}>
              <Text style={[styles.coordinatesText, { color: colors.primary }]}>
                📍 Location saved: {coordinates.latitude.toFixed(4)}, {coordinates.longitude.toFixed(4)}
              </Text>
            </View>
          )}
        </View>

        <View style={[styles.inputContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <DollarSign size={20} color={colors.textSecondary} style={styles.inputIcon} />
          <TextInput
            style={[styles.input, { color: colors.text }]}
            placeholder={t('salaryPerDay')}
            placeholderTextColor={colors.textSecondary}
            value={salary}
            onChangeText={setSalary}
            keyboardType="numeric"
          />
        </View>

        <View style={[styles.inputContainer, styles.textAreaContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <FileText size={20} color={colors.textSecondary} style={[styles.inputIcon, styles.textAreaIcon]} />
          <TextInput
            style={[styles.input, styles.textArea, { color: colors.text }]}
            placeholder={t('jobDescriptionPlaceholder')}
            placeholderTextColor={colors.textSecondary}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        <TouchableOpacity 
          style={[styles.postButton, { backgroundColor: colors.secondary }]}
          onPress={handlePostJob}
          disabled={loading}
        >
          <Text style={styles.postButtonText}>
            {loading ? t('postingJob') : t('postJobButton')}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingTop: 60,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerContent: {
    flex: 1,
  },
  headerControls: {
    flexDirection: 'row',
    gap: 12,
    marginLeft: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    fontSize: 16,
    marginTop: 4,
  },
  form: {
    padding: 20,
    gap: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
  },
  textAreaContainer: {
    alignItems: 'flex-start',
    paddingTop: 16,
  },
  inputIcon: {
    marginRight: 12,
  },
  textAreaIcon: {
    marginTop: 4,
  },
  input: {
    flex: 1,
    height: 56,
    fontSize: 16,
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
  },
  picker: {
    flex: 1,
    height: 56,
  },
  postButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  postButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  locationToggleContainer: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  toggleLabel: {
    flex: 1,
    fontSize: 16,
  },
  coordinatesDisplay: {
    marginTop: 8,
    padding: 8,
    borderRadius: 6,
  },
  coordinatesText: {
    fontSize: 12,
    fontFamily: 'monospace',
  },
  aiHelperButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    marginBottom: 16,
  },
  aiHelperButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
});