import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Box, Typography, useTheme } from '@mui/material';

interface HourlyDistributionChartProps {
  timeEvents: Array<{
    type: string;
    start_time: string;
    end_time: string;
  }>;
  selectedDate: string;
}

const HourlyDistributionChart: React.FC<HourlyDistributionChartProps> = ({
  timeEvents,
  selectedDate
}) => {
  const theme = useTheme();

  // Process data to get hourly distributions
  const getHourlyData = () => {
    const hourlyData = Array(24).fill(null).map((_, index) => ({
      hour: index,
      work: 0,
      nonWork: 0,
      idle: 0
    }));

    timeEvents.forEach(event => {
      const eventDate = new Date(event.start_time).toDateString();
      const selectedDateStr = new Date(selectedDate).toDateString();
      
      if (eventDate === selectedDateStr) {
        const startTime = new Date(event.start_time);
        const endTime = new Date(event.end_time);
        
        for (let hour = startTime.getHours(); hour <= endTime.getHours(); hour++) {
          const minutesInHour = getMinutesInHour(startTime, endTime, hour);
          
          switch(event.type) {
            case 'work':
              hourlyData[hour].work += minutesInHour;
              break;
            case 'non_work':
              hourlyData[hour].nonWork += minutesInHour;
              break;
            case 'idle':
              hourlyData[hour].idle += minutesInHour;
              break;
          }
        }
      }
    });

    return hourlyData;
  };

  // Calculate minutes spent in a specific hour
  const getMinutesInHour = (start: Date, end: Date, hour: number) => {
    const hourStart = new Date(start);
    hourStart.setHours(hour, 0, 0, 0);
    
    const hourEnd = new Date(hourStart);
    hourEnd.setHours(hour + 1, 0, 0, 0);

    const overlapStart = new Date(Math.max(start.getTime(), hourStart.getTime()));
    const overlapEnd = new Date(Math.min(end.getTime(), hourEnd.getTime()));

    return Math.max(0, (overlapEnd.getTime() - overlapStart.getTime()) / (1000 * 60));
  };

  const data = getHourlyData();

  return (
    <Box sx={{ 
      height: 400, 
      mb: 4,
      p: 2,
      bgcolor: 'background.paper',
    }}>
      <Typography variant="h6" align="center" gutterBottom>
        Hourly Activity Distribution - {new Date(selectedDate).toLocaleDateString()}
      </Typography>
      <ResponsiveContainer>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="hour"
            tickFormatter={(hour) => `${hour}:00`}
            height={80}
          />
          <YAxis 
            tickFormatter={(minutes) => `${Math.round(minutes)}m`}
          />
          <Tooltip 
            formatter={(value: number) => `${Math.round(value)} minutes`}
          />
          <Legend  />
          <Bar dataKey="work" name="Work" fill={theme.palette.primary.main} />
          <Bar dataKey="nonWork" name="Non-Work" fill={theme.palette.error.main} />
          <Bar dataKey="idle" name="Idle" fill={theme.palette.warning.main} />
        </BarChart>
      </ResponsiveContainer>
    </Box>
  );
};

export default HourlyDistributionChart;