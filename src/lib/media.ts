import * as FileSystem from 'expo-file-system/legacy';
import * as ImagePicker from 'expo-image-picker';

import { createId } from '@/lib/id';
import { supabase } from '@/lib/supabase';

export type PickedImage = {
  uri: string;
  width?: number;
  height?: number;
};

export async function pickImage(): Promise<PickedImage | null> {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

  if (!permission.granted) {
    throw new Error('Photo library permission is required to choose an image.');
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    allowsEditing: true,
    quality: 0.82,
    mediaTypes: ImagePicker.MediaTypeOptions.Images
  });

  if (result.canceled || !result.assets[0]) {
    return null;
  }

  return {
    uri: result.assets[0].uri,
    width: result.assets[0].width,
    height: result.assets[0].height
  };
}

export async function uploadImage(args: {
  bucket: 'avatars' | 'banners' | 'post-images' | 'community-banners';
  userId: string;
  uri: string;
}) {
  if (!supabase) {
    return args.uri;
  }

  const extension = args.uri.split('.').pop()?.toLowerCase() || 'jpg';
  const path = `${args.userId}/${createId('image')}.${extension}`;
  const bytes = await FileSystem.readAsStringAsync(args.uri, {
    encoding: FileSystem.EncodingType.Base64
  });

  const arrayBuffer = Uint8Array.from(atob(bytes), (char) => char.charCodeAt(0)).buffer;

  const { error } = await supabase.storage.from(args.bucket).upload(path, arrayBuffer, {
    contentType: extension === 'png' ? 'image/png' : 'image/jpeg',
    upsert: false
  });

  if (error) {
    throw error;
  }

  const { data } = supabase.storage.from(args.bucket).getPublicUrl(path);
  return data.publicUrl;
}
