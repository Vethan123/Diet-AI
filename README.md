# 🥗 Diet-AI: Your Personal Nutrition Enforcer

**Diet-AI** isn't just another calorie counter. It is an intelligent, AI-driven ecosystem designed to bridge the gap between your appetite and your biological needs through real-time coaching and a **"No-Cheating"** discipline system.

> **"You can't cheat your biology, and you can't cheat Diet-AI."**

---

## 🌟 How It Works

Diet-AI uses a **Council of AI Agents** that act as your digital nutrition team. Instead of manually searching for calories, you simply talk to the AI, and it manages your health journey.

### Meet Your AI Coaching Team:

* **The Scanner:** Just tell it what you ate (e.g., *"2 Idlis and coconut chutney"*). It identifies the nutrients automatically.
* **The Builder:** Analyzes exactly what you're missing and suggests the right foods to eat next to stay balanced.
* **The Reflector:** Provides a "brutally honest" review of your performance over your chosen timeframe.
* **Missy Monitor:** The enforcer. If you forget to log your meals, expect to get scolded. Consistency is mandatory here.
* **Knowledge Bot:** Have a general question? Ask anything from *"Is coffee good for me?"* to a simple *"How's it going?"*

### System Architecture & Logic Flow

To ensure every meal log is processed accurately and every "cheat" is detected, Diet-AI follows a sophisticated internal logic:

<img width="854" height="639" alt="Diet-AI System Flow Chart" src="https://github.com/user-attachments/assets/7087141e-6e6d-4f29-a214-a67225f68861" />

---

## 🛠️ Getting Started in 3 Steps

### 1. Set Your Timeframe
When you first log in, Diet-AI will ask you for a tracking duration. Once set, the AI locks in and begins monitoring your discipline for that entire window.

### 2. Log Your Meals (Natural Talk)
No more searching through endless databases for "100g of Chicken." Just talk to the app like a friend:

* *"Hey, today I ate Idli with coconut chutney."*
* *"Had a heavy Biryani for lunch with a Coke."*
* *...or just ask for advice:* *"What should I eat to increase my protein today?"*

### 3. Check Your Discipline Score
Your **Live Score (0–100)** tells you exactly how well you are performing. Our algorithm is strict—the higher the score, the better your actual habits.

---

## 🔐 Why You Can't Cheat the System

We built a **Strict Scoring Engine** to ensure you stay honest with yourself. Here is how the AI catches "manipulation" behavior:

* **🚫 The Overconsumption Penalty:** You can't "make up" for a bad day by overeating healthy nutrients later. Over-consuming specific high-risk nutrients (like Sodium or Fats) triggers a heavy score drop.
* **🚫 Selective Logging Prevention:** Think you can just "forget" to log a junk food meal? **Missy Monitor** tracks your logging frequency. If you skip entries, your score is penalized automatically.
* **🚫 Frequency Enforcement:** You cannot inflate your score by logging 10 healthy snacks in one hour. The AI detects "suspicious patterns" and rewards realistic, steady eating.

---

## 🏆 The Discipline Bonus

We reward **Consistency over Perfection**.

* **Steady Logging:** The longer you go without missing a day, the higher your "Consistency Bonus" grows.
* **Habit Formation:** The system uses a growth model that rewards long-term dedication, contributing up to **20% of your final score**.

---

## 📱 Quick Features

* **Start Chatting:** Log meals, ask questions, or just have a normal chit-chat.
* **Diet Suggestions:** Get a customized list of foods to move a step closer to a balanced diet.
* **Performance Review:** Get summarized remarks about your current progress.
* **Calculate Score:** See your real-time performance scaled from 0 to 100.
* **Reset:** Finished a goal? Reset your timeframe and start a fresh journey.

---

## 🌐 API Reference

**Hosted Server:** [https://diet-ai-server-kju8.onrender.com](https://diet-ai-server-kju8.onrender.com)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/signup` | Register a new user account |
| `POST` | `/login` | Authenticate and log in |
| `GET` | `/logout` | Log out of the current session |
| `POST` | `/start` | Takes a query and passes comments to the AI |
| `GET` | `/diet_suggestions` | Returns personalized diet suggestions |
| `GET` | `/review` | Returns current performance remarks |
| `GET` | `/check_skips` | Gets scolded for skipping meal logs |
| `GET` | `/calculate_score` | Returns the user's discipline score (0–100) |
| `GET` | `/get_user_stats` | Returns the user's full statistics |
| `GET` | `/reset` | Resets the timeframe and user state |

---

## 👨‍💻 Contributors

Built by:
[Yadam Vethan](https://github.com/vethan123) 
[Vinay Yadam](https://github.com/YadamVinay369)

---

**Ready to get disciplined?** [Launch Diet-AI Dashboard](https://get-healthy-with-diet-ai.netlify.app)

---

*Engineered for genuine healthy habits and long-term discipline.*
