import { createClient } from '@supabase/supabase-js';

interface ComparisonTool {
  name: string;
  description: string;
  parameters: Record<string, any>;
  execute: (params: any) => Promise<any>;
}

interface RandomRobotsParams {
  count?: number;
  excludeIds?: string[];
  category?: string;
  manufacturer?: string;
}

interface ComparisonDataParams {
  robot1Id: string;
  robot2Id: string;
  includeSpecs?: boolean;
  includeMedia?: boolean;
}

interface TrackInteractionParams {
  robot1Id: string;
  robot2Id: string;
  interactionType: 'view' | 'select' | 'switch' | 'click_compare_more';
  comparisonType?: 'home_page' | 'full_comparison' | 'random';
  sessionId?: string;
}

interface PopularComparisonsParams {
  limit?: number;
  timeRange?: 'day' | 'week' | 'month' | 'all';
}

export const comparisonTool: ComparisonTool = {
  name: 'comparison',
  description: 'Handle robot comparison operations including random selection, comparison data, and analytics tracking',
  parameters: {
    action: {
      type: 'string',
      enum: ['getRandomRobots', 'getComparisonData', 'trackInteraction', 'getPopularComparisons', 'getComparisonStats'],
      description: 'The action to perform'
    },
    parameters: {
      type: 'object',
      description: 'Parameters specific to the action'
    }
  },
  execute: async (params: any) => {
    const { action, parameters } = params;
    
    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    try {
      switch (action) {
        case 'getRandomRobots':
          return await getRandomRobots(supabase, parameters as RandomRobotsParams);
        
        case 'getComparisonData':
          return await getComparisonData(supabase, parameters as ComparisonDataParams);
        
        case 'trackInteraction':
          return await trackInteraction(supabase, parameters as TrackInteractionParams);
        
        case 'getPopularComparisons':
          return await getPopularComparisons(supabase, parameters as PopularComparisonsParams);
        
        case 'getComparisonStats':
          return await getComparisonStats(supabase, parameters.robotId);
        
        default:
          throw new Error(`Unknown action: ${action}`);
      }
    } catch (error) {
      console.error('Comparison tool error:', error);
      throw error;
    }
  }
};

async function getRandomRobots(supabase: any, params: RandomRobotsParams) {
  const { count = 2, excludeIds = [], category, manufacturer } = params;
  
  let query = supabase
    .from('robots')
    .select(`
      *,
      manufacturer:manufacturers(*)
    `)
    .eq('status', 'active')
    .not('id', 'in', `(${excludeIds.join(',')})`);

  if (category) {
    query = query.eq('category', category);
  }

  if (manufacturer) {
    query = query.eq('manufacturer_id', manufacturer);
  }

  const { data, error } = await query
    .order('RANDOM()')
    .limit(count);

  if (error) {
    throw new Error(`Failed to fetch random robots: ${error.message}`);
  }

  return {
    success: true,
    data: data || [],
    count: data?.length || 0
  };
}

async function getComparisonData(supabase: any, params: ComparisonDataParams) {
  const { robot1Id, robot2Id, includeSpecs = true, includeMedia = false } = params;

  // Fetch both robots with their data
  const [robot1Result, robot2Result] = await Promise.all([
    supabase
      .from('robots')
      .select(`
        *,
        manufacturer:manufacturers(*)
        ${includeSpecs ? ',specifications:robot_specifications(*)' : ''}
        ${includeMedia ? ',media:robot_media(*)' : ''}
      `)
      .eq('id', robot1Id)
      .single(),
    
    supabase
      .from('robots')
      .select(`
        *,
        manufacturer:manufacturers(*)
        ${includeSpecs ? ',specifications:robot_specifications(*)' : ''}
        ${includeMedia ? ',media:robot_media(*)' : ''}
      `)
      .eq('id', robot2Id)
      .single()
  ]);

  if (robot1Result.error) {
    throw new Error(`Failed to fetch robot 1: ${robot1Result.error.message}`);
  }

  if (robot2Result.error) {
    throw new Error(`Failed to fetch robot 2: ${robot2Result.error.message}`);
  }

  // Calculate comparison metrics
  const comparison = calculateComparisonMetrics(robot1Result.data, robot2Result.data);

  return {
    success: true,
    data: {
      robot1: robot1Result.data,
      robot2: robot2Result.data,
      comparison
    }
  };
}

