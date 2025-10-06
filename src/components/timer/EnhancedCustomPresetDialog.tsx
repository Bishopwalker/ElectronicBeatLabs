import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  Paper,
  IconButton,
  CircularProgress,
  Grid,
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Slider,
  Switch
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import type { CustomPresetForm } from '../../data/timer';
import { getWaveTypeFromFrequency } from '../../helpers/timer/timerUtils';
import type {LocalAudio} from "../../types/localaudio.types";

const CATEGORY_OPTIONS = [
  'focus', 'meditation', 'healing', 'sleep', 'lucid', 'creativity',
  'adhd', 'gamma', 'theta', 'alpha', 'delta', 'beta', 'toroidal'
];

interface EnhancedCustomPresetDialogProps {
  open: boolean;
  onClose: () => void;
  customPreset: CustomPresetForm;
  setCustomPreset: React.Dispatch<React.SetStateAction<CustomPresetForm>>;
  onSave: () => void;
  loading: boolean;
  localAudio: LocalAudio;

}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`preset-tabpanel-${index}`}
      aria-labelledby={`preset-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 2 }}>{children}</Box>}
    </div>
  );
}

const AVAILABLE_PATTERNS = [
  'spiral-transformation',
  'helix-dna-activation',
  'vortex-focus-enhancement',
  'toroidal-max-resonance',
  'interference-balance',
  'standing-wave-meditation',
  'consciousness-activation-vortex',
  'toroidal-lucidity-mastery'
];


const EnhancedCustomPresetDialog: React.FC<EnhancedCustomPresetDialogProps> = ({
  open,
  onClose,
  customPreset,
  setCustomPreset,
  onSave,
  loading,
    localAudio,
}) => {
  const [activeTab, setActiveTab] = useState(0);

  const addTransition = () => {
    setCustomPreset(prev => ({
      ...prev,
      transitions: [...prev.transitions, {
        duration_minutes: 10,
        frequency_hz: 10,
        frequency_type: 'Alpha',
        left_ear_hz: 140,
        right_ear_hz: 150,
        description: 'New transition',
        pattern: 'spiral-transformation',
        localAudio:localAudio,


      }]
    }));
  };

  const removeTransition = (index: number) => {
    setCustomPreset(prev => ({
      ...prev,
      transitions: prev.transitions.filter((_, i) => i !== index)
    }));
  };

  const updateTransition = (index: number, field: string, value: any) => {
    setCustomPreset(prev => {
      const newTransitions = prev.transitions.map((t, i) => {
        if (i === index) {
          const updatedTransition = { ...t, [field]: value };

          if (field === 'left_ear_hz' || field === 'right_ear_hz') {
            const leftEar = field === 'left_ear_hz' ? value : updatedTransition.left_ear_hz;
            const rightEar = field === 'right_ear_hz' ? value : updatedTransition.right_ear_hz;

            const leftNum = parseFloat(leftEar);
            const rightNum = parseFloat(rightEar);

            if (!isNaN(leftNum) && !isNaN(rightNum)) {
              const beatFreq = Math.abs(rightNum - leftNum);
              updatedTransition.frequency_hz = beatFreq;
              updatedTransition.frequency_type = getWaveTypeFromFrequency(beatFreq);
            }
          }

          return updatedTransition;
        }
        return t;
      });

      return {
        ...prev,
        transitions: newTransitions
      };
    });
  };

  const updateSpatialSetting = (transitionIndex: number, field: string, value: any) => {
    setCustomPreset(prev => {
      const newTransitions = prev.transitions.map((t, i) => {
        if (i === transitionIndex) {
          return {
            ...t,
            spatial_settings: {
              ...t.spatial_settings,
              [field]: value
            }
          };
        }
        return t;
      });

      return {
        ...prev,
        transitions: newTransitions
      };
    });
  };

  const addCategory = (category: string) => {
    if (!customPreset.categories?.includes(category)) {
      setCustomPreset(prev => ({
        ...prev,
        categories: [...(prev.categories || []), category]
      }));
    }
  };

  const removeCategory = (category: string) => {
    setCustomPreset(prev => ({
      ...prev,
      categories: prev.categories?.filter(c => c !== category) || []
    }));
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: { minHeight: '80vh' }
      }}
    >
      <DialogTitle>
        🎵 Create Enhanced Binaural Beat Preset
      </DialogTitle>

      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)}>
          <Tab label="📝 Basic Info" />
          <Tab label="🎵 Transitions" />
          <Tab label="🌐 Spatial Audio" />
          <Tab label="🔄 Loop Config" />
          <Tab label="🧘 Activities" />
        </Tabs>
      </Box>

      <DialogContent>
        {/* Basic Information Tab */}
        <TabPanel value={activeTab} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Preset Name"
                value={customPreset.name}
                onChange={(e) => setCustomPreset(prev => ({ ...prev, name: e.target.value }))}
                required
                helperText="Give your preset a descriptive name (e.g., 'Morning Focus Blast - 25min')"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                value={customPreset.description}
                onChange={(e) => setCustomPreset(prev => ({ ...prev, description: e.target.value }))}
                multiline
                rows={3}
                helperText="Describe what this preset does and its intended effects"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Difficulty Level</InputLabel>
                <Select
                  value={customPreset.difficulty_level || 'beginner'}
                  onChange={(e) => setCustomPreset(prev => ({ ...prev, difficulty_level: e.target.value as any }))}
                >
                  <MenuItem value="beginner">🌱 Beginner</MenuItem>
                  <MenuItem value="intermediate">🌿 Intermediate</MenuItem>
                  <MenuItem value="advanced">🌳 Advanced</MenuItem>
                  <MenuItem value="expert">🏔️ Expert</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>Categories</Typography>
              <Box sx={{ mb: 2 }}>
                {customPreset.categories?.map((category) => (
                  <Chip
                    key={category}
                    label={category}
                    onDelete={() => removeCategory(category)}
                    sx={{ mr: 1, mb: 1 }}
                  />
                ))}
              </Box>
              <FormControl fullWidth>
                <InputLabel>Add Category</InputLabel>
                <Select
                  value=""
                  onChange={(e) => addCategory(e.target.value)}
                >
                  {CATEGORY_OPTIONS.map((category) => (
                    <MenuItem
                      key={category}
                      value={category}
                      disabled={customPreset.categories?.includes(category)}
                    >
                      {category}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Target States (comma-separated)"
                value={customPreset.target_states?.join(', ') || ''}
                onChange={(e) => setCustomPreset(prev => ({
                  ...prev,
                  target_states: e.target.value.split(', ').filter(s => s.trim())
                }))}
                helperText="e.g., 'deep focus, enhanced creativity, stress relief'"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Contraindications (comma-separated)"
                value={customPreset.contraindications?.join(', ') || ''}
                onChange={(e) => setCustomPreset(prev => ({
                  ...prev,
                  contraindications: e.target.value.split(', ').filter(s => s.trim())
                }))}
                helperText="e.g., 'epilepsy, heart conditions, pregnancy'"
              />
            </Grid>
          </Grid>
        </TabPanel>

        {/* Transitions Tab */}
        <TabPanel value={activeTab} index={1}>
          <Box sx={{ mb: 2 }}>
            <Typography variant="h6" gutterBottom>
              Frequency Transitions
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Create the progression of brainwave frequencies for your session
            </Typography>
          </Box>

          {customPreset.transitions.map((transition, index) => (
            <Accordion key={index} defaultExpanded={customPreset.transitions.length === 1}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography>
                  🎵 Phase {index + 1}: {transition.frequency_type} ({transition.frequency_hz}Hz) - {transition.duration_minutes}min
                </Typography>
                {customPreset.transitions.length > 1 && (
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeTransition(index);
                    }}
                    color="error"
                    sx={{ ml: 'auto', mr: 1 }}
                  >
                    <DeleteIcon />
                  </IconButton>
                )}
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Phase Description"
                      value={transition.description}
                      onChange={(e) => updateTransition(index, 'description', e.target.value)}
                      size="small"
                    />
                  </Grid>

                  <Grid item xs={6} md={3}>
                    <TextField
                      fullWidth
                      label="Left Ear (Hz)"
                      type="number"
                      value={transition.left_ear_hz}
                      onChange={(e) => updateTransition(index, 'left_ear_hz', parseFloat(e.target.value))}
                      size="small"
                    />
                  </Grid>

                  <Grid item xs={6} md={3}>
                    <TextField
                      fullWidth
                      label="Right Ear (Hz)"
                      type="number"
                      value={transition.right_ear_hz}
                      onChange={(e) => updateTransition(index, 'right_ear_hz', parseFloat(e.target.value))}
                      size="small"
                    />
                  </Grid>

                  <Grid item xs={6} md={3}>
                    <TextField
                      fullWidth
                      label="Beat Frequency"
                      value={`${transition.frequency_hz}Hz`}
                      InputProps={{ readOnly: true }}
                      size="small"
                      sx={{ '& .MuiInputBase-input': { fontWeight: 'bold', color: 'primary.main' } }}
                    />
                  </Grid>

                  <Grid item xs={6} md={3}>
                    <TextField
                      fullWidth
                      label="Duration (min)"
                      type="number"
                      value={transition.duration_minutes}
                      onChange={(e) => updateTransition(index, 'duration_minutes', parseInt(e.target.value))}
                      size="small"
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Pattern Type</InputLabel>
                      <Select
                        value={transition.pattern || 'spiral-transformation'}
                        onChange={(e) => updateTransition(index, 'pattern', e.target.value)}
                      >
                        {AVAILABLE_PATTERNS.map((pattern) => (
                          <MenuItem key={pattern} value={pattern}>
                            {pattern.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
              </AccordionDetails>
            </Accordion>
          ))}

          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={addTransition}
            sx={{ mt: 2, mb: 2 }}
            fullWidth
          >
            Add New Transition Phase
          </Button>

          <Typography variant="body2" color="text.secondary" align="center">
            Total Duration: {customPreset.transitions.reduce((sum, t) => sum + t.duration_minutes, 0)} minutes
          </Typography>
        </TabPanel>

        {/* Spatial Audio Tab */}
        <TabPanel value={activeTab} index={2}>
          <Typography variant="h6" gutterBottom>
            🌐 8D Spatial Audio Configuration
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom sx={{ mb: 3 }}>
            Configure 3D audio positioning and movement for each transition phase
          </Typography>

          {customPreset.transitions.map((transition, index) => (
            <Accordion key={index}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography>
                  Phase {index + 1} Spatial Settings - {transition.frequency_type}
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={transition.spatial_settings?.enabled || false}
                          onChange={(e) => updateSpatialSetting(index, 'enabled', e.target.checked)}
                        />
                      }
                      label="Enable 8D Spatial Audio"
                    />
                  </Grid>

                  {transition.spatial_settings?.enabled && (
                    <>
                      <Grid item xs={12} md={6}>
                        <Typography gutterBottom>Room Size: {transition.spatial_settings?.roomSize || 0.5}</Typography>
                        <Slider
                          value={transition.spatial_settings?.roomSize || 0.5}
                          onChange={(_, value) => updateSpatialSetting(index, 'roomSize', value)}
                          min={0.2}
                          max={2.0}
                          step={0.1}
                          marks={[
                            { value: 0.2, label: 'Tiny' },
                            { value: 0.5, label: 'Small' },
                            { value: 1.0, label: 'Medium' },
                            { value: 2.0, label: 'Large' }
                          ]}
                        />
                      </Grid>

                      <Grid item xs={12} md={6}>
                        <Typography gutterBottom>Movement Speed: {transition.spatial_settings?.movement_speed || 0.05}</Typography>
                        <Slider
                          value={transition.spatial_settings?.movement_speed || 0.05}
                          onChange={(_, value) => updateSpatialSetting(index, 'movement_speed', value)}
                          min={0.005}
                          max={0.1}
                          step={0.005}
                          marks={[
                            { value: 0.005, label: 'Very Slow' },
                            { value: 0.05, label: 'Normal' },
                            { value: 0.1, label: 'Fast' }
                          ]}
                        />
                      </Grid>

                      <Grid item xs={12} md={6}>
                        <Typography gutterBottom>Spatial Intensity: {transition.spatial_settings?.spatial_intensity || 0.6}</Typography>
                        <Slider
                          value={transition.spatial_settings?.spatial_intensity || 0.6}
                          onChange={(_, value) => updateSpatialSetting(index, 'spatial_intensity', value)}
                          min={0.0}
                          max={1.0}
                          step={0.1}
                        />
                      </Grid>

                      <Grid item xs={12} md={6}>
                        <Typography gutterBottom>Reverb Amount: {transition.spatial_settings?.reverbAmount || 0.3}</Typography>
                        <Slider
                          value={transition.spatial_settings?.reverbAmount || 0.3}
                          onChange={(_, value) => updateSpatialSetting(index, 'reverbAmount', value)}
                          min={0.0}
                          max={1.0}
                          step={0.1}
                        />
                      </Grid>

                      <Grid item xs={12}>
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={transition.spatial_settings?.hrtf || false}
                              onChange={(e) => updateSpatialSetting(index, 'hrtf', e.target.checked)}
                            />
                          }
                          label="Enable HRTF (Head-Related Transfer Function) for realistic 3D positioning"
                        />
                      </Grid>
                    </>
                  )}
                </Grid>
              </AccordionDetails>
            </Accordion>
          ))}
        </TabPanel>

        {/* Loop Configuration Tab */}
        <TabPanel value={activeTab} index={3}>
          <Typography variant="h6" gutterBottom>
            🔄 Loop Configuration
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom sx={{ mb: 3 }}>
            Set up repeating patterns for extended sessions
          </Typography>

          <Grid container spacing={3}>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={customPreset.loop_enabled || false}
                    onChange={(e) => setCustomPreset(prev => ({ ...prev, loop_enabled: e.target.checked }))}
                  />
                }
                label="Enable Looping"
              />
            </Grid>

            {customPreset.loop_enabled && (
              <>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Loop Count (0 = infinite)"
                    type="number"
                    value={customPreset.loop_count || 0}
                    onChange={(e) => setCustomPreset(prev => ({
                      ...prev,
                      loop_count: parseInt(e.target.value)
                    }))}
                    inputProps={{ min: 0, max: 10 }}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Loop Scope</InputLabel>
                    <Select
                      value={customPreset.loop_phase || 'full'}
                      onChange={(e) => setCustomPreset(prev => ({
                        ...prev,
                        loop_phase: e.target.value as any
                      }))}
                    >
                      <MenuItem value="full">🔄 Loop Entire Preset</MenuItem>
                      <MenuItem value="specific_transitions">🎯 Loop Specific Phases</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                {customPreset.loop_phase === 'specific_transitions' && (
                  <Grid item xs={12}>
                    <Typography gutterBottom>Select Phases to Loop:</Typography>
                    {customPreset.transitions.map((_, index) => (
                      <FormControlLabel
                        key={index}
                        control={
                          <Checkbox
                            checked={customPreset.loop_transitions?.includes(index) || false}
                            onChange={(e) => {
                              const current = customPreset.loop_transitions || [];
                              if (e.target.checked) {
                                setCustomPreset(prev => ({
                                  ...prev,
                                  loop_transitions: [...current, index]
                                }));
                              } else {
                                setCustomPreset(prev => ({
                                  ...prev,
                                  loop_transitions: current.filter(i => i !== index)
                                }));
                              }
                            }}
                          />
                        }
                        label={`Phase ${index + 1} (${customPreset.transitions[index].frequency_type})`}
                      />
                    ))}
                  </Grid>
                )}

                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={customPreset.fade_between_loops || false}
                        onChange={(e) => setCustomPreset(prev => ({
                          ...prev,
                          fade_between_loops: e.target.checked
                        }))}
                      />
                    }
                    label="Smooth Fade Between Loops"
                  />
                </Grid>
              </>
            )}
          </Grid>
        </TabPanel>

        {/* Session Activities Tab */}
        <TabPanel value={activeTab} index={4}>
          <Typography variant="h6" gutterBottom>
            🧘 Pre & Post Session Activities
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom sx={{ mb: 3 }}>
            Configure preparation and integration activities
          </Typography>

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography>🚀 Pre-Session Preparation</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Preparation Duration (minutes)"
                    type="number"
                    value={customPreset.preparation?.duration_minutes || 5}
                    onChange={(e) => setCustomPreset(prev => ({
                      ...prev,
                      preparation: {
                        ...prev.preparation,
                        duration_minutes: parseInt(e.target.value),
                        instructions: prev.preparation?.instructions || ['Take deep breaths', 'Set your intention'],
                        breathing_pattern: prev.preparation?.breathing_pattern || { inhale_seconds: 4, hold_seconds: 4, exhale_seconds: 6, cycles: 5 },
                        affirmations: prev.preparation?.affirmations || ['I am ready for transformation']
                      }
                    }))}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Preparation Instructions (one per line)"
                    multiline
                    rows={4}
                    value={customPreset.preparation?.instructions.join('\n') || ''}
                    onChange={(e) => setCustomPreset(prev => ({
                      ...prev,
                      preparation: {
                        ...prev.preparation!,
                        instructions: e.target.value.split('\n').filter(s => s.trim())
                      }
                    }))}
                  />
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography>🌟 Post-Session Integration</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Integration Duration (minutes)"
                    type="number"
                    value={customPreset.integration?.duration_minutes || 5}
                    onChange={(e) => setCustomPreset(prev => ({
                      ...prev,
                      integration: {
                        ...prev.integration,
                        duration_minutes: parseInt(e.target.value),
                        instructions: prev.integration?.instructions || ['Slowly return to normal awareness', 'Notice any shifts in your state'],
                        breathing_pattern: prev.integration?.breathing_pattern || { inhale_seconds: 3, hold_seconds: 3, exhale_seconds: 5, cycles: 3 },
                        affirmations: prev.integration?.affirmations || ['I integrate this experience with ease']
                      }
                    }))}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Integration Instructions (one per line)"
                    multiline
                    rows={4}
                    value={customPreset.integration?.instructions.join('\n') || ''}
                    onChange={(e) => setCustomPreset(prev => ({
                      ...prev,
                      integration: {
                        ...prev.integration!,
                        instructions: e.target.value.split('\n').filter(s => s.trim())
                      }
                    }))}
                  />
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>
        </TabPanel>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={onSave}
          variant="contained"
          disabled={!customPreset.name.trim() || loading}
          sx={{
            background: 'linear-gradient(45deg, #00ff88, #00cc66)',
            '&:hover': {
              background: 'linear-gradient(45deg, #00cc66, #00aa44)'
            }
          }}
        >
          {loading ? <CircularProgress size={16} /> : '💾 Save Enhanced Preset'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EnhancedCustomPresetDialog;