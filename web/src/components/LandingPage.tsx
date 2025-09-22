import { useState, useEffect } from 'react';
import { RobotComparisonLayout } from './robot/RobotComparisonLayout';
import type { Robot } from '@/types/database';
import { supabase } from '@/lib/supabase';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

const LandingPage = () => {
  const [robots, setRobots] = useState<Robot[]>([]);
  const [robot1, setRobot1] = useState<Robot | null>(null);
  const [robot2, setRobot2] = useState<Robot | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch robots from database
  const fetchRobots = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('robots')
        .select(`
          *,
          manufacturer:manufacturers(*)
        `)
        .in('status', ['active', 'development', 'prototype'])
        .order('created_at', { ascending: false });

      if (fetchError) {
        throw fetchError;
      }

      setRobots(data || []);
      
      // Select two random robots
      if (data && data.length >= 2) {
        const shuffled = [...data].sort(() => 0.5 - Math.random());
        setRobot1(shuffled[0]);
        setRobot2(shuffled[1]);
      } else if (data && data.length === 1) {
        setRobot1(data[0]);
        setRobot2(null);
      }
    } catch (err) {
      console.error('Error fetching robots:', err);
      setError('Failed to load robots. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Load robots on component mount
  useEffect(() => {
    fetchRobots();
  }, []);

  const handleRandomize = () => {
    if (robots.length >= 2) {
      const shuffled = [...robots].sort(() => 0.5 - Math.random());
      setRobot1(shuffled[0]);
      setRobot2(shuffled[1]);
    }
  };

  const handleRobot1Change = (robotId: string) => {
    const robot = robots.find(r => r.id === robotId);
    if (robot) {
      setRobot1(robot);
    }
  };

  const handleRobot2Change = (robotId: string) => {
    const robot = robots.find(r => r.id === robotId);
    if (robot) {
      setRobot2(robot);
    }
  };

  if (error) {
    return (
      <div className="space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-gray-900">
            Compare Humanoid Robots
          </h1>
          <p className="text-lg text-gray-600">
            Discover and compare the latest humanoid robots side-by-side.
          </p>
        </div>
        
        <div className="max-w-2xl mx-auto">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>{error}</span>
              <Button 
                onClick={fetchRobots} 
                variant="outline" 
                size="sm"
                className="ml-4"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <RobotComparisonLayout
        robots={robots}
        onRandomize={handleRandomize}
        onRobot1Change={handleRobot1Change}
        onRobot2Change={handleRobot2Change}
        robot1={robot1}
        robot2={robot2}
        isLoading={isLoading}
      />
    </div>
  );
};

export default LandingPage;
