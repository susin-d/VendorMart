import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Mic, MicOff } from "lucide-react";
import { useSpeechRecognition } from "@/hooks/use-speech";
import { useToast } from "@/hooks/use-toast";

interface VoiceInputProps {
  onResult: (text: string) => void;
}

export default function VoiceInput({ onResult }: VoiceInputProps) {
  const { isListening, transcript, isSupported, startListening, stopListening, resetTranscript } = useSpeechRecognition();
  const { toast } = useToast();

  useEffect(() => {
    if (transcript) {
      onResult(transcript);
      resetTranscript();
    }
  }, [transcript, onResult, resetTranscript]);

  const handleClick = () => {
    if (!isSupported) {
      toast({
        title: "Not Supported",
        description: "Speech recognition is not supported in this browser",
        variant: "destructive",
      });
      return;
    }

    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  return (
    <Button 
      onClick={handleClick}
      className={`vendormate-button-accent ${isListening ? 'recording' : ''}`}
      disabled={!isSupported}
    >
      {isListening ? <MicOff size={16} /> : <Mic size={16} />}
    </Button>
  );
}
