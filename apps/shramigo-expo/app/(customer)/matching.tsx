import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '@/lib/appConstants';
import { getAIRecommendations, type AIRecommendationWorker } from '@/features/matching/services';
import { useRouter } from 'expo-router';

export default function AIMatchingScreen() {
  const router = useRouter();
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ explanation: string; workers: AIRecommendationWorker[] } | null>(null);
  const [error, setError] = useState('');

  const handleSearch = async () => {
    if (!description.trim()) { setError('Please describe what you need.'); return; }
    try {
      setLoading(true); setError(''); setResult(null);
      const data = await getAIRecommendations({ description: description.trim(), limit: 5 });
      setResult(data);
    } catch (e: any) { setError(e.message ?? 'Failed to get recommendations.'); } finally { setLoading(false); }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={22} color="#374151" />
          </TouchableOpacity>
          <Text style={styles.title}>AI Worker Matching</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.bannerCard}>
          <View style={styles.bannerIcon}>
            <Ionicons name="sparkles" size={28} color={COLORS.white} />
          </View>
          <Text style={styles.bannerTitle}>Smart Recommendations</Text>
          <Text style={styles.bannerDesc}>Describe your problem and AI will find the best workers for you.</Text>
        </View>

        <View style={styles.inputSection}>
          <Text style={styles.label}>Describe your problem</Text>
          <View style={styles.textAreaWrapper}>
            <TextInput
              style={styles.textArea}
              placeholder="e.g. My kitchen tap is leaking and needs to be fixed urgently..."
              placeholderTextColor="#9CA3AF"
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          {error ? (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle-outline" size={16} color="#DC2626" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <TouchableOpacity style={styles.searchBtn} onPress={handleSearch} disabled={loading} activeOpacity={0.85}>
            {loading ? <ActivityIndicator color={COLORS.white} /> : (
              <>
                <Ionicons name="sparkles" size={18} color={COLORS.white} />
                <Text style={styles.searchBtnText}>Find Best Workers</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {result && (
          <View style={styles.results}>
            <View style={styles.explanationCard}>
              <Text style={styles.explanationTitle}>AI Analysis</Text>
              <Text style={styles.explanationText}>{result.explanation}</Text>
            </View>
            <Text style={styles.resultsTitle}>Top Matches ({result.workers.length})</Text>
            {result.workers.map((w, i) => (
              <TouchableOpacity key={`${w.id}-${i}`} style={styles.workerCard} onPress={() => router.push(`/(customer)/workers/${w.id}` as any)} activeOpacity={0.85}>
                <View style={styles.matchRank}>
                  <Text style={styles.matchRankText}>{i + 1}</Text>
                </View>
                <View style={styles.workerInfo}>
                  <Text style={styles.workerName}>{w.name}</Text>
                  <Text style={styles.workerService}>{w.service}</Text>
                  <View style={styles.workerMeta}>
                    <Ionicons name="star" size={12} color="#F59E0B" />
                    <Text style={styles.metaText}>{w.rating.toFixed(1)}</Text>
                    {w.distance_km && <Text style={styles.metaText}>· {w.distance_km.toFixed(1)} km</Text>}
                  </View>
                  {w.match_reasons.length > 0 && (
                    <Text style={styles.matchReason} numberOfLines={2}>{w.match_reasons[0]}</Text>
                  )}
                </View>
                <View style={styles.workerRight}>
                  <Text style={styles.workerPrice}>₹{w.price}</Text>
                  <Text style={styles.perHour}>/hr</Text>
                  <View style={styles.matchScore}>
                    <Text style={styles.matchScoreText}>{Math.round(w.match_score * 100)}%</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F7F8F8' },
  scroll: { flexGrow: 1, paddingBottom: 32 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 12, paddingBottom: 8 },
  backBtn: { width: 40, height: 40, borderRadius: 14, backgroundColor: '#F9FAFB', alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 18, fontWeight: '800', color: '#111827' },
  bannerCard: { backgroundColor: COLORS.primary, marginHorizontal: 20, marginBottom: 20, borderRadius: 20, padding: 20, alignItems: 'center', gap: 8 },
  bannerIcon: { width: 52, height: 52, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  bannerTitle: { fontSize: 18, fontWeight: '800', color: COLORS.white },
  bannerDesc: { fontSize: 13, color: 'rgba(255,255,255,0.85)', textAlign: 'center', lineHeight: 19 },
  inputSection: { paddingHorizontal: 20, gap: 12, marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '700', color: '#374151' },
  textAreaWrapper: { backgroundColor: COLORS.white, borderRadius: 16, borderWidth: 1.5, borderColor: '#E5E7EB', padding: 14 },
  textArea: { fontSize: 14, color: '#111827', minHeight: 100 },
  errorBox: { flexDirection: 'row', gap: 8, backgroundColor: '#FEF2F2', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: '#FCA5A5' },
  errorText: { flex: 1, fontSize: 13, color: '#DC2626' },
  searchBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: COLORS.primary, height: 52, borderRadius: 16 },
  searchBtnText: { fontSize: 16, fontWeight: '700', color: COLORS.white },
  results: { paddingHorizontal: 20 },
  explanationCard: { backgroundColor: COLORS.primaryLight, borderRadius: 14, padding: 14, marginBottom: 16 },
  explanationTitle: { fontSize: 13, fontWeight: '700', color: COLORS.primary, marginBottom: 4 },
  explanationText: { fontSize: 13, color: '#374151', lineHeight: 19 },
  resultsTitle: { fontSize: 17, fontWeight: '800', color: '#111827', marginBottom: 12 },
  workerCard: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, backgroundColor: COLORS.white, borderRadius: 16, padding: 14, marginBottom: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 2 },
  matchRank: { width: 28, height: 28, borderRadius: 10, backgroundColor: COLORS.primaryLight, alignItems: 'center', justifyContent: 'center' },
  matchRankText: { fontSize: 13, fontWeight: '900', color: COLORS.primary },
  workerInfo: { flex: 1, gap: 3 },
  workerName: { fontSize: 14, fontWeight: '700', color: '#111827' },
  workerService: { fontSize: 12, fontWeight: '600', color: COLORS.primary },
  workerMeta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: 12, color: '#6B7280' },
  matchReason: { fontSize: 11, color: '#6B7280', lineHeight: 16, marginTop: 2 },
  workerRight: { alignItems: 'flex-end', gap: 4 },
  workerPrice: { fontSize: 16, fontWeight: '800', color: '#111827' },
  perHour: { fontSize: 11, color: '#9CA3AF', marginTop: -4 },
  matchScore: { backgroundColor: '#DCFCE7', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  matchScoreText: { fontSize: 11, fontWeight: '800', color: '#16A34A' },
});
