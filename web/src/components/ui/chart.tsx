import React from 'react';
import { cn } from '@/lib/utils';

interface ChartData {
  label: string;
  value: number;
  color?: string;
}

interface SimpleBarChartProps {
  data: ChartData[];
  title?: string;
  className?: string;
  maxValue?: number;
}

export const SimpleBarChart: React.FC<SimpleBarChartProps> = ({
  data,
  title,
  className,
  maxValue
}) => {
  const max = maxValue || Math.max(...data.map(d => d.value));
  
  return (
    <div className={cn("space-y-3", className)}>
      {title && <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>}
      <div className="space-y-2">
        {data.map((item, index) => (
          <div key={index} className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">{item.label}</span>
              <span className="font-medium">{item.value}</span>
            </div>
            <div className="w-full bg-secondary rounded-full h-2">
              <div
                className={cn(
                  "h-2 rounded-full transition-all duration-500",
                  item.color || "bg-primary"
                )}
                style={{ width: `${(item.value / max) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

interface MetricDisplayProps {
  value: string | number;
  label: string;
  trend?: {
    value: string;
    direction: 'up' | 'down';
  };
  className?: string;
}

export const MetricDisplay: React.FC<MetricDisplayProps> = ({
  value,
  label,
  trend,
  className
}) => {
  return (
    <div className={cn("text-center", className)}>
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-sm text-muted-foreground">{label}</div>
      {trend && (
        <div className={`flex items-center justify-center mt-1 text-xs ${
          trend.direction === 'up' ? 'text-green-600' : 'text-red-600'
        }`}>
          <span className="mr-1">
            {trend.direction === 'up' ? '↗' : '↘'}
          </span>
          {trend.value}
        </div>
      )}
    </div>
  );
};
