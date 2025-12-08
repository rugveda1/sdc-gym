const { GoogleGenerativeAI } = require("@google/generative-ai");

// Fallback canned plan
const CANNED_PLAN = {
  summary: "Standard Balanced Diet (Fallback)",
  days: Array.from({ length: 7 }, (_, i) => ({
    day: `Day ${i + 1}`,
    meals: [
      { time: "Breakfast", meal: "Oatmeal with berries", calories: 350, notes: "High fiber" },
      { time: "Lunch", meal: "Grilled Chicken Salad", calories: 500, notes: "High protein" },
      { time: "Dinner", meal: "Salmon with Quinoa", calories: 600, notes: "Healthy fats" }
    ],
    macros: { calories: 1450, protein: "120g", carbs: "150g", fat: "50g" }
  })),
  notes: "This is a sample plan because no API key was provided or the LLM failed."
};

async function generateDietPlan(profile) {
  const apiKey = process.env.GOOGLE_API_KEY;

  if (!apiKey || apiKey === 'your_gemini_api_key') {
    console.log("Using canned diet plan (No API Key)");
    return CANNED_PLAN;
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

    const prompt = `
      You are an expert nutritionist. Create a 7-day diet plan for a user with this profile:
      - Weight: ${profile.weightKg}kg
      - Height: ${profile.heightCm}cm
      - Region: ${profile.region}
      - Habits: ${profile.eatingHabits}
      - Goal: ${profile.goal}

      Output MUST be valid JSON with this structure:
      {
        "summary": "Brief summary of the strategy",
        "days": [
          {
            "day": "Day 1",
            "meals": [
              { "time": "Breakfast", "meal": "Description", "calories": 500, "notes": "..." }
            ],
            "macros": { "calories": 2000, "protein": "150g", "carbs": "200g", "fat": "60g" }
          }
        ],
        "notes": "General advice"
      }
      Do not include markdown formatting like \`\`\`json. Just the raw JSON string.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Clean up markdown if present
    const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(jsonStr);

  } catch (error) {
    console.error("LLM Generation Error:", error);
    return CANNED_PLAN;
  }
}

module.exports = { generateDietPlan };
