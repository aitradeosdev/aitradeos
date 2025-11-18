import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert, ActivityIndicator } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { apiService } from '../../services/apiService';
import * as ImagePicker from 'expo-image-picker';

interface Logo {
  _id: string;
  imageUrl: string;
  order: number;
}

const AdminLogosScreen: React.FC = () => {
  const { theme } = useTheme();
  const [logos, setLogos] = useState<Logo[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchLogos();
  }, []);

  const fetchLogos = async () => {
    try {
      const response = await apiService.get('/admin/logos');
      setLogos(response.data.logos);
    } catch (error) {
      console.error('Failed to fetch logos:', error);
    } finally {
      setLoading(false);
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 1],
      quality: 1,
    });

    if (!result.canceled) {
      uploadLogo(result.assets[0].uri);
    }
  };

  const uploadLogo = async (uri: string) => {
    try {
      setUploading(true);
      const formData = new FormData();
      
      const response = await fetch(uri);
      const blob = await response.blob();
      formData.append('logo', blob, 'logo.png');

      await apiService.post('/admin/logos', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      
      Alert.alert('Success', 'Logo uploaded successfully');
      fetchLogos();
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.error || 'Failed to upload logo');
    } finally {
      setUploading(false);
    }
  };

  const deleteLogo = async (id: string) => {
    if (confirm('Are you sure you want to delete this logo?')) {
      try {
        await apiService.delete(`/admin/logos/${id}`);
        fetchLogos();
      } catch (error) {
        alert('Failed to delete logo');
      }
    }
  };

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.background },
    header: { padding: 24, borderBottomWidth: 1, borderBottomColor: theme.border },
    title: { fontSize: 24, fontWeight: 'bold', color: theme.text },
    content: { padding: 24 },
    uploadButton: { backgroundColor: theme.primary, padding: 16, borderRadius: 12, alignItems: 'center', marginBottom: 24 },
    uploadButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
    logoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
    logoCard: { width: '48%', backgroundColor: theme.card, borderRadius: 12, padding: 16, borderWidth: 1, borderColor: theme.border },
    logoImage: { width: '100%', height: 60, resizeMode: 'contain', marginBottom: 12 },
    deleteButton: { backgroundColor: theme.error, padding: 8, borderRadius: 8, alignItems: 'center' },
    deleteButtonText: { color: '#FFFFFF', fontSize: 14, fontWeight: '600' },
  });

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Powered By Logos</Text>
      </View>
      <ScrollView style={styles.content}>
        <TouchableOpacity style={styles.uploadButton} onPress={pickImage} disabled={uploading}>
          <Text style={styles.uploadButtonText}>{uploading ? 'Uploading...' : 'Upload Logo'}</Text>
        </TouchableOpacity>
        <View style={styles.logoGrid}>
          {logos.map((logo) => (
            <View key={logo._id} style={styles.logoCard}>
              <Image source={{ uri: `http://localhost:3001${logo.imageUrl}` }} style={styles.logoImage} />
              <TouchableOpacity style={styles.deleteButton} onPress={() => deleteLogo(logo._id)}>
                <Text style={styles.deleteButtonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

export default AdminLogosScreen;
