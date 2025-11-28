import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import config from '../config';
import fs from 'fs';
import path from 'path';
import { getToolDefinitions, executeTool } from '../tools';
import { getSystemPrompt, validateTemperature, validateMaxTokens } from '../config/system-prompt';

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  tool_calls?: Array<{
    id: string;
    type: string;
    function: {
      name: string;
      arguments: string;
    };
  }>;
}

interface ChatBody {
  model?: string;
  messages?: Message[];
  stream?: boolean;
  temperature?: number;
  max_tokens?: number;
  userLocation?: {
    city?: string;
    country?: string;
    latitude?: number;
    longitude?: number;
  };
}

/**
 * Chat route for conversational mode using Ollama's /api/chat endpoint.
 * Maintains conversation history and uses lower temperature for consistent responses.
 */
export async function chatRoutes(fastify: FastifyInstance) {
  fastify.post('/api/chat', async (req: FastifyRequest<{ Body: ChatBody }>, reply: FastifyReply) => {
  const body = req.body as ChatBody;
  // Use centralized config for environment variables
  const ollamaHost = config.ollamaHost;

    // Greeting filter: If user message is a greeting, return welcome message and block tool calls
    // Inject system message at the start if not already present
    const messages = body.messages || [];
    if (messages.length === 0 || messages[0].role !== 'system') {
      messages.unshift({ role: 'system', content: getSystemPrompt('chat', body.userLocation) });
    } else {
      // Replace existing system message with our enhanced one
      messages[0] = { role: 'system', content: getSystemPrompt('chat', body.userLocation) };
    }

    // Greeting filter: Only respond with welcome message for exact greetings in latest user message
    const userMessages = messages.filter(m => m.role === 'user');
    const latestUserMessage = userMessages.length > 0 ? userMessages[userMessages.length - 1].content.trim().toLowerCase() : '';
    const greetings = ['hi', 'hello', 'hey', 'greetings', 'good morning', 'good afternoon', 'good evening'];
    if (latestUserMessage && greetings.some(greet => latestUserMessage === greet)) {
      return reply.send({
        success: true,
        message: {
          role: 'assistant',
          content: 'Hello! Welcome to andhru, your personal assistant. How can I help you today?'
        },
        toolsUsed: false
      });
    }

    // Validate and set temperature and maxTokens (use 'chat' mode)
    const temperature = validateTemperature(body.temperature ?? 0.3, 'chat');
    const maxTokens = validateMaxTokens(body.max_tokens ?? 500, 'chat');

    // Get tool definitions for function calling
    const tools = getToolDefinitions();

    // Build payload for Ollama's /api/chat endpoint
    // All models now support tool calling
    // Set qwen3:0.6b as default/preferred model
    const modelName = body.model || 'qwen3:0.6b';
    const payload: any = {
      model: modelName,
      messages,
      stream: !!body.stream,
      options: {
        temperature,
        num_predict: maxTokens,
      },
    };
    // Always add tools for all models (unless streaming)
    if (!body.stream) {
      payload.tools = tools;
    }

    fastify.log.info(`Ollama request: model=${payload.model}, messages=${messages.length}, stream=${payload.stream}, tools=${!!payload.tools}`);

    try {
      // If streaming requested, proxy the raw response stream
      if (payload.stream) {
        const res = await fetch(`${ollamaHost}/api/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        reply.code(res.status);
        if (!res.body) {
          return reply.send({ success: false, message: 'No stream from Ollama' });
        }

        const PassThrough = require('stream').PassThrough;
        const pass = new PassThrough();
        const reader = res.body.getReader();

        (async () => {
          try {
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;
              pass.write(value);
            }
          } catch (e: any) {
            fastify.log.error({ err: e }, 'Chat stream error');
          } finally {
            pass.end();
          }
        })();

        reply.type('application/octet-stream');
        return reply.send(pass);
      }

      // Non-streaming - Handle function calling loop
      let currentMessages = [...payload.messages];
      let maxIterations = 5; // Prevent infinite loops
      let iteration = 0;
      
      let totalToolCalls = 0;
      // Prepare log file path for this model
      const logDir = path.join(__dirname, '../model-logs');
      if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });
      const logFile = path.join(logDir, `${modelName.replace(/[^a-zA-Z0-9_-]/g, '_')}.log`);
      while (iteration < maxIterations) {
        iteration++;

          let res, json;
          try {
            res = await fetch(`${ollamaHost}/api/chat`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ ...payload, messages: currentMessages }),
            });
          } catch (err) {
            fastify.log.error('Ollama fetch failed:', err);
            return reply.status(503).send({ error: 'AI backend is temporarily unavailable. Please try again later.' });
          }

          if (!res.ok) {
            const errorText = await res.text();
            fastify.log.error(`Ollama HTTP error: ${res.status} - ${errorText}`);
            return reply.status(res.status).send({ error: `AI backend error: ${res.statusText}. Please try again later.` });
          }

          try {
            json = await res.json();
          } catch (err) {
            fastify.log.error('Ollama response JSON parse failed:', err);
            return reply.status(502).send({ error: 'AI backend returned invalid response. Please try again.' });
          }
          fastify.log.info(`Ollama response OK, iteration ${iteration}`);
          const assistantMessage = json.message;

          // Force tool usage for web/company/product questions
          const userQuestion = currentMessages.find(m => m.role === 'user')?.content?.toLowerCase() || '';
          const webKeywords = ['website', 'company', 'product', 'what is', 'who is', 'tell me about', '.com', '.net', '.org', 'lab', 'guru'];
          const shouldForceTool = webKeywords.some(k => userQuestion.includes(k));
          const toolCalls = json.tool_calls || [];

          if (shouldForceTool && toolCalls.length === 0) {
            // Run searchAndScrape and append result
            const scrapeResult = await require('../tools/webTools').searchAndScrape(userQuestion);
            let appended = assistantMessage?.content || '';
            appended += '\n\n---\nWeb Search & Scrape Result:\n';
            appended += scrapeResult.extractedText || scrapeResult.pageTitle || scrapeResult.foundUrl || 'No data found.';
            return reply.send({
              success: true,
              message: {
                role: 'assistant',
                content: appended
              },
              toolsUsed: true,
              scrapeResult
            });
          }
        // Check if AI wants to call a tool
        if (assistantMessage?.tool_calls && assistantMessage.tool_calls.length > 0) {
          // Add assistant message with tool calls to history
          currentMessages.push(assistantMessage);

          // Execute all tool calls
          for (const toolCall of assistantMessage.tool_calls) {
            totalToolCalls++;
            const toolName = toolCall.function.name;
            let toolArgs;
            if (typeof toolCall.function.arguments === 'string') {
              toolArgs = JSON.parse(toolCall.function.arguments);
            } else {
              toolArgs = toolCall.function.arguments;
            }
            const callLog = `\n[${new Date().toISOString()}] TOOL CALL: Model: ${modelName}, Tool: ${toolName}, Args: ${JSON.stringify(toolArgs, null, 2)}`;
            fastify.log.info(callLog);
            fs.appendFileSync(logFile, callLog);
            // Execute the tool
            const toolResult = await executeTool(toolName, toolArgs);
            const respLog = `\n[${new Date().toISOString()}] TOOL RESPONSE: Tool: ${toolName}, Result: ${JSON.stringify(toolResult, null, 2)}`;
            fastify.log.info(respLog);
            fs.appendFileSync(logFile, respLog);
            // Add tool result to message history
            currentMessages.push({
              role: 'tool' as any,
              content: JSON.stringify(toolResult),
              tool_call_id: toolCall.id,
            } as any);
          }
          // Continue the loop to let AI process tool results
          continue;
        }
        
        // No more tool calls - return final response
        const responseText = assistantMessage?.content || json.response || '';
        
        fastify.log.info(`🔧 [TOOL SUMMARY] Model: ${modelName}, Total tool calls: ${totalToolCalls}`);
        return reply.send({ 
          success: true, 
          message: {
            role: 'assistant',
            content: responseText
          },
          toolsUsed: totalToolCalls > 0, // Indicates if tools were called
          toolCallCount: totalToolCalls,
          raw: json 
        });
      }
      
      // Max iterations reached
      return reply.send({
        success: true,
        message: {
          role: 'assistant',
          content: 'I apologize, but I encountered too many tool calls. Please try rephrasing your question.'
        },
        error: 'Max tool call iterations reached'
      });
    } catch (err: any) {
      const errorMsg = err?.message || String(err);
      const errorStack = err?.stack || '';
      fastify.log.error(`Chat error: ${errorMsg}`);
      if (errorStack) fastify.log.error(`Stack: ${errorStack}`);
      return reply.code(500).send({ 
        message: errorMsg
      });
    }
  });
}
