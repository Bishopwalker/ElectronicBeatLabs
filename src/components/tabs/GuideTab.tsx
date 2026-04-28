// Electromagnetic Beat Lab - Guide Tab Component
// Comprehensive scientific guide with sub-tabs for patterns, frequencies, ADHD, and more

import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Tabs,
  Tab,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  Stack,
  Divider,
  Alert,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ScienceIcon from '@mui/icons-material/Science';
import PsychologyIcon from '@mui/icons-material/Psychology';
import TimerIcon from '@mui/icons-material/Timer';
import TipsAndUpdatesIcon from '@mui/icons-material/TipsAndUpdates';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import WavesIcon from '@mui/icons-material/Waves';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import VisibilityIcon from '@mui/icons-material/Visibility';

// Import comprehensive guide content from data files
import { ELECTROMAGNETIC_PATTERNS_GUIDE, type PatternGuideEntry } from '../../data/electromagneticPatternsGuide';
import {
  FREQUENCY_RANGES,
  ADHD_PROTOCOLS,
  TIMER_PRESETS,
  BEST_PRACTICES,
  type FrequencyRange,
  type ADHDProtocol,
  type TimerPreset,
  type BestPractice
} from '../../data/guideContent';

// Also import existing pattern explanations for legacy support
import { PATTERN_EXPLANATIONS } from '../../data/patterns';
import type { AppState, AudioEngine, Pattern8D } from '../../types';

// Import Remote Viewing guide content
import {
  RV_SESSIONS_GUIDE,
  CRV_STAGES_GUIDE,
  ARV_GUIDE,
  QUANTUM_ORACLE_GUIDE,
  RV_GENERAL_TIPS
} from '../../data/remoteViewingGuide';

interface GuideTabProps {
  appState: AppState;
  audioEngine: AudioEngine;
  patterns8D: Pattern8D[];
  onStateChange: (state: Partial<AppState>) => void;
}

// Sub-tab panel component
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel({ children, value, index }: TabPanelProps) {
  return (
    <Box
      role="tabpanel"
      hidden={value !== index}
      sx={{ py: 2 }}
    >
      {value === index && children}
    </Box>
  );
}

// Pattern Card Component - Improved readability
const PatternCard: React.FC<{ pattern: PatternGuideEntry }> = ({ pattern }) => (
  <Accordion
    sx={{
      mb: 1.5,
      background: 'rgba(20, 20, 30, 0.8)',
      border: '1px solid rgba(255, 255, 255, 0.15)',
      borderRadius: 2,
      '&:before': { display: 'none' }
    }}
  >
    <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: '#fff' }} />}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%', flexWrap: 'wrap' }}>
        <Typography sx={{ color: '#fff', fontWeight: 700, fontSize: '1rem' }}>
          {pattern.name}
        </Typography>
        <Chip
          label={`${pattern.frequencyHz}Hz ${pattern.brainwaveType.toUpperCase()}`}
          size="small"
          sx={{
            bgcolor: 'rgba(100, 180, 255, 0.25)',
            color: '#7ec8ff',
            fontWeight: 600,
            fontSize: '0.75rem'
          }}
        />
        <Chip
          label={pattern.type}
          size="small"
          sx={{
            bgcolor: 'rgba(255, 140, 60, 0.25)',
            color: '#ffaa66',
            fontWeight: 600,
            fontSize: '0.75rem'
          }}
        />
      </Box>
    </AccordionSummary>
    <AccordionDetails sx={{ pt: 0 }}>
      {/* Scientific Basis */}
      <Box sx={{ mb: 2, p: 2, bgcolor: 'rgba(100, 180, 255, 0.08)', borderRadius: 2, borderLeft: '4px solid #5cb8ff' }}>
        <Typography variant="subtitle2" sx={{ color: '#7ec8ff', mb: 1, fontWeight: 600 }}>
          <ScienceIcon sx={{ fontSize: '1rem', mr: 0.5, verticalAlign: 'middle' }} />
          Scientific Basis
        </Typography>
        <Typography variant="body2" sx={{ color: '#e0e0e0', lineHeight: 1.7 }}>
          {pattern.scientificBasis}
        </Typography>
      </Box>

      {/* Neuroscience Mechanism */}
      <Box sx={{ mb: 2, p: 2, bgcolor: 'rgba(180, 120, 255, 0.08)', borderRadius: 2, borderLeft: '4px solid #b388ff' }}>
        <Typography variant="subtitle2" sx={{ color: '#c9a0ff', mb: 1, fontWeight: 600 }}>
          <PsychologyIcon sx={{ fontSize: '1rem', mr: 0.5, verticalAlign: 'middle' }} />
          Neuroscience Mechanism
        </Typography>
        <Typography variant="body2" sx={{ color: '#e0e0e0', lineHeight: 1.7 }}>
          {pattern.neuroscienceMechanism}
        </Typography>
      </Box>

      {/* Frequency Rationale */}
      <Box sx={{ mb: 2, p: 2, bgcolor: 'rgba(255, 150, 80, 0.08)', borderRadius: 2, borderLeft: '4px solid #ffaa66' }}>
        <Typography variant="subtitle2" sx={{ color: '#ffbb77', mb: 1, fontWeight: 600 }}>
          Why {pattern.frequencyHz}Hz?
        </Typography>
        <Typography variant="body2" sx={{ color: '#e0e0e0', lineHeight: 1.7 }}>
          {pattern.frequencyRationale}
        </Typography>
      </Box>

      {/* Benefits */}
      <Typography variant="subtitle2" sx={{ color: '#88e8a0', mb: 1, fontWeight: 600 }}>Benefits:</Typography>
      <List dense sx={{ mb: 2 }}>
        {pattern.benefits.map((benefit, idx) => (
          <ListItem key={idx} sx={{ py: 0.25 }}>
            <ListItemIcon sx={{ minWidth: 28 }}>
              <CheckCircleIcon sx={{ fontSize: '0.9rem', color: '#88e8a0' }} />
            </ListItemIcon>
            <ListItemText
              primary={benefit}
              primaryTypographyProps={{ variant: 'body2', sx: { color: '#d8d8d8' } }}
            />
          </ListItem>
        ))}
      </List>

      {/* Instructions */}
      <Typography variant="subtitle2" sx={{ color: '#7ec8ff', mb: 1, fontWeight: 600 }}>Instructions:</Typography>
      <List dense sx={{ mb: 2 }}>
        {pattern.instructions.map((instruction, idx) => (
          <ListItem key={idx} sx={{ py: 0.25 }}>
            <ListItemIcon sx={{ minWidth: 28 }}>
              <Typography sx={{ color: '#7ec8ff', fontWeight: 700 }}>{idx + 1}.</Typography>
            </ListItemIcon>
            <ListItemText
              primary={instruction}
              primaryTypographyProps={{ variant: 'body2', sx: { color: '#d8d8d8' } }}
            />
          </ListItem>
        ))}
      </List>

      {/* Contraindications */}
      {pattern.contraindications.length > 0 && (
        <Alert severity="warning" sx={{ mb: 2, bgcolor: 'rgba(255, 180, 100, 0.12)', '& .MuiAlert-message': { color: '#ffcc88' } }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5, color: '#ffcc88' }}>Contraindications:</Typography>
          {pattern.contraindications.map((c, idx) => (
            <Typography key={idx} variant="body2" sx={{ color: '#e8d8c8' }}>• {c}</Typography>
          ))}
        </Alert>
      )}

      {/* Research References */}
      <Typography variant="subtitle2" sx={{ color: '#c9a0ff', mb: 1, fontWeight: 600 }}>Research References:</Typography>
      {pattern.researchReferences.map((ref, idx) => (
        <Typography key={idx} variant="caption" sx={{ display: 'block', color: '#a8a8a8', mb: 0.5, fontStyle: 'italic', lineHeight: 1.5 }}>
          [{idx + 1}] {ref}
        </Typography>
      ))}

      {/* Duration & Best For */}
      <Stack direction="row" spacing={1} sx={{ mt: 2, flexWrap: 'wrap', gap: 0.5 }}>
        <Chip label={`${pattern.recommendedDuration} min recommended`} size="small" sx={{ bgcolor: 'rgba(100, 200, 130, 0.2)', color: '#88e8a0', fontWeight: 600 }} />
        {pattern.bestFor.slice(0, 3).map((use, idx) => (
          <Chip key={idx} label={use} size="small" sx={{ bgcolor: 'rgba(255,255,255,0.08)', color: '#c8c8c8' }} />
        ))}
      </Stack>
    </AccordionDetails>
  </Accordion>
);

