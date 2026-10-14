import { ThreatPreset } from '../types/forensics';

// Helper to convert SVG text to a base64 data url
function svgToBase64(svgString: string): string {
  if (typeof window !== 'undefined' && window.btoa) {
    return window.btoa(unescape(encodeURIComponent(svgString)));
  }
  return Buffer.from(svgString).toString('base64');
}

// Sample SVG mockup for forged TCS offer letter
const fakeTcsLetterSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 1000" width="800" height="1000">
  <rect width="800" height="1000" fill="#ffffff"/>
  <rect x="0" y="0" width="800" height="24" fill="#003366"/>
  
  <!-- Header with fake logo -->
  <text x="50" y="70" font-family="Arial, sans-serif" font-size="28" font-weight="bold" fill="#003366">TATA CONSULTANCY SERVICES</text>
  <text x="50" y="95" font-family="Arial, sans-serif" font-size="12" fill="#666666">Recruitment &amp; Talent Acquisition Cell | CIN: U72200MH1995PTC999999</text>
  <line x1="50" y1="110" x2="750" y2="110" stroke="#003366" stroke-width="2"/>

  <!-- Date & Ref -->
  <text x="50" y="145" font-family="Arial, sans-serif" font-size="13" fill="#333333">Ref: TCS/OFFER/2026/89412</text>
  <text x="600" y="145" font-family="Arial, sans-serif" font-size="13" fill="#333333">Date: October 12, 2026</text>

  <text x="50" y="185" font-family="Arial, sans-serif" font-size="14" font-weight="bold" fill="#111111">CONFIDENTIAL OFFER OF EMPLOYMENT: ASSOCIATE SOFTWARE ENGINEER</text>

  <text x="50" y="220" font-family="Arial, sans-serif" font-size="13" fill="#333333">Dear Candidate,</text>
  <text x="50" y="245" font-family="Arial, sans-serif" font-size="12" fill="#444444">We are pleased to offer you the position of Associate Software Engineer at TCS with an annual CTC of INR 7,50,000/-.</text>
  <text x="50" y="270" font-family="Arial, sans-serif" font-size="12" fill="#444444">Your joining location will be Bangalore / Remote Work From Home with corporate asset dispatch.</text>

  <!-- Scam Clause Highlight -->
  <rect x="45" y="310" width="710" height="130" fill="#fff5f5" stroke="#e53e3e" stroke-dasharray="4"/>
  <text x="60" y="335" font-family="Arial, sans-serif" font-size="13" font-weight="bold" fill="#c53030">MANDATORY ASSET &amp; LAPTOP COURIER SECURITY CLAUSE:</text>
  <text x="60" y="360" font-family="Arial, sans-serif" font-size="12" fill="#2d3748">As per company remote onboarding guidelines, candidates must submit a 100% REFUNDABLE</text>
  <text x="60" y="380" font-family="Arial, sans-serif" font-size="12" fill="#2d3748">Laptop &amp; Equipment Security Deposit of INR 8,500/- via official UPI to lock your candidate kit.</text>
  <text x="60" y="405" font-family="Arial, sans-serif" font-size="12" font-weight="bold" fill="#c53030">UPI ID for Courier Clearance: tcs.hr.security@okaxis | Remittance proof must be sent within 4 hours.</text>
  <text x="60" y="425" font-family="Arial, sans-serif" font-size="11" fill="#718096">Note: The amount will be credited back in your first month salary slip automatically.</text>

  <!-- Generic text -->
  <text x="50" y="480" font-family="Arial, sans-serif" font-size="12" fill="#444444">Official communication domain: careers@tcs-india-hiring.com</text>
  <text x="50" y="505" font-family="Arial, sans-serif" font-size="12" fill="#444444">Helpline WhatsApp Desk: +91 98765 43210</text>

  <!-- Fake Stamp & Signature -->
  <circle cx="650" cy="620" r="45" fill="none" stroke="#2b6cb0" stroke-width="2" stroke-dasharray="3"/>
  <text x="615" y="615" font-family="Arial, sans-serif" font-size="10" font-weight="bold" fill="#2b6cb0">VERIFIED HR</text>
  <text x="618" y="630" font-family="Arial, sans-serif" font-size="9" fill="#2b6cb0">MUMBAI HQ</text>
  
  <text x="50" y="600" font-family="Arial, sans-serif" font-size="12" font-weight="bold" fill="#333333">Authorized Signatory</text>
  <text x="50" y="620" font-family="Arial, sans-serif" font-size="12" fill="#555555">Global Human Resources Division</text>
