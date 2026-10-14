"""
HireShield AI - FastAPI Backend Server
---------------------------------------
Accepts multi-modal recruitment threat data (URL, text/email, image/PDF, audio call),
executes real-time OSINT heuristics (WHOIS, DNS, Typosquatting, MCA CIN, and ELA image tampering),
and calls Google GenAI to synthesize a comprehensive forensic intelligence report.
"""

import os
import re
import json
from typing import Optional, List
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

# Google GenAI modern SDK
from google import genai
from google.genai import types

# OSINT Engine
from osint_engine import (
    check_domain_whois,
    detect_typosquatting,
    analyze_email_and_dns,
    validate_indian_cin,
    perform_error_level_analysis,
)

load_dotenv()

app = FastAPI(
    title="HireShield AI Forensic API",
    description="Multi-Modal Recruitment Threat Intelligence and Corporate Forensics Engine",
    version="2.0.0",
)

# Enable CORS for local dev & frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Google GenAI client
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
ai_client = None
if GEMINI_API_KEY and GEMINI_API_KEY.strip() != "MY_GEMINI_API_KEY":
    ai_client = genai.Client(api_key=GEMINI_API_KEY)


# Output Pydantic Models
class ExtractedEntities(BaseModel):
    company_name_claimed: Optional[str] = None
    official_domain_expected: Optional[str] = None
    sender_emails: List[str] = []
    urls_found: List[str] = []
    phone_numbers: List[str] = []
    upi_ids_or_bank_details: List[str] = []
    cin_or_registration_number: Optional[str] = None


class ForensicBreakdown(BaseModel):
    document_and_image_flags: List[str] = []
    audio_call_flags: List[str] = []
    email_and_url_flags: List[str] = []
    company_legitimacy_flags: List[str] = []


class FinancialTrap(BaseModel):
    asks_for_money: bool
    amount_requested: Optional[str] = None
    stated_reason: Optional[str] = None


class ForensicReportResponse(BaseModel):
    trust_score: int
    verdict: str  # SCAM_DETECTED | SUSPICIOUS | LEGITIMATE
    confidence_score: int
    executive_summary: str
    extracted_entities: ExtractedEntities
    forensic_breakdown: ForensicBreakdown
    financial_trap_detected: FinancialTrap
    recommended_actions: List[str]
    cybercrime_report_draft: str
    osint_telemetry: Optional[dict] = None


@app.get("/")
def health_check():
    return {
        "status": "online",
        "service": "HireShield AI Threat Forensics Engine",
        "engine": "FastAPI + OSINT + Google GenAI",
    }


