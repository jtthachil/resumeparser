export const SUPPORTED_FILE_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
];

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export const PARSING_MODES = {
  LLM: 'llm' as const,
  RULES: 'rules' as const
};

export const AZURE_CONFIG = {
  apiKey: import.meta.env.VITE_AZURE_OPENAI_API_KEY || 'your-azure-openai-api-key',
  endpoint: import.meta.env.VITE_AZURE_OPENAI_ENDPOINT || 'https://your-endpoint.openai.azure.com/',
  deploymentName: import.meta.env.VITE_AZURE_OPENAI_DEPLOYMENT || 'gpt-4',
  apiVersion: '2024-02-15-preview'
}; 