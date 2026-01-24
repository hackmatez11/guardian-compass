import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface RiskDistributionData {
  name: string;
  value: number;
  color: string;
}

interface RiskDistributionChartProps {
  data?: RiskDistributionData[];
}

const defaultData: RiskDistributionData[] = [
  { name: 'Low Risk', value: 65, color: 'hsl(142, 71%, 45%)' },
  { name: 'Medium Risk', value: 25, color: 'hsl(45, 93%, 47%)' },
  { name: 'High Risk', value: 10, color: 'hsl(0, 84%, 60%)' },
];

export function RiskDistributionChart({ data = defaultData }: RiskDistributionChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={100}
          paddingAngle={4}
          dataKey="value"
          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          labelLine={false}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
          ))}
        </Pie>
        <Tooltip 
          contentStyle={{ 
            backgroundColor: 'hsl(var(--card))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '0.5rem',
          }}
        />
        <Legend 
          verticalAlign="bottom" 
          height={36}
          formatter={(value) => <span style={{ color: 'hsl(var(--foreground))' }}>{value}</span>}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}