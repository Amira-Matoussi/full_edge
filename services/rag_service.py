"""
RAG Service for RAG Server
Handles retrieval-augmented generation with multilingual support
"""
import glob
import json
from functools import lru_cache
from typing import List

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

try:
    import numpy as np
except ImportError:
    print("numpy not installed, RAG features will be limited")
    np = None

try:
    import faiss
except ImportError:
    print("faiss not installed, RAG features will be limited")
    faiss = None

try:
    from sentence_transformers import SentenceTransformer
except ImportError:
    print("sentence-transformers not installed, RAG features will be limited")
    SentenceTransformer = None

try:
    from groq import Groq
except ImportError:
    print("groq not installed, LLM features will be limited")
    Groq = None

from config import GROQ_API_KEY, LLM_MODEL, MAX_RESULTS, detect
from utils.text_utils import get_gender_aware_system_prompt


class ImprovedRAGSystem:
    """RAG system with multilingual support and gender-aware responses"""

    def __init__(self):
        self.embedding_model = None
        self.groq_client = None
        self.index = None
        self.chunks = []
        self.initialize_models()

    def initialize_models(self):
        """Initialize models with error handling"""
        try:
            print("Initializing embedding model...")
            self.embedding_model = SentenceTransformer("paraphrase-multilingual-MiniLM-L12-v2")
            print("✅ Embedding model loaded")
        except Exception as e:
            print(f"❌ Failed to load embedding model: {e}")
            return False

        if GROQ_API_KEY:
            try:
                self.groq_client = Groq(api_key=GROQ_API_KEY)
                print("✅ Groq client initialized")
            except Exception as e:
                print(f"❌ Failed to initialize Groq client: {e}")
        else:
            print("⚠️ GROQ_API_KEY not found")

        self.load_and_build_index()
        return True

    def load_multilingual_data(self):
        """Load data from all language folders and combine"""
        all_data = []

        # Try language-specific folders first
        for lang_folder in ["en", "fr", "ar"]:
            folder_path = f"./data/{lang_folder}/"
            files = glob.glob(f"{folder_path}use_case_*.json")

            for file in files:
                try:
                    with open(file, "r", encoding="utf-8") as f:
                        data = json.load(f)
                    if isinstance(data, list):
                        all_data.extend(data)
                    else:
                        all_data.append(data)
                    print(f"Loaded {file}")
                except Exception as e:
                    print(f"Error loading {file}: {e}")

        # Fallback to root data folder
        if not all_data:
            files = glob.glob("./data/use_case_*.json")
            for file in files:
                try:
                    with open(file, "r", encoding="utf-8") as f:
                        data = json.load(f)
                    if isinstance(data, list):
                        all_data.extend(data)
                    else:
                        all_data.append(data)
                    print(f"Loaded {file}")
                except Exception as e:
                    print(f"Error loading {file}: {e}")

        print(f"Total items loaded: {len(all_data)}")
        return all_data

    def create_chunks(self, data):
        """Create chunks like in your notebook"""
        chunks = []
        for i, entry in enumerate(data):
            # Build comprehensive text from entry
            text_parts = []
            for k, v in entry.items():
                if isinstance(v, (str, int, float)):
                    text_parts.append(f"{k}: {v}")
                elif isinstance(v, list):
                    text_parts.append(f"{k}: {', '.join(map(str, v))}")
                elif isinstance(v, dict):
                    for sub_k, sub_v in v.items():
                        text_parts.append(f"{k}_{sub_k}: {sub_v}")

            text = " | ".join(text_parts)

            # Create chunks (same size as your notebook)
            for j in range(0, len(text), 300):
                chunk_text = text[j:j+300]
                if len(chunk_text.strip()) > 50:
                    chunks.append({
                        "id": f"{i}_{j//300}",
                        "content": chunk_text,
                        "source": entry.get("service", f"doc_{i}")
                    })
        return chunks

    def load_and_build_index(self):
        """Load data and build single index like your notebook"""
        if not self.embedding_model:
            print("❌ Embedding model not available")
            return False

        try:
            print("Building RAG system...")

            # Load all multilingual data
            all_data = self.load_multilingual_data()
            if not all_data:
                print("No data found!")
                return False

            # Create chunks
            self.chunks = self.create_chunks(all_data)
            print(f"Created {len(self.chunks)} chunks")

            if not self.chunks:
                print("No chunks created!")
                return False

            # Build embeddings (same as your notebook)
            print("Building embeddings...")
            embeddings = self.embedding_model.encode(
                [c["content"] for c in self.chunks],
                batch_size=32,
                show_progress_bar=True
            )

            # Build FAISS index
            dim = embeddings.shape[1]
            self.index = faiss.IndexFlatL2(dim)
            self.index.add(np.array(embeddings).astype("float32"))

            print(f"RAG system ready: {len(self.chunks)} chunks, {dim} dimensions")
            return True

        except Exception as e:
            print(f"RAG build failed: {e}")
            return False

    def detect_language(self, query: str):
        """Enhanced language detection with fallbacks"""
        try:
            detected = detect(query)
            print(f"Raw detection result: {detected}")

            # Map common detection results to our supported languages
            language_mapping = {
                'en': 'en',
                'fr': 'fr',
                'ar': 'ar',
            }

            return language_mapping.get(detected, 'en')  # Default to English
        except Exception as e:
            print(f"Language detection failed: {e}")
            return "en"  # Default to English on failure

    def map_ui_language_to_response_language(self, ui_language: str) -> str:
        """Map UI language codes to response language codes"""
        language_map = {
            "en-US": "en",
            "fr-FR": "fr",
            "ar-SA": "ar"
        }
        return language_map.get(ui_language, "en")

    @lru_cache(maxsize=1000)
    def translate_query(self, query: str, target_lang="en"):
        """Translation function"""
        if not self.groq_client:
            return query

        try:
            response = self.groq_client.chat.completions.create(
                model="llama-3.1-70b-versatile",
                messages=[
                    {"role": "system", "content": f"Translate this into {target_lang} only, without explanations."},
                    {"role": "user", "content": query}
                ],
                temperature=0.0,
                max_tokens=200
            )
            return response.choices[0].message.content.strip()
        except Exception as e:
            print(f"Translation error: {e}")
            return query

    def search_context(self, query: str, top_k=MAX_RESULTS):
        """Search function"""
        if not self.index or not self.embedding_model:
            return []

        try:
            q_vec = self.embedding_model.encode([query])
            D, I = self.index.search(np.array(q_vec).astype("float32"), top_k)

            results = []
            for distance, idx in zip(D[0], I[0]):
                if idx < len(self.chunks):
                    results.append(self.chunks[idx]["content"])

            return results[:MAX_RESULTS]
        except Exception as e:
            print(f"Search error: {e}")
            return []

    def get_response(self, query: str, ui_language: str = "en-US", assistant_name: str = "Amira") -> str:
        """
        CORRECTED VERSION - Combines gender-aware prompts + full RAG context
        """
        if not self.groq_client:
            return self._get_fallback_response(ui_language)

        # Validate inputs
        if not query or not query.strip():
            return self._get_fallback_response(ui_language, "empty_query")

        if len(query) > 5000:
            query = query[:5000] + "..."

        # Determine assistant ID for gender-aware prompts
        assistant_id = 1 if assistant_name == "Slah" else 2

        # Map UI language to response language
        target_response_lang = self.map_ui_language_to_response_language(ui_language)
        print(f"🌍 UI Language: {ui_language} → Target Response: {target_response_lang}")

        # Check if conversation context
        is_conversation_context = "Previous conversation:" in query or ("User:" in query and "AI:" in query)

        if is_conversation_context:
            lines = query.split('\n')
            current_message = ""
            for line in lines:
                if line.startswith("Current user message:"):
                    current_message = line.replace("Current user message:", "").strip()
                    break
            search_query = current_message if current_message else query
            print(f"🔍 Using conversation context. Current message: {current_message[:50] if current_message else 'N/A'}...")
        else:
            search_query = query
            print(f"🔍 Single message query: {search_query[:50] if search_query else 'N/A'}...")

        # Detect language
        detected_lang = self.detect_language(search_query)
        print(f"🔍 Detected query language: {detected_lang}")

        # Translate if Arabic for better search
        if detected_lang == "ar":
            translated_search = self.translate_query(search_query, "en")
            print(f"🔄 Translated for search: {translated_search[:50] if translated_search else 'N/A'}...")
        else:
            translated_search = search_query

        # CRITICAL: SEARCH FOR CONTEXT
        context_results = self.search_context(translated_search)
        context = "\n".join(context_results)

        # Language instructions
        language_instructions = {
            "en": "Answer in English only. Be conversational and natural.",
            "fr": "Répondez uniquement en français. Soyez conversationnel et naturel.",
            "ar": "أجب باللغة العربية فقط. كن محاوراً وطبيعياً."
        }

        lang_instruction = language_instructions.get(target_response_lang, language_instructions["en"])

        # GET GENDER-AWARE BASE PROMPT
        base_prompt = get_gender_aware_system_prompt(assistant_id, ui_language)

        # BUILD FULL PROMPT WITH CONTEXT, CONVERSATION, AND GENDER-AWARE BASE
        if is_conversation_context:
            prompt = f"""{base_prompt}

LANGUAGE: {lang_instruction}

CONVERSATION SO FAR:
{query}

Behavior rules:
- Keep answers short.
- Speak like a call center agent, natural and concise.
- Do not over-explain.
- If unclear, briefly ask for clarification.

KNOWLEDGE BASE:
{context}

Customer asked: {search_query}"""
        else:
            prompt = f"""{base_prompt}

LANGUAGE: {lang_instruction}

KNOWLEDGE BASE:
{context}

Customer asked: {query}"""

        try:
            response = self.groq_client.chat.completions.create(
                model=LLM_MODEL,
                messages=[{"role": "user", "content": prompt}],
                max_tokens=500,
                temperature=0.0,
                timeout=30
            )

            result = response.choices[0].message.content.strip()

            if len(result) > 2000:
                result = result[:2000] + "... [Response truncated for clarity]"

            print(f"✅ Generated response from {assistant_name} in {target_response_lang}: {result[:50] if result else 'N/A'}...")
            return result if result else self._get_fallback_response(target_response_lang)

        except Exception as e:
            print(f"Groq API error: {e}")
            return self._get_fallback_response(target_response_lang, "api_error")

    def _get_fallback_response(self, ui_language: str, error_type: str = "general"):
        """Provide fallback responses based on language"""
        fallbacks = {
            "en-US": {
                "general": "I'm having technical difficulties. Please try again in a moment.",
                "empty_query": "I didn't receive your question clearly. Could you please repeat it?",
                "api_error": "I'm currently experiencing connectivity issues. Please try again shortly."
            },
            "fr-FR": {
                "general": "Je rencontre des difficultés techniques. Veuillez réessayer dans un moment.",
                "empty_query": "Je n'ai pas bien reçu votre question. Pourriez-vous la répéter?",
                "api_error": "Je rencontre actuellement des problèmes de connectivité. Veuillez réessayer bientôt."
            },
            "ar-SA": {
                "general": "أواجه مشاكل تقنية. يرجى المحاولة مرة أخرى.",
                "empty_query": "لم أستقبل سؤالك بوضوح. هل يمكنك إعادته؟",
                "api_error": "أواجه حاليًا مشاكل في الاتصال. يرجى المحاولة مرة أخرى قريبًا."
            }
        }

        lang = ui_language.split("-")[0] if "-" in ui_language else ui_language
        return fallbacks.get(ui_language, fallbacks.get(lang, fallbacks["en-US"])).get(error_type, fallbacks["en-US"]["general"])
