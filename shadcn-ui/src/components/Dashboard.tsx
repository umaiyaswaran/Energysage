import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Upload, Plus, AlertTriangle, TrendingUp, DollarSign, Leaf, Zap } from 'lucide-react';
import { EnergyMode, EnergyData, DailyData, Recommendation, Anomaly } from '@/lib/constants';
import { EnergyAnalytics } from '@/lib/analytics';
import Charts from '@/components/Charts';
import DataInput from '@/components/DataInput';

interface DashboardProps {
  mode: EnergyMode;
  onBack: () => void;
}

export default function Dashboard({ mode, onBack }: DashboardProps) {
  const [energyData, setEnergyData] = useState<EnergyData | null>(null);
  const [forecast, setForecast] = useState<DailyData[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [anomalies, setAnomalies] = useState<Anomaly[]>([]);
  const [showDataInput, setShowDataInput] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load sample data on component mount
  useEffect(() => {
    const loadSampleData = async () => {
      try {
        const response = await fetch('/data/sample-data.json');
        const data = await response.json();
        const modeData = data[mode];
        
        setEnergyData(modeData);
        
        // Generate analytics
        const devices = mode === 'household' ? modeData.devices : modeData.machines;
        const forecastData = EnergyAnalytics.forecastConsumption(modeData.dailyData, 7);
        const recs = EnergyAnalytics.generateRecommendations(mode, modeData.dailyData, devices, modeData.hourlyData);
        const anom = EnergyAnalytics.detectAnomalies(modeData.dailyData);
        
        setForecast(forecastData);
        setRecommendations(recs);
        setAnomalies(anom);
        setLoading(false);
      } catch (error) {
        console.error('Error loading sample data:', error);
        setLoading(false);
      }
    };

    loadSampleData();
  }, [mode]);

  const handleDataUpdate = (newData: EnergyData) => {
    setEnergyData(newData);
    
    // Regenerate analytics
    const devices = mode === 'household' ? newData.devices : newData.machines;
    if (devices) {
      const forecastData = EnergyAnalytics.forecastConsumption(newData.dailyData, 7);
      const recs = EnergyAnalytics.generateRecommendations(mode, newData.dailyData, devices, newData.hourlyData);
      const anom = EnergyAnalytics.detectAnomalies(newData.dailyData);
      
      setForecast(forecastData);
      setRecommendations(recs);
      setAnomalies(anom);
    }
    
    setShowDataInput(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <Zap className="h-12 w-12 text-green-600 mx-auto mb-4 animate-spin" />
          <p className="text-lg text-gray-600">Loading energy data...</p>
        </div>
      </div>
    );
  }

  if (!energyData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-lg text-gray-600">Error loading energy data</p>
          <Button onClick={onBack} className="mt-4">Go Back</Button>
        </div>
      </div>
    );
  }

  const devices = mode === 'household' ? energyData.devices : energyData.machines;
  const totalConsumption = energyData.dailyData.reduce((sum, d) => sum + d.consumption, 0);
  const totalCost = energyData.dailyData.reduce((sum, d) => sum + d.cost, 0);
  const totalCarbon = energyData.dailyData.reduce((sum, d) => sum + d.carbon, 0);
  const avgDaily = totalConsumption / energyData.dailyData.length;

  if (showDataInput) {
    return (
      <DataInput 
        mode={mode} 
        onDataSubmit={handleDataUpdate}
        onBack={() => setShowDataInput(false)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-cyan-50">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Button variant="ghost" onClick={onBack} className="mr-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-800 capitalize">
                {mode} Energy Dashboard
              </h1>
              <p className="text-gray-600">Monitor, analyze, and optimize your energy consumption</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowDataInput(true)}>
              <Upload className="h-4 w-4 mr-2" />
              Import Data
            </Button>
            <Button variant="outline" onClick={() => setShowDataInput(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Manual Entry
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <Card className="border-green-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Consumption</CardTitle>
              <Zap className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalConsumption.toLocaleString()} kWh</div>
              <p className="text-xs text-muted-foreground">
                Avg: {Math.round(avgDaily)} kWh/day
              </p>
            </CardContent>
          </Card>

          <Card className="border-blue-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Cost</CardTitle>
              <DollarSign className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalCost.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Avg: ${Math.round(totalCost / energyData.dailyData.length)}/day
              </p>
            </CardContent>
          </Card>

          <Card className="border-emerald-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Carbon Footprint</CardTitle>
              <Leaf className="h-4 w-4 text-emerald-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalCarbon.toLocaleString()} kg CO₂</div>
              <p className="text-xs text-muted-foreground">
                Avg: {Math.round(totalCarbon / energyData.dailyData.length)} kg/day
              </p>
            </CardContent>
          </Card>

          <Card className="border-orange-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Anomalies</CardTitle>
              <AlertTriangle className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{anomalies.length}</div>
              <p className="text-xs text-muted-foreground">
                {anomalies.filter(a => a.severity === 'high').length} high priority
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="forecast">Forecast</TabsTrigger>
            <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
            <TabsTrigger value="anomalies">Anomalies</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <Charts 
              mode={mode}
              dailyData={energyData.dailyData}
              hourlyData={energyData.hourlyData}
              devices={devices || []}
            />
          </TabsContent>

          <TabsContent value="forecast" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2 text-blue-600" />
                  7-Day Energy Consumption Forecast
                </CardTitle>
                <CardDescription>
                  AI-powered predictions based on historical consumption patterns
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Charts 
                  mode={mode}
                  dailyData={energyData.dailyData}
                  hourlyData={energyData.hourlyData}
                  devices={devices || []}
                  forecast={forecast}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="recommendations" className="space-y-6">
            <div className="grid gap-4">
              {recommendations.map((rec) => (
                <Card key={rec.id} className="border-l-4 border-l-green-500">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{rec.title}</CardTitle>
                      <Badge variant={rec.priority === 'high' ? 'destructive' : rec.priority === 'medium' ? 'default' : 'secondary'}>
                        {rec.priority} priority
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-4">{rec.description}</p>
                    <div className="flex gap-4 text-sm">
                      <div className="flex items-center text-green-600">
                        <DollarSign className="h-4 w-4 mr-1" />
                        Save ${rec.potentialSavings}/month
                      </div>
                      <div className="flex items-center text-emerald-600">
                        <Leaf className="h-4 w-4 mr-1" />
                        Reduce {rec.carbonReduction} kg CO₂/month
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="anomalies" className="space-y-6">
            <div className="grid gap-4">
              {anomalies.length === 0 ? (
                <Card>
                  <CardContent className="pt-6 text-center">
                    <Zap className="h-12 w-12 text-green-500 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">No Anomalies Detected</h3>
                    <p className="text-gray-600">Your energy consumption patterns look normal and consistent.</p>
                  </CardContent>
                </Card>
              ) : (
                anomalies.map((anomaly, index) => (
                  <Card key={index} className={`border-l-4 ${
                    anomaly.severity === 'high' ? 'border-l-red-500' : 
                    anomaly.severity === 'medium' ? 'border-l-orange-500' : 'border-l-yellow-500'
                  }`}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">Energy Anomaly - {anomaly.date}</CardTitle>
                        <Badge variant={
                          anomaly.severity === 'high' ? 'destructive' : 
                          anomaly.severity === 'medium' ? 'default' : 'secondary'
                        }>
                          {anomaly.severity} severity
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 mb-2">{anomaly.description}</p>
                      <div className="flex gap-4 text-sm">
                        <span>Actual: <strong>{anomaly.value} kWh</strong></span>
                        <span>Expected: <strong>{Math.round(anomaly.expected)} kWh</strong></span>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}