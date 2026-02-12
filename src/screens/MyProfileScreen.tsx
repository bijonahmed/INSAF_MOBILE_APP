import React from 'react';
import { View, StyleSheet, Image, ScrollView, TextInput } from 'react-native';
import { Text, Card, Button } from 'react-native-paper';

interface MyProfileScreenProps {
  darkMode?: boolean; // optional, you can pass darkMode from Drawer
}

const MyProfileScreen = ({ darkMode = false }: MyProfileScreenProps) => {
  const [alertMessage, setAlertMessage] = React.useState<string | null>(null);

  const alert = (message: string) => {
    setAlertMessage(message);
    setTimeout(() => setAlertMessage(null), 2000);
  };

  return (
    <ScrollView
      contentContainerStyle={[
        styles.container,
        { backgroundColor: darkMode ? '#111827' : '#f8fafc' },
      ]}
    >
      {/* Profile Card */}
      <Card
        style={[
          styles.card,
          {
            backgroundColor: darkMode ? '#1f2937' : '#fff',
            shadowColor: darkMode ? '#000' : '#000',
          },
        ]}
      >
        <View style={styles.profileHeader}>
          <Image
            source={{ uri: 'https://bijonprofile.com/assets/img/developer_bijon.jpg' }} // replace with real image or avatar
            style={styles.avatar}
          />
          <View style={styles.profileInfo}>
            <Text style={[styles.name, { color: darkMode ? '#f1f5f9' : '#0f172a' }]}>
              Md. Bijon Ahmed
            </Text>
            <Text style={[styles.position, { color: darkMode ? '#d1d5db' : '#64748b' }]}>
              Software Engineer
            </Text>
            <Text style={[styles.email, { color: darkMode ? '#d1d5db' : '#64748b' }]}>
              bijon@example.com
            </Text>
          </View>
        </View>

        {/* Editable Info */}
        <View style={styles.infoSection}>
          <TextInput
            placeholder="Full Name"
            defaultValue="Md. Bijon Ahmed"
            style={[
              styles.input,
              { backgroundColor: darkMode ? '#374151' : '#f1f5f9', color: darkMode ? '#f1f5f9' : '#0f172a' },
            ]}
            placeholderTextColor={darkMode ? '#9ca3af' : '#9ca3af'}
          />
          <TextInput
            placeholder="Email"
            defaultValue="bijon@example.com"
            style={[
              styles.input,
              { backgroundColor: darkMode ? '#374151' : '#f1f5f9', color: darkMode ? '#f1f5f9' : '#0f172a' },
            ]}
            placeholderTextColor={darkMode ? '#9ca3af' : '#9ca3af'}
          />
          <TextInput
            placeholder="Position"
            defaultValue="Software Engineer"
            style={[
              styles.input,
              { backgroundColor: darkMode ? '#374151' : '#f1f5f9', color: darkMode ? '#f1f5f9' : '#0f172a' },
            ]}
            placeholderTextColor={darkMode ? '#9ca3af' : '#9ca3af'}
          />
        </View>

        <Button
          mode="contained"
          onPress={() => alert('Profile updated!')}
          style={[styles.button, { backgroundColor: '#2563eb' }]}
        >
          Update Profile
        </Button>
      </Card>
    </ScrollView>
  );
};

export default MyProfileScreen;

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 16,
    paddingBottom: 40,
  },
  card: {
    borderRadius: 16,
    padding: 20,
    elevation: 6,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  avatar: { width: 80, height: 80, borderRadius: 40, marginRight: 16 },
  profileInfo: {},
  name: { fontSize: 20, fontWeight: '700' },
  position: { fontSize: 14, marginTop: 2 },
  email: { fontSize: 12, marginTop: 2 },
  infoSection: { marginBottom: 20 },
  input: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 12,
    fontSize: 14,
  },
  button: {
    paddingVertical: 10,
    borderRadius: 12,
  },
});