// Frequency Range Card - Improved readability
const FrequencyCard: React.FC<{ freq: FrequencyRange }> = ({ freq }) => (
  <Accordion
    sx={{
      mb: 1.5,
      background: 'rgba(20, 20, 30, 0.8)',
      border: '1px solid rgba(0, 191, 255, 0.2)',
      borderRadius: 2,
      '&:before': { display: 'none' }
    }}
  >
    <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: '#fff' }} />}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
        <Typography sx={{ color: '#fff', fontWeight: 700, fontSize: '1rem' }}>
          {freq.range} ({freq.hzMin}-{freq.hzMax}Hz)
        </Typography>
        <Chip
          label={freq.brainState}
          size="small"
          sx={{
            bgcolor: 'rgba(0, 191, 255, 0.25)',
            color: '#66d9ff',
            fontWeight: 600,
            fontSize: '0.75rem'
          }}
        />
      </Box>
    </AccordionSummary>
    <AccordionDetails sx={{ pt: 0 }}>
      <Typography variant="body2" sx={{ color: '#e0e0e0', mb: 2, lineHeight: 1.7 }}>
        {freq.scientificBasis}
      </Typography>
      <Box sx={{ p: 2, bgcolor: 'rgba(180, 120, 255, 0.08)', borderRadius: 2, borderLeft: '4px solid #b388ff', mb: 2 }}>
        <Typography variant="subtitle2" sx={{ color: '#c9a0ff', mb: 1, fontWeight: 600 }}>
          <PsychologyIcon sx={{ fontSize: '1rem', mr: 0.5, verticalAlign: 'middle' }} />
          Neural Mechanism
        </Typography>
        <Typography variant="body2" sx={{ color: '#e0e0e0', lineHeight: 1.7 }}>{freq.neuroscienceMechanism}</Typography>
      </Box>
      <Typography variant="subtitle2" sx={{ color: '#88e8a0', mb: 1, fontWeight: 600 }}>Benefits:</Typography>
      <List dense sx={{ mb: 1 }}>
        {freq.benefits.slice(0, 5).map((b, i) => (
          <ListItem key={i} sx={{ py: 0.25 }}>
            <ListItemIcon sx={{ minWidth: 28 }}>
              <CheckCircleIcon sx={{ fontSize: '0.9rem', color: '#88e8a0' }} />
            </ListItemIcon>
            <ListItemText primary={b} primaryTypographyProps={{ variant: 'body2', sx: { color: '#d8d8d8' } }} />
          </ListItem>
        ))}
      </List>
      {freq.contraindications.length > 0 && (
        <Alert severity="warning" sx={{ mt: 2, bgcolor: 'rgba(255, 180, 100, 0.12)', '& .MuiAlert-message': { color: '#ffcc88' } }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5, color: '#ffcc88' }}>Cautions:</Typography>
          {freq.contraindications.map((c, i) => <Typography key={i} variant="body2" sx={{ color: '#e8d8c8' }}>• {c}</Typography>)}
        </Alert>
      )}
    </AccordionDetails>
  </Accordion>
);

