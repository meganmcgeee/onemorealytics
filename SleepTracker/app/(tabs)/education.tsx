import React from 'react';
import { StyleSheet, View, Text, ScrollView } from 'react-native';

export default function EducationScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.brandTitle}>one more</Text>
      <Text style={styles.header}>The Science of Sleep</Text>
      
      <Text style={styles.introText}>
        Understanding your sleep phases is the first step to improving them. Here is what your Apple Health tracker is actually measuring every night.
      </Text>

      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={[styles.dot, {backgroundColor: '#5A67D8'}]} />
          <Text style={styles.cardTitle}>Deep Sleep</Text>
        </View>
        <Text style={styles.cardSubtitle}>Physical Restoration</Text>
        <Text style={styles.cardBody}>
          This is the most restorative stage of sleep. During deep sleep, your heart rate and breathing hit their lowest levels, and your brain waves slow down significantly. This is when your body repairs muscle, grows tissue, and strengthens its immune system.
        </Text>
        <Text style={styles.cardGoal}>Goal: 15-20% of your night</Text>
      </View>

      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={[styles.dot, {backgroundColor: '#48BB78'}]} />
          <Text style={styles.cardTitle}>REM Sleep</Text>
        </View>
        <Text style={styles.cardSubtitle}>Cognitive Processing</Text>
        <Text style={styles.cardBody}>
          Rapid Eye Movement (REM) is where dreaming occurs. Your brain becomes highly active, similar to when you're awake. REM is crucial for memory consolidation, emotional regulation, and learning. It acts as overnight therapy for your brain.
        </Text>
        <Text style={styles.cardGoal}>Goal: 20-25% of your night</Text>
      </View>

      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={[styles.dot, {backgroundColor: '#ED8936'}]} />
          <Text style={styles.cardTitle}>Core (Light) Sleep</Text>
        </View>
        <Text style={styles.cardSubtitle}>The Transition State</Text>
        <Text style={styles.cardBody}>
          Core sleep acts as the foundational baseline of your night. You spend about half your total sleep time in this phase. It's the bridge between wakefulness and deep sleep, helping to process memories and maintain basic motor skills.
        </Text>
        <Text style={styles.cardGoal}>Goal: ~50% of your night</Text>
      </View>

      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={[styles.dot, {backgroundColor: '#E53E3E'}]} />
          <Text style={styles.cardTitle}>Wakeups</Text>
        </View>
        <Text style={styles.cardSubtitle}>Sleep Fragmentation</Text>
        <Text style={styles.cardBody}>
          These are micro-awakenings. Often caused by a partner tossing, pets moving, or temperature spikes. Even if you don't remember waking up, your tracker catches these interruptions. They fragment your sleep architecture and severely drop your overall sleep score.
        </Text>
        <Text style={styles.cardGoal}>Goal: Under 2 awakenings per night</Text>
      </View>

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
    paddingBottom: 60,
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
    marginBottom: 15,
  },
  introText: {
    fontSize: 16,
    color: '#76706A',
    lineHeight: 24,
    marginBottom: 30,
    fontFamily: 'Georgia',
  },
  card: {
    backgroundColor: '#EFEBE4',
    borderRadius: 8,
    padding: 24,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E4DFD8',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 10,
  },
  cardTitle: {
    fontSize: 22,
    fontFamily: 'Georgia',
    color: '#2A2826',
  },
  cardSubtitle: {
    fontSize: 13,
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: '#A29688',
    marginBottom: 12,
    fontWeight: '600',
  },
  cardBody: {
    fontSize: 15,
    color: '#4E4841',
    lineHeight: 22,
    marginBottom: 16,
  },
  cardGoal: {
    fontSize: 14,
    fontStyle: 'italic',
    color: '#2A2826',
    fontWeight: '500',
  }
});