</svg>`;

// Sample SVG mockup for WhatsApp Telegram Task Scam
const telegramTaskScamSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 750" width="600" height="750">
  <rect width="600" height="750" fill="#0b141a"/>
  <!-- WhatsApp Header -->
  <rect x="0" y="0" width="600" height="60" fill="#202c33"/>
  <circle cx="35" cy="30" r="18" fill="#00a884"/>
  <text x="65" y="27" font-family="Arial, sans-serif" font-size="15" font-weight="bold" fill="#e9edef">+91 91234 56789</text>
  <text x="65" y="44" font-family="Arial, sans-serif" font-size="11" fill="#8696a0">Online | Global HR Recruiter</text>

  <!-- Chat bubbles -->
  <rect x="40" y="80" width="460" height="150" rx="10" fill="#202c33"/>
  <text x="55" y="105" font-family="Arial, sans-serif" font-size="13" fill="#e9edef">Hello dear! I am Priya from Global Online Talent.</text>
  <text x="55" y="128" font-family="Arial, sans-serif" font-size="13" fill="#e9edef">We have urgent Part-Time Work From Home job for you.</text>
  <text x="55" y="151" font-family="Arial, sans-serif" font-size="13" fill="#e9edef">Just subscribe &amp; like 3 YouTube videos, get ₹150 instantly!</text>
  <text x="55" y="174" font-family="Arial, sans-serif" font-size="13" fill="#25d366" font-weight="bold">Daily salary: ₹3,500 to ₹8,000 transferred to GPay/UPI.</text>
  <text x="55" y="197" font-family="Arial, sans-serif" font-size="13" fill="#e9edef">No technical interview or experience needed.</text>

  <!-- Second Chat bubble -->
  <rect x="40" y="250" width="480" height="160" rx="10" fill="#202c33"/>
  <text x="55" y="275" font-family="Arial, sans-serif" font-size="13" fill="#e9edef">Great! You completed trial tasks and earned ₹300.</text>
  <text x="55" y="298" font-family="Arial, sans-serif" font-size="13" fill="#e9edef">Now to unlock your VIP Merchant Tier and withdraw ₹6,500,</text>
  <text x="55" y="321" font-family="Arial, sans-serif" font-size="13" fill="#e53e3e" font-weight="bold">Please deposit ₹1,000 security recharge to merchant UPI:</text>
  <text x="55" y="344" font-family="Arial, sans-serif" font-size="13" fill="#ffb703" font-weight="bold">merchant.pay89@ybl</text>
  <text x="55" y="367" font-family="Arial, sans-serif" font-size="13" fill="#e9edef">Join our Telegram Group: https://t.me/vip_rating_payout_2026</text>
</svg>`;

