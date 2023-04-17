import React from 'react';
import {TagProps, LinkProps} from '../..';

export type TableCellProps = {
  type: 'text' | 'foot' | 'head' | 'link' | 'tag';
  text?: string;
  subtext?: string;
  rightAligned?: boolean;
  bgWhite?: boolean;
  className?: string;
  children?:
    | React.FunctionComponentElement<TagProps>
    | React.FunctionComponentElement<LinkProps>;
};

export const TableCell: React.FC<TableCellProps> = ({
  type,
  text,
  subtext,
  bgWhite = false,
  rightAligned = false,
  children,
  className = '',
}) => {
  if (type === 'foot') {
    return (
      <td
        data-testid="tableCell"
        className={`px-2 py-1.5 bg-ui-100 ${
          rightAligned ? 'text-right' : 'text-left'
        } ${className}`}
      >
        <p className="text-ui-600 ft-text-base">{text}</p>
        {subtext && <p className="text-ui-500 ft-text-sm">{subtext}</p>}
      </td>
    );
  } else if (type === 'head') {
    return (
      <th
        data-testid="tableCell"
        className={`px-2 py-1.75 bg-ui-100 ${
          rightAligned ? 'text-right' : 'text-left'
        } ${className}`}
      >
        <p className="font-bold text-ui-800 ft-text-sm">{text}</p>
      </th>
    );
  } else if (type === 'link') {
    return (
      <td
        data-testid="tableCell"
        className={`px-2 py-1.75 ${!bgWhite && 'bg-ui-0'} ${
          rightAligned ? 'text-right' : 'text-left'
        } ${className}`}
      >
        <p className="font-bold text-primary-500 cursor-pointer ft-text-base">
          {children}
        </p>
      </td>
    );
  } else if (type === 'tag') {
    return (
      <td
        data-testid="tableCell"
        className={`px-2 py-1.5 ${!bgWhite && 'bg-ui-0'} ${className}`}
      >
        {children}
      </td>
    );
  }

  return (
    <td
      data-testid="tableCell"
      className={`px-2 py-1.5 ${!bgWhite && 'bg-ui-0'} ${
        rightAligned ? 'text-right' : 'text-left'
      } ${className}`}
    >
      <p className="text-ui-600 ft-text-base">{text}</p>
      {subtext && <p className="text-ui-500 ft-text-sm">{subtext}</p>}
    </td>
  );
};
