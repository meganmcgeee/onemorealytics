import React, { createContext, useState, useContext, useEffect } from 'react';
import { NativeModules } from 'react-native';

export type SleepPhase = {
  value: string;
  startDate: string;
  endDate: string;
  hours: number;
};

export type SleepEntry = {
  id: string;
  date: string;
  totalHours: number;
  timesAwakened: number;
  phases: SleepPhase[];
  quality: 'Excellent' | 'Good' | 'Fair' | 'Poor';
};

export type UserProfile = {
  bedPartners: string;
  partnerHabits?: string;
  petsInBed: string;
  ageRange: string;
  height: string;
  sleepGoal: string;
  sleepPosition: string;
  temperature: string;
  aches: string;
};

type SleepContextType = {
  sleepData: SleepEntry[];
  syncWithHealthKit: () => Promise<void>;
  isHealthKitAuthorized: boolean;
  systemError: string;
  userProfile: UserProfile | null;
  updateUserProfile: (profile: UserProfile) => void;
};

const SleepContext = createContext<SleepContextType | undefined>(undefined);

// Only ask for read permission
const permissions = {
  permissions: {
    read: ['SleepAnalysis'],
  },
};

export const SleepProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sleepData, setSleepData] = useState<SleepEntry[]>([]);
  const [isHealthKitAuthorized, setIsHealthKitAuthorized] = useState(false);
  const [systemError, setSystemError] = useState('');
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    try {
      NativeModules.AppleHealthKit.initHealthKit(permissions, (error: string) => {
        if (error) {
          setSystemError('Init Error: ' + JSON.stringify(error));
        } else {
          setIsHealthKitAuthorized(true);
          syncWithHealthKit();
        }
      });
    } catch (err: any) {
      setSystemError('Crash Error: ' + err?.message);
    }
  }, []);

  const syncWithHealthKit = async () => {
    // We remove the !isHealthKitAuthorized check here because if called directly
    // from the initHealthKit callback, the state might still read as false due to stale closures.
    
    const options = {
      startDate: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(), // Last 6 months (180 days)
      endDate: new Date().toISOString(),
      limit: 20000,
      ascending: false,
    };

    try {
      NativeModules.AppleHealthKit.getSleepSamples(options, (err: string, results: any[]) => {
        if (err) {
          setSystemError('Sync Error: ' + JSON.stringify(err));
          return;
        }

        if (results && results.length > 0) {
          const grouped: Record<string, { phases: SleepPhase[]; asleep: number; inBed: number; awakenings: number }> = {};

          results.forEach((sample) => {
            const startDate = new Date(sample.startDate);
            const endDate = new Date(sample.endDate);
            const hours = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60);

            // Group by the local date string (wake up day)
            // Offset by a few hours so midnight sleep counts for the next morning
            const adjustedDate = new Date(endDate.getTime() - 4 * 60 * 60 * 1000); 
            const dateKey = adjustedDate.toISOString().split('T')[0];

            if (!grouped[dateKey]) {
              grouped[dateKey] = { phases: [], asleep: 0, inBed: 0, awakenings: 0 };
            }

            grouped[dateKey].phases.push({
              value: sample.value,
              startDate: sample.startDate,
              endDate: sample.endDate,
              hours,
            });

            if (sample.value === 'INBED') {
              grouped[dateKey].inBed += hours;
            } else if (sample.value === 'AWAKE') {
              grouped[dateKey].awakenings += 1;
            } else {
              grouped[dateKey].asleep += hours;
            }
          });

          const mappedData = Object.keys(grouped).map((date) => {
            const dayData = grouped[date];
            // Sort phases chronologically
            dayData.phases.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
            
            const totalHours = dayData.asleep > 0 ? dayData.asleep : dayData.inBed;

            let quality: 'Excellent' | 'Good' | 'Fair' | 'Poor' = 'Good';
            if (totalHours >= 8) quality = 'Excellent';
            else if (totalHours >= 7) quality = 'Good';
            else if (totalHours >= 5) quality = 'Fair';
            else quality = 'Poor';

            return {
              id: date,
              date: date,
              totalHours: Number(totalHours.toFixed(1)),
              timesAwakened: dayData.awakenings,
              phases: dayData.phases,
              quality,
            };
          }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

          setSleepData(mappedData);
        } else {
          setSleepData([]);
        }
      });
    } catch (err: any) {
      setSystemError('Sync Crash Error: ' + err?.message);
    }
  };

  const updateUserProfile = (profile: UserProfile) => {
    setUserProfile(profile);
  };

  return (
    <SleepContext.Provider value={{ sleepData, syncWithHealthKit, isHealthKitAuthorized, systemError, userProfile, updateUserProfile }}>
      {children}
    </SleepContext.Provider>
  );
};

export const useSleepData = () => {
  const context = useContext(SleepContext);
  if (!context) {
    throw new Error('useSleepData must be used within a SleepProvider');
  }
  return context;
};
