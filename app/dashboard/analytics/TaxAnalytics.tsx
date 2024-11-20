import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, BarChart, Bar } from 'recharts';
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";

interface TaxMetric {
  date: string;
  amount: number;
  category: string;
  prediction?: number;
}

export default function TaxAnalytics() {
  const [timeframe, setTimeframe] = useState('yearly');
  const [metrics, setMetrics] = useState<TaxMetric[]>([]);
  const [loading, setLoading] = useState(true);
  const [analysisType, setAnalysisType] = useState('expenses');

  useEffect(() => {
    fetchAnalytics();
  }, [timeframe, analysisType]);

  const fetchAnalytics = async () => {
    try {
      const response = await fetch(`/api/analytics/${analysisType}?timeframe=${timeframe}`);
      const data = await response.json();
      setMetrics(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      setLoading(false);
    }
  };

  const generateNarrativeAnalysis = () => {
    // AI-powered narrative analysis
    const trends = metrics.reduce((acc, curr, idx, arr) => {
      if (idx === 0) return acc;
      const change = ((curr.amount - arr[idx-1].amount) / arr[idx-1].amount) * 100;
      if (Math.abs(change) > 10) {
        acc.push(`${change > 0 ? 'Increase' : 'Decrease'} of ${Math.abs(change).toFixed(1)}% in ${curr.category} from ${arr[idx-1].date} to ${curr.date}`);
      }
      return acc;
    }, [] as string[]);

    return trends;
  };

  const predictFutureTrends = () => {
    // Simple linear regression for prediction
    const predictions = metrics.map((metric, idx, arr) => {
      if (idx < arr.length - 1) {
        const trend = (arr[idx + 1].amount - metric.amount) / metric.amount;
        return {
          ...metric,
          prediction: metric.amount * (1 + trend)
        };
      }
      return metric;
    });

    return predictions;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="space-x-4">
          <Select
            value={timeframe}
            onValueChange={(value) => setTimeframe(value)}
            options={[
              { label: 'Yearly', value: 'yearly' },
              { label: 'Quarterly', value: 'quarterly' },
              { label: 'Monthly', value: 'monthly' }
            ]}
          />
          <Select
            value={analysisType}
            onValueChange={(value) => setAnalysisType(value)}
            options={[
              { label: 'Expenses', value: 'expenses' },
              { label: 'Income', value: 'income' },
              { label: 'Deductions', value: 'deductions' },
              { label: 'Tax Liability', value: 'taxLiability' }
            ]}
          />
        </div>
        <Button onClick={() => predictFutureTrends()}>
          Predict Trends
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Trend Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <LineChart width={500} height={300} data={metrics}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="amount" stroke="#8884d8" />
              <Line type="monotone" dataKey="prediction" stroke="#82ca9d" strokeDasharray="5 5" />
            </LineChart>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Category Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <BarChart width={500} height={300} data={metrics}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="category" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="amount" fill="#8884d8" />
            </BarChart>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Narrative Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-4 space-y-2">
              {generateNarrativeAnalysis().map((trend, index) => (
                <li key={index}>{trend}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
