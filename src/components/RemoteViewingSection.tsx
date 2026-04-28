/**
 * Remote Viewing Section Component
 * 
 * Collapsible container for quantum remote viewing functionality.
 * Contains Practice mode (quantum number/image prediction) and Tournament mode.
 * Designed to fit in the main grid layout like other sections.
 * 
 * Supports fullscreen mode like Equalizer and FrequencyVisualizer.
 * Tracks user scores with localStorage persistence (future: backend/leaderboard).
 */

import React, { useState, useCallback, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  IconButton,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Divider,
  Chip,
  keyframes,
  LinearProgress,
  CircularProgress
} from '@mui/material';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';

// ============ ANIMATIONS ============

const quantumFlicker = keyframes`
  0%, 100% { opacity: 1; }
  25% { opacity: 0.7; }
  50% { opacity: 0.4; }
  75% { opacity: 0.8; }
`;

const subtleGlow = keyframes`
  0%, 100% { text-shadow: 0 0 20px rgba(0, 255, 136, 0.4); }
  50% { text-shadow: 0 0 40px rgba(0, 255, 136, 0.7); }
`;

const correctPulse = keyframes`
  0%, 100% { box-shadow: 0 0 20px rgba(0, 255, 136, 0.5); }
  50% { box-shadow: 0 0 40px rgba(0, 255, 136, 0.8); }
`;

const wrongShake = keyframes`
  0%, 100% { transform: translateX(0); }
  20% { transform: translateX(-8px); }
  40% { transform: translateX(8px); }
  60% { transform: translateX(-8px); }
  80% { transform: translateX(8px); }
`;

const imageGlow = keyframes`
  0%, 100% { box-shadow: 0 0 20px rgba(138, 43, 226, 0.4); }
  50% { box-shadow: 0 0 40px rgba(138, 43, 226, 0.7); }
`;

// ============ TYPES ============

interface QuantumEntanglement {
  quantumNumber: number;
  entanglementCode: string;
  timestamp: string;
}

// 🔥 NEW: Image entanglement
interface ImageEntanglement {
  targetImageSeed: string;      // Seed for the target image
  decoyImageSeeds: string[];    // Seeds for 3 decoy images
  entanglementCode: string;
  timestamp: string;
}

interface UserScore {
  // Number prediction scores
  oddsCorrect: number;
  oddsAttempts: number;
  evensCorrect: number;
  evensAttempts: number;
  // 🔥 Image prediction scores
  imageCorrect: number;
  imageAttempts: number;
  // Streaks
  currentStreak: number;
  bestStreak: number;
  lastPlayed: string;
  history: ScoreHistoryEntry[];
}

interface ScoreHistoryEntry {
  timestamp: string;
  quantumNumber?: number;
  imageSeed?: string;
  userGuess: number | string;
  correct: boolean;
  guessMode: GuessMode;
  targetType: TargetType;
}

// 🔥 Active session state for persistence across refresh
interface ActiveSession {
  targetType: TargetType;
  // Number mode
  entanglement?: QuantumEntanglement;
  multipleChoiceOptions?: number[];
  // Image mode
  imageEntanglement?: ImageEntanglement;
  shuffledImageSeeds?: string[];
  // Common
  phase: RVPhase;
  guessMode: GuessMode;
  createdAt: string;
}

type GuessMode = 'free_entry' | 'multiple_choice';
type RVPhase = 'idle' | 'viewing' | 'guessing' | 'reveal';
type RVMode = 'practice' | 'tournament';
type TargetType = 'number' | 'image';  // 🔥 NEW

// ============ CONSTANTS ============

const STORAGE_KEY = 'ebl_rv_scores';
const SESSION_KEY = 'ebl_rv_active_session';
const MAX_HISTORY = 100;
const SESSION_EXPIRY_MS = 30 * 60 * 1000;  // 30 minutes

// 🔥 Image configuration
const PICSUM_BASE = 'https://picsum.photos/seed';
const IMAGE_WIDTH = 300;
const IMAGE_HEIGHT = 200;

const DEFAULT_SCORE: UserScore = {
  oddsCorrect: 0,
  oddsAttempts: 0,
  evensCorrect: 0,
  evensAttempts: 0,
  imageCorrect: 0,
  imageAttempts: 0,
  currentStreak: 0,
  bestStreak: 0,
  lastPlayed: '',
  history: []
};

// ============ HELPERS ============

const generateEntanglementCode = (): string => {
  const part1 = Math.floor(1000 + Math.random() * 9000);
  const part2 = Math.floor(1000 + Math.random() * 9000);
  return `${part1}-${part2}`;
};

const generateQuantumNumber = (): number => {
  return Math.floor(1 + Math.random() * 99);
};

const generateDecoys = (correctNumber: number): number[] => {
  const isOneDigit = correctNumber < 10;
  const min = isOneDigit ? 1 : 10;
  const max = isOneDigit ? 9 : 99;
  
  const decoys: number[] = [];
  while (decoys.length < 2) {
    const decoy = Math.floor(min + Math.random() * (max - min + 1));
    if (decoy !== correctNumber && !decoys.includes(decoy)) {
      decoys.push(decoy);
    }
  }
  return decoys;
};

