import { useState } from 'react';
import '../styles/consent-form.css'; // Adjust path as per your folder structure

/* ─────────────────────────────────────────────
   LANGUAGE DATA
───────────────────────────────────────────── */
const LANGUAGES = { en: 'English', hi: 'हिंदी', ta: 'தமிழ்' };

const UI = {
  en: {
header: 'Audix CMP',
    subtitle: 'Digital Personal Data Protection Act, 2023',
    secure: 'Secure Session',
    noticeTitle: 'Data Processing Consent Notice',
    noticeBody: 'In compliance with the Digital Personal Data Protection Act, 2023, we require your explicit consent before processing your personal data. No boxes are pre-ticked — every selection is entirely your choice.',
    ageTitle: 'Age Verification',
    ageAdult: 'I am 18 years or older',
    ageMinor: 'I am under 18 years',
    guardianTitle: 'Guardian / Parent Consent',
    guardianName: 'Guardian Full Name',
    guardianRelation: 'Relationship to Minor',
    guardianPhone: 'Guardian Mobile Number',
    guardianEmail: 'Guardian Email Address',
    guardianC1: 'I consent to collection and processing of my contact information solely for this consent process.',
    guardianC2: 'I provide explicit consent on behalf of the minor for the selected data categories.',
    categoryHeader: 'Data Collection Categories',
    categoryCount: (n) => `${n} categories`,
    selectAll: 'Select all in category',
    fields: 'Fields',
    purposes: 'Purposes',
    summaryTitle: 'Your data is secure and encrypted',
    summarySub: 'You can review or withdraw consent anytime from your dashboard.',
    submit: 'Submit Consent',
    missingRequired: 'Please give mandatory consents before submitting:',
    guardianInfoMissing: 'Please complete all guardian contact fields.',
    guardianConsentMissing: 'Guardian must tick both consent checkboxes.',
    successTitle: 'Consent Recorded',
    successBody: 'Your consent preferences have been securely recorded under DPDPA 2023.',
    consentId: 'Consent ID',
    close: 'Continue',
	scrollThrough: 'Scroll through all 14 categories below',
    selectAllCategories: 'Select All Categories',
    dpoAccessText: 'Need DPO access? Use the dashboard login for consent review and admin actions.',
    dpoLogin: 'DPO Login',
    // Type labels
    type: {
      Regulatory: 'Regulatory',
      Marketing: 'Marketing',
      Analysis: 'Analysis',
      Service: 'Service',
      Compliance: 'Compliance',
      Optional: 'Optional',
      Security: 'Security',
    }
  },
   hi: {
    header: 'ऑडिक्स CMP',
    subtitle: 'डिजिटल व्यक्तिगत डेटा संरक्षण अधिनियम, 2023',
    secure: 'सुरक्षित सत्र',
    noticeTitle: 'डेटा प्रसंस्करण सहमति सूचना',
    noticeBody:
      'DPDPA 2023 के तहत हम आपका डेटा प्रोसेस करने से पहले आपकी स्पष्ट सहमति लेते हैं। कोई भी बॉक्स पहले से चेक नहीं है।',
    ageTitle: 'आयु सत्यापन',
    ageAdult: 'मैं 18 वर्ष या उससे अधिक का/की हूँ',
    ageMinor: 'मैं 18 वर्ष से कम उम्र का/की हूँ',
    guardianTitle: 'अभिभावक / माता-पिता की सहमति',
    guardianName: 'अभिभावक का पूरा नाम',
    guardianRelation: 'नाबालिग से संबंध',
    guardianPhone: 'अभिभावक मोबाइल नंबर',
    guardianEmail: 'अभिभावक ईमेल पता',
    guardianC1:
      'मैं केवल इस सहमति प्रक्रिया के लिए अपनी संपर्क जानकारी एकत्र और प्रसंस्करण की अनुमति देता/देती हूँ।',
    guardianC2:
      'मैं नाबालिग की ओर से चयनित डेटा श्रेणियों के लिए स्पष्ट सहमति देता/देती हूँ।',
    categoryHeader: 'डेटा संग्रह श्रेणियाँ',
    categoryCount: (n) => `${n} श्रेणियाँ`,
    selectAll: 'इस श्रेणी में सभी चुनें',
    fields: 'फ़ील्ड',
    purposes: 'उद्देश्य',
    summaryTitle: 'आपका डेटा सुरक्षित और एन्क्रिप्टेड है',
    summarySub: 'आप डैशबोर्ड से कभी भी सहमति देख या वापस ले सकते हैं।',
    submit: 'सहमति सबमिट करें',
    required: 'अनिवार्य',
    optional: 'वैकल्पिक',
    missingRequired: 'सबमिट करने से पहले ये अनिवार्य सहमतियाँ दें:',
    guardianInfoMissing: 'कृपया सभी अभिभावक संपर्क फ़ील्ड भरें।',
    guardianConsentMissing: 'अभिभावक को दोनों सहमति बॉक्स चेक करने होंगे।',
    successTitle: 'सहमति दर्ज की गई',
    successBody: 'आपकी सहमति DPDPA 2023 के तहत सुरक्षित रूप से दर्ज कर ली गई है।',
    consentId: 'सहमति आईडी',
    close: 'जारी रखें',
    dpdpaRef: 'DPDPA संदर्भ',
	scrollThrough: 'सभी 14 श्रेणियों को नीचे स्क्रॉल करें',
    selectAllCategories: 'सभी श्रेणियाँ चुनें',
    dpoAccessText: 'DPO एक्सेस चाहिए? सहमति समीक्षा और एडमिन कार्रवाई के लिए डैशबोर्ड लॉगिन का उपयोग करें।',
    dpoLogin: 'DPO लॉगिन',
    type: {
      Regulatory: 'नियामक',
      Marketing: 'विपणन',
      Analysis: 'विश्लेषण',
      Service: 'सेवा',
      Compliance: 'अनुपालन',
      Optional: 'वैकल्पिक',
      Security: 'सुरक्षा',
	}
  },
  ta: {
    header: 'ஆடிக்ஸ் CMP',
    subtitle: 'டிஜிட்டல் தனிப்பட்ட தரவு பாதுகாப்பு சட்டம், 2023',
    secure: 'பாதுகாப்பான அமர்வு',
    noticeTitle: 'தரவு செயலாக்க ஒப்புதல் அறிவிப்பு',
    noticeBody:
      'DPDPA 2023 இன்படி, உங்கள் தரவை செயலாக்குவதற்கு முன் உங்கள் ஒப்புதல் தேவை. எந்த பெட்டியும் முன்னதாக தேர்ந்தெடுக்கப்படவில்லை.',
    ageTitle: 'வயது சரிபார்ப்பு',
    ageAdult: 'நான் 18 வயதுக்கும் மேலாக உள்ளேன்',
    ageMinor: 'நான் 18 வயதிற்கு கீழ் உள்ளேன்',
    guardianTitle: 'பாதுகாவலர் / பெற்றோர் ஒப்புதல்',
    guardianName: 'பாதுகாவலரின் முழுப் பெயர்',
    guardianRelation: 'சிறுவனுடன் உறவு',
    guardianPhone: 'பாதுகாவலர் மொபைல் எண்',
    guardianEmail: 'பாதுகாவலர் மின்னஞ்சல்',
    guardianC1:
      'இந்த ஒப்புதல் செயல்முறைக்காக மட்டும் என் தொடர்பு தகவல்களை சேகரிக்க ஒப்புக்கொள்கிறேன்.',
    guardianC2:
      'தேர்ந்தெடுக்கப்பட்ட வகைகளுக்காக நான் சிறுவனுக்காக ஒப்புதல் வழங்குகிறேன்.',
    categoryHeader: 'தரவு சேகரிப்பு வகைகள்',
    categoryCount: (n) => `${n} வகைகள்`,
    selectAll: 'இந்த வகையில் எல்லாவற்றையும் தேர்ந்தெடுக்கவும்',
    fields: 'புலங்கள்',
    purposes: 'காரணங்கள்',
    summaryTitle: 'உங்கள் தரவு பாதுகாப்பாக உள்ளது',
    summarySub: 'நீங்கள் எப்போதும் டாஷ்போர்டில் இருந்து ஒப்புதலை நிர்வகிக்கலாம்.',
    submit: 'ஒப்புதலை சமர்ப்பிக்கவும்',
    required: 'கட்டாயம்',
    optional: 'விருப்பமானது',
    missingRequired: 'சமர்ப்பிக்கும் முன் இந்த கட்டாய ஒப்புதல்களை வழங்கவும்:',
    guardianInfoMissing: 'அனைத்து பாதுகாவலர் தொடர்பு புலங்களையும் நிரப்பவும்.',
    guardianConsentMissing: 'பாதுகாவலர் இரண்டு ஒப்புதல் பெட்டிகளையும் தேர்ந்தெடுக்க வேண்டும்.',
    successTitle: 'ஒப்புதல் பதிவு செய்யப்பட்டது',
    successBody: 'உங்கள் ஒப்புதல் விருப்பங்கள் DPDPA 2023 கீழ் பதிவு செய்யப்பட்டன.',
    consentId: 'ஒப்புதல் ஐடி',
    close: 'தொடரவும்',
    dpdpaRef: 'DPDPA குறிப்பு',
	scrollThrough: 'கீழே உள்ள அனைத்து 14 வகைகளையும் உருட்டவும்',
    selectAllCategories: 'அனைத்து வகைகளையும் தேர்ந்தெடுக்கவும்',
    dpoAccessText: 'DPO அணுகல் தேவையா? ஒப்புதல் மதிப்பாய்வு மற்றும் நிர்வாக செயல்களுக்கு டாஷ்போர்டு லாகின் பயன்படுத்தவும்.',
    dpoLogin: 'DPO உள்நுழைவு',
    type: {
      Regulatory: 'ஒழுங்குமுறை',
      Marketing: 'சந்தைப்படுத்தல்',
      Analysis: 'பகுப்பாய்வு',
      Service: 'சேவை',
      Compliance: 'இணக்கம்',
      Optional: 'விருப்பமானது',
      Security: 'பாதுகாப்பு',
    }
  },
};


