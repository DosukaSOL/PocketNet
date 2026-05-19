// Captures a sequence of frames from a captured view and encodes them into an
// animated GIF entirely in JS. Pure JS so it works without a native module.
//
// The trade-off is speed: encoding ~8 frames at ~540 px width on-device takes
// a few seconds. The card geometry is therefore rendered at a reduced size
// for the GIF path; the JPEG path keeps full resolution.

import * as FileSystem from 'expo-file-system/legacy';
import { captureRef } from 'react-native-view-shot';
import type { View } from 'react-native';

// gifenc and upng-js ship without TypeScript declarations.
/* eslint-disable @typescript-eslint/no-require-imports */
const gifenc: {
  GIFEncoder: () => {
    writeFrame: (indexed: Uint8Array, w: number, h: number, opts: { palette: number[][]; delay?: number }) => void;
    finish: () => void;
    bytes: () => Uint8Array;
  };
  quantize: (rgba: Uint8Array, max: number, opts?: { format?: string }) => number[][];
  applyPalette: (rgba: Uint8Array, palette: number[][], format?: string) => Uint8Array;
} = require('gifenc');
const { GIFEncoder, applyPalette, quantize } = gifenc;
const UPNG: { decode: (buf: ArrayBuffer) => unknown; toRGBA8: (img: unknown) => ArrayBuffer[] } = require('upng-js');
/* eslint-enable @typescript-eslint/no-require-imports */

function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const g: any = globalThis as any;
  const decode: (input: string) => string =
    typeof g.atob === 'function'
      ? g.atob
      : (input: string) => {
          // Minimal base64 decoder for environments without atob (some RN runtimes).
          const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
          const lookup = new Map<string, number>();
          for (let i = 0; i < alphabet.length; i++) lookup.set(alphabet[i], i);
          const cleaned = input.replace(/=+$/, '');
          let buffer = 0;
          let bits = 0;
          let output = '';
          for (const ch of cleaned) {
            const value = lookup.get(ch);
            if (value === undefined) continue;
            buffer = (buffer << 6) | value;
            bits += 6;
            if (bits >= 8) {
              bits -= 8;
              output += String.fromCharCode((buffer >> bits) & 0xff);
            }
          }
          return output;
        };
  const binary = decode(base64);
  const buffer = new ArrayBuffer(binary.length);
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return buffer;
}

async function captureFrame(
  ref: React.RefObject<View | null>,
  width: number,
  height: number
): Promise<{ rgba: Uint8Array; width: number; height: number }> {
  const base64 = await captureRef(ref as unknown as React.RefObject<View>, {
    format: 'png',
    quality: 1,
    width,
    height,
    result: 'base64'
  });
  const buffer = base64ToArrayBuffer(base64);
  const decoded = UPNG.decode(buffer) as { width: number; height: number };
  const frames = UPNG.toRGBA8(decoded);
  const rgba = new Uint8Array(frames[0]);
  return { rgba, width: decoded.width, height: decoded.height };
}

export type GifProgress = (frame: number, total: number) => void;

export async function captureAnimatedGif(
  ref: React.RefObject<View | null>,
  options: {
    width: number;
    height: number;
    frames?: number;
    intervalMs?: number;
    frameDelayMs?: number;
    onProgress?: GifProgress;
  }
): Promise<string> {
  const frameCount = options.frames ?? 8;
  const interval = options.intervalMs ?? 220;
  const delay = options.frameDelayMs ?? 200;

  // Capture frames spaced over time so animated borders move between shots.
  const captured: { rgba: Uint8Array; width: number; height: number }[] = [];
  for (let i = 0; i < frameCount; i++) {
    const frame = await captureFrame(ref, options.width, options.height);
    captured.push(frame);
    options.onProgress?.(i + 1, frameCount);
    if (i < frameCount - 1) {
      await new Promise((resolve) => setTimeout(resolve, interval));
    }
  }

  // Encode as GIF using gifenc with per-frame quantized palettes for quality.
  const encoder = GIFEncoder();
  const { width, height } = captured[0];
  for (const frame of captured) {
    const palette = quantize(frame.rgba, 256, { format: 'rgb444' });
    const indexed = applyPalette(frame.rgba, palette, 'rgb444');
    encoder.writeFrame(indexed, width, height, { palette, delay });
  }
  encoder.finish();
  const bytes = encoder.bytes();

  // Write to a tmp file as base64 (RN's FileSystem doesn't accept raw bytes).
  let binary = '';
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  const g: any = globalThis as any;
  const encodeBase64: (input: string) => string =
    typeof g.btoa === 'function'
      ? g.btoa
      : (input: string) => {
          const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
          let result = '';
          let buffer = 0;
          let bits = 0;
          for (let i = 0; i < input.length; i++) {
            buffer = (buffer << 8) | input.charCodeAt(i);
            bits += 8;
            while (bits >= 6) {
              bits -= 6;
              result += alphabet[(buffer >> bits) & 0x3f];
            }
          }
          if (bits > 0) result += alphabet[(buffer << (6 - bits)) & 0x3f];
          while (result.length % 4) result += '=';
          return result;
        };
  const base64 = encodeBase64(binary);
  const path = `${FileSystem.cacheDirectory}pocketnet-card-${Date.now()}.gif`;
  await FileSystem.writeAsStringAsync(path, base64, { encoding: FileSystem.EncodingType.Base64 });
  return path;
}
