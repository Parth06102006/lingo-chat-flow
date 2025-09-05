# LingoDocs – Multilingual PDF Conversational AI Assistant

A simple AI-powered platform to upload multilingual PDFs, ask questions, and get answers with source references.

## What it does

- Upload PDFs (max 100 pages) and preview them
- Create chat sessions with titles
- Ask questions using text or voice input
- Get AI-powered answers that reference specific PDF pages
- Translate non-English PDF pages to English
- Click source references to jump to exact pages in PDF viewer

## Tech Stack

- **Frontend:** React, Tailwind CSS, Framer Motion
- **Backend:** Node.js, Express
- **Database:** MongoDB
- **File Storage:** Supabase (PDF bucket storage)
- **AI:** Google Gemini API
- **PDF Processing:** react-pdf-viewer

## Setup

1. Clone repo
2. Install dependencies: `npm install`
3. Set environment variables (MongoDB, Gemini API key, Supabase)
4. Run frontend: `npm run dev`
5. Run backend: `npm start`

## Features

- Dashboard for managing PDFs and sessions
- Voice-to-text question input
- Source-linked answers that scroll to PDF pages
- Inline page translation
- Session management with mandatory titles

Built using Gemini API for AI responses, MongoDB for data storage, and Supabase for PDF file storage.

Visit the Website [LingoDocs](https://lingo-chat-flow.vercel.app)
