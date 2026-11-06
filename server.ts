import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

// Handler logic for email generation
async function handleGenerateEmail(req: Request, res: Response) {
  try {
    const { type, tone, person, event, writingSample, userSenderName, customGoal } = req.body;

    if (!person || !person.name) {
      return res.status(400).json({ error: 'Person details (including name) are required.' });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    // Tone instructions
    const toneInstructions: Record<string, string> = {
      warm: 'Warm, personable, thoughtful, and authentic. Feels like a real connection from a genuine peer.',
      concise: 'Crisp, respectful of their time, direct, and under 90 words while still polite.',
      friendly_pro: 'Professional, polished, collegiate, and collaborative.',
      mentorship: 'Thoughtful, appreciative, and humble, asking for specific advice or offering value in return.',
    };

    const typeInstructions: Record<string, string> = {
      thank_you: 'A post-event thank you note. Reconnect warmly, reference specific conversation points from the event, express gratitude for their time/insights, and leave the door open for future collaboration.',
      coffee_chat: 'An invitation for a casual 20-30 minute virtual or in-person coffee chat. Mention why talking further would be mutually rewarding, reference something specific they shared, and propose a flexible, frictionless time horizon (e.g. "next week or the week after").',
      reconnect: 'A warm check-in note to reconnect after weeks or months. Reference your past interaction/event, inquire how their key project is progressing, share a brief update or relevant insight, and casually suggest catching up.',
    };

    const selectedType = typeInstructions[type] || typeInstructions.thank_you;
    const selectedTone = toneInstructions[tone] || toneInstructions.warm;

    // If no API key is available, generate a high-quality personalized template fallback
    if (!apiKey) {
      console.warn('GEMINI_API_KEY is not set. Generating template fallback.');
      const fallbackSubject = type === 'coffee_chat'
        ? `Great meeting you at ${event?.title || 'the event'} — coffee chat?`
        : type === 'reconnect'
        ? `Catching up / Quick note from ${userSenderName || 'AfterHello'}`
        : `Great meeting you at ${event?.title || 'the event'}!`;

      const fallbackBody = `Hi ${person.name.split(' ')[0]},\n\n` +
        `It was great connecting with you at ${event?.title || 'the event'}${person.meetingContext ? ` (${person.meetingContext.toLowerCase()})` : ''}.\n\n` +
        (person.notes ? `I really enjoyed our conversation about ${person.topics?.slice(0, 2).join(' and ') || 'your work'}—especially your perspective on ${person.notes.slice(0, 80)}...\n\n` : '') +
        (type === 'coffee_chat'
          ? `If you have 20 minutes sometime next week or the week after, I'd love to grab a coffee (or jump on a quick Zoom) to hear more about what you're building at ${person.company || 'your team'}.\n\n`
          : `Thanks again for sharing your thoughts. Wishing you all the best with your projects!\n\n`) +
        `Best regards,\n${userSenderName || '[Your Name]'}`;

      return res.json({
        subject: fallbackSubject,
        body: fallbackBody,
        alternativeOpenings: [
          `It was a pleasure crossing paths at ${event?.title || 'the event'}.`,
          `Hope you had a smooth trip back after ${event?.title || 'the event'}!`,
          `Quick follow-up after our conversation yesterday.`,
        ],
        suggestedFollowUpDays: 4,
        callToAction: type === 'coffee_chat' ? 'Propose 2-3 specific times or a calendar link' : 'Open-ended warm sign-off',
        isFallback: true,
        notice: 'Draft generated with smart local template. Configure GEMINI_API_KEY in Settings > Secrets for Gemini AI personalization.',
      });
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    const promptContext = `
You are an expert networking and relationship follow-up assistant in the AfterHello app.
Generate an authentic, high-quality, personalized email draft for following up with someone met at an event.

CONTEXT:
- Recipient Name: ${person.name}
- Recipient Role/Headline: ${person.headline || 'N/A'}
- Recipient Company: ${person.company || 'N/A'}
- Event Title: ${event?.title || person.eventName || 'N/A'}
- Event Date / Location: ${event?.date || person.meetingDate || 'Recently'} at ${event?.location || 'event'}
- How we met / Context: ${person.meetingContext || 'Met at the event'}
- Conversation Topics: ${person.topics && person.topics.length ? person.topics.join(', ') : 'General industry discussion'}
- Detailed Notes from Meeting: ${person.notes || 'Had an engaging conversation'}
- Mutual Connections / Personal details: ${person.personalNotes || person.mutualConnections || 'None'}

GOAL & STYLE:
- Draft Type: ${type} (${selectedType})
- Desired Tone: ${selectedTone}
- Sender's Name to sign with: ${userSenderName || '[Your Name]'}
${writingSample ? `- Sender's Style / Voice Sample to emulate:\n"""${writingSample}"""` : ''}
${customGoal ? `- Additional Custom Goal from user: ${customGoal}` : ''}

CRITICAL RULES:
1. Never sound like a generic AI sales pitch or robotic newsletter.
2. Directly and naturally mention specific topics, anecdotes, or projects from the notes (e.g. mention specific projects, tools, or ideas they spoke about).
3. Keep it sincere, grounded, and concise. Do NOT use buzzwords or hollow flattery.
4. Provide 2-3 alternative opening sentences so the user can easily swap them in.
5. Provide a realistic suggested follow-up window (number of days).
`.trim();

    // Call Gemini with timeout and retry
    let responseText: string | undefined;

    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const geminiPromise = ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: promptContext,
          config: {
            systemInstruction: 'You write impeccable, human, warm follow-up emails for professionals and founders. You never sound robotic or sycophantic. Return structured JSON only.',
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                subject: {
                  type: Type.STRING,
                  description: 'A natural, contextual subject line. Avoid spammy capitalization or artificial urgency.',
                },
                body: {
                  type: Type.STRING,
                  description: 'The complete email body text with natural greeting, paragraphs, and sign-off.',
                },
                alternativeOpenings: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: '2 to 3 alternative strong first sentences.',
                },
                suggestedFollowUpDays: {
                  type: Type.INTEGER,
                  description: 'Number of business days to wait before sending a gentle nudge if no reply.',
                },
                callToAction: {
                  type: Type.STRING,
                  description: 'The primary question or next step asked in the email.',
                },
              },
              required: ['subject', 'body', 'alternativeOpenings'],
            },
          },
        });

        // Timeout race: 6 seconds per attempt
        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Gemini API timeout')), 6000)
        );

        const response = await Promise.race([geminiPromise, timeoutPromise]);
        responseText = response.text;
        if (responseText) break;
      } catch (err: any) {
        console.warn(`Gemini attempt ${attempt} warning:`, err.message || err);
        if (attempt < 2) {
          await new Promise((r) => setTimeout(r, 800));
        }
      }
    }

    if (!responseText) {
      console.warn('Gemini request failed after retries. Serving smart fallback draft.');
      const fallbackSubject = type === 'coffee_chat'
        ? `Great meeting you at ${event?.title || person.eventName || 'the event'} — coffee chat?`
        : type === 'reconnect'
        ? `Reconnecting / Quick note from ${userSenderName || '[Your Name]'}`
        : `Great meeting you at ${event?.title || person.eventName || 'the event'}!`;

      const fallbackBody = `Hi ${person.name.split(' ')[0]},\n\n` +
        `It was great connecting with you at ${event?.title || person.eventName || 'the event'}${person.meetingContext ? ` (${person.meetingContext.toLowerCase()})` : ''}.\n\n` +
        (person.notes ? `I really enjoyed our conversation about ${person.topics?.slice(0, 2).join(' and ') || 'your work'}—especially your perspective on ${person.notes.slice(0, 100)}...\n\n` : '') +
        (type === 'coffee_chat'
          ? `If you have 20 minutes sometime next week or the week after, I'd love to grab a coffee (or jump on a quick Zoom) to hear more about what you're building at ${person.company || 'your team'}.\n\n`
          : `Thanks again for sharing your thoughts. Wishing you all the best with your projects!\n\n`) +
        `Best regards,\n${userSenderName || '[Your Name]'}`;

      return res.json({
        subject: fallbackSubject,
        body: fallbackBody,
        alternativeOpenings: [
          `It was a pleasure crossing paths at ${event?.title || person.eventName || 'the event'}.`,
          `Hope you had a smooth trip back after ${event?.title || person.eventName || 'the event'}!`,
          `Quick follow-up after our conversation yesterday.`,
        ],
        suggestedFollowUpDays: 4,
        callToAction: type === 'coffee_chat' ? 'Propose 2-3 flexible times' : 'Warm sign-off',
        isFallback: true,
      });
    }

    const parsed = JSON.parse(responseText);
    return res.json(parsed);
  } catch (error: any) {
    console.error('Error generating email with Gemini:', error);
    return res.status(500).json({
      error: error.message || 'Failed to generate email with Gemini.',
      details: error.status || error.code || null,
    });
  }
}

// Register API route
app.post('/api/generate-email', (req, res) => {
  handleGenerateEmail(req, res);
});

// Health check route
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
    timestamp: new Date().toISOString(),
  });
});

// In development, hook into Vite; in production, serve built dist files
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`AfterHello server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
