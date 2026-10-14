"""
HireShield OSINT & Forensic Engine
-----------------------------------
A 100% free-to-run, open-source intelligence and forensic analysis module.
Covers:
1. Domain Age & Registrar via WHOIS
2. Domain Typosquatting / Lookalike Detection (difflib + heuristics)
3. DNS Records Check: MX, SPF, DMARC, and Free Webmail Impersonation
4. Indian MCA 21-character Corporate Identification Number (CIN) Validation
5. Image Tampering / Error Level Analysis (ELA) for forged seals/signatures
"""

import re
import io
import base64
import datetime
from typing import Dict, Any, List, Optional
import difflib

# DNS & WHOIS imports
import dns.resolver
import whois
from PIL import Image, ImageChops, ImageEnhance
import numpy as np
import cv2

# Known legitimate corporate domains
KNOWN_CORPORATE_TARGETS: Dict[str, Dict[str, Any]] = {
    "tcs": {
        "name": "Tata Consultancy Services",
        "official_domains": ["tcs.com", "careers.tcs.com"],
        "cin": "L22210MH1995PLC084781",
    },
    "infosys": {
        "name": "Infosys Limited",
        "official_domains": ["infosys.com", "careers.infosys.com"],
        "cin": "L85110KA1981PLC013115",
    },
    "wipro": {
        "name": "Wipro Limited",
        "official_domains": ["wipro.com", "careers.wipro.com"],
        "cin": "L32102KA1945PLC020800",
    },
    "amazon": {
        "name": "Amazon",
        "official_domains": ["amazon.com", "amazon.jobs", "amazon.in"],
        "cin": "U51900DL1997PTC088850",
    },
    "google": {
        "name": "Google / Alphabet",
        "official_domains": ["google.com", "careers.google.com"],
        "cin": "U72900KA2003FTC033028",
    },
    "microsoft": {
        "name": "Microsoft Corporation",
        "official_domains": ["microsoft.com", "careers.microsoft.com"],
        "cin": "U72200DL1998PTC097486",
    },
    "accenture": {
        "name": "Accenture",
        "official_domains": ["accenture.com"],
        "cin": "U72900MH2001FTC130396",
    },
    "cognizant": {
        "name": "Cognizant Technology Solutions",
        "official_domains": ["cognizant.com"],
        "cin": "U72300TN1994FTC026590",
    },
    "hcltech": {
        "name": "HCLTech",
        "official_domains": ["hcltech.com", "hcl.com"],
        "cin": "L74140DL1991PLC046369",
    },
    "reliance": {
        "name": "Reliance Industries / Jio",
        "official_domains": ["ril.com", "jio.com"],
        "cin": "L17110MH1973PLC019786",
    },
}

VALID_INDIAN_STATES = {
    "AP", "AR", "AS", "BR", "CG", "CH", "DD", "DL", "DN", "GA", "GJ", "HP", "HR",
    "JH", "JK", "KA", "KL", "LA", "LD", "MH", "ML", "MN", "MP", "MZ", "NL", "OR",
    "PB", "PY", "RJ", "SK", "TG", "TN", "TR", "TS", "UK", "UP", "UT", "WB"
}

FREE_WEBMAIL_PROVIDERS = {
    "gmail.com", "yahoo.com", "outlook.com", "hotmail.com", "rediffmail.com",
    "zoho.com", "proton.me", "protonmail.com", "icloud.com", "yopmail.com"
}


# ==========================================
# 1. DOMAIN AGE & WHOIS INVESTIGATION
# ==========================================
def check_domain_whois(domain_or_url: str) -> Dict[str, Any]:
    """Inspects domain age, creation date, and flags domains registered < 180 days ago."""
    clean_domain = re.sub(r"^https?://", "", domain_or_url.strip())
    clean_domain = clean_domain.split("/")[0].split(":")[0]
    if "@" in clean_domain:
        clean_domain = clean_domain.split("@")[1]

    result: Dict[str, Any] = {
        "target_domain": clean_domain,
        "creation_date": None,
        "domain_age_days": None,
        "is_recently_registered": False,
        "registrar": None,
        "whois_status": "UNKNOWN",
        "flag": None,
    }

    try:
        w = whois.whois(clean_domain)
        creation_date = w.creation_date

        if isinstance(creation_date, list):
            creation_date = creation_date[0]

        if creation_date:
            now = datetime.datetime.now(datetime.timezone.utc if creation_date.tzinfo else None)
            age_days = (now - creation_date).days
            result["creation_date"] = creation_date.strftime("%Y-%m-%d")
            result["domain_age_days"] = max(0, age_days)
            result["registrar"] = w.registrar or "Unknown Registrar"
            result["whois_status"] = "RESOLVED"

            if age_days < 180:
                result["is_recently_registered"] = True
                result["flag"] = f"CRITICAL RISK: Domain was created only {age_days} days ago (less than 180 days old)."
        else:
            result["whois_status"] = "CREATION_DATE_HIDDEN"
            result["flag"] = "SUSPICIOUS: Domain creation date hidden or protected by proxy registrar."
    except Exception as e:
        result["whois_status"] = "LOOKUP_FAILED"
        result["flag"] = f"WHOIS lookup failed or non-existent domain: {str(e)}"

    return result


