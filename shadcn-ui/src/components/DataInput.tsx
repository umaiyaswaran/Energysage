import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Upload, Plus, FileText } from 'lucide-react';
import { EnergyMode, EnergyData, DailyData, Device, COST_PER_KWH, CARBON_PER_KWH } from '@/lib/constants';

interface DataInputProps {
  mode: EnergyMode;
  onDataSubmit: (data: EnergyData) => void;
  onBack: () => void;
}

export default function DataInput({ mode, onDataSubmit, onBack }: DataInputProps) {
  const [csvData, setCsvData] = useState('');
  const [manualData, setManualData] = useState({
    deviceName: '',
    consumption: '',
    date: new Date().toISOString().split('T')[0]
  });
  const [loading, setLoading] = useState(false);

  const handleCsvUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        setCsvData(text);
      };
      reader.readAsText(file);
    }
  };

  const parseCsvData = (csvText: string): EnergyData => {
    const lines = csvText.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    
    const dailyData: DailyData[] = [];
    const devices: Device[] = [];
    const hourlyData = Array.from({ length: 24 }, (_, i) => ({ hour: i, consumption: 0 }));

    // Parse CSV data (simplified parser)
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      const row: Record<string, string> = {};
      
      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });

      // Try to extract daily data
      if (row.date && row.consumption) {
        const consumption = parseFloat(row.consumption);
        const cost = parseFloat(row.cost) || consumption * COST_PER_KWH;
        const carbon = parseFloat(row.carbon) || consumption * CARBON_PER_KWH;
        
        dailyData.push({
          date: row.date,
          consumption: Math.round(consumption),
          cost: Math.round(cost),
          carbon: Math.round(carbon)
        });
      }

      // Try to extract device data
      if (row.device && row.consumption) {
        const existingDevice = devices.find(d => d.name === row.device);
        if (!existingDevice) {
          devices.push({
            name: row.device,
            category: row.category || 'other',
            avgConsumption: parseFloat(row.consumption)
          });
        }
      }
    }

    // Generate sample hourly data if not provided
    if (dailyData.length > 0) {
      const avgDaily = dailyData.reduce((sum, d) => sum + d.consumption, 0) / dailyData.length;
      const hourlyPattern = [0.6, 0.5, 0.4, 0.4, 0.5, 0.7, 1.2, 1.5, 1.3, 1.0, 0.9, 1.0, 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.8, 1.6, 1.4, 1.2, 1.0, 0.8];
      
      hourlyPattern.forEach((multiplier, hour) => {
        hourlyData[hour].consumption = Math.round((avgDaily / 24) * multiplier);
      });
    }

    return {
      [mode === 'household' ? 'devices' : 'machines']: devices,
      dailyData,
      hourlyData
    };
  };

  const handleCsvSubmit = () => {
    if (!csvData.trim()) return;
    
    setLoading(true);
    try {
      const parsedData = parseCsvData(csvData);
      onDataSubmit(parsedData);
    } catch (error) {
      console.error('Error parsing CSV:', error);
      alert('Error parsing CSV data. Please check the format.');
    }
    setLoading(false);
  };

  const handleManualSubmit = () => {
    if (!manualData.deviceName || !manualData.consumption || !manualData.date) {
      alert('Please fill in all fields');
      return;
    }

    const consumption = parseFloat(manualData.consumption);
    const cost = consumption * COST_PER_KWH;
    const carbon = consumption * CARBON_PER_KWH;

    const energyData: EnergyData = {
      [mode === 'household' ? 'devices' : 'machines']: [{
        name: manualData.deviceName,
        category: 'manual_entry',
        avgConsumption: consumption
      }],
      dailyData: [{
        date: manualData.date,
        consumption: Math.round(consumption),
        cost: Math.round(cost),
        carbon: Math.round(carbon)
      }],
      hourlyData: Array.from({ length: 24 }, (_, i) => ({ 
        hour: i, 
        consumption: Math.round(consumption / 24) 
      }))
    };

    onDataSubmit(energyData);
  };

  const sampleCsvFormat = mode === 'household' 
    ? `date,device,category,consumption,cost,carbon
2024-09-27,HVAC System,heating_cooling,450,54,225
2024-09-27,Water Heater,water_heating,380,46,190
2024-09-27,Refrigerator,appliances,150,18,75`
    : `date,device,category,consumption,cost,carbon
2024-09-27,Production Line A,manufacturing,2800,336,1400
2024-09-27,Production Line B,manufacturing,2650,318,1325
2024-09-27,HVAC Industrial,climate_control,1200,144,600`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-cyan-50">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Header */}
        <div className="flex items-center mb-6">
          <Button variant="ghost" onClick={onBack} className="mr-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Import Energy Data</h1>
            <p className="text-gray-600">Upload CSV file or enter data manually</p>
          </div>
        </div>

        <Tabs defaultValue="csv" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="csv" className="flex items-center">
              <Upload className="h-4 w-4 mr-2" />
              CSV Upload
            </TabsTrigger>
            <TabsTrigger value="manual" className="flex items-center">
              <Plus className="h-4 w-4 mr-2" />
              Manual Entry
            </TabsTrigger>
          </TabsList>

          <TabsContent value="csv" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Upload CSV File</CardTitle>
                <CardDescription>
                  Upload a CSV file containing your energy consumption data
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="csv-file">Select CSV File</Label>
                  <Input
                    id="csv-file"
                    type="file"
                    accept=".csv"
                    onChange={handleCsvUpload}
                    className="mt-1"
                  />
                </div>

                {csvData && (
                  <div>
                    <Label>CSV Preview</Label>
                    <Textarea
                      value={csvData.slice(0, 500) + (csvData.length > 500 ? '...' : '')}
                      readOnly
                      className="mt-1 h-32"
                    />
                  </div>
                )}

                <Button 
                  onClick={handleCsvSubmit} 
                  disabled={!csvData || loading}
                  className="w-full"
                >
                  {loading ? 'Processing...' : 'Import CSV Data'}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  CSV Format Example
                </CardTitle>
                <CardDescription>
                  Your CSV file should follow this format
                </CardDescription>
              </CardHeader>
              <CardContent>
                <pre className="bg-gray-100 p-4 rounded-md text-sm overflow-x-auto">
                  {sampleCsvFormat}
                </pre>
                <div className="mt-4 text-sm text-gray-600">
                  <p><strong>Required columns:</strong></p>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li><strong>date:</strong> Date in YYYY-MM-DD format</li>
                    <li><strong>device:</strong> Name of the device/equipment</li>
                    <li><strong>consumption:</strong> Energy consumption in kWh</li>
                  </ul>
                  <p className="mt-2"><strong>Optional columns:</strong> category, cost, carbon</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="manual" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Manual Data Entry</CardTitle>
                <CardDescription>
                  Enter energy consumption data manually
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="device-name">
                    {mode === 'household' ? 'Device' : 'Machine'} Name
                  </Label>
                  <Input
                    id="device-name"
                    value={manualData.deviceName}
                    onChange={(e) => setManualData(prev => ({ ...prev, deviceName: e.target.value }))}
                    placeholder={mode === 'household' ? 'e.g., Air Conditioner' : 'e.g., Production Line A'}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="consumption">Energy Consumption (kWh)</Label>
                  <Input
                    id="consumption"
                    type="number"
                    value={manualData.consumption}
                    onChange={(e) => setManualData(prev => ({ ...prev, consumption: e.target.value }))}
                    placeholder="Enter consumption in kWh"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={manualData.date}
                    onChange={(e) => setManualData(prev => ({ ...prev, date: e.target.value }))}
                    className="mt-1"
                  />
                </div>

                {manualData.consumption && (
                  <div className="bg-blue-50 p-4 rounded-md">
                    <h4 className="font-semibold text-blue-800 mb-2">Calculated Metrics:</h4>
                    <div className="text-sm text-blue-700 space-y-1">
                      <p>Estimated Cost: ${Math.round(parseFloat(manualData.consumption || '0') * COST_PER_KWH)}</p>
                      <p>Estimated Carbon: {Math.round(parseFloat(manualData.consumption || '0') * CARBON_PER_KWH)} kg CO₂</p>
                    </div>
                  </div>
                )}

                <Button 
                  onClick={handleManualSubmit}
                  className="w-full"
                  disabled={!manualData.deviceName || !manualData.consumption || !manualData.date}
                >
                  Add Energy Data
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}