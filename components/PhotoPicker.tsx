import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { colors, radius, spacing } from '../lib/theme';

interface Props {
  uri: string | null;
  onChange: (uri: string | null) => void;
}

export default function PhotoPicker({ uri, onChange }: Props) {
  const pickFromCamera = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Camera access needed', 'Enable camera access in Settings.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.8,
    });
    if (!result.canceled) {
      onChange(result.assets[0].uri);
    }
  };

  const pickFromLibrary = async () => {
    const permission =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Photo access needed', 'Enable photo access in Settings.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.8,
    });
    if (!result.canceled) {
      onChange(result.assets[0].uri);
    }
  };

  const openMenu = () => {
    const options = [
      { text: 'Take Photo', onPress: pickFromCamera },
      { text: 'Choose from Library', onPress: pickFromLibrary },
    ];
    if (uri) {
      options.push({
        text: 'Remove Photo',
        onPress: async () => onChange(null),
      });
    }
    Alert.alert('Photo', undefined, [
      ...options,
      { text: 'Cancel', onPress: async () => {} },
    ]);
  };

  return (
    <Pressable style={styles.container} onPress={openMenu}>
      {uri ? (
        <Image source={{ uri }} style={styles.image} contentFit="cover" />
      ) : (
        <View style={styles.placeholder}>
          <Ionicons name="camera-outline" size={32} color={colors.textMuted} />
          <Text style={styles.placeholderText}>Add a photo</Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 180,
    borderRadius: radius.md,
    overflow: 'hidden',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  placeholderText: {
    color: colors.textMuted,
    fontSize: 14,
  },
});
