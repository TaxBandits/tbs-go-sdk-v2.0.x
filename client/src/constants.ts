export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string);

export const BUSINESS_TYPES = [
  { value: 'ESTE', label: 'Estate' },
  { value: 'PART', label: 'Partnership' },
  { value: 'CORP', label: 'Corporation' },
  { value: 'EORG', label: 'Exempt Organization' },
  { value: 'SPRO', label: 'Sole Proprietorship' },
  { value: 'SLGOV', label: 'State and Local Government' }
];

export const BUSINESS_MEMBER_TYPES: Record<string, string[]> = {
  ESTE: ["ADMINISTRATOR", "EXECUTOR", "TRUSTEE", "FIDUCIARY"],
  PART: ["PARTNER", "GENERALPARTNER", "LIMITEDPARTNER", "LLCMEMBER", "MANAGINGMEMBER", "MEMBER", "MANAGER", "PRESIDENT", "OWNER", "TAXMATTERPARTNER"],
  CORP: ["PRESIDENT", "VICEPRESIDENT", "TREASURER", "ASSISTANTTREASURER", "CHIEFACCOUNTINGOFFICER", "TAXOFFICER", "CHIEFOPERATINGOFFICER", "CORPORATESECRETARY", "SECRETARYTREASURER", "CORPORATEOFFICER", "MEMBER", "REPORTINGAGENT"],
  EORG: ["PRESIDENT", "VICEPRESIDENT", "CORPORATETREASURER", "TREASURER", "ASSISTANTTREASURER", "CHIEFACCOUNTINGOFFICER", "CHIEFEXECUTIVEOFFICER", "CHIEFFINANCIALOFFICER", "TAXOFFICER", "CHIEFOPERATINGOFFICER", "CORPORATEOFFICER", "EXECUTIVEDIRECTOR", "DIRECTOR", "CHAIRMAN", "EXECUTIVEADMINISTRATOR", "ADMINISTRATOR", "RECEIVER", "TRUSTEE", "PASTOR", "ASSISTANTTORELIGIOUSLEADER", "REVEREND", "PRIEST", "MINISTER", "RABBI", "LEADEROFRELIGIOUSORGANIZATION", "SECRETARY", "DIRECTOROFTAXATION", "DIRECTOROFPERSONNEL"],
  SPRO: ["OWNER", "SOLEPROPRIETOR", "MEMBER", "SOLEMEMBER"],
  SLGOV: ["PRESIDENT", "VICEPRESIDENT", "CORPORATETREASURER", "TREASURER", "ASSISTANTTREASURER", "CHIEFACCOUNTINGOFFICER", "CHIEFEXECUTIVEOFFICER", "CHIEFFINANCIALOFFICER", "TAXOFFICER", "CHIEFOPERATINGOFFICER", "CORPORATEOFFICER", "EXECUTIVEDIRECTOR", "DIRECTOR", "CHAIRMAN", "EXECUTIVEADMINISTRATOR", "ADMINISTRATOR", "RECEIVER", "TRUSTEE", "PASTOR", "ASSISTANTTORELIGIOUSLEADER", "REVEREND", "PRIEST", "MINISTER", "RABBI", "LEADEROFRELIGIOUSORGANIZATION", "SECRETARY", "DIRECTOROFTAXATION", "DIRECTOROFPERSONNEL", "EXECUTOR", "FIDUCIARY", "OWNER", "SOLEPROPRIETOR", "SOLEMEMBER", "MEMBER", "CORPORATESECRETARY", "SECRETARYTREASURER", "PARTNER", "GENERALPARTNER", "LIMITEDPARTNER", "MANAGINGMEMBER", "MANAGER", "TAXMATTERPARTNER"]
};

export const US_STATES = [
  "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "DC", "FL", "GA", "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", 
  "MD", "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ", "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", 
  "SC", "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY", "AS", "FM", "GU", "MH", "MP", "PW", "PR", "VI", "AA", 
  "AE", "AP"
];