// ADHD Protocol Card - Improved readability
const ADHDCard: React.FC<{ protocol: ADHDProtocol }> = ({ protocol }) => (
  <Paper
    sx={{
      p: 2.5,
      mb: 2,
      bgcolor: 'rgba(20, 20, 30, 0.8)',
      border: '1px solid rgba(255, 64, 129, 0.3)',
      borderRadius: 2,
      borderLeft: '4px solid #ff4081'
    }}
  >
    <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1.5} flexWrap="wrap" gap={1}>
      <Typography variant="h6" sx={{ color: '#fff', fontWeight: 700 }}>{protocol.name}</Typography>
      <Chip
        label={protocol.effectiveness}
        size="small"
        sx={{
          bgcolor: 'rgba(100, 200, 130, 0.25)',
          color: '#88e8a0',
          fontWeight: 600
        }}
      />
    </Stack>
    <Stack direction="row" spacing={1} mb={2} flexWrap="wrap" gap={0.5}>
      <Chip
        label={`${protocol.targetFrequency}Hz`}
        size="small"
        sx={{
          bgcolor: 'rgba(180, 120, 255, 0.25)',
          color: '#c9a0ff',
          fontWeight: 600
        }}
      />
      <Chip
        label={`${protocol.duration} min`}
        size="small"
        sx={{
          bgcolor: 'rgba(0, 191, 255, 0.25)',
          color: '#66d9ff',
          fontWeight: 600
        }}
      />
    </Stack>
    <Typography variant="body2" sx={{ color: '#e0e0e0', mb: 2, lineHeight: 1.7 }}>{protocol.scientificBasis}</Typography>
    <Box sx={{ p: 2, bgcolor: 'rgba(180, 120, 255, 0.08)', borderRadius: 2, borderLeft: '4px solid #b388ff', mb: 2 }}>
      <Typography variant="subtitle2" sx={{ color: '#c9a0ff', mb: 1, fontWeight: 600 }}>
        <ScienceIcon sx={{ fontSize: '1rem', mr: 0.5, verticalAlign: 'middle' }} />
        Mechanism
      </Typography>
      <Typography variant="body2" sx={{ color: '#e0e0e0', lineHeight: 1.7 }}>{protocol.mechanism}</Typography>
    </Box>
    <Typography variant="subtitle2" sx={{ color: '#88e8a0', mb: 1, fontWeight: 600 }}>Expected Outcomes:</Typography>
    <List dense>
      {protocol.expectedOutcomes.slice(0, 5).map((o, i) => (
        <ListItem key={i} sx={{ py: 0.25 }}>
          <ListItemIcon sx={{ minWidth: 28 }}>
            <CheckCircleIcon sx={{ fontSize: '0.9rem', color: '#88e8a0' }} />
          </ListItemIcon>
          <ListItemText primary={o} primaryTypographyProps={{ variant: 'body2', sx: { color: '#d8d8d8' } }} />
        </ListItem>
      ))}
    </List>
  </Paper>
);

// Timer Preset Card - Improved readability
const TimerCard: React.FC<{ preset: TimerPreset }> = ({ preset }) => (
  <Accordion
    sx={{
      mb: 1.5,
      background: 'rgba(20, 20, 30, 0.8)',
      border: '1px solid rgba(255, 193, 7, 0.2)',
      borderRadius: 2,
      '&:before': { display: 'none' }
    }}
  >
    <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: '#fff' }} />}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
        <TimerIcon sx={{ color: '#ffc107' }} />
        <Typography sx={{ color: '#fff', fontWeight: 700, fontSize: '1rem' }}>{preset.name}</Typography>
        <Chip
          label={`${preset.duration} min`}
          size="small"
          sx={{
            bgcolor: 'rgba(255, 193, 7, 0.25)',
            color: '#ffdd55',
            fontWeight: 600,
            fontSize: '0.75rem'
          }}
        />
      </Box>
    </AccordionSummary>
    <AccordionDetails sx={{ pt: 0 }}>
      <Typography variant="body2" sx={{ color: '#e0e0e0', mb: 2, lineHeight: 1.7 }}>{preset.rationale}</Typography>
      <Box sx={{ p: 2, bgcolor: 'rgba(0, 191, 255, 0.08)', borderRadius: 2, borderLeft: '4px solid #5cb8ff', mb: 2 }}>
        <Typography variant="subtitle2" sx={{ color: '#7ec8ff', mb: 1, fontWeight: 600 }}>
          <WavesIcon sx={{ fontSize: '1rem', mr: 0.5, verticalAlign: 'middle' }} />
          Frequency Progression
        </Typography>
        <Typography variant="body2" sx={{ color: '#e0e0e0', lineHeight: 1.7 }}>{preset.frequencyProgression}</Typography>
      </Box>
      <Typography variant="subtitle2" sx={{ color: '#c9a0ff', mb: 1, fontWeight: 600 }}>Stages:</Typography>
      <Stack direction="row" flexWrap="wrap" gap={0.5} mb={2}>
        {preset.stages.map((stage, i) => (
          <Chip
            key={i}
            label={`${stage.phase}: ${stage.frequency}Hz (${stage.duration}min)`}
            size="small"
            sx={{
              bgcolor: 'rgba(180, 120, 255, 0.15)',
              color: '#d0b8ff',
              fontWeight: 500,
              fontSize: '0.75rem'
            }}
          />
        ))}
      </Stack>
      <Typography variant="caption" sx={{ display: 'block', color: '#a8a8a8', fontStyle: 'italic' }}>
        🕐 Best time: {preset.bestTimeOfDay}
      </Typography>
    </AccordionDetails>
  </Accordion>
);