async function trackInteraction(supabase: any, params: TrackInteractionParams) {
  const { robot1Id, robot2Id, interactionType, comparisonType = 'home_page', sessionId } = params;

  const { data, error } = await supabase
    .rpc('track_comparison_interaction', {
      p_robot_1_id: robot1Id,
      p_robot_2_id: robot2Id,
      p_interaction_type: interactionType,
      p_comparison_type: comparisonType,
      p_session_id: sessionId
    });

  if (error) {
    throw new Error(`Failed to track interaction: ${error.message}`);
  }

  return {
    success: true,
    data: {
      analyticsId: data,
      interactionType,
      comparisonType
    }
  };
}

async function getPopularComparisons(supabase: any, params: PopularComparisonsParams) {
  const { limit = 10, timeRange = 'all' } = params;

  let timeFilter = '';
  if (timeRange !== 'all') {
    const days = timeRange === 'day' ? 1 : timeRange === 'week' ? 7 : 30;
    timeFilter = `AND created_at >= NOW() - INTERVAL '${days} days'`;
  }

  const { data, error } = await supabase
    .rpc('get_popular_robot_comparisons', {
      p_limit: limit
    });

  if (error) {
    throw new Error(`Failed to fetch popular comparisons: ${error.message}`);
  }

  return {
    success: true,
    data: data || [],
    count: data?.length || 0
  };
}

async function getComparisonStats(supabase: any, robotId: string) {
  const { data, error } = await supabase
    .rpc('get_robot_comparison_stats', {
      p_robot_id: robotId
    });

  if (error) {
    throw new Error(`Failed to fetch comparison stats: ${error.message}`);
  }

  return {
    success: true,
    data: data?.[0] || null
  };
}

function calculateComparisonMetrics(robot1: any, robot2: any) {
  const metrics = {
    height: {
      robot1: robot1.height_cm,
      robot2: robot2.height_cm,
      difference: robot1.height_cm && robot2.height_cm ? 
        Math.abs(robot1.height_cm - robot2.height_cm) : null,
      winner: robot1.height_cm && robot2.height_cm ? 
        (robot1.height_cm > robot2.height_cm ? 'robot1' : 'robot2') : null
    },
    weight: {
      robot1: robot1.weight_kg,
      robot2: robot2.weight_kg,
      difference: robot1.weight_kg && robot2.weight_kg ? 
        Math.abs(robot1.weight_kg - robot2.weight_kg) : null,
      winner: robot1.weight_kg && robot2.weight_kg ? 
        (robot1.weight_kg < robot2.weight_kg ? 'robot1' : 'robot2') : null
    },
    price: {
      robot1: robot1.estimated_price_usd,
      robot2: robot2.estimated_price_usd,
      difference: robot1.estimated_price_usd && robot2.estimated_price_usd ? 
        Math.abs(robot1.estimated_price_usd - robot2.estimated_price_usd) : null,
      winner: robot1.estimated_price_usd && robot2.estimated_price_usd ? 
        (robot1.estimated_price_usd < robot2.estimated_price_usd ? 'robot1' : 'robot2') : null
    },
    rating: {
      robot1: robot1.rating_average,
      robot2: robot2.rating_average,
      difference: robot1.rating_average && robot2.rating_average ? 
        Math.abs(robot1.rating_average - robot2.rating_average) : null,
      winner: robot1.rating_average && robot2.rating_average ? 
        (robot1.rating_average > robot2.rating_average ? 'robot1' : 'robot2') : null
    }
  };

  // Calculate overall winner based on available metrics
  const availableMetrics = Object.values(metrics).filter(m => m.robot1 && m.robot2);
  const robot1Wins = availableMetrics.filter(m => m.winner === 'robot1').length;
  const robot2Wins = availableMetrics.filter(m => m.winner === 'robot2').length;
  
  return {
    metrics,
    overallWinner: robot1Wins > robot2Wins ? 'robot1' : 
                  robot2Wins > robot1Wins ? 'robot2' : 'tie',
    robot1Wins,
    robot2Wins,
    totalComparisons: availableMetrics.length
  };
}
