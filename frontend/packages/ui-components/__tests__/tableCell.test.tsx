import React from 'react';
import {render, screen} from '@testing-library/react';

import {TableCell} from '../src';

describe('TableCell', () => {
  // eslint-disable-next-line
  function setup(args: any) {
    render(
      <table>
        <tbody>
          <tr>
            <TableCell {...args} />
          </tr>
        </tbody>
      </table>
    );
    return screen.getByTestId('tableCell');
  }

  test('should render without crashing', () => {
    const element = setup({});
    expect(element).toBeInTheDocument;
  });
});