export const CANADA_PROVINCES = [
  { value: "ALBERTA", label: "ALBERTA" },
  { value: "BRITISHCOLUMBIA", label: "BRITISH COLUMBIA" },
  { value: "MANITOBA", label: "MANITOBA" },
  { value: "NEWBRUNSWICK", label: "NEW BRUNSWICK" },
  { value: "NEWFOUNDLANDANDLABRADOR", label: "NEWFOUNDLAND AND LABRADOR" },
  { value: "NORTHWESTTERRITORIES", label: "NORTHWEST TERRITORIES" },
  { value: "NOVASCOTIA", label: "NOVA SCOTIA" },
  { value: "NUNAVUT", label: "NUNAVUT" },
  { value: "ONTARIO", label: "ONTARIO" },
  { value: "PRINCEEDWARDISLAND", label: "PRINCE EDWARD ISLAND" },
  { value: "QUEBEC", label: "QUEBEC" },
  { value: "SASKATCHEWAN", label: "SASKATCHEWAN" },
  { value: "YUKONTERRITORY", label: "YUKON TERRITORY" }
];

export const COUNTRIES = [
  "US", "CA", "MX", "AF", "AX", "AL", "AG", "AQ", "AN", "AO", "AV", "AY", "AC", "AR", "AM", "AA", "AT", "AS", "AU", "AJ", 
  "BF", "BA", "FQ", "BG", "BB", "BO", "BE", "BH", "BN", "BD", "BT", "BL", "BK", "BC", "BV", "BR", "IO", "VI", "BX", "BU", 
  "UV", "BM", "BY", "CB", "CM", "CV", "CJ", "CT", "CD", "CI", "CH", "KT", "IP", "CK", "CO", "CN", "CF", "CG", "CW", "CR", 
  "CS", "IV", "HR", "CU", "CY", "EZ", "DA", "DX", "DJ", "DO", "DR", "TT", "EC", "EG", "ES", "UK", "EK", "ER", "EN", "ET", 
  "FK", "FO", "FM", "FJ", "FI", "FR", "FP", "FS", "GB", "GA", "GG", "GM", "GH", "GI", "GR", "GL", "GJ", "GQ", "GQ", "GT", 
  "GK", "GV", "PU", "GY", "HA", "HM", "HO", "HK", "HQ", "HU", "IC", "IN", "ID", "IR", "IZ", "EI", "IS", "IT", "JM", "JN", 
  "JA", "DQ", "JE", "JQ", "JO", "KZ", "KE", "KQ", "KR", "KN", "KS", "KU", "KG", "LA", "LG", "LE", "LT", "LI", "LY", "LS", 
  "LH", "LU", "MC", "MK", "MA", "MI", "MY", "MV", "ML", "MT", "IM", "RM", "MR", "MP", "MQ", "MD", "MN", "MG", "MJ", "MH", 
  "MO", "MZ", "WA", "NR", "BQ", "NP", "NL", "NC", "NZ", "NU", "NG", "NI", "NE", "NF", "CQ", "NO", "MU", "PK", "LQ", "PS", 
  "PM", "PP", "PF", "PA", "PE", "RP", "PC", "PL", "PO", "RQ", "QA", "RO", "RS", "RW", "WS", "SM", "TP", "SA", "SG", "RI", 
  "SE", "SL", "SN", "LO", "SI", "BP", "SO", "SF", "SX", "SP", "PG", "CE", "SH", "SC", "ST", "SB", "VC", "SU", "NS", "SV", 
  "WZ", "SW", "SZ", "SY", "TW", "TI", "TZ", "TH", "TO", "TL", "TN", "TD", "TS", "TU", "TX", "TK", "TV", "UG", "UP", "AE", 
  "UY", "UZ", "NH", "VE", "VM", "VQ", "WQ", "WF", "WI", "YM", "ZA", "ZI", "TB", "OC", "UC", "KV", "RN", "NN", "OD", "VT"
];

export const KIND_OF_EMPLOYER = [
  { value: "FEDERALGOVT", label: "Federal Govt" },
  { value: "STATEORLOCAL501C", label: "State or Local 501c" },
  { value: "NONGOVT501C", label: "Non-Govt 501c" },
  { value: "STATEORLOCALNON501C", label: "State or Local Non-501c" },
  { value: "NONEAPPLY", label: "None Apply" }
];