# ==========================================
# 2. TYPOSQUATTING & LOOKALIKE DETECTION
# ==========================================
def detect_typosquatting(domain: str, claimed_company: Optional[str] = None) -> Dict[str, Any]:
    """Detects typosquatting, lookalike domains, and brand permutations."""
    clean_domain = domain.lower().strip()
    if "@" in clean_domain:
        clean_domain = clean_domain.split("@")[1]

    clean_domain = re.sub(r"^https?://", "", clean_domain).split("/")[0]

    domain_parts = clean_domain.split(".")
    base_name = domain_parts[0] if domain_parts else clean_domain

    detected_targets: List[Dict[str, Any]] = []
    is_spoof = False
    flag = None

    # Check against known enterprise target domains
    for key, data in KNOWN_CORPORATE_TARGETS.items():
        if clean_domain in data["official_domains"]:
            # Genuine official domain!
            return {
                "domain": clean_domain,
                "is_spoofed": False,
                "is_official": True,
                "matched_company": data["name"],
                "flag": f"VERIFIED: '{clean_domain}' is an authentic domain of {data['name']}.",
            }

        # Check keyword presence e.g. "tcs-hiring", "infosys-jobs", "amazon-hr"
        scam_patterns = [
            rf"{key}[-_]?(careers?|hiring|jobs?|recruitment|portal|verify|hr|india|global)",
            rf"(careers?|hiring|jobs?|hr)[-_]?{key}",
        ]
        matches_pattern = any(re.search(pat, clean_domain) for pat in scam_patterns)

        # Compute string similarity ratio
        similarity = difflib.SequenceMatcher(None, base_name, key).ratio()

        if matches_pattern or (similarity > 0.72 and base_name != key):
            is_spoof = True
            detected_targets.append({
                "target_company": data["name"],
                "similarity_score": round(similarity, 2),
                "official_domains": data["official_domains"],
                "pattern_matched": matches_pattern,
            })

    if is_spoof:
        targets_str = ", ".join(t["target_company"] for t in detected_targets)
        flag = f"TYPOSQUATTING DETECTED: '{clean_domain}' is impersonating {targets_str}."

    return {
        "domain": clean_domain,
        "is_spoofed": is_spoof,
        "is_official": False,
        "impersonated_entities": detected_targets,
        "flag": flag,
    }


# ==========================================
# 3. DNS MX, SPF & DMARC RECORD ANALYZER
# ==========================================
def analyze_email_and_dns(email_or_domain: str) -> Dict[str, Any]:
    """Performs DNS MX, SPF, DMARC lookup and checks for free webmail HR spoofing."""
    email = email_or_domain.lower().strip()
    domain = email.split("@")[1] if "@" in email else email
    domain = re.sub(r"^https?://", "", domain).split("/")[0]

    is_free_webmail = domain in FREE_WEBMAIL_PROVIDERS
    dns_res: Dict[str, Any] = {
        "target": email_or_domain,
        "domain": domain,
        "is_free_webmail": is_free_webmail,
        "mx_found": False,
        "mx_records": [],
        "spf_found": False,
        "spf_record": None,
        "dmarc_found": False,
        "dmarc_record": None,
        "flags": [],
    }

    if is_free_webmail:
        dns_res["flags"].append(
            f"HIGH RISK: Sender uses free webmail provider (@{domain}). Real corporate HR never sends employment offers from personal webmail."
        )
        return dns_res

    # Query MX Records
    try:
        mx_answers = dns.resolver.resolve(domain, "MX")
        mx_list = [str(r.exchange).rstrip(".") for r in mx_answers]
        dns_res["mx_found"] = len(mx_list) > 0
        dns_res["mx_records"] = mx_list
    except Exception:
        dns_res["flags"].append(f"CRITICAL: Domain '{domain}' has no valid MX records. It cannot receive enterprise mail.")

    # Query SPF Record (TXT record containing v=spf1)
    try:
        txt_answers = dns.resolver.resolve(domain, "TXT")
        for rdata in txt_answers:
            txt_str = "".join([part.decode("utf-8") if isinstance(part, bytes) else str(part) for part in rdata.strings])
            if "v=spf1" in txt_str:
                dns_res["spf_found"] = True
                dns_res["spf_record"] = txt_str
                break
        if not dns_res["spf_found"]:
            dns_res["flags"].append("WARNING: No valid SPF record detected; vulnerable to email spoofing.")
    except Exception:
        dns_res["flags"].append("WARNING: SPF verification failed.")

    # Query DMARC Record (_dmarc.domain)
    try:
        dmarc_answers = dns.resolver.resolve(f"_dmarc.{domain}", "TXT")
        for rdata in dmarc_answers:
            txt_str = "".join([part.decode("utf-8") if isinstance(part, bytes) else str(part) for part in rdata.strings])
            if "v=DMARC1" in txt_str:
                dns_res["dmarc_found"] = True
                dns_res["dmarc_record"] = txt_str
                break
        if not dns_res["dmarc_found"]:
            dns_res["flags"].append("WARNING: DMARC record missing.")
    except Exception:
        dns_res["flags"].append("WARNING: DMARC record lookup failed.")

    return dns_res


