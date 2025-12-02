export interface PromptOption {
  id: string;
  label: string;
  value: string;
}

// Default values, but users can add more
export const DEFAULT_DASHBOARD_BLOCKS = [
  'Sidebar',
  'Main Content',
  'Footer',
  'Modal',
  'Toolbar'
];

export const DEFAULT_CLIENT_PLATFORMS = [
  'Web',
  'iOS',
  'Android',
  'Desktop',
  'API'
];

export interface PromptData {
  id: string;
  nameUA: string;
  nameEN: string; // Must be snake_case
  content: string;
  hint: string;
  dashboardBlocks: string[];
  clients: string[];
  options: PromptOption[];
  createdAt: number;
}

export type PromptSortField = 'nameUA' | 'nameEN' | 'createdAt';
