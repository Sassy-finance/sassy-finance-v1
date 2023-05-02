import React from 'react';
import styled from 'styled-components';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';

type PieChartProps = {
  groups: any
};

const PieChart: React.FC<PieChartProps> = ({ groups }) => {

  let labels = ['Treasury']
  let balances = [9977.41]
  let backgroundColor = ['rgba(51, 209, 255, 0.3)']

  if (groups) {
    for (const group of groups) {
      labels.push(group.name)
      balances.push(group.balance)
      backgroundColor.push(dynamicColors())
    }
  }

  ChartJS.register(ArcElement, Tooltip, Legend);
  const data = {
    labels,
    datasets: [
      {
        data: balances,
        borderWidth: 1,
        backgroundColor
      },
    ],
  };

  return (
    <div>
      <Container data-testid="piechart">
        <Pie data={data} />
      </Container>
    </div>
  );
};

const dynamicColors = () => {
  var r = Math.floor(Math.random() * 255);
  var g = Math.floor(Math.random() * 255);
  var b = Math.floor(Math.random() * 255);
  return "rgb(" + r + "," + g + "," + b + ", 0.4)";
}

const Container = styled.ul.attrs({
  className:
    '',
})``;

export default PieChart;
