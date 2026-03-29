# 🥗 Diet AI: Intelligent Nutritional Architecture

**Diet AI** is a high-performance, multi-agent ecosystem designed to bridge the gap between human appetite and biological necessity. Unlike generic calorie trackers, Diet AI uses a **Council of AI Agents** and a **Strict Scoring Algorithm** to enforce genuine dietary discipline.

> **"You can't cheat your biology, and you can't cheat Diet AI."**

---

## 🚀 Core Features
- **Multi-Agent Orchestration:** Specialized agents for scanning, building, and reflecting on your diet.
- **Smart Timeframe Tracking:** Set your goal duration and let the system monitor your progress.
- **Natural Language Processing:** Log meals like "I ate 2 Idlis with coconut chutney" or just have a "Nutri-Chat."
---

## 🧠 The AI Council (Backend Agents)
Diet AI leverages a specialized multi-agent architecture to handle complex nutritional logic:

* **Nutri Orchestrator:** The gatekeeper. Decides if your query is a meal log, a generic question, or a deep nutritional analysis.
* **Nutri Scanner:** The analyst. Breaks down natural language food queries into precise micro/macro-nutrient data.
* **Diet Builder:** The strategist. Performs gap analysis between your current intake and "Balanced Diet" targets to suggest specific foods.
* **Nutri Reflector:** The critic. Provides a high-level review of your performance over your active timeframe.
* **Missy Monitor:** The enforcer. Scolds and penalizes users for skipped days to ensure data integrity.
* **Omni Knowledge Bot:** The scholar. Handles general health inquiries and chit-chat.

---

## 🔐 The "Anti-Cheat" Scoring Engine
Our scoring algorithm is mathematically designed to be **strict, fair, and manipulation-resistant.**

### 🚫 Anti-Manipulation Logic
1.  **Overconsumption Penalty:** You cannot "make up" for a bad day by overeating healthy nutrients later. High-risk nutrients (Sodium, Fats) are penalized exponentially if they exceed limits.
2.  **Frequency Enforcement:** Logging 10 meals in one hour to "boost" scores is detected and flagged as suspicious behavior.
3.  **Consistency Mandate:** Missing logs directly reduces your score. Silence is interpreted as failure.

### 🎯 Mathematical Models
* **Exponential Decay:** `score = exp(-penalty * deviation)` — Small mistakes are okay; large deviations cause sharp score drops.
* **Quadratic Penalty:** Overconsumption is penalized via an `overshoot_factor²` to prevent artificial balancing.
* **Logarithmic Growth:** The **Discipline Bonus** (up to 20% of the total score) rewards long-term habit formation using a `log(1 + days)` curve.

---

## 🛠️ Tech Stack & Infrastructure

### Frontend
- **Framework:** React 18 + TypeScript
- **Styling:** Tailwind CSS + Shadcn/UI
- **Animations:** Framer Motion (System-level aesthetic)
- **State Management:** TanStack Query (React Query)

### Backend
- **Engine:** FastAPI (Python 3.14+)
- **Database:** MongoDB (Aggregation Pipelines for nutrient gap analysis)
- **Security:** JWT/Cookie Authentication
---

## 🔌 API Documentation
The server is fully documented via Swagger UI.
- **Hosted Server:** `https://diet-ai-server-kju8.onrender.com`
- **Interactive Docs:** [https://diet-ai-server-kju8.onrender.com/docs](https://diet-ai-server-kju8.onrender.com/docs)

### Primary Endpoints
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/signup` | Initialize user profile and timeframe |
| `POST` | `/login` | Secure session initialization (HttpOnly Cookies) |
| `POST` | `/start` | Primary gateway for meal logs and AI chat |
| `GET` | `/diet_suggestions` | Get "Diet Builder" gap-analysis recommendations |
| `GET` | `/calculate_score` | Get real-time strict performance score |
| `GET` | `/check_skips` | Trigger "Missy Monitor" for attendance review |

---

## 🛠️ Installation & Setup

1. **Clone the repository**
   ```bash
   git clone [https://github.com/Vethan123/Diet-AI.git](https://github.com/Vethan123/Diet-AI.git)
