import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3000;

// Setup limits to handle base64 images elegantly
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Lazy initializer for Gemini client
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is required but not configured. Please add it to your secrets configuration in the Secrets panel.");
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

// API endpoint 1: Recognize Incorrect Question (OCR + Analysis)
app.post("/api/ocr", async (req, res) => {
  try {
    const { image, mimeType } = req.body;
    if (!image) {
      return res.status(400).json({ error: "No image content provided." });
    }

    let cleanBase64 = image;
    let finalMimeType = mimeType || "image/jpeg";

    if (image.startsWith("data:")) {
      const parts = image.split(";base64,");
      if (parts.length === 2) {
        finalMimeType = parts[0].replace("data:", "");
        cleanBase64 = parts[1];
      }
    }

    const ai = getGeminiClient();

    const imagePart = {
      inlineData: {
        mimeType: finalMimeType,
        data: cleanBase64,
      },
    };

    const textPart = {
      text: `You are an expert OCR and exam question analyzer specialized in primary school education (Grades 1-6) in China. 
Analyze the provided image of a primary school homework or exam question. Extract the content and output it EXACTLY according to the requested JSON layout. 
Make sure you translate math formulas into easily readable format or clear LaTeX/Markdown styling where appropriate.

Extract:
1. questionText: The full body of the academic question. Do not truncate.
2. options: Array of multiple-choice choices (e.g. ["A. ...", "B. ..."]) if present. If not a multiple choice question, return an empty array.
3. userAnswer: The student's written response, standard handwritten mark, or selected answer option if visible in the image. Otherwise return an empty string "".
4. correctAnswer: Standard correct answer if recognizable / printed on the sheet. Otherwise return empty string "".
5. knowledgePoint: A highly accurate academic knowledge point keyword suitable for Chinese primary school curriculum (e.g., "乘法分配律", "古诗词默写", "单词同义词", "分数的加减法", "动词过去式变化"). Keep it short and academic.
6. subject: The subject name, strictly restricted to one of: "数学", "语文", "英语".
7. grade: The estimated primary school grade level, strictly restricted to one of: "一年级", "二年级", "三年级", "四年级", "五年级", "六年级".`
    };

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: { parts: [imagePart, textPart] },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            questionText: {
              type: Type.STRING,
              description: "The full text of the question, including inline equations where applicable.",
            },
            options: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Multiple choice options, or empty array if non-multiple choice.",
            },
            userAnswer: {
              type: Type.STRING,
              description: "The user's handwritten or selected answer, if visible; else empty string.",
            },
            correctAnswer: {
              type: Type.STRING,
              description: "The standard/correct answer, if visible; else empty string.",
            },
            knowledgePoint: {
              type: Type.STRING,
              description: "Academic knowledge point keyword phrase (e.g., '乘法分配律').",
            },
            subject: {
              type: Type.STRING,
              description: "The subject name, strictly one of: '数学', '语文', '英语'.",
            },
            grade: {
              type: Type.STRING,
              description: "The primary school grade level, strictly one of: '一年级', '二年级', '三年级', '四年级', '五年级', '六年级'.",
            }
          },
          required: ["questionText", "options", "userAnswer", "correctAnswer", "knowledgePoint", "subject", "grade"]
        }
      }
    });

    const resultText = response.text || "{}";
    const data = JSON.parse(resultText);
    return res.json(data);
  } catch (err: any) {
    console.error("OCR API error:", err);
    return res.status(500).json({ error: err.message || "Failed to process question OCR" });
  }
});

// API endpoint 2: Generate Similar Questions (举一反三)
app.post("/api/generate-similar", async (req, res) => {
  try {
    const { questionText, options, knowledgePoint, subject, grade } = req.body;
    if (!questionText || !knowledgePoint) {
      return res.status(400).json({ error: "Missing required parameters: questionText or knowledgePoint." });
    }

    const ai = getGeminiClient();

    const formattedOptions = options && options.length > 0 ? options.map((opt: string) => `- ${opt}`).join("\n") : "";

    const userPrompt = `You are an expert, patient primary school teacher specializing in the subject "${subject || "全科"}" for ${grade || "小学 (1-6年级)"} in China.
A primary school student is struggling with a homework or exam question in the knowledge point "${knowledgePoint}".
The student's original question is:
---
${questionText}
${formattedOptions ? `Options:\n${formattedOptions}` : ""}
---

Generate exactly 3 (three) different similar practice questions ("举一反三") covering the SAME core knowledge point "${knowledgePoint}".
CRITICAL GUIDELINES:
1. Target Grade appropriateness: Make sure the vocabulary, complexity, operations, and wording are PERFECTLY appropriate for ${grade || "小学 1-6 年级"} student cognitive levels. For example, do not use advanced formulas like quadratic discriminant for primary schoolers, instead use primary school concepts.
2. Cover the same concept but check it from different angles, cute narrative variant scenarios (e.g., using apples, animals, sharing toys, or primary school contexts like sports meet, reading clubs).
3. Under no circumstances duplicate the original question. Be creative but mathematically/grammatically accurate for primary level.
4. Each generated question must include:
   - questionText: String representing the question text.
   - options: An array of strings representing options if multiple-choice, or empty array if open/fill blank/short-answer.
   - answer: The correct standard answer.
   - explanation: A detailed step-by-step resolution written in simple, encouraging language suitable for primary school students, highlighting common traps, common misunderstandings, or typical student mistakes (易错点分析). Point out exactly what students of this grade usually fail to consider (e.g. forgot units like 厘米/平方厘米, misread singular/plural in English, etc.). Use markdown bold tags such as **易错点提示** or similar in the string to draw maximum attention.

Please provide the response in a structured JSON layout.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: userPrompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              questionText: { type: Type.STRING, description: "The content of the generated practice question." },
              options: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "List of multiple-choice options, or empty array if open/fill in the blank."
              },
              answer: { type: Type.STRING, description: "The accurate correct answer." },
              explanation: { type: Type.STRING, description: "Detailed explanation highlighting common mistakes (易错点解析)." }
            },
            required: ["questionText", "options", "answer", "explanation"]
          }
        }
      }
    });

    const resultText = response.text || "[]";
    const data = JSON.parse(resultText);
    return res.json(data);
  } catch (err: any) {
    console.error("Generate similar error:", err);
    return res.status(500).json({ error: err.message || "Failed to generate similar questions." });
  }
});

// Configure Vite middleware in development vs static files in production
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
