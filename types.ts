export enum ToolCategory {
  CALCULATOR = 'Calculators',
  UTILITY = 'Utilities',
  AI_TEXT = 'AI Text & Search',
  AI_MEDIA = 'AI Media (Image/Video)',
  LIVE = 'Live Voice',
  CAMERA = 'Camera & GPS'
}

export interface ToolDefinition {
  id: string;
  name: string;
  description: string;
  icon: any; // Lucide icon component
  category: ToolCategory;
  path: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  sources?: Array<{
    uri: string;
    title: string;
  }>;
}

export interface ExpenseItem {
  id: string;
  name: string;
  amount: number;
  category: string;
}
