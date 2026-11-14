# CodeLens AI – Intelligent Code Reviewer

An AI-powered code review tool that helps developers identify bugs, understand potential issues, and improve code quality using Google Gemini.

## Overview

CodeLens AI is a web-based code review application built with Next.js and the Google Gemini API. Developers can paste their source code, select a programming language, and receive an AI-generated review with explanations, suggested improvements, and complexity analysis.

The goal is to make code reviews easier to understand, especially for students and developers who want to improve their programming skills.

## Features

- **AI-Powered Code Review:** Analyze source code using Google Gemini.
- **Bug Detection:** Identify potential bugs, logical errors, and runtime issues.
- **Code Improvements:** Receive suggestions for better readability and maintainability.
- **Complexity Analysis:** Understand the time and space complexity of algorithms.
- **Multiple Languages:** Supports Java, Python, C, C++, JavaScript, TypeScript, Go, and PHP.
- **Streaming Responses:** Display AI-generated reviews as they arrive.
- **Input Validation:** Handle empty submissions, unsupported languages, and oversized code.
- **Copy Review:** Copy generated feedback for future reference.
- **Responsive Interface:** Use the application across desktop and mobile devices.

## Tech Stack

| Technology | Purpose |
|---|---|
| Next.js | Frontend and backend framework |
| React | User interface |
| TypeScript | Type-safe development |
| Google Gemini API | AI-powered code analysis |
| Google GenAI SDK | Gemini API integration |
| Tailwind CSS | Styling support |
| Lucide React | Interface icons |

## Project Structure

```text
codelens-ai/
│
├── src/
│   └── app/
│       ├── api/
│       │   └── review/
│       │       └── route.ts
│       │
│       ├── globals.css
│       ├── layout.tsx
│       └── page.tsx
│
├── public/
├── .env.example
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

## Getting Started

Follow these instructions to run CodeLens AI locally.

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/codelens-ai.git
```

### 2. Navigate to the Project

```bash
cd codelens-ai
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Configure the Gemini API Key

Create a `.env.local` file in the root directory of the project.

Add your Groq API key:

```env
GROQ_API_KEY=your_groq_api_key
```

Get an API key from [Groq API]((https://console.groq.com/keys)).

**Important:** Never expose your API key in frontend code or commit `.env.local` to GitHub.

### 5. Start the Development Server

```bash
npm run dev
```

Open the application in your browser:

```text
http://localhost:3000
```

## How It Works

1. Select a programming language.
2. Paste your source code into the editor.
3. Click the Review My Code button.
4. The frontend sends the code and selected language to the backend API.
5. The backend validates the input and sends the review request to Google Gemini.
6. Gemini generates the analysis.
7. The application streams the generated response to the results panel.

## API Endpoint

**POST** `/api/review`

The application uses this endpoint to process code review requests.

### Request Body

```json
{
  "language": "Java",
  "code": "public class Main { ... }"
}
```

### Response

The endpoint streams the AI-generated code review as plain text.

The review includes:

- Overall Assessment
- Bugs and Potential Issues
- Suggested Improvements
- Time Complexity
- Space Complexity
- Improved Code

## Environment Variables

| Variable | Description |
|---|---|
| `GEMINI_API_KEY` | Google Gemini API key |

## Future Improvements

- Syntax highlighting in the code editor.
- Markdown-rendered AI responses.
- Bug severity classification.
- Downloadable code review reports.
- Review history and saved sessions.
- Support for additional programming languages.

## Deployment

CodeLens AI can be deployed using [Vercel](https://vercel.com/).

1. Import the GitHub repository into Vercel.
2. Configure the `GEMINI_API_KEY` environment variable.
3. Deploy the application.
4. Open the generated public URL.

## Disclaimer

AI-generated code reviews may not identify every issue or may occasionally provide incorrect suggestions. Always verify recommendations before using them in production code.

## Author

**Vigneshwaran V.**

Computer Science and Engineering Student

GitHub:https://github.com/VIGNESHWARAN-1249

---

Built as a project to explore AI integration, full-stack web development, and practical developer tools.
