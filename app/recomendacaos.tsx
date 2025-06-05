// app/(tabs)/recomendacoes.tsx
import React from 'react';
import { StyleSheet, ScrollView, View } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColor } from '@/hooks/useThemeColor';

// Dados das recomendações 
const recomendacoesData = [
  {
    categoria: "Antes da Falta de Energia (Prevenção)",
    itens: [
      "Mantenha lanternas e pilhas novas em locais de fácil acesso.",
      "Tenha um kit de primeiros socorros bem abastecido.",
      "Carregue completamente celulares, tablets e power banks (baterias portáteis).",
      "Considere um nobreak (UPS) para equipamentos eletrônicos sensíveis (computadores, modems).",
      "Saiba onde fica o disjuntor principal da sua casa ou estabelecimento.",
      "Tenha cópias de segurança de dados importantes do seu computador.",
      "Mantenha alimentos não perecíveis e água potável para alguns dias.",
    ],
    iconName: "shield-checkmark-outline" as const,
  },
  {
    categoria: "Durante a Falta de Energia",
    itens: [
      "Desligue e desconecte aparelhos eletrônicos da tomada para evitar danos quando a energia retornar (picos de tensão).",
      "Evite abrir geladeiras e freezers desnecessariamente para conservar a temperatura interna.",
      "Use velas com extrema cautela, longe de materiais inflamáveis e nunca as deixe acesas sem supervisão.",
      "Priorize o uso de lanternas a pilhas ou recarregáveis.",
      "Mantenha-se informado através de rádios a pilha ou aplicativos de notícias no celular (se houver bateria e sinal).",
      "Economize a bateria do celular desligando Wi-Fi, Bluetooth e diminuindo o brilho da tela se não estiverem em uso.",
      "Verifique se seus vizinhos estão bem, especialmente idosos ou pessoas com necessidades especiais.",
    ],
    iconName: "flash-off-outline" as const,
  },
  {
    categoria: "Após o Retorno da Energia",
    itens: [
      "Espere alguns minutos antes de religar os aparelhos eletrônicos mais sensíveis. Isso pode ajudar a protegê-los de possíveis picos de tensão.",
      "Verifique se algum disjuntor desarmou e religue-o se for seguro.",
      "Inspecione os alimentos na geladeira e freezer para garantir que não estragaram.",
      "Recarregue todos os dispositivos (celulares, lanternas, power banks).",
      "Relate qualquer dano na rede elétrica externa às autoridades competentes.",
    ],
    iconName: "medkit-outline" as const,
  },
  {
    categoria: "Em Caso de Desastres Naturais (Chuvas Fortes, Ventos, Deslizamentos)",
    itens: [
      "Siga as orientações da Defesa Civil e autoridades locais.",
      "Evite áreas de risco conhecidas (encostas, margens de rios).",
      "Não atravesse áreas alagadas de carro ou a pé.",
      "Em caso de ventos fortes, afaste-se de janelas e objetos que possam cair.",
      "Tenha um plano de evacuação familiar e um ponto de encontro definido.",
      "Se houver risco de deslizamento e você estiver em área de risco, evacue preventivamente.",
      "Desligue a chave geral de eletricidade e o registro de gás e água se precisar evacuar sua residência."
    ],
    iconName: "warning-outline" as const,
  }
];

export default function RecomendacoesScreen() {
  const iconColor = useThemeColor({}, 'tint');
  const cardBackgroundColor = useThemeColor({}, 'card');
  const cardBorderColor = useThemeColor({}, 'border');

  return (
    <ThemedView style={styles.outerContainer}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <ThemedText type="title" style={styles.headerTitle}>Recomendações e Boas Práticas</ThemedText>
        <ThemedText style={styles.headerSubtitle}>
          Orientações para lidar com falta de energia e desastres naturais.
        </ThemedText>

        {recomendacoesData.map((secao, index) => (
          <View key={index} style={[styles.sectionCard, {backgroundColor: cardBackgroundColor, borderColor: cardBorderColor}]}>
            <View style={styles.sectionHeader}>
              <Ionicons name={secao.iconName} size={24} color={iconColor} style={styles.sectionIcon} />
              <ThemedText type="subtitle" style={styles.sectionTitle}>{secao.categoria}</ThemedText>
            </View>
            {secao.itens.map((item, itemIndex) => (
              <View key={itemIndex} style={styles.listItem}>
                <ThemedText style={styles.bulletPoint}>•</ThemedText>
                <ThemedText style={styles.itemText}>{item}</ThemedText>
              </View>
            ))}
          </View>
        ))}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
  },
  scrollContainer: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    paddingBottom: 30, 
  },
  headerTitle: {
    textAlign: 'center',
    marginBottom: 8,
  },
  headerSubtitle: {
    textAlign: 'center',
    marginBottom: 24,
    fontSize: 16,
    opacity: 0.8,
  },
  sectionCard: {
    marginBottom: 20,
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 1 }, 
    shadowOpacity: 0.1, 
    shadowRadius: 3, 
    elevation: 2, 
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionIcon: {
    marginRight: 10,
  },
  sectionTitle: {
    flex: 1, 
    
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'flex-start', 
    marginBottom: 8,
    paddingLeft: 5,
  },
  bulletPoint: {
    marginRight: 8,
    fontSize: 16, 
    lineHeight: 24, 
  },
  itemText: {
    flex: 1, 
    fontSize: 15,
    lineHeight: 22, 
  },
});