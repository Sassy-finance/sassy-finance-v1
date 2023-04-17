import React from 'react';
import styled from 'styled-components';

/* TODO should be called ProgressLinear to for consistency */
export const LinearProgress: React.FC<
  Omit<React.ProgressHTMLAttributes<HTMLProgressElement>, 'className'>
> = ({max, value, ...props}) => {
  const val = (value as number) / (max as number);
  return <Progress max={1} value={val} {...props} />;
};

const Progress = styled.progress.attrs({
  className: 'h-1 w-full',
})<React.ProgressHTMLAttributes<HTMLProgressElement>>`
  ::-webkit-progress-bar {
    background-color: #e4e7eb;
  }
  ::-webkit-progress-value {
    border-radius: 12px 0 0 12px;
    background: linear-gradient(90deg, #0031ad 0%, #003bf5 100.32%);
  }

  &[value^='1']::-webkit-progress-value {
    border-radius: 12px;
  }

  border-radius: 12px;
  background-color: #e4e7eb;
  height: 20px;
  padding: 4px;

  ::-moz-progress-bar {
    border-radius: 12px 0 0 12px;
    background: -moz-linear-gradient(90deg, #0031ad 0%, #003bf5 100.32%);
  }

  &[value^='1']::-moz-progress-bar {
    border-radius: 12px;
  }
`;
