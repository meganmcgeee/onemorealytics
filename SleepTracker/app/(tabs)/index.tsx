import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, FlatList, Image, Dimensions, Modal, TextInput, SafeAreaView, Keyboard } from 'react-native';
import { useSleepData, SleepPhase, SleepEntry } from '@/context/SleepContext';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

const PHASE_COLORS: Record<string, string> = {
  REM: '#A29688', // Warm Muted Taupe
  CORE: '#797066', // Deeper Taupe
  ASLEEP: '#797066',
  DEEP: '#8879A6', // Muted Lavender
  AWAKE: '#D7CEC2', // Very Light Cream/Sand
  INBED: '#E4DFD8', // Secondary Background
};

const PHASE_LABELS: Record<string, string> = {
  REM: 'REM',
  CORE: 'Core',
  ASLEEP: 'Asleep',
  DEEP: 'Deep',
  AWAKE: 'Awake',
  INBED: 'In Bed',
};

const FUN_FACTS = [
  "Did you know? Your body repairs muscle and tissue primarily during Deep Sleep.",
  "One More sleepers see an average 18% increase in REM sleep in the first 30 days.",
  "Sleeping in a cooler environment (around 65°F) drastically improves Core sleep.",
  "Partners with mismatched chronotypes (Night Owls vs Early Birds) often experience 'motion transfer' awakenings.",
  "Mouth breathing during sleep is linked to higher stress hormones. Nasal breathing increases nitric oxide and deepens rest.",
  "Caffeine has a half-life of 5 hours. A coffee at 4 PM means half of it is still in your system at 9 PM!"
];

type SortOption = 'DateNew' | 'DateOld' | 'BestREM' | 'BestCore' | 'MostWakes' | 'LeastWakes' | 'LongestSleep';

const DEFAULT_EVENTS = ['New Mattress', 'New Pillows', 'Magnesium', 'Melatonin', 'No Alcohol', 'White Noise', 'Mouth Tape', 'Sleep Mask', 'Heavy Workout', 'Other'];

const HABIT_EXPLANATIONS: Record<string, string> = {
  'New Mattress': "A new sleep surface typically takes 30 days to break in. It can dramatically alter spinal alignment and pressure relief.",
  'New Pillows': "Proper neck support opens airways and reduces tossing. It can significantly decrease micro-awakenings and neck stiffness.",
  'Magnesium': "Known as the 'relaxation mineral', Magnesium Glycinate can help regulate the nervous system and increase deep sleep.",
  'Melatonin': "A hormone that regulates the sleep-wake cycle. Supplementing can help shift circadian rhythms but may affect natural production if overused.",
  'No Alcohol': "Alcohol is a potent REM sleep inhibitor. Removing it often causes a 'REM rebound' with higher quality rest.",
  'White Noise': "Continuous ambient sound masks disruptive environmental noises, preventing micro-awakenings.",
  'Mouth Tape': "Forcing nasal breathing increases nitric oxide production, reducing snoring and potentially lowering resting heart rate.",
  'Sleep Mask': "Blocking ambient light maximizes melatonin production, signaling to your circadian rhythm that it's time for Deep sleep.",
  'Heavy Workout': "Intense physical exertion increases adenosine levels, driving sleep pressure up and often resulting in longer, more consolidated Deep sleep.",
  'Other': "Track any custom environmental or dietary change."
};

// Score Calculation Helpers
const getScoreTotal = (hrs: number) => {
  if (hrs >= 8) return 5;
  if (hrs >= 7) return 4;
  if (hrs >= 6) return 3;
  if (hrs >= 5) return 2;
  return 1;
};
const getScoreREM = (pct: number) => {
  if (pct >= 20) return 5;
  if (pct >= 18) return 4;
  if (pct >= 15) return 3;
  if (pct >= 10) return 2;
  return 1;
};
const getScoreDeep = (pct: number) => {
  if (pct >= 15) return 5;
  if (pct >= 13) return 4;
  if (pct >= 10) return 3;
  if (pct >= 5) return 2;
  return 1;
};
const getScoreCore = (pct: number) => {
  if (pct >= 50 && pct <= 60) return 5;
  if (pct >= 45 && pct <= 65) return 4;
  if (pct >= 40) return 3;
  return 2;
};
const getScoreWakes = (wakes: number) => {
  if (wakes === 0) return 5;
  if (wakes === 1) return 4;
  if (wakes === 2) return 3;
  if (wakes === 3) return 2;
  return 1;
};

