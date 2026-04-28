/**
 * Quantum Oracle Tab Component
 *
 * True quantum random number generation using ANU QRNG.
 * 
 * Practice Mode Flow:
 * 1. Generate quantum number (1-2 digits) + 8-digit entanglement code
 * 2. Show ONLY the 8-digit code on black screen
 * 3. User guesses the quantum number (free entry OR multiple choice)
 * 4. Reveal: Show 8-digit code tied to actual quantum number
 *
 * Tournament Mode: Daily numbers revealed at midnight UTC
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  CircularProgress,
  Tabs,
  Tab,
  Chip,
  Divider,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  keyframes,
  Fade
} from '@mui/material';

// Animation keyframes
const pulseGlow = keyframes`
  0%, 100% { box-shadow: 0 0 20px rgba(138, 43, 226, 0.5); }
  50% { box-shadow: 0 0 40px rgba(138, 43, 226, 0.8), 0 0 60px rgba(0, 255, 136, 0.4); }
`;

const numberMaterialize = keyframes`
  0% {
    transform: scale(0.3) rotate(180deg);
    opacity: 0;
    filter: blur(20px);
  }
  50% {
    transform: scale(1.2) rotate(-10deg);
    opacity: 0.8;
    filter: blur(5px);
  }
  100% {
    transform: scale(1) rotate(0deg);
    opacity: 1;
    filter: blur(0);
  }
`;

const quantumFlicker = keyframes`
  0%, 100% { opacity: 1; }
  10% { opacity: 0.8; }
  20% { opacity: 1; }
  30% { opacity: 0.6; }
  40% { opacity: 1; }
  50% { opacity: 0.4; }
  60% { opacity: 1; }
  70% { opacity: 0.7; }
  80% { opacity: 1; }
  90% { opacity: 0.5; }
`;

const countdownPulse = keyframes`
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
`;

const subtleGlow = keyframes`
  0%, 100% {
    text-shadow: 0 0 30px rgba(0, 255, 136, 0.4), 0 0 60px rgba(0, 255, 136, 0.2);
  }
  50% {
    text-shadow: 0 0 40px rgba(0, 255, 136, 0.6), 0 0 80px rgba(0, 255, 136, 0.3);
  }
`;

const correctPulse = keyframes`
  0%, 100% { 
    box-shadow: 0 0 30px rgba(0, 255, 136, 0.6);
    transform: scale(1);
  }
  50% { 
    box-shadow: 0 0 60px rgba(0, 255, 136, 0.9);
    transform: scale(1.02);
  }
`;

const wrongShake = keyframes`
  0%, 100% { transform: translateX(0); }
  20% { transform: translateX(-10px); }
  40% { transform: translateX(10px); }
  60% { transform: translateX(-10px); }
  80% { transform: translateX(10px); }
`;

// API Configuration
const API_BASE = import.meta.env.DEV ? 'http://localhost:8000' : '';

// ============ INTERFACES ============

interface QuantumEntanglement {
  quantumNumber: number;       // The 1-2 digit quantum number (hidden until reveal)
  entanglementCode: string;    // The 8-digit code shown to user
  timestamp: string;
  source: string;
}

interface DailyResponse {
  number?: number;
  raw_quantum?: number;
  date: string;
  materialized_at?: string;
  source?: string;
  mode: string;
  status: string;
  reveal_time?: string;
  seconds_until_reveal?: number;
  message?: string;
}

interface CountdownData {
  seconds_until_reveal: number;
  formatted: string;
}

type GuessMode = 'free_entry' | 'multiple_choice';
type PracticePhase = 'idle' | 'viewing' | 'guessing' | 'reveal';

// ============ HELPER FUNCTIONS ============

/** Generate a random 8-digit code in format XXXX-XXXX */
const generateEntanglementCode = (): string => {
  const part1 = Math.floor(1000 + Math.random() * 9000);
  const part2 = Math.floor(1000 + Math.random() * 9000);
  return `${part1}-${part2}`;
};

/** Generate a random 1-2 digit quantum number (1-99) */
const generateQuantumNumber = (): number => {
  return Math.floor(1 + Math.random() * 99);
};

