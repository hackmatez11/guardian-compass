import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface TrendData {
  name: string;
  attendance?: number;
  gpa?: number;
  riskScore?: number;
}

interface TrendChartProps {
  data?: TrendData[];
  lines?: Array<{
    key: string;
    label: string;
    color: string;
  }>;
}

const defaultData: TrendData[] = [
  { name: 'Sem 1', attendance: 92, gpa: 3.5, riskScore: 15 },
  { name: 'Sem 2', attendance: 88, gpa: 3.3, riskScore: 22 },
  { name: 'Sem 3', attendance: 85, gpa: 3.1, riskScore: 30 },
  { name: 'Sem 4', attendance: 82, gpa: 2.9, riskScore: 38 },
  { name: 'Sem 5', attendance: 78, gpa: 2.7, riskScore: 45 },
  { name: 'Sem 6', attendance: 80, gpa: 2.8, riskScore: 42 },
];

const defaultLines = [
  { key: 'attendance', label: 'Attendance %', color: 'hsl(174, 62%, 47%)' },
  { key: 'gpa', label: 'GPA (x25)', color: 'hsl(222, 47%, 20%)' },
];

export function TrendChart({ data = defaultData, lines = defaultLines }: TrendChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
        <XAxis 
          dataKey="name" 
          stroke="hsl(var(--muted-foreground))"
          fontSize={12}
        />
        <YAxis 
          stroke="hsl(var(--muted-foreground))"
          fontSize={12}
        />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: 'hsl(var(--card))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '0.5rem',
          }}
        />
        <Legend />
        {lines.map((line) => (
          <Line
            key={line.key}
            type="monotone"
            dataKey={line.key}
            name={line.label}
            stroke={line.color}
            strokeWidth={2}
            dot={{ fill: line.color, strokeWidth: 2 }}
            activeDot={{ r: 6 }}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}