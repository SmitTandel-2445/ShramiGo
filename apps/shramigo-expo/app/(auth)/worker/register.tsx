import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView,
  KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { COLORS } from '@/lib/appConstants';
import { registerWorker } from '@/features/auth/services';

export default function WorkerRegisterScreen() {
  const router = useRouter();
  const [form, setForm] = useState({ full_name: '', phone: '', email: '', password: '', confirmPassword: '' });
  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async () => {
    if (!form.full_name.trim() || !form.phone.trim() || !form.email.trim() || !form.password) {
      setError('Please fill in all required fields.');
      return;
    }
    if (form.password !== form.confirmPassword) { setError('Passwords do not match.'); return; }
    if (form.password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    try {
      setLoading(true);
      setError('');
      await registerWorker({ full_name: form.full_name.trim(), phone: form.phone.trim(), email: form.email.trim(), password: form.password });
      router.replace('/(worker)');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const updateField = (key: keyof typeof form) => (val: string) => setForm(f => ({ ...f, [key]: val }));

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={22} color="#374151" />
          </TouchableOpacity>

          <View style={styles.headingSection}>
            <View style={styles.logoBg}>
              <Ionicons name="hammer" size={28} color={COLORS.primary} />
            </View>
            <Text style={styles.title}>Create Worker Account</Text>
            <Text style={styles.subtitle}>Join ShramiGo as a skilled professional and start earning today.</Text>
          </View>

          <View style={styles.form}>
            {[
              { label: 'Full Name', icon: 'person-outline', placeholder: 'Enter your full name', key: 'full_name', autoCapitalize: 'words' as any },
              { label: 'Phone Number', icon: 'call-outline', placeholder: 'Enter your phone number', key: 'phone', keyboardType: 'phone-pad' as any },
              { label: 'Email Address', icon: 'mail-outline', placeholder: 'Enter your email', key: 'email', keyboardType: 'email-address' as any, autoCapitalize: 'none' as any },
            ].map(({ label, icon, placeholder, key, keyboardType, autoCapitalize }) => (
              <View key={key} style={styles.inputGroup}>
                <Text style={styles.label}>{label}</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name={icon as any} size={18} color="#9CA3AF" style={styles.inputIcon} />
                  <TextInput style={styles.input} placeholder={placeholder} placeholderTextColor="#9CA3AF" value={form[key as keyof typeof form]} onChangeText={updateField(key as keyof typeof form)} keyboardType={keyboardType} autoCapitalize={autoCapitalize ?? 'words'} />
                </View>
              </View>
            ))}

            {[
              { label: 'Password', key: 'password', show: showPass, toggleShow: () => setShowPass(v => !v) },
              { label: 'Confirm Password', key: 'confirmPassword', show: showConfirmPass, toggleShow: () => setShowConfirmPass(v => !v) },
            ].map(({ label, key, show, toggleShow }) => (
              <View key={key} style={styles.inputGroup}>
                <Text style={styles.label}>{label}</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="lock-closed-outline" size={18} color="#9CA3AF" style={styles.inputIcon} />
                  <TextInput style={[styles.input, { flex: 1 }]} placeholder={label} placeholderTextColor="#9CA3AF" value={form[key as keyof typeof form]} onChangeText={updateField(key as keyof typeof form)} secureTextEntry={!show} autoCapitalize="none" />
                  <TouchableOpacity onPress={toggleShow} style={{ padding: 4 }}>
                    <Ionicons name={show ? 'eye-off-outline' : 'eye-outline'} size={20} color="#9CA3AF" />
                  </TouchableOpacity>
                </View>
              </View>
            ))}

            {error ? (
              <View style={styles.errorBox}>
                <Ionicons name="alert-circle-outline" size={16} color="#DC2626" />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            <TouchableOpacity style={styles.registerBtn} onPress={handleRegister} disabled={loading} activeOpacity={0.85}>
              {loading ? <ActivityIndicator color={COLORS.white} /> : (
                <>
                  <Text style={styles.registerBtnText}>Create Worker Account</Text>
                  <Ionicons name="arrow-forward" size={18} color={COLORS.white} />
                </>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account?</Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/worker/login')}>
              <Text style={styles.footerLink}> Sign In</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.white },
  scroll: { flexGrow: 1, paddingHorizontal: 20, paddingBottom: 40 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#F9FAFB', alignItems: 'center', justifyContent: 'center', marginTop: 12 },
  headingSection: { alignItems: 'center', paddingVertical: 20 },
  logoBg: { width: 64, height: 64, borderRadius: 20, backgroundColor: COLORS.primaryLight, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  title: { fontSize: 24, fontWeight: '800', color: '#111827', textAlign: 'center', marginBottom: 6 },
  subtitle: { fontSize: 13, color: '#6B7280', textAlign: 'center', lineHeight: 20, paddingHorizontal: 20 },
  form: { gap: 14 },
  inputGroup: { gap: 6 },
  label: { fontSize: 13, fontWeight: '600', color: '#374151' },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F9FAFB', borderRadius: 14, borderWidth: 1.5, borderColor: '#E5E7EB', paddingHorizontal: 14, height: 52 },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, fontSize: 15, color: '#111827' },
  errorBox: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, backgroundColor: '#FEF2F2', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: '#FCA5A5' },
  errorText: { flex: 1, fontSize: 13, color: '#DC2626', lineHeight: 18 },
  registerBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: COLORS.primary, height: 54, borderRadius: 16, shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4, marginTop: 4 },
  registerBtnText: { fontSize: 16, fontWeight: '700', color: COLORS.white },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 24 },
  footerText: { fontSize: 14, color: '#6B7280' },
  footerLink: { fontSize: 14, color: COLORS.primary, fontWeight: '700' },
});