/* Keep your full CATEGORIES data as it is (no change needed) */

const CATEGORIES = [
  {
    id: 1,
    title: { en: 'Basic Identity Information', hi: 'बुनियादी पहचान जानकारी', ta: 'அடிப்படை அடையாள தகவல்' },
    purpose: {
      en: 'Account creation, client identification, and regulatory compliance as required by SEBI and financial authorities.',
      hi: 'SEBI और वित्तीय अधिकारियों द्वारा आवश्यक खाता निर्माण, ग्राहक पहचान और नियामक अनुपालन।',
      ta: 'SEBI மற்றும் நிதி அதிகாரிகள் கோரிய கணக்கு உருவாக்கம், வாடிக்கையாளர் அடையாளம்.',
    },
    elements: [
      {
        field: { en: 'Full Name', hi: 'पूरा नाम', ta: 'முழு பெயர்' },
        consents: [
          { id: '1-1', type: 'Regulatory', mandatory: true,
            label: { en: 'Registration & KYC consent', hi: 'पंजीकरण और KYC सहमति', ta: 'பதிவு & KYC ஒப்புதல்' },
            detail: { en: 'Use your name to create your account and satisfy regulatory onboarding requirements under DPDPA Sec 7(a).', hi: 'DPDPA धारा 7(a) के तहत खाता बनाने और नियामक आवश्यकताओं को पूरा करने के लिए।', ta: 'DPDPA பிரிவு 7(a) கீழ் உங்கள் கணக்கை உருவாக்க.' },
            dpdpa: 'Sec 7(a)' },
          { id: '1-2', type: 'Analysis', mandatory: false,
            label: { en: 'Usage analysis consent', hi: 'उपयोग विश्लेषण सहमति', ta: 'பயன்பாட்டு பகுப்பாய்வு ஒப்புதல்' },
            detail: { en: 'Analyse usage patterns to improve your onboarding journey.', hi: 'आपकी ऑनबोर्डिंग यात्रा को बेहतर बनाने के लिए उपयोग पैटर्न विश्लेषण।', ta: 'பயன்பாட்டு மாதிரிகளை பகுப்பாய்வு செய்ய.' },
            dpdpa: 'Sec 6' },
        ],
      },
      {
        field: { en: 'Date of Birth', hi: 'जन्म तिथि', ta: 'பிறந்த தேதி' },
        consents: [
          { id: '1-3', type: 'Regulatory', mandatory: true,
            label: { en: 'Age & compliance verification', hi: 'आयु और अनुपालन सत्यापन', ta: 'வயது & இணக்க சரிபார்ப்பு' },
            detail: { en: 'Verify age and confirm data processing eligibility per DPDPA Sec 9.', hi: 'DPDPA धारा 9 के अनुसार आयु सत्यापन।', ta: 'DPDPA பிரிவு 9 படி வயது சரிபார்ப்பு.' },
            dpdpa: 'Sec 9' },
          { id: '1-4', type: 'Service', mandatory: false,
            label: { en: 'Personalisation consent', hi: 'व्यक्तिगतकरण सहमति', ta: 'தனிப்பயனாக்கம் ஒப்புதல்' },
            detail: { en: 'Personalise your experience based on your age band.', hi: 'आयु वर्ग के आधार पर आपके अनुभव को व्यक्तिगत बनाना।', ta: 'வயது அடிப்படையில் அனுபவத்தை தனிப்பயனாக்க.' },
            dpdpa: 'Sec 6' },
        ],
      },
      {
        field: { en: 'Gender', hi: 'लिंग', ta: 'பாலினம்' },
        consents: [
          { id: '1-5', type: 'Service', mandatory: false,
            label: { en: 'Profile accuracy consent', hi: 'प्रोफाइल सटीकता सहमति', ta: 'சுயவிவர துல்லியம் ஒப்புதல்' },
            detail: { en: 'Use gender information to build accurate profiles and improve service fit.', hi: 'सटीक प्रोफाइल के लिए।', ta: 'சரியான சுயவிவரத்திற்கு.' },
            dpdpa: 'Sec 6' },
        ],
      },
    ],
  },
  {
    id: 2,
    title: { en: 'Contact Details', hi: 'संपर्क विवरण', ta: 'தொடர்பு விவரங்கள்' },
    purpose: {
      en: 'Service communications, transaction alerts, regulatory notifications, and account-related updates.',
      hi: 'सेवा संचार, लेन-देन अलर्ट, नियामक सूचनाएँ और खाता अपडेट।',
      ta: 'சேவை தொடர்புகள், பரிவர்த்தனை அறிவிப்புகள் மற்றும் கணக்கு புதுப்பிப்புகள்.',
    },
    elements: [
      {
        field: { en: 'Mobile Number', hi: 'मोबाइल नंबर', ta: 'மொபைல் எண்' },
        consents: [
          { id: '2-1', type: 'Regulatory', mandatory: true,
            label: { en: 'Regulatory alerts & OTP consent', hi: 'नियामक अलर्ट और OTP सहमति', ta: 'ஒழுங்குமுறை அறிவிப்பு & OTP ஒப்புதல்' },
            detail: { en: 'Send OTPs, regulatory alerts, and service notifications per DPDPA Sec 7(b).', hi: 'OTP और नियामक अलर्ट के लिए।', ta: 'OTP மற்றும் சேவை அறிவிப்புகளுக்கு.' }, dpdpa: 'Sec 7(b)' },
          { id: '2-2', type: 'Marketing', mandatory: false,
            label: { en: 'Marketing SMS consent', hi: 'मार्केटिंग SMS सहमति', ta: 'மார்கெட்டிங் SMS ஒப்புதல்' },
            detail: { en: 'Send promotional offers and marketing updates via SMS.', hi: 'SMS के माध्यम से प्रचार ऑफर।', ta: 'SMS மூலம் விளம்பர சலுகைகள்.' }, dpdpa: 'Sec 6' },
          { id: '2-3', type: 'Analysis', mandatory: false,
            label: { en: 'Usage analytics consent', hi: 'उपयोग विश्लेषण सहमति', ta: 'பயன்பாட்டு பகுப்பாய்வு ஒப்புதல்' },
            detail: { en: 'Analyse mobile usage to improve communications.', hi: 'संचार सुधार के लिए मोबाइल उपयोग विश्लेषण।', ta: 'தொடர்பு மேம்பாட்டிற்கு பயன்பாட்டு பகுப்பாய்வு.' }, dpdpa: 'Sec 6' },
        ],
      },
      {
        field: { en: 'Email Address', hi: 'ईमेल पता', ta: 'மின்னஞ்சல் முகவரி' },
        consents: [
          { id: '2-4', type: 'Service', mandatory: false,
            label: { en: 'Service communications consent', hi: 'सेवा संचार सहमति', ta: 'சேவை தொடர்பு ஒப்புதல்' },
            detail: { en: 'Send transaction alerts, account updates, and service notices.', hi: 'लेन-देन अलर्ट और खाता अपडेट।', ta: 'பரிவர்த்தனை அறிவிப்புகள் மற்றும் கணக்கு புதுப்பிப்புகள்.' }, dpdpa: 'Sec 7(b)' },
          { id: '2-5', type: 'Marketing', mandatory: false,
            label: { en: 'Email marketing consent', hi: 'ईमेल मार्केटिंग सहमति', ta: 'மின்னஞ்சல் மார்கெட்டிங் ஒப்புதல்' },
            detail: { en: 'Send newsletters, offers, and marketing communications by email.', hi: 'ईमेल द्वारा समाचार पत्र और ऑफर।', ta: 'மின்னஞ்சல் மூலம் செய்திமடல்கள்.' }, dpdpa: 'Sec 6' },
          { id: '2-6', type: 'Analysis', mandatory: false,
            label: { en: 'Email analytics consent', hi: 'ईमेल विश्लेषण सहमति', ta: 'மின்னஞ்சல் பகுப்பாய்வு ஒப்புதல்' },
            detail: { en: 'Analyse email interactions for quality and relevance.', hi: 'गुणवत्ता के लिए ईमेल इंटरैक्शन विश्लेषण।', ta: 'தரம் மற்றும் பொருத்தத்திற்கு மின்னஞ்சல் இடைவினைகளை பகுப்பாய்வு.' }, dpdpa: 'Sec 6' },
        ],
      },
      {
        field: { en: 'Residential Address', hi: 'निवासीय पता', ta: 'வீட்டு முகவரி' },
        consents: [
          { id: '2-7', type: 'Regulatory', mandatory: true,
            label: { en: 'Address verification consent', hi: 'पता सत्यापन सहमति', ta: 'முகவரி சரிபார்ப்பு ஒப்புதல்' },
            detail: { en: 'Use address for KYC, compliance, and official notices.', hi: 'KYC और अनुपालन के लिए।', ta: 'KYC மற்றும் இணக்கத்திற்கு.' }, dpdpa: 'Sec 7(c)' },
          { id: '2-8', type: 'Service', mandatory: false,
            label: { en: 'Statement delivery consent', hi: 'स्टेटमेंट डिलीवरी सहमति', ta: 'அறிக்கை விநியோக ஒப்புதல்' },
            detail: { en: 'Deliver account statements and correspondence to this address.', hi: 'खाता विवरण और पत्राचार डिलीवरी।', ta: 'கணக்கு அறிக்கைகளை இந்த முகவரிக்கு அனுப்ப.' }, dpdpa: 'Sec 6' },
        ],
      },
      {
        field: { en: 'Correspondence Address', hi: 'पत्रव्यवहार पता', ta: 'கடித முகவரி' },
        consents: [
          { id: '2-9', type: 'Optional', mandatory: false,
            label: { en: 'Correspondence mailing consent', hi: 'पत्रव्यवहार मेलिंग सहमति', ta: 'கடித தபால் ஒப்புதல்' },
            detail: { en: 'Use this alternate address for non-essential communications.', hi: 'गैर-आवश्यक संचार के लिए वैकल्पिक पता।', ta: 'அத்தியாவசியமற்ற தொடர்புகளுக்கு.' }, dpdpa: 'Sec 6' },
        ],
      },
    ],
  },
  {
    id: 3,
    title: { en: 'KYC Documentation', hi: 'KYC दस्तावेज़', ta: 'KYC ஆவணங்கள்' },
    purpose: {
      en: 'Regulatory compliance with SEBI, PMLA, and AML requirements for client onboarding and verification.',
      hi: 'ग्राहक सत्यापन के लिए SEBI, PMLA और AML अनुपालन।',
      ta: 'வாடிக்கையாளர் சரிபார்ப்பிற்கு SEBI, PMLA மற்றும் AML இணக்கம்.',
    },
    elements: [
      { field: { en: 'PAN Number', hi: 'PAN नंबर', ta: 'PAN எண்' }, consents: [
        { id: '3-1', type: 'Regulatory', mandatory: true, label: { en: 'PAN compliance consent', hi: 'PAN अनुपालन सहमति', ta: 'PAN இணக்க ஒப்புதல்' }, detail: { en: 'Verify your PAN for tax and regulatory reporting.', hi: 'कर और नियामक रिपोर्टिंग के लिए PAN सत्यापन।', ta: 'வரி மற்றும் ஒழுங்குமுறை அறிக்கைக்கு PAN சரிபார்ப்பு.' }, dpdpa: 'Sec 7(c)' },
      ]},
      { field: { en: 'Aadhaar Number (Masked)', hi: 'आधार नंबर (मास्क्ड)', ta: 'ஆதார் எண் (மாஸ்க்)' }, consents: [
        { id: '3-2', type: 'Regulatory', mandatory: true, label: { en: 'Aadhaar verification consent', hi: 'आधार सत्यापन सहमति', ta: 'ஆதார் சரிபார்ப்பு ஒப்புதல்' }, detail: { en: 'Match Aadhaar records for identity verification per PMLA.', hi: 'PMLA के तहत पहचान सत्यापन।', ta: 'PMLA படி அடையாள சரிபார்ப்பு.' }, dpdpa: 'Sec 7(c)' },
      ]},
      { field: { en: 'Passport Number', hi: 'पासपोर्ट नंबर', ta: 'பாஸ்போர்ட் எண்' }, consents: [
        { id: '3-3', type: 'Optional', mandatory: false, label: { en: 'Passport optional consent', hi: 'पासपोर्ट वैकल्पिक सहमति', ta: 'பாஸ்போர்ட் விருப்ப ஒப்புதல்' }, detail: { en: 'Optionally share passport details for international identity use.', hi: 'अंतरराष्ट्रीय पहचान के लिए वैकल्पिक।', ta: 'சர்வதேச அடையாளத்திற்கு விருப்பமாக.' }, dpdpa: 'Sec 6' },
      ]},
      { field: { en: 'Voter ID', hi: 'मतदाता पहचान पत्र', ta: 'வாக்காளர் அடையாள அட்டை' }, consents: [
        { id: '3-4', type: 'Optional', mandatory: false, label: { en: 'Voter ID optional consent', hi: 'वोटर आईडी वैकल्पिक सहमति', ta: 'வாக்காளர் ID விருப்ப ஒப்புதல்' }, detail: { en: 'Share Voter ID for additional address and identity confirmation.', hi: 'पते और पहचान की पुष्टि के लिए।', ta: 'கூடுதல் முகவரி சரிபார்ப்பிற்கு.' }, dpdpa: 'Sec 6' },
      ]},
      { field: { en: 'Driving License', hi: 'ड्राइविंग लाइसेंस', ta: 'ஓட்டுநர் உரிமம்' }, consents: [
        { id: '3-5', type: 'Optional', mandatory: false, label: { en: 'Driving license optional consent', hi: 'ड्राइविंग लाइसेंस वैकल्पिक सहमति', ta: 'ஓட்டுநர் உரிமம் விருப்ப ஒப்புதல்' }, detail: { en: 'Share driving license for additional identity verification.', hi: 'अतिरिक्त पहचान सत्यापन के लिए।', ta: 'கூடுதல் அடையாள சரிபார்ப்பிற்கு.' }, dpdpa: 'Sec 6' },
      ]},
    ],
  },
  {
    id: 4,
    title: { en: 'Financial Profile', hi: 'वित्तीय प्रोफ़ाइल', ta: 'நிதி சுயவிவரம்' },
    purpose: {
      en: 'Risk assessment, product suitability evaluation, and personalised investment recommendations.',
      hi: 'जोखिम आकलन, उत्पाद उपयुक्तता और व्यक्तिगत निवेश सिफारिशें।',
      ta: 'ஆபத்து மதிப்பீடு மற்றும் தனிப்பயன் முதலீட்டு பரிந்துரைகள்.',
    },
    elements: [
      { field: { en: 'Annual Income Range', hi: 'वार्षिक आय सीमा', ta: 'ஆண்டு வருமான வரம்பு' }, consents: [
        { id: '4-1', type: 'Regulatory', mandatory: true, label: { en: 'Income verification consent', hi: 'आय सत्यापन सहमति', ta: 'வருமான சரிபார்ப்பு ஒப்புதல்' }, detail: { en: 'Provide income data for suitability and regulatory evaluation under SEBI.', hi: 'SEBI उपयुक्तता मूल्यांकन के लिए।', ta: 'SEBI பொருத்தம் மதிப்பீட்டிற்கு.' }, dpdpa: 'Sec 7(a)' },
      ]},
      { field: { en: 'Net Worth', hi: 'नेट वर्थ', ta: 'நிகர மதிப்பு' }, consents: [
        { id: '4-2', type: 'Optional', mandatory: false, label: { en: 'Wealth profiling consent', hi: 'संपत्ति प्रोफाइलिंग सहमति', ta: 'செல்வ சுயவிவரம் ஒப்புதல்' }, detail: { en: 'Share wealth details to help assess the right investment strategy.', hi: 'सही निवेश रणनीति के लिए।', ta: 'சரியான முதலீட்டு உத்திக்கு.' }, dpdpa: 'Sec 6' },
      ]},
      { field: { en: 'Occupation / Profession', hi: 'पेशा / व्यवसाय', ta: 'தொழில் / வேலை' }, consents: [
        { id: '4-3', type: 'Regulatory', mandatory: true, label: { en: 'Occupation verification consent', hi: 'पेशा सत्यापन सहमति', ta: 'தொழில் சரிபார்ப்பு ஒப்புதல்' }, detail: { en: 'Use occupation details to determine service suitability under SEBI.', hi: 'सेवा उपयुक्तता के लिए।', ta: 'சேவை பொருத்தத்தை தீர்மானிக்க.' }, dpdpa: 'Sec 7(a)' },
      ]},
      { field: { en: 'Source of Income', hi: 'आय का स्रोत', ta: 'வருமான ஆதாரம்' }, consents: [
        { id: '4-4', type: 'Optional', mandatory: false, label: { en: 'Source of income consent', hi: 'आय स्रोत सहमति', ta: 'வருமான ஆதார ஒப்புதல்' }, detail: { en: 'Share income source information for profile accuracy.', hi: 'प्रोफाइल सटीकता के लिए।', ta: 'சுயவிவர துல்லியத்திற்கு.' }, dpdpa: 'Sec 6' },
      ]},
    ],
  },
  {
    id: 5,
    title: { en: 'Investment Portfolio Data', hi: 'निवेश पोर्टफोलियो डेटा', ta: 'முதலீட்டு போர்ட்ஃபோலியோ தரவு' },
    purpose: {
      en: 'Portfolio management, performance tracking, advisory services, and consolidated reporting.',
      hi: 'पोर्टफोलियो प्रबंधन, प्रदर्शन ट्रैकिंग और समेकित रिपोर्टिंग।',
      ta: 'போர்ட்ஃபோலியோ மேலாண்மை மற்றும் ஒருங்கிணைந்த அறிக்கை.',
    },
    elements: [
      { field: { en: 'Existing Holdings', hi: 'मौजूदा होल्डिंग्स', ta: 'தற்போதைய பிடிப்புகள்' }, consents: [
        { id: '5-1', type: 'Optional', mandatory: false, label: { en: 'Portfolio tracking consent', hi: 'पोर्टफोलियो ट्रैकिंग सहमति', ta: 'போர்ட்ஃபோலியோ கண்காணிப்பு ஒப்புதல்' }, detail: { en: 'Share holdings data for consolidated portfolio reporting.', hi: 'समेकित पोर्टफोलियो रिपोर्टिंग के लिए।', ta: 'ஒருங்கிணைந்த அறிக்கைக்கு.' }, dpdpa: 'Sec 6' },
      ]},
      { field: { en: 'Asset Allocation', hi: 'संपत्ति आवंटन', ta: 'சொத்துகளின் ஒதுக்கீடு' }, consents: [
        { id: '5-2', type: 'Optional', mandatory: false, label: { en: 'Asset allocation consent', hi: 'संपत्ति आवंटन सहमति', ta: 'சொத்து ஒதுக்கீடு ஒப்புதல்' }, detail: { en: 'Share allocation details for advisory and risk assessment.', hi: 'सलाह और जोखिम मूल्यांकन के लिए।', ta: 'ஆலோசனை மற்றும் ஆபத்து மதிப்பீட்டிற்கு.' }, dpdpa: 'Sec 6' },
      ]},
      { field: { en: 'Investment History', hi: 'निवेश इतिहास', ta: 'முதலீட்டு வரலாறு' }, consents: [
        { id: '5-3', type: 'Optional', mandatory: false, label: { en: 'Investment history consent', hi: 'निवेश इतिहास सहमति', ta: 'முதலீட்டு வரலாறு ஒப்புதல்' }, detail: { en: 'Share historical data for performance tracking and guidance.', hi: 'प्रदर्शन ट्रैकिंग के लिए।', ta: 'செயல்திறன் கண்காணிப்பிற்கு.' }, dpdpa: 'Sec 6' },
      ]},
      { field: { en: 'Transaction Records', hi: 'लेन-देन रिकॉर्ड', ta: 'பரிவர்த்தனை பதிவுகள்' }, consents: [
        { id: '5-4', type: 'Optional', mandatory: false, label: { en: 'Transaction record consent', hi: 'लेन-देन रिकॉर्ड सहमति', ta: 'பரிவர்த்தனை பதிவு ஒப்புதல்' }, detail: { en: 'Share transactions to support advisory and reporting.', hi: 'सलाह और रिपोर्टिंग के लिए।', ta: 'ஆலோசனை மற்றும் அறிக்கையிடலுக்கு.' }, dpdpa: 'Sec 6' },
      ]},
    ],
  },
  {
    id: 6,
    title: { en: 'Banking Information', hi: 'बैंकिंग जानकारी', ta: 'வங்கி தகவல்' },
    purpose: {
      en: 'Transaction processing, fund settlements, dividend credits, and withdrawal requests.',
      hi: 'लेन-देन, फंड निपटान, लाभांश और निकासी।',
      ta: 'பரிவர்த்தனை செயலாக்கம், நிதி தீர்வுகள்.',
    },
    elements: [
      { field: { en: 'Bank Account Number', hi: 'बैंक खाता संख्या', ta: 'வங்கி கணக்கு எண்' }, consents: [
        { id: '6-1', type: 'Regulatory', mandatory: true, label: { en: 'Fund settlement consent', hi: 'फंड निपटान सहमति', ta: 'நிதி தீர்வு ஒப்புதல்' }, detail: { en: 'Use bank details to process settlements and payouts.', hi: 'निपटान और भुगतान के लिए।', ta: 'தீர்வுகள் மற்றும் கொடுப்பனவுகளுக்கு.' }, dpdpa: 'Sec 7(b)' },
        { id: '6-2', type: 'Service', mandatory: false, label: { en: 'Balance service consent', hi: 'बैलेंस सेवा सहमति', ta: 'இருப்பு சேவை ஒப்புதல்' }, detail: { en: 'Share account details for service-related balance checks.', hi: 'सेवा संबंधित बैलेंस जाँच के लिए।', ta: 'சேவை தொடர்பான இருப்பு சோதனைகளுக்கு.' }, dpdpa: 'Sec 6' },
      ]},
      { field: { en: 'IFSC Code', hi: 'IFSC कोड', ta: 'IFSC குறியீடு' }, consents: [
        { id: '6-3', type: 'Regulatory', mandatory: true, label: { en: 'Bank routing verification consent', hi: 'बैंक रूटिंग सत्यापन सहमति', ta: 'வங்கி ரூட்டிங் சரிபார்ப்பு ஒப்புதல்' }, detail: { en: 'Use IFSC to route payments and clear transactions securely.', hi: 'भुगतान रूटिंग और लेन-देन के लिए।', ta: 'கொடுப்பனவுகளை வழிநடத்த.' }, dpdpa: 'Sec 7(b)' },
      ]},
      { field: { en: 'Bank Name & Branch', hi: 'बैंक नाम और शाखा', ta: 'வங்கி பெயர் & கிளை' }, consents: [
        { id: '6-4', type: 'Regulatory', mandatory: true, label: { en: 'Bank branch verification consent', hi: 'बैंक शाखा सत्यापन सहमति', ta: 'வங்கி கிளை சரிபார்ப்பு ஒப்புதல்' }, detail: { en: 'Verify bank branch details for settlement and KYC.', hi: 'निपटान और KYC के लिए।', ta: 'தீர்வு மற்றும் KYC க்கு.' }, dpdpa: 'Sec 7(b)' },
      ]},
      { field: { en: 'Account Type', hi: 'खाता प्रकार', ta: 'கணக்கு வகை' }, consents: [
        { id: '6-5', type: 'Optional', mandatory: false, label: { en: 'Account type consent', hi: 'खाता प्रकार सहमति', ta: 'கணக்கு வகை ஒப்புதல்' }, detail: { en: 'Share account type to personalise payment options.', hi: 'भुगतान विकल्पों के लिए।', ta: 'கொடுப்பனவு விருப்பங்களை தனிப்பயனாக்க.' }, dpdpa: 'Sec 6' },
      ]},
    ],
  },
  {
    id: 7,
    title: { en: 'Nominee Information', hi: 'नामित जानकारी', ta: 'பெயரிடப்பட்ட நபர் தகவல்' },
    purpose: {
      en: 'Succession planning and asset transfer in accordance with legal requirements.',
      hi: 'उत्तराधिकार योजना और कानूनी आवश्यकताओं के अनुसार संपत्ति हस्तांतरण।',
      ta: 'சட்ட தேவைகளுக்கு ஏற்ப வாரிசு திட்டமிடல்.',
    },
    elements: [
      { field: { en: 'Nominee Name', hi: 'नामित का नाम', ta: 'பெயரிடப்பட்டவரின் பெயர்' }, consents: [
        { id: '7-1', type: 'Regulatory', mandatory: true, label: { en: 'Nominee identity consent', hi: 'नामित पहचान सहमति', ta: 'பெயரிடப்பட்டவர் அடையாள ஒப்புதல்' }, detail: { en: 'Collect nominee details to support succession and legal transfer.', hi: 'उत्तराधिकार के लिए।', ta: 'வாரிசுக்கு.' }, dpdpa: 'Sec 7(a)' },
      ]},
      { field: { en: 'Nominee Relationship', hi: 'नामित संबंध', ta: 'பெயரிடப்பட்ட உறவு' }, consents: [
        { id: '7-2', type: 'Regulatory', mandatory: true, label: { en: 'Nominee relationship consent', hi: 'नामित संबंध सहमति', ta: 'பெயரிடப்பட்ட உறவு ஒப்புதல்' }, detail: { en: 'Collect relationship details for legal nominee validation.', hi: 'कानूनी नामित सत्यापन के लिए।', ta: 'சட்டபூர்வ சரிபார்ப்பிற்கு.' }, dpdpa: 'Sec 7(a)' },
      ]},
      { field: { en: 'Nominee Date of Birth', hi: 'नामित की जन्म तिथि', ta: 'பெயரிடப்பட்டவர் பிறந்த தேதி' }, consents: [
        { id: '7-3', type: 'Regulatory', mandatory: true, label: { en: 'Nominee age verification consent', hi: 'नामित आयु सत्यापन सहमति', ta: 'பெயரிடப்பட்டவர் வயது சரிபார்ப்பு ஒப்புதல்' }, detail: { en: 'Collect nominee age for valid succession planning.', hi: 'उत्तराधिकार योजना के लिए।', ta: 'சரியான வாரிசு திட்டமிடலுக்கு.' }, dpdpa: 'Sec 7(a)' },
      ]},
      { field: { en: 'Nominee Contact Details', hi: 'नामित संपर्क विवरण', ta: 'பெயரிடப்பட்டவர் தொடர்பு விவரங்கள்' }, consents: [
        { id: '7-4', type: 'Optional', mandatory: false, label: { en: 'Nominee contact consent', hi: 'नामित संपर्क सहमति', ta: 'பெயரிடப்பட்டவர் தொடர்பு ஒப்புதல்' }, detail: { en: 'Share nominee contact details for future communication.', hi: 'भविष्य के संचार के लिए।', ta: 'எதிர்கால தொடர்புக்கு.' }, dpdpa: 'Sec 6' },
      ]},
    ],
  },
  {
    id: 8,
    title: { en: 'Risk Profile Assessment', hi: 'जोखिम प्रोफ़ाइल आकलन', ta: 'ஆபத்து சுயவிவரம் மதிப்பீடு' },
    purpose: {
      en: 'SEBI-mandated suitability assessment to ensure appropriate product recommendations.',
      hi: 'उपयुक्त उत्पाद सिफारिशों के लिए SEBI-अनिवार्य योग्यता आकलन।',
      ta: 'உகந்த தயாரிப்பு பரிந்துரைகளை உறுதிப்படுத்த SEBI-ஆணையிடப்பட்ட மதிப்பீடு.',
    },
    elements: [
      { field: { en: 'Risk Appetite Questionnaire', hi: 'जोखिम क्षमता प्रश्नावली', ta: 'ஆபத்து திறன் கேள்வித்தொகுப்பு' }, consents: [
        { id: '8-1', type: 'Regulatory', mandatory: true, label: { en: 'Suitability assessment consent', hi: 'उपयुक्तता आकलन सहमति', ta: 'பொருத்தம் மதிப்பீடு ஒப்புதல்' }, detail: { en: 'Use risk profile data to comply with SEBI suitability regulations.', hi: 'SEBI उपयुक्तता नियमों के अनुपालन के लिए।', ta: 'SEBI பொருத்தம் விதிமுறைகளுக்கு.' }, dpdpa: 'Sec 7(a)' },
      ]},
      { field: { en: 'Investment Objectives', hi: 'निवेश उद्देश्य', ta: 'முதலீட்டு குறிக்கோள்கள்' }, consents: [
        { id: '8-2', type: 'Regulatory', mandatory: true, label: { en: 'Objective evaluation consent', hi: 'उद्देश्य मूल्यांकन सहमति', ta: 'குறிக்கோள் மதிப்பீடு ஒப்புதல்' }, detail: { en: 'Use investment goals to recommend appropriate products.', hi: 'उपयुक्त उत्पादों की सिफारिश के लिए।', ta: 'உகந்த தயாரிப்புகளை பரிந்துரைக்க.' }, dpdpa: 'Sec 7(a)' },
      ]},
      { field: { en: 'Investment Horizon', hi: 'निवेश क्षितिज', ta: 'முதலீட்டு காலம்' }, consents: [
        { id: '8-3', type: 'Regulatory', mandatory: true, label: { en: 'Horizon profiling consent', hi: 'क्षितिज प्रोफाइलिंग सहमति', ta: 'காலம் சுயவிவரம் ஒப்புதல்' }, detail: { en: 'Use horizon data to align recommendations with your timeline.', hi: 'सिफारिशों को आपकी समय-सीमा के अनुरूप बनाने के लिए।', ta: 'பரிந்துரைகளை உங்கள் காலவரிசையுடன் சீரமைக்க.' }, dpdpa: 'Sec 7(a)' },
      ]},
      { field: { en: 'Financial Goals', hi: 'वित्तीय लक्ष्य', ta: 'நிதி குறிக்கோள்கள்' }, consents: [
        { id: '8-4', type: 'Optional', mandatory: false, label: { en: 'Financial goals consent', hi: 'वित्तीय लक्ष्य सहमति', ta: 'நிதி குறிக்கோள்கள் ஒப்புதல்' }, detail: { en: 'Share your goals to improve long-term guidance.', hi: 'दीर्घकालिक मार्गदर्शन के लिए।', ta: 'நீண்ட கால வழிகாட்டலை மேம்படுத்த.' }, dpdpa: 'Sec 6' },
      ]},
    ],
  },
  {
    id: 9,
    title: { en: 'Transaction History', hi: 'लेन-देन इतिहास', ta: 'பரிவர்த்தனை வரலாறு' },
    purpose: {
      en: 'Order execution, trade confirmations, tax reporting, and regulatory audit requirements.',
      hi: 'ऑर्डर निष्पादन, ट्रेड पुष्टि, कर रिपोर्टिंग।',
      ta: 'ஆர்டர் செயல்படுத்தல், வர்த்தக உறுதிப்பாடு மற்றும் வரி அறிக்கை.',
    },
    elements: [
      { field: { en: 'Buy / Sell Orders', hi: 'खरीद/बिक्री आदेश', ta: 'வாங்க/விற்கும் ஆர்டர்கள்' }, consents: [
        { id: '9-1', type: 'Optional', mandatory: false, label: { en: 'Trade history consent', hi: 'ट्रेड इतिहास सहमति', ta: 'வர்த்தக வரலாறு ஒப்புதல்' }, detail: { en: 'Share order history for record keeping and auditing.', hi: 'रिकॉर्ड रखने और ऑडिटिंग के लिए।', ta: 'பதிவு வைத்திருப்பு மற்றும் தணிக்கைக்கு.' }, dpdpa: 'Sec 6' },
      ]},
      { field: { en: 'SIP Mandates', hi: 'SIP माण्डेट', ta: 'SIP மான்டேட்' }, consents: [
        { id: '9-2', type: 'Optional', mandatory: false, label: { en: 'SIP mandate consent', hi: 'SIP माण्डेट सहमति', ta: 'SIP மான்டேட் ஒப்புதல்' }, detail: { en: 'Share SIP mandate details for transaction accuracy.', hi: 'लेन-देन सटीकता के लिए।', ta: 'பரிவர்த்தனை துல்லியத்திற்கு.' }, dpdpa: 'Sec 6' },
      ]},
      { field: { en: 'Redemption Requests', hi: 'रिडेम्प्शन अनुरोध', ta: 'மீட்பு கோரிக்கைகள்' }, consents: [
        { id: '9-3', type: 'Optional', mandatory: false, label: { en: 'Redemption request consent', hi: 'रिडेम्प्शन अनुरोध सहमति', ta: 'மீட்பு கோரிக்கை ஒப்புதல்' }, detail: { en: 'Share redemption data for reporting and service support.', hi: 'रिपोर्टिंग और सेवा समर्थन के लिए।', ta: 'அறிக்கையிடல் மற்றும் சேவைக்கு.' }, dpdpa: 'Sec 6' },
      ]},
      { field: { en: 'Payment History', hi: 'भुगतान इतिहास', ta: 'கட்டண வரலாறு' }, consents: [
        { id: '9-4', type: 'Optional', mandatory: false, label: { en: 'Payment history consent', hi: 'भुगतान इतिहास सहमति', ta: 'கட்டண வரலாறு ஒப்புதல்' }, detail: { en: 'Share payment history for reconciliation and support.', hi: 'सामंजस्य और समर्थन के लिए।', ta: 'சரிசெய்தல் மற்றும் ஆதரவிற்கு.' }, dpdpa: 'Sec 6' },
      ]},
    ],
  },
  {
    id: 10,
    title: { en: 'Communication Records', hi: 'संचार रिकॉर्ड', ta: 'தொடர்பு பதிவுகள்' },
    purpose: {
      en: 'Quality assurance, dispute resolution, regulatory compliance, and service improvement.',
      hi: 'गुणवत्ता आश्वासन, विवाद समाधान और सेवा सुधार।',
      ta: 'தர உறுதி, சர்ச்சை தீர்வு மற்றும் சேவை மேம்பாடு.',
    },
    elements: [
      { field: { en: 'Email Correspondence', hi: 'ईमेल पत्रव्यवहार', ta: 'மின்னஞ்சல் தொடர்பு' }, consents: [
        { id: '10-1', type: 'Optional', mandatory: false, label: { en: 'Email archive consent', hi: 'ईमेल संग्रह सहमति', ta: 'மின்னஞ்சல் காப்பக ஒப்புதல்' }, detail: { en: 'Store email records for dispute resolution and compliance.', hi: 'विवाद समाधान और अनुपालन के लिए।', ta: 'சர்ச்சை தீர்வு மற்றும் இணக்கத்திற்கு.' }, dpdpa: 'Sec 6' },
      ]},
      { field: { en: 'Call Recordings', hi: 'कॉल रिकॉर्डिंग्स', ta: 'அழைப்பு பதிவுகள்' }, consents: [
        { id: '10-2', type: 'Optional', mandatory: false, label: { en: 'Call recording consent', hi: 'कॉल रिकॉर्डिंग सहमति', ta: 'அழைப்பு பதிவு ஒப்புதல்' }, detail: { en: 'Store call records for quality assurance.', hi: 'गुणवत्ता आश्वासन के लिए।', ta: 'தர உறுதிக்கு.' }, dpdpa: 'Sec 6' },
      ]},
      { field: { en: 'Chat Transcripts', hi: 'चैट प्रतिलेख', ta: 'அரட்டை பதிவுகள்' }, consents: [
        { id: '10-3', type: 'Optional', mandatory: false, label: { en: 'Chat transcript consent', hi: 'चैट प्रतिलेख सहमति', ta: 'அரட்டை பதிவு ஒப்புதல்' }, detail: { en: 'Keep chat transcripts for support and compliance audits.', hi: 'समर्थन और अनुपालन ऑडिट के लिए।', ta: 'ஆதரவு மற்றும் இணக்க தணிக்கைக்கு.' }, dpdpa: 'Sec 6' },
      ]},
      { field: { en: 'SMS History', hi: 'SMS इतिहास', ta: 'SMS வரலாறு' }, consents: [
        { id: '10-4', type: 'Optional', mandatory: false, label: { en: 'SMS archive consent', hi: 'SMS संग्रह सहमति', ta: 'SMS காப்பக ஒப்புதல்' }, detail: { en: 'Store SMS history for notification verification.', hi: 'सूचना सत्यापन के लिए।', ta: 'அறிவிப்பு சரிபார்ப்பிற்கு.' }, dpdpa: 'Sec 6' },
      ]},
    ],
  },
  {
    id: 11,
    title: { en: 'Digital Authentication Data', hi: 'डिजिटल प्रमाणीकरण डेटा', ta: 'டிஜிட்டல் அங்கீகாரம் தரவு' },
    purpose: {
      en: 'Fraud prevention, cybersecurity, unauthorised access detection, and account protection.',
      hi: 'धोखाधड़ी रोकथाम, साइबर सुरक्षा और अनधिकृत प्रवेश पहचान।',
      ta: 'மோசடி தடுப்பு, சைபர் பாதுகாப்பு மற்றும் அனுமதியற்ற அணுகல் கண்டறிதல்.',
    },
    elements: [
      { field: { en: 'IP Address', hi: 'IP पता', ta: 'IP முகவரி' }, consents: [
        { id: '11-1', type: 'Optional', mandatory: false, label: { en: 'IP address consent', hi: 'IP पता सहमति', ta: 'IP முகவரி ஒப்புதல்' }, detail: { en: 'Collect IP data to detect fraud and unauthorised access.', hi: 'धोखाधड़ी और अनधिकृत पहुँच का पता लगाने के लिए।', ta: 'மோசடி மற்றும் அனுமதியற்ற அணுகலை கண்டறிய.' }, dpdpa: 'Sec 6' },
      ]},
      { field: { en: 'Device Information', hi: 'डिवाइस जानकारी', ta: 'கருவி தகவல்' }, consents: [
        { id: '11-2', type: 'Optional', mandatory: false, label: { en: 'Device information consent', hi: 'डिवाइस जानकारी सहमति', ta: 'கருவி தகவல் ஒப்புதல்' }, detail: { en: 'Collect device details to identify suspicious activity.', hi: 'संदिग्ध गतिविधि की पहचान के लिए।', ta: 'சந்தேகாஸ்பத்தான செயல்பாட்டை அடையாளம் காண.' }, dpdpa: 'Sec 6' },
      ]},
      { field: { en: 'Browser Details', hi: 'ब्राउज़र विवरण', ta: 'உலாவி விவரங்கள்' }, consents: [
        { id: '11-3', type: 'Optional', mandatory: false, label: { en: 'Browser details consent', hi: 'ब्राउज़र विवरण सहमति', ta: 'உலாவி விவரங்கள் ஒப்புதல்' }, detail: { en: 'Collect browser data for secure authentication and troubleshooting.', hi: 'सुरक्षित प्रमाणीकरण और समस्या निवारण के लिए।', ta: 'பாதுகாப்பான அங்கீகாரத்திற்கு.' }, dpdpa: 'Sec 6' },
      ]},
      { field: { en: 'Login Timestamps', hi: 'लॉगिन टाइमस्टैम्प', ta: 'உள்நுழைவு நேரங்கள்' }, consents: [
        { id: '11-4', type: 'Optional', mandatory: false, label: { en: 'Login timestamp consent', hi: 'लॉगिन टाइमस्टैम्प सहमति', ta: 'உள்நுழைவு நேர ஒப்புதல்' }, detail: { en: 'Collect login times to monitor access and detect anomalies.', hi: 'पहुँच निगरानी और विसंगति पहचान के लिए।', ta: 'அணுகல் கண்காணிப்பு மற்றும் முரண்பாடு கண்டறிதலுக்கு.' }, dpdpa: 'Sec 6' },
      ]},
    ],
  },
  {
    id: 12,
    title: { en: 'Access Credentials', hi: 'पहुँच प्रमाण-पत्र', ta: 'அணுகல் ஆவணங்கள்' },
    purpose: {
      en: 'Secure platform access, session management, and two-factor authentication.',
      hi: 'सुरक्षित प्लेटफ़ॉर्म एक्सेस, सत्र प्रबंधन और 2FA।',
      ta: 'பாதுகாப்பான தளம் அணுகல், அமர்வு மேலாண்மை மற்றும் 2FA.',
    },
    elements: [
      { field: { en: 'User ID', hi: 'उपयोगकर्ता ID', ta: 'பயனர் ஐடி' }, consents: [
        { id: '12-1', type: 'Security', mandatory: true, label: { en: 'Account access consent', hi: 'खाता पहुँच सहमति', ta: 'கணக்கு அணுகல் ஒப்புதல்' }, detail: { en: 'Use your user ID to authenticate and manage access.', hi: 'प्रमाणीकरण और पहुँच प्रबंधन के लिए।', ta: 'அங்கீகாரம் மற்றும் அணுகல் மேலாண்மைக்கு.' }, dpdpa: 'Sec 7(b)' },
      ]},
      { field: { en: 'Password (Encrypted)', hi: 'पासवर्ड (एन्क्रिप्टेड)', ta: 'கடவுச்சொல் (குறியாக்கம்)' }, consents: [
        { id: '12-2', type: 'Security', mandatory: true, label: { en: 'Credential storage consent', hi: 'क्रेडेंशियल स्टोरेज सहमति', ta: 'நற்சான்றிதழ் சேமிப்பக ஒப்புதல்' }, detail: { en: 'Store encrypted password details to enable secure login.', hi: 'सुरक्षित लॉगिन के लिए एन्क्रिप्टेड पासवर्ड स्टोर करना।', ta: 'பாதுகாப்பான உள்நுழைவை இயக்க.' }, dpdpa: 'Sec 7(b)' },
      ]},
      { field: { en: 'Security Questions', hi: 'सुरक्षा प्रश्न', ta: 'பாதுகாப்பு கேள்விகள்' }, consents: [
        { id: '12-3', type: 'Optional', mandatory: false, label: { en: 'Security question consent', hi: 'सुरक्षा प्रश्न सहमति', ta: 'பாதுகாப்பு கேள்வி ஒப்புதல்' }, detail: { en: 'Collect recovery questions for account access support.', hi: 'खाता पुनर्प्राप्ति के लिए।', ta: 'கணக்கு மீட்டெடுப்பிற்கு.' }, dpdpa: 'Sec 6' },
      ]},
      { field: { en: 'OTP Preferences', hi: 'OTP प्राथमिकताएँ', ta: 'OTP விருப்பங்கள்' }, consents: [
        { id: '12-4', type: 'Optional', mandatory: false, label: { en: 'OTP preference consent', hi: 'OTP प्राथमिकता सहमति', ta: 'OTP விருப்பம் ஒப்புதல்' }, detail: { en: 'Use OTP preferences for authentication and alerts.', hi: 'प्रमाणीकरण और अलर्ट के लिए।', ta: 'அங்கீகாரம் மற்றும் அறிவிப்புகளுக்கு.' }, dpdpa: 'Sec 6' },
      ]},
    ],
  },
  {
    id: 13,
    title: { en: 'Tax-Related Information', hi: 'कर संबंधित जानकारी', ta: 'வரி தொடர்பான தகவல்' },
    purpose: {
      en: 'Tax compliance, capital gains reporting, TDS deduction, and annual tax statement generation.',
      hi: 'कर अनुपालन, पूंजी लाभ रिपोर्टिंग, TDS और वार्षिक कर विवरण।',
      ta: 'வரி இணக்கம், மூலதன ஆதாய அறிக்கை மற்றும் TDS கழிவு.',
    },
    elements: [
      { field: { en: 'Tax Residency Status', hi: 'कर निवासी स्थिति', ta: 'வரி குடியுரிமை நிலை' }, consents: [
        { id: '13-1', type: 'Regulatory', mandatory: true, label: { en: 'Tax residency disclosure consent', hi: 'कर निवासी प्रकटीकरण सहमति', ta: 'வரி குடியிருப்பு வெளிப்படுத்தல் ஒப்புதல்' }, detail: { en: 'Collect tax residency details for mandatory filing and reporting.', hi: 'अनिवार्य फाइलिंग और रिपोर्टिंग के लिए।', ta: 'கட்டாய தாக்கல் மற்றும் அறிக்கைக்கு.' }, dpdpa: 'Sec 7(a)' },
      ]},
      { field: { en: 'Capital Gains Data', hi: 'पूंजी लाभ डेटा', ta: 'மூலதன ஆதாய தரவு' }, consents: [
        { id: '13-2', type: 'Optional', mandatory: false, label: { en: 'Capital gains consent', hi: 'पूंजी लाभ सहमति', ta: 'மூலதன ஆதாய ஒப்புதல்' }, detail: { en: 'Share capital gains data for tax calculation and advisory.', hi: 'कर गणना और सलाह के लिए।', ta: 'வரி கணக்கீடு மற்றும் ஆலோசனைக்கு.' }, dpdpa: 'Sec 6' },
      ]},
      { field: { en: 'TDS Certificates', hi: 'TDS प्रमाणपत्र', ta: 'TDS சான்றிதழ்கள்' }, consents: [
        { id: '13-3', type: 'Optional', mandatory: false, label: { en: 'TDS certificate consent', hi: 'TDS प्रमाणपत्र सहमति', ta: 'TDS சான்றிதழ் ஒப்புதல்' }, detail: { en: 'Share TDS certificates for proof of tax deduction.', hi: 'कर कटौती के प्रमाण के लिए।', ta: 'வரி கழிவின் ஆதாரத்திற்கு.' }, dpdpa: 'Sec 6' },
      ]},
      { field: { en: 'Form 16A Records', hi: 'फॉर्म 16A रिकॉर्ड', ta: 'படிவம் 16A பதிவுகள்' }, consents: [
        { id: '13-4', type: 'Optional', mandatory: false, label: { en: 'Form 16A consent', hi: 'फॉर्म 16A सहमति', ta: 'படிவம் 16A ஒப்புதல்' }, detail: { en: 'Share Form 16A records for annual tax reconciliation.', hi: 'वार्षिक कर सामंजस्य के लिए।', ta: 'வருடாந்த வரி சரிசெய்தலுக்கு.' }, dpdpa: 'Sec 6' },
      ]},
    ],
  },
  {
    id: 14,
    title: { en: 'Regulatory Compliance Data', hi: 'नियामक अनुपालन डेटा', ta: 'ஒழுங்குமுறை இணக்கம் தரவு' },
    purpose: {
      en: 'International compliance with FATCA, CRS, sanctions screening, and anti-money laundering protocols.',
      hi: 'FATCA, CRS, प्रतिबंध स्क्रीनिंग और मनी लॉन्ड्रिंग विरोधी प्रोटोकॉल के साथ अंतरराष्ट्रीय अनुपालन।',
      ta: 'FATCA, CRS, தடுப்பு சோதனை மற்றும் பணம் சஜீவம் எதிர்ப்பு நடைமுறைகளுடன் சர்வதேச இணக்கம்.',
    },
    elements: [
      { field: { en: 'FATCA Declaration', hi: 'FATCA घोषणा', ta: 'FATCA அறிவிப்பு' }, consents: [
        { id: '14-1', type: 'Regulatory', mandatory: true, label: { en: 'FATCA declaration consent', hi: 'FATCA घोषणा सहमति', ta: 'FATCA அறிவிப்பு ஒப்புதல்' }, detail: { en: 'Provide FATCA declaration for international compliance.', hi: 'अंतरराष्ट्रीय अनुपालन के लिए।', ta: 'சர்வதேச இணக்கத்திற்கு.' }, dpdpa: 'Sec 7(a)' },
      ]},
      { field: { en: 'CRS Self-Certification', hi: 'CRS स्व-प्रमाणीकरण', ta: 'CRS தானாகச் சான்றிதழ்' }, consents: [
        { id: '14-2', type: 'Regulatory', mandatory: true, label: { en: 'CRS self-certification consent', hi: 'CRS स्व-प्रमाणीकरण सहमति', ta: 'CRS தானாகச் சான்றிதழ் ஒப்புதல்' }, detail: { en: 'Provide CRS self-certification for global tax reporting.', hi: 'वैश्विक कर रिपोर्टिंग के लिए।', ta: 'உலகளாவிய வரி அறிக்கையிடலுக்கு.' }, dpdpa: 'Sec 7(a)' },
      ]},
      { field: { en: 'Politically Exposed Person Status', hi: 'PEP स्थिति', ta: 'PEP நிலை' }, consents: [
        { id: '14-3', type: 'Optional', mandatory: false, label: { en: 'PEP status consent', hi: 'PEP स्थिति सहमति', ta: 'PEP நிலை ஒப்புதல்' }, detail: { en: 'Share PEP status for risk assessment and AML controls.', hi: 'जोखिम मूल्यांकन और AML के लिए।', ta: 'ஆபத்து மதிப்பீடு மற்றும் AML கட்டுப்பாடுகளுக்கு.' }, dpdpa: 'Sec 6' },
      ]},
      { field: { en: 'Sanctions Screening Data', hi: 'प्रतिबंध स्क्रीनिंग डेटा', ta: 'தடை சோதனை தரவு' }, consents: [
        { id: '14-4', type: 'Optional', mandatory: false, label: { en: 'Sanctions screening consent', hi: 'प्रतिबंध स्क्रीनिंग सहमति', ta: 'தடை சோதனை ஒப்புதல்' }, detail: { en: 'Provide sanctions screening data for compliance checks.', hi: 'अनुपालन जाँच के लिए।', ta: 'இணக்க சோதனைகளுக்கு.' }, dpdpa: 'Sec 6' },
      ]},
    ],
  },
];