/** Generate decoy numbers for multiple choice (same digit count as target) */
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

/** Shuffle array (Fisher-Yates) */
const shuffleArray = <T,>(arr: T[]): T[] => {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// ============ BLACK SCREEN COMPONENT ============

interface QuantumBlackScreenProps {
  entanglementCode: string;
  onContinue: () => void;
}

const QuantumBlackScreen: React.FC<QuantumBlackScreenProps> = ({
  entanglementCode,
  onContinue
}) => {
  const [codeVisible, setCodeVisible] = useState(true);

  // Keyboard controls
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      switch (e.key.toLowerCase()) {
        case ' ':
        case 'h':
          e.preventDefault();
          setCodeVisible(prev => !prev);
          break;
        case 'enter':
        case 'escape':
          e.preventDefault();
          onContinue();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [onContinue]);

  // Prevent scrolling
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'auto'; };
  }, []);

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: '#000000',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 9999,
        cursor: 'pointer',
        overflow: 'hidden',
        userSelect: 'none'
      }}
      onClick={() => setCodeVisible(prev => !prev)}
    >
      {/* 8-Digit Entanglement Code */}
      <Fade in={codeVisible} timeout={500}>
        <Typography
          sx={{
            fontSize: { xs: '3rem', sm: '5rem', md: '7rem', lg: '9rem' },
            fontWeight: 700,
            fontFamily: '"Courier New", Courier, monospace',
            color: '#00ff88',
            letterSpacing: { xs: '0.2em', sm: '0.3em', md: '0.4em' },
            animation: `${numberMaterialize} 0.8s ease-out, ${subtleGlow} 4s ease-in-out infinite`,
            textAlign: 'center',
            lineHeight: 1.2
          }}
        >
          {entanglementCode}
        </Typography>
      </Fade>

      {/* Hidden state indicator */}
      {!codeVisible && (
        <Typography
          sx={{
            position: 'absolute',
            color: 'rgba(255, 255, 255, 0.1)',
            fontSize: '1rem',
            fontFamily: 'monospace'
          }}
        >
          [Press H or Space to reveal]
        </Typography>
      )}

      {/* Instructions */}
      <Typography
        sx={{
          position: 'absolute',
          bottom: 80,
          color: 'rgba(255, 255, 255, 0.3)',
          fontSize: '1rem',
          fontFamily: 'monospace',
          textAlign: 'center'
        }}
      >
        Focus on this code. What number is entangled with it?
      </Typography>

      {/* Continue button */}
      <Button
        onClick={(e) => {
          e.stopPropagation();
          onContinue();
        }}
        variant="outlined"
        sx={{
          position: 'absolute',
          bottom: 24,
          borderColor: 'rgba(0, 255, 136, 0.3)',
          color: 'rgba(0, 255, 136, 0.5)',
          '&:hover': {
            borderColor: '#00ff88',
            color: '#00ff88'
          }
        }}
      >
        Ready to Guess [ENTER]
      </Button>

      {/* Help */}
      <Box
        sx={{
          position: 'absolute',
          top: 24,
          right: 24,
          opacity: 0.1,
          '&:hover': { opacity: 0.3 }
        }}
      >
        <Typography sx={{ color: '#fff', fontSize: '0.75rem', fontFamily: 'monospace' }}>
          [H] Hide • [ENTER] Continue
        </Typography>
      </Box>
    </Box>
  );
};

// ============ REVEAL SCREEN COMPONENT ============

interface RevealScreenProps {
  entanglement: QuantumEntanglement;
  userGuess: number | null;
  isCorrect: boolean;
  onNewSession: () => void;
}