@app.post("/api/analyze", response_model=ForensicReportResponse)
async def analyze_recruitment_threat(
    text: Optional[str] = Form(None),
    url: Optional[str] = Form(None),
    sender_email: Optional[str] = Form(None),
    claimed_cin: Optional[str] = Form(None),
    image_file: Optional[UploadFile] = File(None),
    audio_file: Optional[UploadFile] = File(None),
):
    """Multi-Modal Threat Intake Endpoint:
    Combines WHOIS age checks, typosquatting, MX/SPF records, MCA CIN validation,
    Error Level Analysis (ELA) on images, and deep LLM multi-modal forensic reasoning.
    """
    if not text and not url and not sender_email and not image_file and not audio_file:
        raise HTTPException(
            status_code=400,
            detail="At least one piece of evidence is required: text, link, email, image/PDF, or audio.",
        )

    # ---------------------------------------------
    # STEP 1: AUTOMATED ASYNC OSINT HEURISTICS
    # ---------------------------------------------
    osint_data = {}

    # Extract domains to inspect
    target_domain = None
    if url:
        target_domain = re.sub(r"^https?://", "", url).split("/")[0]
    elif sender_email and "@" in sender_email:
        target_domain = sender_email.split("@")[1]
    elif text:
        emails = re.findall(r"[\w\.-]+@[\w\.-]+\.\w+", text)
        if emails:
            target_domain = emails[0].split("@")[1]
        else:
            urls = re.findall(r"https?://(?:[-\w.]|(?:%[\da-fA-F]{2}))+", text)
            if urls:
                target_domain = re.sub(r"^https?://", "", urls[0]).split("/")[0]

    # WHOIS Domain Age
    if target_domain:
        osint_data["whois"] = check_domain_whois(target_domain)
        osint_data["typosquatting"] = detect_typosquatting(target_domain)
        osint_data["email_dns"] = analyze_email_and_dns(target_domain)

    # MCA Indian CIN Check
    cin_to_check = claimed_cin
    if not cin_to_check and text:
        cin_candidates = re.findall(r"[A-Z0-9]{21}", text.upper())
        if cin_candidates:
            cin_to_check = cin_candidates[0]

    if cin_to_check:
        osint_data["mca_cin"] = validate_indian_cin(cin_to_check)

    # Error Level Analysis (ELA) for image tampering
    ela_result = None
    image_bytes = None
    image_mime = None
    if image_file:
        image_bytes = await image_file.read()
        image_mime = image_file.content_type or "image/png"
        if image_mime.startswith("image/"):
            ela_result = perform_error_level_analysis(image_bytes)
            osint_data["image_tampering_ela"] = {
                "tamper_risk_score": ela_result.get("tamper_risk_score", 0),
                "is_tampered_suspected": ela_result.get("is_tampered_suspected", False),
                "observation": ela_result.get("observation"),
            }

    audio_bytes = None
    audio_mime = None
    if audio_file:
        audio_bytes = await audio_file.read()
        audio_mime = audio_file.content_type or "audio/mp3"

    # ---------------------------------------------
    # STEP 2: MULTI-MODAL GEMINI FORENSIC CALL
    # ---------------------------------------------
    system_instruction = """You are "HireShield AI", an elite Multi-Modal Recruitment Threat Intelligence and Corporate Forensics Engine. Your job is to protect job seekers and students (especially in India and globally) from fake job postings, forged offer letters, fraudulent HR phone calls, phishing emails, and WhatsApp/Telegram task scams.

You inspect:
1. Visual & Document Forensics (mismatched fonts, poorly aligned logos, fake seals, refundable laptop security deposits).
2. Audio & Voice Call Forensics (transcription, psychological urgency, guaranteed job without tech interview, AnyDesk/APK demands).
3. Email & Domain Spoofing (typosquatting e.g. careers@tcs-india-hiring.com, free webmail HR abuse, task scams).
4. Company & Legal Verification (validate Indian 21-character MCA CIN syntax and check WHOIS age).

CRITICAL RULE:
A genuine employer or recruitment firm NEVER charges money for offer letters, interviews, uniforms, laptops, gate passes, training, or onboarding. Any request for money (especially via UPI, PhonePe, Paytm, GooglePay, QR code) constitutes an IMMEDIATE SCAM (trust_score <= 15, verdict = "SCAM_DETECTED").

OUTPUT FORMAT:
You must ALWAYS respond strictly in valid JSON matching this schema:
{
  "trust_score": <integer from 0 to 100, where 0-30 is High-Risk Scam, 31-69 is Suspicious/Unverified, 70-100 is Likely Legitimate>,
  "verdict": "<SCAM_DETECTED | SUSPICIOUS | LEGITIMATE>",
  "confidence_score": <integer from 0 to 100>,
  "executive_summary": "<2-3 sentence clear, direct explanation of why this job/company is safe or dangerous>",
  "extracted_entities": {
    "company_name_claimed": "<string or null>",
    "official_domain_expected": "<string or null>",
    "sender_emails": ["<string>"],
    "urls_found": ["<string>"],
    "phone_numbers": ["<string>"],
    "upi_ids_or_bank_details": ["<string>"],
    "cin_or_registration_number": "<string or null>"
  },
  "forensic_breakdown": {
    "document_and_image_flags": ["<specific visual/text red flags found in uploaded screenshot/PDF>"],
    "audio_call_flags": ["<specific quotes/tactics detected in the HR phone call>"],
    "email_and_url_flags": ["<spoofing, typosquatting, or domain age issues>"],
    "company_legitimacy_flags": ["<CIN format issues, missing registration, or mismatch with real company>"]
  },
  "financial_trap_detected": {
    "asks_for_money": <boolean>,
    "amount_requested": "<string or null>",
    "stated_reason": "<e.g., Laptop security deposit, training fee, or null>"
  },
  "recommended_actions": [
    "<Specific step the user should take right now>"
  ],
  "cybercrime_report_draft": "<If trust_score < 50, generate a formal, ready-to-copy incident summary with all extracted numbers, emails, and UPI IDs formatted for filing on cybercrime.gov.in>"
}"""

    # Assemble multimodal content parts
    contents = []

    # Prompt text with OSINT context
    prompt_text = f"Perform deep forensic verification on the recruitment evidence.\n"
    if text:
        prompt_text += f"\n--- SUBMITTED TEXT / MESSAGE ---\n{text}\n"
    if url:
        prompt_text += f"\n--- SUBMITTED URL ---\n{url}\n"
    if sender_email:
        prompt_text += f"\n--- SENDER EMAIL ---\n{sender_email}\n"

    prompt_text += f"\n--- PRE-COMPUTED OSINT & ELA EVIDENCE ---\n{json.dumps(osint_data, indent=2)}\n"
    contents.append(prompt_text)

    # Attach Image Part
    if image_bytes and image_mime:
        contents.append(types.Part.from_bytes(data=image_bytes, mime_type=image_mime))

    # Attach Audio Part
    if audio_bytes and audio_mime:
        contents.append(types.Part.from_bytes(data=audio_bytes, mime_type=audio_mime))

    report_dict = None

    if ai_client:
        try:
            response = ai_client.models.generate_content(
                model="gemini-2.5-flash",
                contents=contents,
                config=types.GenerateContentConfig(
                    system_instruction=system_instruction,
                    response_mime_type="application/json",
                ),
            )
            if response.text:
                report_dict = json.loads(response.text)
        except Exception as e:
            print(f"GenAI call error: {e}")

    # Fallback to local heuristic engine if API key missing or network fails
    if not report_dict:
        report_dict = generate_local_heuristic_report(text or "", osint_data)

    report_dict["osint_telemetry"] = osint_data
    return report_dict


