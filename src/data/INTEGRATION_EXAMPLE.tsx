/**
 * INTEGRATION EXAMPLE - How to use Electromagnetic Patterns Guide in GuideTab
 *
 * This file demonstrates how to integrate the comprehensive scientific guide
 * into the existing GuideTab component. Copy relevant sections into GuideTab.tsx
 */

import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Chip,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Alert
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
  ELECTROMAGNETIC_PATTERNS_GUIDE,
  getPatternsByType,
  getPatternsByBrainwave,
  type PatternGuideEntry
} from './electromagneticPatternsGuide';

/**
 * Enhanced GuideTab with Scientific Pattern Documentation
 */
const EnhancedGuideTab: React.FC = () => {
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedBrainwave, setSelectedBrainwave] = useState<string>('all');

  // Filter patterns based on selected filters
  const filteredPatterns = ELECTROMAGNETIC_PATTERNS_GUIDE.filter(pattern => {
    const typeMatch = selectedType === 'all' || pattern.type === selectedType;
    const brainwaveMatch = selectedBrainwave === 'all' || pattern.brainwaveType === selectedBrainwave;
    return typeMatch && brainwaveMatch;
  });

  return (
    <Box sx={{ py: 1 }}>
      {/* Header */}
      <Typography variant="h5" component="h4" sx={{ color: '#00ff88', mb: 2 }}>
        Electromagnetic Wave Pattern Guide
      </Typography>

      <Typography sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 3, fontSize: '0.95rem' }}>
        Scientifically-validated electromagnetic patterns for consciousness enhancement,
        healing, and cognitive optimization. Each pattern is backed by peer-reviewed
        neuroscience research.
      </Typography>

      {/* Filters */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <Box>
          <Typography sx={{ color: '#00ff88', mb: 1, fontSize: '0.85rem' }}>
            Filter by Pattern Type:
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Chip
              label="All"
              onClick={() => setSelectedType('all')}
              color={selectedType === 'all' ? 'primary' : 'default'}
              size="small"
            />
            <Chip
              label="Toroidal"
              onClick={() => setSelectedType('toroidal')}
              color={selectedType === 'toroidal' ? 'primary' : 'default'}
              size="small"
            />
            <Chip
              label="Vortex"
              onClick={() => setSelectedType('vortex')}
              color={selectedType === 'vortex' ? 'primary' : 'default'}
              size="small"
            />
            <Chip
              label="Spiral"
              onClick={() => setSelectedType('spiral')}
              color={selectedType === 'spiral' ? 'primary' : 'default'}
              size="small"
            />
            <Chip
              label="Helix"
              onClick={() => setSelectedType('helix')}
              color={selectedType === 'helix' ? 'primary' : 'default'}
              size="small"
            />
          </Box>
        </Box>

        <Box>
          <Typography sx={{ color: '#00ff88', mb: 1, fontSize: '0.85rem' }}>
            Filter by Brainwave:
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Chip
              label="All"
              onClick={() => setSelectedBrainwave('all')}
              color={selectedBrainwave === 'all' ? 'secondary' : 'default'}
              size="small"
            />
            <Chip
              label="Delta"
              onClick={() => setSelectedBrainwave('delta')}
              color={selectedBrainwave === 'delta' ? 'secondary' : 'default'}
              size="small"
            />
            <Chip
              label="Theta"
              onClick={() => setSelectedBrainwave('theta')}
              color={selectedBrainwave === 'theta' ? 'secondary' : 'default'}
              size="small"
            />
            <Chip
              label="Alpha"
              onClick={() => setSelectedBrainwave('alpha')}
              color={selectedBrainwave === 'alpha' ? 'secondary' : 'default'}
              size="small"
            />
            <Chip
              label="Gamma"
              onClick={() => setSelectedBrainwave('gamma')}
              color={selectedBrainwave === 'gamma' ? 'secondary' : 'default'}
              size="small"
            />
          </Box>
        </Box>
      </Box>

      {/* Pattern Cards */}
      {filteredPatterns.map((pattern) => (
        <PatternCard key={pattern.id} pattern={pattern} />
      ))}

      {/* General Guidelines */}
      <GeneralGuidelines />
    </Box>
  );
};

/**
 * Individual Pattern Card Component
 */