/* ─────────────────────────────────────────────
   COMPONENT
───────────────────────────────────────────── */
export default function ConsentForm({ onConsentSubmit, onDashboardLogin }) {
  const [lang, setLang] = useState('en');
  const [isMinor, setIsMinor] = useState(false);
  const [guardian, setGuardian] = useState({ name: '', relation: '', phone: '', email: '' });
  const [guardianAgreements, setGuardianAgreements] = useState({ c1: false, c2: false });
  const [selected, setSelected] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [consentId, setConsentId] = useState('');
  const [errors, setErrors] = useState([]);

  const u = UI[lang] || UI.en;
  const L = (obj) => obj?.[lang] || obj?.en || obj;

  /* ── Helpers ── */
  const toggle = (id) => setSelected((prev) => ({ ...prev, [id]: !prev[id] }));

  const setCategoryAll = (cat, checked) => {
    const next = { ...selected };
    cat.elements.forEach((el) =>
      el.consents.forEach((c) => (next[c.id] = checked))
    );
    setSelected(next);
  };

  const categoryAllSelected = (cat) =>
    cat.elements.every((el) => el.consents.every((c) => !!selected[c.id]));

  const allMandatoryIds = CATEGORIES.flatMap((cat) =>
    cat.elements.flatMap((el) =>
      el.consents.filter((c) => c.mandatory).map((c) => c.id)
    )
  );

  const mandatoryDone = allMandatoryIds.filter((id) => !!selected[id]).length;
  const mandatoryTotal = allMandatoryIds.length;
  const progressPct = mandatoryTotal ? Math.round((mandatoryDone / mandatoryTotal) * 100) : 0;

  /* ── Submit Handler ── */
  const handleSubmit = () => {
    const errs = [];

    if (isMinor) {
      if (!guardian.name || !guardian.relation || !guardian.phone || !guardian.email) {
        errs.push(u.guardianInfoMissing);
      }
      if (!guardianAgreements.c1 || !guardianAgreements.c2) {
        errs.push(u.guardianConsentMissing);
      }
    }

    const missing = CATEGORIES.flatMap((cat) =>
      cat.elements.flatMap((el) =>
        el.consents
          .filter((c) => c.mandatory && !selected[c.id])
          .map((c) => `${L(el.field)} → ${L(c.label)}`)
      )
    );

    if (missing.length) {
      errs.push(u.missingRequired, ...missing.map((m) => `• ${m}`));
    }

    if (errs.length) {
      setErrors(errs);
      return;
    }

    setErrors([]);
    const id = 'AUDIX-' + Math.random().toString(36).substr(2, 9).toUpperCase();
    setConsentId(id);
    setSubmitted(true);

    if (onConsentSubmit) {
      onConsentSubmit({ id, selected, lang, isMinor, guardian });
    }
  };

  return (
    <div className="consent-root">
      <div className="consent-overlay" />

      <div className="consent-container">
		
        {/* HEADER */}
<div className="glass-card header-card">
  <div className="flex items-center gap-4">
    {/* Company Logo */}
    <img 
      src="/audix-logo.png" 
      alt="Audix" 
      className="h-10 w-auto"
    />
    
    <div>
      <h1 className="text-3xl font-bold text-white tracking-tighter">Consent Form</h1>
      <p className="text-slate-300 text-sm mt-0.5">{u.subtitle}</p>
    </div>
  </div>

  <div className="flex items-center gap-4">
    {/* Language Dropdown - Professional */}
    <div className="relative">
      <select 
        value={lang} 
        onChange={(e) => setLang(e.target.value)}
        className="bg-white/10 border border-white/30 text-white px-4 py-2.5 rounded-xl text-sm font-medium focus:outline-none focus:border-white/50 appearance-none pr-8 cursor-pointer"
      >
        {Object.entries(LANGUAGES).map(([k, v]) => (
          <option key={k} value={k} className="text-black">
            {k === 'en' ? '🇬🇧' : '🇮🇳'} {v}
          </option>
        ))}
      </select>
    </div>

    {/* Secure Session */}
    <div className="secure-pill">
      <span className="dot" /> {u.secure}
    </div>

  </div>
</div>
{/* DPO Bar */}
{onDashboardLogin && (
  <div className="dpo-bar glass-card p-5 flex items-center justify-between">
    <span className="text-slate-700 leading-relaxed">
      {u.dpoAccessText}
    </span>
    <button 
      onClick={onDashboardLogin}
      className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-xl transition-all"
    >
      {u.dpoLogin}
    </button>
  </div>
)}
        <div className="main-grid">
          {/* LEFT SIDEBAR */}
          <aside>
            {/* Notice + Language */}
            <div className="side-card">
              <div className="notice-row">
                <h2 className="card-title">{u.noticeTitle}</h2>
                
              </div>
              <p className="card-body">{u.noticeBody}</p>
            </div>

            {/* Age Verification */}
            <div className="side-card">
              <h3 className="card-title">{u.ageTitle}</h3>
              <label className="radio-label">
                <input type="radio" checked={!isMinor} onChange={() => setIsMinor(false)} />
                {u.ageAdult}
              </label>
              <label className="radio-label">
                <input type="radio" checked={isMinor} onChange={() => setIsMinor(true)} />
                {u.ageMinor}
              </label>
            </div>

           
           {/* Guardian Section - with extra spacing */}
			{isMinor && (
			<div className="guardian-card glass-card mt-6">
				<div className="guardian-title">👪 {u.guardianTitle}</div>
				
				<div className="guardian-grid">
				{[
					{ key: 'name', label: u.guardianName, type: 'text' },
					{ key: 'relation', label: u.guardianRelation, type: 'text' },
					{ key: 'phone', label: u.guardianPhone, type: 'tel' },
					{ key: 'email', label: u.guardianEmail, type: 'email' },
				].map(({ key, label, type }) => (
					<div key={key}>
					<label className="guardian-label">
						{label} <span className="text-red-500">*</span>
					</label>
					<input
						type={type}
						value={guardian[key]}
						onChange={(e) => setGuardian(prev => ({ ...prev, [key]: e.target.value }))}
						className="guardian-input"
						placeholder={label}
					/>
					</div>
				))}
				</div>

				{[{ key: 'c1', text: u.guardianC1 }, { key: 'c2', text: u.guardianC2 }].map(({ key, text }) => (
				<label key={key} className="guardian-check-row">
					<input
					type="checkbox"
					checked={guardianAgreements[key]}
					onChange={(e) => setGuardianAgreements(prev => ({ ...prev, [key]: e.target.checked }))}
					/>
					<span>{text}</span>
				</label>
				))}
			</div>
			)}
          </aside>

          {/* MAIN CONTENT */}
          <main>
            <div className="main-panel">
              <div className="main-header">
                
                <span className="cat-count">{u.categoryCount(CATEGORIES.length)}</span>
              </div>

              {/* Errors */}
              {errors.length > 0 && (
                <div className="error-box">
                  {errors.map((e, i) => (
                    <div key={i} className="error-line">{e}</div>
                  ))}
                </div>
              )}

			{/* Data Collection Categories Header + Select All on Right */}
<div className="flex items-center justify-between mb-6">
  <div>
    <h2 className="text-2xl font-semibold">{u.categoryHeader}</h2>
    <p className="text-slate-500 mt-1">Scroll through all {CATEGORIES.length} categories below</p>
  </div>

  {/* Select All Categories - Right Side */}
  <label className="overall-select-all flex items-center gap-3 cursor-pointer">
    <input
      type="checkbox"
      checked={CATEGORIES.length > 0 && 
               CATEGORIES.every(cat => 
                 cat.elements.every(el => 
                   el.consents.every(c => !!selected[c.id])
                 )
               )}
      onChange={(e) => {
        const isChecked = e.target.checked;
        const newSelected = {};
        CATEGORIES.forEach(cat => {
          cat.elements.forEach(el => {
            el.consents.forEach(c => {
              newSelected[c.id] = isChecked;
            });
          });
        });
        setSelected(newSelected);
      }}
    />
    <span className="font-medium">{u.selectAllCategories}</span>
  </label>
</div>
			
              {/* Categories Scroll Area */}
              <div className="scroll-area">
                {CATEGORIES.map((cat) => (
                  <div key={cat.id} className="cat-card">
                    <div className="cat-top">
                      <div className="cat-title-row">
                        <label className="select-all-label">
                          <input
                            type="checkbox"
                            checked={categoryAllSelected(cat)}
                            onChange={(e) => setCategoryAll(cat, e.target.checked)}
                          />
                          {u.selectAll}
                        </label>
                        <span className="cat-title">{L(cat.title)}</span>
                      </div>
                      <p className="cat-purpose">{L(cat.purpose)}</p>
                      
                    </div>

                    {cat.elements.map((el) => (
                      <div key={el.field.en} className="field-block">
                        <div className="field-name">{L(el.field)}</div>
                        {el.consents.map((c) => {
                          const isChecked = !!selected[c.id];
                          return (
                            <div
                              key={c.id}
                              className={`consent-row ${isChecked ? 'checked' : ''}`}
                              onClick={() => toggle(c.id)}
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => toggle(c.id)}
                                onClick={(e) => e.stopPropagation()}
                                className="consent-check"
                              />
                              <div className="consent-info">
                                <div className="consent-label-row">
                                  <span className="consent-label">
                                    {L(c.label)}
                                    {c.mandatory && <span className="mandatory-star"> *</span>}
                                  </span>
                                </div>
                                <p className="consent-detail">{L(c.detail)}</p>
                                <div className="consent-footer">
                                <span className="type-badge">
									{L(u.type?.[c.type] || c.type)}
								</span>
                                    
                                  
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                ))}
              </div>

              {/* Progress */}
              <div className="progress-wrap">
                <div className="progress-track">
                  <div className="progress-fill" style={{ width: `${progressPct}%` }} />
                </div>
                <div className="progress-text">
                  {mandatoryDone} / {mandatoryTotal} mandatory consents given ({progressPct}%)
                </div>
              </div>

              {/* Footer Submit Bar */}
              <div className="footer-bar">
                <div className="footer-left">
                  <div className="footer-check">✓</div>
                  <div>
                    <div className="footer-title">{u.summaryTitle}</div>
                    <div className="footer-sub">{u.summarySub}</div>
                  </div>
                </div>
                <button className="submit-btn" onClick={handleSubmit}>
                  {u.submit}
                </button>
              </div>
            </div>
          </main>
        </div>
      </div>

      {/* SUCCESS MODAL */}
      {submitted && (
        <div className="success-overlay">
          <div className="success-card">
            <div className="success-icon"></div>
            <div className="success-title">{u.successTitle}</div>
            <p className="success-body">{u.successBody}</p>
            <div className="success-id">{u.consentId}: {consentId}</div>
            <button className="success-btn" onClick={() => setSubmitted(false)}>
              {u.close}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}