// Best Practice Card - Improved readability
const PracticeCard: React.FC<{ practice: BestPractice }> = ({ practice }) => (
  <Paper
    sx={{
      p: 2.5,
      mb: 2,
      bgcolor: 'rgba(20, 20, 30, 0.8)',
      border: '1px solid rgba(76, 175, 80, 0.3)',
      borderRadius: 2,
      borderLeft: '4px solid #4caf50'
    }}
  >
    <Typography variant="h6" sx={{ color: '#fff', fontWeight: 700, mb: 1 }}>
      <TipsAndUpdatesIcon sx={{ fontSize: '1.2rem', mr: 1, verticalAlign: 'middle', color: '#88e8a0' }} />
      {practice.title}
    </Typography>
    <Typography variant="body2" sx={{ color: '#e0e0e0', mb: 2, lineHeight: 1.7 }}>{practice.description}</Typography>
    <Box sx={{ p: 2, bgcolor: 'rgba(0, 191, 255, 0.08)', borderRadius: 2, borderLeft: '4px solid #5cb8ff', mb: 2 }}>
      <Typography variant="subtitle2" sx={{ color: '#7ec8ff', mb: 1, fontWeight: 600 }}>
        <ScienceIcon sx={{ fontSize: '1rem', mr: 0.5, verticalAlign: 'middle' }} />
        Scientific Rationale
      </Typography>
      <Typography variant="body2" sx={{ color: '#e0e0e0', lineHeight: 1.7 }}>{practice.scientificRationale}</Typography>
    </Box>
    <Typography variant="subtitle2" sx={{ color: '#c9a0ff', mb: 1, fontWeight: 600 }}>Implementation:</Typography>
    <List dense>
      {practice.implementation.map((step, i) => (
        <ListItem key={i} sx={{ py: 0.25 }}>
          <ListItemIcon sx={{ minWidth: 28 }}>
            <CheckCircleIcon sx={{ fontSize: '0.9rem', color: '#c9a0ff' }} />
          </ListItemIcon>
          <ListItemText primary={step} primaryTypographyProps={{ variant: 'body2', sx: { color: '#d8d8d8' } }} />
        </ListItem>
      ))}
    </List>
    {practice.warnings && practice.warnings.length > 0 && (
      <Alert severity="warning" sx={{ mt: 2, bgcolor: 'rgba(255, 180, 100, 0.12)', '& .MuiAlert-message': { color: '#ffcc88' } }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5, color: '#ffcc88' }}>
          <WarningIcon sx={{ fontSize: '1rem', mr: 0.5, verticalAlign: 'middle' }} />
          Important Considerations:
        </Typography>
        {practice.warnings.map((w, i) => <Typography key={i} variant="body2" sx={{ color: '#e8d8c8' }}>• {w}</Typography>)}
      </Alert>
    )}
  </Paper>
);

// Tab configuration with unique colors and icons
const TAB_CONFIG = [
  { label: 'Patterns', icon: WavesIcon, color: '#ff6b00', bgColor: 'rgba(255, 107, 0, 0.15)' },
  { label: 'Frequencies', icon: PsychologyIcon, color: '#00bfff', bgColor: 'rgba(0, 191, 255, 0.15)' },
  { label: 'ADHD', icon: ScienceIcon, color: '#ff4081', bgColor: 'rgba(255, 64, 129, 0.15)' },
  { label: 'Remote Viewing', icon: VisibilityIcon, color: '#8a2be2', bgColor: 'rgba(138, 43, 226, 0.15)' },
  { label: 'Sessions', icon: TimerIcon, color: '#ffc107', bgColor: 'rgba(255, 193, 7, 0.15)' },
  { label: 'Tips', icon: TipsAndUpdatesIcon, color: '#4caf50', bgColor: 'rgba(76, 175, 80, 0.15)' },
];

