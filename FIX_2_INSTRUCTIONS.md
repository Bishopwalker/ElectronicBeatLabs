# FIX #2: Dynamic Grid Layout - Manual Instructions

## **CHANGE LOCATION:**
File: `C:\Users\bisho\IdeaProjects\ebl\src\components\homePage\ElectromagneticBeatLab.tsx`

## **STEP 1: Add Dynamic Grid Logic**

Find this line (around line 539):
```typescript
  ]);

  return (
```

**REPLACE** that section with:
```typescript
  ]);

  // 🔥 DYNAMIC GRID LAYOUT CALCULATION
  // Count visible items (not in closedSections) to determine row layout
  const visibleItems = useMemo(() => {
    return [
      !closedSections.includes('timerPanel') ? 'timerPanel' : null,
      !closedSections.includes('patternID') ? 'patternID' : null,
      !closedSections.includes('frequencyVisualizer') ? 'frequencyVisualizer' : null,
      !closedSections.includes('binauralBeats') ? 'binauralBeats' : null,
      !closedSections.includes('masterControls') ? 'masterControls' : null,
      !closedSections.includes('equalizer') ? 'equalizer' : null,
      !closedSections.includes('spatialVisualizer') ? 'spatialVisualizer' : null,
    ].filter(Boolean);
  }, [closedSections]);

  const visibleCount = visibleItems.length;
  
  // Use 1 row when <= 3 items, 2 rows when > 3 items
  const useOneRow = visibleCount <= 3;

  return (
```

## **STEP 2: Update Grid Layout**

Find this comment (around line 794):
```typescript
        {/* Two-Row Layout: exact 50/50 split within 85vh */}
        <Box sx={{
          display: 'grid',
          gridTemplateRows: '1fr 1fr',
```

**REPLACE** `gridTemplateRows: '1fr 1fr',` with:
```typescript
          gridTemplateRows: useOneRow ? '1fr' : '1fr 1fr',
```

The full Box should look like:
```typescript
        {/* Dynamic Grid Layout: switches between 1 row (≤3 items) and 2 rows (>3 items) */}
        <Box sx={{
          display: 'grid',
          gridTemplateRows: useOneRow ? '1fr' : '1fr 1fr',
          gap: { xs: 2, sm: 2, md: 2.5, lg: 3 },
          p: { xs: 1.5, sm: 2, md: 2, lg: 2.5 },
          width: '100%',
          maxWidth: '100vw',
          height: '100%',
          overflowY: 'auto'
        }}>
```

## **VERIFICATION:**

After making these changes:
1. Save the file
2. Run `npm run dev:all`
3. Test closing components:
   - With ≤3 components visible → Should show 1 row
   - With >3 components visible → Should show 2 rows
4. Components should flex-grow to fill space

## **What This Does:**

1. **Counts visible components** by checking which IDs are NOT in closedSections
2. **Calculates useOneRow** = true when ≤3 items visible, false when >3 items
3. **Applies dynamic grid** = '1fr' (single row) or '1fr 1fr' (two rows)

---

✅ FIX #1 COMPLETE: TimerCountdownDisplay ID fixed
⏳ FIX #2 PENDING: Need to apply these changes manually

Next: Save this file, then tell me when you're ready for FIX #3