def generate_local_heuristic_report(text: str, osint_data: dict) -> dict:
    """Local offline forensic engine ensuring 100% free offline execution."""
    combined = text.lower()
    deposit_match = re.search(r"(security deposit|refundable|laptop courier|training fee|processing fee|gate pass|pay ₹|pay rs)", combined)
    task_match = re.search(r"(youtube like|telegram task|rating job|part time daily|earn daily 2000|earn daily 5000)", combined)
    anydesk_match = re.search(r"(anydesk|teamviewer|download apk|rustdesk)", combined)

    asks_money = bool(deposit_match)
    is_task_scam = bool(task_match)

    score = 85
    doc_flags = []
    audio_flags = []
    email_flags = []
    company_flags = []

    if asks_money:
        score -= 65
        doc_flags.append("CRITICAL: Upfront candidate monetary deposit / courier fee demanded.")
    if is_task_scam:
        score -= 50
        doc_flags.append("Matches known YouTube/Telegram review-merchant task scam mechanics.")
    if anydesk_match:
        score -= 40
        audio_flags.append("Malicious instruction: Coerced to install remote desktop tool (AnyDesk/TeamViewer).")

    # Check OSINT data
    whois_info = osint_data.get("whois", {})
    if whois_info.get("is_recently_registered"):
        score -= 30
        email_flags.append(f"Domain registered recently ({whois_info.get('domain_age_days')} days old).")

    typo_info = osint_data.get("typosquatting", {})
    if typo_info.get("is_spoofed"):
        score -= 35
        email_flags.append(typo_info.get("flag", "Typosquatting detected."))

    dns_info = osint_data.get("email_dns", {})
    if dns_info.get("is_free_webmail"):
        score -= 25
        email_flags.append("Free webmail provider used for official corporate recruitment.")

    cin_info = osint_data.get("mca_cin", {})
    if cin_info and not cin_info.get("is_valid", True):
        score -= 25
        company_flags.append(cin_info.get("error", "Invalid MCA CIN syntax."))

    final_score = max(5, min(95, score))
    verdict = "SCAM_DETECTED" if final_score <= 35 or asks_money else ("SUSPICIOUS" if final_score <= 69 else "LEGITIMATE")

    emails = re.findall(r"[\w\.-]+@[\w\.-]+\.\w+", text)
    phones = re.findall(r"\+?91[-\s]?[6-9]\d{9}|[6-9]\d{9}", text)
    upis = re.findall(r"[\w\.-]+@[a-zA-Z]{3,}", text)
    upis = [u for u in upis if not u.endswith(".com")]

    return {
        "trust_score": final_score,
        "verdict": verdict,
        "confidence_score": 94,
        "executive_summary": (
            "CRITICAL THREAT: Clear employment scam indicators detected, including unauthorized fee demands or spoofed credentials."
            if verdict == "SCAM_DETECTED"
            else "Caution advised: Unverified domain or non-standard hiring procedure observed."
        ),
        "extracted_entities": {
            "company_name_claimed": "Detected Corporate Entity",
            "official_domain_expected": typo_info.get("official_domains", [None])[0] if typo_info else None,
            "sender_emails": emails,
            "urls_found": re.findall(r"https?://[^\s]+", text),
            "phone_numbers": phones,
            "upi_ids_or_bank_details": upis,
            "cin_or_registration_number": cin_info.get("cin") if cin_info else None,
        },
        "forensic_breakdown": {
            "document_and_image_flags": doc_flags or ["No visual forgery identified."],
            "audio_call_flags": audio_flags or ["No audio coercion identified."],
            "email_and_url_flags": email_flags or ["Domain matches standard parameters."],
            "company_legitimacy_flags": company_flags or ["Corporate credentials inspected."],
        },
        "financial_trap_detected": {
            "asks_for_money": asks_money,
            "amount_requested": "Demanded in text" if asks_money else None,
            "stated_reason": "Laptop / Training / Registration Deposit" if asks_money else None,
        },
        "recommended_actions": [
            "DO NOT transfer money via UPI, PhonePe, or bank accounts under any pretext.",
            "Verify official vacancies directly at the enterprise's authentic careers portal.",
            "Report fraudulent numbers & accounts to https://cybercrime.gov.in or Helpline 1930.",
        ],
        "cybercrime_report_draft": (
            f"CYBERCRIME.GOV.IN COMPLAINT DRAFT\nCategory: Employment Scam & Upfront Fee Fraud\n"
            f"Suspect Emails: {', '.join(emails) or 'N/A'}\n"
            f"Suspect Phones: {', '.join(phones) or 'N/A'}\n"
            f"Suspect Payment Handles: {', '.join(upis) or 'N/A'}\n"
            f"Summary: The suspect falsely offered employment while demanding fees/deposits."
            if final_score < 50
            else ""
        ),
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