export const KIND_OF_PAYER = [
  { value: "REGULAR941", label: "Regular 941" },
  { value: "REGULAR944", label: "Regular 944" },
  { value: "AGRICULTURAL943", label: "Agri 943" },
  { value: "HOUSEHOLD", label: "Household" },
  { value: "MILITARY", label: "Military" },
  { value: "MEDICAREQUALGOVEM", label: "Medicare Qual Govt Em" },
  { value: "RAILROADFORMCT1", label: "Railroad Form CT-1" }
];

export const CHAPTER_3_CODES = [
  5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 35, 36, 37, 38, 39, 40, 41
].map(code => ({ value: code.toString(), label: code.toString() }));

export const CHAPTER_4_CODES = Array.from({ length: 50 }, (_, i) => i + 1).map(code => ({
  value: code.toString(),
  label: code.toString()
}));

export const SUFFIXES = [
  "Jr", "Sr", "I", "II", "III", "IV", "V", "VI", "VII"
].map(s => ({ value: s, label: s }));

export const RECIPIENT_CHAPTER_3_CODES = [
  5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25,
  26, 27, 28, 29, 30, 31, 32, 35, 36, 37, 38, 39, 40,
].map(code => ({ value: code.toString().padStart(2, "0"), label: code.toString() }));

export const RECIPIENT_CHAPTER_4_CODES = Array.from({ length: 50 }, (_, i) => i + 1).map(code => ({
  value: code.toString().padStart(2, "0"),
  label: code.toString(),
}));

export const RECIPIENT_LOB_CODES = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(code => ({
  value: code.toString().padStart(2, "0"),
  label: code.toString(),
}));

export const EXEMPT_PAYEE_CODES = [
  { value: "1", label: "1 — An organization exempt from tax" },
  { value: "2", label: "2 — The United States or any of its agencies or instrumentalities" },
  { value: "3", label: "3 — A state, the District of Columbia, a U.S. commonwealth or possession" },
  { value: "4", label: "4 — A foreign government or any of its political subdivisions" },
  { value: "5", label: "5 — A corporation" },
  { value: "6", label: "6 — A dealer in securities or commodities" },
  { value: "7", label: "7 — A futures commission merchant" },
  { value: "8", label: "8 — A real estate investment trust" },
  { value: "9", label: "9 — An entity registered under the Investment Company Act of 1940" },
  { value: "10", label: "10 — A common trust fund" },
  { value: "11", label: "11 — A financial institution" },
  { value: "12", label: "12 — A middleman known in the investment community as a nominee or custodian" },
  { value: "13", label: "13 — A trust exempt from tax" },
];

export const FATCA_EXEMPTION_CODES = [
  { value: "NONE", label: "None" },
  { value: "A", label: "A" },
  { value: "B", label: "B" },
  { value: "C", label: "C" },
  { value: "D", label: "D" },
  { value: "E", label: "E" },
  { value: "F", label: "F" },
  { value: "G", label: "G" },
  { value: "H", label: "H" },
  { value: "I", label: "I" },
  { value: "J", label: "J" },
  { value: "K", label: "K" },
  { value: "L", label: "L" },
  { value: "M", label: "M" },
];

export const FEDERAL_TAX_CLASSIFICATIONS = [
  { value: "INDIVIDUAL_OR_SOLE_PROPRIETOR", label: "Individual / Sole Proprietor" },
  { value: "C_CORPORATION", label: "C Corporation" },
  { value: "S_CORPORATION", label: "S Corporation" },
  { value: "PARTNERSHIP", label: "Partnership" },
  { value: "TRUST_OR_ESTATE", label: "Trust / Estate" },
  { value: "LLC_C_CORPORATION", label: "Limited Liability Company — C Corporation" },
  { value: "LLC_PARTNERSHIP", label: "Limited Liability Company — Partnership" },
  { value: "LLC_S_CORPORATION", label: "Limited Liability Company — S Corporation" },
  { value: "SINGLE_MEMBER_LLC_ELECTED", label: "Single-Member LLC — Elected Classification" },
  { value: "SINGLE_MEMBER_LLC_NOT_ELECTED", label: "Single-Member LLC — Disregarded Entity (Not Elected)" },
  { value: "OTHERS", label: "Others" },
];
