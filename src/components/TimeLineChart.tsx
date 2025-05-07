import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Box, Typography, useTheme } from '@mui/material';

interface TimeLineChartProps {
  timeEvents: Array<{
    type: string;
    start_time: string; 
    end_time: string;
  }>;
  // No selectedDate prop needed as we're showing multiple days
}

const TimeLineChart: React.FC<TimeLineChartProps> = ({ timeEvents }) => {
  const theme = useTheme();

  // Process data to get daily totals for the last 7 days
  const getDailyTrends = () => {
    const days = 7; // Show last 7 days
    const dailyData = [];
    
    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      // Initialize data for this day
      const dayData = {
        date: dateStr,
        displayDate: date.toLocaleDateString('en-US', {month: 'short', day: 'numeric' }),
        work: 0,
        nonWork: 0,
        idle: 0,
        total: 0
      };

      // Calculate totals for this day
      timeEvents.forEach(event => {
        const eventDate = new Date(event.start_time).toISOString().split('T')[0];
        if (eventDate === dateStr) {
          const duration = (new Date(event.end_time).getTime() - new Date(event.start_time).getTime()) / (1000 * 60); // minutes
          
          switch(event.type) {
            case 'work':
              dayData.work += duration;
              break;
            case 'non_work':
              dayData.nonWork += duration;
              break;
            case 'idle':
              dayData.idle += duration;
              break;
          }
          dayData.total += duration;
        }
      });

      dailyData.unshift(dayData); // Add to start to show oldest to newest
    }

    return dailyData;
  };

  const data = getDailyTrends();

  return (
    <Box sx={{ 
      
      height: 400, 
      mb: 4,
      p: 2,
      bgcolor: 'background.paper',
    }}>
      <Typography variant="h6" align="center" gutterBottom>
        7-Day Activity Trends
      </Typography>
      <ResponsiveContainer>
        <LineChart 
          data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="displayDate"
            angle={-45}
            textAnchor="end"
            height={80}
          />
          <YAxis 
            tickFormatter={(value) => `${Math.round(value)}m`}
            label={{  angle: -90, position: 'insideLeft' }}
          />
          <Tooltip 
            formatter={(value: number) => [`${Math.round(value)} minutes`, '']}
          />
          <Legend />
                  <Line
                      type="monotone"
                      dataKey="work"
                      name="Work Time"
                      stroke={theme.palette.primary.main}
                      strokeWidth={2}
                      dot={{ r: 4 }}
                  />
                  <Line
                      type="monotone"
                      dataKey="nonWork"
                      name="Non-Work Time"
                      stroke={theme.palette.error.main}
                      strokeWidth={2}
                      dot={{ r: 4 }}
                  />
                  <Line
                      type="monotone"
                      dataKey="idle"
                      name="Idle Time"
                      stroke={theme.palette.warning.main}
                      strokeWidth={2}
                      dot={{ r: 4 }}
                  />
        </LineChart>
      </ResponsiveContainer>
    </Box>
  );
};

export default TimeLineChart;