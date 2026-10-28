import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ActivityIndicator, Alert,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { colors } from '../theme';

const friendlyError = (code) => {
  switch (code) {
    case 'auth/invalid-email': return 'That email address looks invalid.';
    case 'auth/email-already-in-use': return 'An account with this email already exists. Log in instead.';
    case 'auth/weak-password': return 'Use a password with at least 6 characters.';
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found': return 'Email or password is incorrect.';
    case 'auth/too-many-requests': return 'Too many attempts. Try again in a few minutes.';
    default: return 'Something went wrong. Check your connection and try again.';
  }
};

export default function AuthScreen() {
  const { logIn, signUp } = useAuth();
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const isLogin = mode === 'login';

  const submit = async () => {
    if (!email.trim() || !password) {
      Alert.alert('Missing details', 'Enter your email and password.');
      return;
    }
    setBusy(true);
    try {
      await (isLogin ? logIn : signUp)(email.trim(), password);
    } catch (e) {
      Alert.alert(isLogin ? 'Could not log in' : 'Could not create account', friendlyError(e.code));
    } finally {
      setBusy(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.card}>
        <Text style={styles.brand}>Personal Notes</Text>
        <Text style={styles.sub}>
          {isLogin ? 'Log in to see your notes.' : 'Create an account to start writing.'}
        </Text>

        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor={colors.muted}
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor={colors.muted}
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <TouchableOpacity style={styles.button} onPress={submit} disabled={busy}>
          {busy ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>{isLogin ? 'Log in' : 'Create account'}</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setMode(isLogin ? 'signup' : 'login')}>
          <Text style={styles.switch}>
            {isLogin ? 'New here? Create an account' : 'Have an account? Log in'}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
     flex: 1, 
     backgroundColor: colors.bg,
     justifyContent: 'center', padding: 20 
    },

  card: {
     backgroundColor: colors.surface, borderRadius: 16,
      padding: 24,
       borderWidth: 1,
        borderColor: colors.line 
    },

  brand: {
     fontSize: 28,
      fontWeight: '800',
       color: colors.ink 
      },

  sub: {
     color: colors.muted,
      marginTop: 4, 
      marginBottom: 20,
       fontSize: 15
       },

  input: {
    borderWidth: 1,
     borderColor: colors.line, borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 12,
     fontSize: 16,
    color: colors.ink, 
    marginBottom: 12, backgroundColor: colors.bg,
  },

  button: {
     backgroundColor: colors.primary, borderRadius: 10, paddingVertical: 14,
      alignItems: 'center', marginTop: 4 },

  buttonText: {
     color: '#fff',
      fontWeight: '700', 
      fontSize: 16 },

  switch: {
     color: colors.primary, textAlign: 'center',
      marginTop: 18, 
      fontWeight: '600' },
});
