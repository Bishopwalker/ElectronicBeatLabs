# Electromagnetic Beat Lab (EBL)
> Real-time binaural beat therapy + electromagnetic field visualization for ADHD management and cognitive enhancement.

---

## How to Use

1. **Start** — Launch the app, select a frequency protocol (or go manual) and hit Play
2. **Listen** — Wear stereo headphones. The left/right channels carry different frequencies; your brain synthesizes the beat
3. **Visualize** — Watch the synchronized 3D EM field pattern in real-time (toroidal, vortex, spherical, standing wave)
4. **Session Timer** — Set duration (15–50 min). The app progresses through protocol stages automatically
5. **Customize** — Adjust carrier frequency, beat frequency, amplitude, and spatial audio panning mid-session

**Headphones are required** — binaural beats only work with channel-separated audio.

---

## AI Technology Stack

| Layer | Technology | Role |
|-------|-----------|------|
| **Audio Intelligence** | NumPy + SciPy (Python) | Mathematically precise binaural beat generation at ±0.1Hz accuracy |
| **RAG System** | ChromaDB + Sentence Transformers (`all-mpnet-base-v2`) | Semantic codebase search with 338 audio-domain-tuned chunks |
| **AI Dev Assistant** | Claude Code (Anthropic) | Active development agent — writes, tests, and deploys features |
| **Embedding Model** | `all-mpnet-base-v2` (768-dim) | Hybrid vector + TF-IDF retrieval with audio vocabulary expansion |
| **Protocol Engine** | Science-based frequency sequencing | Sterman/Lubar ADHD neurofeedback + Monroe Institute entrainment protocols |

---

## MCP & RAG Architecture

```
Claude Code (AI assistant)
       │
       ▼
  MCP Servers ──────────────────────────────────────────────
  ├── ebl-pipeline  →  lint, typecheck, tests, build, verify
  ├── ebl-deploy    →  Docker build, ECR push, ECS deploy
  ├── ebl-audio     →  frequency protocols, live session control
  └── docker        →  container lifecycle management
       │
       ▼
  RAG System (.claude/rag/)
  ├── 338 semantic code chunks (36% audio-domain)
  ├── ChromaDB vector store (768-dim embeddings)
  ├── Hybrid search: vector similarity + TF-IDF keyword
  ├── Audio query expansion: "frequency" → hz, hertz, oscillation
  └── ~50-200ms search latency, 20-40% better audio query precision
```

**MCP = Model Context Protocol** — gives the AI structured tool access to the pipeline, deployment, and audio systems instead of raw shell commands.

**RAG = Retrieval-Augmented Generation** — when Claude works on audio code, it retrieves the most relevant existing functions and patterns first, grounding responses in the actual codebase.

---

## Frontend / Backend Separation

```
FRONTEND (React + TypeScript)          BACKEND (FastAPI + Python)
──────────────────────────────         ─────────────────────────────
Port: 5173 (Vite dev server)           Port: 8000 (Uvicorn)
Served via: Nginx (production)         Served via: Docker container

React 18 + TypeScript 5                FastAPI 0.100+
Material-UI v5                         NumPy + SciPy (audio math)
React Three Fiber / Three.js           SQLite → PostgreSQL (prod)
Web Audio API + AudioWorklet           Keycloak / AWS Cognito (auth)
                                       Stripe (payments)

Communication
─────────────
REST API    →  session control, auth, pattern loading
WebSocket   →  real-time audio frame streaming at 60 FPS (800 samples/frame @ 48kHz)
             →  live EM field data synchronized to audio

Audio Path
──────────
Backend generates PCM frames (NumPy, 48kHz) ──WebSocket──▶ Frontend AudioWorklet
Frontend oscillators (instant start, ~10ms) ──crossfade──▶ Backend precision engine
Hybrid engine: frontend boots instantly, backend takes over with 2s crossfade
```

---

## Stats & Features

### Technical Stats
- **Sample Rate:** 48kHz | **Bit Depth:** 16-bit PCM (transport) → 32-bit float (processing)
- **Streaming:** 60 FPS WebSocket, 800 samples/frame
- **Frequency Accuracy:** ±0.1Hz | **Phase Accuracy:** ±1° binaural
- **Latency Target:** <50ms end-to-end | **Audio starts in:** ~10ms (frontend engine)
- **THD:** <0.01% | **SNR:** >90dB
- **Bundle Size:** <2MB gzipped | **Backend Memory:** <500MB

### Frequency Protocols
| Band | Range | Use Case |
|------|-------|----------|
| Delta | 0.5–4 Hz | Deep sleep, regeneration |
| Theta | 4–8 Hz | Meditation, creativity, memory |
| Alpha | 8–13 Hz | Relaxed awareness, flow states |
| SMR | 12–15 Hz | ADHD sensorimotor rhythm training |
| Beta | 13–30 Hz | Focus, concentration, cognition |
| Gamma | 30–100 Hz | Peak performance, cognitive binding |

### Feature Set
- **Binaural Beat Engine** — dual-oscillator left/right channel separation with phase continuity
- **8D Spatial Audio** — panning, reverb, and rotation within AudioWorklet
- **Hybrid Audio Engine** — instant frontend start + NumPy-precision backend crossfade
- **3D EM Visualization** — toroidal, spherical harmonic, vortex, and standing wave patterns
- **ADHD Protocols** — science-based multi-stage sessions (15–50 min) with auto-progression
- **Real-time Frequency Display** — live spectrum analysis in session timer panel
- **Session Timer** — countdown display with integrated frequency visualizer
- **Pattern Library** — preset protocols + manual frequency/amplitude control
- **Live Parameter Updates** — change frequencies mid-session without audio dropout
- **Auth & Payments** — Keycloak/Cognito identity + Stripe subscription tiers
- **CI/CD Pipeline** — GitLab CI with lint, typecheck, test, build, and AWS ECS deploy stages
- **Docker Deployment** — Compose for local dev, ECS for production (S3 + CloudFront CDN)