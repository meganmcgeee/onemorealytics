import { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Alert, ActivityIndicator, ScrollView, Modal, TextInput } from 'react-native';
import { useSleepData } from '@/context/SleepContext';
import { Ionicons } from '@expo/vector-icons';

export default function AccountScreen() {
  const { sleepData, isHealthKitAuthorized, userProfile } = useSleepData();
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<string | null>(null);

  // Review Flow State
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [syncPayload, setSyncPayload] = useState<any>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState('Since buying the One More mattress, my deep sleep has literally doubled. The data proves it!');

  const handleSyncToStore = () => {
    setIsSyncing(true);

    // Calculate aggregated stats for the JSON payload
    const avgSleep = sleepData.length > 0 ? (sleepData.reduce((acc, curr) => acc + curr.totalHours, 0) / sleepData.length).toFixed(1) : '0';
    let totalDeep = 0;
    let totalRem = 0;
    sleepData.forEach(day => {
      day.phases.forEach(p => {
        if (p.value === 'DEEP') totalDeep += p.hours;
        if (p.value === 'REM') totalRem += p.hours;
      });
    });
    const avgDeep = sleepData.length > 0 ? (totalDeep / sleepData.length).toFixed(1) : '0';
    const avgRem = sleepData.length > 0 ? (totalRem / sleepData.length).toFixed(1) : '0';

    const payload = {
      customerId: "megan@onemore.com",
      product: "One More Mattress",
      verifiedMetrics: {
        totalNightsLogged: sleepData.length,
        lifetimeAvgSleep: Number(avgSleep),
        lifetimeAvgDeep: Number(avgDeep),
        lifetimeAvgRem: Number(avgRem),
      },
      dataOrigin: "Apple HealthKit",
      timestamp: new Date().toISOString()
    };

    setTimeout(() => {
      setIsSyncing(false);
      setSyncPayload(payload);
      setLastSync(new Date().toLocaleString());
      setShowReviewModal(true); // Launch Review Flow
    }, 1500);
  };

  const submitReview = () => {
    Alert.alert(
      "Review Submitted!", 
      "Your review and verified JSON sleep data payload have been posted to your One More account.",
      [{ text: "OK", onPress: () => setShowReviewModal(false) }]
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.brandTitle}>one more</Text>
      <Text style={styles.header}>Account Profile</Text>

      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>MM</Text>
        </View>
        <Text style={styles.userName}>Megan McGee</Text>
        <Text style={styles.userEmail}>megan@onemore.com</Text>
        <Text style={styles.memberSince}>Sleep member since Oct 2023</Text>
      </View>

      <View style={styles.statsCard}>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{sleepData.length}</Text>
          <Text style={styles.statLabel}>Total Nights Logged</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>
            {sleepData.length > 0 
              ? (sleepData.reduce((acc, curr) => acc + curr.totalHours, 0) / sleepData.length).toFixed(1) 
              : '0'}h
          </Text>
          <Text style={styles.statLabel}>Lifetime Avg Sleep</Text>
        </View>
      </View>

      {userProfile && (
        <View style={styles.profileDetailsCard}>
          <Text style={styles.syncTitle}>Onboarding Profile</Text>
          <View style={{height: 1, backgroundColor: '#E4DFD8', marginVertical: 15}} />
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Bed Environment</Text>
            <Text style={styles.detailValue}>{userProfile.bedPartners} • {userProfile.petsInBed}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Primary Goal</Text>
            <Text style={styles.detailValue}>{userProfile.sleepGoal}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Sleep Position</Text>
            <Text style={styles.detailValue}>{userProfile.sleepPosition}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Temperature</Text>
            <Text style={styles.detailValue}>{userProfile.temperature}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Aches & Pains</Text>
            <Text style={styles.detailValue}>{userProfile.aches}</Text>
          </View>
        </View>
      )}

      <View style={styles.syncCard}>
        <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15}}>
           <Text style={styles.syncTitle}>Apple Health Status</Text>
           {isHealthKitAuthorized ? (
             <View style={styles.statusBadge}><Text style={styles.statusBadgeText}>Connected</Text></View>
           ) : (
             <View style={[styles.statusBadge, {backgroundColor: '#EFEBE4', borderColor: '#E4DFD8'}]}><Text style={[styles.statusBadgeText, {color: '#76706A'}]}>Waiting</Text></View>
           )}
        </View>
        <Text style={styles.syncDesc}>
          Your Sleep Tracker is securely tied to Apple Health. Your tracker will automatically pull new data in the background every time you open the app.
        </Text>

        <View style={{height: 1, backgroundColor: '#E4DFD8', marginVertical: 20}} />

        <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: 10, gap: 10}}>
           <Ionicons name="star" size={20} color="#2A2826" />
           <Text style={styles.syncTitle}>Verified Review Sync</Text>
        </View>
        <Text style={styles.syncDesc}>
          Sync your sleep improvements to your One More e-commerce profile to attach "Verified Sleep Data" to the product reviews you write on our site.
        </Text>
        
        {lastSync && (
          <Text style={styles.lastSync}>Last synced: {lastSync}</Text>
        )}
        
        <TouchableOpacity 
          style={[styles.syncBtn, isSyncing && styles.syncBtnDisabled]} 
          onPress={handleSyncToStore}
          disabled={isSyncing}
        >
          {isSyncing ? (
            <ActivityIndicator color="#F8F6F2" />
          ) : (
            <Text style={styles.syncBtnText}>Sync & Write Review</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* REVIEW FLOW MODAL */}
      <Modal visible={showReviewModal} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <ScrollView style={styles.modalContent} contentContainerStyle={{paddingBottom: 40}}>
            <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20}}>
              <Text style={styles.modalTitle}>Write a Review</Text>
              <TouchableOpacity onPress={() => setShowReviewModal(false)}>
                <Text style={{color: '#76706A', fontWeight: '600'}}>Cancel</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.reviewLabel}>Product Rating</Text>
            <View style={{flexDirection: 'row', gap: 8, marginBottom: 20}}>
              {[1, 2, 3, 4, 5].map(star => (
                <TouchableOpacity key={star} onPress={() => setReviewRating(star)}>
                  <Ionicons name={star <= reviewRating ? "star" : "star-outline"} size={32} color="#4E4841" />
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.reviewLabel}>Your Review</Text>
            <TextInput 
              style={styles.reviewInput}
              multiline
              numberOfLines={4}
              value={reviewText}
              onChangeText={setReviewText}
              placeholder="Tell us about your sleep experience..."
            />

            <View style={styles.payloadBox}>
              <View style={{flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10}}>
                 <Ionicons name="checkmark-circle" size={18} color="#48BB78" />
                 <Text style={styles.payloadTitle}>Verified Sleep Data Attached</Text>
              </View>
              <Text style={styles.payloadDesc}>This JSON payload generated from Apple Health will be publicly attached to your review as proof of your sleep improvements.</Text>
              
              <View style={styles.codeBlock}>
                <Text style={styles.codeText}>{JSON.stringify(syncPayload, null, 2)}</Text>
              </View>
            </View>

            <TouchableOpacity style={styles.submitBtn} onPress={submitReview}>
              <Text style={styles.submitBtnText}>Post Verified Review</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F6F2',
  },
  contentContainer: {
    paddingTop: 80,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  brandTitle: {
    fontSize: 14,
    textTransform: 'lowercase',
    letterSpacing: 2,
    color: '#76706A',
    marginBottom: 4,
  },
  header: {
    fontSize: 32,
    fontFamily: 'Georgia',
    color: '#2A2826',
    letterSpacing: -0.5,
    marginBottom: 30,
  },
  profileCard: {
    alignItems: 'center',
    backgroundColor: '#EFEBE4',
    borderRadius: 8,
    padding: 30,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E4DFD8',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#4E4841',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 28,
    color: '#F8F6F2',
    fontFamily: 'Georgia',
    letterSpacing: 1,
  },
  userName: {
    fontSize: 24,
    fontFamily: 'Georgia',
    color: '#2A2826',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#76706A',
  },
  memberSince: {
    fontSize: 12,
    color: '#A29688',
    marginTop: 10,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  statsCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#EFEBE4',
    borderRadius: 8,
    padding: 20,
    alignItems: 'center',
    marginHorizontal: 5,
    borderWidth: 1,
    borderColor: '#E4DFD8',
  },
  statValue: {
    fontSize: 24,
    fontFamily: 'Georgia',
    color: '#2A2826',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#76706A',
    textTransform: 'uppercase',
    letterSpacing: 1,
    textAlign: 'center',
  },
  syncCard: {
    backgroundColor: '#EFEBE4',
    borderRadius: 8,
    padding: 24,
    borderWidth: 1,
    borderColor: '#E4DFD8',
  },
  syncTitle: {
    fontSize: 18,
    fontFamily: 'Georgia',
    color: '#2A2826',
  },
  statusBadge: {
    backgroundColor: '#4E4841',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  statusBadgeText: {
    color: '#F8F6F2',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  syncDesc: {
    fontSize: 14,
    color: '#76706A',
    lineHeight: 22,
  },
  lastSync: {
    fontSize: 12,
    color: '#A29688',
    marginBottom: 16,
    fontStyle: 'italic',
  },
  syncBtn: {
    backgroundColor: '#2A2826',
    borderRadius: 4,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 10,
  },
  syncBtnDisabled: {
    backgroundColor: '#A29688',
  },
  syncBtnText: {
    color: '#F8F6F2',
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#F8F6F2',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 24,
    maxHeight: '90%',
  },
  modalTitle: {
    fontSize: 24,
    fontFamily: 'Georgia',
    color: '#2A2826',
  },
  reviewLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2A2826',
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  reviewInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E4DFD8',
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    color: '#2A2826',
    minHeight: 100,
    textAlignVertical: 'top',
    marginBottom: 25,
  },
  payloadBox: {
    backgroundColor: '#EFEBE4',
    borderWidth: 1,
    borderColor: '#E4DFD8',
    borderRadius: 8,
    padding: 15,
    marginBottom: 25,
  },
  payloadTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2A2826',
  },
  payloadDesc: {
    fontSize: 12,
    color: '#76706A',
    marginBottom: 15,
    lineHeight: 18,
  },
  codeBlock: {
    backgroundColor: '#2A2826',
    padding: 15,
    borderRadius: 6,
  },
  codeText: {
    color: '#A29688',
    fontFamily: 'Courier',
    fontSize: 12,
  },
  submitBtn: {
    backgroundColor: '#4E4841',
    paddingVertical: 18,
    borderRadius: 4,
    alignItems: 'center',
    marginBottom: 20,
  },
  submitBtnText: {
    color: '#F8F6F2',
    fontSize: 16,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  profileDetailsCard: {
    backgroundColor: '#EFEBE4',
    borderRadius: 8,
    padding: 24,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E4DFD8',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  detailLabel: {
    fontSize: 14,
    color: '#76706A',
  },
  detailValue: {
    fontSize: 14,
    fontFamily: 'Georgia',
    color: '#2A2826',
    fontWeight: '500',
  }
});
