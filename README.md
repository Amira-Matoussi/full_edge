# Voice AI Assistant

This project is a web-based voice-to-voice AI assistant built with Next.js for the frontend and a Python FastAPI server for the local Large Language Model (LLM) backend. It leverages browser-based speech recognition and text-to-speech capabilities, with a fallback to Groq API for LLM inference if a local model is not available.

## Features

*   **Voice-to-Voice Interaction**: Speak to the AI assistant and receive spoken responses.
*   **Multilingual Support**: Currently supports English (en-US), French (fr-FR), and Arabic (ar-SA) for both speech recognition and synthesis.
*   **Contextual Memory**: The AI remembers previous turns in the conversation to provide more relevant responses.
*   **Local LLM Option**: Run a local LLM server using `llama-cpp-python` for privacy and reduced API costs.
*   **Groq API Fallback**: Automatically switches to Groq API if the local LLM server is not running or fails.
*   **Assistant Personalities**: Choose between different AI assistants (e.g., B2B or B2C specialized) with distinct system prompts.
*   **Responsive UI**: Designed to work across various devices.
*   **Admin Dashboard**: Basic dashboard to monitor conversation logs (currently client-side simulated).

## Prerequisites

Before you begin, ensure you have the following installed:

*   **Node.js** (LTS version recommended)
*   **npm** or **Yarn** (npm is used in examples)
*   **Python 3.8+**
*   **Git**

## Project Setup

### 1. Clone the Repository

\`\`\`bash
git clone [repository-url]
cd voice-ai-assistant
\`\`\`

### 2. Frontend Setup (Next.js)

Navigate to the project root directory.

#### Install Dependencies

\`\`\`bash
npm install
\`\`\`

#### Environment Variables

Create a `.env.local` file in the root directory based on the `.env.example` file.

\`\`\`plaintext
# .env.local
# Groq API Key (FREE tier available)
GROQ_API_KEY=your_groq_api_key_here

# Optional: OpenAI API Key (only needed for Whisper in API mode, not used by default)
# OPENAI_API_KEY=your_openai_api_key_here
\`\`\`

*   **`GROQ_API_KEY`**: Required for the AI assistant to function if the local LLM server is not used. Get one from [Groq](https://groq.com/).
*   **`OPENAI_API_KEY`**: Optional, only needed if you plan to integrate OpenAI's Whisper API for speech-to-text (not the default setup).

#### Run the Frontend

\`\`\`bash
npm run dev
\`\`\`

The Next.js frontend will be accessible at `http://localhost:3000`.

### 3. Backend Setup (Python Local LLM Server - Optional)

This step is optional. If you don't set up the local LLM server, the application will automatically fall back to using the Groq API (provided `GROQ_API_KEY` is set).

#### Create and Activate a Python Virtual Environment

It's highly recommended to use a virtual environment to manage Python dependencies.

\`\`\`bash
python -m venv venv
# On macOS/Linux:
source venv/bin/activate
# On Windows:
.\venv\Scripts\activate
\`\`\`

#### Install Python Dependencies

With your virtual environment activated, install the required Python packages:

\`\`\`bash
pip install -r requirements.txt
\`\`\`

#### Download LLM Model Weights

The `local_llm_server.py` is configured to use GGUF models via `llama-cpp-python`. You need to specify the path to your model.

1.  **Download a GGUF model**: Visit Hugging Face and download a GGUF model, for example, `TheBloke/Llama-2-7B-Chat-GGUF`. You'll typically download a `.gguf` file (e.g., `llama-2-7b-chat.Q4_K_M.gguf`).
2.  **Set `MODEL_PATH`**: Set an environment variable `MODEL_PATH` to the directory containing your downloaded `.gguf` model file.

    \`\`\`bash
    # Example on macOS/Linux:
    export MODEL_PATH="/path/to/your/downloaded/model/directory"

    # Example on Windows (in Command Prompt):
    set MODEL_PATH=C:\path\to\your\downloaded\model\directory
    \`\`\`

    *Note*: The `local_llm_server.py` expects the model file to be named `model.gguf` inside the `MODEL_PATH` directory, or you can modify the `model_path` argument in `llama_cpp.Llama` constructor in `local_llm_server.py` to point directly to your `.gguf` file. For example, if your model is `llama-2-7b-chat.Q4_K_M.gguf` in `/path/to/your/downloaded/model/directory`, you might set `MODEL_PATH` to `/path/to/your/downloaded/model/directory/llama-2-7b-chat.Q4_K_M.gguf`.

#### Run the Backend Server

With your virtual environment activated, run the FastAPI server:

\`\`\`bash
python local_llm_server.py
\`\`\`

The local LLM server will start on `http://localhost:8000`.

## Usage

1.  **Start both Frontend and Backend (if using local LLM)**:
    *   Open two terminal windows.
    *   In the first, run `npm run dev` (for the Next.js frontend).
    *   In the second, activate your Python virtual environment and run `python local_llm_server.py` (for the local LLM backend).
2.  **Access the Application**: Open your browser and go to `http://localhost:3000`.
3.  **Choose an Assistant**: On the assistant selection page, choose either "Slah" (B2B) or "Amira" (B2C).
4.  **Start Talking**: Click on the assistant's avatar to start speaking. The application will use your browser's speech recognition.
5.  **Interact**: Speak your query, and the AI will respond verbally.
6.  **Change Language**: Use the language dropdown in the navigation bar to switch between English, French, and Arabic.

## Troubleshooting

*   **"Speech recognition is not supported"**: Ensure you are using a compatible browser (Chrome, Edge, Safari).
*   **"Microphone permission denied"**: Check your browser settings and grant microphone access to `localhost:3000`.
*   **Local LLM not responding**:
    *   Ensure the Python server is running (`http://localhost:8000`).
    *   Check the Python server logs for any errors during model loading.
    *   Verify that `MODEL_PATH` environment variable is correctly set and points to a valid GGUF model.
    *   If you encounter memory errors, try a smaller model or adjust `n_ctx` in `local_llm_server.py`.
*   **No AI response (even with Groq)**:
    *   Check your `GROQ_API_KEY` in `.env.local`.
    *   Verify network connectivity.
    *   Check the browser's developer console for API errors.

## Future Enhancements

*   **Database Integration**: Persist conversation logs and user settings using a database (e.g., PostgreSQL, MongoDB).
*   **User Authentication**: Implement user login/signup to personalize experiences and manage conversation history per user.
*   **More LLM Integrations**: Add support for other AI providers like OpenAI, Azure AI, or custom endpoints.
*   **Advanced Voice Features**: Implement voice activity detection (VAD) for more natural turn-taking.
*   **Customizable Assistants**: Allow users to create and customize their own AI assistant personalities.
*   **Real-time Transcription Display**: Show the user's transcription in real-time as they speak.
