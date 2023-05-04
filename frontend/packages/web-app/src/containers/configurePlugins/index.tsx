import {
  CheckboxListItem,
  Label,
} from '@aragon/ui-components';
import React, { useCallback } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';


const ConfigurePlugins: React.FC = () => {
  const { control, setValue, getValues } = useFormContext();

  /*************************************************
   *             Callbacks and Handlers            *
   *************************************************/


  const handleGroupPluginChanged = useCallback(
    (value: boolean, onChange: (value: boolean) => void) => {
      if (value && getValues('groupPlugin')) {
        setValue('groupPlugin', true);
      }

      onChange(value);
    },
    [getValues, setValue]
  );

  const handleSwapPluginChanged = useCallback(
    (value: boolean, onChange: (value: boolean) => void) => {
      if (value && getValues('swapPlugin')) {
        setValue('swapPlugin', true);
      }

      onChange(value);
    },
    [getValues, setValue]
  );

  const handleNFTPluginChanged = useCallback(
    (value: boolean, onChange: (value: boolean) => void) => {
      if (value && getValues('nftPlugin')) {
        setValue('nftPlugin', true);
      }

      onChange(value);
    },
    [getValues, setValue]
  );


  /*************************************************
   *                   Render                     *
   *************************************************/
  return (
    <>
      {
        <>
          {/* Group voting */}
          <FormItem>
            <Label
              label={'Group voting plugin'}
              helpText={'This plugin enables the creation of sub governance groups within an existing DAO. This plugin remove the need to create a new DAO, allowing an organisation to jointly vote for the creation of this subgroup that has its own budget from the join treasury and own decision making rules.'}
            />
            <Controller
              name="groupPlugin"
              control={control}
              render={({ field: { onChange, value } }) => (
                <ToggleCheckList
                  onChange={changeValue =>
                    handleGroupPluginChanged(changeValue, onChange)
                  }
                  value={value as boolean}
                />
              )}
            />
          </FormItem>

          {/* Swap tokens */}
          <FormItem>
            <Label
              label={'Swap tokens plugin'}
              helpText={'This plugin enables the group to grant access to users to trade groups treasury directly using Uniswap.'}
            />
            <Controller
              name="swapPlugin"
              control={control}
              render={({ field: { onChange, value } }) => (
                <ToggleCheckList
                  onChange={changeValue =>
                    handleSwapPluginChanged(changeValue, onChange)
                  }
                  value={value as boolean}
                />
              )}
            />
          </FormItem>

          {/* NFT Collector */}
          <FormItem>
            <Label
              label={'NFT collector plugin'}
              helpText={'This plugin enables the group to grant access to users to trade NFTs in OpenSea directly using groups treasury'}
            />
            <Controller
              name="nftPlugin"
              control={control}
              render={({ field: { onChange, value } }) => (
                <ToggleCheckList
                  onChange={changeValue =>
                    handleNFTPluginChanged(changeValue, onChange)
                  }
                  value={value as boolean}
                />
              )}
            />
          </FormItem>
        </>
      }
    </>
  );
};

export default ConfigurePlugins;

const ToggleCheckList = ({
  disabled,
  onChange,
  value,
}: {
  disabled?: boolean;
  value: boolean;
  onChange: (value: boolean) => void;
}) => {
  const { t } = useTranslation();

  return (
    <ToggleCheckListContainer>
      <ToggleCheckListItemWrapper>
        <CheckboxListItem
          label={t('labels.no')}
          multiSelect={false}
          disabled={disabled}
          onClick={() => onChange(false)}
          type={value ? 'default' : 'active'}
        />
      </ToggleCheckListItemWrapper>

      <ToggleCheckListItemWrapper>
        <CheckboxListItem
          label={t('labels.yes')}
          multiSelect={false}
          disabled={disabled}
          onClick={() => onChange(true)}
          type={value ? 'active' : 'default'}
        />
      </ToggleCheckListItemWrapper>
    </ToggleCheckListContainer>
  );
};

const ToggleCheckListContainer = styled.div.attrs({
  className: 'flex gap-x-3',
})``;

const ToggleCheckListItemWrapper = styled.div.attrs({ className: 'flex-1' })``;

const FormItem = styled.div.attrs({
  className: 'space-y-1.5',
})``;