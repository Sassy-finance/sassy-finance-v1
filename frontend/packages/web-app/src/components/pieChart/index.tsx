import React from 'react';
import styled from 'styled-components';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';

type PieChartProps = {
};

const PieChart: React.FC<PieChartProps> = ({ }) => {

  ChartJS.register(ArcElement, Tooltip, Legend);
  const data = {
    labels: ['Aggresive', 'Moderate', 'Conservative', 'NFT'],
    datasets: [
      {
        label: '# of Votes',
        data: [12, 19, 3, 5],
        backgroundColor: [
          'rgba(255, 99, 132, 0.2)',
          'rgba(54, 162, 235, 0.2)',
          'rgba(255, 206, 86, 0.2)',
          'rgba(75, 192, 192, 0.2)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  return (
    <div>
      <Container data-testid="piechart">
        <Pie data={data} />;
      </Container>
    </div>
  );
};

const Container = styled.ul.attrs({
  className:
    '',
})``;

export default PieChart;
