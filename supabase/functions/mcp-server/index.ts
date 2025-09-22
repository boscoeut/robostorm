import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { comparisonTool } from './tools/comparison.ts';
import { mediaHandlingTool } from './tools/media-handling.ts';

interface MCPRequest {
  tool: string;
  action: string;
  parameters: Record<string, any>;
  context?: {
    userId?: string;
    userRole?: string;
    sessionId?: string;
  };
}

interface MCPResponse {
  success: boolean;
  data?: any;
  error?: string;
  tool?: string;
  action?: string;
}

const tools = {
  'comparison': comparisonTool,
  'media-handling': mediaHandlingTool
};

async function handleMCPRequest(request: MCPRequest): Promise<MCPResponse> {
  try {
    const { tool, action, parameters, context } = request;

    // Validate request
    if (!tool || !action) {
      return {
        success: false,
        error: 'Missing required fields: tool and action are required'
      };
    }

    // Get the tool
    const toolHandler = tools[tool as keyof typeof tools];
    if (!toolHandler) {
      return {
        success: false,
        error: `Unknown tool: ${tool}. Available tools: ${Object.keys(tools).join(', ')}`
      };
    }

    // Execute the tool
    const result = await toolHandler.execute({
      action,
      parameters,
      context
    });

    return {
      success: true,
      data: result,
      tool,
      action
    };

  } catch (error) {
    console.error('MCP Server Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      tool: request.tool,
      action: request.action
    };
  }
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE',
      },
    });
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ success: false, error: 'Method not allowed' }),
      { 
        status: 405,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }

  try {
    const requestBody = await req.json();
    const response = await handleMCPRequest(requestBody);

    return new Response(
      JSON.stringify(response),
      {
        status: response.success ? 200 : 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  } catch (error) {
    console.error('Request handling error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Invalid request format'
      }),
      {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }
});
