const express = require('express');
const { authenticate } = require('../middleware/auth');
const router = express.Router();

const callAnthropicAPI = async (systemPrompt, userMessage) => {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1500,
      system: systemPrompt,
      messages: [{ role: 'user', content: userMessage }]
    })
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Anthropic API error: ${err}`);
  }

  const data = await response.json();
  return data.content[0].text;
};

// POST /api/ai/symptom-check
router.post('/symptom-check', authenticate, async (req, res) => {
  const { symptoms } = req.body;
  if (!symptoms) return res.status(400).json({ success: false, message: 'Symptoms are required' });

  try {
    const systemPrompt = `You are MediTrack's AI health assistant. Analyze symptoms and provide helpful, responsible information.
CRITICAL: Always clearly state this is NOT a medical diagnosis and the user should consult a real doctor.
Respond ONLY in this exact JSON format (no markdown, no extra text):
{
  "possibleConditions": [
    {"name": "Condition Name", "likelihood": "High/Medium/Low", "description": "Brief description"},
    {"name": "Condition Name 2", "likelihood": "Medium", "description": "Brief description"}
  ],
  "urgencyLevel": "Immediate/Urgent/Non-urgent/Monitor",
  "urgencyColor": "red/orange/yellow/green",
  "urgencyMessage": "What the patient should do",
  "generalAdvice": ["Tip 1", "Tip 2", "Tip 3"],
  "recommendedSpecialists": ["Cardiologist", "General Physician"],
  "disclaimer": "This is informational only, not a medical diagnosis. Please consult a qualified doctor."
}`;

    const aiResponse = await callAnthropicAPI(systemPrompt, `Patient symptoms: ${symptoms}`);

    let parsed;
    try {
      parsed = JSON.parse(aiResponse);
    } catch {
      parsed = { raw: aiResponse, disclaimer: 'Please consult a doctor for accurate diagnosis.' };
    }

    res.json({ success: true, analysis: parsed });
  } catch (err) {
    console.error('AI Error:', err.message);
    // Fallback response when API key not configured
    res.json({
      success: true,
      analysis: {
        possibleConditions: [
          { name: 'Common Cold / Viral Infection', likelihood: 'High', description: 'Based on reported symptoms, viral infection is possible' },
          { name: 'Allergic Reaction', likelihood: 'Medium', description: 'Allergies can cause similar symptoms' }
        ],
        urgencyLevel: 'Non-urgent',
        urgencyColor: 'yellow',
        urgencyMessage: 'Monitor your symptoms. If they worsen, consult a doctor.',
        generalAdvice: ['Stay hydrated', 'Get adequate rest', 'Monitor your temperature', 'Consult a doctor if symptoms persist beyond 3 days'],
        recommendedSpecialists: ['General Physician'],
        disclaimer: 'This is AI-generated information only, NOT a medical diagnosis. Please consult a qualified healthcare professional.',
        note: '(Demo mode - Configure ANTHROPIC_API_KEY for live AI analysis)'
      }
    });
  }
});

// POST /api/ai/health-tips
router.post('/health-tips', authenticate, async (req, res) => {
  const { medicalHistory, recentAppointments } = req.body;
  const user = req.user;

  try {
    const systemPrompt = `You are MediTrack's personal health advisor. Generate personalized, actionable health tips.
Respond ONLY in JSON format:
{
  "tips": [
    {"category": "Nutrition/Exercise/Sleep/Mental Health/Preventive Care", "tip": "Specific actionable tip", "icon": "🥗"},
    ...5 tips total
  ],
  "weeklyGoal": "One specific weekly health goal",
  "motivationalMessage": "Encouraging message for the user"
}`;

    const context = `User: ${user.name}, Age: ${user.age || 'unknown'}. Medical history: ${medicalHistory || 'none provided'}. Recent appointments: ${recentAppointments || 'none'}`;
    const aiResponse = await callAnthropicAPI(systemPrompt, context);

    let parsed;
    try { parsed = JSON.parse(aiResponse); }
    catch { parsed = { raw: aiResponse }; }

    res.json({ success: true, healthTips: parsed });
  } catch (err) {
    res.json({
      success: true,
      healthTips: {
        tips: [
          { category: 'Nutrition', tip: 'Drink at least 8 glasses of water daily to stay hydrated', icon: '💧' },
          { category: 'Exercise', tip: 'Aim for 30 minutes of moderate exercise 5 days a week', icon: '🏃' },
          { category: 'Sleep', tip: 'Maintain a consistent 7-8 hour sleep schedule', icon: '😴' },
          { category: 'Mental Health', tip: 'Practice 10 minutes of mindfulness or meditation daily', icon: '🧘' },
          { category: 'Preventive Care', tip: 'Schedule annual health checkups and keep vaccinations up to date', icon: '🩺' }
        ],
        weeklyGoal: 'Walk 10,000 steps every day this week',
        motivationalMessage: 'Small daily improvements lead to remarkable long-term results. Keep going!',
        note: '(Demo mode - Configure ANTHROPIC_API_KEY for personalized tips)'
      }
    });
  }
});

// POST /api/ai/recommend-doctors
router.post('/recommend-doctors', authenticate, async (req, res) => {
  const { symptoms, preferences } = req.body;

  try {
    const doctors = global.db.users.filter(u => u.role === 'doctor' && u.approved);
    const doctorList = doctors.map(d => `${d.name} - ${d.specialisation} - Rating: ${d.rating} - Fee: ₹${d.fee}`).join('\n');

    const systemPrompt = `You are MediTrack's doctor recommendation AI. Based on symptoms, recommend the most suitable doctors.
Available doctors:\n${doctorList}\n
Respond ONLY in JSON format:
{
  "recommendations": [
    {"doctorName": "Name", "reason": "Why this doctor is suitable", "priority": 1},
    ...top 3 only
  ],
  "generalAdvice": "What type of specialist to look for"
}`;

    const aiResponse = await callAnthropicAPI(systemPrompt, `Patient symptoms: ${symptoms}. Preferences: ${preferences || 'none'}`);

    let parsed;
    try { parsed = JSON.parse(aiResponse); }
    catch { parsed = { raw: aiResponse }; }

    // Enrich with actual doctor data
    if (parsed.recommendations) {
      parsed.recommendations = parsed.recommendations.map(rec => {
        const doc = doctors.find(d => d.name === rec.doctorName);
        return { ...rec, doctor: doc ? (({ password, ...d }) => d)(doc) : null };
      }).filter(r => r.doctor);
    }

    res.json({ success: true, data: parsed });
  } catch (err) {
    // Fallback
    const doctors = global.db.users.filter(u => u.role === 'doctor' && u.approved).slice(0, 3);
    res.json({
      success: true,
      data: {
        recommendations: doctors.map((d, i) => ({
          doctorName: d.name,
          reason: `Highly rated ${d.specialisation} specialist with ${d.experience} years of experience`,
          priority: i + 1,
          doctor: (({ password, ...doc }) => doc)(d)
        })),
        generalAdvice: 'Based on your symptoms, consulting a specialist would be beneficial',
        note: '(Demo mode - Configure ANTHROPIC_API_KEY for AI-powered recommendations)'
      }
    });
  }
});

module.exports = router;
