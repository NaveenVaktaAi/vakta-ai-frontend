# AI Chatbot Application

A full-stack AI chatbot application built with React TypeScript frontend and Python FastAPI backend, featuring real-time WebSocket communication and OpenAI integration via LangChain.

## Features

### Frontend (React + TypeScript)
- Modern, responsive chat interface with beautiful UI
- Real-time WebSocket communication
- Message persistence with localStorage
- Auto-reconnection with exponential backoff
- Message export functionality
- Copy message content
- Typing indicators
- Connection status monitoring
- Dark/light mode support

### Backend (Python + FastAPI)
- WebSocket server for real-time communication
- OpenAI integration via LangChain
- Conversation memory and context
- CORS support for frontend integration
- Health check endpoints
- Conversation reset functionality
- Error handling and logging

## Tech Stack

### Frontend
- **Next.js 14** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **shadcn/ui** for UI components
- **WebSocket API** for real-time communication

### Backend
- **FastAPI** for the web framework
- **WebSockets** for real-time communication
- **LangChain** for AI orchestration
- **OpenAI API** for language model
- **Python-dotenv** for environment management

## Setup Instructions

### Backend Setup

1. Navigate to the backend directory:
\`\`\`bash
cd backend
\`\`\`

2. Create a virtual environment:
\`\`\`bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\\Scripts\\activate
\`\`\`

3. Install dependencies:
\`\`\`bash
pip install -r requirements.txt
\`\`\`

4. Create environment file:
\`\`\`bash
cp .env.example .env
\`\`\`

5. Add your OpenAI API key to `.env`:
\`\`\`
OPENAI_API_KEY=your_actual_openai_api_key_here
MODEL_NAME=gpt-3.5-turbo
MAX_TOKENS=500
TEMPERATURE=0.7
\`\`\`

6. Run the backend server:
\`\`\`bash
python main.py
\`\`\`

The backend will start on `http://localhost:8000`

### Frontend Setup

1. Install dependencies:
\`\`\`bash
npm install
\`\`\`

2. Run the development server:
\`\`\`bash
npm run dev
\`\`\`

The frontend will start on `http://localhost:3000`

## Usage

1. Start the backend server first
2. Start the frontend development server
3. Open your browser to `http://localhost:3000`
4. Click "Connect" to establish WebSocket connection
5. Start chatting with the AI assistant!

## API Endpoints

- `GET /` - Root endpoint
- `GET /health` - Health check
- `WebSocket /ws/{client_id}` - WebSocket connection for chat
- `POST /reset/{client_id}` - Reset conversation for client

## Features in Detail

### Message Handling
- **Persistence**: Messages are saved to localStorage and restored on page reload
- **Export**: Export chat history as JSON file
- **Copy**: Copy individual messages to clipboard
- **Clear**: Reset conversation and clear history

### Connection Management
- **Auto-reconnect**: Automatic reconnection with exponential backoff
- **Status indicators**: Visual connection status with icons
- **Error handling**: Graceful error handling and user feedback

### AI Integration
- **Context awareness**: Maintains conversation context using LangChain memory
- **Customizable**: Easy to modify AI behavior via system prompts
- **Error resilience**: Handles API errors gracefully

## Customization

### Changing AI Model
Edit `backend/.env`:
\`\`\`
MODEL_NAME=gpt-4  # or any other OpenAI model
MAX_TOKENS=1000
TEMPERATURE=0.5
\`\`\`

### Styling
The frontend uses Tailwind CSS with a custom design system. Colors and styling can be modified in `app/globals.css`.

### System Prompt
Modify the AI behavior by editing the `system_prompt` in `backend/ai_service.py`.

## Troubleshooting

1. **Connection Issues**: Ensure backend is running on port 8000
2. **API Errors**: Check your OpenAI API key is valid and has credits
3. **CORS Issues**: Backend is configured for localhost:3000, modify if needed
4. **WebSocket Issues**: Check browser console for detailed error messages

## License

MIT License - feel free to use this project for your own applications!