const PatternCard: React.FC<{ pattern: PatternGuideEntry }> = ({ pattern }) => {
  return (
    <Paper
      sx={{
        mb: 3,
        p: 3,
        background: 'rgba(255, 255, 255, 0.03)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: 3,
        transition: 'all 0.3s ease',
        '&:hover': {
          border: '1px solid rgba(0, 255, 136, 0.3)',
          background: 'rgba(255, 255, 255, 0.05)'
        }
      }}
    >
      {/* Header */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="h6" sx={{ color: '#00ff88', mb: 1.5 }}>
          {pattern.name}
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Chip
            label={`${pattern.frequencyHz}Hz`}
            sx={{ backgroundColor: '#00ff88', color: '#000' }}
            size="small"
          />
          <Chip
            label={pattern.brainwaveType.toUpperCase()}
            sx={{ backgroundColor: '#8a2be2', color: '#fff' }}
            size="small"
          />
          <Chip
            label={`${pattern.recommendedDuration} min`}
            sx={{ backgroundColor: '#ff6b00', color: '#fff' }}
            size="small"
          />
          <Chip
            label={pattern.type}
            variant="outlined"
            sx={{ borderColor: '#00bfff', color: '#00bfff' }}
            size="small"
          />
        </Box>
      </Box>

      <Divider sx={{ my: 2, borderColor: 'rgba(255, 255, 255, 0.1)' }} />

      {/* Scientific Basis */}
      <Accordion
        sx={{
          background: 'rgba(0, 191, 255, 0.05)',
          mb: 1,
          '&:before': { display: 'none' }
        }}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: '#00bfff' }} />}>
          <Typography sx={{ color: '#00bfff', fontWeight: 600 }}>
            Scientific Basis
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography sx={{ color: 'rgba(255, 255, 255, 0.8)', lineHeight: 1.6, fontSize: '0.9rem' }}>
            {pattern.scientificBasis}
          </Typography>
        </AccordionDetails>
      </Accordion>

      {/* Neuroscience Mechanism */}
      <Accordion
        sx={{
          background: 'rgba(138, 43, 226, 0.05)',
          mb: 1,
          '&:before': { display: 'none' }
        }}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: '#8a2be2' }} />}>
          <Typography sx={{ color: '#8a2be2', fontWeight: 600 }}>
            Neuroscience Mechanism
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography sx={{ color: 'rgba(255, 255, 255, 0.8)', lineHeight: 1.6, fontSize: '0.9rem' }}>
            {pattern.neuroscienceMechanism}
          </Typography>
        </AccordionDetails>
      </Accordion>

      {/* Frequency Rationale */}
      <Accordion
        sx={{
          background: 'rgba(255, 107, 0, 0.05)',
          mb: 2,
          '&:before': { display: 'none' }
        }}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: '#ff6b00' }} />}>
          <Typography sx={{ color: '#ff6b00', fontWeight: 600 }}>
            Why {pattern.frequencyHz}Hz?
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography sx={{ color: 'rgba(255, 255, 255, 0.8)', lineHeight: 1.6, fontSize: '0.9rem' }}>
            {pattern.frequencyRationale}
          </Typography>
        </AccordionDetails>
      </Accordion>

      {/* Benefits */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle1" sx={{ color: '#32cd32', mb: 1, fontWeight: 600 }}>
          Benefits
        </Typography>
        <Box component="ul" sx={{ pl: 3, mb: 0 }}>
          {pattern.benefits.map((benefit, idx) => (
            <Typography
              key={idx}
              component="li"
              sx={{ color: 'rgba(255, 255, 255, 0.8)', mb: 0.5, fontSize: '0.9rem' }}
            >
              {benefit}
            </Typography>
          ))}
        </Box>
      </Box>

      {/* Instructions */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle1" sx={{ color: '#ffd700', mb: 1, fontWeight: 600 }}>
          Instructions
        </Typography>
        <Box component="ol" sx={{ pl: 3, mb: 0 }}>
          {pattern.instructions.map((instruction, idx) => (
            <Typography
              key={idx}
              component="li"
              sx={{ color: 'rgba(255, 255, 255, 0.8)', mb: 0.5, fontSize: '0.9rem' }}
            >
              {instruction}
            </Typography>
          ))}
        </Box>
      </Box>

      {/* Best For */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle1" sx={{ color: '#00ffff', mb: 1, fontWeight: 600 }}>
          Best For
        </Typography>
        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
          {pattern.bestFor.map((use, idx) => (
            <Chip
              key={idx}
              label={use}
              size="small"
              sx={{
                backgroundColor: 'rgba(0, 255, 255, 0.1)',
                color: '#00ffff',
                border: '1px solid rgba(0, 255, 255, 0.3)'
              }}
            />
          ))}
        </Box>
      </Box>

      {/* Contraindications Warning */}
      <Alert
        severity="warning"
        sx={{
          mb: 2,
          backgroundColor: 'rgba(255, 69, 0, 0.1)',
          border: '1px solid rgba(255, 69, 0, 0.3)',
          '& .MuiAlert-icon': { color: '#ff4500' }
        }}
      >
        <Typography variant="subtitle2" sx={{ mb: 0.5, fontWeight: 600 }}>
          Contraindications & Warnings
        </Typography>
        <Box component="ul" sx={{ pl: 2, mb: 0 }}>
          {pattern.contraindications.map((warning, idx) => (
            <Typography
              key={idx}
              component="li"
              sx={{ fontSize: '0.85rem', mb: 0.3 }}
            >
              {warning}
            </Typography>
          ))}
        </Box>
      </Alert>

      {/* Target Brain Regions */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle1" sx={{ color: '#9370db', mb: 1, fontWeight: 600 }}>
          Target Brain Regions
        </Typography>
        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
          {pattern.targetBrainRegions.map((region, idx) => (
            <Chip
              key={idx}
              label={region}
              size="small"
              variant="outlined"
              sx={{ borderColor: '#9370db', color: '#9370db' }}
            />
          ))}
        </Box>
      </Box>

      {/* Expected Effects Timeline */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, rgba(0, 255, 136, 0.1) 0%, rgba(0, 191, 255, 0.1) 100%)',
          p: 2,
          borderRadius: 2,
          border: '1px solid rgba(0, 255, 136, 0.3)'
        }}
      >
        <Typography variant="subtitle2" sx={{ color: '#00ff88', mb: 1, fontWeight: 600 }}>
          Expected Effects Timeline
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          <Typography sx={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.85rem' }}>
            <strong>Onset:</strong> {pattern.expectedEffects.onset}
          </Typography>
          <Typography sx={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.85rem' }}>
            <strong>Peak:</strong> {pattern.expectedEffects.peak}
          </Typography>
          <Typography sx={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.85rem' }}>
            <strong>Duration:</strong> {pattern.expectedEffects.duration}
          </Typography>
        </Box>
      </Box>

      {/* Research References (Collapsible) */}
      <Accordion
        sx={{
          mt: 2,
          background: 'rgba(0, 0, 0, 0.2)',
          '&:before': { display: 'none' }
        }}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: '#00bfff' }} />}>
          <Typography sx={{ color: '#00bfff', fontSize: '0.9rem', fontWeight: 600 }}>
            Research References ({pattern.researchReferences.length})
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box sx={{ fontFamily: 'monospace' }}>
            {pattern.researchReferences.map((ref, idx) => (
              <Typography
                key={idx}
                sx={{
                  color: 'rgba(255, 255, 255, 0.7)',
                  mb: 1.5,
                  fontSize: '0.75rem',
                  lineHeight: 1.5
                }}
              >
                [{idx + 1}] {ref}
              </Typography>
            ))}
          </Box>
        </AccordionDetails>
      </Accordion>
    </Paper>
  );
};

