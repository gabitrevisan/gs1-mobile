// app/(tabs)/tempo.tsx
import React, { useState, useCallback } from 'react';
import {
  StyleSheet,
  TextInput,
  FlatList,
  Alert, 
  View,
  Platform, 
  Text, 
  ActivityIndicator,
  Pressable, 
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useFocusEffect } from '@react-navigation/native';
import { CustomThemedButton } from '@/components/CustomThemedButton';
import { Ionicons } from '@expo/vector-icons';

const ASYNC_STORAGE_KEY_TEMPOS = 'tempos_interrupcao_data_v1';

type TipoDuracao = 'real' | 'estimada';

type RegistroTempo = {
  id: string;
  dataInicio: string;
  horaInicio: string;
  dataFim?: string;
  horaFim?: string;
  tipoDuracao: TipoDuracao;
  observacoes?: string;
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

export default function TempoInterrupcaoScreen() {
  const [dataInicio, setDataInicio] = useState('');
  const [horaInicio, setHoraInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [horaFim, setHoraFim] = useState('');
  const [tipoDuracao, setTipoDuracao] = useState<TipoDuracao>('estimada');
  const [observacoes, setObservacoes] = useState('');

  const [listaRegistros, setListaRegistros] = useState<RegistroTempo[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);

  // Cores do Tema
  const inputBackgroundColor = useThemeColor({ light: '#FFFFFF', dark: '#2C2C2C' }, 'card');
  const inputTextColor = useThemeColor({}, 'text');
  const inputBorderColor = useThemeColor({}, 'border');
  const listItemBackgroundColor = useThemeColor({}, 'card');
  const textColor = useThemeColor({}, 'text'); 
  const tintColor = useThemeColor({}, 'tint'); 
  const subtleBgForInactiveButton = useThemeColor({light: '#E9E9EB', dark: '#2D3748'}, 'card'); 
  const destructiveColor = useThemeColor({light: '#D9534F', dark: '#FF453A'}, 'destructiveBackground');

  const activeButtonTextColor = useThemeColor({}, 'textOnTint'); 
  const inactiveButtonTextColor = useThemeColor({}, 'text'); 


  const carregarRegistros = useCallback(async () => {
    setIsLoadingData(true);
    try {
      const dadosSalvos = await AsyncStorage.getItem(ASYNC_STORAGE_KEY_TEMPOS);
      if (dadosSalvos !== null) {
        const registrosParseados: RegistroTempo[] = JSON.parse(dadosSalvos);
        registrosParseados.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        setListaRegistros(registrosParseados);
      } else {
        setListaRegistros([]);
      }
    } catch (error) {
      console.error('Erro ao carregar registros de tempo:', error);
      showAppAlert('Erro', 'Não foi possível carregar os registros de tempo.');
    } finally {
      setIsLoadingData(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      carregarRegistros();
    }, [carregarRegistros])
  );

  const handleSalvarRegistro = async () => {
    if (!dataInicio.trim() || !horaInicio.trim()) {
      showAppAlert('Campos Obrigatórios', 'Data de Início e Hora de Início são obrigatórios.');
      return;
    }
    if (tipoDuracao === 'real' && (!dataFim.trim() || !horaFim.trim())) {
      showAppAlert('Campos Obrigatórios para Duração Real', 'Data de Fim e Hora de Fim são obrigatórios quando a duração é "Real".');
      return;
    }

    setIsSubmitting(true);
    const novoRegistro: RegistroTempo = {
      id: generateId(),
      dataInicio: dataInicio.trim(),
      horaInicio: horaInicio.trim(),
      dataFim: dataFim.trim() || undefined,
      horaFim: horaFim.trim() || undefined,
      tipoDuracao,
      observacoes: observacoes.trim() || undefined,
      timestamp: new Date().toISOString(),
    };

    try {
      const novaLista = [novoRegistro, ...listaRegistros];
      novaLista.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      await AsyncStorage.setItem(ASYNC_STORAGE_KEY_TEMPOS, JSON.stringify(novaLista));
      setListaRegistros(novaLista);

      setDataInicio('');
      setHoraInicio('');
      setDataFim('');
      setHoraFim('');
      setTipoDuracao('estimada');
      setObservacoes('');
      showAppAlert('Sucesso!', 'Registro de tempo salvo.');
    } catch (error) {
      console.error('Erro ao salvar registro de tempo:', error);
      showAppAlert('Erro', 'Não foi possível salvar o registro de tempo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeletarRegistro = async (idParaDeletar: string) => {
    showAppConfirmationAlert(
      "Confirmar Exclusão",
      "Tem certeza que deseja apagar este registro de tempo?",
      async () => {
        setIsLoadingData(true);
        try {
          const novaLista = listaRegistros.filter(item => item.id !== idParaDeletar);
          await AsyncStorage.setItem(ASYNC_STORAGE_KEY_TEMPOS, JSON.stringify(novaLista));
          setListaRegistros(novaLista);
          showAppAlert('Excluído', 'Registro de tempo removido com sucesso.');
        } catch (error) {
          console.error('Erro ao deletar registro de tempo:', error);
          showAppAlert('Erro', 'Não foi possível remover o registro de tempo.');
        } finally {
          setIsLoadingData(false);
        }
      },
      "Apagar",
      "Cancelar"
    );
  };

  const renderRegistroItem = ({ item }: { item: RegistroTempo }) => (
    <View style={[styles.listItem, { backgroundColor: listItemBackgroundColor, borderColor: inputBorderColor }]}>
      <View style={styles.itemContent}>
        <ThemedText type="defaultSemiBold" style={styles.itemTextStrong}>
          Início: {item.dataInicio} às {item.horaInicio}
        </ThemedText>
        {item.dataFim && item.horaFim && (
          <ThemedText style={styles.itemText}>
            Fim: {item.dataFim} às {item.horaFim}
          </ThemedText>
        )}
        <ThemedText style={[styles.itemText, {textTransform: 'capitalize'}]}>
          Duração: {item.tipoDuracao}
        </ThemedText>
        {item.observacoes && (
          <ThemedText style={[styles.itemText, styles.itemTextFaded]}>
            Obs: {item.observacoes}
          </ThemedText>
        )}
        <ThemedText style={styles.itemTimestamp}>
          Registrado em: {new Date(item.timestamp).toLocaleString('pt-BR')}
        </ThemedText>
      </View>
      <Pressable onPress={() => handleDeletarRegistro(item.id)} style={styles.deleteButton}>
        <Ionicons name="trash-bin-outline" size={24} color={destructiveColor} />
      </Pressable>
    </View>
  );

  if (isLoadingData && !listaRegistros.length) {
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
        <ThemedText type="title" style={styles.headerTitle}>Registro de Tempo de Interrupção</ThemedText>

        <View style={styles.formContainer}>
          <ThemedText style={styles.label}>Data de Início:</ThemedText>
          <TextInput
            style={[styles.input, { backgroundColor: inputBackgroundColor, color: inputTextColor, borderColor: inputBorderColor }]}
            placeholder="DD/MM/AAAA"
            placeholderTextColor="#888"
            value={dataInicio}
            onChangeText={setDataInicio}
            maxLength={10}
          />

          <ThemedText style={styles.label}>Hora de Início:</ThemedText>
          <TextInput
            style={[styles.input, { backgroundColor: inputBackgroundColor, color: inputTextColor, borderColor: inputBorderColor }]}
            placeholder="HH:MM"
            placeholderTextColor="#888"
            value={horaInicio}
            onChangeText={setHoraInicio}
            keyboardType="numeric"
            maxLength={5}
          />

          <ThemedText style={styles.label}>Tipo de Duração:</ThemedText>
          <View style={styles.tipoDuracaoContainer}>
            <Pressable
              style={[
                styles.tipoDuracaoButton,
                tipoDuracao === 'estimada' 
                  ? { backgroundColor: tintColor } 
                  : { backgroundColor: subtleBgForInactiveButton, borderColor: inputBorderColor, borderWidth: 1 },
              ]}
              onPress={() => setTipoDuracao('estimada')}
            >
              <Text style={[
                styles.tipoDuracaoButtonText,
                { color: tipoDuracao === 'estimada' ? activeButtonTextColor : inactiveButtonTextColor }
              ]}>
                Estimada
              </Text>
            </Pressable>
            <Pressable
              style={[
                styles.tipoDuracaoButton,
                tipoDuracao === 'real' 
                  ? { backgroundColor: tintColor } 
                  : { backgroundColor: subtleBgForInactiveButton, borderColor: inputBorderColor, borderWidth: 1 },
              ]}
              onPress={() => setTipoDuracao('real')}
            >
              <Text style={[
                styles.tipoDuracaoButtonText,
                { color: tipoDuracao === 'real' ? activeButtonTextColor : inactiveButtonTextColor }
              ]}>
                Real
              </Text>
            </Pressable>
          </View>

          <ThemedText style={styles.label}>Data de Fim (opcional se estimada):</ThemedText>
          <TextInput
            style={[styles.input, { backgroundColor: inputBackgroundColor, color: inputTextColor, borderColor: inputBorderColor }]}
            placeholder="DD/MM/AAAA"
            placeholderTextColor="#888"
            value={dataFim}
            onChangeText={setDataFim}
            maxLength={10}
            editable={tipoDuracao === 'real' || dataFim.length > 0}
            selectTextOnFocus={tipoDuracao === 'real' || dataFim.length > 0}
          />

          <ThemedText style={styles.label}>Hora de Fim (opcional se estimada):</ThemedText>
          <TextInput
            style={[styles.input, { backgroundColor: inputBackgroundColor, color: inputTextColor, borderColor: inputBorderColor }]}
            placeholder="HH:MM"
            placeholderTextColor="#888"
            value={horaFim}
            onChangeText={setHoraFim}
            keyboardType="numeric"
            maxLength={5}
            editable={tipoDuracao === 'real' || horaFim.length > 0}
            selectTextOnFocus={tipoDuracao === 'real' || horaFim.length > 0}
          />

          <ThemedText style={styles.label}>Observações (opcional):</ThemedText>
          <TextInput
            style={[styles.input, styles.textArea, { backgroundColor: inputBackgroundColor, color: inputTextColor, borderColor: inputBorderColor }]}
            placeholder="Detalhes adicionais sobre a interrupção..."
            placeholderTextColor="#888"
            value={observacoes}
            onChangeText={setObservacoes}
            multiline
            numberOfLines={4}
          />

          <View style={styles.buttonWrapper}>
            <CustomThemedButton
              title="Salvar Registro de Tempo"
              onPress={handleSalvarRegistro}
              disabled={isSubmitting}
              isLoading={isSubmitting}
            />
          </View>
        </View>

        <ThemedText type="subtitle" style={styles.listHeader}>Registros de Tempo de Interrupção</ThemedText>
        {isLoadingData && listaRegistros.length > 0 && <ActivityIndicator size="small" color={textColor} />}
        {listaRegistros.length === 0 && !isLoadingData ? (
          <ThemedText style={styles.emptyListText}>Nenhum registro de tempo encontrado.</ThemedText>
        ) : (
          <FlatList
            data={listaRegistros}
            renderItem={renderRegistroItem}
            keyExtractor={(item) => item.id}
            style={styles.flatList}
            scrollEnabled={false}
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
    minHeight: 80,
    textAlignVertical: 'top',
    paddingTop: 12,
  },
  tipoDuracaoContainer: {
    flexDirection: 'row',
    marginBottom: 15,
    marginTop: 5,
  },
  tipoDuracaoButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 4,
  },
  tipoDuracaoButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  buttonWrapper: {
    marginTop: 20,
    marginBottom: 20,
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
    fontSize: 16,
    marginBottom: 3,
  },
  itemText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 3,
  },
  itemTextFaded: {
    opacity: 0.8,
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
  flatList: {
  }
});