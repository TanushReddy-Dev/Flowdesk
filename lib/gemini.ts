import { GoogleGenerativeAI } from "@google/generative-ai";

if (!process.env.GEMINI_API_KEY) {
  throw new Error("Missing GEMINI_API_KEY environment variable");
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export function getGeminiModel(modelName = "gemini-2.5-flash") {
  return genAI.getGenerativeModel({ model: modelName });
}

export async function generateDailyBriefing(emails: any[], events: any[]) {
  const model = getGeminiModel("gemini-2.5-pro");
  
  const prompt = `
    You are a professional executive assistant. Analyze the user's emails and calendar for today.
    Return a JSON with EXACTLY this structure:
    {
      "summary": "string (a 2-3 sentence overview of the day)",
      "priorities": ["string", "string"],
      "conflicts": ["string", "string"],
      "suggestedFocus": "string"
    }
    
    Context:
    Today's Events: ${JSON.stringify(events)}
    Unread Emails: ${JSON.stringify(emails.map(e => ({ sender: e.sender, subject: e.subject, snippet: e.snippet })))}
    
    Ensure the output is ONLY valid JSON. No markdown formatting like \`\`\`json.
  `;

  const result = await model.generateContent(prompt);
  const text = result.response.text().replace(/```json/gi, '').replace(/```/g, '').trim();
  try {
    return JSON.parse(text);
  } catch (error) {
    console.error("Failed to parse daily briefing JSON:", text);
    throw new Error("Failed to generate valid briefing");
  }
}

export async function generateEmailSummary(emailBody: string) {
  const model = getGeminiModel("gemini-2.5-flash");
  const prompt = `Summarize the following email in exactly one clear, professional sentence:\n\n${emailBody}`;
  const result = await model.generateContent(prompt);
  return result.response.text().trim();
}

export async function generateEmailDraft(emailContent: string) {
  const model = getGeminiModel("gemini-2.5-pro");
  const prompt = `
    Draft a professional and concise reply to the following email.
    Do not include placeholders like "[Your Name]" if possible, just write the body.
    
    Email:
    ${emailContent}
  `;
  const result = await model.generateContent(prompt);
  return result.response.text().trim();
}
