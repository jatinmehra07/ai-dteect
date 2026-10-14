export interface CINValidationResult {
  cin: string;
  isValidFormat: boolean;
  listing?: 'Listed' | 'Unlisted';
  industryCode?: string;
  industryDescription?: string;
  stateCode?: string;
  stateName?: string;
  incorporationYear?: number;
  ownershipType?: string;
  ownershipDescription?: string;
  registrationNumber?: string;
  errors: string[];
  explanation: string;
}

const INDIAN_STATES_MAP: Record<string, string> = {
  AP: 'Andhra Pradesh',
  AR: 'Arunachal Pradesh',
  AS: 'Assam',
  BR: 'Bihar',
  CG: 'Chhattisgarh',
  CH: 'Chandigarh',
  DD: 'Daman and Diu',
  DL: 'Delhi',
  DN: 'Dadra and Nagar Haveli',
  GA: 'Goa',
  GJ: 'Gujarat',
  HP: 'Himachal Pradesh',
  HR: 'Haryana',
  JH: 'Jharkhand',
  JK: 'Jammu and Kashmir',
  KA: 'Karnataka',
  KL: 'Kerala',
  LA: 'Ladakh',
  LD: 'Lakshadweep',
  MH: 'Maharashtra',
  ML: 'Meghalaya',
  MN: 'Manipur',
  MP: 'Madhya Pradesh',
  MZ: 'Mizoram',
  NL: 'Nagaland',
  OR: 'Odisha',
  PB: 'Punjab',
  PY: 'Puducherry',
  RJ: 'Rajasthan',
  SK: 'Sikkim',
  TG: 'Telangana',
  TN: 'Tamil Nadu',
  TR: 'Tripura',
  TS: 'Telangana',
  UK: 'Uttarakhand',
  UP: 'Uttar Pradesh',
  UT: 'Uttarakhand',
  WB: 'West Bengal',
};

const OWNERSHIP_MAP: Record<string, string> = {
  PTC: 'Private Limited Company',
  PLC: 'Public Limited Company',
  FTC: 'Subsidiary of Foreign Company',
  GOI: 'Government of India Company',
  SGC: 'State Government Company',
  ULL: 'Public Company with Unlimited Liability',
  ULT: 'Private Company with Unlimited Liability',
  GAP: 'General Association / Non-profit Section 8',
  NPL: 'Non-Profit License Company',
};

const INDUSTRY_CODE_HINTS: Record<string, string> = {
  '72200': 'Software publishing, consultancy and supply (IT / Tech)',
  '74999': 'Other business activities n.e.c.',
  '74140': 'Business and management consultancy activities',
  '64202': 'Telecommunication activities',
  '72900': 'Other computer related activities',
  '51909': 'Wholesale trade and commission trade',
};

export function validateCINFormat(cinInput: string): CINValidationResult {
  const clean = (cinInput || '').trim().toUpperCase();
  const errors: string[] = [];

  if (clean.length !== 21) {
    errors.push(`A standard Indian CIN must be exactly 21 characters (Current length: ${clean.length})`);
  }

  // MCA regex format:
  // Char 1: L (Listed) or U (Unlisted)
  // Chars 2-6: 5-digit industry NIC code
  // Chars 7-8: 2-character State code
  // Chars 9-12: 4-digit year of incorporation
  // Chars 13-15: 3-character company ownership type (PTC, PLC, etc.)
  // Chars 16-21: 6-digit registration number
  const match = clean.match(/^([LU])(\d{5})([A-Z]{2})(\d{4})([A-Z]{3})(\d{6})$/);

  if (!match) {
    errors.push('Does not match MCA regex: [L/U][5-digit industry][2-letter state][4-digit year][3-letter type][6-digit reg]');
    return {
      cin: clean,
      isValidFormat: false,
      errors,
      explanation: 'INVALID CIN: Violates Ministry of Corporate Affairs 21-character structure.',
    };
  }

  const [_, listingChar, indCode, stateCode, yearStr, ownCode, regNum] = match;
  const year = parseInt(yearStr, 10);
  const currentYear = new Date().getFullYear();

  const stateName = INDIAN_STATES_MAP[stateCode];
  if (!stateName) {
    errors.push(`Invalid State abbreviation: "${stateCode}"`);
  }

  if (year < 1850 || year > currentYear) {
    errors.push(`Impossible incorporation year: "${year}" (must be between 1850 and ${currentYear})`);
  }

  const ownershipDescription = OWNERSHIP_MAP[ownCode];
  if (!ownershipDescription) {
    errors.push(`Unrecognized ownership identifier: "${ownCode}" (Expected PTC, PLC, FTC, etc.)`);
  }

  const isValid = errors.length === 0;

  return {
    cin: clean,
    isValidFormat: isValid,
    listing: listingChar === 'L' ? 'Listed' : 'Unlisted',
    industryCode: indCode,
    industryDescription: INDUSTRY_CODE_HINTS[indCode] || 'Registered Economic Activity Code',
    stateCode,
    stateName: stateName || 'Unknown State',
    incorporationYear: year,
    ownershipType: ownCode,
    ownershipDescription: ownershipDescription || 'Unknown entity class',
    registrationNumber: regNum,
    errors,
    explanation: isValid
      ? `Valid MCA Syntax: ${listingChar === 'L' ? 'Listed' : 'Unlisted'} ${ownershipDescription || ownCode} incorporated in ${year} in ${stateName}.`
      : `Structural Errors Found: ${errors.join('; ')}`,
  };
}
