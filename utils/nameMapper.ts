export const nameMapping: Record<string, string> = {
  'Parkdale Junior Senior Public School': 'Parkdale',
  'Yorkwoods Public School': 'Yorkwoods',
  'Lambton Park Community School': 'Lambton Park',
  // Add other mappings here as needed
};

// Function to map names
export const mapName = (originalName: string): string => {
  return nameMapping[originalName] || originalName; // Return mapped name or fallback to original
};
export const transformName = (name: string): string => {
  const nameMappings: Record<string, string> = {
    STRINGS: 'Strings',
    CHOIR: 'Choir',
    M_AND_M: 'Music and Movement',
    PERCUSSION: 'Percussion',
    TRUMPET_AND_CLARINET: 'Trumpet/Clarinet',
  };
  return nameMappings[name] || name; // Fallback to the original name if no mapping exists
};

export const subjectProperties: Record<string, { color: string }> = {
  Strings: { color: '#A761A3' }, // Primary Purple
  Choir: { color: '#F6A957' }, // Primary Yellow
  'Music and Movement': { color: '#33B4A9' }, // Primary Green
  Percussion: { color: '#685777' }, // Primary Violet
  'Trumpet and Clarinet': { color: '#EC6A6B' }, // Primary Red
};
