import { GoogleGenAI } from "@google/genai";

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { businessData } = req.body;
  if (!process.env.GEMINI_API_KEY) {
    return res.status(500).json({ error: "Gemini API Key is not configured on the server." });
  }

  try {
    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: { 'User-Agent': 'aistudio-build' }
      }
    });

    const prompt = `You are "Baawan ERP Strategic Advisor", an expert business consultant. 
    Analyze the following business metrics of the company and provide constructive, highly actionable, strategic insights:

    Business Data:
    ${JSON.stringify(businessData || {}, null, 2)}

    Your response MUST be a valid JSON object matching the following TypeScript interface strictly. Do not wraps inside \`\`\`json markdown blocks, just return raw JSON text:
    {
      "summary": "A concise executive summary (~2-3 sentences) of the financial & operation performance.",
      "strengths": ["List 2-3 key strengths or positive highlights based on the data."],
      "risks": ["List 2-3 operational/financial threats, risks, or areas of concern (e.g. outstanding, low stock)."],
      "recommendations": ["List 3-4 specific, professional, actionable steps the admin can take immediately."]
    }`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    if (response?.text) {
      return res.status(200).json(JSON.parse(response.text.trim()));
    } else {
      throw new Error("No response text from Gemini");
    }
  } catch (error: any) {
    console.error("Gemini Insights Server Error:", error);
    return res.status(500).json({ error: error.message || "Failed to generate AI insights from server" });
  }
}
