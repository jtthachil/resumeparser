import OpenAI from 'openai';
import { AZURE_CONFIG } from '../config/constants';
import type { ParsedResume, ParseResult } from '../types/resume';

// Lazy initialization to prevent crashes at module load
let client: OpenAI | null = null;

function getClient(): OpenAI {
  if (!client) {
    client = new OpenAI({
      apiKey: AZURE_CONFIG.apiKey,
      baseURL: `${AZURE_CONFIG.endpoint}openai/deployments/${AZURE_CONFIG.deploymentName}`,
      defaultQuery: { 'api-version': AZURE_CONFIG.apiVersion },
      defaultHeaders: {
        'api-key': AZURE_CONFIG.apiKey,
      },
      dangerouslyAllowBrowser: true, // Allow browser usage for testing
    });
  }
  return client;
}

const RESUME_PARSING_PROMPT = `
You are an expert resume parser. Extract the following information from the resume text and return it as a valid JSON object with the exact structure specified below. Be thorough but accurate.

Required JSON structure:
{
  "contact": {
    "name": "string",
    "email": "string",
    "phone": "string",
    "location": "string",
    "linkedin": "string",
    "github": "string",
    "website": "string"
  },
  "summary": "string",
  "experience": [
    {
      "company": "string",
      "position": "string",
      "startDate": "string",
      "endDate": "string",
      "location": "string",
      "description": ["string array"],
      "current": boolean
    }
  ],
  "education": [
    {
      "institution": "string",
      "degree": "string",
      "field": "string",
      "startDate": "string",
      "endDate": "string",
      "gpa": "string",
      "location": "string"
    }
  ],
  "skills": [
    {
      "category": "string",
      "skills": ["string array"]
    }
  ],
  "projects": [
    {
      "name": "string",
      "description": "string",
      "technologies": ["string array"],
      "url": "string",
      "startDate": "string",
      "endDate": "string"
    }
  ],
  "certifications": [
    {
      "name": "string",
      "issuer": "string",
      "date": "string",
      "expiryDate": "string",
      "credentialId": "string"
    }
  ],
  "languages": [
    {
      "language": "string",
      "proficiency": "string"
    }
  ],
  "achievements": ["string array"],
  "interests": ["string array"]
}

Instructions:
1. Extract all available information accurately
2. Use null for missing fields
3. For dates, use formats like "MM/YYYY" or "Month YYYY"
4. Group skills into logical categories (e.g., "Programming Languages", "Frameworks", "Tools")
5. Split job descriptions into bullet points
6. Return ONLY the JSON object, no additional text
7. Ensure the JSON is valid and properly formatted
8. Make sure all strings are properly escaped and arrays are closed

Resume text:
`;

function cleanAndExtractJSON(response: string): string {
  let jsonString = response.trim();
  
  // Remove any markdown formatting
  if (jsonString.startsWith('```json')) {
    jsonString = jsonString.replace(/^```json\n?/, '').replace(/\n?```$/, '');
  } else if (jsonString.startsWith('```')) {
    jsonString = jsonString.replace(/^```\n?/, '').replace(/\n?```$/, '');
  }

  // Remove any leading/trailing text that's not JSON
  const jsonStart = jsonString.indexOf('{');
  const jsonEnd = jsonString.lastIndexOf('}');
  
  if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
    jsonString = jsonString.substring(jsonStart, jsonEnd + 1);
  }

  // Clean up common JSON issues
  jsonString = jsonString
    .replace(/\n/g, ' ')
    .replace(/\r/g, '')
    .replace(/\t/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  // Fix common JSON syntax issues
  // Replace unescaped quotes in strings
  jsonString = jsonString.replace(/: "([^"]*)"([^",}\]]*)"([^",}\]]*)"([^",}\]]*)",/g, ': "$1\\"$2\\"$3\\"$4",');
  
  // Fix trailing commas
  jsonString = jsonString.replace(/,(\s*[}\]])/g, '$1');
  
  // Fix missing quotes around property names
  jsonString = jsonString.replace(/([{,]\s*)(\w+)(\s*:)/g, '$1"$2"$3');

  return jsonString;
}

function createFallbackResponse(): ParsedResume {
  return {
    contact: {
      name: undefined,
      email: undefined,
      phone: undefined,
      location: undefined,
      linkedin: undefined,
      github: undefined,
      website: undefined
    },
    summary: undefined,
    experience: [],
    education: [],
    skills: [],
    projects: [],
    certifications: [],
    languages: [],
    achievements: [],
    interests: []
  };
}

