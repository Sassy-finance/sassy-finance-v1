import React from 'react';
import {Meta, Story} from '@storybook/react';

import {IconAdd} from '../src';
import {ButtonText, ButtonTextProps} from '../src/components/button/buttonText';

export default {
  title: 'Components/Buttons/Text',
  component: ButtonText,
} as Meta;

const Template: Story<ButtonTextProps> = args => <ButtonText {...args} />;

export const Label = Template.bind({});
Label.args = {
  label: 'Button with label',
  onClick: () => alert('clicked'),
  disabled: false,
};

export const WithIcon = Template.bind({});
WithIcon.args = {
  label: 'Button Text',
  disabled: true,
  iconLeft: <IconAdd />,
  iconRight: <IconAdd />,
};
