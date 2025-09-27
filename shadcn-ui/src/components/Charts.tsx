import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { EnergyMode, DailyData, HourlyData, Device, DEVICE_CATEGORIES } from '@/lib/constants';

interface ChartsProps {
  mode: EnergyMode;
  dailyData: DailyData[];
  hourlyData: HourlyData[];
  devices: Device[];
  forecast?: DailyData[];
}

export default function Charts({ mode, dailyData, hourlyData, devices, forecast }: ChartsProps) {
  // Prepare device consumption data for pie chart
  const deviceChartData = devices.map(device => ({
    name: device.name,
    value: device.avgConsumption,
    category: device.category,
    color: DEVICE_CATEGORIES[mode][device.category as keyof typeof DEVICE_CATEGORIES[typeof mode]]?.color || '#8884d8'
  }));

  // Prepare daily consumption data with forecast
  const combinedDailyData = forecast ? [
    ...dailyData.map(d => ({ ...d, type: 'actual' })),
    ...forecast.map(d => ({ ...d, type: 'forecast' }))
  ] : dailyData.map(d => ({ ...d, type: 'actual' }));

  // Prepare hourly data with better formatting
  const formattedHourlyData = hourlyData.map(h => ({
    ...h,
    time: `${h.hour.toString().padStart(2, '0')}:00`
  }));

  // Category breakdown for stacked bar chart
  const categoryData = Object.entries(
    devices.reduce((acc, device) => {
      const category = DEVICE_CATEGORIES[mode][device.category as keyof typeof DEVICE_CATEGORIES[typeof mode]]?.name || device.category;
      acc[category] = (acc[category] || 0) + device.avgConsumption;
      return acc;
    }, {} as Record<string, number>)
  ).map(([category, consumption]) => ({
    category,
    consumption: Math.round(consumption),
    color: Object.values(DEVICE_CATEGORIES[mode]).find(cat => cat.name === category)?.color || '#8884d8'
  }));

  return (
    <div className="grid gap-6">
      {/* Daily Consumption Trend */}
      <Card>
        <CardHeader>
          <CardTitle>Energy Consumption Trend</CardTitle>
          <CardDescription>
            Daily energy consumption over time {forecast ? 'with 7-day forecast' : ''}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={combinedDailyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              />
              <YAxis />
              <Tooltip 
                labelFormatter={(value) => new Date(value).toLocaleDateString()}
                formatter={(value: number, name: string) => [
                  `${value} kWh`,
                  name === 'consumption' ? 'Consumption' : name
                ]}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="consumption" 
                stroke="#22c55e" 
                strokeWidth={2}
                dot={{ fill: '#22c55e', strokeWidth: 2, r: 4 }}
                connectNulls={false}
              />
              {forecast && (
                <Line 
                  type="monotone" 
                  dataKey="consumption" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                  data={forecast.map(d => ({ ...d, type: 'forecast' }))}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Hourly Usage Pattern */}
        <Card>
          <CardHeader>
            <CardTitle>Daily Usage Pattern</CardTitle>
            <CardDescription>
              Energy consumption by hour of day
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={formattedHourlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip 
                  formatter={(value: number) => [`${value} kWh`, 'Consumption']}
                />
                <Bar dataKey="consumption" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Device/Machine Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>
              {mode === 'household' ? 'Device' : 'Machine'} Consumption Breakdown
            </CardTitle>
            <CardDescription>
              Energy consumption by {mode === 'household' ? 'appliance' : 'equipment'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={deviceChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {deviceChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => [`${value} kWh`, 'Avg Consumption']} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Category Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Consumption by Category</CardTitle>
          <CardDescription>
            Energy usage breakdown by equipment category
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={categoryData} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="category" type="category" width={120} />
              <Tooltip formatter={(value: number) => [`${value} kWh`, 'Consumption']} />
              <Bar dataKey="consumption">
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Cost and Carbon Metrics */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Cost Trend</CardTitle>
            <CardDescription>Daily energy costs over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                />
                <YAxis />
                <Tooltip 
                  labelFormatter={(value) => new Date(value).toLocaleDateString()}
                  formatter={(value: number) => [`$${value}`, 'Cost']}
                />
                <Line type="monotone" dataKey="cost" stroke="#f59e0b" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Carbon Footprint</CardTitle>
            <CardDescription>Daily CO₂ emissions from energy use</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                />
                <YAxis />
                <Tooltip 
                  labelFormatter={(value) => new Date(value).toLocaleDateString()}
                  formatter={(value: number) => [`${value} kg CO₂`, 'Carbon']}
                />
                <Line type="monotone" dataKey="carbon" stroke="#10b981" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}