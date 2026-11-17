import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { env } from '@/config/env';
import { errorMessage } from '@/services/apiError';
import { spacing } from '@/theme/tokens';
import { AppButton, Banner, TextField } from '@/ui';
import { useSession } from '../SessionProvider';

const DEMO = { email: 'contratista@trazent.mx', password: 'demo1234' };

export function LoginForm() {
  const { login } = useSession();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const submit = async (credentials = { email, password }) => {
    if (!credentials.email.trim() || !credentials.password) {
      setError('Escribe tu correo y tu contraseña.');
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      // Al cambiar la sesión, el layout raíz lleva al usuario a sus pestañas.
      await login({ email: credentials.email.trim(), password: credentials.password });
    } catch (err) {
      setError(errorMessage(err));
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.form}>
      <TextField
        label="Correo electrónico"
        value={email}
        onChangeText={setEmail}
        placeholder="nombre@empresa.com"
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
        textContentType="emailAddress"
        returnKeyType="next"
      />
      <TextField
        label="Contraseña"
        value={password}
        onChangeText={setPassword}
        placeholder="••••••••"
        secureTextEntry
        autoComplete="current-password"
        textContentType="password"
        returnKeyType="go"
        onSubmitEditing={() => void submit()}
      />
      {error && (
        <Banner tone="red" icon="warning">
          {error}
        </Banner>
      )}
      <AppButton label="Iniciar sesión" onPress={() => void submit()} loading={submitting} />
      {env.useMocks && (
        <AppButton
          label="Entrar con la cuenta de demostración"
          variant="ghost"
          onPress={() => {
            setEmail(DEMO.email);
            setPassword(DEMO.password);
            void submit(DEMO);
          }}
          disabled={submitting}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  form: { gap: spacing.lg },
});
