# LingoDocs - Multilingual Document Processing Platform

[![GitHub stars](https://img.shields.io/github/stars/Parth06102006/lingo-chat-flow)](https://github.com/Parth06102006/lingo-chat-flow/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/Parth06102006/lingo-chat-flow)](https://github.com/Parth06102006/lingo-chat-flow/network)
[![GitHub issues](https://img.shields.io/github/issues/Parth06102006/lingo-chat-flow)](https://github.com/Parth06102006/lingo-chat-flow/issues)
[![GitHub license](https://img.shields.io/github/license/Parth06102006/lingo-chat-flow)](https://github.com/Parth06102006/lingo-chat-flow)
[![GitHub last commit](https://img.shields.io/github/last-commit/Parth06102006/lingo-chat-flow)](https://github.com/Parth06102006/lingo-chat-flow/commits/main)

**LingoDocs** is a cutting-edge multilingual document processing platform that breaks language barriers in document analysis. Upload PDFs in any language, chat with AI about their content, and get instant translations to English - all in one seamless interface.

**Live Demo:** [lingo-chat-flow.vercel.app](https://lingo-chat-flow.vercel.app)

## ✨ Features

### 📄 Document Management
- **PDF Upload & Processing**: Upload PDFs in multiple languages with automatic language detection
- **Document Library**: Organize and manage your PDF collection with metadata
- **Preview & Navigation**: Built-in PDF viewer with page navigation and zoom controls

### 🤖 AI-Powered Chat
- **Conversational AI**: Chat with Google's Gemini AI about your document content
- **Context-Aware Responses**: AI responses include source citations with page references
- **Session Management**: Create and manage multiple chat sessions per document set
- **Chat History**: Persistent conversation history across sessions

### 🌍 Multilingual Support
- **Language Detection**: Automatic detection of document languages
- **Real-time Translation**: Translate any PDF page to English instantly using Google Translate API
- **Cross-Language Queries**: Ask questions in any language and get intelligent responses

### 🔐 Security & Authentication
- **User Authentication**: Secure login/signup with Supabase authentication
- **Protected Routes**: Role-based access control for user data
- **Data Privacy**: Secure handling of user documents and conversations

### 🎨 Modern UI/UX
- **Responsive Design**: Optimized for desktop and mobile devices
- **Dark/Light Theme**: Beautiful gradient-based design with smooth animations
- **Intuitive Interface**: Drag-and-drop file uploads, interactive chat, and visual feedback

## 🚀 Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

You need to have Node.js (v18+) and npm (or yarn) installed on your system.

- [Node.js](https://nodejs.org/) (v18 or higher)
- [npm](https://www.npmjs.com/get-npm) or [yarn](https://yarnpkg.com/)

### Installation

1. **Clone the repository:**
   ```sh
   git clone https://github.com/Parth06102006/lingo-chat-flow.git
   cd lingo-chat-flow
   ```

2. **Install dependencies:**
   ```sh
   npm install
   ```

3. **Environment Setup:**
   Create a `.env` file in the root directory and add the following environment variables:
   ```env
   VITE_BACKEND_URL=http://localhost:5000
   ```

4. **Start the development server:**
   ```sh
   npm run dev
   ```

5. **Build for production:**
   ```sh
   npm run build
   npm run preview
   ```

The application will be running on `http://localhost:5173` (Vite's default port).

## 📖 Usage

### Basic Workflow

1. **Sign Up/Login**: Create an account or log in with existing credentials
2. **Upload PDFs**: Upload PDF documents in any supported language
3. **Select Documents**: Choose which PDFs to include in your analysis
4. **Create Chat Session**: Start a new conversation session with selected documents
5. **Ask Questions**: Query the AI about document content in natural language
6. **Translate Content**: Use the translation feature to convert any page to English

### API Integration

The frontend communicates with a companion backend API (see [multilingual-file](../Multilingual-file/) repository) that provides:

- Document processing and storage
- AI chat functionality via Google Gemini
- Translation services
- User authentication via Supabase

## 🛠️ Tech Stack

### Frontend Framework
- **React 18** - Modern React with hooks and concurrent features
- **TypeScript** - Type-safe JavaScript for better development experience
- **Vite** - Fast build tool and development server

### UI & Styling
- **Tailwind CSS** - Utility-first CSS framework
- **ShadCN/UI** - High-quality React components built on Radix UI
- **Radix UI** - Accessible, unstyled UI primitives
- **Framer Motion** - Smooth animations and transitions
- **Lucide React** - Beautiful, consistent icons

### State Management & Data
- **TanStack Query** - Powerful data fetching and caching
- **React Router** - Client-side routing
- **Axios** - HTTP client for API communication

### Document Processing
- **React PDF** - PDF rendering and viewer component

### Development Tools
- **ESLint** - Code linting and formatting
- **PostCSS** - CSS processing and optimization
- **Autoprefixer** - CSS vendor prefixing

## 👤 Author

**Parth Garg** - *Full Stack Developer*

- **GitHub:** [@Parth06102006](https://github.com/Parth06102006)
- **Project Link:** [https://github.com/Parth06102006/lingo-chat-flow](https://github.com/Parth06102006/lingo-chat-flow)
- **Backend Link:** [https://github.com/Parth06102006/Multilingual-file](https://github.com/Parth06102006/Multilingual-file)
---

**Break Every Language Barrier with LingoDocs! 🌍📄**
