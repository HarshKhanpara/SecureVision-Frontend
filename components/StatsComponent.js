import { PieChart, Pie, Tooltip, Cell, ResponsiveContainer } from "recharts";

export const StatsComponent = ({ logs }) => {
  const counts = logs.reduce(
    (acc, log) => {
      acc[log.type] = (acc[log.type] || 0) + 1;
      return acc;
    },
    { info: 0, warning: 0, alert: 0 }
  );

  const data = [
    { name: "Info", value: counts.info },
    { name: "Warning", value: counts.warning },
    { name: "Alert", value: counts.alert },
  ];

  const COLORS = ["#3B82F6", "#FBBF24", "#EF4444"];

  return (
    <div className="bg-gray-900/40 rounded-3xl p-6 shadow-xl h-full text-white">
      <h2 className="text-xl font-semibold mb-4">Event Statistics</h2>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={80}
            label
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
      <ul className="mt-4 space-y-1 text-sm">
        {data.map((item) => (
          <li key={item.name} className="flex justify-between">
            <span>{item.name}</span>
            <span className="font-bold">{item.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};
