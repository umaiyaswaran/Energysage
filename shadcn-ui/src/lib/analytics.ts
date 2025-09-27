import { DailyData, HourlyData, Recommendation, Anomaly, EnergyMode, Device } from './constants';

export class EnergyAnalytics {
  // Anomaly Detection using statistical methods
  static detectAnomalies(data: DailyData[]): Anomaly[] {
    if (data.length < 7) return [];

    const consumptions = data.map(d => d.consumption);
    const mean = consumptions.reduce((a, b) => a + b, 0) / consumptions.length;
    const stdDev = Math.sqrt(
      consumptions.reduce((sq, n) => sq + Math.pow(n - mean, 2), 0) / consumptions.length
    );

    const anomalies: Anomaly[] = [];
    const threshold = 2; // 2 standard deviations

    data.forEach(day => {
      const zScore = Math.abs(day.consumption - mean) / stdDev;
      if (zScore > threshold) {
        anomalies.push({
          date: day.date,
          value: day.consumption,
          expected: mean,
          severity: zScore > 3 ? 'high' : zScore > 2.5 ? 'medium' : 'low',
          description: `Consumption ${day.consumption > mean ? 'spike' : 'drop'} detected: ${Math.round(((day.consumption - mean) / mean) * 100)}% ${day.consumption > mean ? 'above' : 'below'} average`
        });
      }
    });

    return anomalies;
  }

