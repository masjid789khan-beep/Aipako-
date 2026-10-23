import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// Enable JSON body parsing with large payload limit for images
app.use(express.json({ limit: '25mb' }));

// Initialize GoogleGenAI instance safely
const apiKey = process.env.GEMINI_API_KEY || '';
const ai = apiKey
  ? new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

// System instruction for AIPAKO AI
const DEFAULT_AIPAKO_SYSTEM = `You are AIPAKO AI, a cutting-edge personal AI assistant. 
Tagline: "Your Smart World, Powered by AI".
Personality: Friendly, razor-sharp, helpful, and professional. 
Capabilities:
- Intelligent conversation and question answering.
- Creative and professional writing (emails, stories, code, essays).
- Multi-language translation (English, Urdu, Hindi, Spanish, French, Arabic, German, etc.).
- Summarization and complex concept explanation.
- Productivity organization (notes, tasks, schedules).
- Guiding users through Android phone tools, permissions, and device integrations.

Formatting: Use clean Markdown with clear headings, bullet points, and code blocks with language tags when appropriate. Keep responses concise yet thorough.`;

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    hasApiKey: Boolean(apiKey),
    model: 'gemini-3.8-flash',
    timestamp: new Date().toISOString(),
  });
});

// Chat endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { messages, systemInstruction, image, preferredLanguage } = req.body;

    if (!ai) {
      return res.status(500).json({
        error: 'Gemini API key is not configured in server environment. Please set GEMINI_API_KEY in the Secrets panel.',
      });
    }

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Messages array is required.' });
    }

    // Format conversation history
    const contents: any[] = [];

    // Add prior turns
    for (let i = 0; i < messages.length - 1; i++) {
      const msg = messages[i];
      contents.push({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }],
      });
    }

    // Format the latest message
    const lastMessage = messages[messages.length - 1];
    const lastParts: any[] = [];

    if (image && image.data && image.mimeType) {
      lastParts.push({
        inlineData: {
          mimeType: image.mimeType,
          data: image.data,
        },
      });
    }

    lastParts.push({ text: lastMessage.content });

    contents.push({
      role: 'user',
      parts: lastParts,
    });

    const langInstruction = preferredLanguage && preferredLanguage !== 'English' 
      ? ` Please answer primarily in ${preferredLanguage} unless explicitly requested otherwise.` 
      : '';

    let responseText = '';
    const modelsToTry = ['gemini-3.8-flash', 'gemini-3.1-flash-lite', 'gemini-flash-latest'];
    let lastError: any = null;

    for (const modelName of modelsToTry) {
      try {
        const response = await ai.models.generateContent({
          model: modelName,
          contents,
          config: {
            systemInstruction: (systemInstruction || DEFAULT_AIPAKO_SYSTEM) + langInstruction,
            temperature: 0.7,
          },
        });
        if (response?.text) {
          responseText = response.text;
          break;
        }
      } catch (e: any) {
        lastError = e;
        console.warn(`Attempt with ${modelName} encountered error:`, e.message);
        // Wait 600ms before fallback
        await new Promise((r) => setTimeout(r, 600));
      }
    }

    if (responseText) {
      return res.json({ reply: responseText });
    }

    // Format human readable error
    let userMsg = 'Gemini servers are currently experiencing high demand. Please tap Retry.';
    if (lastError?.message) {
      try {
        const parsed = JSON.parse(lastError.message);
        if (parsed.error?.message) {
          userMsg = parsed.error.message;
        }
      } catch {
        userMsg = lastError.message;
      }
    }

    res.status(500).json({ error: userMsg });
  } catch (err: any) {
    console.error('Error in /api/chat:', err);
    res.status(500).json({
      error: 'Failed to process chat message with Gemini API. Please tap Retry.',
    });
  }
});