const RevealScreen: React.FC<RevealScreenProps> = ({
  entanglement,
  userGuess,
  isCorrect,
  onNewSession
}) => {
  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: '#000000',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 9999,
        overflow: 'hidden',
        userSelect: 'none'
      }}
    >
      {/* Result Container */}
      <Paper
        sx={{
          p: 4,
          background: isCorrect 
            ? 'rgba(0, 255, 136, 0.1)' 
            : 'rgba(255, 50, 50, 0.1)',
          border: `2px solid ${isCorrect ? '#00ff88' : '#ff5050'}`,
          borderRadius: 4,
          textAlign: 'center',
          animation: isCorrect 
            ? `${correctPulse} 2s ease-in-out infinite` 
            : `${wrongShake} 0.5s ease-out`
        }}
      >
        {/* 8-Digit Code */}
        <Typography
          sx={{
            fontSize: { xs: '2rem', sm: '3rem', md: '4rem' },
            fontWeight: 700,
            fontFamily: '"Courier New", Courier, monospace',
            color: '#00ff88',
            mb: 2,
            letterSpacing: '0.2em'
          }}
        >
          {entanglement.entanglementCode}
        </Typography>

        {/* Divider line */}
        <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.2)', my: 2 }} />

        {/* Entangled Quantum Number */}
        <Typography
          sx={{
            fontSize: '1rem',
            color: '#8a2be2',
            mb: 1,
            textTransform: 'uppercase',
            letterSpacing: '0.1em'
          }}
        >
          Entangled Quantum Number
        </Typography>
        
        <Typography
          sx={{
            fontSize: { xs: '4rem', sm: '6rem', md: '8rem' },
            fontWeight: 900,
            fontFamily: '"Courier New", Courier, monospace',
            color: isCorrect ? '#00ff88' : '#ff5050',
            textShadow: isCorrect 
              ? '0 0 40px rgba(0, 255, 136, 0.8)' 
              : '0 0 40px rgba(255, 50, 50, 0.8)',
            animation: `${numberMaterialize} 0.8s ease-out`,
            lineHeight: 1
          }}
        >
          {entanglement.quantumNumber}
        </Typography>

        {/* User's guess comparison */}
        {userGuess !== null && (
          <Box sx={{ mt: 3 }}>
            <Typography sx={{ color: '#666', fontSize: '0.9rem' }}>
              Your Guess: <span style={{ color: isCorrect ? '#00ff88' : '#ff5050', fontWeight: 700 }}>{userGuess}</span>
            </Typography>
          </Box>
        )}

        {/* Result text */}
        <Typography
          sx={{
            mt: 3,
            fontSize: '1.5rem',
            fontWeight: 700,
            color: isCorrect ? '#00ff88' : '#ff5050',
            textTransform: 'uppercase',
            letterSpacing: '0.15em'
          }}
        >
          {isCorrect ? '✓ CORRECT' : '✗ INCORRECT'}
        </Typography>
      </Paper>

      {/* New Session Button */}
      <Button
        onClick={onNewSession}
        variant="contained"
        size="large"
        sx={{
          mt: 4,
          py: 1.5,
          px: 4,
          fontSize: '1.1rem',
          background: 'linear-gradient(45deg, #8a2be2, #00ff88)',
          '&:hover': {
            background: 'linear-gradient(45deg, #9b4dff, #33ffaa)'
          }
        }}
      >
        New Quantum Session
      </Button>
    </Box>
  );
};

// ============ MAIN COMPONENT ============

