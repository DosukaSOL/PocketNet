import * as ImagePicker from 'expo-image-picker';

import { createId } from '@/lib/id';
import { supabase } from '@/lib/supabase';

export type PickedImage = {
  uri: string;
  width?: number;
  height?: number;
};

const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;

function inferContentType(uri: string, fallbackExt: string): { contentType: string; extension: string } {
  const lower = uri.split('?')[0].toLowerCase();
  if (lower.endsWith('.png')) return { contentType: 'image/png', extension: 'png' };
  if (lower.endsWith('.gif')) return { contentType: 'image/gif', extension: 'gif' };
  if (lower.endsWith('.webp')) return { contentType: 'image/webp', extension: 'webp' };
  if (lower.endsWith('.heic') || lower.endsWith('.heif')) {
    return { contentType: 'image/heic', extension: 'heic' };
  }
  if (lower.endsWith('.jpg') || lower.endsWith('.jpeg')) {
    return { contentType: 'image/jpeg', extension: 'jpg' };
  }
  return { contentType: 'image/jpeg', extension: fallbackExt || 'jpg' };
}

export type PickImageOptions = {
  /** Aspect ratio for the built-in cropper (e.g. [1,1] avatar, [3,1] banner). */
  aspect?: [number, number];
  /** Disable cropping entirely. */
  allowsEditing?: boolean;
};

export async function pickImage(options: PickImageOptions = {}): Promise<PickedImage | null> {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

  if (!permission.granted) {
    throw new Error('Photo library permission is required to choose an image.');
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    allowsEditing: options.allowsEditing ?? true,
    aspect: options.aspect,
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

export async function pickGif(): Promise<PickedImage | null> {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

  if (!permission.granted) {
    throw new Error('Photo library permission is required to choose a GIF.');
  }

  // No editing — cropping destroys animation. Pull anything and we'll filter.
  const result = await ImagePicker.launchImageLibraryAsync({
    allowsEditing: false,
    quality: 1,
    mediaTypes: ImagePicker.MediaTypeOptions.All
  });

  if (result.canceled || !result.assets[0]) {
    return null;
  }

  const asset = result.assets[0];
  const uri = asset.uri.toLowerCase();
  const mime = (asset.mimeType || '').toLowerCase();
  if (!uri.endsWith('.gif') && mime !== 'image/gif') {
    throw new Error('That file is not a GIF. Pick an animated .gif.');
  }

  return {
    uri: asset.uri,
    width: asset.width,
    height: asset.height
  };
}

export async function uploadImage(args: {
  bucket: 'avatars' | 'banners' | 'post-images' | 'community-banners' | 'community-avatars' | 'border-images';
  userId: string;
  uri: string;
}) {
  if (!supabase) {
    return args.uri;
  }

  // Fetch the local file as a binary ArrayBuffer. This avoids fragile base64
  // decoding paths and is the supported pattern for Supabase JS uploads on
  // React Native, web, and Hermes.
  const response = await fetch(args.uri);
  if (!response.ok) {
    throw new Error('Could not read selected image.');
  }

  const arrayBuffer = await response.arrayBuffer();
  if (arrayBuffer.byteLength === 0) {
    throw new Error('Selected image is empty.');
  }
  if (arrayBuffer.byteLength > MAX_UPLOAD_BYTES) {
    throw new Error('Image is too large. Pick something under 8 MB.');
  }

  const fallbackExt = args.uri.split('.').pop()?.toLowerCase() || 'jpg';
  const { contentType, extension } = inferContentType(args.uri, fallbackExt);
  const path = `${args.userId}/${createId('image')}.${extension}`;

  const { error } = await supabase.storage.from(args.bucket).upload(path, arrayBuffer, {
    contentType,
    upsert: false,
    cacheControl: '3600'
  });

  if (error) {
    throw error;
  }

  const { data } = supabase.storage.from(args.bucket).getPublicUrl(path);
  return data.publicUrl;
}
