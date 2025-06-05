// components/CustomThemedButton.tsx
import React from 'react';
import { Pressable, StyleSheet, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';
import { ThemedText } from '@/components/ThemedText'; // Caminho corrigido
import { useThemeColor } from '@/hooks/useThemeColor';

type CustomThemedButtonProps = {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  isLoading?: boolean;
  style?: ViewStyle;       // Estilo para o container do botão (Pressable)
  textStyle?: TextStyle;   // Estilo para o texto dentro do botão
  type?: 'primary' | 'secondary' | 'destructive'; // Tipos opcionais de botão
};

export function CustomThemedButton({
  title,
  onPress,
  disabled = false,
  isLoading = false,
  style,
  textStyle,
  type = 'primary',
}: CustomThemedButtonProps) {
  // Cores baseadas no tema e no tipo de botão
  // Você precisará definir essas cores em seu constants/Colors.ts
  // Exemplo: 'buttonPrimaryBackground', 'buttonPrimaryText', 'buttonSecondaryBackground', etc.

  const primaryBackgroundColor = useThemeColor({}, 'tint'); // Cor principal do tema para botões primários
  const primaryTextColor = useThemeColor( // Texto que contrasta com a cor 'tint'
    { light: '#FFFFFF', dark: '#000000' }, // Ex: Branco no claro (se tint for escuro), Preto no escuro (se tint for claro)
    // Se sua cor 'tint' for sempre clara (ou sempre escura), você pode fixar uma cor aqui
    // ou criar uma chave específica 'buttonPrimaryText' em Colors.ts
    'text' // Usando 'text' como fallback, mas idealmente uma chave específica
  );

  const secondaryBackgroundColor = useThemeColor({}, 'card'); // Fundo do card para botões secundários
  const secondaryTextColor = useThemeColor({}, 'tint'); // Cor do tint para o texto de botões secundários
  const secondaryBorderColor = useThemeColor({}, 'border');

  const destructiveBackgroundColor = useThemeColor({light: '#D9534F', dark: '#C9302C'}, 'destructiveBackground'); // Vermelho para destrutivo
  const destructiveTextColor = useThemeColor({light: '#FFFFFF', dark: '#FFFFFF'}, 'destructiveText'); // Texto branco para destrutivo

  let currentBackgroundColor: string;
  let currentTextColor: string;
  let currentBorderColor: string | undefined = undefined; // Sem borda por padrão

  switch (type) {
    case 'secondary':
      currentBackgroundColor = secondaryBackgroundColor;
      currentTextColor = secondaryTextColor;
      currentBorderColor = secondaryBorderColor;
      break;
    case 'destructive':
      currentBackgroundColor = destructiveBackgroundColor;
      currentTextColor = destructiveTextColor;
      break;
    case 'primary':
    default:
      currentBackgroundColor = primaryBackgroundColor;
      currentTextColor = primaryTextColor;
      break;
  }

  const finalDisabled = disabled || isLoading;

  return (
    <Pressable
      onPress={onPress}
      disabled={finalDisabled}
      style={({ pressed }) => [
        styles.buttonBase,
        {
          backgroundColor: currentBackgroundColor,
          borderColor: currentBorderColor || currentBackgroundColor, // Fallback para cor de fundo se não houver borda
          borderWidth: type === 'secondary' ? 1 : 0, // Borda apenas para secundário, por exemplo
        },
        (pressed && !finalDisabled) && styles.buttonPressed,
        finalDisabled && styles.buttonDisabled,
        style, // Estilos customizados do usuário para o Pressable
      ]}
    >
      {isLoading ? (
        <ActivityIndicator size="small" color={currentTextColor} />
      ) : (
        <ThemedText style={[styles.textBase, { color: currentTextColor }, textStyle]}>
          {title}
        </ThemedText>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  buttonBase: {
    paddingVertical: 14, // Aumentado para melhor toque
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50,
    flexDirection: 'row', // Para alinhar ActivityIndicator e Texto
  },
  buttonPressed: {
    opacity: 0.8, // Feedback visual ao pressionar
  },
  buttonDisabled: {
    opacity: 0.5, // Feedback visual para botão desabilitado
  },
  textBase: {
    fontSize: 16,
    fontWeight: '600', // Um pouco mais forte para botões
    textAlign: 'center',
  },
});