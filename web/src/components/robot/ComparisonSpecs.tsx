import type React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Robot } from '@/types/database';
import { CheckCircle, XCircle, Minus } from 'lucide-react';

interface ComparisonSpecsProps {
  robot1: Robot | null;
  robot2: Robot | null;
  isLoading?: boolean;
}

interface SpecComparison {
  label: string;
  robot1Value: string | number | null;
  robot2Value: string | number | null;
  unit?: string;
  higherIsBetter?: boolean;
}

export const ComparisonSpecs: React.FC<ComparisonSpecsProps> = ({
  robot1,
  robot2,
  isLoading = false
}) => {
  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-lg">Specification Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex justify-between items-center">
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/6"></div>
                <div className="h-4 bg-gray-200 rounded w-1/6"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!robot1 || !robot2) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-lg">Specification Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-gray-500 py-8">
            <p>Select two robots to compare specifications</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getSpecValue = (value: string | number | null, unit?: string): string => {
    if (value === null || value === undefined) return 'N/A';
    if (typeof value === 'number' && unit) {
      return `${value.toLocaleString()} ${unit}`;
    }
    return String(value);
  };

  const getComparisonIcon = (
    value1: string | number | null,
    value2: string | number | null,
    higherIsBetter: boolean = true
  ) => {
    if (value1 === null || value2 === null || value1 === value2) {
      return <Minus className="h-4 w-4 text-gray-400" />;
    }

    const num1 = typeof value1 === 'number' ? value1 : parseFloat(String(value1));
    const num2 = typeof value2 === 'number' ? value2 : parseFloat(String(value2));

    if (isNaN(num1) || isNaN(num2)) {
      return <Minus className="h-4 w-4 text-gray-400" />;
    }

    const isFirstBetter = higherIsBetter ? num1 > num2 : num1 < num2;
    return isFirstBetter ? (
      <CheckCircle className="h-4 w-4 text-green-500" />
    ) : (
      <XCircle className="h-4 w-4 text-red-500" />
    );
  };

  const specifications: SpecComparison[] = [
    {
      label: 'Height',
      robot1Value: robot1.height_cm,
      robot2Value: robot2.height_cm,
      unit: 'cm',
      higherIsBetter: false
    },
    {
      label: 'Weight',
      robot1Value: robot1.weight_kg,
      robot2Value: robot2.weight_kg,
      unit: 'kg',
      higherIsBetter: false
    },
    {
      label: 'Price',
      robot1Value: robot1.estimated_price_usd,
      robot2Value: robot2.estimated_price_usd,
      unit: 'USD',
      higherIsBetter: false
    },
    {
      label: 'Walking Speed',
      robot1Value: robot1.walking_speed_kmh,
      robot2Value: robot2.walking_speed_kmh,
      unit: 'km/h',
      higherIsBetter: true
    },
    {
      label: 'Max Payload',
      robot1Value: robot1.max_payload_kg,
      robot2Value: robot2.max_payload_kg,
      unit: 'kg',
      higherIsBetter: true
    },
    {
      label: 'Battery Life',
      robot1Value: robot1.battery_life_hours,
      robot2Value: robot2.battery_life_hours,
      unit: 'hours',
      higherIsBetter: true
    },
    {
      label: 'Rating',
      robot1Value: robot1.rating_average,
      robot2Value: robot2.rating_average,
      higherIsBetter: true
    },
    {
      label: 'Release Year',
      robot1Value: robot1.release_date ? new Date(robot1.release_date).getFullYear() : null,
      robot2Value: robot2.release_date ? new Date(robot2.release_date).getFullYear() : null,
      higherIsBetter: true
    }
  ];

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg">Specification Comparison</CardTitle>
        <p className="text-sm text-gray-600">
          Compare key specifications between the two robots
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {specifications.map((spec, index) => (
            <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
              <div className="flex-1">
                <span className="text-sm font-medium text-gray-700">
                  {spec.label}
                </span>
              </div>
              
              <div className="flex items-center gap-4 flex-1">
                <div className="flex items-center gap-2 flex-1">
                  <span className="text-sm text-gray-600 min-w-0 flex-1 text-right">
                    {getSpecValue(spec.robot1Value, spec.unit)}
                  </span>
                  {getComparisonIcon(spec.robot1Value, spec.robot2Value, spec.higherIsBetter)}
                </div>
                
                <div className="flex items-center gap-2 flex-1">
                  <span className="text-sm text-gray-600 min-w-0 flex-1 text-right">
                    {getSpecValue(spec.robot2Value, spec.unit)}
                  </span>
                  {getComparisonIcon(spec.robot2Value, spec.robot1Value, spec.higherIsBetter)}
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Better</span>
            </div>
            <div className="flex items-center gap-2">
              <XCircle className="h-4 w-4 text-red-500" />
              <span>Worse</span>
            </div>
            <div className="flex items-center gap-2">
              <Minus className="h-4 w-4 text-gray-400" />
              <span>Equal/N/A</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