// Main GuideTab Component
const GuideTab: React.FC<GuideTabProps> = () => {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <Box sx={{ py: 1 }}>
      <Typography variant="h5" component="h4" sx={{ color: '#fff', mb: 3, textAlign: 'center', fontWeight: 600 }}>
        <MenuBookIcon sx={{ mr: 1, verticalAlign: 'middle', color: '#ff6b00' }} />
        Electromagnetic Wave Guide
      </Typography>

      {/* Unique styled tab buttons */}
      <Stack
        direction="row"
        spacing={1}
        sx={{
          mb: 3,
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: 1
        }}
      >
        {TAB_CONFIG.map((tab, index) => {
          const IconComponent = tab.icon;
          const isActive = activeTab === index;
          return (
            <Box
              key={tab.label}
              onClick={() => setActiveTab(index)}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                px: 2,
                py: 1,
                borderRadius: 2,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                bgcolor: isActive ? tab.bgColor : 'rgba(255,255,255,0.05)',
                border: `2px solid ${isActive ? tab.color : 'rgba(255,255,255,0.1)'}`,
                '&:hover': {
                  bgcolor: tab.bgColor,
                  border: `2px solid ${tab.color}`,
                  transform: 'translateY(-2px)',
                  boxShadow: `0 4px 12px ${tab.color}40`
                }
              }}
            >
              <IconComponent sx={{ color: isActive ? tab.color : 'rgba(255,255,255,0.6)', fontSize: '1.2rem' }} />
              <Typography
                sx={{
                  color: isActive ? tab.color : 'rgba(255,255,255,0.8)',
                  fontWeight: isActive ? 700 : 500,
                  fontSize: '0.9rem'
                }}
              >
                {tab.label}
              </Typography>
            </Box>
          );
        })}
      </Stack>

      {/* Patterns Tab */}
      <TabPanel value={activeTab} index={0}>
        <Typography variant="body2" sx={{ color: '#c8c8c8', mb: 2, lineHeight: 1.6 }}>
          Deep scientific documentation for all electromagnetic wave patterns with neuroscience research backing.
        </Typography>
        {ELECTROMAGNETIC_PATTERNS_GUIDE.map((pattern) => (
          <PatternCard key={pattern.id} pattern={pattern} />
        ))}

        {/* Legacy Pattern Explanations */}
        <Divider sx={{ my: 3, borderColor: 'rgba(255, 107, 0, 0.3)' }} />
        <Typography variant="subtitle1" sx={{ color: '#ffaa66', mb: 2, fontWeight: 600 }}>
          <WavesIcon sx={{ fontSize: '1.1rem', mr: 1, verticalAlign: 'middle' }} />
          Additional Pattern Types
        </Typography>
        {Object.entries(PATTERN_EXPLANATIONS).map(([key, explanation]) => (
          <Accordion
            key={key}
            sx={{
              mb: 1.5,
              background: 'rgba(20, 20, 30, 0.8)',
              border: '1px solid rgba(255, 107, 0, 0.2)',
              borderRadius: 2,
              '&:before': { display: 'none' }
            }}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: '#fff' }} />}>
              <Typography sx={{ color: '#fff', fontWeight: 700 }}>{explanation.title}</Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ pt: 0 }}>
              <Typography variant="body2" sx={{ color: '#e0e0e0', mb: 2, lineHeight: 1.7 }}>{explanation.description}</Typography>
              <Box sx={{ p: 2, bgcolor: 'rgba(0, 191, 255, 0.08)', borderRadius: 2, borderLeft: '4px solid #5cb8ff', mb: 2 }}>
                <Typography variant="subtitle2" sx={{ color: '#7ec8ff', fontWeight: 600, mb: 1 }}>
                  <ScienceIcon sx={{ fontSize: '1rem', mr: 0.5, verticalAlign: 'middle' }} />
                  Scientific Basis
                </Typography>
                <Typography variant="body2" sx={{ color: '#e0e0e0', lineHeight: 1.7 }}>{explanation.science}</Typography>
              </Box>
              <Typography variant="subtitle2" sx={{ color: '#88e8a0', fontWeight: 600, mb: 1 }}>Benefits:</Typography>
              {explanation.benefits.map((b, i) => (
                <Typography key={i} variant="body2" sx={{ color: '#d8d8d8', mb: 0.5 }}>
                  <CheckCircleIcon sx={{ fontSize: '0.85rem', color: '#88e8a0', mr: 0.5, verticalAlign: 'middle' }} />
                  {b}
                </Typography>
              ))}
              <Typography variant="subtitle2" sx={{ color: '#ffaa66', fontWeight: 600, mt: 2, mb: 1 }}>Instructions:</Typography>
              {explanation.instructions.map((inst, i) => (
                <Typography key={i} variant="body2" sx={{ color: '#d8d8d8', mb: 0.5 }}>
                  <Box component="span" sx={{ color: '#ffaa66', fontWeight: 700, mr: 0.5 }}>{i + 1}.</Box>
                  {inst}
                </Typography>
              ))}
            </AccordionDetails>
          </Accordion>
        ))}
      </TabPanel>

      {/* Frequencies Tab */}
      <TabPanel value={activeTab} index={1}>
        <Typography variant="body2" sx={{ color: '#c8c8c8', mb: 2, lineHeight: 1.6 }}>
          Understanding brainwave frequency ranges and their effects on consciousness, cognition, and well-being.
        </Typography>
        {FREQUENCY_RANGES.map((freq) => (
          <FrequencyCard key={freq.range} freq={freq} />
        ))}
      </TabPanel>

      {/* ADHD Tab */}
      <TabPanel value={activeTab} index={2}>
        <Alert
          severity="info"
          sx={{
            mb: 3,
            bgcolor: 'rgba(255, 64, 129, 0.1)',
            border: '1px solid rgba(255, 64, 129, 0.3)',
            borderRadius: 2,
            '& .MuiAlert-icon': { color: '#ff4081' },
            '& .MuiAlert-message': { color: '#e0e0e0' }
          }}
        >
          <Typography variant="body2" sx={{ color: '#e0e0e0', lineHeight: 1.6 }}>
            These protocols are based on clinical neurofeedback research. Consult a healthcare provider before using for ADHD treatment.
          </Typography>
        </Alert>
        {ADHD_PROTOCOLS.map((protocol) => (
          <ADHDCard key={protocol.id} protocol={protocol} />
        ))}
      </TabPanel>

      {/* Remote Viewing Tab */}
      <TabPanel value={activeTab} index={3}>
        <Typography variant="body2" sx={{ color: '#c8c8c8', mb: 3, lineHeight: 1.6 }}>
          Comprehensive guide to Remote Viewing protocols including RV Sessions, CRV Protocol, ARV Predictions, and the Quantum Oracle.
        </Typography>

        {/* RV Sessions Section */}
        <Accordion
          sx={{
            mb: 1.5,
            background: 'rgba(20, 20, 30, 0.8)',
            border: '1px solid rgba(138, 43, 226, 0.3)',
            borderRadius: 2,
            '&:before': { display: 'none' }
          }}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: '#fff' }} />}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <VisibilityIcon sx={{ color: '#8a2be2' }} />
              <Typography sx={{ color: '#fff', fontWeight: 700 }}>{RV_SESSIONS_GUIDE.title}</Typography>
              <Chip label="Practice" size="small" sx={{ bgcolor: 'rgba(138, 43, 226, 0.25)', color: '#c9a0ff', fontWeight: 600 }} />
            </Box>
          </AccordionSummary>
          <AccordionDetails sx={{ pt: 0 }}>
            <Typography variant="body2" sx={{ color: '#e0e0e0', mb: 2, lineHeight: 1.7 }}>
              {RV_SESSIONS_GUIDE.description}
            </Typography>
            <Box sx={{ p: 2, bgcolor: 'rgba(138, 43, 226, 0.08)', borderRadius: 2, borderLeft: '4px solid #8a2be2', mb: 2 }}>
              <Typography variant="subtitle2" sx={{ color: '#c9a0ff', mb: 1, fontWeight: 600 }}>
                <ScienceIcon sx={{ fontSize: '1rem', mr: 0.5, verticalAlign: 'middle' }} />
                Scientific Basis
              </Typography>
              <Typography variant="body2" sx={{ color: '#e0e0e0', lineHeight: 1.7 }}>{RV_SESSIONS_GUIDE.scientificBasis}</Typography>
            </Box>
            <Typography variant="subtitle2" sx={{ color: '#88e8a0', mb: 1, fontWeight: 600 }}>How to Use:</Typography>
            <List dense sx={{ mb: 2 }}>
              {RV_SESSIONS_GUIDE.steps.map((step, idx) => (
                <ListItem key={idx} sx={{ py: 0.25 }}>
                  <ListItemIcon sx={{ minWidth: 28 }}>
                    <Typography sx={{ color: '#88e8a0', fontWeight: 700 }}>{idx + 1}.</Typography>
                  </ListItemIcon>
                  <ListItemText primary={step} primaryTypographyProps={{ variant: 'body2', sx: { color: '#d8d8d8' } }} />
                </ListItem>
              ))}
            </List>
            <Typography variant="subtitle2" sx={{ color: '#7ec8ff', mb: 1, fontWeight: 600 }}>Tips:</Typography>
            <List dense>
              {RV_SESSIONS_GUIDE.tips.map((tip, idx) => (
                <ListItem key={idx} sx={{ py: 0.25 }}>
                  <ListItemIcon sx={{ minWidth: 28 }}>
                    <TipsAndUpdatesIcon sx={{ fontSize: '0.9rem', color: '#7ec8ff' }} />
                  </ListItemIcon>
                  <ListItemText primary={tip} primaryTypographyProps={{ variant: 'body2', sx: { color: '#d8d8d8' } }} />
                </ListItem>
              ))}
            </List>
            <Chip
              label={`Recommended: ${RV_SESSIONS_GUIDE.frequencyRecommendation.beatFrequency}Hz ${RV_SESSIONS_GUIDE.frequencyRecommendation.brainState}`}
              size="small"
              sx={{ mt: 2, bgcolor: 'rgba(0, 255, 136, 0.2)', color: '#88e8a0', fontWeight: 600 }}
            />
          </AccordionDetails>
        </Accordion>

        {/* CRV Protocol Section */}
        <Accordion
          sx={{
            mb: 1.5,
            background: 'rgba(20, 20, 30, 0.8)',
            border: '1px solid rgba(138, 43, 226, 0.3)',
            borderRadius: 2,
            '&:before': { display: 'none' }
          }}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: '#fff' }} />}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <MenuBookIcon sx={{ color: '#8a2be2' }} />
              <Typography sx={{ color: '#fff', fontWeight: 700 }}>CRV Protocol (6 Stages)</Typography>
              <Chip label="Ingo Swann Method" size="small" sx={{ bgcolor: 'rgba(138, 43, 226, 0.25)', color: '#c9a0ff', fontWeight: 600 }} />
            </Box>
          </AccordionSummary>
          <AccordionDetails sx={{ pt: 0 }}>
            <Typography variant="body2" sx={{ color: '#e0e0e0', mb: 2, lineHeight: 1.7 }}>
              Controlled Remote Viewing (CRV) is a structured 6-stage protocol developed at Stanford Research Institute by Ingo Swann. Each stage progressively refines target perception.
            </Typography>
            {CRV_STAGES_GUIDE.map((stage) => (
              <Accordion
                key={stage.stage}
                sx={{
                  mb: 1,
                  background: 'rgba(0, 0, 0, 0.3)',
                  border: '1px solid rgba(138, 43, 226, 0.2)',
                  borderRadius: 1,
                  '&:before': { display: 'none' }
                }}
              >
                <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: '#c9a0ff' }} />}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                    <Chip
                      label={`Stage ${stage.stage}`}
                      size="small"
                      sx={{ bgcolor: '#8a2be2', color: '#fff', fontWeight: 700 }}
                    />
                    <Typography sx={{ color: '#fff', fontWeight: 600 }}>{stage.name}</Typography>
                    <Chip
                      label={`${stage.frequencyRecommendation.beatFrequency}Hz`}
                      size="small"
                      sx={{ bgcolor: 'rgba(0, 255, 136, 0.2)', color: '#88e8a0' }}
                    />
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography variant="body2" sx={{ color: '#e0e0e0', mb: 2, lineHeight: 1.7 }}>
                    <strong style={{ color: '#c9a0ff' }}>Objective:</strong> {stage.objective}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#d8d8d8', mb: 2, lineHeight: 1.7 }}>
                    {stage.description}
                  </Typography>
                  <Typography variant="subtitle2" sx={{ color: '#88e8a0', mb: 1, fontWeight: 600 }}>Techniques:</Typography>
                  {stage.techniques.map((tech, idx) => (
                    <Typography key={idx} variant="body2" sx={{ color: '#d8d8d8', mb: 0.5 }}>• {tech}</Typography>
                  ))}
                  <Typography variant="subtitle2" sx={{ color: '#7ec8ff', mt: 2, mb: 1, fontWeight: 600 }}>What to Record:</Typography>
                  {stage.whatToRecord.map((item, idx) => (
                    <Typography key={idx} variant="body2" sx={{ color: '#d8d8d8', mb: 0.5 }}>• {item}</Typography>
                  ))}
                  <Alert severity="warning" sx={{ mt: 2, bgcolor: 'rgba(255, 180, 100, 0.12)', '& .MuiAlert-message': { color: '#ffcc88' } }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#ffcc88', mb: 0.5 }}>Common Mistakes:</Typography>
                    {stage.commonMistakes.map((mistake, idx) => (
                      <Typography key={idx} variant="body2" sx={{ color: '#e8d8c8' }}>• {mistake}</Typography>
                    ))}
                  </Alert>
                  <Typography variant="caption" sx={{ display: 'block', mt: 2, color: '#a8a8a8' }}>
                    Duration: {stage.duration} | Frequency: {stage.frequencyRecommendation.beatFrequency}Hz ({stage.frequencyRecommendation.brainState})
                  </Typography>
                </AccordionDetails>
              </Accordion>
            ))}
          </AccordionDetails>
        </Accordion>

        {/* ARV Predictions Section */}
        <Accordion
          sx={{
            mb: 1.5,
            background: 'rgba(20, 20, 30, 0.8)',
            border: '1px solid rgba(255, 107, 0, 0.3)',
            borderRadius: 2,
            '&:before': { display: 'none' }
          }}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: '#fff' }} />}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <ScienceIcon sx={{ color: '#ff6b00' }} />
              <Typography sx={{ color: '#fff', fontWeight: 700 }}>{ARV_GUIDE.title}</Typography>
              <Chip label="Predictions" size="small" sx={{ bgcolor: 'rgba(255, 107, 0, 0.25)', color: '#ffaa66', fontWeight: 600 }} />
            </Box>
          </AccordionSummary>
          <AccordionDetails sx={{ pt: 0 }}>
            <Typography variant="body2" sx={{ color: '#e0e0e0', mb: 2, lineHeight: 1.7 }}>
              {ARV_GUIDE.description}
            </Typography>
            <Box sx={{ p: 2, bgcolor: 'rgba(255, 107, 0, 0.08)', borderRadius: 2, borderLeft: '4px solid #ff6b00', mb: 2 }}>
              <Typography variant="subtitle2" sx={{ color: '#ffaa66', mb: 1, fontWeight: 600 }}>How It Works:</Typography>
              <Typography variant="body2" sx={{ color: '#e0e0e0', lineHeight: 1.7 }}>{ARV_GUIDE.howItWorks}</Typography>
            </Box>
            <Typography variant="subtitle2" sx={{ color: '#88e8a0', mb: 1, fontWeight: 600 }}>Steps:</Typography>
            <List dense sx={{ mb: 2 }}>
              {ARV_GUIDE.steps.map((step, idx) => (
                <ListItem key={idx} sx={{ py: 0.25 }}>
                  <ListItemIcon sx={{ minWidth: 28 }}>
                    <Typography sx={{ color: '#88e8a0', fontWeight: 700 }}>{idx + 1}.</Typography>
                  </ListItemIcon>
                  <ListItemText primary={step} primaryTypographyProps={{ variant: 'body2', sx: { color: '#d8d8d8' } }} />
                </ListItem>
              ))}
            </List>
            <Typography variant="subtitle2" sx={{ color: '#7ec8ff', mb: 1, fontWeight: 600 }}>Judging Criteria:</Typography>
            {ARV_GUIDE.judgingCriteria.map((criterion, idx) => (
              <Typography key={idx} variant="body2" sx={{ color: '#d8d8d8', mb: 0.5 }}>• {criterion}</Typography>
            ))}
            <Typography variant="subtitle2" sx={{ color: '#c9a0ff', mt: 2, mb: 1, fontWeight: 600 }}>Applications:</Typography>
            <Stack direction="row" flexWrap="wrap" gap={0.5}>
              {ARV_GUIDE.applications.map((app, idx) => (
                <Chip key={idx} label={app} size="small" sx={{ bgcolor: 'rgba(138, 43, 226, 0.15)', color: '#c9a0ff' }} />
              ))}
            </Stack>
          </AccordionDetails>
        </Accordion>

        {/* Quantum Oracle Section */}
        <Accordion
          sx={{
            mb: 1.5,
            background: 'rgba(20, 20, 30, 0.8)',
            border: '1px solid rgba(0, 255, 136, 0.3)',
            borderRadius: 2,
            '&:before': { display: 'none' }
          }}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: '#fff' }} />}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <PsychologyIcon sx={{ color: '#00ff88' }} />
              <Typography sx={{ color: '#fff', fontWeight: 700 }}>{QUANTUM_ORACLE_GUIDE.title}</Typography>
              <Chip label="Quantum RNG" size="small" sx={{ bgcolor: 'rgba(0, 255, 136, 0.25)', color: '#88e8a0', fontWeight: 600 }} />
            </Box>
          </AccordionSummary>
          <AccordionDetails sx={{ pt: 0 }}>
            <Typography variant="body2" sx={{ color: '#e0e0e0', mb: 2, lineHeight: 1.7 }}>
              {QUANTUM_ORACLE_GUIDE.description}
            </Typography>
            <Box sx={{ p: 2, bgcolor: 'rgba(0, 255, 136, 0.08)', borderRadius: 2, borderLeft: '4px solid #00ff88', mb: 2 }}>
              <Typography variant="subtitle2" sx={{ color: '#88e8a0', mb: 1, fontWeight: 600 }}>Practice Mode:</Typography>
              <Typography variant="body2" sx={{ color: '#e0e0e0', lineHeight: 1.7, mb: 2 }}>{QUANTUM_ORACLE_GUIDE.practiceMode.description}</Typography>
              <Typography variant="subtitle2" sx={{ color: '#7ec8ff', mb: 1, fontWeight: 600 }}>Steps:</Typography>
              {QUANTUM_ORACLE_GUIDE.practiceMode.steps.map((step, idx) => (
                <Typography key={idx} variant="body2" sx={{ color: '#d8d8d8', mb: 0.5 }}>
                  <Box component="span" sx={{ color: '#7ec8ff', fontWeight: 700 }}>{idx + 1}.</Box> {step}
                </Typography>
              ))}
            </Box>
            <Typography variant="subtitle2" sx={{ color: '#c9a0ff', mb: 1, fontWeight: 600 }}>Tips:</Typography>
            {QUANTUM_ORACLE_GUIDE.practiceMode.tips.map((tip, idx) => (
              <Typography key={idx} variant="body2" sx={{ color: '#d8d8d8', mb: 0.5 }}>
                <TipsAndUpdatesIcon sx={{ fontSize: '0.85rem', color: '#c9a0ff', mr: 0.5, verticalAlign: 'middle' }} />
                {tip}
              </Typography>
            ))}
            <Box sx={{ p: 2, bgcolor: 'rgba(138, 43, 226, 0.08)', borderRadius: 2, borderLeft: '4px solid #8a2be2', mt: 2 }}>
              <Typography variant="subtitle2" sx={{ color: '#c9a0ff', mb: 1, fontWeight: 600 }}>
                <ScienceIcon sx={{ fontSize: '1rem', mr: 0.5, verticalAlign: 'middle' }} />
                Scientific Basis
              </Typography>
              <Typography variant="body2" sx={{ color: '#e0e0e0', lineHeight: 1.7 }}>{QUANTUM_ORACLE_GUIDE.scientificBasis}</Typography>
            </Box>
          </AccordionDetails>
        </Accordion>

        {/* General RV Tips Section */}
        <Divider sx={{ my: 3, borderColor: 'rgba(138, 43, 226, 0.3)' }} />
        <Typography variant="subtitle1" sx={{ color: '#c9a0ff', mb: 2, fontWeight: 600 }}>
          <TipsAndUpdatesIcon sx={{ fontSize: '1.1rem', mr: 1, verticalAlign: 'middle' }} />
          General Remote Viewing Tips
        </Typography>
        {RV_GENERAL_TIPS.map((tipSection) => (
          <Accordion
            key={tipSection.category}
            sx={{
              mb: 1.5,
              background: 'rgba(20, 20, 30, 0.8)',
              border: '1px solid rgba(138, 43, 226, 0.2)',
              borderRadius: 2,
              '&:before': { display: 'none' }
            }}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: '#c9a0ff' }} />}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Chip label={tipSection.category} size="small" sx={{ bgcolor: 'rgba(138, 43, 226, 0.25)', color: '#c9a0ff', fontWeight: 600 }} />
                <Typography sx={{ color: '#fff', fontWeight: 600 }}>{tipSection.title}</Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails sx={{ pt: 0 }}>
              <Typography variant="body2" sx={{ color: '#e0e0e0', mb: 2, lineHeight: 1.7 }}>
                {tipSection.description}
              </Typography>
              <List dense>
                {tipSection.details.map((detail, idx) => (
                  <ListItem key={idx} sx={{ py: 0.25 }}>
                    <ListItemIcon sx={{ minWidth: 28 }}>
                      <CheckCircleIcon sx={{ fontSize: '0.9rem', color: '#88e8a0' }} />
                    </ListItemIcon>
                    <ListItemText primary={detail} primaryTypographyProps={{ variant: 'body2', sx: { color: '#d8d8d8' } }} />
                  </ListItem>
                ))}
              </List>
            </AccordionDetails>
          </Accordion>
        ))}
      </TabPanel>

      {/* Sessions Tab */}
      <TabPanel value={activeTab} index={4}>
        <Typography variant="body2" sx={{ color: '#c8c8c8', mb: 2, lineHeight: 1.6 }}>
          Pre-configured timer sessions with optimized frequency progressions for different goals.
        </Typography>
        {TIMER_PRESETS.map((preset) => (
          <TimerCard key={preset.id} preset={preset} />
        ))}
      </TabPanel>

      {/* Tips Tab */}
      <TabPanel value={activeTab} index={5}>
        <Typography variant="body2" sx={{ color: '#c8c8c8', mb: 2, lineHeight: 1.6 }}>
          Science-backed best practices for maximizing the effectiveness of your binaural beat sessions.
        </Typography>
        {BEST_PRACTICES.map((practice, idx) => (
          <PracticeCard key={idx} practice={practice} />
        ))}
      </TabPanel>
    </Box>
  );
};

export default GuideTab;
