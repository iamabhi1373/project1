# Bolta-Guru: Voice-First AI Education Assistant

**Bolta-Guru** is a real-time, multilingual AI voice agent designed to bridge the literacy gap in education. By utilizing a "voice-first" approach, it enables learners—particularly those in rural areas or with low literacy levels—to interact with educational content, ask questions, and receive personalized guidance entirely through speech.

## 🚀 The Problem
A large portion of the population struggles to access quality education due to low literacy, language barriers, and a lack of personalized guidance. Traditional educational apps rely heavily on reading and writing, which creates a "digital divide" for millions of potential learners.

## 💡 The Solution
Bolta-Guru replaces complex text interfaces with a natural voice conversation. 
- **Voice-First:** No typing or reading required.
- **Context-Aware:** Remembers past student progress and struggles.
- **Multilingual:** Supports native Indian languages to make learning intuitive.
- **RAG-Powered:** Uses verified educational content rather than general internet data.

## 🛠 Tech Stack
- **Voice Orchestration:** [Vapi](https://vapi.ai) (Managing STT, TTS, and latency)
- **Vector Database:** [Qdrant](https://qdrant.tech) (Contextual memory and RAG)
- **Large Language Model:** GPT-4o / Claude 3.5
- **Backend:** Node.js / Express
- **STT/TTS Providers:** Deepgram & ElevenLabs (via Vapi)

## 🏗 System Architecture
1. **Audio Input:** User speaks to the agent via the Vapi web/mobile SDK.
2. **Processing:** Vapi streams the transcript to the backend server.
3. **Retrieval (RAG):** The backend generates embeddings and queries **Qdrant** to retrieve specific lesson context or student history.
4. **Generation:** The LLM synthesizes a response based on the retrieved context.
5. **Audio Output:** Vapi converts the text response to high-quality speech and streams it back to the user.

## 📂 Project Structure
```text
├── controllers/    # Request handling logic
├── data/           # Educational content/seed data
├── routes/         # API endpoints for Vapi webhooks
├── services/       # Qdrant & LLM integration logic
├── public/         # UI/Visualization components
├── server.js       # Entry point
└── .env            # API keys and config
```

## 🌟 Key Features
- **Persistent Memory:** Using Qdrant to store student progress so the "tutor" remembers you.
- **Adaptive Learning:** The AI adjusts its explanation depth based on the user's level.
- **Low-Latency:** Optimized voice-to-voice loops for a human-like experience.
- **Visual Feedback:** A simple waveform and live transcript UI for demo presentations.

## 🏁 Quick Start

### Prerequisites
- Node.js installed
- Vapi API Key
- Qdrant Cloud Cluster or Docker instance

### Installation
1. Clone the repo:
   ```bash
   git clone https://github.com/iamabhi1373/project1.git
   cd project1
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables:
   Create a `.env` file based on `.env.example`:
   ```env
   VAPI_API_KEY=your_key
   QDRANT_URL=your_url
   QDRANT_API_KEY=your_key
   ```
4. Run the server:
   ```bash
   npm start
   ```

## 🎙 Demo Scenario (1 Minute)
1. **Greeting:** AI greets the student by name and references the last topic (e.g., "Welcome back, Ramesh! Ready to continue with Solar Energy?").
2. **Interaction:** Student asks a question in Hindi/English.
3. **Retrieval:** System fetches the specific answer from the Qdrant database.
4. **Explanation:** AI explains the concept simply and asks a follow-up "Check for Understanding" question.

---
**Developed by Abhishek Kumar Gupta** *Final Year B.Tech CSE | Manipal University Jaipur*