export const THREAT_PRESETS: ThreatPreset[] = [
  {
    id: 'tcs-laptop-deposit-scam',
    title: 'Forged TCS Offer (₹8,500 Laptop Deposit)',
    category: 'Fake Offer Letter',
    threatLevel: 'CRITICAL',
    companyClaimed: 'Tata Consultancy Services (TCS)',
    description: 'A classic corporate offer forgery using a spoofed domain and demanding an upfront refundable laptop security deposit via UPI.',
    text: `OFFER LETTER - TATA CONSULTANCY SERVICES (TCS)
Ref No: TCS/OFFER/2026/89412
Date: 12th October 2026
CIN Claimed: U72200MH1995PTC999999

Dear Candidate,
We are pleased to offer you the post of Associate Software Engineer at Tata Consultancy Services with an annual CTC of INR 7,50,000/-.

MANDATORY ASSET & COURIER DISPATCH CLAUSE:
Under revised post-pandemic IT equipment courier guidelines, the candidate must deposit a 100% REFUNDABLE laptop security guarantee of INR 8,500/- before the dispatch of your corporate Dell Latitude laptop and gate pass. The amount will be credited back in your first month salary slip.

Remit payment via UPI ID: tcs.hr.security@okaxis
Official HR Contact: careers@tcs-india-hiring.com
Direct WhatsApp Support: +91 98765 43210
URL: https://tcs-india-hiring.com/verify-candidate-89412

Please complete the transaction within 4 hours to confirm your employee ID slot.`,
    file: {
      id: 'file-tcs-mock',
      name: 'TCS_Appointment_Letter_Ref89412.png',
      type: 'image',
      mimeType: 'image/png',
      base64: svgToBase64(fakeTcsLetterSvg),
      previewUrl: `data:image/svg+xml;utf8,${encodeURIComponent(fakeTcsLetterSvg)}`,
      sizeBytes: 42100,
    },
  },
  {
    id: 'telegram-youtube-task-scam',
    title: 'WhatsApp / Telegram Daily Task Scam',
    category: 'Task / Rating Scam',
    threatLevel: 'CRITICAL',
    companyClaimed: 'Global Digital Media Marketing Ltd',
    description: 'Promised high daily income for "liking YouTube videos and writing Google Maps reviews", followed by a VIP deposit demand.',
    text: `WhatsApp Forwarded Message from +91 91234 56789:
"Hello! I am Priya, Senior HR at Global Digital Marketing Agency. We found your profile on Naukri. 
We offer simple part-time online job: Just like YouTube videos and rate hotel places on Google Maps. 
Work 1-2 hours daily from home, earn ₹3,500 - ₹8,000 every day credited directly to your GooglePay/PhonePe! 
No technical interview or resume needed. Immediate joining today!

Next Step: You completed 3 tasks and received ₹150 trial bonus. Now to unlock your VIP Merchant commission of ₹6,500, you must deposit ₹1,000 recharge to our merchant gateway UPI: merchant.pay89@ybl. 
Join our official Telegram channel immediately: https://t.me/vip_rating_payout_2026"`,
    file: {
      id: 'file-whatsapp-mock',
      name: 'WhatsApp_Job_Chat_Screenshot.png',
      type: 'image',
      mimeType: 'image/png',
      base64: svgToBase64(telegramTaskScamSvg),
      previewUrl: `data:image/svg+xml;utf8,${encodeURIComponent(telegramTaskScamSvg)}`,
      sizeBytes: 28400,
    },
  },
  {
    id: 'amazon-audio-hr-call',
    title: 'Fraudulent Amazon HR Call (AnyDesk & UPI Trap)',
    category: 'Fraudulent HR Call',
    threatLevel: 'CRITICAL',
    companyClaimed: 'Amazon India Operations',
    description: 'Recorded phone conversation of a fake recruiter posing as Amazon HR, creating artificial urgency, demanding AnyDesk installation, and a ₹1,999 document processing fee.',
    text: `[RECORDED PHONE CALL TRANSCRIPT - CALL DURATION: 03:14]
Caller: "Good afternoon, am I speaking with Rohan? I am calling from Amazon India Talent Recruitment Cell, Bangalore headquarters."
Candidate: "Yes, hi. Regarding which role?"
Caller: "You have been shortlisted for our Customer Operations Executive Work-From-Home position. Package is 5.2 LPA with five-day work week."
Candidate: "Oh, but I did not appear for the technical test yet?"
Caller: "Sir, your profile was direct-selected based on university ranking. We are closing the onboarding batch today at 5:00 PM. Only 2 slots are left. If you don't confirm within 60 minutes, your seat will be cancelled."
Candidate: "Okay, what is the next step?"
Caller: "Right now on your phone, open Google Play Store and install AnyDesk Remote Desktop application. Then share your 9-digit remote address code with me so our IT verification team can configure your employee token."
Candidate: "AnyDesk? Why do I need to share remote screen for an interview?"
Caller: "It is mandatory for background biometric sync sir. Also, there is a refundable document processing and medical fee of INR 1,999. You have to pay via PhonePe or GooglePay to amazon.talent.hr@icici right now. After payment, your official Amazon ID badge and HP Laptop courier tracking number will be SMSed to you."`,
  },
  {
    id: 'legitimate-infosys-offer',
    title: 'Authentic Infosys Enterprise Offer (Benchmark)',
    category: 'Legitimate Offer',
    threatLevel: 'AUTHENTIC',
    companyClaimed: 'Infosys Limited',
    description: 'A genuine enterprise employment letter: official corporate email domain, valid MCA CIN, zero fee requests, and standard corporate benefits.',
    text: `INFOSYS LIMITED
CIN: L85110KA1981PLC013115
Registered Office: Electronics City, Hosur Road, Bengaluru 560 100, India
Web: https://www.infosys.com | Careers: https://careers.infosys.com

Date: October 08, 2026
Candidate Name: Ananya Sharma
Offer Reference: INF/BLR/2026/ENG-44120

Dear Ananya,
Sub: Letter of Intent - Systems Engineer Trainee

With reference to your campus interview conducted through our automated InfyTQ platform and subsequent technical evaluations, we are pleased to offer you the position of Systems Engineer Trainee with Infosys Limited.

Key Terms of Employment:
1. Compensation: Annual Total Gross Compensation will be INR 4,20,000/- (Rupees Four Lakhs Twenty Thousand Only) inclusive of Basic Salary, HRA, Medical Benefit, and PF contribution as per standard company policy.
2. Training Location: Infosys Global Education Center, Mysore.
3. Corporate Policy on Recruitment: INFOSYS LIMITED NEVER ASKS CANDIDATES FOR ANY MONETARY DEPOSIT, LAPTOP CHARGE, OR PROCESSING FEES AT ANY STAGE OF THE HIRING PROCESS. All genuine communications originate exclusively from @infosys.com email domains.

Please log in to your official Launchpad candidate portal at https://launchpad.infosys.com to upload your verified degree marksheet and accept this offer.

Sincerely,
Head - Talent Acquisition, Infosys Limited`,
  },
];
