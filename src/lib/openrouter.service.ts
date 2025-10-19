import { z } from "zod";

// Types and interfaces
interface OpenRouterConfig {
  apiKey: string;
  apiEndpoint: string;
  defaultModel: string;
  systemMessage: string;
  modelParameters: Record<string, any>;
  responseFormat: {
    type: "json_schema";
    json_schema: {
      name: string;
      strict: boolean;
      schema: Record<string, any>;
    };
  };
}

interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

interface OpenRouterResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: {
    index: number;
    message: ChatMessage;
    finish_reason: string;
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

interface SendChatMessageOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  [key: string]: any;
}

// Custom error class for unified error handling
class OpenRouterError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode?: number,
    public originalError?: Error
  ) {
    super(message);
    this.name = "OpenRouterError";
  }
}

// Zod schema for response validation
const openRouterResponseSchema = z.object({
  id: z.string(),
  object: z.string(),
  created: z.number(),
  model: z.string(),
  choices: z.array(
    z.object({
      index: z.number(),
      message: z.object({
        role: z.enum(["user", "assistant", "system"]),
        content: z.string(),
      }),
      finish_reason: z.string(),
    })
  ),
  usage: z.object({
    prompt_tokens: z.number(),
    completion_tokens: z.number(),
    total_tokens: z.number(),
  }),
});

export class OpenRouterService {
  // Public fields
  public readonly apiEndpoint: string;
  public readonly defaultModel: string;

  // Private fields
  private _config: OpenRouterConfig;
  private _lastResponse: OpenRouterResponse | null = null;

  constructor(config: OpenRouterConfig) {
    // Validate configuration
    if (!config.apiKey) {
      throw new OpenRouterError("INVALID_CONFIG", "API key is required");
    }
    if (!config.apiEndpoint) {
      throw new OpenRouterError("INVALID_CONFIG", "API endpoint is required");
    }
    if (!config.defaultModel) {
      throw new OpenRouterError("INVALID_CONFIG", "Default model is required");
    }

    this._config = { ...config };
    this.apiEndpoint = config.apiEndpoint;
    this.defaultModel = config.defaultModel;
  }

  // Public methods
  public async sendChatMessage(userMessage: string, options: SendChatMessageOptions = {}): Promise<OpenRouterResponse> {
    // Input validation
    if (!userMessage) {
      throw new OpenRouterError("INVALID_INPUT", "User message must be a non-empty string");
    }

    try {
      const payload = this._buildPayload(userMessage, options);
      const response = await this._makeRequest(payload);
      const validatedResponse = this._validateResponse(response);

      this._lastResponse = validatedResponse;
      return validatedResponse;
    } catch (error) {
      if (error instanceof OpenRouterError) {
        throw error;
      }

      // Handle network and other errors
      if (error instanceof TypeError && error.message.includes("fetch")) {
        throw new OpenRouterError("NETWORK_ERROR", "Failed to connect to OpenRouter API", undefined, error as Error);
      }

      throw new OpenRouterError("UNKNOWN_ERROR", "An unexpected error occurred", undefined, error as Error);
    }
  }

  public setModelParameters(params: Record<string, any>): void {
    // Validate parameters
    if (typeof params !== "object" || params === null) {
      throw new OpenRouterError("INVALID_PARAMETERS", "Parameters must be a valid object");
    }

    // Merge with existing parameters
    this._config.modelParameters = {
      ...this._config.modelParameters,
      ...params,
    };
  }

  public getLatestResponse(): OpenRouterResponse | null {
    return this._lastResponse;
  }

  // Private methods
  private _buildPayload(userMessage: string, options: SendChatMessageOptions): any {
    const messages: ChatMessage[] = [];

    // Add system message if configured
    if (this._config.systemMessage) {
      messages.push({
        role: "system",
        content: this._config.systemMessage,
      });
    }

    // Add user message
    messages.push({
      role: "user",
      content: userMessage,
    });

    return {
      model: options.model || this._config.defaultModel,
      messages,
      response_format: this._config.responseFormat,
      ...this._config.modelParameters,
      ...options,
    };
  }

  private async _makeRequest(payload: any): Promise<any> {
    const response = await fetch(this._config.apiEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this._config.apiKey}`,
        "HTTP-Referer": typeof window !== "undefined" ? window.location.origin : "",
        "X-Title": "10xDevs AI Service",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `API request failed with status ${response.status}`;

      // Handle specific HTTP status codes
      switch (response.status) {
        case 401:
          throw new OpenRouterError("AUTHENTICATION_ERROR", "Invalid API key", response.status);
        case 403:
          throw new OpenRouterError("AUTHORIZATION_ERROR", "Access forbidden", response.status);
        case 429:
          throw new OpenRouterError("RATE_LIMIT_ERROR", "Rate limit exceeded", response.status);
        case 400:
          throw new OpenRouterError("INVALID_REQUEST", "Bad request - check payload format", response.status);
        case 500:
        case 502:
        case 503:
          throw new OpenRouterError("SERVER_ERROR", "OpenRouter server error", response.status);
        default:
          if (errorText) {
            errorMessage += `: ${errorText}`;
          }
          throw new OpenRouterError("API_ERROR", errorMessage, response.status);
      }
    }

    return await response.json();
  }

  private _validateResponse(response: any): OpenRouterResponse {
    try {
      return openRouterResponseSchema.parse(response);
    } catch (error) {
      throw new OpenRouterError(
        "INVALID_RESPONSE",
        "API response does not match expected schema",
        undefined,
        error as Error
      );
    }
  }
}
