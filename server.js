/**
 * ==============================================================================
 * FitBuddy – Backend Server
 * ==============================================================================
 * Description: Express.js server that connects to Google's Gemini AI SDK (@google/genai)
 *              to generate personalized, wellness-focused fitness plans.
 * Authors: Beginner-friendly BCA Project Template
 * ==============================================================================
 */

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

// Load environment variables from .env file
dotenv.config();

// Helpers to get directory name in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Express application
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware setup
app.use(cors()); // Allow requests from different origins if needed
app.use(express.json()); // Parse incoming JSON request bodies
app.use(express.urlencoded({ extended: true }));

// Serve static frontend files from the "public" folder
app.use(express.static(path.join(__dirname, 'public')));

/**
 * Health check & configuration endpoint
 * Allows the frontend to check if the server is alive and if the API key is set.
 */
app.get('/api/health', (req, res) => {
  const isKeyConfigured = Boolean(
    process.env.GEMINI_API_KEY &&
    process.env.GEMINI_API_KEY !== 'YOUR_API_KEY_HERE' &&
    process.env.GEMINI_API_KEY.trim().length > 10
  );

  res.json({
    status: 'ok',
    message: 'FitBuddy server is running smoothly!',
    geminiConfigured: isKeyConfigured
  });
});

/**
 * Main API endpoint to generate a personalized fitness plan using Gemini
 * POST /api/generate-plan
 */
