/**
 * Database Search Tool
 * 
 * Searches conversation history in MongoDB
 */

import mongoose from 'mongoose';
import { Conversation } from '../models/conversation';

interface DbSearchParams {
  query: string;
  userId?: string;
  limit?: number;
  embedding?: number[]; // Optional query embedding for semantic search
}

interface DbSearchResult {
  success: boolean;
  query: string;
  results: Array<{
    conversationId: string;
    title: string;
    matchedMessages: Array<{
      sender: string;
      text: string;
      timestamp: Date;
    }>;
    createdAt: Date;
  }>;
  totalResults: number;
}

/**
 * Search conversation history in MongoDB
 */
export async function dbSearch(params: DbSearchParams): Promise<DbSearchResult> {
  const { query, userId, limit = 10, embedding } = params;

  try {
    let conversations: any[] = [];
    // If embedding is provided, use vector search
    if (embedding && embedding.length > 0) {
      // MongoDB vector search (requires Atlas/Enterprise)
      conversations = await Conversation.aggregate([
        {
          $vectorSearch: {
            queryVector: embedding,
            path: 'vector',
            numCandidates: 100,
            limit,
            index: 'vector_index', // Ensure you have a vector index configured
          },
        },
        { $sort: { updatedAt: -1 } },
      ]);
    } else {
      // Fallback to keyword search
      const searchQuery: any = {
        'messages.text': { $regex: query, $options: 'i' },
      };
      if (userId) {
        searchQuery.user = userId;
      }
      conversations = await Conversation.find(searchQuery)
        .limit(limit)
        .sort({ updatedAt: -1 })
        .lean();
    }

    // Extract matched messages
    const results = conversations.map((conv: any) => {
      const matchedMessages = conv.messages.filter((msg: any) =>
        msg.text.toLowerCase().includes(query.toLowerCase())
      );
      return {
        conversationId: conv._id.toString(),
        title: conv.title || 'Untitled Conversation',
        matchedMessages: matchedMessages.map((msg: any) => ({
          sender: msg.sender,
          text: msg.text,
          timestamp: msg.timestamp,
        })),
        createdAt: conv.createdAt,
      };
    });

    return {
      success: true,
      query,
      results,
      totalResults: results.length,
    };
  } catch (error: any) {
    console.error('Database search error:', error.message);
    return {
      success: false,
      query,
      results: [],
      totalResults: 0,
    };
  }
}
