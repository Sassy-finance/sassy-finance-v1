import {
  AlertInline,
  DropdownInput,
  Label,
  ValueInput,
} from '@aragon/ui-components';

import { useApolloClient } from '@apollo/client';
import React, { useCallback, useEffect } from 'react';
import {
  Controller,
  FormState,
  useFormContext,
  useFormState,
  useWatch,
} from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import { useActionsContext } from 'context/actions';
import { useGlobalModalContext } from 'context/globalModals';
import { useNetwork } from 'context/network';
import { useProviders } from 'context/providers';
import { isAddress } from 'ethers/lib/utils';
import { useDaoParam } from 'hooks/useDaoParam';
import { useWallet } from 'hooks/useWallet';
import { WithdrawAction } from 'pages/newWithdraw';
import { fetchTokenData } from 'services/prices';
import { CHAIN_METADATA } from 'utils/constants';
import { handleClipboardActions } from 'utils/library';
import { fetchBalance, getTokenInfo, isNativeToken } from 'utils/tokens';
import { ActionIndex } from 'utils/types';
import {
  validateAddress,
  validateTokenAddress,
  validateTokenAmount,
} from 'utils/validators';
import { useAlertContext } from 'context/alert';

type ConfigureSwapFormProps = ActionIndex & {
  groupActionIndex: number
}

const ConfigureNFTBuyForm: React.FC<ConfigureSwapFormProps> = ({
  actionIndex,
  groupActionIndex
}) => {
  const { t } = useTranslation();
  const client = useApolloClient();
  const { network } = useNetwork();
  const { address } = useWallet();
  const { infura: provider } = useProviders();
  const { data: daoAddress } = useDaoParam();
  const { alert } = useAlertContext();

  const { control, getValues, trigger, resetField, setFocus, setValue } =
    useFormContext();

  const { errors, dirtyFields } = useFormState({ control });
  const [
    from,
    to,
    amount,
  ] =
    useWatch({
      name: [
        `actions.${actionIndex}.from`,
        `actions.${actionIndex}.to`,
        `actions.${actionIndex}.amount`
      ],
    });
  const nativeCurrency = CHAIN_METADATA[network].nativeCurrency;

  /*************************************************
   *                    Hooks                      *
   *************************************************/
  useEffect(() => {

    if (from === '') {
      setValue(`actions.${actionIndex}.from`, daoAddress);
    }
  }, [
    address,
    daoAddress,
    from,
    actionIndex,
    setFocus,
    setValue,
    nativeCurrency,
  ]);


  // Fetch custom token information
  useEffect(() => {

    const fetchTokenInfo = async () => {
      if (errors.tokenAddress !== undefined) {
        if (dirtyFields.amount)
          trigger([
            `actions.${actionIndex}.amount`,
            `actions.${actionIndex}.tokenSymbol`,
          ]);
        return;
      }

      try {

        setValue(`actions.${actionIndex}.to`, to);
        setValue(`actions.${actionIndex}.from`, from);
        setValue(`actions.${actionIndex}.amount`, amount);

      } catch (error) {
        /**
         * Error is intentionally swallowed. Passing invalid address will
         * return error, but should not be thrown.
         * Also, double safeguard. Should not actually fall into here since
         * tokenAddress should be valid in the first place for balance to be fetched.
         */
        console.error(error);
      }
      if (dirtyFields.amount)
        trigger([
          `actions.${actionIndex}.amount`,
          `actions.${actionIndex}.tokenSymbol`,
        ]);


    };

    fetchTokenInfo();
  }, [
    address,
    dirtyFields.amount,
    errors.tokenAddress,
    actionIndex,
    provider,
    setValue,
    trigger,
    client,
    network,
    daoAddress,
    nativeCurrency,
  ]);


  // clear field when there is a value, else paste
  const handleAdornmentClick = useCallback(
    (value: string, onChange: (value: string) => void) => {
      // when there is a value clear it
      if (value) {
        onChange('');
        alert(t('alert.chip.inputCleared'));
      } else handleClipboardActions(value, onChange, alert);
    },
    [alert, t]
  );


  /*************************************************
   *                    Render                     *
   *************************************************/
  return (
    <>
      <FormItem>
        <Label
          label={'Opensea NFT url'}
          helpText={'Enter Opensea NFT url'}
        />
        <Controller
          name={`actions.${actionIndex}.url`}
          control={control}
          defaultValue=""
          render={({
            field: { name, onBlur, onChange, value },
            fieldState: { error },
          }) => (
            <>
              <ValueInput
                mode={error ? 'critical' : 'default'}
                name={name}
                value={value}
                onBlur={onBlur}
                onChange={onChange}
                placeholder={'https://testnets.opensea.io/assets/goerli/0xf../5'}
                onAdornmentClick={() => handleAdornmentClick(value, onChange)}
              />
              {error?.message && (
                <AlertInline label={error.message} mode="critical" />
              )}
            </>
          )}
        />
      </FormItem>
    </>
  );
};

export default ConfigureNFTBuyForm;

/**
 * Check if the screen is valid
 * @param dirtyFields List of fields that have been changed
 * @param errors List of fields that have errors
 * @param tokenAddress Token address
 * @returns Whether the screen is valid
 */
export function isValid(
  dirtyFields?: FormState<WithdrawAction>['dirtyFields'],
  errors?: FormState<WithdrawAction>['errors'],
  tokenAddress?: string
) {
  // check if fields are dirty
  if (!dirtyFields?.amount || !tokenAddress) return false;

  // check if fields have errors
  if (errors?.to || errors?.amount || errors?.tokenAddress) return false;

  return true;
}

/*************************************************
 *               Styled Components               *
 *************************************************/

const FormItem = styled.div.attrs({
  className: 'space-y-1.5',
})``;

const TokenBalance = styled.p.attrs({
  className: 'flex-1 px-1 text-xs text-right text-ui-600',
})``;

const StyledInput = styled(ValueInput)`
  ::-webkit-inner-spin-button,
  ::-webkit-outer-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
  -moz-appearance: textfield;
`;
