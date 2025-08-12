import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { collection, addDoc } from 'firebase/firestore';
import { auth, db } from '../../firebase-config';
import { Building, Mail, Phone, MapPin, DollarSign, FileText, Briefcase } from 'lucide-react-native';

const JOB_CATEGORIES = [
  'Electrician', 'Plumber', 'Mechanic', 'Cook', 'Peon', 
  'Driver', 'House Keeping', 'Construction Site Workers', 'Security Guard'
];

export default function PostJob() {
  const [organizationName, setOrganizationName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [salary, setSalary] = useState('');
  const [loading, setLoading] = useState(false);

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
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Post a Job</Text>
        <Text style={styles.headerSubtitle}>Find the right worker for your needs</Text>
      </View>

      <View style={styles.form}>
        <View style={styles.inputContainer}>
          <Building size={20} color="#6B7280" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Organization Name"
            value={organizationName}
            onChangeText={setOrganizationName}
            autoCapitalize="words"
          />
        </View>

        <View style={styles.inputContainer}>
          <Mail size={20} color="#6B7280" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Contact Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.inputContainer}>
          <Phone size={20} color="#6B7280" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Contact Number"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />
        </View>

        <View style={styles.pickerContainer}>
          <Briefcase size={20} color="#6B7280" style={styles.inputIcon} />
          <Picker
            selectedValue={category}
            onValueChange={setCategory}
            style={styles.picker}
          >
            <Picker.Item label="Select Job Category" value="" />
            {JOB_CATEGORIES.map((cat) => (
              <Picker.Item key={cat} label={cat} value={cat} />
            ))}
          </Picker>
        </View>

        <View style={styles.inputContainer}>
          <MapPin size={20} color="#6B7280" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Job Location"
            value={location}
            onChangeText={setLocation}
            autoCapitalize="words"
          />
        </View>

        <View style={styles.inputContainer}>
          <DollarSign size={20} color="#6B7280" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Salary per day (₹)"
            value={salary}
            onChangeText={setSalary}
            keyboardType="numeric"
          />
        </View>

        <View style={[styles.inputContainer, styles.textAreaContainer]}>
          <FileText size={20} color="#6B7280" style={[styles.inputIcon, styles.textAreaIcon]} />
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Job Description (requirements, working hours, etc.)"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        <TouchableOpacity 
          style={styles.postButton}
          onPress={handlePostJob}
          disabled={loading}
        >
          <Text style={styles.postButtonText}>
            {loading ? 'Posting Job...' : 'Post Job'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#FFFFFF',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#6B7280',
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
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
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
    color: '#111827',
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
  },
  picker: {
    flex: 1,
    height: 56,
  },
  postButton: {
    backgroundColor: '#16A34A',
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
});