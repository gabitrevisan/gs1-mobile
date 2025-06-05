// app/(tabs)/prejuizos.tsx
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

const ASYNC_STORAGE_KEY_PREJUIZOS = 'prejuizos_data_v1';

type RegistroPrejuizo = {
  id: string;
  dataOcorrencia: string; 
  descricao: string;
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
  confirmText: string = "Confirmar",
  cancelText: string = "Cancelar"
) => {
  if (Platform.OS === 'web') {
    if (window.confirm(`${title}\n${message}`)) {
      onConfirm();
    }
  } else {
    Alert.alert(
      title,
      message,
      [
        { text: cancelText, style: "cancel" },
        { text: confirmText, style: "destructive", onPress: onConfirm }
      ],
      { cancelable: true }
    );
  }
};

export default function PrejuizosScreen() {
  const [dataOcorrencia, setDataOcorrencia] = useState('');
  const [descricao, setDescricao] = useState('');
  const [listaPrejuizos, setListaPrejuizos] = useState<RegistroPrejuizo[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);

  const inputBackgroundColor = useThemeColor({ light: '#FFFFFF', dark: '#2C2C2C' }, 'card');
  const inputTextColor = useThemeColor({}, 'text');
  const inputBorderColor = useThemeColor({}, 'border');
  const listItemBackgroundColor = useThemeColor({}, 'card');
  const textColor = useThemeColor({}, 'text');
  const destructiveColor = useThemeColor({light: '#D9534F', dark: '#FF453A'}, 'destructiveBackground');

  const carregarPrejuizos = useCallback(async () => {
    setIsLoadingData(true);
    try {
      const dadosSalvos = await AsyncStorage.getItem(ASYNC_STORAGE_KEY_PREJUIZOS);
      if (dadosSalvos !== null) {
        const registrosParseados: RegistroPrejuizo[] = JSON.parse(dadosSalvos);
        registrosParseados.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        setListaPrejuizos(registrosParseados);
      } else {
        setListaPrejuizos([]);
      }
    } catch (error) {
      console.error('Erro ao carregar registros de prejuízos:', error);
      showAppAlert('Erro', 'Não foi possível carregar os registros de prejuízos.');
    } finally {
      setIsLoadingData(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      carregarPrejuizos();
    }, [carregarPrejuizos])
  );

  const handleSalvarPrejuizo = async () => {
    if (!dataOcorrencia.trim() || !descricao.trim()) {
      showAppAlert('Campos Obrigatórios', 'Data da Ocorrência e Descrição são obrigatórios.');
      return;
    }

    setIsSubmitting(true);
    const novoPrejuizo: RegistroPrejuizo = {
      id: generateId(),
      dataOcorrencia: dataOcorrencia.trim(),
      descricao: descricao.trim(),
      timestamp: new Date().toISOString(),
    };

    try {
      const novaLista = [novoPrejuizo, ...listaPrejuizos];
      novaLista.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      await AsyncStorage.setItem(ASYNC_STORAGE_KEY_PREJUIZOS, JSON.stringify(novaLista));
      setListaPrejuizos(novaLista);

      setDataOcorrencia('');
      setDescricao('');
      showAppAlert('Sucesso!', 'Registro de prejuízo salvo.');
    } catch (error) {
      console.error('Erro ao salvar registro de prejuízo:', error);
      showAppAlert('Erro', 'Não foi possível salvar o registro.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeletarPrejuizo = async (idParaDeletar: string) => {
    showAppConfirmationAlert(
      "Confirmar Exclusão",
      "Tem certeza que deseja apagar este registro de prejuízo?",
      async () => {
        setIsLoadingData(true);
        try {
          const novaLista = listaPrejuizos.filter(item => item.id !== idParaDeletar);
          await AsyncStorage.setItem(ASYNC_STORAGE_KEY_PREJUIZOS, JSON.stringify(novaLista));
          setListaPrejuizos(novaLista);
          showAppAlert('Excluído', 'Registro de prejuízo removido com sucesso.');
        } catch (error) {
          console.error('Erro ao deletar registro de prejuízo:', error);
          showAppAlert('Erro', 'Não foi possível remover o registro.');
        } finally {
          setIsLoadingData(false);
        }
      },
      "Apagar",
      "Cancelar"
    );
  };

  const renderPrejuizoItem = ({ item }: { item: RegistroPrejuizo }) => (
    <View style={[styles.listItem, { backgroundColor: listItemBackgroundColor, borderColor: inputBorderColor }]}>
      <View style={styles.itemContent}>
        <ThemedText type="defaultSemiBold" style={styles.itemTextStrong}>
          Data: {item.dataOcorrencia}
        </ThemedText>
        <ThemedText style={styles.itemText}>
          {item.descricao}
        </ThemedText>
        <ThemedText style={styles.itemTimestamp}>
          Registrado em: {new Date(item.timestamp).toLocaleString('pt-BR')}
        </ThemedText>
      </View>
      <Pressable onPress={() => handleDeletarPrejuizo(item.id)} style={styles.deleteButton}>
        <Ionicons name="trash-bin-outline" size={24} color={destructiveColor} />
      </Pressable>
    </View>
  );

  if (isLoadingData && !listaPrejuizos.length) {
    return (
      <ThemedView style={styles.centeredLoading}>
        <ActivityIndicator size="large" color={textColor} />
        <ThemedText>Carregando registros...</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.outerContainer}>
      <KeyboardAwareScrollView
        contentContainerStyle={styles.scrollContainer}
        enableOnAndroid={true}
        extraScrollHeight={Platform.OS === 'ios' ? 20 : 0}
        keyboardShouldPersistTaps="handled"
      >
        <ThemedText type="title" style={styles.headerTitle}>Registro de Prejuízos Causados</ThemedText>

        <View style={styles.formContainer}>
          <ThemedText style={styles.label}>Data da Ocorrência do Prejuízo:</ThemedText>
          <TextInput
            style={[styles.input, { backgroundColor: inputBackgroundColor, color: inputTextColor, borderColor: inputBorderColor }]}
            placeholder="DD/MM/AAAA"
            placeholderTextColor="#888"
            value={dataOcorrencia}
            onChangeText={setDataOcorrencia}
            maxLength={10}
          />

          <ThemedText style={styles.label}>Descrição dos Prejuízos:</ThemedText>
          <TextInput
            style={[styles.input, styles.textArea, { backgroundColor: inputBackgroundColor, color: inputTextColor, borderColor: inputBorderColor }]}
            placeholder="Descreva os prejuízos observados (residências, estabelecimentos, etc.)"
            placeholderTextColor="#888"
            value={descricao}
            onChangeText={setDescricao}
            multiline
            numberOfLines={6} 
          />

          <View style={styles.buttonWrapper}>
            <CustomThemedButton
              title="Salvar Registro de Prejuízo"
              onPress={handleSalvarPrejuizo}
              disabled={isSubmitting}
              isLoading={isSubmitting}
            />
          </View>
        </View>

        <ThemedText type="subtitle" style={styles.listHeader}>Registros de Prejuízos</ThemedText>
        {isLoadingData && listaPrejuizos.length > 0 && <ActivityIndicator size="small" color={textColor} />}
        {listaPrejuizos.length === 0 && !isLoadingData ? (
          <ThemedText style={styles.emptyListText}>Nenhum registro de tempo encontrado.</ThemedText>
        ) : (
          <FlatList
            data={listaPrejuizos}
            renderItem={renderPrejuizoItem}
            keyExtractor={(item) => item.id}
            style={styles.flatList}
            scrollEnabled={false}
          />
        )}
        <View style={{ height: 40 }} />
      </KeyboardAwareScrollView>
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
    paddingBottom: 50,
  },
  centeredLoading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    textAlign: 'center',
    marginBottom: 24,
  },
  formContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 6,
    marginTop: 12,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    fontSize: 16,
    marginBottom: 10,
  },
  textArea: {
    minHeight: 120,
    textAlignVertical: 'top',
    paddingTop: 12,
  },
  buttonWrapper: {
  marginTop: 20,
  marginBottom: 100,
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
    borderRadius: 8,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemContent: {
    flex: 1,
    marginRight: 10,
  },
  itemTextStrong: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  itemText: {
    fontSize: 15,
    lineHeight: 21,
    marginBottom: 3,
  },
  itemTimestamp: {
    fontSize: 10,
    fontStyle: 'italic',
    opacity: 0.7,
    marginTop: 8,
    textAlign: 'right',
  },
  deleteButton: {
    padding: 8,
  },
  emptyListText: {
    textAlign: 'center',
    marginTop: 20,
    fontStyle: 'italic',
    opacity: 0.7,
  },
  flatList: {},
});
