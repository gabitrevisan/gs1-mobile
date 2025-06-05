// app/+not-found.tsx
import { Link, Stack } from 'expo-router';
import { StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useThemeColor } from '@/hooks/useThemeColor';

export default function NotFoundScreen() {
  const iconColor = useThemeColor({}, 'text');
  const linkTextColor = useThemeColor({}, 'tint');

  return (
    <>
      <Stack.Screen options={{ title: '404' }} />

      <ThemedView style={styles.container}>
        <Ionicons name="compass-outline" size={80} color={iconColor} style={styles.icon} />

        <ThemedText type="title" style={styles.titleText}>
          Oops! Caminho não encontrado.
        </ThemedText>

        <ThemedText style={styles.messageText}>
          Parece que a página que você está procurando não existe ou foi movida.
          Que tal tentar voltar para o início?
        </ThemedText>

        <Link href="/" style={styles.linkButton}>
          <ThemedText style={[styles.linkButtonText, { color: linkTextColor }]}>
            Ir para a Tela Inicial
          </ThemedText>
        </Link>
      </ThemedView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    textAlign: 'center',
  },
  icon: {
    marginBottom: 24,
    opacity: 0.7,
  },
  titleText: {
    marginBottom: 12,
    textAlign: 'center',
  },
  messageText: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: 24,
    opacity: 0.8,
  },
  linkButton: {
    marginTop: 16,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  linkButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});
