import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";

interface BarChartData {
  name: string;
  value: number;
  label?: string;
}

interface PieChartData {
  name: string;
  value: number;
  color: string;
}

export function SimpleBarChart({ 
  data, 
  title, 
  dataKey = "value" 
}: { 
  data: BarChartData[]; 
  title: string; 
  dataKey?: string;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-heading">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis 
              dataKey="name" 
              className="text-xs"
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
            />
            <YAxis 
              className="text-xs"
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px'
              }}
            />
            <Bar 
              dataKey={dataKey} 
              fill="hsl(var(--primary))" 
              radius={[8, 8, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export function SimpleDonutChart({ 
  data, 
  title 
}: { 
  data: PieChartData[]; 
  title: string;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-heading">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={5}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px'
              }}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export function FunnelChart({ 
  data, 
  title 
}: { 
  data: { stage: string; value: number; percentage?: number }[]; 
  title: string;
}) {
  const maxValue = Math.max(...data.map(d => d.value));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-heading">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {data.map((stage, index) => {
          const width = (stage.value / maxValue) * 100;
          const percentage = stage.percentage || (stage.value / data[0].value) * 100;
          
          return (
            <div key={index} className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium">{stage.stage}</span>
                <span className="text-muted-foreground">
                  {stage.value.toLocaleString()} ({percentage.toFixed(1)}%)
                </span>
              </div>
              <div className="h-12 bg-muted rounded-lg overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary to-primary/60 flex items-center justify-center transition-all duration-500"
                  style={{ width: `${width}%` }}
                >
                  <span className="text-primary-foreground font-semibold text-sm">
                    {stage.value.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
