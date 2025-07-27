import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Languages } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { MockVendor } from "@/lib/mockData";

interface LanguageSelectorProps {
  vendor: MockVendor | null;
}

const languages = [
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Español' },
  { value: 'fr', label: 'Français' },
  { value: 'pt', label: 'Português' },
];

const voiceLanguages = [
  { value: 'en-US', label: 'English (US)' },
  { value: 'es-ES', label: 'Spanish' },
  { value: 'fr-FR', label: 'French' },
  { value: 'pt-BR', label: 'Portuguese (Brazil)' },
];

export default function LanguageSelector({ vendor }: LanguageSelectorProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const updateMutation = useMutation({
    mutationFn: async (updates: Partial<MockVendor>) => {
      if (!vendor) throw new Error('No vendor');
      return { ...vendor, ...updates };
    },
    onSuccess: (updatedVendor) => {
      queryClient.setQueryData(['vendor'], updatedVendor);
      toast({
        title: "Settings Updated",
        description: "Language preferences saved successfully",
      });
    },
    onError: () => {
      toast({
        title: "Update Failed",
        description: "Unable to save language preferences",
        variant: "destructive",
      });
    },
  });

  const handleLanguageChange = (field: string, value: string | boolean) => {
    updateMutation.mutate({ [field]: value });
    
    // Update localStorage for voice language
    if (field === 'voiceLanguage') {
      localStorage.setItem('voiceLanguage', value as string);
    }
  };

  if (!vendor) return null;

  return (
    <Card className="vendormate-card">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center space-x-3">
          <Languages className="text-[--vendormate-accent]" size={24} />
          <span>Language Preferences</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="primary-language" className="text-sm text-gray-600">
            Primary Language:
          </Label>
          <Select
            value={vendor.primaryLanguage}
            onValueChange={(value) => handleLanguageChange('primaryLanguage', value)}
          >
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {languages.map((lang) => (
                <SelectItem key={lang.value} value={lang.value}>
                  {lang.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex items-center justify-between">
          <Label htmlFor="voice-language" className="text-sm text-gray-600">
            Voice Input Language:
          </Label>
          <Select
            value={vendor.voiceLanguage}
            onValueChange={(value) => handleLanguageChange('voiceLanguage', value)}
          >
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {voiceLanguages.map((lang) => (
                <SelectItem key={lang.value} value={lang.value}>
                  {lang.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex items-center justify-between">
          <Label htmlFor="auto-translate" className="text-sm text-gray-600">
            Auto-translate chat:
          </Label>
          <Switch
            id="auto-translate"
            checked={vendor.autoTranslate || false}
            onCheckedChange={(checked) => handleLanguageChange('autoTranslate', checked)}
          />
        </div>
      </CardContent>
    </Card>
  );
}
