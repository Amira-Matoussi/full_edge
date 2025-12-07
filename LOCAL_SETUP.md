# Local LLM Setup Instructions

This guide will help you set up a local LLM server to replace the Groq API in the Voice AI Assistant project.

## Prerequisites

- Python 3.8+ installed
- CUDA-compatible GPU recommended (but CPU will work)
- At least 8GB RAM (16GB+ recommended)
- 10GB+ free disk space for model weights

## Setup Instructions

### 1. Install Python Dependencies

\`\`\`bash
# Create a virtual environment (recommended)
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
\`\`\`

### 2. Download Model Weights

You have several options:

#### Option A: Use Hugging Face Models

The script will automatically download models from Hugging Face.

#### Option B: Use Pre-downloaded Models

1. Download a model like Llama-2-7B-Chat-GGUF from Hugging Face
2. Set the MODEL_PATH environment variable to your local path

\`\`\`bash
# Example
export MODEL_PATH="/path/to/your/model"  # On Windows: set MODEL_PATH=C:\path\to\your\model
\`\`\`

### 3. Start the Local LLM Server

\`\`\`bash
python local_llm_server.py
\`\`\`

The server will start on http://localhost:8000

### 4. Start the Next.js Frontend

In a separate terminal:

\`\`\`bash
npm run dev
\`\`\`

## Recommended Models

For better performance on consumer hardware:

- **TheBloke/Llama-2-7B-Chat-GGUF**: Good balance of quality and speed
- **TheBloke/Mistral-7B-Instruct-v0.2-GGUF**: Excellent instruction following
- **TheBloke/TinyLlama-1.1B-Chat-v1.0-GGUF**: Very fast, lower quality

## Troubleshooting

- **Out of memory errors**: Try a smaller model or enable model quantization
- **Slow responses**: Ensure you're using CUDA if available
- **CUDA errors**: Update your GPU drivers and CUDA toolkit

## Advanced Configuration

Edit `local_llm_server.py` to adjust:

- Temperature (creativity)
- Max token length
- Model parameters
- CORS settings for frontend connection