/**
 * General Guidelines Section
 */
const GeneralGuidelines: React.FC = () => {
  return (
    <Paper
      sx={{
        mt: 4,
        p: 3,
        background: 'linear-gradient(135deg, rgba(138, 43, 226, 0.1) 0%, rgba(75, 0, 130, 0.1) 100%)',
        border: '2px solid rgba(138, 43, 226, 0.3)',
        borderRadius: 3
      }}
    >
      <Typography variant="h6" sx={{ color: '#8a2be2', mb: 2, fontWeight: 600 }}>
        General Usage Guidelines
      </Typography>

      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle1" sx={{ color: '#00ff88', mb: 1, fontWeight: 600 }}>
          Session Frequency Recommendations
        </Typography>
        <Typography sx={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.9rem', lineHeight: 1.6 }}>
          • <strong>Gamma (40Hz):</strong> 2-3 times per week maximum to prevent overstimulation<br />
          • <strong>Theta/Alpha (6-12Hz):</strong> Daily use is safe and beneficial<br />
          • <strong>Delta (2.675Hz):</strong> Daily before sleep or 4-5 times per week
        </Typography>
      </Box>

      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle1" sx={{ color: '#00ff88', mb: 1, fontWeight: 600 }}>
          Progression Protocol
        </Typography>
        <Typography sx={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.9rem', lineHeight: 1.6 }}>
          • <strong>Week 1-2:</strong> Start with 50% of recommended duration<br />
          • <strong>Week 3-4:</strong> Increase to 75% of recommended duration<br />
          • <strong>Week 5+:</strong> Full duration as individually tolerated
        </Typography>
      </Box>

      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle1" sx={{ color: '#00ff88', mb: 1, fontWeight: 600 }}>
          Headphone Requirements
        </Typography>
        <Typography sx={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.9rem', lineHeight: 1.6 }}>
          Quality stereo headphones are essential for accurate binaural beat delivery. Spatial
          separation between left and right channels must be maintained. Volume should be
          comfortable - excessive volume does not increase effectiveness and may cause hearing damage.
        </Typography>
      </Box>

      <Alert
        severity="error"
        sx={{
          backgroundColor: 'rgba(255, 0, 0, 0.1)',
          border: '1px solid rgba(255, 0, 0, 0.3)',
          '& .MuiAlert-icon': { color: '#ff4500' }
        }}
      >
        <Typography variant="subtitle2" sx={{ mb: 0.5, fontWeight: 600 }}>
          Important Safety Information
        </Typography>
        <Typography sx={{ fontSize: '0.85rem', lineHeight: 1.5 }}>
          Individuals with epilepsy, seizure disorders, or other neurological conditions should
          consult a healthcare provider before using binaural beat technology. Pregnant women,
          people with pacemakers, and those on psychoactive medications should also seek medical
          guidance. This technology is for wellness purposes and is not a substitute for
          professional medical treatment.
        </Typography>
      </Alert>
    </Paper>
  );
};

export default EnhancedGuideTab;