# ==========================================
# 4. INDIAN MCA CIN 21-DIGIT VALIDATOR
# ==========================================
def validate_indian_cin(cin_candidate: str) -> Dict[str, Any]:
    """Strictly validates Indian Ministry of Corporate Affairs 21-character CIN syntax.
    Format: [L/U][5-digit Industry][2-letter State][4-digit Year][3-letter Ownership][6-digit RegNo]
    """
    clean_cin = cin_candidate.strip().upper()
    cin_regex = r"^([LU])(\d{5})([A-Z]{2})(\d{4})([A-Z]{3})(\d{6})$"
    match = re.match(cin_regex, clean_cin)

    if not match:
        return {
            "cin": clean_cin,
            "is_valid": False,
            "error": f"Invalid CIN '{clean_cin}'. Length must be exactly 21 characters matching MCA structure.",
        }

    listing, industry_code, state_code, year_str, ownership, reg_no = match.groups()
    current_year = datetime.date.today().year
    year = int(year_str)

    errors = []
    if state_code not in VALID_INDIAN_STATES:
        errors.append(f"Unrecognized state code: {state_code}")

    if year < 1850 or year > current_year:
        errors.append(f"Impossible year of incorporation: {year}")

    valid_ownerships = {"PTC", "PLC", "FTC", "GOI", "SGC", "ULL", "GAP", "NPL"}
    if ownership not in valid_ownerships:
        errors.append(f"Unrecognized ownership identifier: {ownership}")

    is_valid = len(errors) == 0

    return {
        "cin": clean_cin,
        "is_valid": is_valid,
        "listing": "Listed" if listing == "L" else "Unlisted",
        "industry_code": industry_code,
        "state_code": state_code,
        "incorporation_year": year,
        "ownership_type": ownership,
        "registration_number": reg_no,
        "errors": errors,
        "summary": "Valid MCA CIN syntax" if is_valid else f"Syntax errors: {', '.join(errors)}"
    }


# ==========================================
# 5. ERROR LEVEL ANALYSIS (ELA) IMAGE TAMPERING
# ==========================================
def perform_error_level_analysis(image_bytes: bytes, quality: int = 90) -> Dict[str, Any]:
    """Performs Error Level Analysis (ELA) to identify digitally spliced stamps, signatures, or altered text.
    Returns tamper score and base64-encoded ELA visualization.
    """
    try:
        # Load original image
        original = Image.open(io.BytesIO(image_bytes)).convert("RGB")

        # Save to temporary in-memory JPEG at specified quality
        temp_buffer = io.BytesIO()
        original.save(temp_buffer, "JPEG", quality=quality)
        temp_buffer.seek(0)
        recompressed = Image.open(temp_buffer)

        # Calculate absolute difference
        ela_diff = ImageChops.difference(original, recompressed)

        # Scale difference for human visibility
        extrema = ela_diff.getextrema()
        max_diff = max([ex[1] for ex in extrema]) if extrema else 1
        scale = 255.0 / max(1, max_diff)
        ela_enhanced = ImageEnhance.Brightness(ela_diff).enhance(scale)

        # Convert to numpy array for variance/tamper metrics
        ela_np = np.array(ela_diff, dtype=np.float32)
        mean_diff = float(np.mean(ela_np))
        std_diff = float(np.std(ela_np))

        # High standard deviation in compression artifact regions indicates localized splicing/stamps
        tamper_probability = min(100, int((std_diff / 15.0) * 100))

        # Convert ELA result to base64
        ela_out = io.BytesIO()
        ela_enhanced.save(ela_out, format="PNG")
        ela_base64 = base64.b64encode(ela_out.getvalue()).decode("utf-8")

        return {
            "ela_performed": True,
            "mean_error": round(mean_diff, 2),
            "std_deviation": round(std_diff, 2),
            "tamper_risk_score": tamper_probability,
            "is_tampered_suspected": tamper_probability > 45,
            "ela_image_base64": f"data:image/png;base64,{ela_base64}",
            "observation": (
                "High-contrast localized error levels detected. Digital pasting of signatures, logos, or text suspected."
                if tamper_probability > 45
                else "Uniform compression error level. No obvious digital stamp or signature overlay detected."
            )
        }
    except Exception as e:
        return {
            "ela_performed": False,
            "error": f"Failed to compute ELA: {str(e)}",
            "tamper_risk_score": 0,
            "is_tampered_suspected": False,
        }