export async function parseResumeWithLLM(resumeText: string): Promise<ParseResult> {
  const startTime = Date.now();
  
  try {
    // Debug configuration
    console.log('Azure Config Check:');
    console.log('- API Key present:', AZURE_CONFIG.apiKey ? 'Yes' : 'No');
    console.log('- API Key length:', AZURE_CONFIG.apiKey ? AZURE_CONFIG.apiKey.length : 0);
    console.log('- Endpoint:', AZURE_CONFIG.endpoint);
    console.log('- Deployment:', AZURE_CONFIG.deploymentName);
    console.log('- API Version:', AZURE_CONFIG.apiVersion);
    
    const client = getClient();
    console.log('OpenAI client created successfully');
    
    const response = await client.chat.completions.create({
      model: AZURE_CONFIG.deploymentName,
      messages: [
        {
          role: 'system',
          content: 'You are an expert resume parser that extracts structured information from resumes and returns valid JSON. Always return properly formatted JSON with no additional text.'
        },
        {
          role: 'user',
          content: RESUME_PARSING_PROMPT + resumeText
        }
      ],
      max_tokens: 3000,
      temperature: 0.1,
      top_p: 0.95
    });

    const result = response.choices[0]?.message?.content;
    
    if (!result) {
      throw new Error('No response from Azure OpenAI');
    }

    console.log('Raw LLM response length:', result.length);
    console.log('Raw response preview:', result.substring(0, 300) + '...');

    // Clean and extract JSON
    const jsonString = cleanAndExtractJSON(result);
    console.log('Cleaned JSON length:', jsonString.length);
    console.log('Cleaned JSON preview:', jsonString.substring(0, 300) + '...');

    let parsedData: ParsedResume;
    
    try {
      parsedData = JSON.parse(jsonString);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      console.log('Failed JSON:', jsonString);
      
      // Try to salvage what we can or provide fallback
      throw new Error(`JSON parsing failed: ${parseError instanceof Error ? parseError.message : 'Unknown JSON error'}`);
    }
    
    // Validate the structure
    if (!parsedData || typeof parsedData !== 'object') {
      throw new Error('Parsed data is not a valid object');
    }

    // Ensure required fields exist
    if (!parsedData.contact) parsedData.contact = createFallbackResponse().contact;
    if (!parsedData.experience) parsedData.experience = [];
    if (!parsedData.education) parsedData.education = [];
    if (!parsedData.skills) parsedData.skills = [];
    if (!parsedData.projects) parsedData.projects = [];
    if (!parsedData.certifications) parsedData.certifications = [];
    if (!parsedData.languages) parsedData.languages = [];
    if (!parsedData.achievements) parsedData.achievements = [];
    if (!parsedData.interests) parsedData.interests = [];
    
    const processingTime = Date.now() - startTime;

    return {
      success: true,
      data: parsedData,
      method: 'llm',
      processingTime
    };
  } catch (error) {
    console.error('LLM parsing error:', error);
    
    const processingTime = Date.now() - startTime;
    
    // Better error handling for different error types
    if (error instanceof Error) {
      // Network/Connection errors
      if (error.message.includes('fetch') || error.message.includes('network') || error.message.includes('ENOTFOUND')) {
        return {
          success: false,
          error: 'Connection error: Unable to reach Azure OpenAI service. Please check your internet connection and try again.',
          method: 'llm',
          processingTime
        };
      }
      
      // Authentication errors
      if (error.message.includes('401') || error.message.includes('unauthorized') || error.message.includes('invalid_api_key')) {
        return {
          success: false,
          error: 'Authentication error: Invalid API key or credentials. Please check your Azure OpenAI configuration.',
          method: 'llm',
          processingTime
        };
      }
      
      // Rate limiting
      if (error.message.includes('429') || error.message.includes('rate')) {
        return {
          success: false,
          error: 'Rate limit exceeded: Too many requests. Please wait a moment and try again.',
          method: 'llm',
          processingTime
        };
      }
      
      // JSON parsing errors
      if (error.message.includes('JSON')) {
        return {
          success: false,
          error: `LLM returned malformed JSON: ${error.message}. This is usually due to the AI model response being truncated or containing syntax errors.`,
          method: 'llm',
          processingTime,
          data: createFallbackResponse()
        };
      }
    }
    
    return {
      success: false,
      error: `Connection error: ${error instanceof Error ? error.message : 'Unknown error occurred'}`,
      method: 'llm',
      processingTime
    };
  }
} 