# Resume Parser

A modern, intelligent resume parsing tool built with React, TypeScript, and Azure OpenAI. Supports both AI-powered and rule-based parsing to extract structured data from PDF and DOCX resume files.

## Features

- **Dual Parsing Modes**: Switch between AI-powered (Azure OpenAI) and rule-based parsing
- **File Support**: Handles PDF and DOCX files up to 10MB
- **Structured Output**: Extracts contact info, experience, education, skills, and more
- **JSON Export**: Download parsed data as structured JSON
- **Modern UI**: Clean, responsive interface with drag-and-drop file upload
- **Real-time Processing**: Fast parsing with processing time indicators

## Live Demo

🔗 [View Live Application](https://resumeparser-josephs-projects-dc85e4ce.vercel.app/)

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS (custom implementation)
- **AI Integration**: Azure OpenAI GPT-4
- **File Processing**: PDF.js, Mammoth.js
- **Deployment**: Vercel

## Quick Start

### Prerequisites

- Node.js 18+ 
- Azure OpenAI API key and endpoint

### Installation

1. Clone the repository:
```bash
git clone https://github.com/jtthachil/resumeparser.git
cd resumeparser
```

2. Install dependencies:
```bash
npm install
```

3. Configure Azure OpenAI:
   - Update `src/config/constants.ts` with your Azure OpenAI credentials
   - Or set environment variables (see Configuration section)

4. Start development server:
```bash
npm run dev
```

## Configuration

### Azure OpenAI Setup

Update the configuration in `src/config/constants.ts`:

```typescript
export const AZURE_CONFIG = {
  apiKey: 'your-azure-openai-api-key',
  endpoint: 'https://your-endpoint.openai.azure.com/',
  deploymentName: 'your-deployment-name',
  apiVersion: '2024-02-15-preview'
};
```

### Environment Variables (Optional)

```bash
VITE_AZURE_OPENAI_API_KEY=your-api-key
VITE_AZURE_OPENAI_ENDPOINT=https://your-endpoint.openai.azure.com/
VITE_AZURE_OPENAI_DEPLOYMENT=your-deployment-name
```

## Usage

1. **Upload Resume**: Drag and drop or click to select a PDF/DOCX file
2. **Choose Parser**: Toggle between LLM (AI-powered) or Rules-based parsing
3. **Parse**: Click "Parse Resume" to extract data
4. **Review Results**: View structured data in organized sections
5. **Export**: Download the parsed data as JSON

## API Reference

### Parsing Methods

#### LLM Parser (`parseResumeWithLLM`)
- Uses Azure OpenAI GPT-4 for intelligent extraction
- Better at understanding context and nuanced information
- Handles complex resume formats and layouts

#### Rules Parser (`parseResumeWithRules`)
- Uses regex patterns and heuristics
- Faster processing, no API costs
- Good for standard resume formats

### Data Structure

```typescript
interface ParsedResume {
  contact: {
    name?: string;
    email?: string;
    phone?: string;
    location?: string;
    linkedin?: string;
    github?: string;
    website?: string;
  };
  summary?: string;
  experience: Experience[];
  education: Education[];
  skills: Skill[];
  projects?: Project[];
  certifications?: Certification[];
  languages?: Language[];
  achievements?: string[];
  interests?: string[];
}
```

## Development

### Project Structure

```
src/
├── components/          # React components
├── services/           # Parsing logic (LLM & Rules)
├── utils/              # File processing utilities
├── types/              # TypeScript type definitions
├── config/             # Configuration constants
└── styles/             # CSS and styling
```

### Key Components

- `FileUpload`: Handles file selection and validation
- `ParsingModeToggle`: Switches between parsing modes  
- `ParsedResults`: Displays parsed resume data
- `LLMParser`: Azure OpenAI integration
- `RulesParser`: Pattern-based extraction

### Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

## Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Manual Build

```bash
npm run build
# Upload dist/ folder to your hosting provider
```

## Troubleshooting

### Common Issues

1. **File Upload Popup**: Fixed in latest version - popup only appears when no file selected
2. **JSON Parsing Errors**: LLM responses are cleaned and validated automatically
3. **PDF Worker Issues**: Ensure correct PDF.js worker version (5.2.133)
4. **Tailwind CSS Errors**: Using custom CSS implementation instead of PostCSS

### Performance Tips

- Use Rules parser for faster processing
- Optimize file sizes before upload
- Enable browser caching for better UX

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Azure OpenAI for AI-powered parsing capabilities
- PDF.js for PDF text extraction
- Mammoth.js for DOCX processing
- React and TypeScript communities

## Contact

**Joseph Thomas Thachil**
- Email: josephthachil.mec@gmail.com
- GitHub: [@jtthachil](https://github.com/jtthachil)
- LinkedIn: [Joseph Thomas Thachil](https://linkedin.com/in/joseph-thomas-thachil)

---

⭐ Star this repo if you find it helpful!
