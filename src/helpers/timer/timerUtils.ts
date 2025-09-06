export const getWaveTypeFromFrequency = (frequency: number): string => {
  if (frequency >= 0.5 && frequency <= 4) return 'Delta';
  if (frequency > 4 && frequency <= 8) return 'Theta';
  if (frequency > 8 && frequency <= 13) return 'Alpha';
  if (frequency > 13 && frequency <= 30) return 'Beta';
  if (frequency > 30) return 'Gamma';
  return 'Alpha'; // default
};

export const formatTime = (minutes: number): string => {
  const hrs = Math.floor(minutes / 60);
  const mins = Math.floor(minutes % 60);
  const secs = Math.floor((minutes % 1) * 60);
  
  if (hrs > 0) {
    return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export const loadCustomPresets = () => {
  try {
    const savedPresetsJson = localStorage.getItem('ebl-custom-presets');
    const savedTransitionsJson = localStorage.getItem('ebl-custom-preset-transitions');
    
    let savedCustomPresets = [];
    let savedTransitions = {};
    
    if (savedPresetsJson) {
      savedCustomPresets = JSON.parse(savedPresetsJson);
      console.log('📦 LOADED CUSTOM PRESETS:', savedCustomPresets);
    }
    
    if (savedTransitionsJson) {
      savedTransitions = JSON.parse(savedTransitionsJson);
      console.log('📦 LOADED CUSTOM TRANSITIONS:', savedTransitions);
    }
    
    return { savedCustomPresets, savedTransitions };
  } catch (err) {
    console.error('❌ ERROR LOADING SAVED PRESETS:', err);
    return { savedCustomPresets: [], savedTransitions: {} };
  }
};

export const savePresetToStorage = (presetId: string, preset: any, transitions: any[]) => {
  try {
    // Save transitions
    const currentTransitions = JSON.parse(localStorage.getItem('ebl-custom-preset-transitions') || '{}');
    currentTransitions[presetId] = transitions;
    localStorage.setItem('ebl-custom-preset-transitions', JSON.stringify(currentTransitions));
    
    // Save preset
    const currentPresets = JSON.parse(localStorage.getItem('ebl-custom-presets') || '[]');
    currentPresets.push(preset);
    localStorage.setItem('ebl-custom-presets', JSON.stringify(currentPresets));
    
    console.log('✅ SAVED TO LOCALSTORAGE');
    return true;
  } catch (err) {
    console.error('❌ LOCALSTORAGE SAVE FAILED:', err);
    return false;
  }
};