
import { GoogleGenAI } from "@google/genai";

export const runtime = "nodejs";
export const maxDuration = 60;

const ALLOWED_LANGUAGES = [
  "Java",
  "Python",
  "C++",
  "JavaScript",
  "TypeScript",
  "C",
  "Go",
  "PHP",
];

export async function POST(request: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return Response.json(
        { error: "Gemini API key is missing. Check your .env.local file." },
        { status: 500 }
      );
    }

    const body = await request.json();

    const code =
      typeof body.code === "string" ? body.code : "";

    const language =
      typeof body.language === "string" ? body.language : "";

    // Validate code
    if (!code.trim()) {
      return Response.json(
        { error: "Please paste some code first." },
        { status: 400 }
      );
    }

    if (code.length > 20000) {
      return Response.json(
        { error: "Code exceeds the 20,000 character limit." },
        { status: 413 }
      );
    }

    // Validate programming language
    if (!ALLOWED_LANGUAGES.includes(language)) {
      return Response.json(
        { error: "Unsupported programming language." },
        { status: 400 }
      );
    }

    const ai = new GoogleGenAI({ apiKey });

    const prompt = `
You are CodeLens AI, an expert programming code reviewer.

Review the following ${language} code carefully.

Your responsibilities:
1. Identify actual bugs and logical errors.
2. Explain why each bug occurs.
3. Identify potential runtime errors.
4. Suggest improvements for readability and performance.
5. Explain time and space complexity where applicable.
6. Provide corrected code.

IMPORTANT:
- Do not claim that you executed the code.
- Do not invent bugs that are not present.
- If the code is correct, clearly say so.
- Explain issues in beginner-friendly language.
- Include practical examples where useful.
- Always format code using Markdown code blocks.

Use this response structure:

## Overall Assessment

## Bugs and Potential Issues

## Suggested Improvements

## Time Complexity

## Space Complexity

## Improved Code

Programming Language: ${language}

Code to Review:
\`\`\`${language.toLowerCase()}
${code}
\`\`\`
`;

    // Start Gemini streaming generation
    const stream = await ai.models.generateContentStream({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        maxOutputTokens: 4096,
        temperature: 0.3,
      },
    });

    const encoder = new TextEncoder();

    const readable = new ReadableStream({
      async start(controller) {
        let receivedText = false;

        try {
          for await (const chunk of stream) {
            const text = chunk.text;

            if (text) {
              receivedText = true;

              controller.enqueue(
                encoder.encode(text)
              );
            }
          }

          if (!receivedText) {
            controller.enqueue(
              encoder.encode(
                "\n\nThe AI returned an empty response. Please try again."
              )
            );
          }

          controller.close();

        } catch (error) {
          console.error("Gemini streaming error:", error);

          controller.enqueue(
            encoder.encode(
              "\n\n[AI ERROR] The review was interrupted. Please try again."
            )
          );

          controller.close();
        }
      },

      cancel() {
        console.log("Client cancelled the review.");
      },
    });

    return new Response(readable, {
      status: 200,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        "X-Content-Type-Options": "nosniff",
      },
    });

  } catch (error) {
    console.error("CodeLens API error:", error);

    return Response.json(
      {
        error:
          "Unable to generate the code review. Check your API key, model access, and server logs.",
      },
      { status: 500 }
    );
  }
}
