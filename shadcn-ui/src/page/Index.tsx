import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Home, Building2, Zap, TrendingUp, Leaf, DollarSign } from 'lucide-react';
import Dashboard from '@/components/Dashboard';
import { EnergyMode, ENERGY_MODES } from '@/lib/constants';

export default function Index() {
  const [selectedMode, setSelectedMode] = useState<EnergyMode | null>(null);

  if (selectedMode) {
    return <Dashboard mode={selectedMode} onBack={() => setSelectedMode(null)} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-cyan-50">
      {/* Header */}
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Zap className="h-12 w-12 text-green-600 mr-3" />
            <h1 className="text-5xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
              EnergySage
            </h1>
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Intelligent energy monitoring and analytics platform for sustainable consumption
          </p>
        </div>

        {/* Features Overview */}
        <div className="grid md:grid-cols-4 gap-6 mb-12">
          <Card className="text-center border-green-200">
            <CardContent className="pt-6">
              <TrendingUp className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <h3 className="font-semibold text-gray-800">Monitor Usage</h3>
              <p className="text-sm text-gray-600">Real-time energy consumption tracking</p>
            </CardContent>
          </Card>
          <Card className="text-center border-blue-200">
            <CardContent className="pt-6">
              <Zap className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <h3 className="font-semibold text-gray-800">Predict Needs</h3>
              <p className="text-sm text-gray-600">AI-powered consumption forecasting</p>
            </CardContent>
          </Card>
          <Card className="text-center border-cyan-200">
            <CardContent className="pt-6">
              <DollarSign className="h-8 w-8 text-cyan-600 mx-auto mb-2" />
              <h3 className="font-semibold text-gray-800">Save Money</h3>
              <p className="text-sm text-gray-600">Actionable cost reduction recommendations</p>
            </CardContent>
          </Card>
          <Card className="text-center border-emerald-200">
            <CardContent className="pt-6">
              <Leaf className="h-8 w-8 text-emerald-600 mx-auto mb-2" />
              <h3 className="font-semibold text-gray-800">Go Green</h3>
              <p className="text-sm text-gray-600">Reduce carbon footprint efficiently</p>
            </CardContent>
          </Card>
        </div>

        {/* Mode Selection */}
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">
            Choose Your Energy Profile
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            {/* Household Mode */}
            <Card className="hover:shadow-xl transition-all duration-300 border-2 hover:border-green-300 cursor-pointer group">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto mb-4 p-4 bg-green-100 rounded-full group-hover:bg-green-200 transition-colors">
                  <Home className="h-12 w-12 text-green-600" />
                </div>
                <CardTitle className="text-2xl text-gray-800">Household</CardTitle>
                <CardDescription className="text-gray-600">
                  Perfect for homes and residential properties
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-gray-600">
                    <Zap className="h-4 w-4 mr-2 text-green-500" />
                    Monitor appliances and devices
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <TrendingUp className="h-4 w-4 mr-2 text-green-500" />
                    Track daily consumption patterns
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <DollarSign className="h-4 w-4 mr-2 text-green-500" />
                    Reduce monthly utility bills
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Leaf className="h-4 w-4 mr-2 text-green-500" />
                    Lower household carbon footprint
                  </div>
                </div>
                <Button 
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                  onClick={() => setSelectedMode(ENERGY_MODES.HOUSEHOLD)}
                >
                  Start Household Monitoring
                </Button>
              </CardContent>
            </Card>

            {/* Industry Mode */}
            <Card className="hover:shadow-xl transition-all duration-300 border-2 hover:border-blue-300 cursor-pointer group">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto mb-4 p-4 bg-blue-100 rounded-full group-hover:bg-blue-200 transition-colors">
                  <Building2 className="h-12 w-12 text-blue-600" />
                </div>
                <CardTitle className="text-2xl text-gray-800">Industry</CardTitle>
                <CardDescription className="text-gray-600">
                  Designed for businesses and industrial facilities
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-gray-600">
                    <Zap className="h-4 w-4 mr-2 text-blue-500" />
                    Monitor production equipment
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <TrendingUp className="h-4 w-4 mr-2 text-blue-500" />
                    Optimize operational efficiency
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <DollarSign className="h-4 w-4 mr-2 text-blue-500" />
                    Minimize operational costs
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Leaf className="h-4 w-4 mr-2 text-blue-500" />
                    Meet sustainability goals
                  </div>
                </div>
                <Button 
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={() => setSelectedMode(ENERGY_MODES.INDUSTRY)}
                >
                  Start Industrial Monitoring
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-16 text-gray-500">
          <p>© 2024 EnergySage - Intelligent Energy Analytics Platform</p>
        </div>
      </div>
    </div>
  );
}