// 🔥 Generate unique image seed
const generateImageSeed = (): string => {
  return `rv_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
};

// 🔥 Generate 3 unique decoy seeds
const generateDecoyImageSeeds = (targetSeed: string): string[] => {
  const decoys: string[] = [];
  while (decoys.length < 3) {
    const seed = generateImageSeed();
    if (seed !== targetSeed && !decoys.includes(seed)) {
      decoys.push(seed);
    }
  }
  return decoys;
};

// 🔥 Get image URL from seed
const getImageUrl = (seed: string, width = IMAGE_WIDTH, height = IMAGE_HEIGHT): string => {
  return `${PICSUM_BASE}/${seed}/${width}/${height}`;
};

const shuffleArray = <T,>(arr: T[]): T[] => {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

const loadScores = (): UserScore => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return { ...DEFAULT_SCORE, ...JSON.parse(stored) };
    }
  } catch (e) {
    console.warn('Failed to load RV scores:', e);
  }
  return { ...DEFAULT_SCORE };
};

const saveScores = (scores: UserScore): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(scores));
  } catch (e) {
    console.warn('Failed to save RV scores:', e);
  }
};

const calculateAccuracy = (correct: number, attempts: number): number => {
  if (attempts === 0) return 0;
  return Math.round((correct / attempts) * 100);
};

// 🔥 Session persistence helpers
const loadActiveSession = (): ActiveSession | null => {
  try {
    const stored = localStorage.getItem(SESSION_KEY);
    if (stored) {
      const session: ActiveSession = JSON.parse(stored);
      
      const createdAt = new Date(session.createdAt).getTime();
      const now = Date.now();
      if (now - createdAt > SESSION_EXPIRY_MS) {
        console.log('🕒 RV session expired, clearing...');
        clearActiveSession();
        return null;
      }
      
      if (session.phase === 'reveal') {
        clearActiveSession();
        return null;
      }
      
      console.log('🔄 Restored active RV session:', session.entanglement?.entanglementCode || session.imageEntanglement?.entanglementCode);
      return session;
    }
  } catch (e) {
    console.warn('Failed to load RV session:', e);
  }
  return null;
};

const saveActiveSession = (session: ActiveSession): void => {
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } catch (e) {
    console.warn('Failed to save RV session:', e);
  }
};

const clearActiveSession = (): void => {
  try {
    localStorage.removeItem(SESSION_KEY);
  } catch (e) {
    console.warn('Failed to clear RV session:', e);
  }
};

// ============ MAIN COMPONENT ============

interface RemoteViewingSectionProps {
  isFullscreen?: boolean;
  onExitFullscreen?: () => void;
}

const RemoteViewingSection: React.FC<RemoteViewingSectionProps> = ({
  isFullscreen = false,
  onExitFullscreen
}) => {
  // Mode and phase state
  const [rvMode, setRvMode] = useState<RVMode>('practice');
  const [phase, setPhase] = useState<RVPhase>('idle');
  const [guessMode, setGuessMode] = useState<GuessMode>('multiple_choice');
  const [targetType, setTargetType] = useState<TargetType>('number');  // 🔥 NEW
  
  // Number mode state
  const [entanglement, setEntanglement] = useState<QuantumEntanglement | null>(null);
  const [userGuess, setUserGuess] = useState<number | null>(null);
  const [freeEntryInput, setFreeEntryInput] = useState('');
  const [multipleChoiceOptions, setMultipleChoiceOptions] = useState<number[]>([]);
  
  // 🔥 Image mode state
  const [imageEntanglement, setImageEntanglement] = useState<ImageEntanglement | null>(null);
  const [shuffledImageSeeds, setShuffledImageSeeds] = useState<string[]>([]);
  const [selectedImageSeed, setSelectedImageSeed] = useState<string | null>(null);
  const [imagesLoading, setImagesLoading] = useState(false);
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());
  
  // Common state
  const [isCorrect, setIsCorrect] = useState(false);
  const [isMaterializing, setIsMaterializing] = useState(false);

  // Score tracking
  const [scores, setScores] = useState<UserScore>(DEFAULT_SCORE);
  const [showStats, setShowStats] = useState(false);
  const [sessionRestored, setSessionRestored] = useState(false);

  // Load scores and active session on mount
  useEffect(() => {
    setScores(loadScores());
    
    const savedSession = loadActiveSession();
    if (savedSession) {
      setTargetType(savedSession.targetType);
      setPhase(savedSession.phase);
      setGuessMode(savedSession.guessMode);
      
      if (savedSession.targetType === 'number' && savedSession.entanglement) {
        setEntanglement(savedSession.entanglement);
        setMultipleChoiceOptions(savedSession.multipleChoiceOptions || []);
      } else if (savedSession.targetType === 'image' && savedSession.imageEntanglement) {
        setImageEntanglement(savedSession.imageEntanglement);
        setShuffledImageSeeds(savedSession.shuffledImageSeeds || []);
      }
      
      setSessionRestored(true);
      setTimeout(() => setSessionRestored(false), 3000);
    }
  }, []);

  // ============ SCORE HANDLERS ============

  const updateScores = useCallback((
    target: number | string, 
    guess: number | string, 
    correct: boolean,
    type: TargetType
  ) => {
    setScores(prev => {
      const isOdds = type === 'number' && typeof target === 'number' && target < 10;
      const newHistory: ScoreHistoryEntry = {
        timestamp: new Date().toISOString(),
        quantumNumber: type === 'number' ? target as number : undefined,
        imageSeed: type === 'image' ? target as string : undefined,
        userGuess: guess,
        correct,
        guessMode,
        targetType: type
      };

      const updated: UserScore = {
        ...prev,
        oddsCorrect: type === 'number' && isOdds ? prev.oddsCorrect + (correct ? 1 : 0) : prev.oddsCorrect,
        oddsAttempts: type === 'number' && isOdds ? prev.oddsAttempts + 1 : prev.oddsAttempts,
        evensCorrect: type === 'number' && !isOdds ? prev.evensCorrect + (correct ? 1 : 0) : prev.evensCorrect,
        evensAttempts: type === 'number' && !isOdds ? prev.evensAttempts + 1 : prev.evensAttempts,
        imageCorrect: type === 'image' ? prev.imageCorrect + (correct ? 1 : 0) : prev.imageCorrect,
        imageAttempts: type === 'image' ? prev.imageAttempts + 1 : prev.imageAttempts,
        currentStreak: correct ? prev.currentStreak + 1 : 0,
        bestStreak: correct ? Math.max(prev.bestStreak, prev.currentStreak + 1) : prev.bestStreak,
        lastPlayed: new Date().toISOString(),
        history: [newHistory, ...prev.history].slice(0, MAX_HISTORY)
      };

      saveScores(updated);
      return updated;
    });
  }, [guessMode]);

  const resetScores = useCallback(() => {
    if (window.confirm('Reset all scores? This cannot be undone.')) {
      setScores(DEFAULT_SCORE);
      saveScores(DEFAULT_SCORE);
    }
  }, []);

  // ============ GAME HANDLERS ============

  const handleGenerate = useCallback(() => {
    setIsMaterializing(true);
    setEntanglement(null);
    setImageEntanglement(null);
    setUserGuess(null);
    setSelectedImageSeed(null);
    setFreeEntryInput('');
    setIsCorrect(false);
    setLoadedImages(new Set());

    setTimeout(() => {
      const code = generateEntanglementCode();
      const timestamp = new Date().toISOString();

      if (targetType === 'number') {
        // Number mode
        const quantumNum = generateQuantumNumber();
        const newEntanglement: QuantumEntanglement = {
          quantumNumber: quantumNum,
          entanglementCode: code,
          timestamp
        };

        let options: number[] = [];
        if (guessMode === 'multiple_choice') {
          const decoys = generateDecoys(quantumNum);
          options = shuffleArray([quantumNum, ...decoys]);
          setMultipleChoiceOptions(options);
        }

        setEntanglement(newEntanglement);
        setPhase('viewing');

        saveActiveSession({
          targetType: 'number',
          entanglement: newEntanglement,
          multipleChoiceOptions: options,
          phase: 'viewing',
          guessMode,
          createdAt: timestamp
        });
      } else {
        // 🔥 Image mode
        const targetSeed = generateImageSeed();
        const decoySeeds = generateDecoyImageSeeds(targetSeed);
        
        const newImageEntanglement: ImageEntanglement = {
          targetImageSeed: targetSeed,
          decoyImageSeeds: decoySeeds,
          entanglementCode: code,
          timestamp
        };

        const allSeeds = shuffleArray([targetSeed, ...decoySeeds]);
        
        setImageEntanglement(newImageEntanglement);
        setShuffledImageSeeds(allSeeds);
        setPhase('viewing');
        setImagesLoading(true);

        saveActiveSession({
          targetType: 'image',
          imageEntanglement: newImageEntanglement,
          shuffledImageSeeds: allSeeds,
          phase: 'viewing',
          guessMode,
          createdAt: timestamp
        });
      }

      setIsMaterializing(false);
    }, 1200);
  }, [targetType, guessMode]);

  const handleReadyToGuess = useCallback(() => {
    setPhase('guessing');
    
    const timestamp = entanglement?.timestamp || imageEntanglement?.timestamp || new Date().toISOString();
    
    if (targetType === 'number' && entanglement) {
      saveActiveSession({
        targetType: 'number',
        entanglement,
        multipleChoiceOptions,
        phase: 'guessing',
        guessMode,
        createdAt: timestamp
      });
    } else if (targetType === 'image' && imageEntanglement) {
      saveActiveSession({
        targetType: 'image',
        imageEntanglement,
        shuffledImageSeeds,
        phase: 'guessing',
        guessMode,
        createdAt: timestamp
      });
    }
  }, [targetType, entanglement, imageEntanglement, multipleChoiceOptions, shuffledImageSeeds, guessMode]);

  const handleFreeEntrySubmit = useCallback(() => {
    if (!entanglement) return;
    
    const guess = parseInt(freeEntryInput, 10);
    if (isNaN(guess) || guess < 1 || guess > 99) return;

    const correct = guess === entanglement.quantumNumber;
    setUserGuess(guess);
    setIsCorrect(correct);
    updateScores(entanglement.quantumNumber, guess, correct, 'number');
    setPhase('reveal');
    clearActiveSession();
  }, [entanglement, freeEntryInput, updateScores]);

  const handleMultipleChoiceSelect = useCallback((selectedNumber: number) => {
    if (!entanglement) return;

    const correct = selectedNumber === entanglement.quantumNumber;
    setUserGuess(selectedNumber);
    setIsCorrect(correct);
    updateScores(entanglement.quantumNumber, selectedNumber, correct, 'number');
    setPhase('reveal');
    clearActiveSession();
  }, [entanglement, updateScores]);

  // 🔥 Image selection handler
  const handleImageSelect = useCallback((seed: string) => {
    if (!imageEntanglement) return;

    const correct = seed === imageEntanglement.targetImageSeed;
    setSelectedImageSeed(seed);
    setIsCorrect(correct);
    updateScores(imageEntanglement.targetImageSeed, seed, correct, 'image');
    setPhase('reveal');
    clearActiveSession();
  }, [imageEntanglement, updateScores]);

  const handleReset = useCallback(() => {
    setPhase('idle');
    setEntanglement(null);
    setImageEntanglement(null);
    setUserGuess(null);
    setSelectedImageSeed(null);
    setFreeEntryInput('');
    setMultipleChoiceOptions([]);
    setShuffledImageSeeds([]);
    setIsCorrect(false);
    setLoadedImages(new Set());
    clearActiveSession();
  }, []);

  const handleBack = useCallback(() => {
    if (phase === 'viewing') {
      handleReset();
    } else if (phase === 'guessing') {
      setPhase('viewing');
      
      const timestamp = entanglement?.timestamp || imageEntanglement?.timestamp || new Date().toISOString();
      
      if (targetType === 'number' && entanglement) {
        saveActiveSession({
          targetType: 'number',
          entanglement,
          multipleChoiceOptions,
          phase: 'viewing',
          guessMode,
          createdAt: timestamp
        });
      } else if (targetType === 'image' && imageEntanglement) {
        saveActiveSession({
          targetType: 'image',
          imageEntanglement,
          shuffledImageSeeds,
          phase: 'viewing',
          guessMode,
          createdAt: timestamp
        });
      }
    } else if (phase === 'reveal') {
      handleReset();
    }
  }, [phase, handleReset, targetType, entanglement, imageEntanglement, multipleChoiceOptions, shuffledImageSeeds, guessMode]);

  // Track image loading
  const handleImageLoad = useCallback((seed: string) => {
    setLoadedImages(prev => new Set(prev).add(seed));
  }, []);

  // Check if all images loaded
  useEffect(() => {
    if (targetType === 'image' && shuffledImageSeeds.length === 4 && loadedImages.size === 4) {
      setImagesLoading(false);
    }
  }, [targetType, shuffledImageSeeds, loadedImages]);

  // ============ COMPUTED VALUES ============

  const totalAttempts = scores.oddsAttempts + scores.evensAttempts + scores.imageAttempts;
  const totalCorrect = scores.oddsCorrect + scores.evensCorrect + scores.imageCorrect;
  const overallAccuracy = calculateAccuracy(totalCorrect, totalAttempts);
  const oddsAccuracy = calculateAccuracy(scores.oddsCorrect, scores.oddsAttempts);
  const evensAccuracy = calculateAccuracy(scores.evensCorrect, scores.evensAttempts);
  const imageAccuracy = calculateAccuracy(scores.imageCorrect, scores.imageAttempts);

  // ============ RENDER CONTENT ============
  
  const renderContent = (fullscreenMode: boolean) => {
    const fontSize = fullscreenMode ? {
      title: '1.5rem',
      subtitle: '1rem',
      code: { xs: '4rem', sm: '6rem', md: '8rem' },
      number: { xs: '5rem', sm: '8rem', md: '10rem' },
      button: '1.2rem',
      text: '1rem',
      small: '0.9rem'
    } : {
      title: '0.9rem',
      subtitle: '0.75rem',
      code: { xs: '1.8rem', sm: '2.5rem' },
      number: '3rem',
      button: '1rem',
      text: '0.85rem',
      small: '0.7rem'
    };

    const imageSize = fullscreenMode ? { width: 280, height: 180 } : { width: 140, height: 90 };

    // ============ STATS PANEL ============
    const renderStatsPanel = () => (
      <Box sx={{ 
        p: fullscreenMode ? 3 : 1.5, 
        bgcolor: 'rgba(0,0,0,0.3)', 
        borderRadius: 2,
        border: '1px solid rgba(138,43,226,0.3)'
      }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography sx={{ color: '#8a2be2', fontWeight: 600, fontSize: fullscreenMode ? '1.3rem' : '0.9rem' }}>
            📊 Your Stats
          </Typography>
          <Button 
            size="small" 
            onClick={() => setShowStats(false)}
            sx={{ color: '#666', fontSize: fullscreenMode ? '0.9rem' : '0.7rem' }}
          >
            ← Back
          </Button>
        </Box>

        {/* Overall Stats */}
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
            <Typography sx={{ color: '#888', fontSize: fontSize.small }}>Overall Accuracy</Typography>
            <Typography sx={{ color: '#00ff88', fontWeight: 600, fontSize: fontSize.small }}>
              {overallAccuracy}%
            </Typography>
          </Box>
          <LinearProgress 
            variant="determinate" 
            value={overallAccuracy} 
            sx={{ 
              height: 6, 
              borderRadius: 3,
              bgcolor: 'rgba(255,255,255,0.1)',
              '& .MuiLinearProgress-bar': { bgcolor: '#00ff88' }
            }} 
          />
        </Box>

        {/* Breakdown - 3 columns now */}
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: '1fr 1fr 1fr', 
          gap: fullscreenMode ? 2 : 1,
          mb: 2
        }}>
          {/* Single Digits (1-9) */}
          <Box sx={{ p: 1, bgcolor: 'rgba(138,43,226,0.1)', borderRadius: 1 }}>
            <Typography sx={{ color: '#8a2be2', fontSize: '0.7rem', mb: 0.5 }}>
              🔢 Single
            </Typography>
            <Typography sx={{ color: '#00ff88', fontWeight: 700, fontSize: fullscreenMode ? '1.3rem' : '0.9rem' }}>
              {scores.oddsCorrect}/{scores.oddsAttempts}
            </Typography>
            <Typography sx={{ color: '#666', fontSize: '0.6rem' }}>
              {oddsAccuracy}%
            </Typography>
          </Box>

          {/* Double Digits (10-99) */}
          <Box sx={{ p: 1, bgcolor: 'rgba(0,255,136,0.1)', borderRadius: 1 }}>
            <Typography sx={{ color: '#00ff88', fontSize: '0.7rem', mb: 0.5 }}>
              🔢 Double
            </Typography>
            <Typography sx={{ color: '#00ff88', fontWeight: 700, fontSize: fullscreenMode ? '1.3rem' : '0.9rem' }}>
              {scores.evensCorrect}/{scores.evensAttempts}
            </Typography>
            <Typography sx={{ color: '#666', fontSize: '0.6rem' }}>
              {evensAccuracy}%
            </Typography>
          </Box>

          {/* 🔥 Images */}
          <Box sx={{ p: 1, bgcolor: 'rgba(255,107,0,0.1)', borderRadius: 1 }}>
            <Typography sx={{ color: '#ff6b00', fontSize: '0.7rem', mb: 0.5 }}>
              🖼️ Images
            </Typography>
            <Typography sx={{ color: '#ff6b00', fontWeight: 700, fontSize: fullscreenMode ? '1.3rem' : '0.9rem' }}>
              {scores.imageCorrect}/{scores.imageAttempts}
            </Typography>
            <Typography sx={{ color: '#666', fontSize: '0.6rem' }}>
              {imageAccuracy}%
            </Typography>
          </Box>
        </Box>

        {/* Streaks */}
        <Box sx={{ 
          display: 'flex', 
          gap: 2, 
          justifyContent: 'center',
          p: 1,
          bgcolor: 'rgba(255,255,255,0.05)',
          borderRadius: 1
        }}>
          <Box sx={{ textAlign: 'center' }}>
            <Typography sx={{ color: '#ff6b00', fontSize: fullscreenMode ? '2rem' : '1.3rem', fontWeight: 700 }}>
              🔥 {scores.currentStreak}
            </Typography>
            <Typography sx={{ color: '#666', fontSize: '0.7rem' }}>Current Streak</Typography>
          </Box>
          <Divider orientation="vertical" flexItem sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />
          <Box sx={{ textAlign: 'center' }}>
            <Typography sx={{ color: '#ffd700', fontSize: fullscreenMode ? '2rem' : '1.3rem', fontWeight: 700 }}>
              🏆 {scores.bestStreak}
            </Typography>
            <Typography sx={{ color: '#666', fontSize: '0.7rem' }}>Best Streak</Typography>
          </Box>
        </Box>

        {/* Recent History */}
        {scores.history.length > 0 && (
          <Box sx={{ mt: 2 }}>
            <Typography sx={{ color: '#888', fontSize: fontSize.small, mb: 1 }}>Recent Attempts</Typography>
            <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
              {scores.history.slice(0, 20).map((entry, idx) => (
                <Chip
                  key={idx}
                  label={entry.targetType === 'image' ? '🖼️' : entry.quantumNumber}
                  size="small"
                  sx={{
                    bgcolor: entry.correct ? 'rgba(0,255,136,0.2)' : 'rgba(255,50,50,0.2)',
                    color: entry.correct ? '#00ff88' : '#ff5050',
                    fontSize: '0.7rem',
                    height: 24
                  }}
                />
              ))}
            </Box>
          </Box>
        )}

        {/* Reset Button */}
        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Button
            size="small"
            onClick={resetScores}
            sx={{ color: '#ff5050', fontSize: '0.7rem' }}
          >
            Reset All Stats
          </Button>
        </Box>
      </Box>
    );

    // ============ SCORE BAR ============
    const renderScoreBar = () => (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        px: fullscreenMode ? 2 : 1,
        py: 0.5,
        bgcolor: 'rgba(0,0,0,0.2)',
        borderRadius: 1,
        mb: fullscreenMode ? 2 : 1
      }}>
        <Box sx={{ display: 'flex', gap: fullscreenMode ? 3 : 1.5, alignItems: 'center' }}>
          <Typography sx={{ color: '#00ff88', fontSize: fontSize.small, fontWeight: 600 }}>
            {totalCorrect}/{totalAttempts} ({overallAccuracy}%)
          </Typography>
          {scores.currentStreak > 0 && (
            <Typography sx={{ color: '#ff6b00', fontSize: fontSize.small }}>
              🔥 {scores.currentStreak}
            </Typography>
          )}
          {sessionRestored && (
            <Chip
              label="🔄 Session Restored"
              size="small"
              sx={{
                bgcolor: 'rgba(138,43,226,0.3)',
                color: '#8a2be2',
                fontSize: '0.7rem',
                height: 20
              }}
            />
          )}
        </Box>
        <Button 
          size="small" 
          onClick={() => setShowStats(true)}
          sx={{ color: '#8a2be2', fontSize: fontSize.small, minWidth: 'auto', p: 0.5 }}
        >
          📊 Stats
        </Button>
      </Box>
    );

    return (
      <Box sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        p: fullscreenMode ? 4 : 0
      }}>
        {/* Header with mode selector */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          mb: fullscreenMode ? 2 : 1 
        }}>
          <ToggleButtonGroup
            value={rvMode}
            exclusive
            onChange={(_, v) => v && setRvMode(v)}
            size={fullscreenMode ? "medium" : "small"}
            sx={{
              '& .MuiToggleButton-root': {
                color: '#8a2be2',
                borderColor: 'rgba(138,43,226,0.3)',
                fontSize: fullscreenMode ? '1rem' : '0.75rem',
                py: fullscreenMode ? 1 : 0.5,
                '&.Mui-selected': {
                  color: '#00ff88',
                  backgroundColor: 'rgba(0,255,136,0.1)'
                }
              }
            }}
          >
            <ToggleButton value="practice">Practice</ToggleButton>
            <ToggleButton value="tournament">Tournament</ToggleButton>
          </ToggleButtonGroup>

          <Box sx={{ display: 'flex', gap: 1 }}>
            {phase !== 'idle' && !showStats && (
              <Button 
                size="small" 
                onClick={handleBack} 
                sx={{ color: '#666', fontSize: fontSize.small }}
              >
                ← Back
              </Button>
            )}
            {fullscreenMode && onExitFullscreen && (
              <IconButton
                onClick={onExitFullscreen}
                sx={{ color: 'rgba(255,255,255,0.5)', '&:hover': { color: '#fff' } }}
              >
                <FullscreenExitIcon />
              </IconButton>
            )}
          </Box>
        </Box>

        {/* Score Bar */}
        {rvMode === 'practice' && !showStats && renderScoreBar()}

        {/* Main content area */}
        <Box sx={{ 
          flex: 1, 
          overflow: 'auto',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: fullscreenMode ? 'center' : 'flex-start'
        }}>
          {/* ====== STATS VIEW ====== */}
          {showStats && renderStatsPanel()}

          {/* ====== PRACTICE MODE ====== */}
          {rvMode === 'practice' && !showStats && (
            <>
              {/* IDLE - Setup */}
              {phase === 'idle' && !isMaterializing && (
                <Box sx={{ textAlign: 'center', py: fullscreenMode ? 4 : 2 }}>
                  <Typography sx={{ color: '#8a2be2', mb: 2, fontSize: fontSize.title }}>
                    Quantum {targetType === 'image' ? 'Image' : 'Number'} Prediction
                  </Typography>

                  {/* 🔥 Target type toggle */}
                  <ToggleButtonGroup
                    value={targetType}
                    exclusive
                    onChange={(_, v) => v && setTargetType(v)}
                    size="small"
                    sx={{
                      mb: 2,
                      '& .MuiToggleButton-root': {
                        color: '#666',
                        borderColor: 'rgba(138,43,226,0.3)',
                        fontSize: fullscreenMode ? '0.9rem' : '0.7rem',
                        py: 0.5,
                        '&.Mui-selected': {
                          color: '#ff6b00',
                          backgroundColor: 'rgba(255,107,0,0.1)'
                        }
                      }
                    }}
                  >
                    <ToggleButton value="number">🔢 Numbers</ToggleButton>
                    <ToggleButton value="image">🖼️ Images</ToggleButton>
                  </ToggleButtonGroup>

                  {/* Guess mode toggle - only for numbers */}
                  {targetType === 'number' && (
                    <Box sx={{ mb: 2 }}>
                      <ToggleButtonGroup
                        value={guessMode}
                        exclusive
                        onChange={(_, v) => v && setGuessMode(v)}
                        size="small"
                        sx={{
                          '& .MuiToggleButton-root': {
                            color: '#666',
                            borderColor: 'rgba(138,43,226,0.3)',
                            fontSize: fullscreenMode ? '0.9rem' : '0.7rem',
                            py: 0.5,
                            '&.Mui-selected': {
                              color: '#00ff88',
                              backgroundColor: 'rgba(0,255,136,0.1)'
                            }
                          }
                        }}
                      >
                        <ToggleButton value="multiple_choice">3 Choices</ToggleButton>
                        <ToggleButton value="free_entry">Free Entry</ToggleButton>
                      </ToggleButtonGroup>
                    </Box>
                  )}

                  <Typography sx={{ color: '#666', mb: 3, fontSize: fontSize.small }}>
                    {targetType === 'image' 
                      ? 'Generate a quantum image entangled with an 8-digit code. Choose from 4 images.'
                      : 'Generate a quantum number (1-99) entangled with an 8-digit code.'
                    }
                  </Typography>

                  <Button
                    onClick={handleGenerate}
                    variant="contained"
                    size={fullscreenMode ? "large" : "medium"}
                    sx={{
                      py: fullscreenMode ? 2 : 1,
                      px: fullscreenMode ? 4 : 2,
                      fontSize: fontSize.button,
                      background: 'linear-gradient(45deg, #8a2be2, #00ff88)',
                      '&:hover': { background: 'linear-gradient(45deg, #9b4dff, #33ffaa)' }
                    }}
                  >
                    Generate
                  </Button>
                </Box>
              )}

              {/* MATERIALIZING */}
              {isMaterializing && (
                <Box sx={{ textAlign: 'center', py: fullscreenMode ? 6 : 4 }}>
                  <Typography
                    sx={{
                      fontSize: fullscreenMode ? '4rem' : '2rem',
                      fontFamily: 'Courier New, monospace',
                      color: '#8a2be2',
                      animation: `${quantumFlicker} 1s infinite`
                    }}
                  >
                    ????-????
                  </Typography>
                  <Typography sx={{ color: '#ff1493', mt: 1, fontSize: fullscreenMode ? '1rem' : '0.8rem' }}>
                    Creating {targetType === 'image' ? 'image' : ''} entanglement...
                  </Typography>
                </Box>
              )}

              {/* VIEWING - Show 8-digit code */}
              {phase === 'viewing' && (entanglement || imageEntanglement) && (
                <Box sx={{ textAlign: 'center', py: fullscreenMode ? 4 : 2 }}>
                  <Typography sx={{ color: '#666', mb: 1, fontSize: fontSize.small }}>
                    ENTANGLEMENT CODE
                  </Typography>
                  
                  <Typography
                    sx={{
                      fontSize: fontSize.code,
                      fontWeight: 700,
                      fontFamily: 'Courier New, monospace',
                      color: '#00ff88',
                      letterSpacing: fullscreenMode ? '0.15em' : '0.1em',
                      animation: `${subtleGlow} 3s infinite`,
                      mb: 3
                    }}
                  >
                    {entanglement?.entanglementCode || imageEntanglement?.entanglementCode}
                  </Typography>

                  <Typography sx={{ color: '#666', fontSize: fontSize.small, mb: 3 }}>
                    Focus on this code. What {targetType === 'image' ? 'image' : 'number'} is entangled?
                  </Typography>

                  <Button
                    onClick={handleReadyToGuess}
                    variant="contained"
                    size={fullscreenMode ? "large" : "medium"}
                    sx={{
                      py: fullscreenMode ? 2 : 1,
                      px: fullscreenMode ? 4 : 2,
                      fontSize: fontSize.button,
                      background: 'linear-gradient(45deg, #8a2be2, #00ff88)'
                    }}
                  >
                    Ready to Guess
                  </Button>
                </Box>
              )}

              {/* GUESSING - Numbers */}
              {phase === 'guessing' && targetType === 'number' && entanglement && (
                <Box sx={{ textAlign: 'center', py: fullscreenMode ? 4 : 2 }}>
                  <Typography sx={{ color: '#666', fontSize: fontSize.small, mb: 1 }}>
                    Code: {entanglement.entanglementCode}
                  </Typography>

                  <Typography sx={{ color: '#8a2be2', mb: 3, fontSize: fontSize.title }}>
                    What number is entangled?
                  </Typography>

                  {guessMode === 'multiple_choice' && (
                    <Box sx={{ 
                      display: 'flex', 
                      gap: fullscreenMode ? 3 : 1, 
                      justifyContent: 'center', 
                      flexWrap: 'wrap' 
                    }}>
                      {multipleChoiceOptions.map((option, idx) => (
                        <Button
                          key={idx}
                          onClick={() => handleMultipleChoiceSelect(option)}
                          variant="outlined"
                          sx={{
                            minWidth: fullscreenMode ? 120 : 60,
                            py: fullscreenMode ? 3 : 1.5,
                            fontSize: fullscreenMode ? '2.5rem' : '1.3rem',
                            fontWeight: 700,
                            fontFamily: 'Courier New, monospace',
                            borderColor: '#8a2be2',
                            color: '#8a2be2',
                            borderWidth: 2,
                            '&:hover': {
                              borderColor: '#00ff88',
                              color: '#00ff88',
                              backgroundColor: 'rgba(0,255,136,0.1)',
                              borderWidth: 2
                            }
                          }}
                        >
                          {option}
                        </Button>
                      ))}
                    </Box>
                  )}

                  {guessMode === 'free_entry' && (
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                      <TextField
                        value={freeEntryInput}
                        onChange={(e) => setFreeEntryInput(e.target.value.replace(/\D/g, '').slice(0, 2))}
                        placeholder="??"
                        inputProps={{
                          maxLength: 2,
                          style: { 
                            textAlign: 'center', 
                            fontSize: fullscreenMode ? '4rem' : '2rem', 
                            fontWeight: 700, 
                            fontFamily: 'Courier New' 
                          }
                        }}
                        sx={{
                          width: fullscreenMode ? 150 : 80,
                          '& .MuiOutlinedInput-root': {
                            '& fieldset': { borderColor: '#8a2be2', borderWidth: 2 },
                            '&:hover fieldset': { borderColor: '#00ff88' }
                          },
                          '& .MuiInputBase-input': { color: '#00ff88' }
                        }}
                        onKeyDown={(e) => e.key === 'Enter' && handleFreeEntrySubmit()}
                        autoFocus
                      />
                      <Button
                        onClick={handleFreeEntrySubmit}
                        disabled={!freeEntryInput}
                        variant="contained"
                        size={fullscreenMode ? "large" : "medium"}
                        sx={{
                          py: fullscreenMode ? 1.5 : 1,
                          px: fullscreenMode ? 4 : 2,
                          fontSize: fontSize.button,
                          background: 'linear-gradient(45deg, #8a2be2, #00ff88)',
                          '&:disabled': { background: 'rgba(138,43,226,0.3)' }
                        }}
                      >
                        Submit
                      </Button>
                    </Box>
                  )}
                </Box>
              )}

              {/* 🔥 GUESSING - Images */}
              {phase === 'guessing' && targetType === 'image' && imageEntanglement && (
                <Box sx={{ textAlign: 'center', py: fullscreenMode ? 4 : 2 }}>
                  <Typography sx={{ color: '#666', fontSize: fontSize.small, mb: 1 }}>
                    Code: {imageEntanglement.entanglementCode}
                  </Typography>

                  <Typography sx={{ color: '#8a2be2', mb: 3, fontSize: fontSize.title }}>
                    Which image is entangled?
                  </Typography>

                  {imagesLoading && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                      <CircularProgress size={24} sx={{ color: '#8a2be2' }} />
                      <Typography sx={{ color: '#666', ml: 1, fontSize: fontSize.small }}>
                        Loading images...
                      </Typography>
                    </Box>
                  )}

                  <Box sx={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(2, 1fr)', 
                    gap: fullscreenMode ? 3 : 1.5,
                    justifyItems: 'center',
                    maxWidth: fullscreenMode ? 700 : 350,
                    mx: 'auto'
                  }}>
                    {shuffledImageSeeds.map((seed, idx) => (
                      <Box
                        key={seed}
                        onClick={() => handleImageSelect(seed)}
                        sx={{
                          cursor: 'pointer',
                          borderRadius: 2,
                          overflow: 'hidden',
                          border: '3px solid transparent',
                          borderColor: 'rgba(138,43,226,0.3)',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            borderColor: '#00ff88',
                            transform: 'scale(1.05)',
                            animation: `${imageGlow} 1s infinite`
                          }
                        }}
                      >
                        <img
                          src={getImageUrl(seed, imageSize.width, imageSize.height)}
                          alt={`Option ${idx + 1}`}
                          width={imageSize.width}
                          height={imageSize.height}
                          onLoad={() => handleImageLoad(seed)}
                          style={{ display: 'block' }}
                        />
                      </Box>
                    ))}
                  </Box>
                </Box>
              )}

              {/* REVEAL - Numbers */}
              {phase === 'reveal' && targetType === 'number' && entanglement && (
                <Box
                  sx={{
                    textAlign: 'center',
                    py: fullscreenMode ? 4 : 2,
                    animation: isCorrect ? `${correctPulse} 2s infinite` : `${wrongShake} 0.5s`
                  }}
                >
                  <Typography sx={{ 
                    color: '#666', 
                    fontSize: fontSize.small,
                    fontFamily: 'Courier New, monospace'
                  }}>
                    {entanglement.entanglementCode}
                  </Typography>

                  <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)', my: fullscreenMode ? 3 : 1 }} />

                  <Typography sx={{ color: '#8a2be2', fontSize: fontSize.small, mb: 1 }}>
                    ENTANGLED NUMBER
                  </Typography>

                  <Typography
                    sx={{
                      fontSize: fullscreenMode ? fontSize.number : '3rem',
                      fontWeight: 900,
                      fontFamily: 'Courier New, monospace',
                      color: isCorrect ? '#00ff88' : '#ff5050',
                      textShadow: `0 0 ${fullscreenMode ? '40px' : '20px'} ${isCorrect ? 'rgba(0,255,136,0.6)' : 'rgba(255,50,50,0.6)'}`
                    }}
                  >
                    {entanglement.quantumNumber}
                  </Typography>

                  {userGuess !== null && (
                    <Typography sx={{ color: '#666', fontSize: fontSize.text, mt: 1 }}>
                      Your guess: <span style={{ color: isCorrect ? '#00ff88' : '#ff5050', fontWeight: 700 }}>{userGuess}</span>
                    </Typography>
                  )}

                  <Box sx={{ mt: 2, display: 'flex', gap: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <Chip
                      label={isCorrect ? '✓ CORRECT' : '✗ INCORRECT'}
                      sx={{
                        fontSize: fullscreenMode ? '1.2rem' : '0.85rem',
                        py: fullscreenMode ? 2 : 1,
                        backgroundColor: isCorrect ? 'rgba(0,255,136,0.2)' : 'rgba(255,50,50,0.2)',
                        color: isCorrect ? '#00ff88' : '#ff5050',
                        fontWeight: 700
                      }}
                    />
                    {isCorrect && scores.currentStreak > 1 && (
                      <Chip
                        label={`🔥 ${scores.currentStreak} streak!`}
                        sx={{
                          fontSize: fullscreenMode ? '1rem' : '0.75rem',
                          backgroundColor: 'rgba(255,107,0,0.2)',
                          color: '#ff6b00',
                          fontWeight: 600
                        }}
                      />
                    )}
                  </Box>

                  <Box sx={{ mt: 3 }}>
                    <Button
                      onClick={handleReset}
                      variant="contained"
                      size={fullscreenMode ? "large" : "medium"}
                      sx={{
                        py: fullscreenMode ? 1.5 : 0.75,
                        px: fullscreenMode ? 4 : 2,
                        fontSize: fontSize.button,
                        background: 'linear-gradient(45deg, #8a2be2, #00ff88)'
                      }}
                    >
                      New Session
                    </Button>
                  </Box>
                </Box>
              )}

              {/* 🔥 REVEAL - Images */}
              {phase === 'reveal' && targetType === 'image' && imageEntanglement && (
                <Box
                  sx={{
                    textAlign: 'center',
                    py: fullscreenMode ? 4 : 2,
                    animation: isCorrect ? `${correctPulse} 2s infinite` : `${wrongShake} 0.5s`
                  }}
                >
                  <Typography sx={{ 
                    color: '#666', 
                    fontSize: fontSize.small,
                    fontFamily: 'Courier New, monospace',
                    mb: 2
                  }}>
                    {imageEntanglement.entanglementCode}
                  </Typography>

                  <Typography sx={{ color: '#8a2be2', fontSize: fontSize.small, mb: 2 }}>
                    ENTANGLED IMAGE
                  </Typography>

                  {/* Show target image with highlight */}
                  <Box sx={{ 
                    display: 'inline-block',
                    borderRadius: 2,
                    overflow: 'hidden',
                    border: `4px solid ${isCorrect ? '#00ff88' : '#ff5050'}`,
                    boxShadow: `0 0 30px ${isCorrect ? 'rgba(0,255,136,0.5)' : 'rgba(255,50,50,0.5)'}`,
                    mb: 2
                  }}>
                    <img
                      src={getImageUrl(imageEntanglement.targetImageSeed, fullscreenMode ? 350 : 200, fullscreenMode ? 230 : 130)}
                      alt="Target"
                      style={{ display: 'block' }}
                    />
                  </Box>

                  {/* Show what user selected if wrong */}
                  {!isCorrect && selectedImageSeed && (
                    <Box sx={{ mt: 2 }}>
                      <Typography sx={{ color: '#666', fontSize: fontSize.small, mb: 1 }}>
                        You selected:
                      </Typography>
                      <Box sx={{ 
                        display: 'inline-block',
                        borderRadius: 2,
                        overflow: 'hidden',
                        border: '3px solid #ff5050',
                        opacity: 0.7
                      }}>
                        <img
                          src={getImageUrl(selectedImageSeed, fullscreenMode ? 200 : 120, fullscreenMode ? 130 : 80)}
                          alt="Your selection"
                          style={{ display: 'block' }}
                        />
                      </Box>
                    </Box>
                  )}

                  <Box sx={{ mt: 2, display: 'flex', gap: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <Chip
                      label={isCorrect ? '✓ CORRECT' : '✗ INCORRECT'}
                      sx={{
                        fontSize: fullscreenMode ? '1.2rem' : '0.85rem',
                        py: fullscreenMode ? 2 : 1,
                        backgroundColor: isCorrect ? 'rgba(0,255,136,0.2)' : 'rgba(255,50,50,0.2)',
                        color: isCorrect ? '#00ff88' : '#ff5050',
                        fontWeight: 700
                      }}
                    />
                    {isCorrect && scores.currentStreak > 1 && (
                      <Chip
                        label={`🔥 ${scores.currentStreak} streak!`}
                        sx={{
                          fontSize: fullscreenMode ? '1rem' : '0.75rem',
                          backgroundColor: 'rgba(255,107,0,0.2)',
                          color: '#ff6b00',
                          fontWeight: 600
                        }}
                      />
                    )}
                  </Box>

                  <Box sx={{ mt: 3 }}>
                    <Button
                      onClick={handleReset}
                      variant="contained"
                      size={fullscreenMode ? "large" : "medium"}
                      sx={{
                        py: fullscreenMode ? 1.5 : 0.75,
                        px: fullscreenMode ? 4 : 2,
                        fontSize: fontSize.button,
                        background: 'linear-gradient(45deg, #8a2be2, #00ff88)'
                      }}
                    >
                      New Session
                    </Button>
                  </Box>
                </Box>
              )}
            </>
          )}

          {/* ====== TOURNAMENT MODE ====== */}
          {rvMode === 'tournament' && !showStats && (
            <Box sx={{ textAlign: 'center', py: fullscreenMode ? 6 : 3 }}>
              <Typography sx={{ color: '#8a2be2', mb: 2, fontSize: fullscreenMode ? '2rem' : '1rem' }}>
                🏆 Tournament Mode
              </Typography>
              <Typography sx={{ color: '#666', fontSize: fullscreenMode ? '1.1rem' : '0.8rem' }}>
                Daily quantum numbers revealed at midnight UTC.
                <br />
                Coming soon...
              </Typography>
            </Box>
          )}
        </Box>
      </Box>
    );
  };

  // ============ FULLSCREEN WRAPPER ============

  if (isFullscreen) {
    return (
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: '#0a0a0f',
          background: 'radial-gradient(ellipse at center, #1a1a2e 0%, #0a0a0f 100%)',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {renderContent(true)}
      </Box>
    );
  }

  // ============ INLINE RENDER ============

  return renderContent(false);
};

export default RemoteViewingSection;
