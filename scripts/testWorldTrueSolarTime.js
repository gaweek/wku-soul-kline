/**
 * Global True Solar Time Calculation Test
 *
 * Tests the accuracy of true solar time offset calculations for international cities
 */

// Timezone standard longitude mappings
const timezoneOffsets = {
  // Asia
  'Asia/Tokyo': 135,
  'Asia/Seoul': 135,
  'Asia/Singapore': 105,
  'Asia/Kuala_Lumpur': 105,
  'Asia/Bangkok': 105,
  'Asia/Ho_Chi_Minh': 105,
  'Asia/Jakarta': 105,
  'Asia/Makassar': 120,
  'Asia/Manila': 120,
  'Asia/Kolkata': 82.5,
  'Asia/Dubai': 60,
  'Asia/Jerusalem': 35,
  // Europe
  'Europe/London': 0,
  'Europe/Dublin': 0,
  'Europe/Paris': 15,
  'Europe/Berlin': 15,
  'Europe/Rome': 15,
  'Europe/Madrid': 15,
  'Europe/Amsterdam': 15,
  'Europe/Brussels': 15,
  'Europe/Zurich': 15,
  'Europe/Vienna': 15,
  'Europe/Stockholm': 15,
  'Europe/Oslo': 15,
  'Europe/Copenhagen': 15,
  'Europe/Helsinki': 30,
  'Europe/Moscow': 45,
  'Europe/Warsaw': 15,
  'Europe/Prague': 15,
  'Europe/Athens': 30,
  'Europe/Lisbon': 0,
  'Europe/Istanbul': 30,
  // North America
  'America/New_York': -75,
  'America/Chicago': -90,
  'America/Denver': -105,
  'America/Los_Angeles': -120,
  'America/Phoenix': -105,
  'America/Toronto': -75,
  'America/Vancouver': -120,
  'America/Edmonton': -105,
  'America/Mexico_City': -90,
  'America/Cancun': -75,
  'Pacific/Honolulu': -150,
  // South America
  'America/Sao_Paulo': -45,
  'America/Argentina/Buenos_Aires': -45,
  'America/Santiago': -60,
  'America/Lima': -75,
  'America/Bogota': -75,
  // Oceania
  'Australia/Sydney': 150,
  'Australia/Melbourne': 150,
  'Australia/Brisbane': 150,
  'Australia/Perth': 120,
  'Australia/Adelaide': 142.5,
  'Pacific/Auckland': 180,
  // Africa
  'Africa/Johannesburg': 30,
  'Africa/Cairo': 30,
  'Africa/Casablanca': 0,
  'Africa/Nairobi': 45,
  'Africa/Lagos': 15,
  // Russia
  'Asia/Novosibirsk': 105,
  'Asia/Yekaterinburg': 75,
  'Asia/Vladivostok': 150,
};

// Calculate true solar time offset
function calculateWorldTrueSolarTimeOffset(longitude, timezone) {
  const standardLongitude = timezoneOffsets[timezone] || 0;
  return Math.round((longitude - standardLongitude) * 4);
}

// Test cities from around the world
const WORLD_CITIES = [
  // Asia
  { name: 'Tokyo', country: 'Japan', longitude: 139.6917, timezone: 'Asia/Tokyo' },
  { name: 'Seoul', country: 'South Korea', longitude: 126.9780, timezone: 'Asia/Seoul' },
  { name: 'Singapore', country: 'Singapore', longitude: 103.8198, timezone: 'Asia/Singapore' },
  { name: 'Mumbai', country: 'India', longitude: 72.8777, timezone: 'Asia/Kolkata' },
  { name: 'Dubai', country: 'UAE', longitude: 55.2708, timezone: 'Asia/Dubai' },

  // Europe
  { name: 'London', country: 'UK', longitude: -0.1276, timezone: 'Europe/London' },
  { name: 'Paris', country: 'France', longitude: 2.3522, timezone: 'Europe/Paris' },
  { name: 'Berlin', country: 'Germany', longitude: 13.4050, timezone: 'Europe/Berlin' },
  { name: 'Moscow', country: 'Russia', longitude: 37.6173, timezone: 'Europe/Moscow' },
  { name: 'Madrid', country: 'Spain', longitude: -3.7038, timezone: 'Europe/Madrid' },

  // North America
  { name: 'New York', country: 'USA', longitude: -74.0060, timezone: 'America/New_York' },
  { name: 'Los Angeles', country: 'USA', longitude: -118.2437, timezone: 'America/Los_Angeles' },
  { name: 'Chicago', country: 'USA', longitude: -87.6298, timezone: 'America/Chicago' },
  { name: 'Toronto', country: 'Canada', longitude: -79.3832, timezone: 'America/Toronto' },
  { name: 'Honolulu', country: 'USA', longitude: -157.8583, timezone: 'Pacific/Honolulu' },

  // South America
  { name: 'Sao Paulo', country: 'Brazil', longitude: -46.6333, timezone: 'America/Sao_Paulo' },
  { name: 'Buenos Aires', country: 'Argentina', longitude: -58.3816, timezone: 'America/Argentina/Buenos_Aires' },

  // Oceania
  { name: 'Sydney', country: 'Australia', longitude: 151.2093, timezone: 'Australia/Sydney' },
  { name: 'Perth', country: 'Australia', longitude: 115.8605, timezone: 'Australia/Perth' },
  { name: 'Auckland', country: 'New Zealand', longitude: 174.7633, timezone: 'Pacific/Auckland' },

  // Africa
  { name: 'Cape Town', country: 'South Africa', longitude: 18.4241, timezone: 'Africa/Johannesburg' },
  { name: 'Cairo', country: 'Egypt', longitude: 31.2357, timezone: 'Africa/Cairo' },
];

