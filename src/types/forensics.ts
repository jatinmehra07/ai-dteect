export interface ExtractedEntities {
  company_name_claimed: string | null;
  official_domain_expected: string | null;
  sender_emails: string[];
  urls_found: string[];
  phone_numbers: string[];
  upi_ids_or_bank_details: string[];
  cin_or_registration_number: string | null;
}

export interface ForensicBreakdown {
  document_and_image_flags: string[];
  audio_call_flags: string[];
  email_and_url_flags: string[];
  company_legitimacy_flags: string[];
}

export interface FinancialTrap {
  asks_for_money: boolean;
  amount_requested: string | null;
  stated_reason: string | null;
}

export interface ForensicReport {
  trust_score: number; // 0 to 100
  verdict: 'SCAM_DETECTED' | 'SUSPICIOUS' | 'LEGITIMATE';
  confidence_score: number; // 0 to 100
  executive_summary: string;
  extracted_entities: ExtractedEntities;
  forensic_breakdown: ForensicBreakdown;
  financial_trap_detected: FinancialTrap;
  recommended_actions: string[];
  cybercrime_report_draft: string;
}

export interface AttachedFile {
  id: string;
  name: string;
  type: 'image' | 'audio' | 'pdf';
  mimeType: string;
  base64: string;
  previewUrl?: string;
  sizeBytes?: number;
}

export interface ThreatPreset {
  id: string;
  title: string;
  category: 'Fake Offer Letter' | 'Task / Rating Scam' | 'Fraudulent HR Call' | 'Legitimate Offer';
  threatLevel: 'CRITICAL' | 'HIGH' | 'AUTHENTIC';
  companyClaimed: string;
  description: string;
  text: string;
  file?: AttachedFile;
}
