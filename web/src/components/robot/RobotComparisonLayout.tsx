import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RobotComparisonCard } from './RobotComparisonCard';
import { ComparisonSpecs } from './ComparisonSpecs';
import type { Robot } from '@/types/database';
import { ArrowRight, Shuffle, BarChart3 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface RobotComparisonLayoutProps {
  robots: Robot[];
  onRandomize: () => void;
  onRobot1Change: (robotId: string) => void;
  onRobot2Change: (robotId: string) => void;
  robot1: Robot | null;
  robot2: Robot | null;
  isLoading?: boolean;
}

export const RobotComparisonLayout: React.FC<RobotComparisonLayoutProps> = ({
  robots,
  onRandomize,
  onRobot1Change,
  onRobot2Change,
  robot1,
  robot2,
  isLoading = false
}) => {
  const navigate = useNavigate();

  const handleCompareMore = () => {
    navigate('/compare');
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-gray-900">
          Compare Humanoid Robots
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Discover and compare the latest humanoid robots side-by-side. 
          Select different robots or randomize to explore new possibilities.
        </p>
        
        <div className="flex justify-center gap-4">
          <Button 
            onClick={onRandomize} 
            variant="outline"
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            <Shuffle className="h-4 w-4" />
            Randomize Both
          </Button>
          
          <Button 
            onClick={handleCompareMore}
            className="flex items-center gap-2"
          >
            <BarChart3 className="h-4 w-4" />
            Compare More Robots
          </Button>
        </div>
      </div>

      {/* Robot Comparison Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div className="text-center">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">Robot 1</h2>
          </div>
          <RobotComparisonCard
            robot={robot1}
            robots={robots}
            onRobotChange={onRobot1Change}
            onRandomize={() => {
              const randomRobot = robots[Math.floor(Math.random() * robots.length)];
              onRobot1Change(randomRobot.id);
            }}
            isLoading={isLoading}
            position="left"
          />
        </div>

        <div className="space-y-4">
          <div className="text-center">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">Robot 2</h2>
          </div>
          <RobotComparisonCard
            robot={robot2}
            robots={robots}
            onRobotChange={onRobot2Change}
            onRandomize={() => {
              const randomRobot = robots[Math.floor(Math.random() * robots.length)];
              onRobot2Change(randomRobot.id);
            }}
            isLoading={isLoading}
            position="right"
          />
        </div>
      </div>

      {/* VS Indicator */}
      <div className="flex justify-center">
        <div className="flex items-center gap-4 bg-white rounded-full px-6 py-3 shadow-lg border">
          <div className="text-2xl font-bold text-gray-400">VS</div>
        </div>
      </div>

      {/* Specification Comparison */}
      <div className="max-w-4xl mx-auto">
        <ComparisonSpecs
          robot1={robot1}
          robot2={robot2}
          isLoading={isLoading}
        />
      </div>

    </div>
  );
};