  // Simple linear forecast
  static forecastConsumption(data: DailyData[], days: number = 7): DailyData[] {
    if (data.length < 3) return [];

    // Calculate trend using linear regression
    const n = data.length;
    const xValues = data.map((_, i) => i);
    const yValues = data.map(d => d.consumption);

    const sumX = xValues.reduce((a, b) => a + b, 0);
    const sumY = yValues.reduce((a, b) => a + b, 0);
    const sumXY = xValues.reduce((sum, x, i) => sum + x * yValues[i], 0);
    const sumXX = xValues.reduce((sum, x) => sum + x * x, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    const forecast: DailyData[] = [];
    const lastDate = new Date(data[data.length - 1].date);

    for (let i = 1; i <= days; i++) {
      const forecastDate = new Date(lastDate);
      forecastDate.setDate(lastDate.getDate() + i);
      
      const predictedConsumption = Math.max(0, intercept + slope * (n + i - 1));
      const avgCostRatio = data.reduce((sum, d) => sum + d.cost / d.consumption, 0) / data.length;
      const avgCarbonRatio = data.reduce((sum, d) => sum + d.carbon / d.consumption, 0) / data.length;

      forecast.push({
        date: forecastDate.toISOString().split('T')[0],
        consumption: Math.round(predictedConsumption),
        cost: Math.round(predictedConsumption * avgCostRatio),
        carbon: Math.round(predictedConsumption * avgCarbonRatio)
      });
    }

    return forecast;
  }

  // Generate recommendations based on usage patterns
  static generateRecommendations(
    mode: EnergyMode,
    data: DailyData[],
    devices: Device[],
    hourlyData: HourlyData[]
  ): Recommendation[] {
    const recommendations: Recommendation[] = [];
    const avgConsumption = data.reduce((sum, d) => sum + d.consumption, 0) / data.length;
    const peakHour = hourlyData.reduce((max, hour) => 
      hour.consumption > max.consumption ? hour : max, hourlyData[0]
    );

    if (mode === 'household') {
      // HVAC recommendations
      const hvacDevice = devices.find(d => d.category === 'heating_cooling');
      if (hvacDevice && hvacDevice.avgConsumption > avgConsumption * 0.3) {
        recommendations.push({
          id: 'hvac-1',
          title: 'Optimize HVAC Temperature',
          description: 'Adjust thermostat by 2°F to reduce HVAC consumption by 10-15%',
          potentialSavings: Math.round(hvacDevice.avgConsumption * 0.12 * 30),
          carbonReduction: Math.round(hvacDevice.avgConsumption * 0.12 * 0.5 * 30),
          priority: 'high',
          category: 'heating_cooling'
        });
      }

      // Peak hour recommendations
      if (peakHour.hour >= 17 && peakHour.hour <= 20) {
        recommendations.push({
          id: 'peak-1',
          title: 'Shift Peak Hour Usage',
          description: 'Run dishwasher and washing machine before 5 PM or after 8 PM',
          potentialSavings: Math.round(avgConsumption * 0.08 * 30),
          carbonReduction: Math.round(avgConsumption * 0.08 * 0.5 * 30),
          priority: 'medium',
          category: 'appliances'
        });
      }

      // Lighting recommendations
      const lightingDevice = devices.find(d => d.category === 'lighting');
      if (lightingDevice) {
        recommendations.push({
          id: 'lighting-1',
          title: 'Switch to LED Lighting',
          description: 'Replace remaining incandescent bulbs with LED to save 75% on lighting costs',
          potentialSavings: Math.round(lightingDevice.avgConsumption * 0.75 * 30),
          carbonReduction: Math.round(lightingDevice.avgConsumption * 0.75 * 0.5 * 30),
          priority: 'medium',
          category: 'lighting'
        });
      }
    } else {
      // Industry recommendations
      const productionLines = devices.filter(d => d.category === 'manufacturing');
      if (productionLines.length > 0) {
        const totalProduction = productionLines.reduce((sum, line) => sum + line.avgConsumption, 0);
        recommendations.push({
          id: 'production-1',
          title: 'Optimize Production Scheduling',
          description: 'Schedule high-energy processes during off-peak hours (11 PM - 6 AM)',
          potentialSavings: Math.round(totalProduction * 0.15 * 30),
          carbonReduction: Math.round(totalProduction * 0.15 * 0.5 * 30),
          priority: 'high',
          category: 'manufacturing'
        });
      }

      // HVAC industrial recommendations
      const industrialHVAC = devices.find(d => d.category === 'climate_control');
      if (industrialHVAC) {
        recommendations.push({
          id: 'hvac-industrial-1',
          title: 'Implement Smart HVAC Controls',
          description: 'Install occupancy sensors and zone controls to reduce HVAC consumption by 20%',
          potentialSavings: Math.round(industrialHVAC.avgConsumption * 0.20 * 30),
          carbonReduction: Math.round(industrialHVAC.avgConsumption * 0.20 * 0.5 * 30),
          priority: 'high',
          category: 'climate_control'
        });
      }

      // Equipment efficiency
      recommendations.push({
        id: 'equipment-1',
        title: 'Equipment Maintenance Schedule',
        description: 'Regular maintenance can improve equipment efficiency by 5-10%',
        potentialSavings: Math.round(avgConsumption * 0.07 * 30),
        carbonReduction: Math.round(avgConsumption * 0.07 * 0.5 * 30),
        priority: 'medium',
        category: 'utilities'
      });
    }

    return recommendations.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }

  // Calculate efficiency metrics
  static calculateEfficiencyMetrics(data: DailyData[], devices: Device[]) {
    const totalConsumption = data.reduce((sum, d) => sum + d.consumption, 0);
    const totalCost = data.reduce((sum, d) => sum + d.cost, 0);
    const totalCarbon = data.reduce((sum, d) => sum + d.carbon, 0);
    const avgDaily = totalConsumption / data.length;

    // Find most consuming device/category
    const deviceConsumption = devices.map(device => ({
      ...device,
      percentage: (device.avgConsumption / devices.reduce((sum, d) => sum + d.avgConsumption, 0)) * 100
    })).sort((a, b) => b.percentage - a.percentage);

    return {
      totalConsumption,
      totalCost,
      totalCarbon,
      avgDaily,
      topConsumer: deviceConsumption[0],
      efficiencyScore: Math.max(0, 100 - (avgDaily / 100)) // Simple efficiency score
    };
  }
}