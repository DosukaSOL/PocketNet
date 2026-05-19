import { Image } from 'expo-image';
import { Search, X } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  TextInput,
  View
} from 'react-native';

import { AppText, Button, TextField } from '@/components/ui';
import { colors, radius, spacing } from '@/design/tokens';
import { isTenorEnabled, searchGifs, type TenorGif } from '@/lib/tenor';

const PASTE_HINT = 'Paste a public https GIF URL (.gif).';

function isValidGifUrl(value: string): boolean {
  if (!value) return false;
  return /^https:\/\/[A-Za-z0-9.\-/_%?=&:#~+]+\.(gif|webp)(\?.*)?$/i.test(value.trim());
}

export function GifPicker({
  visible,
  onClose,
  onPick
}: {
  visible: boolean;
  onClose: () => void;
  onPick: (url: string) => void;
}) {
  const enabled = isTenorEnabled();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<TenorGif[]>([]);
  const [loading, setLoading] = useState(false);
  const [pasteUrl, setPasteUrl] = useState('');

  useEffect(() => {
    if (!visible || !enabled) return;
    let cancelled = false;
    setLoading(true);
    searchGifs(query)
      .then((gifs) => {
        if (!cancelled) setResults(gifs);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [visible, enabled, query]);

  function handlePaste() {
    const trimmed = pasteUrl.trim();
    if (!isValidGifUrl(trimmed)) {
      Alert.alert('Not a GIF URL', PASTE_HINT);
      return;
    }
    onPick(trimmed);
    setPasteUrl('');
    onClose();
  }

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <View style={styles.header}>
            <AppText variant="sectionTitle">Add a GIF</AppText>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Close GIF picker"
              onPress={onClose}
              hitSlop={10}
            >
              <X color={colors.textSecondary} size={20} />
            </Pressable>
          </View>

          {enabled ? (
            <>
              <View style={styles.searchRow}>
                <Search color={colors.textMuted} size={16} />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search Tenor"
                  placeholderTextColor={colors.textMuted}
                  value={query}
                  onChangeText={setQuery}
                  autoCorrect={false}
                  returnKeyType="search"
                />
              </View>
              {loading ? (
                <View style={styles.loadingWrap}>
                  <ActivityIndicator color={colors.accentCyan} />
                </View>
              ) : (
                <FlatList
                  data={results}
                  keyExtractor={(item) => item.id}
                  numColumns={3}
                  columnWrapperStyle={styles.row}
                  contentContainerStyle={styles.grid}
                  renderItem={({ item }) => (
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel="Use GIF"
                      onPress={() => {
                        onPick(item.url);
                        onClose();
                      }}
                      style={styles.tile}
                    >
                      <Image
                        source={{ uri: item.previewUrl }}
                        style={styles.tileImage}
                        contentFit="cover"
                      />
                    </Pressable>
                  )}
                  ListEmptyComponent={
                    <AppText variant="caption" color={colors.textMuted} style={styles.empty}>
                      No GIFs found. Try a different search.
                    </AppText>
                  }
                />
              )}
            </>
          ) : (
            <View style={styles.pasteWrap}>
              <AppText variant="caption" color={colors.textSecondary}>
                Tenor search is not configured on this build. {PASTE_HINT}
              </AppText>
              <TextField
                label="GIF URL"
                value={pasteUrl}
                onChangeText={setPasteUrl}
                autoCapitalize="none"
                autoCorrect={false}
                placeholder="https://media.tenor.com/abc.gif"
              />
              <Button label="Use GIF" onPress={handlePaste} />
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(5, 7, 13, 0.72)',
    justifyContent: 'flex-end'
  },
  sheet: {
    backgroundColor: colors.surfaceStrong,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    padding: spacing.md,
    gap: spacing.sm,
    maxHeight: '85%'
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceGlass
  },
  searchInput: {
    flex: 1,
    color: colors.textPrimary,
    paddingVertical: 6
  },
  loadingWrap: {
    paddingVertical: spacing.xl,
    alignItems: 'center'
  },
  grid: {
    paddingBottom: spacing.lg,
    gap: spacing.xs
  },
  row: {
    gap: spacing.xs
  },
  tile: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: radius.md,
    overflow: 'hidden',
    backgroundColor: colors.surfaceGlass
  },
  tileImage: {
    width: '100%',
    height: '100%'
  },
  empty: {
    textAlign: 'center',
    paddingVertical: spacing.xl
  },
  pasteWrap: {
    gap: spacing.sm
  }
});
