
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

const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

function getStatusCode(error: unknown): number | undefined {
  if (typeof error !== "object" || error === null) {
    return undefined;
  }

  const err = error as {
    status?: number;
    code?: number;
    message?: string;
  };

  if (typeof err.status === "number") return err.status;
  if (typeof err.code === "number") return err.code;

  const message = err.message ?? "";
  const match = message.match(/\b(429|500|502|503|504)\b/);

  return match ? Number(match[1]) : undefined;
}

export async function POST(request: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return Response.json(
        { error: "GEMINI_API_KEY is missing in environment variables." },
        { status: 500 }
      );
    }

    const body = await request.json();

    const code =
      typeof body.code === "string" ? body.code : "";

    const language =
      typeof body.language === "string" ? body.language : "";

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

    // Retry Gemini when temporary server errors occur.
    let stream: Awaited<
      ReturnType<typeof ai.models.generateContentStream>
    > | undefined;

    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        console.log(`Gemini generation attempt: ${attempt}`);

        stream = await ai.models.generateContentStream({
          model: "gemini-3.8-flash",
          contents: prompt,
          config: {
            maxOutputTokens: 2048,
          },
        });

        break;
      } catch (error) {
        const status = getStatusCode(error);

        console.error(
          `Gemini attempt ${attempt} failed:`,
          error
        );

        const retryable =
          status === 429 ||
          status === 500 ||
          status === 502 ||
          status === 503 ||
          status === 504;

        if (!retryable || attempt === 3) {
          throw error;
        }

        await sleep(attempt * 2000);
      }
    }

    if (!stream) {
      throw new Error("Gemini service is temporarily unavailable.");
    }

    const encoder = new TextEncoder();

    const readable = new ReadableStream({
      async start(controller) {
        let receivedText = false;

        try {
          for await (const chunk of stream!) {
            const text = chunk.text;

            if (text) {
              receivedText = true;
              controller.enqueue(encoder.encode(text));
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

    const status = getStatusCode(error);

    let message = "Unable to generate the code review.";

    if (status === 429) {
      message = "Gemini API quota or rate limit exceeded. Please try later.";
    } else if (status === 503) {
      message = "Gemini is experiencing high demand. Please try again later.";
    } else if (status === 504) {
      message = "Gemini request timed out. Please try again.";
    } else if (status === 401 || status === 403) {
      message = "Gemini API authentication failed. Check your API key.";
    } else if (status === 404) {
      message = "Gemini model not found or unavailable.";
    } else if (error instanceof Error) {
      message = error.message;
    }

    return Response.json(
      { error: message },
      { status: 500 }
    );
  }
}