app.post('/api/generate-plan', async (req, res) => {
  try {
    // 1. Extract user input from request body
    const {
      name,
      age,
      goal,
      fitnessLevel,
      workoutDuration,
      dietPreference,
      availableDays,
      additionalPreferences
    } = req.body;

    // 2. Validate required inputs
    if (!name || !age || !goal || !fitnessLevel || !workoutDuration || !dietPreference) {
      return res.status(400).json({
        success: false,
        error: 'Please fill in all required fields (Name, Age, Goal, Fitness Level, Duration, and Diet).'
      });
    }

    const parsedAge = parseInt(age, 10);
    if (isNaN(parsedAge) || parsedAge < 10 || parsedAge > 100) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a realistic age between 10 and 100.'
      });
    }

    const daysList = Array.isArray(availableDays) && availableDays.length > 0
      ? availableDays.join(', ')
      : '3-4 flexible days';

    // Optional: Demo preview mode for presentations and testing before setting API key
    if (req.body.isDemo === true) {
      const demoPlan = {
        planTitle: `${goal} Routine for ${name}`,
        summary: `Welcome to your custom plan, ${name}! As a ${fitnessLevel.toLowerCase()} focused on ${goal.toLowerCase()}, consistency and proper recovery are your secret to lasting wellness. Enjoy your ${workoutDuration} sessions!`,
        userOverview: {
          name,
          age: parsedAge,
          goal,
          level: fitnessLevel,
          duration: workoutDuration,
          diet: dietPreference,
          days: daysList
        },
        warmup: [
          { name: "Arm Circles & Shoulder Rolls", duration: "2 minutes", tip: "Keep your movements controlled and breathe rhythmically." },
          { name: "Torso Twists & Hip Openers", duration: "2 minutes", tip: "Rotate gently from your core, keeping feet planted." },
          { name: "Light Jog / High Knees in Place", duration: "2 minutes", tip: "Gradually raise your heart rate and loosen lower body." }
        ],
        weeklySchedule: [
          {
            dayName: "Day 1 (Monday)",
            focus: "Full Body Activation & Core",
            exercises: [
              { name: "Bodyweight Squats", setsAndReps: "3 sets x 12 reps", rest: "60 seconds", formTip: "Keep chest up and knees tracking over toes." },
              { name: "Incline or Knee Push-ups", setsAndReps: "3 sets x 10 reps", rest: "60 seconds", formTip: "Maintain a straight line from shoulders to heels/knees." },
              { name: "Glute Bridges", setsAndReps: "3 sets x 15 reps", rest: "45 seconds", formTip: "Squeeze glutes firmly at the top for 1 second." },
              { name: "Plank Hold", setsAndReps: "3 sets x 30 seconds", rest: "45 seconds", formTip: "Engage core and avoid sagging through the lower back." }
            ]
          },
          {
            dayName: "Day 2 (Wednesday)",
            focus: "Upper Body & Cardiovascular Conditioning",
            exercises: [
              { name: "Dumbbell or Backpack Rows", setsAndReps: "3 sets x 12 reps", rest: "60 seconds", formTip: "Pull with your elbows and retract shoulder blades." },
              { name: "Standing Overhead Press", setsAndReps: "3 sets x 10 reps", rest: "60 seconds", formTip: "Keep ribs down and avoid arching your lower back." },
              { name: "Mountain Climbers", setsAndReps: "3 sets x 30 seconds", rest: "45 seconds", formTip: "Drive knees toward chest at a steady, controlled pace." },
              { name: "Bird-Dog Extensions", setsAndReps: "3 sets x 10 reps per side", rest: "45 seconds", formTip: "Reach opposite arm and leg straight out without twisting." }
            ]
          },
          {
            dayName: "Day 3 (Friday)",
            focus: "Lower Body Strength & Balance",
            exercises: [
              { name: "Reverse Lunges", setsAndReps: "3 sets x 10 reps per leg", rest: "60 seconds", formTip: "Step backward gently; ensure front knee stays behind toes." },
              { name: "Romanian Deadlift (Hinge)", setsAndReps: "3 sets x 12 reps", rest: "60 seconds", formTip: "Push hips back with soft knees and a flat spine." },
              { name: "Calf Raises", setsAndReps: "3 sets x 20 reps", rest: "30 seconds", formTip: "Pause at peak contraction on the balls of your feet." },
              { name: "Deadbug Holds", setsAndReps: "3 sets x 10 reps", rest: "45 seconds", formTip: "Press lower back firmly into the floor as you extend." }
            ]
          }
        ],
        cooldown: [
          { name: "Seated Hamstring & Quad Stretch", duration: "2 minutes", tip: "Exhale deeply as you gently sink into the stretch." },
          { name: "Child's Pose & Cat-Cow", duration: "2 minutes", tip: "Release spinal compression and slow down your respiration." },
          { name: "Chest & Bicep Wall Stretch", duration: "1 minute", tip: "Open up chest muscles and improve upright posture." }
        ],
        nutritionWellness: [
          `Diet Specific (${dietPreference}): Emphasize wholesome protein sources like ${dietPreference === 'Vegetarian' ? 'paneer, lentils, tofu, Greek yogurt, and chickpeas' : dietPreference === 'Vegan' ? 'lentils, tempeh, hemp seeds, quinoa, and black beans' : 'grilled chicken breast, eggs, salmon, and Greek yogurt'}.`,
          "Hydration Rule: Aim for 2.5 to 3 liters of fresh water daily to sustain metabolic rate and muscle performance.",
          "Pre-Workout Energy: Enjoy a banana or a handful of almonds 30-45 minutes before exercise.",
          "Sleep Recovery: Prioritize 7-8 hours of sound sleep; that is when muscle repair and hormonal balance occur."
        ],
        safetyReminder: "Safety First: Perform all movements within a pain-free range of motion. If you experience unusual dizziness or joint pain, stop immediately and seek advice from a healthcare professional."
      };

      return res.json({
        success: true,
        data: demoPlan,
        isDemo: true
      });
    }

    // 3. Verify Gemini API Key
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'YOUR_API_KEY_HERE' || apiKey.trim() === '') {
      return res.status(500).json({
        success: false,
        error: 'Gemini API Key is missing! Please open your .env file and set GEMINI_API_KEY to your valid key from Google AI Studio (https://aistudio.google.com/). You can also click "Preview Sample Plan" to test the UI immediately.'
      });
    }

    // 4. Initialize Google Gen AI client with the official SDK
    const ai = new GoogleGenAI({ apiKey: apiKey.trim() });

    // 5. Construct a detailed, safe, wellness-oriented prompt for Gemini
    const prompt = `
You are FitBuddy, a certified personal fitness and wellness coach assistant.
Create a comprehensive, motivating, and safe fitness plan for the following user:

USER PROFILE:
- Name: ${name}
- Age: ${parsedAge}
- Primary Fitness Goal: ${goal}
- Current Fitness Level: ${fitnessLevel}
- Desired Workout Duration: ${workoutDuration} per session
- Diet Preference: ${dietPreference}
- Available Days: ${daysList}
- Special Notes / Preferences / Equipment: ${additionalPreferences ? additionalPreferences : 'None specified'}

IMPORTANT GUIDELINES:
1. Always keep the exercises appropriate for their fitness level (${fitnessLevel}).
2. Emphasize proper form, breathing, and safe pacing.
3. Structure the response STRICTLY as valid JSON matching the exact schema below.
4. Do NOT include markdown fences like \`\`\`json or \`\`\` around the JSON. Return raw JSON text only.

JSON SCHEMA TO FOLLOW:
{
  "planTitle": "string (motivating title for the plan)",
  "summary": "string (2-3 sentences warmly encouraging the user based on their specific goal)",
  "userOverview": {
    "name": "${name}",
    "age": ${parsedAge},
    "goal": "${goal}",
    "level": "${fitnessLevel}",
    "duration": "${workoutDuration}",
    "diet": "${dietPreference}",
    "days": "${daysList}"
  },
  "warmup": [
    {
      "name": "string (e.g., Arm Circles & Neck Rolls)",
      "duration": "string (e.g., 2 minutes)",
      "tip": "string (form reminder)"
    }
  ],
  "weeklySchedule": [
    {
      "dayName": "string (e.g., Day 1 - Full Body & Core / Monday)",
      "focus": "string (e.g., Upper Body Strength & Cardio)",
      "exercises": [
        {
          "name": "string (exercise name)",
          "setsAndReps": "string (e.g., 3 sets of 10-12 reps or 45 seconds work / 15s rest)",
          "rest": "string (e.g., 60 seconds rest)",
          "formTip": "string (concise coaching cue)"
        }
      ]
    }
  ],
  "cooldown": [
    {
      "name": "string (e.g., Hamstring & Quad Static Stretch)",
      "duration": "string (e.g., 2-3 minutes)",
      "tip": "string (focus on slow deep breathing)"
    }
  ],
  "nutritionWellness": [
    "string (customized healthy meal/snack/hydration suggestion suitable for ${dietPreference} diet and ${goal})"
  ],
  "safetyReminder": "string (clear safety and medical disclaimer reminding them to listen to their body and consult a physician if needed)"
}
`;

    // 6. Generate content with Gemini
    // Resilient multi-model fallback across active Gemini Flash models
    const candidateModels = [
      process.env.GEMINI_MODEL,
      'gemini-3.5-flash',
      'gemini-3.5-flash-lite',
      'gemini-3.6-flash',
      'gemini-3.8-flash',
      'gemini-3.7-flash',
      'gemini-flash-latest'
    ].filter(Boolean);

    let responseText = '';
    let lastError = null;

    for (const modelName of candidateModels) {
      try {
        console.log(`🤖 FitBuddy calling Gemini model: ${modelName}...`);
        const response = await ai.models.generateContent({
          model: modelName,
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            temperature: 0.7,
          }
        });
        if (response && response.text) {
          responseText = response.text;
          console.log(`✅ Successfully generated plan with model: ${modelName}`);
          break;
        }
      } catch (modelError) {
        lastError = modelError;
        console.warn(`Model ${modelName} encountered: ${modelError.status || modelError.message?.slice(0, 90)}. Trying next candidate...`);
      }
    }

    if (!responseText) {
      throw lastError || new Error('All Gemini models were temporarily unavailable. Please try again.');
    }

    // 7. Parse the JSON response
    // Remove any markdown code fences if Gemini added them despite instructions
    let cleanJson = responseText.trim();
    if (cleanJson.startsWith('```json')) {
      cleanJson = cleanJson.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (cleanJson.startsWith('```')) {
      cleanJson = cleanJson.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }

    let planData;
    try {
      planData = JSON.parse(cleanJson);
    } catch (parseError) {
      console.error('Failed to parse Gemini output as JSON:', cleanJson);
      return res.status(500).json({
        success: false,
        error: 'Failed to parse AI output. Please try clicking Generate again.',
        raw: responseText
      });
    }

    // 8. Return the generated fitness plan to the frontend
    return res.json({
      success: true,
      data: planData
    });

  } catch (error) {
    console.error('Error generating fitness plan:', error);

    // Provide friendly, actionable error messages
    let userFriendlyMessage = 'An unexpected error occurred while generating your plan. Please try again.';
    
    if (error.message && error.message.includes('API_KEY_INVALID')) {
      userFriendlyMessage = 'The provided Gemini API Key is invalid. Please verify your key at https://aistudio.google.com/.';
    } else if (error.message && error.message.includes('RESOURCE_EXHAUSTED')) {
      userFriendlyMessage = 'Gemini API quota exceeded for this minute. Please wait 30 seconds and try again.';
    } else if (error.message) {
      userFriendlyMessage = `Gemini AI Error: ${error.message}`;
    }

    return res.status(500).json({
      success: false,
      error: userFriendlyMessage
    });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🚀 FitBuddy server is running!`);
  console.log(`👉 Open in your browser: http://localhost:${PORT}`);
  console.log(`👉 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`====================================================`);
});
