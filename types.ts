export enum AppStep {
  Hearing = 'hearing',
  Template = 'template',
  Editor = 'editor',
}

export interface ChatMessage {
  role: 'user' | 'model';
  parts: { text: string }[];
}

export interface HearingData {
  businessDescription?: string;
  sitePurpose?: string;
  targetAudience?: string;
  atmosphere?: string;
  companyName?: string;
  address?: string;
  phone?: string;
}

export interface TemplateSuggestion {
  templateName: 'Corporate' | 'Modern' | 'Friendly' | 'Tech' | 'Natural' | 'Retro' | 'Bold' | 'Luxury';
  reason: string;
}
