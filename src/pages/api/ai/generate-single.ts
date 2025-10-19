import type { APIRoute } from "astro";
import { OpenRouterService } from "@/lib/openrouter.service.ts";

interface GenerateSingleRequest {
  sourceText: string;
}

interface GenerateSingleResponse {
  front: string;
  back: string;
}

export const POST: APIRoute = async ({ request }) => {
  try {
    // Parse request body
    const body: GenerateSingleRequest = await request.json();

    if (!body.sourceText) {
      return new Response(JSON.stringify({ error: "Source text is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const sourceText = body.sourceText.trim();

    if (sourceText.length < 10) {
      return new Response(JSON.stringify({ error: "Source text must be at least 10 characters long" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (sourceText.length > 10000) {
      return new Response(JSON.stringify({ error: "Source text must be less than 10,000 characters" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Get OpenRouter API key from environment
    const openRouterApiKey = import.meta.env.OPENROUTER_API_KEY;

    if (!openRouterApiKey) {
      console.error("OPENROUTER_API_KEY not found in environment variables");
      return new Response(JSON.stringify({ error: "AI service is not configured" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Initialize OpenRouter service
    const openRouterService = new OpenRouterService({
      apiKey: openRouterApiKey,
      apiEndpoint: "https://openrouter.ai/api/v1/chat/completions",
      defaultModel: "anthropic/claude-3-haiku:beta",
      systemMessage: "",
      modelParameters: {
        temperature: 0.7,
        max_tokens: 500,
      },
      responseFormat: {
        type: "json_schema",
        json_schema: {
          name: "flashcardResponse",
          strict: true,
          schema: {
            front: "string",
            back: "string",
          },
        },
      },
    });

    // Prepare the prompt for OpenRouter
    const prompt = `Create a single educational flashcard from the following text. Return ONLY a JSON object with "front" and "back" fields. The front should be a clear question or prompt, and the back should be a comprehensive but concise answer.

Text to create flashcard from:
${sourceText}

Return format:
{
  "front": "Question or prompt here",
  "back": "Answer or explanation here"
}`;

    // Call OpenRouter service
    let openRouterResponse;
    try {
      openRouterResponse = await openRouterService.sendChatMessage(prompt);
    } catch (error) {
      console.error("OpenRouter service error:", error);
      return new Response(JSON.stringify({ error: "Failed to generate flashcard with AI" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (!openRouterResponse.choices || !openRouterResponse.choices[0] || !openRouterResponse.choices[0].message) {
      console.error("Unexpected OpenRouter response format:", openRouterResponse);
      return new Response(JSON.stringify({ error: "Invalid response from AI service" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    const aiResponse = openRouterResponse.choices[0].message.content;

    // Parse the JSON response from AI
    let flashcardData: GenerateSingleResponse;

    try {
      // Clean the response - remove markdown code blocks if present
      const cleanedResponse = aiResponse.replace(/```json\s*|\s*```/g, "").trim();
      flashcardData = JSON.parse(cleanedResponse);
    } catch (parseError) {
      console.error("Failed to parse AI response as JSON:", aiResponse, parseError);
      return new Response(JSON.stringify({ error: "AI generated invalid response format" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Validate the parsed data
    if (!flashcardData.front || !flashcardData.back) {
      return new Response(JSON.stringify({ error: "AI failed to generate valid flashcard content" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Ensure content is within limits
    const front = flashcardData.front.trim();
    const back = flashcardData.back.trim();

    if (front.length > 200 || back.length > 500) {
      return new Response(JSON.stringify({ error: "Generated flashcard content exceeds size limits" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(
      JSON.stringify({
        front,
        back,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in generate-single API:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