export default function DashboardScreen() {
  const { sleepData, systemError, updateUserProfile, userProfile } = useSleepData();
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // Onboarding State
  const [onboardingStep, setOnboardingStep] = useState(1);
  const [factIndex, setFactIndex] = useState(0);

  const flatListRef = useRef<FlatList>(null);

  const handleSelectDate = useCallback((date: string) => {
    setSelectedDate(date);
    flatListRef.current?.scrollToIndex({ index: 2, animated: true, viewOffset: 120 });
  }, []);

  // Questionnaire State
  const [bedPartners, setBedPartners] = useState<'Just Me' | '1 Partner' | '2+ Partners' | 'Kids too'>('1 Partner');
  const [partnerHabits, setPartnerHabits] = useState<'Night Owl' | 'Early Bird' | 'Similar to me'>('Similar to me');
  const [petsInBed, setPetsInBed] = useState<'No pets' | 'Dog' | 'Cat' | 'Both'>('No pets');
  const [ageRange, setAgeRange] = useState<'18-24' | '25-34' | '35-44' | '45-54' | '55+'>('25-34');
  const [userHeight, setUserHeight] = useState<'Under 5ft' | '5ft - 5ft 6in' | '5ft 7in - 6ft' | 'Over 6ft'>('5ft 7in - 6ft');
  const [sleepGoal, setSleepGoal] = useState<'More Deep Sleep' | 'Fewer Wakeups' | 'Fall Asleep Faster'>('More Deep Sleep');
  const [sleepPosition, setSleepPosition] = useState<'Side' | 'Back' | 'Stomach' | 'Combo'>('Side');
  const [temperature, setTemperature] = useState<'I sleep hot' | 'I sleep cold' | 'Just right'>('Just right');
  const [aches, setAches] = useState<'Lower Back' | 'Shoulders/Neck' | 'Hips' | 'None'>('None');

  // Generic Event Logging
  const [loggedEvents, setLoggedEvents] = useState<{ id: string, name: string, startDate: string, endDate: string | null }[]>([]);
  const [showLogModal, setShowLogModal] = useState(false);

  // Modal Form State
  const [formName, setFormName] = useState('New Mattress');
  const [customName, setCustomName] = useState('');
  const [formStart, setFormStart] = useState('');
  const [formEnd, setFormEnd] = useState<string | null>(null);
  const [pickerMode, setPickerMode] = useState<'START' | 'END'>('START');

  // Calendar State for Custom Datepicker
  const [calMonth, setCalMonth] = useState(new Date().getMonth());
  const [calYear, setCalYear] = useState(new Date().getFullYear());

  const [sortBy, setSortBy] = useState<SortOption>('DateNew');

  const [geminiInsight, setGeminiInsight] = useState<string>("Analyzing your sleep architecture with Gemini...");
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

  useEffect(() => {
    if (onboardingStep === 4) {
      const interval = setInterval(() => {
        setFactIndex(prev => (prev + 1) % FUN_FACTS.length);
      }, 5500);
      const timeout = setTimeout(() => {
        setOnboardingStep(3);
      }, 11000);
      return () => {
        clearInterval(interval);
        clearTimeout(timeout);
      };
    }
  }, [onboardingStep]);

  useEffect(() => {
    if (sleepData && sleepData.length > 0 && !formStart) {
      setFormStart(sleepData[0].date);
      const d = new Date(sleepData[0].date);
      setCalYear(d.getUTCFullYear());
      setCalMonth(d.getUTCMonth());
    }
  }, [sleepData]);

  const formatDateFull = (ds: string) => {
    if (!ds) return '';
    const parts = ds.split('-');
    if (parts.length !== 3) return ds;
    const dateObj = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
    return dateObj.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };

  const getPhaseTotals = (phases: SleepPhase[]) => {
    const totals: Record<string, number> = { REM: 0, CORE: 0, DEEP: 0, AWAKE: 0, INBED: 0 };
    phases.forEach(p => {
      let key = p.value;
      if (key === 'ASLEEP') key = 'CORE';
      if (totals[key] !== undefined) totals[key] += p.hours;
    });
    const hasStages = totals.REM > 0 || totals.CORE > 0 || totals.DEEP > 0;
    if (hasStages) totals.INBED = 0;
    return totals;
  };

  const calculateSleepScore = (totals: any, totalHours: number, wakes: number) => {
    let score = 0;
    if (totalHours >= 8) score += 2;
    else if (totalHours >= 7) score += 1;

    const realSleep = totals.REM + totals.CORE + totals.DEEP;
    const remPct = realSleep > 0 ? (totals.REM / realSleep) * 100 : 0;
    const deepPct = realSleep > 0 ? (totals.DEEP / realSleep) * 100 : 0;

    if (remPct >= 20) score += 1;
    if (deepPct >= 15) score += 1;
    if (wakes <= 1) score += 1;

    return Math.min(5, Math.max(1, score)); // Returns 1 to 5
  };

  const calculateStreak = () => {
    if (!sleepData || sleepData.length === 0) return 0;
    let streak = 0;
    const sorted = [...sleepData].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    for (const day of sorted) {
      if (day.totalHours >= 7) streak++;
      else break;
    }
    return streak;
  };

  const renderMoonScore = (score: number, size = 16) => {
    return (
      <View style={{ flexDirection: 'row', gap: 4, alignItems: 'center' }}>
        {[1, 2, 3, 4, 5].map(i => (
          <Ionicons key={i} name={i <= score ? "moon" : "moon-outline"} size={size} color="#8879A6" />
        ))}
      </View>
    );
  };

  const sortedData = useMemo(() => {
    if (!sleepData) return [];
    return [...sleepData].sort((a, b) => {
      switch (sortBy) {
        case 'DateNew': return new Date(b.date).getTime() - new Date(a.date).getTime();
        case 'DateOld': return new Date(a.date).getTime() - new Date(b.date).getTime();
        case 'BestREM': return getPhaseTotals(b.phases).REM - getPhaseTotals(a.phases).REM;
        case 'BestCore': return getPhaseTotals(b.phases).CORE - getPhaseTotals(a.phases).CORE;
        case 'MostWakes': return b.timesAwakened - a.timesAwakened;
        case 'LeastWakes': return a.timesAwakened - b.timesAwakened;
        case 'LongestSleep': return b.totalHours - a.totalHours;
        default: return 0;
      }
    });
  }, [sleepData, sortBy]);

  const activeDate = selectedDate || (sleepData && sleepData.length > 0 ? sleepData[0].date : null);
  const activeDayData = activeDate && sleepData ? sleepData.find(d => d.date === activeDate) || sleepData[0] : null;

  useEffect(() => {
    if (!activeDayData) return;
    const generateInsight = async () => {
      setIsGeneratingAI(true);
      setGeminiInsight("Analyzing your sleep architecture with Gemini...");

      const totals = getPhaseTotals(activeDayData.phases);
      const realSleepTotal = totals.REM + totals.CORE + totals.DEEP + totals.INBED;
      const deepPct = realSleepTotal > 0 ? (totals.DEEP / realSleepTotal) * 100 : 0;

      let fallbackParts = [];
      
      if (activeDayData.timesAwakened >= 3) {
        if (userProfile?.petsInBed && userProfile.petsInBed !== 'No pets') fallbackParts.push(`You had ${activeDayData.timesAwakened} micro-awakenings. Is your ${userProfile.petsInBed} taking up too much room?`);
        else fallbackParts.push(`You woke up ${activeDayData.timesAwakened} times. Consider checking your room temperature or noise levels.`);
      } else {
        fallbackParts.push(`Great job minimizing sleep interruptions with only ${activeDayData.timesAwakened} wakes.`);
      }

      if (deepPct > 0 && deepPct < 15) {
        if (userProfile?.aches && userProfile.aches !== 'None') fallbackParts.push(`Your Deep sleep was low at ${deepPct.toFixed(0)}% (${totals.DEEP.toFixed(1)}h). Deep sleep is critical for muscle repair and immune function; since you experience ${userProfile.aches?.toLowerCase() || 'physical'} pain, improving your sleep posture or investing in targeted support could help physical recovery.`);
        else fallbackParts.push(`Your Deep sleep was only ${deepPct.toFixed(0)}% (${totals.DEEP.toFixed(1)}h). Deep sleep is when your body repairs tissues and boosts immune function. Focusing on pressure relief and sleep position might help you increase this phase.`);
      } else if (deepPct >= 15) {
        fallbackParts.push(`Excellent Deep sleep at ${deepPct.toFixed(0)}% (${totals.DEEP.toFixed(1)}h). Deep sleep is vital for cellular repair and immune system strength, setting you up for optimal physical recovery.`);
      }

      if (totals.REM >= 1.5) {
        fallbackParts.push(`You hit a fantastic ${totals.REM.toFixed(1)} hours of REM sleep, meaning your cognitive processing should be operating at peak levels today.`);
      } else {
        fallbackParts.push(`Your REM sleep was somewhat low at ${totals.REM.toFixed(1)} hours. Try unwinding before bed to boost mental recovery.`);
      }

      let fallback = fallbackParts.join(" ");

      const GEMINI_API_KEY: string = process.env.EXPO_PUBLIC_GEMINI_API_KEY || "YOUR_GEMINI_API_KEY_HERE";

      if (GEMINI_API_KEY === "YOUR_GEMINI_API_KEY_HERE") {
        setGeminiInsight(fallback);
        setIsGeneratingAI(false);
        return;
      }

      try {
        let currentHabitText = "None";
        // To check if the active date falls within the logged habit window
        // loggedEvents is accessed from the component state (closure)
        if (loggedEvents && loggedEvents.length > 0) {
          const current = new Date(activeDayData.date);
          const activeEvts = loggedEvents.filter(e => {
            const start = new Date(e.startDate);
            const end = e.endDate ? new Date(e.endDate) : null;
            return current >= start && (!end || current <= end);
          });
          if (activeEvts.length > 0) {
            currentHabitText = activeEvts.map(e => e.name).join(', ');
          }
        }

        const prompt = `You are an expert sleep coach for the "One More" brand. Keep your response to 2-3 short sentences. Tone: confident, premium, empathetic. DO NOT explicitly sell or recommend mattresses; focus purely on physiological insights, lifestyle, and sleep hygiene.
        Data for last night: Total Sleep: ${activeDayData.totalHours}h, Wakes: ${activeDayData.timesAwakened}, REM: ${totals.REM.toFixed(1)}h, Deep: ${totals.DEEP.toFixed(1)}h, Core: ${totals.CORE.toFixed(1)}h. 
        User Profile: Partners: ${userProfile?.bedPartners || 'Just Me'}, Pets: ${userProfile?.petsInBed || 'No pets'}, Pain: ${userProfile?.aches || 'None'}, Height: ${userProfile?.height || 'Average'}.
        Active Habit/Event logged for this night: ${currentHabitText}.
        Provide a highly personalized insight. You MUST explicitly mention their specific REM, Deep, or Core numbers. EMPHASIZE what Deep sleep does for the body (e.g., muscle repair, immune system boosting). If they have partners or pets and had awakenings, analyze "Motion Transfer" (micro-awakenings from tossing/turning), "Temperature Conflicts" with partners, or "Polyphasic Sleep" patterns and "Space Incursion" from pets. Integrate their height if relevant to their aches/pains. If they have an Active Habit, hypothesize its impact.`;

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }]
          })
        });

        const data = await response.json();
        if (data.candidates && data.candidates[0].content.parts[0].text) {
          setGeminiInsight(data.candidates[0].content.parts[0].text.trim());
        } else {
          setGeminiInsight(fallback);
        }
      } catch (error) {
        setGeminiInsight(fallback);
      }
      setIsGeneratingAI(false);
    };

    generateInsight();
  }, [activeDate, activeDayData, userProfile, sleepData]);

  const renderTrendCard = useCallback(({ item: day }: { item: SleepEntry }) => {
    const dayTotals = getPhaseTotals(day.phases);
    const dayTotalTracked = dayTotals.REM + dayTotals.CORE + dayTotals.DEEP + dayTotals.AWAKE + dayTotals.INBED;
    const dayScore = calculateSleepScore(dayTotals, day.totalHours, day.timesAwakened);

    const current = new Date(day.date).getTime();
    const activeEvents = loggedEvents.filter(evt => {
      const start = new Date(evt.startDate).getTime();
      if (evt.endDate) {
        const end = new Date(evt.endDate).getTime();
        return current >= start && current <= end;
      }
      return current >= start;
    });
    
    const startingEvents = loggedEvents.filter(evt => new Date(evt.startDate).getTime() === current);
    const isEventDay = activeEvents.length > 0;
    const isEventStart = startingEvents.length > 0;

    return (
      <TouchableOpacity onPress={() => handleSelectDate(day.date)} style={[styles.trendCard, isEventDay && styles.trendCardHighlight, isEventStart && { borderColor: '#2A2826' }]}>
        {startingEvents.map(evt => (
          <Text key={evt.id} style={styles.purchaseTag}>⭐ EVENT STARTED: {evt.name}</Text>
        ))}
        <View style={styles.trendHeader}>
          <Text style={styles.trendDate}>{day.date.split('-').slice(1).join('/')}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            {renderMoonScore(dayScore, 10)}
            {day.timesAwakened > 0 && <Text style={styles.trendAwake}>{day.timesAwakened} wakes</Text>}
            <Text style={styles.trendTotal}>{day.totalHours} hrs</Text>
          </View>
        </View>
        <View style={styles.trendBarContainer}>
          {Object.entries(dayTotals).map(([phase, hours]) => {
            if (hours <= 0) return null;
            const widthPct = (hours / dayTotalTracked) * 100;
            return <View key={phase} style={[styles.stackedBarSegment, { width: `${widthPct}%`, backgroundColor: PHASE_COLORS[phase] }]} />;
          })}
        </View>
      </TouchableOpacity>
    );
  }, [loggedEvents, handleSelectDate]);

  // --- ONBOARDING MODAL ---
  const renderOnboardingModal = () => {
    return (
      <Modal visible={onboardingStep > 0} animationType="slide" presentationStyle="formSheet">
        {onboardingStep === 1 && (
          <View style={[styles.container, { paddingTop: 100, paddingHorizontal: 24 }]}>
          <Text style={styles.onboardingBrand}>one more</Text>
          <Text style={styles.onboardingTitle}>Who is in your bed?</Text>
          <Text style={{ fontSize: 14, color: '#76706A', fontFamily: 'Georgia', marginBottom: 20 }}>There is always one more. Tell us who you make room for.</Text>
          <Text style={styles.questionLabel}>Humans:</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 25 }}>
            {['Just Me', '1 Partner', '2+ Partners', 'Kids too'].map(opt => (
              <TouchableOpacity key={opt} style={[styles.qBubble, bedPartners === opt && styles.qBubbleActive]} onPress={() => setBedPartners(opt as any)}>
                <Text style={[styles.qText, bedPartners === opt && styles.qTextActive]}>{opt}</Text>
              </TouchableOpacity>
            ))}
          </View>
          {bedPartners !== 'Just Me' && (
            <>
              <Text style={styles.questionLabel}>Is your partner a:</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 25 }}>
                {['Night Owl', 'Early Bird', 'Similar to me'].map(opt => (
                  <TouchableOpacity key={opt} style={[styles.qBubble, partnerHabits === opt && styles.qBubbleActive]} onPress={() => setPartnerHabits(opt as any)}>
                    <Text style={[styles.qText, partnerHabits === opt && styles.qTextActive]}>{opt}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}
          <Text style={styles.questionLabel}>Animals:</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 40 }}>
            {['No pets', 'Dog', 'Cat', 'Both'].map(opt => (
              <TouchableOpacity key={opt} style={[styles.qBubble, petsInBed === opt && styles.qBubbleActive]} onPress={() => setPetsInBed(opt as any)}>
                <Text style={[styles.qText, petsInBed === opt && styles.qTextActive]}>{opt}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <TouchableOpacity style={styles.enterButton} onPress={() => setOnboardingStep(2)}>
            <Text style={styles.enterButtonText}>Next</Text>
          </TouchableOpacity>
        </View>
        )}
        {onboardingStep === 2 && (
        <ScrollView style={styles.container} contentContainerStyle={{ paddingTop: 100, paddingHorizontal: 24, paddingBottom: 60 }}>
          <Text style={styles.onboardingBrand}>one more</Text>
          <Text style={styles.onboardingTitle}>Personalize your data</Text>
          <Text style={styles.questionLabel}>Your Age:</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 25 }}>
            {['18-24', '25-34', '35-44', '45-54', '55+'].map(opt => (
              <TouchableOpacity key={opt} style={[styles.qBubble, ageRange === opt && styles.qBubbleActive]} onPress={() => setAgeRange(opt as any)}>
                <Text style={[styles.qText, ageRange === opt && styles.qTextActive]}>{opt}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.questionLabel}>Your Height:</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 25 }}>
            {['Under 5ft', '5ft - 5ft 6in', '5ft 7in - 6ft', 'Over 6ft'].map(opt => (
              <TouchableOpacity key={opt} style={[styles.qBubble, userHeight === opt && styles.qBubbleActive]} onPress={() => setUserHeight(opt as any)}>
                <Text style={[styles.qText, userHeight === opt && styles.qTextActive]}>{opt}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.questionLabel}>Primary Sleep Goal:</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 25 }}>
            {['More Deep Sleep', 'Fewer Wakeups', 'Fall Asleep Faster'].map(opt => (
              <TouchableOpacity key={opt} style={[styles.qBubble, sleepGoal === opt && styles.qBubbleActive]} onPress={() => setSleepGoal(opt as any)}>
                <Text style={[styles.qText, sleepGoal === opt && styles.qTextActive]}>{opt}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.questionLabel}>Primary Sleep Position:</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 25 }}>
            {['Side', 'Back', 'Stomach', 'Combo'].map(opt => (
              <TouchableOpacity key={opt} style={[styles.qBubble, sleepPosition === opt && styles.qBubbleActive]} onPress={() => setSleepPosition(opt as any)}>
                <Text style={[styles.qText, sleepPosition === opt && styles.qTextActive]}>{opt}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.questionLabel}>Temperature Preference:</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 25 }}>
            {['I sleep hot', 'I sleep cold', 'Just right'].map(opt => (
              <TouchableOpacity key={opt} style={[styles.qBubble, temperature === opt && styles.qBubbleActive]} onPress={() => setTemperature(opt as any)}>
                <Text style={[styles.qText, temperature === opt && styles.qTextActive]}>{opt}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.questionLabel}>Aches & Pains:</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 40 }}>
            {['Lower Back', 'Shoulders/Neck', 'Hips', 'None'].map(opt => (
              <TouchableOpacity key={opt} style={[styles.qBubble, aches === opt && styles.qBubbleActive]} onPress={() => setAches(opt as any)}>
                <Text style={[styles.qText, aches === opt && styles.qTextActive]}>{opt}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <TouchableOpacity style={styles.enterButton} onPress={() => setOnboardingStep(4)}>
            <Text style={styles.enterButtonText}>Analyze My Sleep</Text>
          </TouchableOpacity>
        </ScrollView>
        )}
        {onboardingStep === 3 && (
          <View style={[styles.container, { paddingTop: 100, paddingHorizontal: 24, alignItems: 'center' }]}>
          <Text style={styles.onboardingBrand}>one more</Text>
          <Text style={styles.onboardingTitle}>Master your Sleep</Text>
          <View style={styles.factBox}>
            <Text style={styles.factEyebrow}>Feature Tour</Text>
            <Text style={{ fontSize: 16, color: '#2A2826', fontFamily: 'Georgia', lineHeight: 24, marginBottom: 15 }}>
              1. <Text style={{ fontWeight: 'bold' }}>Log Events & Habits:</Text> Did you buy a new mattress? Start taking Magnesium? You can log these events to see exactly how they impacted your sleep data over time.
            </Text>
            <Text style={{ fontSize: 16, color: '#2A2826', fontFamily: 'Georgia', lineHeight: 24 }}>
              2. <Text style={{ fontWeight: 'bold' }}>Sort Data:</Text> Use the filter chips above your sleep log to instantly find your best nights of REM, Core, and least wakes.
            </Text>
          </View>
          <TouchableOpacity style={styles.enterButton} onPress={() => {
            updateUserProfile({
              bedPartners,
              partnerHabits,
              petsInBed,
              ageRange,
              height: userHeight,
              sleepGoal,
              sleepPosition,
              temperature,
              aches
            });
            setOnboardingStep(0);
          }}>
            <Text style={styles.enterButtonText}>Start Tracking</Text>
          </TouchableOpacity>
        </View>
        )}
        {onboardingStep === 4 && (
          <View style={[styles.container, { paddingTop: 100, paddingHorizontal: 24, alignItems: 'center' }]}>
            <Text style={styles.onboardingBrand}>one more</Text>
            <Text style={styles.onboardingTitle}>Analyzing your profile...</Text>
            <View style={styles.factBox}>
              <Text style={styles.factEyebrow}>While you wait</Text>
              <Text style={{ fontSize: 18, color: '#2A2826', fontFamily: 'Georgia', lineHeight: 28, textAlign: 'center' }}>{FUN_FACTS[factIndex]}</Text>
            </View>
          </View>
        )}
      </Modal>
    );
  };

  // --- DASHBOARD ---
  const handleSaveLog = () => {
    const finalName = formName === 'Other' ? customName : formName;
    if (!finalName.trim() || !formStart) return;
    if (loggedEvents.length >= 7) {
      alert("You can track a maximum of 7 events simultaneously.");
      return;
    }
    setLoggedEvents(prev => [...prev, { id: Date.now().toString(), name: finalName, startDate: formStart, endDate: formEnd }]);
    setShowLogModal(false);
  };

  const totals = activeDayData ? getPhaseTotals(activeDayData.phases) : { REM: 0, CORE: 0, DEEP: 0, AWAKE: 0, INBED: 0 };
  const activeScore = activeDayData ? calculateSleepScore(totals, activeDayData.totalHours, activeDayData.timesAwakened) : 0;
    const totalTracked = totals.REM + totals.CORE + totals.DEEP + totals.AWAKE + totals.INBED;
    const realSleepTotal = totals.REM + totals.CORE + totals.DEEP + totals.INBED;

    const remPct = realSleepTotal > 0 ? (totals.REM / realSleepTotal) * 100 : 0;
    const deepPct = realSleepTotal > 0 ? (totals.DEEP / realSleepTotal) * 100 : 0;
    const corePct = realSleepTotal > 0 ? (totals.CORE / realSleepTotal) * 100 : 0;

    const calcWeekAvg = (week: SleepEntry[]) => {
      let totalHrs = 0; let totalDeep = 0; let totalREM = 0;
      if (!week || week.length === 0) return { avgSleep: 0, avgDeep: 0, avgREM: 0 };
      week.forEach(d => {
        totalHrs += d.totalHours;
        const pt = getPhaseTotals(d.phases);
        totalDeep += pt.DEEP;
        totalREM += pt.REM;
      });
      return { avgSleep: totalHrs / week.length, avgDeep: totalDeep / week.length, avgREM: totalREM / week.length };
    };




    // Calculate Best Records & Streaks
    const currentStreak = calculateStreak();
    let maxREM = { val: 0, date: '' };
    let maxCore = { val: 0, date: '' };
    let longestSleep = { val: 0, date: '' };
    let leastWakes = { val: 999, date: '' };
    let bestScoreNight = { score: 0, hours: 0, date: '' };

    sleepData.forEach(d => {
      const p = getPhaseTotals(d.phases);
      if (p.REM > maxREM.val) maxREM = { val: p.REM, date: d.date };
      if (p.CORE > maxCore.val) maxCore = { val: p.CORE, date: d.date };
      if (d.totalHours > longestSleep.val) longestSleep = { val: d.totalHours, date: d.date };
      if (d.timesAwakened < leastWakes.val) leastWakes = { val: d.timesAwakened, date: d.date };

      const score = calculateSleepScore(p, d.totalHours, d.timesAwakened);
      if (score > bestScoreNight.score || (score === bestScoreNight.score && d.totalHours > bestScoreNight.hours)) {
        bestScoreNight = { score, hours: d.totalHours, date: d.date };
      }
    });

  const formatDateShort = (ds: string) => ds.split('-').slice(1).join('/');

  const listData: any[] = [
    { id: 'header_dashboard', type: 'header_dashboard' },
    { id: 'header_daily_log', type: 'header_daily_log' },
    { id: 'header_breakdown', type: 'header_breakdown' },
    { id: 'header_trends', type: 'header_trends' },
    ...sortedData.map(item => ({ ...item, type: 'trend' }))
  ];

  const renderDashboard = () => (
    <View style={{ paddingTop: 60, paddingHorizontal: 24, paddingBottom: 20 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 }}>
          <Text style={styles.header}>Dashboard</Text>
          <TouchableOpacity style={styles.logButton} onPress={() => setShowLogModal(true)}>
            <Text style={styles.logButtonText}>+ Log Habit</Text>
          </TouchableOpacity>
        </View>

        {systemError ? (
          <View style={styles.errorBox}><Text style={styles.errorText}>{systemError}</Text></View>
        ) : null}

        {/* Impact & Summary Cards */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} snapToInterval={Dimensions.get('window').width - 48 + 15} decelerationRate="fast" style={{ marginHorizontal: -24 }} contentContainerStyle={{ paddingHorizontal: 24, gap: 15, paddingBottom: 10 }}>
          {[null, ...loggedEvents].map(evt => {
            let group1Name = "Last 7 Days";
            let group2Name = "Previous Week";
            let group1: SleepEntry[] = sleepData.slice(0, 7);
            let group2: SleepEntry[] = sleepData.slice(7, 14);

            if (evt) {
              const startIndex = sleepData.findIndex(d => d.date === evt.startDate);
              let endIndex = 0;
              if (evt.endDate) {
                endIndex = sleepData.findIndex(d => d.date === evt.endDate);
                if (endIndex === -1) endIndex = 0;
              }

              if (startIndex !== -1) {
                group1Name = `Since Event`;
                group2Name = `Before Event`;
                group1 = sleepData.slice(endIndex, startIndex + 1);
                const duration = group1.length;
                group2 = sleepData.slice(startIndex + 1, startIndex + 1 + duration);
              }
            }

            const stats1 = calcWeekAvg(group1);
            const stats2 = calcWeekAvg(group2);
            const deepDiff = stats1.avgDeep - stats2.avgDeep;

            return (
              <View style={[styles.card, { width: Dimensions.get('window').width - 48, marginHorizontal: 0 }]} key={evt ? evt.id : 'standout'}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <View>
                    <Text style={styles.cardTitle}>{evt ? `Impact of ${evt.name}` : 'Weekly Standouts'}</Text>
                    <Text style={styles.cardSubtitle}>{group1Name} vs {group2Name}</Text>
                  </View>
                  {evt && (
                    <TouchableOpacity onPress={() => setLoggedEvents(prev => prev.filter(e => e.id !== evt.id))}><Text style={{ fontSize: 12, color: '#76706A', textDecorationLine: 'underline' }}>Clear</Text></TouchableOpacity>
                  )}
                </View>

                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginVertical: 20 }}>
                  <View style={{ alignItems: 'center' }}>
                    <Text style={{ fontSize: 24, fontFamily: 'Georgia', color: '#2A2826' }}>{stats1.avgSleep.toFixed(1)}h</Text>
                    <Text style={{ fontSize: 12, color: '#76706A', textTransform: 'uppercase', letterSpacing: 1, marginTop: 4 }}>Avg Sleep</Text>
                  </View>
                  <View style={{ alignItems: 'center' }}>
                    <Text style={{ fontSize: 24, fontFamily: 'Georgia', color: '#2A2826' }}>{stats1.avgDeep.toFixed(1)}h</Text>
                    <Text style={{ fontSize: 12, color: '#76706A', textTransform: 'uppercase', letterSpacing: 1, marginTop: 4 }}>Avg Deep</Text>
                  </View>
                  <View style={{ alignItems: 'center' }}>
                    <Text style={{ fontSize: 24, fontFamily: 'Georgia', color: '#2A2826' }}>{stats1.avgREM.toFixed(1)}h</Text>
                    <Text style={{ fontSize: 12, color: '#76706A', textTransform: 'uppercase', letterSpacing: 1, marginTop: 4 }}>Avg REM</Text>
                  </View>
                </View>

                {!evt && currentStreak > 0 && (
                  <View style={styles.streakBox}>
                    <Text style={styles.streakEmoji}>🔥</Text>
                    <Text style={styles.streakText}><Text style={{ fontWeight: 'bold' }}>{currentStreak} Night Streak</Text> of 7+ hours of sleep!</Text>
                  </View>
                )}

                {(stats1.avgDeep > 0 || stats2.avgDeep > 0) && (
                  <View style={{ marginTop: 10, paddingTop: 20, borderTopWidth: 1, borderTopColor: '#E4DFD8' }}>
                    <Text style={{ fontSize: 14, color: '#2A2826', marginBottom: 15, fontWeight: '500' }}>Improvement (Deep Sleep)</Text>
                    <View style={styles.barCompare}>
                      <Text style={styles.barLabel}>{group2Name}</Text>
                      <View style={[styles.barFill, { width: '50%', backgroundColor: '#A29688' }]}><Text style={styles.barData}>{stats2.avgDeep.toFixed(1)}h</Text></View>
                    </View>
                    <View style={styles.barCompare}>
                      <Text style={styles.barLabel}>{group1Name} {deepDiff !== 0 ? <Text style={deepDiff > 0 ? { color: '#66806A', fontWeight: 'bold' } : { color: '#A29688' }}>({deepDiff > 0 ? '+' : ''}{deepDiff.toFixed(1)}h)</Text> : null}</Text>
                      <View style={[styles.barFill, { width: `${Math.min(100, 50 + (deepDiff * 20))}%`, backgroundColor: '#8879A6' }]}><Text style={[styles.barData, { color: '#fff' }]}>{stats1.avgDeep.toFixed(1)}h</Text></View>
                    </View>
                  </View>
                )}

                {evt && (
                  <View style={{ marginTop: 15, padding: 12, backgroundColor: '#F8F6F2', borderRadius: 8 }}>
                    {HABIT_EXPLANATIONS[evt.name] && (
                      <Text style={{ fontSize: 13, color: '#76706A', fontStyle: 'italic', marginBottom: 8, lineHeight: 18 }}>
                        "{HABIT_EXPLANATIONS[evt.name]}"
                      </Text>
                    )}
                    <Text style={{ fontSize: 13, color: '#2A2826', fontWeight: '500' }}>
                      {deepDiff > 0 ? `📈 Trending up: Deep sleep improved by ${deepDiff.toFixed(1)}h on average.` : 
                       deepDiff < 0 ? `📉 Trending down: Deep sleep dropped by ${Math.abs(deepDiff).toFixed(1)}h on average.` : 
                       `⏳ No significant change in Deep sleep averages yet.`}
                    </Text>
                  </View>
                )}
              </View>
            );
          })}
        </ScrollView>

        {/* All Time Bests */}
        <Text style={styles.subHeader}>All Time Records</Text>
        <Text style={styles.subSubText}>Tap to view breakdown</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.highlightsScroll}>
          <TouchableOpacity style={styles.highlightCard} onPress={() => handleSelectDate(bestScoreNight.date)}>
            {renderMoonScore(bestScoreNight.score, 18)}
            <Text style={styles.highlightLabel}>Best Night Overall</Text>
            <Text style={styles.highlightDate}>{formatDateShort(bestScoreNight.date)}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.highlightCard} onPress={() => handleSelectDate(longestSleep.date)}>
            <Text style={styles.highlightVal}>{longestSleep.val.toFixed(1)}h</Text>
            <Text style={styles.highlightLabel}>Longest Sleep</Text>
            <Text style={styles.highlightDate}>{formatDateShort(longestSleep.date)}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.highlightCard} onPress={() => handleSelectDate(maxREM.date)}>
            <Text style={styles.highlightVal}>{maxREM.val.toFixed(1)}h</Text>
            <Text style={styles.highlightLabel}>Best REM</Text>
            <Text style={styles.highlightDate}>{formatDateShort(maxREM.date)}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.highlightCard} onPress={() => handleSelectDate(maxCore.date)}>
            <Text style={styles.highlightVal}>{maxCore.val.toFixed(1)}h</Text>
            <Text style={styles.highlightLabel}>Best Core</Text>
            <Text style={styles.highlightDate}>{formatDateShort(maxCore.date)}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.highlightCard} onPress={() => handleSelectDate(leastWakes.date)}>
            <Text style={styles.highlightVal}>{leastWakes.val}</Text>
            <Text style={styles.highlightLabel}>Least Wakes</Text>
            <Text style={styles.highlightDate}>{formatDateShort(leastWakes.date)}</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    );

  const renderDailyLog = () => (
    <View style={{ paddingTop: 20, paddingBottom: 15, backgroundColor: '#F8F6F2', borderBottomWidth: 1, borderBottomColor: '#E4DFD8' }}>
      <Text style={[styles.subHeader, { paddingHorizontal: 24, marginTop: 0 }]}>Daily Log</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={[styles.calendarScroll, { marginTop: 10, paddingHorizontal: 24 }]}>
        {sleepData.slice(0, 30).map((day) => {
          const isSelected = day.date === activeDate;
          const [year, month, d] = day.date.split('-');
          return (
            <TouchableOpacity key={day.date} style={[styles.dateBubble, isSelected && styles.dateBubbleActive]} onPress={() => handleSelectDate(day.date)}>
              <Text style={[styles.dateMonth, isSelected && styles.dateTextActive]}>{month}/{d}</Text>
              <Text style={[styles.dateHours, isSelected && styles.dateTextActive]}>{day.totalHours}h</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );

  const renderBreakdown = () => (
    <View style={{ paddingHorizontal: 24, paddingTop: 20 }}>
      {/* Detailed Breakdown Card */}
      <View style={styles.card}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15, alignItems: 'center' }}>
            <View>
              <Text style={styles.cardTitle}>Detailed Breakdown</Text>
              <Text style={styles.cardSubtitle}>{activeDate}</Text>
            </View>
            {renderMoonScore(activeScore, 20)}
          </View>

          <View style={styles.stackedBarContainer}>
            {Object.entries(totals).map(([phase, hours]) => {
              if (hours <= 0) return null;
              const widthPct = (hours / totalTracked) * 100;
              return <View key={phase} style={[styles.stackedBarSegment, { width: `${widthPct}%`, backgroundColor: PHASE_COLORS[phase] }]} />;
            })}
          </View>

          <View style={styles.legendContainer}>
            {Object.entries(totals).map(([phase, hours]) => {
              if (hours <= 0) return null;
              return (
                <View key={phase} style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: PHASE_COLORS[phase] }]} />
                  <Text style={styles.legendLabel}>{PHASE_LABELS[phase]}: {hours.toFixed(1)}h</Text>
                </View>
              );
            })}
          </View>

          <View style={styles.aiBox}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
              <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#2A2826', letterSpacing: 1, textTransform: 'uppercase' }}>✨ AI Insight</Text>
            </View>
            <Text style={{ fontSize: 15, color: '#8879A6', lineHeight: 22, fontFamily: 'Georgia' }}>{isGeneratingAI ? "Analyzing your sleep architecture..." : geminiInsight}</Text>
          </View>

          {realSleepTotal > 0 && totals.INBED === 0 && (
            <View style={styles.analysisBox}>
              <Text style={styles.analysisTitle}>Quality Diagnostics</Text>

              <View style={[styles.analysisRow, realSleepTotal >= 7 && styles.optimalRow]}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.analysisText, realSleepTotal >= 7 && styles.optimalText]}>
                    Total Sleep: {realSleepTotal.toFixed(1)}h {realSleepTotal >= 7 && '🌟'}
                  </Text>
                  <Text style={[styles.analysisSub, realSleepTotal >= 7 && styles.optimalSub]}>{realSleepTotal >= 7 ? 'Optimal is 7-9h' : 'Aim for 7-9h'}</Text>
                </View>
                {renderMoonScore(getScoreTotal(realSleepTotal), 14)}
              </View>

              <View style={[styles.analysisRow, remPct >= 20 && styles.optimalRow]}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.analysisText, remPct >= 20 && styles.optimalText]}>
                    REM Phase: {remPct.toFixed(0)}% {remPct >= 20 && '🌟'}
                  </Text>
                  <Text style={[styles.analysisSub, remPct >= 20 && styles.optimalSub]}>{remPct >= 20 ? 'Optimal is 20-25%' : 'Aim for 20-25%'}</Text>
                </View>
                {renderMoonScore(getScoreREM(remPct), 14)}
              </View>

              <View style={[styles.analysisRow, deepPct >= 15 && styles.optimalRow]}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.analysisText, deepPct >= 15 && styles.optimalText]}>
                    Deep Phase: {deepPct.toFixed(0)}% {deepPct >= 15 && '🌟'}
                  </Text>
                  <Text style={[styles.analysisSub, deepPct >= 15 && styles.optimalSub]}>{deepPct >= 15 ? 'Optimal is 15-20%' : 'Aim for 15-20%'}</Text>
                </View>
                {renderMoonScore(getScoreDeep(deepPct), 14)}
              </View>

              <View style={[styles.analysisRow, corePct >= 50 && corePct <= 60 && styles.optimalRow]}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.analysisText, corePct >= 50 && corePct <= 60 && styles.optimalText]}>
                    Core Phase: {corePct.toFixed(0)}% {corePct >= 50 && corePct <= 60 && '🌟'}
                  </Text>
                  <Text style={[styles.analysisSub, corePct >= 50 && corePct <= 60 && styles.optimalSub]}>Normal is 50-60%</Text>
                </View>
                {renderMoonScore(getScoreCore(corePct), 14)}
              </View>

              <View style={[styles.analysisRow, (activeDayData?.timesAwakened ?? 0) <= 1 && styles.optimalRow]}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.analysisText, (activeDayData?.timesAwakened ?? 0) <= 1 && styles.optimalText]}>
                    Interruptions: {activeDayData?.timesAwakened ?? 0} {(activeDayData?.timesAwakened ?? 0) <= 1 && '🌟'}
                  </Text>
                  <Text style={[styles.analysisSub, (activeDayData?.timesAwakened ?? 0) <= 1 && styles.optimalSub]}>{(activeDayData?.timesAwakened ?? 0) <= 1 ? 'Optimal' : 'Aim for 0-1 wakes'}</Text>
                </View>
                {renderMoonScore(getScoreWakes(activeDayData?.timesAwakened ?? 0), 14)}
              </View>
            </View>
          )}
        </View>

      </View>
    );

  const renderTrendsHeader = () => (
    <View style={{ paddingTop: 15, paddingBottom: 15, backgroundColor: '#F8F6F2', borderBottomWidth: 1, borderBottomColor: '#E4DFD8' }}>
      <View style={[styles.trendsHeaderWrapper, { marginTop: 0, paddingTop: 0, paddingHorizontal: 24 }]}>
        <Text style={styles.subHeader}>6-Month Trends</Text>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={[styles.filterScroll, { paddingHorizontal: 24 }]}>
        {[{ label: 'Newest', value: 'DateNew' }, { label: 'Oldest', value: 'DateOld' }, { label: 'Longest Sleep', value: 'LongestSleep' }, { label: 'Best REM', value: 'BestREM' }, { label: 'Best Core', value: 'BestCore' }, { label: 'Most Wakes', value: 'MostWakes' }, { label: 'Least Wakes', value: 'LeastWakes' }].map((option) => (
          <TouchableOpacity key={option.value} style={[styles.filterChip, sortBy === option.value && styles.filterChipActive]} onPress={() => setSortBy(option.value as SortOption)}>
            <Text style={[styles.filterText, sortBy === option.value && styles.filterTextActive]}>{option.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  // Generate a classic Calendar Grid
  const generateCalendar = (year: number, month: number) => {
    const firstDay = new Date(Date.UTC(year, month, 1)).getUTCDay();
    const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
    const dates = [];
    for (let i = 0; i < firstDay; i++) dates.push(null);
    for (let i = 1; i <= daysInMonth; i++) {
      const mm = String(month + 1).padStart(2, '0');
      const dd = String(i).padStart(2, '0');
      dates.push(`${year}-${mm}-${dd}`);
    }
    return dates;
  };
  const calendarDates = generateCalendar(calYear, calMonth);
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  const handlePrevMonth = () => {
    if (calMonth === 0) { setCalMonth(11); setCalYear(calYear - 1); }
    else { setCalMonth(calMonth - 1); }
  };
  const handleNextMonth = () => {
    if (calMonth === 11) { setCalMonth(0); setCalYear(calYear + 1); }
    else { setCalMonth(calMonth + 1); }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F8F6F2' }}>
      {renderOnboardingModal()}

      {(!sleepData || sleepData.length === 0) ? (
        <View style={[styles.container, styles.center]}>
          <Image source={require('@/assets/images/hero-bed.jpg')} style={{ width: 200, height: 200, borderRadius: 100, marginBottom: 30 }} />
          <Text style={styles.header}>One More Tracker</Text>
          <Text style={styles.emptyText}>Syncing sleep data...</Text>
          <Text style={styles.emptySub}>Ensure Apple Health has sleep records.</Text>
          {systemError ? (
            <View style={[styles.errorBox, { marginTop: 20 }]}><Text style={styles.errorText}>{systemError}</Text></View>
          ) : null}
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          style={styles.container}
          contentContainerStyle={{ paddingBottom: 60 }}
          data={listData}
          keyExtractor={(item) => item.id}
          stickyHeaderIndices={[1, 3]}
          renderItem={({ item }) => {
            if (item.type === 'header_dashboard') return renderDashboard();
            if (item.type === 'header_daily_log') return renderDailyLog();
            if (item.type === 'header_breakdown') return renderBreakdown();
            if (item.type === 'header_trends') return renderTrendsHeader();
            return <View style={{ paddingHorizontal: 24 }}>{renderTrendCard({ item: item as unknown as SleepEntry })}</View>;
          }}
          initialNumToRender={10}
          windowSize={5}
        />
      )}

      <Modal visible={showLogModal} animationType="slide" transparent={true}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowLogModal(false)}>
          <TouchableOpacity activeOpacity={1} style={styles.modalContent} onPress={() => Keyboard.dismiss()}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <Text style={styles.modalTitle}>Log an Event / Habit</Text>
              <TouchableOpacity onPress={() => setShowLogModal(false)}><Text style={{ color: '#76706A', fontWeight: '600' }}>Cancel</Text></TouchableOpacity>
            </View>

            <Text style={styles.label}>What did you change?</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 10 }}>
              {DEFAULT_EVENTS.map(n => (
                <TouchableOpacity key={n} style={[styles.modalChip, formName === n && styles.modalChipActive]} onPress={() => setFormName(n)}>
                  <Text style={[styles.modalChipText, formName === n && styles.modalChipTextActive]}>{n}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {formName !== 'Other' && HABIT_EXPLANATIONS[formName] && (
              <View style={{ backgroundColor: '#F8F6F2', padding: 12, borderRadius: 8, marginBottom: 15 }}>
                <Text style={{ color: '#76706A', fontSize: 13, lineHeight: 20 }}>{HABIT_EXPLANATIONS[formName]}</Text>
              </View>
            )}

            {formName === 'Other' && (
              <TextInput
                style={styles.textInput}
                placeholder="Type custom habit here..."
                placeholderTextColor="#A29688"
                value={customName}
                onChangeText={setCustomName}
              />
            )}

            <View style={{ flexDirection: 'row', marginTop: 20, marginBottom: 15, backgroundColor: '#EFEBE4', borderRadius: 8, padding: 4 }}>
              <TouchableOpacity
                style={[styles.tabBtn, pickerMode === 'START' && styles.tabBtnActive]}
                onPress={() => setPickerMode('START')}
              >
                <Text style={[styles.tabBtnText, pickerMode === 'START' && styles.tabBtnTextActive]}>Start Date</Text>
                <Text style={[styles.tabSubText, pickerMode === 'START' && styles.tabSubTextActive]}>{formStart ? formatDateFull(formStart) : 'Select'}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tabBtn, pickerMode === 'END' && styles.tabBtnActive]}
                onPress={() => setPickerMode('END')}
              >
                <Text style={[styles.tabBtnText, pickerMode === 'END' && styles.tabBtnTextActive]}>End Date</Text>
                <Text style={[styles.tabSubText, pickerMode === 'END' && styles.tabSubTextActive]}>{formEnd ? formatDateFull(formEnd) : 'Ongoing'}</Text>
              </TouchableOpacity>
            </View>

            {/* CUSTOM CALENDAR PICKER */}
            <View style={styles.calendarWrapper}>
              <View style={styles.calHeader}>
                <TouchableOpacity onPress={handlePrevMonth} style={styles.calArrow}><Text style={styles.calArrowText}>{'<'}</Text></TouchableOpacity>
                <Text style={styles.calMonthText}>{monthNames[calMonth]} {calYear}</Text>
                <TouchableOpacity onPress={handleNextMonth} style={styles.calArrow}><Text style={styles.calArrowText}>{'>'}</Text></TouchableOpacity>
              </View>

              <View style={styles.calDaysRow}>
                {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
                  <Text key={d} style={styles.calDayLabel}>{d}</Text>
                ))}
              </View>

              <View style={styles.calGrid}>
                {calendarDates.map((dateStr, idx) => {
                  if (!dateStr) return <View key={`empty-${idx}`} style={styles.calCell} />;
                  const dayNum = parseInt(dateStr.split('-')[2], 10);

                  // Validation
                  let disabled = false;
                  if (pickerMode === 'END' && new Date(dateStr) < new Date(formStart)) {
                    disabled = true;
                  }
                  if (!sleepData || !sleepData.some(d => d.date === dateStr)) {
                    disabled = true;
                  }

                  const isActive = pickerMode === 'START' ? formStart === dateStr : formEnd === dateStr;

                  return (
                    <TouchableOpacity
                      key={dateStr}
                      disabled={disabled}
                      style={[styles.calCell, isActive && styles.calCellActive, disabled && { opacity: 0.3 }]}
                      onPress={() => pickerMode === 'START' ? setFormStart(dateStr) : setFormEnd(dateStr)}
                    >
                      <Text style={[styles.calCellText, isActive && styles.calCellTextActive, disabled && { color: '#D7CEC2' }]}>{dayNum}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {pickerMode === 'END' && (
                <TouchableOpacity
                  style={[styles.ongoingBtn, formEnd === null && { backgroundColor: '#2A2826', borderColor: '#2A2826' }]}
                  onPress={() => setFormEnd(null)}
                >
                  <Text style={[styles.ongoingBtnText, formEnd === null && { color: '#F8F6F2' }]}>Reset to Ongoing</Text>
                </TouchableOpacity>
              )}
            </View>

            <TouchableOpacity style={[styles.enterButton, { marginTop: 20 }]} onPress={handleSaveLog}>
              <Text style={styles.enterButtonText}>Save Event Log</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F6F2' },
  center: { justifyContent: 'center', alignItems: 'center' },
  content: { paddingTop: 60, paddingHorizontal: 20, paddingBottom: 40 },
  header: { fontSize: 32, fontFamily: 'Georgia', color: '#2A2826', letterSpacing: -0.5 },
  subHeader: { fontSize: 22, fontFamily: 'Georgia', color: '#2A2826', letterSpacing: -0.5 },
  subSubText: { fontSize: 14, color: '#76706A', marginBottom: 15 },
  emptyText: { fontSize: 18, color: '#2A2826', fontFamily: 'Georgia' },
  emptySub: { fontSize: 14, color: '#76706A', marginTop: 8 },
  errorBox: { backgroundColor: '#FEE2E2', padding: 15, borderRadius: 4, marginBottom: 20 },
  errorText: { color: '#DC2626', fontWeight: '500' },

  onboardingContent: { paddingTop: 80, paddingHorizontal: 24, paddingBottom: 40, alignItems: 'center' },
  onboardingBrand: { fontSize: 14, textTransform: 'lowercase', letterSpacing: 2, color: '#76706A', marginBottom: 10 },
  onboardingTitle: { fontSize: 36, fontFamily: 'Georgia', color: '#2A2826', textAlign: 'center', marginBottom: 30, letterSpacing: -0.5 },
  onboardingImage: { width: width - 48, height: 200, borderRadius: 4, marginBottom: 30 },

  questionLabel: { fontSize: 18, fontFamily: 'Georgia', color: '#2A2826', marginBottom: 15, alignSelf: 'flex-start' },
  qBubble: { backgroundColor: '#EFEBE4', paddingVertical: 12, paddingHorizontal: 16, borderRadius: 20, borderWidth: 1, borderColor: '#E4DFD8' },
  qBubbleActive: { backgroundColor: '#8879A6', borderColor: '#8879A6' },
  qText: { fontSize: 14, color: '#76706A', fontWeight: '600' },
  qTextActive: { color: '#F8F6F2' },

  factBox: { width: '100%', backgroundColor: '#EFEBE4', padding: 20, borderRadius: 4, borderWidth: 1, borderColor: '#E4DFD8', marginBottom: 30 },
  factEyebrow: { fontSize: 12, textTransform: 'uppercase', letterSpacing: 2, color: '#76706A', marginBottom: 8 },
  factText: { fontSize: 16, color: '#2A2826', fontFamily: 'Georgia', fontStyle: 'italic', lineHeight: 24 },

  graphBox: { width: '100%', backgroundColor: '#FFFFFF', padding: 20, borderRadius: 4, marginBottom: 40, borderWidth: 1, borderColor: '#E4DFD8' },
  graphTitle: { fontSize: 20, fontFamily: 'Georgia', color: '#2A2826' },
  graphSub: { fontSize: 14, color: '#76706A', marginBottom: 20 },
  barCompare: { marginBottom: 15 },
  barLabel: { fontSize: 14, color: '#2A2826', marginBottom: 6, fontWeight: '500' },
  barFill: { height: 32, borderRadius: 2, justifyContent: 'center', paddingHorizontal: 10 },
  barData: { fontSize: 14, fontWeight: '600', color: '#fff' },

  enterButton: { backgroundColor: '#8879A6', paddingVertical: 18, width: '100%', alignItems: 'center', borderRadius: 4 },
  enterButtonText: { color: '#F8F6F2', fontSize: 16, textTransform: 'lowercase', letterSpacing: 1, fontWeight: '500' },

  streakBox: { backgroundColor: '#F8F6F2', padding: 12, borderRadius: 4, flexDirection: 'row', alignItems: 'center', marginBottom: 10, borderWidth: 1, borderColor: '#E4DFD8' },
  streakEmoji: { fontSize: 20, marginRight: 10 },
  streakText: { fontSize: 14, color: '#2A2826', flex: 1 },

  highlightsScroll: { marginBottom: 25, flexGrow: 0 },
  highlightCard: { backgroundColor: '#EFEBE4', padding: 15, borderRadius: 4, marginRight: 10, minWidth: 120, borderWidth: 1, borderColor: '#E4DFD8', justifyContent: 'center' },
  highlightVal: { fontSize: 24, fontFamily: 'Georgia', color: '#8879A6', marginBottom: 4 },
  highlightLabel: { fontSize: 12, color: '#2A2826', textTransform: 'uppercase', letterSpacing: 1, marginTop: 6 },
  highlightDate: { fontSize: 12, color: '#76706A', marginTop: 4 },

  calendarScroll: { marginBottom: 20, flexGrow: 0, marginTop: 15 },
  dateBubble: { backgroundColor: '#EFEBE4', paddingVertical: 10, paddingHorizontal: 15, borderRadius: 4, marginRight: 10, alignItems: 'center', minWidth: 70, borderWidth: 1, borderColor: '#E4DFD8' },
  dateBubbleActive: { backgroundColor: '#2A2826', borderColor: '#2A2826' },
  dateMonth: { fontSize: 14, fontWeight: '500', color: '#76706A' },
  dateHours: { fontSize: 12, color: '#76706A', marginTop: 2 },
  dateTextActive: { color: '#F8F6F2' },

  card: { backgroundColor: '#EFEBE4', borderRadius: 4, padding: 20, marginBottom: 20, borderWidth: 1, borderColor: '#E4DFD8' },
  cardTitle: { fontSize: 20, fontFamily: 'Georgia', color: '#2A2826' },
  cardSubtitle: { fontSize: 14, color: '#76706A' },
  wakeText: { fontSize: 14, color: '#76706A', marginBottom: 15, fontWeight: '500', letterSpacing: 1, textTransform: 'uppercase' },

  logButton: { paddingVertical: 8, paddingHorizontal: 12, backgroundColor: '#8879A6', borderRadius: 4 },
  logButtonText: { color: '#F8F6F2', fontSize: 12, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1 },

  analysisBox: { marginTop: 15, paddingTop: 15, borderTopWidth: 1, borderTopColor: '#E4DFD8' },
  analysisTitle: { fontSize: 16, fontFamily: 'Georgia', color: '#2A2826', marginBottom: 12 },
  analysisRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  analysisText: { fontSize: 14, color: '#2A2826', fontWeight: '500', marginBottom: 2 },
  analysisSub: { fontSize: 12, color: '#76706A' },
  optimalRow: { backgroundColor: '#F8F6F2', padding: 12, borderRadius: 8, marginHorizontal: -12, borderLeftWidth: 3, borderLeftColor: '#A29688' },
  optimalText: { fontWeight: 'bold' },
  optimalSub: { color: '#A29688', fontWeight: '600' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#F8F6F2', borderTopLeftRadius: 16, borderTopRightRadius: 16, padding: 24, paddingBottom: 40, maxHeight: height * 0.95 },
  modalTitle: { fontSize: 24, fontFamily: 'Georgia', color: '#2A2826' },
  label: { fontSize: 14, fontWeight: '600', color: '#2A2826', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 1 },
  modalChip: { backgroundColor: '#EFEBE4', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 20, borderWidth: 1, borderColor: '#E4DFD8' },
  modalChipActive: { backgroundColor: '#8879A6', borderColor: '#8879A6' },
  modalChipText: { fontSize: 14, color: '#76706A', fontWeight: '500' },
  modalChipTextActive: { color: '#F8F6F2' },

  textInput: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E4DFD8', borderRadius: 4, padding: 12, fontSize: 16, color: '#2A2826', marginTop: 10 },

  tabBtn: { flex: 1, alignItems: 'center', paddingVertical: 10, borderRadius: 6 },
  tabBtnActive: { backgroundColor: '#FFFFFF', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 3, shadowOffset: { width: 0, height: 1 } },
  tabBtnText: { fontSize: 14, fontWeight: '600', color: '#76706A', textTransform: 'uppercase', letterSpacing: 0.5 },
  tabBtnTextActive: { color: '#2A2826' },
  tabSubText: { fontSize: 12, color: '#A29688', marginTop: 2 },
  tabSubTextActive: { color: '#8879A6', fontWeight: '500' },

  calendarWrapper: { backgroundColor: '#FFFFFF', borderRadius: 8, padding: 15, borderWidth: 1, borderColor: '#E4DFD8' },
  calHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  calArrow: { padding: 5, paddingHorizontal: 15 },
  calArrowText: { fontSize: 18, color: '#76706A', fontWeight: '600' },
  calMonthText: { fontSize: 16, fontFamily: 'Georgia', color: '#2A2826', fontWeight: '500' },
  calDaysRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  calDayLabel: { width: '14.2%', textAlign: 'center', fontSize: 12, color: '#76706A', fontWeight: '600' },
  calGrid: { flexDirection: 'row', flexWrap: 'wrap', rowGap: 8 },
  calCell: { width: '14.2%', aspectRatio: 1, justifyContent: 'center', alignItems: 'center' },
  calCellActive: { backgroundColor: '#8879A6', borderRadius: 100 },
  calCellText: { fontSize: 14, color: '#2A2826', fontWeight: '500' },
  calCellTextActive: { color: '#F8F6F2' },
  ongoingBtn: { marginTop: 15, paddingVertical: 8, alignItems: 'center', borderRadius: 4, borderWidth: 1, borderColor: '#E4DFD8' },
  ongoingBtnText: { fontSize: 14, color: '#76706A', fontWeight: '600' },

  stackedBarContainer: { height: 24, flexDirection: 'row', borderRadius: 2, overflow: 'hidden', backgroundColor: '#E4DFD8', marginBottom: 20 },
  stackedBarSegment: { height: '100%' },

  legendContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  legendItem: { flexDirection: 'row', alignItems: 'center', width: '45%', marginBottom: 10 },
  legendDot: { width: 12, height: 12, borderRadius: 2, marginRight: 8 },
  legendLabel: { fontSize: 14, color: '#2A2826', fontWeight: '500' },

  trendsHeaderWrapper: { marginTop: 10, marginBottom: 15 },
  filterScroll: { marginBottom: 20, flexGrow: 0 },
  filterChip: { paddingHorizontal: 16, paddingVertical: 8, backgroundColor: '#EFEBE4', borderRadius: 20, marginRight: 10, borderWidth: 1, borderColor: '#E4DFD8' },
  filterChipActive: { backgroundColor: '#8879A6', borderColor: '#8879A6' },
  filterText: { fontSize: 12, color: '#76706A', fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1 },
  filterTextActive: { color: '#F8F6F2' },

  trendCard: { backgroundColor: '#EFEBE4', borderRadius: 4, padding: 15, marginBottom: 12, borderWidth: 1, borderColor: '#E4DFD8' },
  trendCardHighlight: { borderColor: '#8879A6', borderWidth: 2 },
  purchaseTag: { fontSize: 12, fontWeight: '700', color: '#8879A6', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  trendHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  trendDate: { fontSize: 16, fontFamily: 'Georgia', color: '#2A2826' },
  trendTotal: { fontSize: 16, fontWeight: '600', color: '#2A2826' },
  trendAwake: { fontSize: 12, color: '#A29688', fontWeight: '600', marginRight: 10, textTransform: 'uppercase', letterSpacing: 1 },
  trendBarContainer: { height: 12, flexDirection: 'row', borderRadius: 2, overflow: 'hidden', backgroundColor: '#E4DFD8' },
  aiBox: { backgroundColor: '#EFEBE4', padding: 16, borderRadius: 8, marginBottom: 20, borderLeftWidth: 4, borderLeftColor: '#8879A6' }
});
