import { useState, useRef, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

export function useSpeechRecognition() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [isSupported, setIsSupported] = useState(false);
  const recognition = useRef<SpeechRecognition | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      
      if (SpeechRecognition) {
        setIsSupported(true);
        recognition.current = new SpeechRecognition();
        
        recognition.current.continuous = false;
        recognition.current.interimResults = false;
        recognition.current.lang = localStorage.getItem('voiceLanguage') || 'en-US';

        recognition.current.onstart = () => {
          setIsListening(true);
        };

        recognition.current.onresult = (event) => {
          const transcript = event.results[0][0].transcript;
          setTranscript(transcript);
          setIsListening(false);
        };

        recognition.current.onerror = (event) => {
          console.error('Speech recognition error:', event.error);
          setIsListening(false);
          
          let errorMessage = "Speech recognition failed";
          switch (event.error) {
            case 'no-speech':
              errorMessage = "No speech detected. Please try again.";
              break;
            case 'audio-capture':
              errorMessage = "Microphone not accessible. Please check permissions.";
              break;
            case 'not-allowed':
              errorMessage = "Microphone access denied. Please allow microphone access.";
              break;
            case 'network':
              errorMessage = "Network error. Please check your connection.";
              break;
          }
          
          toast({
            title: "Speech Recognition Error",
            description: errorMessage,
            variant: "destructive",
          });
        };

        recognition.current.onend = () => {
          setIsListening(false);
        };
      }
    }
  }, [toast]);

  const startListening = () => {
    if (recognition.current && !isListening) {
      try {
        recognition.current.start();
      } catch (error) {
        console.error('Failed to start speech recognition:', error);
        toast({
          title: "Error",
          description: "Failed to start voice recognition",
          variant: "destructive",
        });
      }
    }
  };

  const stopListening = () => {
    if (recognition.current && isListening) {
      recognition.current.stop();
    }
  };

  return {
    isListening,
    transcript,
    isSupported,
    startListening,
    stopListening,
    resetTranscript: () => setTranscript(""),
  };
}

// Global type declarations for Speech Recognition API
declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
  }
  
  interface SpeechRecognition extends EventTarget {
    continuous: boolean;
    grammars: SpeechGrammarList;
    interimResults: boolean;
    lang: string;
    maxAlternatives: number;
    serviceURI: string;
    
    start(): void;
    stop(): void;
    abort(): void;
    
    onaudiostart: ((this: SpeechRecognition, ev: Event) => any) | null;
    onaudioend: ((this: SpeechRecognition, ev: Event) => any) | null;
    onend: ((this: SpeechRecognition, ev: Event) => any) | null;
    onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => any) | null;
    onnomatch: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
    onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
    onsoundstart: ((this: SpeechRecognition, ev: Event) => any) | null;
    onsoundend: ((this: SpeechRecognition, ev: Event) => any) | null;
    onspeechstart: ((this: SpeechRecognition, ev: Event) => any) | null;
    onspeechend: ((this: SpeechRecognition, ev: Event) => any) | null;
    onstart: ((this: SpeechRecognition, ev: Event) => any) | null;
  }
  
  const SpeechRecognition: {
    prototype: SpeechRecognition;
    new(): SpeechRecognition;
  };
  
  interface SpeechRecognitionErrorEvent extends Event {
    error: string;
    message: string;
  }
  
  interface SpeechRecognitionEvent extends Event {
    resultIndex: number;
    results: SpeechRecognitionResultList;
  }
  
  interface SpeechRecognitionResultList {
    length: number;
    item(index: number): SpeechRecognitionResult;
    [index: number]: SpeechRecognitionResult;
  }
  
  interface SpeechRecognitionResult {
    length: number;
    item(index: number): SpeechRecognitionAlternative;
    [index: number]: SpeechRecognitionAlternative;
    isFinal: boolean;
  }
  
  interface SpeechRecognitionAlternative {
    transcript: string;
    confidence: number;
  }
  
  interface SpeechGrammarList {
    length: number;
    item(index: number): SpeechGrammar;
    [index: number]: SpeechGrammar;
    addFromURI(src: string, weight?: number): void;
    addFromString(string: string, weight?: number): void;
  }
  
  interface SpeechGrammar {
    src: string;
    weight: number;
  }
}

export {};
