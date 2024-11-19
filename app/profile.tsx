import React, { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity,
  TextInput,
  Alert,
  Image,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/config/firebase';
import FontAwesome from '@expo/vector-icons/FontAwesome';

const profileImages = [
  { id: 1, source: require('@/assets/images/profile-images/profile-1.png') },
  { id: 2, source: require('@/assets/images/profile-images/profile-2.png') },
  { id: 3, source: require('@/assets/images/profile-images/profile-3.png') },
  { id: 4, source: require('@/assets/images/profile-images/profile-4.png') },
  { id: 5, source: require('@/assets/images/profile-images/profile-5.png') },
  { id: 6, source: require('@/assets/images/profile-images/profile-6.png') },
  { id: 7, source: require('@/assets/images/profile-images/profile-7.png') },
  { id: 8, source: require('@/assets/images/profile-images/profile-8.png') },
  { id: 9, source: require('@/assets/images/profile-images/profile-9.png') },
  { id: 11, source: require('@/assets/images/profile-images/profile-11.png') },
  { id: 12, source: require('@/assets/images/profile-images/profile-12.png') },
  { id: 13, source: require('@/assets/images/profile-images/profile-13.png') },
];

export default function ProfileScreen() {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [userData, setUserData] = useState({
    firstName: '',
    lastName: '',
    email: user?.email || '',
    avatar: null,
    country: '',
    city: '',
  });
  const [editedData, setEditedData] = useState({...userData});

  // Fetch user data when component mounts
  React.useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        const data = userDoc.data();
        if (data) {
          const userInfo = {
            firstName: data.firstName || '',
            lastName: data.lastName || '',
            email: user.email || '',
            avatar: data.avatar || null,
            country: data.location?.country || '',
            city: data.location?.city || '',
          };
          setUserData(userInfo);
          setEditedData(userInfo);
        }
      }
    };
    fetchUserData();
  }, [user]);

  const handleSave = async () => {
    try {
      if (!user) return;

      await updateDoc(doc(db, 'users', user.uid), {
        firstName: editedData.firstName,
        lastName: editedData.lastName,
        avatar: editedData.avatar,
        country: editedData.country,
        city: editedData.city,
      });

      setUserData(editedData);
      setIsEditing(false);
      Alert.alert('Success', 'Profile updated successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile');
      console.error(error);
    }
  };

  const handleCancel = () => {
    setEditedData({...userData});
    setIsEditing(false);
  };

  const InfoRow = ({ label, value }: { label: string; value: string }) => (
    <View style={styles.infoRow}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );

  const EditRow = ({ label, value, onChangeText }: { 
    label: string; 
    value: string; 
    onChangeText: (text: string) => void 
  }) => (
    <View style={styles.editRow}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={`Enter ${label.toLowerCase()}`}
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <FontAwesome name="arrow-left" size={24} color="#5a6736" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Profile</Text>
          <TouchableOpacity onPress={() => setIsEditing(!isEditing)} style={styles.editButton}>
            <Text style={styles.editButtonText}>{isEditing ? 'Cancel' : 'Edit'}</Text>
          </TouchableOpacity>
        </View>

        <ScrollView 
          style={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.avatarSection}>
            <Image 
              source={
                (isEditing ? editedData.avatar : userData.avatar) 
                  ? profileImages.find(img => img.id === (isEditing ? editedData.avatar : userData.avatar))?.source
                  : require('@/assets/images/profile-images/profile-1.png')
              }
              style={styles.avatar}
            />
            {isEditing && (
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                style={styles.avatarPicker}
                keyboardShouldPersistTaps="handled"
              >
                {profileImages.map((image) => (
                  <TouchableOpacity
                    key={image.id}
                    onPress={() => setEditedData({...editedData, avatar: image.id})}
                    style={[
                      styles.avatarOption,
                      editedData.avatar === image.id && styles.selectedAvatarOption
                    ]}
                  >
                    <Image source={image.source} style={styles.avatarOptionImage} />
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </View>

          <View style={styles.infoSection}>
            {isEditing ? (
              <>
                <View style={styles.editRow}>
                  <Text style={styles.label}>First Name</Text>
                  <TextInput
                    style={styles.input}
                    value={editedData.firstName}
                    onChangeText={(text) => setEditedData({...editedData, firstName: text})}
                    returnKeyType="next"
                    blurOnSubmit={false}
                  />
                </View>
                <View style={styles.editRow}>
                  <Text style={styles.label}>Last Name</Text>
                  <TextInput
                    style={styles.input}
                    value={editedData.lastName}
                    onChangeText={(text) => setEditedData({...editedData, lastName: text})}
                    returnKeyType="next"
                    blurOnSubmit={false}
                  />
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.label}>Email</Text>
                  <Text style={styles.value}>{userData.email}</Text>
                </View>
                <View style={styles.editRow}>
                  <Text style={styles.label}>Country</Text>
                  <TextInput
                    style={styles.input}
                    value={editedData.country}
                    onChangeText={(text) => setEditedData({...editedData, country: text})}
                    returnKeyType="next"
                    blurOnSubmit={false}
                  />
                </View>
                <View style={styles.editRow}>
                  <Text style={styles.label}>City</Text>
                  <TextInput
                    style={styles.input}
                    value={editedData.city}
                    onChangeText={(text) => setEditedData({...editedData, city: text})}
                    returnKeyType="done"
                  />
                </View>
              </>
            ) : (
              <>
                <InfoRow label="First Name" value={userData.firstName} />
                <InfoRow label="Last Name" value={userData.lastName} />
                <InfoRow label="Email" value={userData.email} />
                <InfoRow label="Country" value={userData.country} />
                <InfoRow label="City" value={userData.city} />
              </>
            )}
          </View>
          
          {/* Add extra padding at bottom for keyboard */}
          <View style={{ height: 100 }} />
        </ScrollView>

        {isEditing && (
          <View style={styles.bottomButtons}>
            <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveButtonText}>Save Changes</Text>
            </TouchableOpacity>
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: 'PoppinsSemiBold',
    color: '#5a6736',
  },
  backButton: {
    padding: 8,
  },
  editButton: {
    padding: 8,
  },
  editButtonText: {
    color: '#d6844b',
    fontFamily: 'PoppinsSemiBold',
    fontSize: 16,
  },
  content: {
    flex: 1,
  },
  avatarSection: {
    alignItems: 'center',
    padding: 20,
  },
  avatar: {
    width: 120,
    height: 120,
  },
  avatarPicker: {
    marginTop: 20,
  },
  avatarOption: {
    width: 60,
    height: 60,
    marginHorizontal: 8,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedAvatarOption: {
    borderColor: '#d6844b',
  },
  avatarOptionImage: {
    width: '100%',
    height: '100%',
    borderRadius: 30,
  },
  infoSection: {
    padding: 16,
  },
  infoRow: {
    marginBottom: 20,
  },
  editRow: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
    fontFamily: 'Poppins',
  },
  value: {
    fontSize: 16,
    color: '#333',
    fontFamily: 'PoppinsSemiBold',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    fontFamily: 'Poppins',
    backgroundColor: '#f9f9f9',
    color: '#333',
  },
  bottomButtons: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 5,
  },
  cancelButton: {
    flex: 1,
    padding: 16,
    marginRight: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d6844b',
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#d6844b',
    fontFamily: 'PoppinsSemiBold',
    fontSize: 16,
  },
  saveButton: {
    flex: 1,
    padding: 16,
    marginLeft: 8,
    borderRadius: 8,
    backgroundColor: '#d6844b',
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontFamily: 'PoppinsSemiBold',
    fontSize: 16,
  },
}); 