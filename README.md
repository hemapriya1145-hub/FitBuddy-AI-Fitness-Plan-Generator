# FitBuddy – AI Fitness Plan Generator using Gemini Models

FitBuddy is an AI-powered fitness and wellness web application designed as a first-year **BCA (Bachelor of Computer Applications)** college project. It allows users to input their personalized fitness goals, current exercise level, workout duration, diet preferences, and available days, and uses **Google Gemini AI** to generate a scientifically balanced, safe, and motivating weekly fitness plan.

---

## 🎨 Visual Design & Theme
- **Primary Color:** Royal Purple (`#7C3AED`)
- **Accent Color:** Energetic Lime Green (`#84CC16`)
- **Background:** Clean White / Light Slate (`#F8FAFC`)
- **Cards:** Rounded modern cards with smooth drop shadows
- **Typography:** Modern, clean, and accessible (Google Fonts: *Plus Jakarta Sans* & *Outfit*)
- **Responsive:** Optimized for Desktop, Tablet, and Mobile devices

---

## 🌟 Features
1. **Landing Page:** Professional hero section with branding, value highlights, and quick call-to-action.
2. **How It Works:** 3-step visual guide explaining user inputs, Gemini AI processing, and plan execution.
3. **Fitness Information Form:**
   - Name & Age input with client and server-side validation.
   - Interactive Goal Cards (*General Fitness*, *Weight Management*, *Muscle Building*).
   - Fitness Level Selector (*Beginner*, *Intermediate*, *Advanced*).
   - Workout Duration Pills (*15 min*, *30 min*, *45 min*, *60 min*).
   - Diet Preferences (*Vegetarian*, *Non-Vegetarian*, *Vegan*).
   - Available Days Multi-Selector (*Mon* through *Sun*).
   - Optional text area for injuries, home equipment, or special notes.
4. **Gemini AI Plan Generation:**
   - Communicates securely through a Node.js / Express backend.
   - The Gemini API Key is safely stored in `.env` and never exposed to the frontend browser.
   - Smooth loading screen with rotating motivational fitness tips.
5. **Interactive Results Page:**
   - User profile overview chips.
   - Motivational plan title and encouragement summary.
   - 🔥 **Dynamic Warm-Up Routine** (joint preparation, duration, and safety tips).
   - 🏋️ **Weekly Workout Schedule** (exercise names, sets/reps, rest intervals, and coaching cues).
   - 🧘 **Cool-Down & Mobility Routine** (stretches and deep breathing tips).
   - 🥗 **Nutrition & Wellness Guidelines** (customized meals and hydration advice based on diet).
   - 🛡️ **Safety & Health Reminder** (medical & pacing disclaimer).
   - 🖨️ **Print / Save PDF** and 📋 **Copy Plan** buttons.

---

## 📁 Project Structure

```text
FitBuddy/
├── public/
│   ├── index.html        # Main HTML structure with all sections
│   ├── style.css         # Modern, responsive CSS (Lime Green + Purple theme)
│   └── script.js         # Frontend form validation, API calls, and UI rendering
├── server.js             # Express backend with @google/genai integration
├── package.json          # Node.js project manifest & dependencies
├── .env.example          # Environment variables template
├── .env                  # Your local environment variables (keep secret!)
└── README.md             # Project documentation and guide
```

---

## 🚀 Step-by-Step Setup Guide

### Prerequisites
Make sure you have **Node.js** installed on your computer:
- Check your installation by opening a terminal (Command Prompt or PowerShell) and typing:
  ```bash
  node -v
  npm -v
  ```
- If not installed, download the LTS version from [https://nodejs.org/](https://nodejs.org/).

---

### Step 1: Install Dependencies
Open your terminal in the `FitBuddy` project folder and run:

```bash
npm install
```

This installs the required beginner-friendly packages:
- `express` – Fast, lightweight web server framework.
- `@google/genai` – The official Google Gemini AI SDK.
- `dotenv` – Securely loads environment variables from `.env`.
- `cors` – Allows cross-origin requests.

---

### Step 2: Create the `.env` File
In the root directory of the project, create a file named `.env` (or copy `.env.example`):

**On Windows (PowerShell):**
```powershell
Copy-Item .env.example .env
```

**On macOS / Linux:**
```bash
cp .env.example .env
```

---

### Step 3: Put Your Gemini API Key in `.env`

1. Open [Google AI Studio](https://aistudio.google.com/) in your browser.
2. Sign in with your Google account.
3. Click on **"Get API key"** and create a free Gemini API key.
4. Copy your key and open the `.env` file in VS Code or Notepad.
5. Replace `YOUR_API_KEY_HERE` with your actual key:

```env
GEMINI_API_KEY=AIzaSyYourActualKeyHere123456789
PORT=3000
```

> ⚠️ **Important Security Note:** Never commit your `.env` file to GitHub or share your API key publicly. The backend server reads the key from `.env` so your browser never sees it.

---

### Step 4: Run the Project
Start the Express server using:

```bash
npm start
```

Or for development with auto-reload:
```bash
npm run dev
```

You should see this in the terminal:
```text
====================================================
🚀 FitBuddy server is running!
👉 Open in your browser: http://localhost:3000
====================================================
```

---

### Step 5: Open in Your Browser
Open your favorite web browser (Chrome, Edge, Firefox, Brave, Safari) and navigate to:

👉 **[http://localhost:3000](http://localhost:3000)**

---

## 🧪 Testing the Application
1. **Health Check:** Open `http://localhost:3000/api/health` to confirm the server is running and check if your Gemini key is loaded.
2. **Form Validation:** Try submitting an empty form or entering an age like `5` to test the user-friendly validation error messages.
3. **AI Generation:** Fill in your details and click **"Generate My Fitness Plan"**. Watch the loading animation with dynamic tips while Gemini creates your workout.
4. **Plan Verification:** Review the warm-up, day-by-day workout schedule, cool-down, and nutrition guidance.
5. **Print / Export:** Click **"Print / Save PDF"** to test browser printing or save your routine as a PDF document.

---

## 🛡️ Technologies Used
- **Frontend:** HTML5, CSS3 (CSS Grid, Flexbox, Custom Variables), Vanilla JavaScript (ES6+).
- **Backend:** Node.js, Express.js.
- **AI Model:** Google Gemini (`gemini-2.5-flash` with fallback to `gemini-1.5-flash`).
- **Official SDK:** `@google/genai`.

---

## 🎓 College Viva / Presentation Q&A Tips
- **Q: Why is the Gemini API called from Node.js instead of the frontend?**  
  *A:* Security. If we called Gemini directly from frontend JavaScript, anyone could right-click and view our secret API key in the browser's developer tools. Calling it from Express keeps the key safely on the server.
- **Q: What SDK is used for Gemini?**  
  *A:* The official Google Gen AI JavaScript SDK (`@google/genai`).
- **Q: How does the AI return structured data?**  
  *A:* We specify a strict JSON schema in our server prompt and use Gemini's `responseMimeType: 'application/json'` configuration so the model outputs raw, easily-parsable JSON.

---

## 📄 License
Created for academic learning and presentation purposes.
