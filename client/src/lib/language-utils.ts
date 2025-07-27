// Language detection utility functions
export const detectLanguage = (text: string): string => {
  const commonWords = {
    es: ['hola', 'gracias', 'por favor', 'sí', 'no', 'qué', 'cómo', 'donde', 'cuando', 'que'],
    fr: ['bonjour', 'merci', 'oui', 'non', 'comment', 'que', 'où', 'quand', 'je', 'tu'],
    pt: ['olá', 'obrigado', 'obrigada', 'por favor', 'sim', 'não', 'que', 'como', 'onde', 'quando'],
    en: ['hello', 'thank', 'please', 'yes', 'no', 'what', 'how', 'where', 'when', 'the']
  };

  const lowerText = text.toLowerCase();
  const words = lowerText.split(/\s+/);
  
  const scores = {
    es: 0,
    fr: 0,
    pt: 0,
    en: 0
  };

  // Count matches for each language
  Object.entries(commonWords).forEach(([lang, langWords]) => {
    langWords.forEach(word => {
      if (words.includes(word) || lowerText.includes(word)) {
        scores[lang as keyof typeof scores]++;
      }
    });
  });

  // Find language with highest score
  const detectedLang = Object.entries(scores).reduce((a, b) => 
    scores[a[0] as keyof typeof scores] > scores[b[0] as keyof typeof scores] ? a : b
  )[0];

  // Return detected language or default to English
  return scores[detectedLang as keyof typeof scores] > 0 ? detectedLang : 'en';
};

// Mock translation function - in production, integrate with translation service
export const translateText = async (
  text: string, 
  targetLang: string, 
  sourceLang: string = 'auto'
): Promise<string> => {
  // If source and target are the same, return original text
  if (sourceLang === targetLang) {
    return text;
  }

  // Mock translations for common phrases
  const translations: Record<string, Record<string, string>> = {
    'hello': {
      es: 'hola',
      fr: 'bonjour',
      pt: 'olá'
    },
    'thank you': {
      es: 'gracias',
      fr: 'merci',
      pt: 'obrigado'
    },
    'yes': {
      es: 'sí',
      fr: 'oui',
      pt: 'sim'
    },
    'no': {
      es: 'no',
      fr: 'non',
      pt: 'não'
    }
  };

  const lowerText = text.toLowerCase();
  
  // Check for exact matches in our mock translations
  for (const [english, langTranslations] of Object.entries(translations)) {
    if (lowerText.includes(english)) {
      const translated = langTranslations[targetLang];
      if (translated) {
        return text.toLowerCase().replace(english, translated);
      }
    }
  }

  // For production, integrate with Google Translate API or similar service
  // For now, return text with language indicator
  if (targetLang !== 'en' && sourceLang !== targetLang) {
    return `[Translated to ${targetLang.toUpperCase()}] ${text}`;
  }

  return text;
};

// Get language display name
export const getLanguageName = (code: string): string => {
  const languageNames: Record<string, string> = {
    en: 'English',
    'en-US': 'English (US)',
    es: 'Español',
    'es-ES': 'Spanish',
    fr: 'Français',
    'fr-FR': 'French',
    pt: 'Português',
    'pt-BR': 'Portuguese (Brazil)',
  };

  return languageNames[code] || code.toUpperCase();
};

// Get browser's preferred language
export const getBrowserLanguage = (): string => {
  const lang = navigator.language || 'en-US';
  
  // Map browser language to our supported languages
  if (lang.startsWith('es')) return 'es-ES';
  if (lang.startsWith('fr')) return 'fr-FR';
  if (lang.startsWith('pt')) return 'pt-BR';
  
  return 'en-US';
};

// Check if language is supported for voice recognition
export const isVoiceLanguageSupported = (language: string): boolean => {
  const supportedLanguages = ['en-US', 'es-ES', 'fr-FR', 'pt-BR'];
  return supportedLanguages.includes(language);
};
