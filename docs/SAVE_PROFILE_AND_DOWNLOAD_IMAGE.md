# Save Profile and Download Image Implementation Guide

## Overview

This implementation adds two new features to the results page:
1. **Save Profile Button** - Allows users to save their Bazi profile information for quick access later
2. **Download Image Button** - Enables users to download the analysis results as a PNG image using html2canvas

## Components Created

### 1. SaveProfileDialog.tsx (`/home/lifekline/components/SaveProfileDialog.tsx`)

A modal dialog component that prompts users to enter a profile name and displays the Bazi information before saving.

**Features:**
- Input field for profile name validation
- Display of four pillars (年柱, 月柱, 日柱, 时柱)
- Shows birth year
- Save/Cancel actions with loading states
- Error handling

**Props:**
```typescript
interface SaveProfileDialogProps {
  onClose: () => void;
  onSave: (profileName: string) => Promise<void>;
  baziInfo: {
    yearPillar: string;
    monthPillar: string;
    dayPillar: string;
    hourPillar: string;
    birthYear: string;
  };
  isOpen: boolean;
}
```

### 2. ResultActions.tsx (`/home/lifekline/components/ResultActions.tsx`)

A component that provides action buttons for the results page.

**Features:**
- **保存档案 (Save Profile)** - Opens SaveProfileDialog
- **下载图片 (Download Image)** - Uses html2canvas to capture and download results
- **分享 (Share)** - Triggers the share functionality
- Error handling for download failures
- Loading states during image generation

**Props:**
```typescript
interface ResultActionsProps {
  baziInfo: {
    yearPillar: string;
    monthPillar: string;
    dayPillar: string;
    hourPillar: string;
    birthYear: string;
  };
  userName?: string;
  onSaveProfile?: (profileName: string) => Promise<void>;
  onShare?: () => void;
  resultElementId?: string;
}
```

## Integration with ProgressiveAnalysisResult.tsx

The `ResultActions` component has been integrated into `ProgressiveAnalysisResult.tsx`:

### Changes Made:

1. **Import Added:**
```typescript
import ResultActions from './ResultActions';
```

2. **Props Extended:**
```typescript
interface ProgressiveAnalysisResultProps {
  // ... existing props
  userName?: string;
  onSaveProfile?: (profileName: string) => Promise<void>;
  onShare?: () => void;
}
```

3. **Component Placement:**
The ResultActions component is placed after the Agent Status section and before the Bazi Pillars display. It only appears when the analysis is complete and Bazi data is available.

4. **Result Section Wrapper:**
Added a wrapper div with `id="result-chart-section"` around the entire results area to enable html2canvas to capture the content.

## Usage Example

Here's how to use the updated ProgressiveAnalysisResult component:

```typescript
import ProgressiveAnalysisResult from './components/ProgressiveAnalysisResult';

function MyAnalysisPage() {
  // Save profile handler - integrates with existing profile management
  const handleSaveProfile = async (profileName: string) => {
    try {
      // Get current user input from state
      const profileData = {
        name: profileName,
        birthYear: currentInput.birthYear,
        yearPillar: currentInput.yearPillar,
        monthPillar: currentInput.monthPillar,
        dayPillar: currentInput.dayPillar,
        hourPillar: currentInput.hourPillar,
        startAge: currentInput.startAge,
        firstDaYun: currentInput.firstDaYun,
        birthPlace: currentInput.birthPlace,
        gender: currentInput.gender,
        // ... other required fields
      };

      // Save to localStorage or API
      const profiles = JSON.parse(localStorage.getItem('lifekline_profiles') || '[]');
      const newProfile = {
        ...profileData,
        id: Date.now().toString(),
        isDefault: profiles.length === 0,
        createdAt: new Date().toISOString(),
      };
      profiles.push(newProfile);
      localStorage.setItem('lifekline_profiles', JSON.stringify(profiles));

      // Show success message
      alert('Profile saved successfully!');
    } catch (error) {
      console.error('Failed to save profile:', error);
      throw new Error('Failed to save profile. Please try again.');
    }
  };

  // Share handler
  const handleShare = () => {
    // Open share panel or trigger share functionality
    setShowSharePanel(true);
  };

  return (
    <ProgressiveAnalysisResult
      requestData={requestData}
      userName={userName}
      onSaveProfile={handleSaveProfile}
      onShare={handleShare}
      onComplete={(result) => console.log('Analysis complete:', result)}
      onError={(error) => console.error('Analysis error:', error)}
    />
  );
}
```

## Download Image Functionality

The download image feature uses html2canvas with the following configuration:

```typescript
const canvas = await html2canvas(element, {
  scale: 2,              // High resolution (2x)
  useCORS: true,         // Handle cross-origin images
  backgroundColor: '#ffffff',
  logging: false,
  windowWidth: element.scrollWidth,
  windowHeight: element.scrollHeight,
});
```

The generated image is named: `人生K线_[UserName]_[Date].png`

## Save Profile Integration with Existing System

The save profile functionality integrates seamlessly with the existing profile management system:

1. Uses the same data structure as `CreateProfileModal`
2. Stores in localStorage under `lifekline_profiles` key
3. Compatible with `ProfileManager` component
4. Can be loaded back using the profile selector

## Styling and UX

- All buttons use consistent styling with the existing design system
- Loading states with spinners during async operations
- Error messages displayed inline with appropriate styling
- Modal dialogs use backdrop blur for better focus
- Responsive design works on mobile and desktop

## Testing Checklist

✓ Build successful with no TypeScript errors
- [ ] Save Profile Dialog opens and closes correctly
- [ ] Profile name validation works
- [ ] Bazi information displays correctly in dialog
- [ ] Profile saves to localStorage
- [ ] Saved profile can be loaded from ProfileManager
- [ ] Download Image generates PNG correctly
- [ ] Downloaded image includes all result sections
- [ ] Image filename includes username and date
- [ ] Error handling works for both features
- [ ] Responsive design on mobile devices
- [ ] Integration with share functionality

## Browser Compatibility

- html2canvas requires modern browsers
- Works with Chrome, Firefox, Safari, Edge
- May have limitations with very old browsers (IE11 not supported)

## Future Enhancements

Potential improvements for future versions:

1. Add image format options (PNG, JPEG)
2. Add image quality/resolution selector
3. Save to cloud storage instead of just localStorage
4. Batch profile management
5. Profile import/export functionality
6. Share profile as QR code
7. Print-optimized layout for PDF export
