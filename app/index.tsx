// app/(tabs)/index.tsx
import React, { useState, useCallback, useMemo } from 'react';
import { StyleSheet, View, ActivityIndicator, ScrollView, Pressable, Alert, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';

// Paleta
const APP_COLORS = {
  primary: '#0a7ea4',
  secondary: '#4A44F2',
  accent: '#8A7CFF',
  background: '#F8F9FF',
  textDark: '#2E2D4D',
  textLight: '#FFFFFF',
};

// Chaves
const STORAGE_KEYS = {
  localizacoes: 'localizacoes_data_v1',
  tempos: 'tempos_interrupcao_data_v1',
  prejuizos: 'prejuizos_data_v1',
};

// Tipos
type RegistroBase = { id: string; timestamp: string };
type Localizacao = RegistroBase & { cidade: string; bairro: string; cep: string };
type RegistroTempo = RegistroBase & { dataInicio: string; horaInicio: string; tipoDuracao: string };
type RegistroPrejuizo = RegistroBase & { descricao: string; dataOcorrencia: string };

// Rotas válidas
type ValidRoutes = '/(tabs)/localizacao' | '/(tabs)/tempo' | '/(tabs)/prejuizos';

const showAppAlert = (title: string, message: string) => {
  if (Platform.OS === 'web') {
    window.alert(`${title}\n${message}`);
  } else {
    Alert.alert(title, message);
  }
};

const parseAndSort = <T extends RegistroBase>(data: string | null): T[] =>
  data ? (JSON.parse(data) as T[]).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()) : [];

export default function PanoramaGeralScreen() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState({
    localizacoes: [] as Localizacao[],
    tempos: [] as RegistroTempo[],
    prejuizos: [] as RegistroPrejuizo[],
  });

  const cardBgColor = useThemeColor({}, 'card') || APP_COLORS.background;

  const carregarDados = useCallback(async () => {
    setIsLoading(true);
    try {
      const [locs, temps, prejs] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.localizacoes),
        AsyncStorage.getItem(STORAGE_KEYS.tempos),
        AsyncStorage.getItem(STORAGE_KEYS.prejuizos),
      ]);
      setData({
        localizacoes: parseAndSort<Localizacao>(locs),
        tempos: parseAndSort<RegistroTempo>(temps),
        prejuizos: parseAndSort<RegistroPrejuizo>(prejs),
      });
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
      showAppAlert('Erro', 'Não foi possível carregar os dados.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { carregarDados(); }, [carregarDados]));

  const resumoCards = useMemo(() => [
    {
      titulo: "Localizações Afetadas",
      registros: data.localizacoes,
      rota: "/localizacao" as ValidRoutes,
      detalhes: (item: Localizacao) => `${item.cidade} - ${item.bairro}`,
    },
    {
      titulo: "Tempos de Interrupção",
      registros: data.tempos,
      rota: "/tempo" as ValidRoutes,
      detalhes: (item: RegistroTempo) => `${item.dataInicio} às ${item.horaInicio}`,
    },
    {
      titulo: "Prejuízos Causados",
      registros: data.prejuizos,
      rota: "/prejuizos" as ValidRoutes,
      detalhes: (item: RegistroPrejuizo) => `${item.descricao?.substring(0, 30)}...`,
    },
  ], [data]);

  const CardResumo = ({ titulo, registros, rota, detalhes }: any) => {
    const maisRecente = registros[0];
    return (
      <Pressable 
        onPress={() => router.push(rota)}
        style={({ pressed }) => [
          styles.card,
          { backgroundColor: cardBgColor, opacity: pressed ? 0.9 : 1, transform: pressed ? [{ scale: 0.98 }] : [] },
        ]}
      >
        <View style={styles.cardContent}>
          <View style={styles.cardHeader}>
            <ThemedText type="subtitle" style={styles.cardTitle}>{titulo}</ThemedText>
            <View style={[styles.countBadge, { backgroundColor: APP_COLORS.primary }]}>
              <ThemedText style={styles.countText}>{registros.length}</ThemedText>
            </View>
          </View>
          {registros.length > 0 && (
            <View style={styles.cardDetails}>
              <ThemedText style={styles.cardRecentItem}>{detalhes(maisRecente)}</ThemedText>
              <ThemedText style={styles.cardTimestamp}>
                {new Date(maisRecente.timestamp).toLocaleDateString()}
              </ThemedText>
            </View>
          )}
        </View>
      </Pressable>
    );
  };

  if (isLoading) {
    return (
      <ThemedView style={styles.centered}>
        <ActivityIndicator size="large" color={APP_COLORS.primary} />
        <ThemedText style={{ marginTop: 16, color: APP_COLORS.textDark }}>Carregando resumo...</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.outerContainer}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <ThemedText type="title" style={styles.headerTitle}>Panorama Geral</ThemedText>
          <ThemedText style={styles.headerSubtitle}>
            Resumo dos seus registros sobre falta de energia
          </ThemedText>
        </View>

        <View style={styles.cardsContainer}>
          {resumoCards.map((card, index) => (
            <CardResumo key={index} {...card} />
          ))}
        </View>
      </ScrollView>
    </ThemedView>
  );
}

// Styles
const styles = StyleSheet.create({
  outerContainer: { flex: 1, backgroundColor: APP_COLORS.background },
  container: { flexGrow: 1, padding: 20 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: APP_COLORS.background },
  header: { marginBottom: 24, alignItems: 'center' },
  headerTitle: { fontSize: 28, fontWeight: '700', color: APP_COLORS.textDark, marginBottom: 8 },
  headerSubtitle: { fontSize: 16, color: APP_COLORS.textDark, opacity: 0.7, textAlign: 'center' },
  cardsContainer: { gap: 16 },
  card: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: APP_COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  cardContent: { padding: 20 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  cardTitle: { fontSize: 18, fontWeight: '600', color: APP_COLORS.textDark, flex: 1 },
  countBadge: {
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 12,
    minWidth: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countText: { color: APP_COLORS.textLight, fontWeight: 'bold', fontSize: 16 },
  cardDetails: { borderLeftWidth: 3, borderLeftColor: APP_COLORS.accent, paddingLeft: 12 },
  cardRecentItem: { fontSize: 14, color: APP_COLORS.textDark, marginBottom: 4 },
  cardTimestamp: { fontSize: 12, color: APP_COLORS.textDark, opacity: 0.6 },
});
