import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import config from '../config';
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

    // Use configured Ollama host
    const ollamaHost = config.ollamaHost || 'http://localhost:11434';

    // Get available tools for function calling
    const tools = getToolDefinitions();
    
    // Get proper system prompt for chat mode with location context
    const systemMessage = getSystemPrompt('chat', body.userLocation);
    
    // Validate and clamp temperature/tokens for chat mode
    const temperature = validateTemperature(body.temperature, 'chat'); // 0.2-0.4 range
    const maxTokens = validateMaxTokens(body.max_tokens, 'chat'); // 50-1000 range
    
    fastify.log.info(`Chat mode request: temp=${temperature}, tokens=${maxTokens}, location=${body.userLocation?.city || 'unknown'}`);
    
    // Inject system message at the start if not already present
    const messages = body.messages || [];
    if (messages.length === 0 || messages[0].role !== 'system') {
      messages.unshift({ role: 'system', content: systemMessage });
    } else {
      // Replace existing system message with our enhanced one
      messages[0] = { role: 'system', content: systemMessage };
    }
    
    // Build payload for Ollama's /api/chat endpoint
    // Only llama3.2 models support function calling with tools parameter
    const modelName = body.model || 'llama3.2';
    const supportsTools = modelName.startsWith('llama3.2');
    
    const payload: any = {
      model: modelName,
      messages,
      stream: !!body.stream,
      options: {
        temperature,
        num_predict: maxTokens,
      },
    };
    
    // Add tools only for models that support them (llama3.2 series)
    if (supportsTools && !body.stream) {
      payload.tools = tools;
    }
    
    fastify.log.info(`Ollama request: model=${payload.model}, messages=${messages.length}, stream=${payload.stream}, tools=${supportsTools}`);

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
      
      while (iteration < maxIterations) {
        iteration++;
        
        const res = await fetch(`${ollamaHost}/api/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...payload, messages: currentMessages }),
        });

        if (!res.ok) {
          const errorText = await res.text();
          fastify.log.error(`Ollama HTTP error: ${res.status} - ${errorText}`);
          throw new Error(`Ollama chat error: ${res.status} ${res.statusText}`);
        }

        const json = await res.json();
        fastify.log.info(`Ollama response OK, iteration ${iteration}`);
        const assistantMessage = json.message;
        
        // Check if AI wants to call a tool
        if (assistantMessage?.tool_calls && assistantMessage.tool_calls.length > 0) {
          // Add assistant message with tool calls to history
          currentMessages.push(assistantMessage);
          
          // Execute all tool calls
          for (const toolCall of assistantMessage.tool_calls) {
            const toolName = toolCall.function.name;
              let toolArgs;
              if (typeof toolCall.function.arguments === 'string') {
                toolArgs = JSON.parse(toolCall.function.arguments);
              } else {
                toolArgs = toolCall.function.arguments;
              }
            
            fastify.log.info(`🔧 Executing tool: ${toolName} with args:`, toolArgs);
            
            // Execute the tool
            const toolResult = await executeTool(toolName, toolArgs);
            
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
        
        return reply.send({ 
          success: true, 
          message: {
            role: 'assistant',
            content: responseText
          },
          toolsUsed: iteration > 1, // Indicates if tools were called
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
