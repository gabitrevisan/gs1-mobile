// app/(tabs)/localizacao.tsx
import React, { useState, useCallback } from 'react';
import { StyleSheet, TextInput, FlatList, Alert, View, Platform, ActivityIndicator, Pressable } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useFocusEffect } from '@react-navigation/native';
import { CustomThemedButton } from '@/components/CustomThemedButton';
import { Ionicons } from '@expo/vector-icons';

const ASYNC_STORAGE_KEY_LOCALIZACOES = 'localizacoes_data_v1';

type Localizacao = {
  id: string;
  cep: string;
  cidade: string;
  bairro: string;
  pontoReferencia: string;
  timestamp: string;
};

const generateId = (): string => `id_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

const showAppAlert = (title: string, message: string) => {
  if (Platform.OS === 'web') {
    window.alert(`${title}\n${message}`);
  } else {
    Alert.alert(title, message);
  }
};

const showAppConfirmationAlert = (
  title: string,
  message: string,
  onConfirm: () => void,
  confirmText: string = 'Confirmar',
  cancelText: string = 'Cancelar'
) => {
  if (Platform.OS === 'web') {
    if (window.confirm(`${title}\n${message}`)) onConfirm();
  } else {
    Alert.alert(
      title,
      message,
      [
        { text: cancelText, style: 'cancel' },
        { text: confirmText, style: 'destructive', onPress: onConfirm },
      ],
      { cancelable: true }
    );
  }
};

export default function LocalizacaoScreen() {
  const [cep, setCep] = useState('');
  const [cidade, setCidade] = useState('');
  const [bairro, setBairro] = useState('');
  const [pontoReferencia, setPontoReferencia] = useState('');
  const [listaLocalizacoes, setListaLocalizacoes] = useState<Localizacao[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);

  const inputBackgroundColor = useThemeColor({ light: '#FFFFFF', dark: '#2C2C2C' }, 'card');
  const inputTextColor = useThemeColor({}, 'text');
  const inputBorderColor = useThemeColor({}, 'border');
  const listItemBackgroundColor = useThemeColor({}, 'card');
  const textColor = useThemeColor({}, 'text');
  const destructiveColor = useThemeColor({ light: '#D9534F', dark: '#FF453A' }, 'destructiveBackground');

  const carregarLocalizacoes = useCallback(async () => {
    setIsLoadingData(true);
    try {
      const dadosSalvos = await AsyncStorage.getItem(ASYNC_STORAGE_KEY_LOCALIZACOES);
      if (dadosSalvos) {
        const localizacoesParseadas: Localizacao[] = JSON.parse(dadosSalvos);
        localizacoesParseadas.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        setListaLocalizacoes(localizacoesParseadas);
      } else {
        setListaLocalizacoes([]);
      }
    } catch (error) {
      console.error('Erro ao carregar localizações:', error);
      showAppAlert('Erro', 'Não foi possível carregar as localizações salvas.');
    } finally {
      setIsLoadingData(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      carregarLocalizacoes();
    }, [carregarLocalizacoes])
  );

  const handleCepChange = (texto: string) => {
    const numeros = texto.replace(/\D/g, '');
    let cepFormatado = numeros;
    if (numeros.length > 5) {
      cepFormatado = numeros.substring(0, 5) + '-' + numeros.substring(5, 8);
    }
    setCep(cepFormatado.substring(0, 9));
  };

  const handleSalvarLocalizacao = async () => {
    const cepLimpo = cep.replace(/\D/g, '');
    if (!cepLimpo || !cidade.trim() || !bairro.trim()) {
      showAppAlert('Campos Obrigatórios', 'CEP, Cidade e Bairro são obrigatórios.');
      return;
    }
    if (cepLimpo.length !== 8) {
      showAppAlert('CEP Inválido', 'O CEP deve conter 8 números.');
      return;
    }

    setIsSubmitting(true);
    const novaLocalizacao: Localizacao = {
      id: generateId(),
      cep,
      cidade: cidade.trim(),
      bairro: bairro.trim(),
      pontoReferencia: pontoReferencia.trim(),
      timestamp: new Date().toISOString(),
    };

    try {
      const novaLista = [novaLocalizacao, ...listaLocalizacoes];
      novaLista.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      await AsyncStorage.setItem(ASYNC_STORAGE_KEY_LOCALIZACOES, JSON.stringify(novaLista));
      setListaLocalizacoes(novaLista);
      setCep('');
      setCidade('');
      setBairro('');
      setPontoReferencia('');
      showAppAlert('Sucesso!', 'Localização salva.');
    } catch (error) {
      console.error('Erro ao salvar localização:', error);
      showAppAlert('Erro', 'Não foi possível salvar a localização.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeletarLocalizacao = async (idParaDeletar: string) => {
    showAppConfirmationAlert('Confirmar Exclusão', 'Tem certeza que deseja apagar esta localização?', async () => {
      setIsLoadingData(true);
      try {
        const novaLista = listaLocalizacoes.filter((item) => item.id !== idParaDeletar);
        await AsyncStorage.setItem(ASYNC_STORAGE_KEY_LOCALIZACOES, JSON.stringify(novaLista));
        setListaLocalizacoes(novaLista);
        showAppAlert('Excluído', 'Localização removida com sucesso.');
      } catch (error) {
        console.error('Erro ao deletar localização:', error);
        showAppAlert('Erro', 'Não foi possível remover a localização.');
      } finally {
        setIsLoadingData(false);
      }
    });
  };

  const renderLocalizacaoItem = ({ item }: { item: Localizacao }) => (
    <View style={[styles.listItem, { backgroundColor: listItemBackgroundColor, borderColor: inputBorderColor }]}>
      <View style={styles.itemContent}>
        <ThemedText type="defaultSemiBold" style={styles.itemTextStrong}>CEP: {item.cep}</ThemedText>
        <ThemedText style={styles.itemText}>Cidade: {item.cidade}</ThemedText>
        <ThemedText style={styles.itemText}>Bairro: {item.bairro}</ThemedText>
        {!!item.pontoReferencia && (
          <ThemedText style={[styles.itemText, styles.itemTextFaded]}>Ref: {item.pontoReferencia}</ThemedText>
        )}
        <ThemedText style={styles.itemTimestamp}>
          Registrado em: {new Date(item.timestamp).toLocaleString('pt-BR')}
        </ThemedText>
      </View>
      <Pressable onPress={() => handleDeletarLocalizacao(item.id)} style={styles.deleteButton}>
        <Ionicons name="trash-bin-outline" size={24} color={destructiveColor} />
      </Pressable>
    </View>
  );

  return isLoadingData && !listaLocalizacoes.length ? (
    <ThemedView style={styles.centeredLoading}>
      <ActivityIndicator size="large" color={textColor} />
      <ThemedText>Carregando localizações...</ThemedText>
    </ThemedView>
  ) : (
    <ThemedView style={styles.outerContainer}>
      <KeyboardAwareScrollView
        contentContainerStyle={styles.scrollContainer}
        enableOnAndroid
        extraScrollHeight={Platform.OS === 'ios' ? 20 : 0}
        keyboardShouldPersistTaps="handled"
      >
        <ThemedText type="title" style={styles.headerTitle}>Cadastro de Localização</ThemedText>

        <View style={styles.formContainer}>
          {[
            { label: 'CEP:', value: cep, onChangeText: handleCepChange, placeholder: '00000-000', keyboardType: 'numeric' },
            { label: 'Cidade:', value: cidade, onChangeText: setCidade, placeholder: 'Nome da cidade' },
            { label: 'Bairro:', value: bairro, onChangeText: setBairro, placeholder: 'Nome do bairro' },
            { label: 'Ponto de Referência (opcional):', value: pontoReferencia, onChangeText: setPontoReferencia, placeholder: 'Ex: Próximo à praça central' },
          ].map((field, index) => (
            <View key={index}>
              <ThemedText style={styles.label}>{field.label}</ThemedText>
              <TextInput
                style={[styles.input, { backgroundColor: inputBackgroundColor, color: inputTextColor, borderColor: inputBorderColor }]}
                placeholder={field.placeholder}
                placeholderTextColor="#888"
                value={field.value}
                onChangeText={field.onChangeText}
                keyboardType={field.keyboardType as any}
              />
            </View>
          ))}

          <View style={styles.buttonWrapper}>
            <CustomThemedButton
              title="Salvar Localização"
              onPress={handleSalvarLocalizacao}
              disabled={isSubmitting}
              isLoading={isSubmitting}
            />
          </View>
        </View>

        <ThemedText type="subtitle" style={styles.listHeader}>Localizações Cadastradas</ThemedText>
        {isLoadingData && listaLocalizacoes.length > 0 && <ActivityIndicator size="small" color={textColor} />}
        {listaLocalizacoes.length === 0 ? (
          <ThemedText style={styles.emptyListText}>Nenhuma localização cadastrada.</ThemedText>
        ) : (
          <FlatList
            data={listaLocalizacoes}
            renderItem={renderLocalizacaoItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingBottom: 40 }}
          />
        )}
      </KeyboardAwareScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
  },
  scrollContainer: {
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  centeredLoading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    textAlign: 'center',
    fontSize: 22,
    marginBottom: 24,
  },
  formContainer: {
    marginBottom: 30,
  },
  label: {
    fontSize: 16,
    marginBottom: 6,
    marginTop: 12,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 16,
    fontSize: 16,
    marginBottom: 8,
  },
  buttonWrapper: {
    marginTop: 20,
  },
  listHeader: {
    fontSize: 18,
    marginTop: 20,
    marginBottom: 15,
    textAlign: 'center',
  },
  listItem: {
    padding: 15,
    borderWidth: 1,
    borderRadius: 10,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemContent: {
    flex: 1,
    marginRight: 10,
  },
  itemTextStrong: {
    fontSize: 16,
    marginBottom: 4,
  },
  itemText: {
    fontSize: 14,
    marginBottom: 2,
  },
  itemTextFaded: {
    opacity: 0.8,
  },
  itemTimestamp: {
    fontSize: 11,
    fontStyle: 'italic',
    opacity: 0.7,
    marginTop: 6,
    textAlign: 'right',
  },
  deleteButton: {
    padding: 6,
  },
  emptyListText: {
    textAlign: 'center',
    fontStyle: 'italic',
    opacity: 0.7,
    marginTop: 20,
  },
});