const QuantumOracleTab: React.FC = () => {
  const [mode, setMode] = useState<'tournament' | 'practice'>('practice');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Tournament mode state
  const [dailyNumber, setDailyNumber] = useState<DailyResponse | null>(null);
  const [countdown, setCountdown] = useState<CountdownData | null>(null);
  const [history, setHistory] = useState<Array<{ number: number; date: string }>>([]);

  // Practice mode state
  const [practicePhase, setPracticePhase] = useState<PracticePhase>('idle');
  const [guessMode, setGuessMode] = useState<GuessMode>('multiple_choice');
  const [entanglement, setEntanglement] = useState<QuantumEntanglement | null>(null);
  const [userGuess, setUserGuess] = useState<number | null>(null);
  const [freeEntryInput, setFreeEntryInput] = useState('');
  const [multipleChoiceOptions, setMultipleChoiceOptions] = useState<number[]>([]);
  const [isCorrect, setIsCorrect] = useState(false);
  const [isMaterializing, setIsMaterializing] = useState(false);

  // ============ TOURNAMENT MODE FUNCTIONS ============

  const fetchDailyNumber = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE}/api/quantum/daily`);
      if (!response.ok) throw new Error('Failed to fetch daily number');

      const data: DailyResponse = await response.json();
      setDailyNumber(data);

      if (data.status === 'pending' && data.seconds_until_reveal) {
        setCountdown({
          seconds_until_reveal: data.seconds_until_reveal,
          formatted: formatCountdown(data.seconds_until_reveal)
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchHistory = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE}/api/quantum/history?days=7`);
      if (response.ok) {
        const data = await response.json();
        setHistory(data.numbers || []);
      }
    } catch {
      // History is optional
    }
  }, []);

  const formatCountdown = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Countdown timer effect
  useEffect(() => {
    if (!countdown || countdown.seconds_until_reveal <= 0) return;

    const timer = setInterval(() => {
      setCountdown(prev => {
        if (!prev || prev.seconds_until_reveal <= 1) {
          fetchDailyNumber();
          return null;
        }
        const newSeconds = prev.seconds_until_reveal - 1;
        return {
          seconds_until_reveal: newSeconds,
          formatted: formatCountdown(newSeconds)
        };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [countdown, fetchDailyNumber]);

  // Initial fetch for tournament
  useEffect(() => {
    if (mode === 'tournament') {
      fetchDailyNumber();
      fetchHistory();
    }
  }, [mode, fetchDailyNumber, fetchHistory]);

  // ============ PRACTICE MODE FUNCTIONS ============

  /** Step 1: Generate quantum number + 8-digit code */
  const generateQuantumEntanglement = () => {
    setIsMaterializing(true);
    setError(null);
    setEntanglement(null);
    setUserGuess(null);
    setFreeEntryInput('');
    setIsCorrect(false);

    // Simulate quantum generation delay
    setTimeout(() => {
      const quantumNum = generateQuantumNumber();
      const code = generateEntanglementCode();
      
      const newEntanglement: QuantumEntanglement = {
        quantumNumber: quantumNum,
        entanglementCode: code,
        timestamp: new Date().toISOString(),
        source: 'local_quantum_simulation'
      };

      setEntanglement(newEntanglement);

      // Generate multiple choice options if in that mode
      if (guessMode === 'multiple_choice') {
        const decoys = generateDecoys(quantumNum);
        const options = shuffleArray([quantumNum, ...decoys]);
        setMultipleChoiceOptions(options);
      }

      setIsMaterializing(false);
      setPracticePhase('viewing'); // Go to black screen
    }, 1500);
  };

  /** Step 2: User done viewing, ready to guess */
  const handleViewingComplete = () => {
    setPracticePhase('guessing');
  };

  /** Step 3a: Submit free entry guess */
  const handleFreeEntrySubmit = () => {
    if (!entanglement) return;
    
    const guess = parseInt(freeEntryInput, 10);
    if (isNaN(guess) || guess < 1 || guess > 99) {
      setError('Please enter a number between 1 and 99');
      return;
    }

    setUserGuess(guess);
    setIsCorrect(guess === entanglement.quantumNumber);
    setPracticePhase('reveal');
  };

  /** Step 3b: Submit multiple choice selection */
  const handleMultipleChoiceSelect = (selectedNumber: number) => {
    if (!entanglement) return;

    setUserGuess(selectedNumber);
    setIsCorrect(selectedNumber === entanglement.quantumNumber);
    setPracticePhase('reveal');
  };

  /** Reset for new session */
  const handleNewSession = () => {
    setPracticePhase('idle');
    setEntanglement(null);
    setUserGuess(null);
    setFreeEntryInput('');
    setMultipleChoiceOptions([]);
    setIsCorrect(false);
  };

  const handleModeChange = (_: React.SyntheticEvent, newValue: 'tournament' | 'practice') => {
    setMode(newValue);
    setError(null);
    handleNewSession();
  };

  // ============ RENDER ============

  return (
    <Box id="remoteViewing" sx={{ py: 1 }}>
      {/* Black Screen Overlay - Step 2 */}
      {practicePhase === 'viewing' && entanglement && (
        <QuantumBlackScreen
          entanglementCode={entanglement.entanglementCode}
          onContinue={handleViewingComplete}
        />
      )}

      {/* Reveal Screen - Step 4 */}
      {practicePhase === 'reveal' && entanglement && (
        <RevealScreen
          entanglement={entanglement}
          userGuess={userGuess}
          isCorrect={isCorrect}
          onNewSession={handleNewSession}
        />
      )}

      {/* Main UI */}
      <Typography
        variant="h5"
        component="h4"
        sx={{
          color: '#8a2be2',
          mb: 2,
          textAlign: 'center',
          textShadow: '0 0 10px rgba(138, 43, 226, 0.5)'
        }}
      >
        Quantum Oracle
      </Typography>

      <Typography
        sx={{
          color: '#00ff88',
          fontSize: '0.85rem',
          textAlign: 'center',
          mb: 2,
          fontStyle: 'italic'
        }}
      >
        Quantum-entangled number prediction
      </Typography>

      {/* Mode Tabs */}
      <Tabs
        value={mode}
        onChange={handleModeChange}
        centered
        sx={{
          mb: 2,
          '& .MuiTab-root': {
            color: '#8a2be2',
            '&.Mui-selected': { color: '#00ff88' }
          },
          '& .MuiTabs-indicator': { backgroundColor: '#00ff88' }
        }}
      >
        <Tab value="practice" label="Practice" />
        <Tab value="tournament" label="Tournament" />
      </Tabs>

      {/* Error Display */}
      {error && (
        <Paper
          sx={{
            p: 2,
            mb: 2,
            background: 'rgba(255, 50, 50, 0.1)',
            border: '1px solid rgba(255, 50, 50, 0.3)'
          }}
        >
          <Typography sx={{ color: '#ff5050' }}>{error}</Typography>
        </Paper>
      )}

      {/* ============ PRACTICE MODE ============ */}
      {mode === 'practice' && (
        <Box>
          {/* Phase: Idle - Setup & Generate */}
          {practicePhase === 'idle' && !isMaterializing && (
            <Paper
              sx={{
                p: 3,
                background: 'rgba(138, 43, 226, 0.1)',
                border: '1px solid rgba(138, 43, 226, 0.3)',
                borderRadius: 3,
                textAlign: 'center'
              }}
            >
              <Typography sx={{ color: '#8a2be2', mb: 3, fontSize: '1.1rem' }}>
                Quantum Number Prediction
              </Typography>

              {/* Guess Mode Toggle */}
              <Box sx={{ mb: 3 }}>
                <Typography sx={{ color: '#666', mb: 1, fontSize: '0.85rem' }}>
                  Select Guess Mode:
                </Typography>
                <ToggleButtonGroup
                  value={guessMode}
                  exclusive
                  onChange={(_, newMode) => newMode && setGuessMode(newMode)}
                  sx={{
                    '& .MuiToggleButton-root': {
                      color: '#8a2be2',
                      borderColor: 'rgba(138, 43, 226, 0.3)',
                      '&.Mui-selected': {
                        color: '#00ff88',
                        backgroundColor: 'rgba(0, 255, 136, 0.1)',
                        borderColor: '#00ff88'
                      },
                      '&:hover': {
                        backgroundColor: 'rgba(138, 43, 226, 0.1)'
                      }
                    }
                  }}
                >
                  <ToggleButton value="multiple_choice">
                    Multiple Choice (3 Options)
                  </ToggleButton>
                  <ToggleButton value="free_entry">
                    Free Entry (No Hints)
                  </ToggleButton>
                </ToggleButtonGroup>
              </Box>

              <Typography sx={{ color: '#666', mb: 3, fontSize: '0.85rem' }}>
                A quantum number (1-99) will be generated and entangled with an 8-digit code.
                <br />
                You'll see only the code. Focus on it and predict the hidden number.
              </Typography>

              <Button
                onClick={generateQuantumEntanglement}
                variant="contained"
                size="large"
                sx={{
                  py: 2,
                  px: 4,
                  fontSize: '1.2rem',
                  background: 'linear-gradient(45deg, #8a2be2, #00ff88)',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #9b4dff, #33ffaa)'
                  }
                }}
              >
                Generate Quantum Number
              </Button>
            </Paper>
          )}

          {/* Phase: Materializing */}
          {isMaterializing && (
            <Paper
              sx={{
                p: 3,
                background: 'rgba(138, 43, 226, 0.1)',
                border: '1px solid rgba(138, 43, 226, 0.3)',
                borderRadius: 3,
                textAlign: 'center',
                minHeight: 200,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center'
              }}
            >
              <Typography
                sx={{
                  fontSize: '4rem',
                  fontWeight: 700,
                  fontFamily: 'Courier New, monospace',
                  color: '#8a2be2',
                  animation: `${quantumFlicker} 1.5s linear infinite`
                }}
              >
                ????-????
              </Typography>
              <Typography sx={{ color: '#ff1493', mt: 2 }}>
                Creating quantum entanglement...
              </Typography>
            </Paper>
          )}

          {/* Phase: Guessing */}
          {practicePhase === 'guessing' && entanglement && (
            <Paper
              sx={{
                p: 3,
                background: 'rgba(0, 255, 136, 0.05)',
                border: '1px solid rgba(0, 255, 136, 0.3)',
                borderRadius: 3,
                textAlign: 'center'
              }}
            >
              {/* Show the entanglement code for reference */}
              <Typography sx={{ color: '#666', mb: 1, fontSize: '0.85rem' }}>
                Entanglement Code:
              </Typography>
              <Typography
                sx={{
                  fontSize: '2rem',
                  fontWeight: 700,
                  fontFamily: 'Courier New, monospace',
                  color: '#00ff88',
                  mb: 3,
                  cursor: 'pointer',
                  '&:hover': { textShadow: '0 0 20px rgba(0, 255, 136, 0.6)' }
                }}
                onClick={() => setPracticePhase('viewing')}
                title="Click to return to viewing screen"
              >
                {entanglement.entanglementCode}
              </Typography>

              <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.1)', my: 2 }} />

              <Typography sx={{ color: '#8a2be2', mb: 2, fontSize: '1.1rem' }}>
                What number is entangled with this code?
              </Typography>

              {/* Multiple Choice Mode */}
              {guessMode === 'multiple_choice' && (
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                  {multipleChoiceOptions.map((option, idx) => (
                    <Button
                      key={idx}
                      onClick={() => handleMultipleChoiceSelect(option)}
                      variant="outlined"
                      size="large"
                      sx={{
                        py: 3,
                        px: 5,
                        fontSize: '2rem',
                        fontWeight: 700,
                        fontFamily: 'Courier New, monospace',
                        minWidth: 100,
                        borderColor: '#8a2be2',
                        color: '#8a2be2',
                        '&:hover': {
                          borderColor: '#00ff88',
                          color: '#00ff88',
                          backgroundColor: 'rgba(0, 255, 136, 0.1)'
                        }
                      }}
                    >
                      {option}
                    </Button>
                  ))}
                </Box>
              )}

              {/* Free Entry Mode */}
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
                        fontSize: '3rem',
                        fontWeight: 700,
                        fontFamily: 'Courier New, monospace'
                      }
                    }}
                    sx={{
                      width: 120,
                      '& .MuiOutlinedInput-root': {
                        '& fieldset': { borderColor: '#8a2be2' },
                        '&:hover fieldset': { borderColor: '#00ff88' },
                        '&.Mui-focused fieldset': { borderColor: '#00ff88' }
                      },
                      '& .MuiInputBase-input': { color: '#00ff88' }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleFreeEntrySubmit();
                    }}
                    autoFocus
                  />
                  <Button
                    onClick={handleFreeEntrySubmit}
                    disabled={!freeEntryInput}
                    variant="contained"
                    size="large"
                    sx={{
                      py: 1.5,
                      px: 4,
                      fontSize: '1.1rem',
                      background: 'linear-gradient(45deg, #8a2be2, #00ff88)',
                      '&:hover': {
                        background: 'linear-gradient(45deg, #9b4dff, #33ffaa)'
                      },
                      '&:disabled': {
                        background: 'rgba(138, 43, 226, 0.3)'
                      }
                    }}
                  >
                    Submit Guess
                  </Button>
                </Box>
              )}

              {/* Return to viewing option */}
              <Button
                onClick={() => setPracticePhase('viewing')}
                variant="text"
                sx={{
                  mt: 3,
                  color: '#666',
                  '&:hover': { color: '#00ff88' }
                }}
              >
                Return to Viewing Screen
              </Button>
            </Paper>
          )}

          <Divider sx={{ my: 3, borderColor: 'rgba(138, 43, 226, 0.2)' }} />

          <Typography sx={{ color: '#666', fontSize: '0.8rem', textAlign: 'center' }}>
            The 8-digit code is quantum-entangled with a hidden number.
            Focus on the code and let your intuition reveal the entangled value.
          </Typography>
        </Box>
      )}

      {/* ============ TOURNAMENT MODE ============ */}
      {mode === 'tournament' && (
        <Box>
          <Paper
            sx={{
              p: 3,
              background: 'rgba(138, 43, 226, 0.1)',
              border: '1px solid rgba(138, 43, 226, 0.3)',
              borderRadius: 3,
              animation: dailyNumber?.status === 'revealed' ? `${pulseGlow} 3s ease-in-out infinite` : 'none',
              textAlign: 'center'
            }}
          >
            {loading ? (
              <CircularProgress sx={{ color: '#8a2be2' }} />
            ) : dailyNumber?.status === 'revealed' ? (
              <>
                <Typography sx={{ color: '#8a2be2', mb: 1 }}>
                  Today's Quantum Number
                </Typography>
                <Typography
                  sx={{
                    fontSize: '5rem',
                    fontWeight: 700,
                    fontFamily: 'Courier New, monospace',
                    color: '#00ff88',
                    textShadow: '0 0 20px rgba(0, 255, 136, 0.7)',
                    animation: `${numberMaterialize} 1s ease-out`
                  }}
                >
                  {dailyNumber.number}
                </Typography>
                <Chip
                  label={`Raw Quantum: ${dailyNumber.raw_quantum}`}
                  size="small"
                  sx={{
                    mt: 1,
                    background: 'rgba(0, 255, 136, 0.2)',
                    color: '#00ff88',
                    border: '1px solid rgba(0, 255, 136, 0.3)'
                  }}
                />
                <Typography sx={{ color: '#666', mt: 1, fontSize: '0.8rem' }}>
                  Materialized: {dailyNumber.materialized_at?.split('T')[0]}
                </Typography>
              </>
            ) : dailyNumber?.status === 'pending' && countdown ? (
              <>
                <Typography sx={{ color: '#8a2be2', mb: 2 }}>
                  Next Number Materializes In
                </Typography>
                <Typography
                  sx={{
                    fontSize: '3rem',
                    fontWeight: 700,
                    fontFamily: 'Courier New, monospace',
                    color: '#ff1493',
                    animation: `${countdownPulse} 1s ease-in-out infinite`
                  }}
                >
                  {countdown.formatted}
                </Typography>
                <Typography sx={{ color: '#666', mt: 2, fontSize: '0.85rem' }}>
                  The number exists in superposition until midnight UTC
                </Typography>
              </>
            ) : (
              <Button
                onClick={fetchDailyNumber}
                variant="outlined"
                sx={{
                  borderColor: '#8a2be2',
                  color: '#8a2be2',
                  '&:hover': { borderColor: '#00ff88', color: '#00ff88' }
                }}
              >
                Check Today's Number
              </Button>
            )}
          </Paper>

          {/* History */}
          {history.length > 0 && (
            <Box sx={{ mt: 3 }}>
              <Typography sx={{ color: '#8a2be2', mb: 1 }}>Recent History</Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {history.map((item, idx) => (
                  <Chip
                    key={idx}
                    label={`${item.date}: ${item.number}`}
                    size="small"
                    sx={{
                      background: 'rgba(138, 43, 226, 0.15)',
                      color: '#8a2be2',
                      border: '1px solid rgba(138, 43, 226, 0.3)'
                    }}
                  />
                ))}
              </Box>
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
};

export default QuantumOracleTab;