console.log('═'.repeat(80));
console.log('  Global True Solar Time Calculation Test');
console.log('═'.repeat(80));
console.log('');
console.log('Formula: True Solar Time Offset (minutes) = (Local Longitude - Standard Longitude) × 4');
console.log('');
console.log('─'.repeat(80));

for (const city of WORLD_CITIES) {
  const offset = calculateWorldTrueSolarTimeOffset(city.longitude, city.timezone);
  const standardLon = timezoneOffsets[city.timezone] || 0;
  const offsetStr = offset >= 0 ? `+${offset}` : `${offset}`;

  const hours = Math.abs(offset) >= 60 ? Math.floor(Math.abs(offset) / 60) : 0;
  const minutes = Math.abs(offset) % 60;
  const humanReadable = hours > 0
    ? `(${offset > 0 ? 'fast' : 'slow'} ${hours}h${minutes > 0 ? minutes + 'm' : ''})`
    : `(${offset > 0 ? 'fast' : 'slow'} ${Math.abs(offset)}min)`;

  console.log(
    `${city.name.padEnd(15)} | ${city.country.padEnd(12)} | ` +
    `Lon: ${city.longitude.toFixed(2).padStart(8)}° | ` +
    `Std: ${standardLon.toString().padStart(5)}° | ` +
    `Offset: ${offsetStr.padStart(5)}min ${humanReadable}`
  );
}

console.log('');
console.log('─'.repeat(80));

// Time pillar example demonstrations
console.log('');
console.log('═'.repeat(80));
console.log('  Example: Time Pillar Impact Demonstration');
console.log('═'.repeat(80));
console.log('');

const EXAMPLES = [
  { city: 'Tokyo', longitude: 139.6917, timezone: 'Asia/Tokyo', clockTime: '12:00', description: 'Clock shows noon 12:00' },
  { city: 'New York', longitude: -74.0060, timezone: 'America/New_York', clockTime: '12:00', description: 'Clock shows noon 12:00' },
  { city: 'Los Angeles', longitude: -118.2437, timezone: 'America/Los_Angeles', clockTime: '23:30', description: 'Clock shows 23:30' },
  { city: 'Madrid', longitude: -3.7038, timezone: 'Europe/Madrid', clockTime: '12:00', description: 'Clock shows noon 12:00' },
  { city: 'Mumbai', longitude: 72.8777, timezone: 'Asia/Kolkata', clockTime: '23:30', description: 'Clock shows 23:30' },
];

// Chinese time pillar mapping
const getShiChen = (hour) => {
  const shiChen = ['子', '丑', '丑', '寅', '寅', '卯', '卯', '辰', '辰', '巳', '巳', '午', '午', '未', '未', '申', '申', '酉', '酉', '戌', '戌', '亥', '亥', '子'];
  return shiChen[hour] + '时';
};

for (const example of EXAMPLES) {
  const offset = calculateWorldTrueSolarTimeOffset(example.longitude, example.timezone);
  const [h, m] = example.clockTime.split(':').map(Number);
  let trueSolarMinute = m + offset;
  let trueSolarHour = h;

  while (trueSolarMinute >= 60) {
    trueSolarHour++;
    trueSolarMinute -= 60;
  }
  while (trueSolarMinute < 0) {
    trueSolarHour--;
    trueSolarMinute += 60;
  }
  while (trueSolarHour >= 24) {
    trueSolarHour -= 24;
  }
  while (trueSolarHour < 0) {
    trueSolarHour += 24;
  }

  const clockShiChen = getShiChen(h);
  const trueShiChen = getShiChen(trueSolarHour);

  const trueSolarTimeStr = `${String(trueSolarHour).padStart(2, '0')}:${String(Math.round(trueSolarMinute)).padStart(2, '0')}`;
  const shiChenChanged = clockShiChen !== trueShiChen ? '⚠️ Time Pillar Changed!' : '';

  console.log(`📍 ${example.city} (Longitude ${example.longitude.toFixed(1)}°, ${example.timezone})`);
  console.log(`   ${example.description}`);
  console.log(`   Clock Time: ${example.clockTime} (${clockShiChen}) → True Solar: ${trueSolarTimeStr} (${trueShiChen}) ${shiChenChanged}`);
  console.log('');
}

console.log('═'.repeat(80));
console.log('  Key Findings');
console.log('═'.repeat(80));
console.log('');
console.log('1. Each timezone has a standard longitude (e.g., Tokyo UTC+9 = 135°E)');
console.log('2. Cities not on the standard longitude have true solar time offset');
console.log('3. Seoul uses Tokyo time (135°E) but is at 127°E - 32 minutes slow');
console.log('4. Madrid uses Central European Time (15°E) but is at -3.7°E - 75 minutes slow!');
console.log('5. For Bazi calculation, local true solar time determines the Hour Pillar');
console.log('');
console.log('═'.repeat(80));
