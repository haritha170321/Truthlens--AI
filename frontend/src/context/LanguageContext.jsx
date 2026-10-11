import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

export const translations = {
  en: {
    appName: 'TruthLens AI',
    tagline: 'Explainable Misinformation Analysis and Verification Platform',
    sdg16: 'SDG 16: Peace, Justice & Strong Institutions',
    sdg4: 'SDG 4: Quality Education',
    navHome: 'Home',
    navDashboard: 'Dashboard',
    navVerify: 'Verify Claim',
    navHistory: 'Audit History',
    navAnalytics: 'Analytics',
    navSaved: 'Bookmarks',
    navMethodology: 'Model Info & Methodology',
    navLogin: 'Sign In',
    navRegister: 'Get Started',
    outcomeSupporting: 'Supporting evidence found',
    outcomeConflicting: 'Conflicting evidence found',
    outcomeInsufficient: 'Insufficient evidence',
    outcomeContext: 'Context required',
    outcomeUnable: 'Unable to verify',
    inputPlaceholder: 'Enter headline, paste news body, social media forward, or URL...',
    analyzeBtn: 'Investigate Claim',
    extractClaimsBtn: 'Extract Factual Assertions',
    similarClaimsTitle: 'Similar Fact-Checked Claims',
    evidenceComparisonTitle: 'Interactive Evidence Comparison',
    spatialGraphTitle: '3D Evidence Relationship Topology',
    publicationTimelineTitle: 'Chronological Publication Timeline',
    epistemicDisclaimer: 'TruthLens AI communicates uncertainty and distinguishes retrieved evidence from automated inference. Semantic similarity does not imply factual equivalence.',
    exportPdf: 'Export Audit PDF',
    exportJson: 'Export JSON',
    exportMd: 'Export Markdown',
    feedbackPrompt: 'Help improve TruthLens AI verification accuracy',
    helpfulBtn: 'Evidence Corroborated',
    unhelpfulBtn: 'Disputed Findings',
    missingEvidenceBtn: 'Suggest Missing Source',
  },
  ta: {
    appName: 'ட்ரூத்லென்ஸ் AI (TruthLens AI)',
    tagline: 'விளக்கக்கூடிய தவறான தகவல் பகுப்பாய்வு மற்றும் சரிபார்ப்பு தளம்',
    sdg16: 'SDG 16: அமைதி, நீதி மற்றும் வலுவான நிறுவனங்கள்',
    sdg4: 'SDG 4: தரமான கல்வி மற்றும் பகுப்பாய்வு சிந்தனை',
    navHome: 'முகப்பு',
    navDashboard: 'டாஷ்போர்டு',
    navVerify: 'செய்தி சரிபார்ப்பு',
    navHistory: 'ஆய்வு வரலாறு',
    navAnalytics: 'புள்ளிவிவரங்கள்',
    navSaved: 'சேமிக்கப்பட்டவை',
    navMethodology: 'செயற்கை நுண்ணறிவு மாதிரிகள் & வழிமுறை',
    navLogin: 'உள்நுழைக',
    navRegister: 'தொடங்குக',
    outcomeSupporting: 'ஆதரிக்கும் சான்றுகள் கண்டறியப்பட்டன',
    outcomeConflicting: 'முரண்பாடான சான்றுகள் கண்டறியப்பட்டன',
    outcomeInsufficient: 'போதுமான சான்றுகள் இல்லை',
    outcomeContext: 'கூடுதல் சூழல் தேவைப்படுகிறது',
    outcomeUnable: 'சரிபார்க்க இயலவில்லை',
    inputPlaceholder: 'தலைப்பு, செய்தி உரை, வாட்ஸ்அப் தகவல் அல்லது இணைய முகவரியை உள்ளிடவும்...',
    analyzeBtn: 'தகவலை ஆராய்க',
    extractClaimsBtn: 'உண்மை கூற்றுகளை பிரித்தெடு',
    similarClaimsTitle: 'ஒத்த உண்மை சரிபார்க்கப்பட்ட கூற்றுகள்',
    evidenceComparisonTitle: 'சான்றுகள் ஒப்பீட்டு பலகை',
    spatialGraphTitle: '3D சான்றுகள் தொடர்பு மாதிரி',
    publicationTimelineTitle: 'வெளியீட்டு காலவரிசை',
    epistemicDisclaimer: 'ட்ரூத்லென்ஸ் AI உறுதியற்ற தன்மையை தெளிவாக தெரிவிக்கிறது. பொருளியல் ஒற்றுமை என்பது உண்மைக்கு சமமானது அல்ல.',
    exportPdf: 'PDF அறிக்கையை பதிவிறக்கு',
    exportJson: 'JSON பதிவிறக்கு',
    exportMd: 'Markdown பதிவிறக்கு',
    feedbackPrompt: 'சரிபார்ப்பு துல்லியத்தை மேம்படுத்த கருத்து தெரிவிக்கவும்',
    helpfulBtn: 'சான்றுகள் உறுதிசெய்யப்பட்டன',
    unhelpfulBtn: 'முரண்பட்ட முடிவுகள்',
    missingEvidenceBtn: 'புதிய ஆதாரத்தை பரிந்துரைக்க',
  }
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('truthlens_language') || 'en';
  });

  useEffect(() => {
    localStorage.setItem('truthlens_language', language);
  }, [language]);

  const toggleLanguage = (lang) => {
    setLanguage(lang);
  };

  const t = (key) => {
    return translations[language]?.[key] || translations['en'][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