// AI Writing Studio endpoint
app.post('/api/generate-content', async (req, res) => {
  try {
    const { type, topic, style, audience, length, language, context } = req.body;

    if (!ai) {
      return res.status(500).json({
        error: 'Gemini API key is not configured in server environment.',
      });
    }

    const isHtml = type === 'html';
    const prompt = isHtml
      ? `Act as an expert frontend engineer and web designer for AIPAKO AI.
Task: Create a complete, responsive, and beautiful HTML page or component.
Request: ${topic}
Framework / Style: ${style || 'Tailwind CSS CDN'}
Target: ${audience || 'Mobile Web'}
Length: ${length || 'Comprehensive'}
Language: ${language || 'English'}
${context ? `Additional Context: ${context}` : ''}

Requirements:
- Provide a complete, self-contained HTML snippet or page wrapped in a \`\`\`html code block.
- Include responsive styling (use Tailwind CDN \`<script src="https://cdn.tailwindcss.com"></script>\` or clean embedded \`<style>\`).
- Make it visual, modern, and interactive if appropriate.
- Provide a brief introductory description before the code.`
      : `Act as an expert copywriter and content creator for AIPAKO AI.
Task: Create high quality ${type || 'content'}.
Topic / Request: ${topic}
Style / Tone: ${style || 'Professional and engaging'}
Target Audience: ${audience || 'General'}
Desired Length: ${length || 'Medium'}
Language: ${language || 'English'}
${context ? `Additional Context: ${context}` : ''}

Provide a polished, ready-to-use piece formatted beautifully in Markdown with suitable headlines, paragraphs, and bullet points if needed.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: DEFAULT_AIPAKO_SYSTEM,
      },
    });

    res.json({ content: response.text || '' });
  } catch (err: any) {
    console.error('Error in /api/generate-content:', err);
    res.status(500).json({ error: err?.message || 'Failed to generate content.' });
  }
});

// Translation endpoint
app.post('/api/translate', async (req, res) => {
  try {
    const { text, sourceLang, targetLang } = req.body;

    if (!ai) {
      return res.status(500).json({
        error: 'Gemini API key is not configured in server environment.',
      });
    }

    if (!text) {
      return res.status(400).json({ error: 'Text to translate is required.' });
    }

    const prompt = `Translate the following text from ${sourceLang || 'Auto-detect'} to ${targetLang || 'English'}.
Text:
"""${text}"""

Provide the output in JSON format with these exact keys:
- "translatedText": the accurate, natural translation
- "detectedSourceLang": detected or confirmed source language
- "pronunciation": romanized pronunciation or phonetics if applicable, otherwise brief notes
- "alternativePhrasing": 1-2 alternative ways to say this (if appropriate)`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    try {
      const parsed = JSON.parse(response.text || '{}');
      res.json(parsed);
    } catch {
      res.json({
        translatedText: response.text || '',
        detectedSourceLang: sourceLang || 'Auto',
        pronunciation: '',
      });
    }
  } catch (err: any) {
    console.error('Error in /api/translate:', err);
    res.status(500).json({ error: err?.message || 'Failed to translate text.' });
  }
});

// Summarization endpoint
app.post('/api/summarize', async (req, res) => {
  try {
    const { text, format, focus } = req.body;

    if (!ai) {
      return res.status(500).json({
        error: 'Gemini API key is not configured in server environment.',
      });
    }

    if (!text) {
      return res.status(400).json({ error: 'Text to summarize is required.' });
    }

    const prompt = `Summarize the following text for AIPAKO AI.
Summary Format requested: ${format || 'Bullet-point summary'}
${focus ? `Specific Focus: ${focus}` : ''}

Original Text:
"""${text}"""

Requirements:
- Extract key takeaways, core ideas, and essential nuances.
- Format cleanly in Markdown with bold highlights.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: DEFAULT_AIPAKO_SYSTEM,
      },
    });

    res.json({ summary: response.text || '' });
  } catch (err: any) {
    console.error('Error in /api/summarize:', err);
    res.status(500).json({ error: err?.message || 'Failed to summarize text.' });
  }
});

// Vision Analysis endpoint
app.post('/api/vision', async (req, res) => {
  try {
    const { imageBase64, mimeType, task, prompt } = req.body;

    if (!ai) {
      return res.status(500).json({
        error: 'Gemini API key is not configured in server environment.',
      });
    }

    if (!imageBase64) {
      return res.status(400).json({ error: 'imageBase64 data is required.' });
    }

    let defaultPrompt = 'Describe what is in this image in detail.';
    if (task === 'ocr') {
      defaultPrompt = 'Extract all visible text from this image cleanly with accurate line breaks and spelling.';
    } else if (task === 'screenshot') {
      defaultPrompt = 'Analyze this user interface screenshot. Explain what application or website this is, its main components, UI hierarchy, buttons, and UX purpose.';
    } else if (task === 'qa') {
      defaultPrompt = prompt || 'Answer the user question regarding this image.';
    } else if (prompt) {
      defaultPrompt = prompt;
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType || 'image/jpeg',
              data: imageBase64,
            },
          },
          { text: defaultPrompt },
        ],
      },
    });

    res.json({ result: response.text || '' });
  } catch (err: any) {
    console.error('Error in /api/vision:', err);
    res.status(500).json({ error: err?.message || 'Failed to analyze image.' });
  }
});

// Text-to-Speech endpoint (Gemini TTS)
app.post('/api/tts', async (req, res) => {
  try {
    const { text, voiceName } = req.body;

    if (!ai) {
      return res.status(500).json({
        error: 'Gemini API key is not configured in server environment.',
      });
    }

    if (!text) {
      return res.status(400).json({ error: 'Text is required for TTS.' });
    }

    // Truncate to reasonable speaking length if long
    const cleanText = text.slice(0, 500);

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash-lite-tts',
      contents: [
        {
          role: 'user',
          parts: [{ text: cleanText }],
        },
      ],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: voiceName || 'Kore' },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) {
      return res.status(500).json({ error: 'No audio generated by model.' });
    }

    res.json({ audioBase64: base64Audio, format: 'audio/wav' });
  } catch (err: any) {
    console.error('Error in /api/tts:', err);
    res.status(500).json({
      error: err?.message || 'Failed to synthesize speech.',
    });
  }
});

// Download complete Android Studio project zip package
app.get('/api/download/android-project', (req, res) => {
  const zipPath = path.resolve(process.cwd(), 'aipako-android-project.zip');
  res.download(zipPath, 'aipako-android-project.zip', (err) => {
    if (err) {
      console.error('Error sending android project zip:', err);
      res.status(404).send('File not found');
    }
  });
});

// Development vs Production serving
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[AIPAKO AI] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
