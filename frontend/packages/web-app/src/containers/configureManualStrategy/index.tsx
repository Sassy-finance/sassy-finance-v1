import {
  AlertInline,
  DropdownInput,
  Label,
  ValueInput,
} from '@aragon/ui-components';

import {useApolloClient} from '@apollo/client';
import React, {useCallback, useEffect} from 'react';
import {
  Controller,
  FormState,
  useFormContext,
  useFormState,
  useWatch,
} from 'react-hook-form';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';

import {useActionsContext} from 'context/actions';
import {useGlobalModalContext} from 'context/globalModals';
import {useNetwork} from 'context/network';
import {useProviders} from 'context/providers';
import {isAddress} from 'ethers/lib/utils';
import {useDaoParam} from 'hooks/useDaoParam';
import {useWallet} from 'hooks/useWallet';
import {WithdrawAction} from 'pages/newWithdraw';
import {fetchTokenData} from 'services/prices';
import {CHAIN_METADATA} from 'utils/constants';
import {handleClipboardActions} from 'utils/library';
import {fetchBalance, getTokenInfo, isNativeToken} from 'utils/tokens';
import {ActionIndex} from 'utils/types';
import {
  validateAddress,
  validateTokenAddress,
  validateTokenAmount,
} from 'utils/validators';
import {useAlertContext} from 'context/alert';

type ConfigureManualStrategyFormProps = ActionIndex; //extend if necessary

const ConfigureManualStrategy: React.FC<ConfigureManualStrategyFormProps> = ({
  actionIndex,
}) => {
  const {t} = useTranslation();
  const client = useApolloClient();
  const {network} = useNetwork();
  const {address} = useWallet();
  const {infura: provider} = useProviders();
  const {data: daoAddress} = useDaoParam();
  const {alert} = useAlertContext();

  const {control, getValues, trigger, resetField, setFocus, setValue} =
    useFormContext();

  const {errors, dirtyFields} = useFormState({control});
  const [name, from, tokenAddress, isCustomToken, tokenBalance, tokenSymbol] =
    useWatch({
      name: [
        `actions.${actionIndex}.name`,
        `actions.${actionIndex}.from`,
        `actions.${actionIndex}.tokenAddress`,
        `actions.${actionIndex}.isCustomToken`,
        `actions.${actionIndex}.tokenBalance`,
        `actions.${actionIndex}.tokenSymbol`,
      ],
    });
  const nativeCurrency = CHAIN_METADATA[network].nativeCurrency;

  /*************************************************
   *                    Hooks                      *
   *************************************************/
  useEffect(() => {
    if (isCustomToken) setFocus(`actions.${actionIndex}.tokenAddress`);

    if (from === '') {
      setValue(`actions.${actionIndex}.from`, daoAddress);
    }
  }, [
    address,
    daoAddress,
    from,
    actionIndex,
    isCustomToken,
    setFocus,
    setValue,
    nativeCurrency,
  ]);

  useEffect(() => {
    if (!name) {
      setValue(`actions.${actionIndex}.name`, 'withdraw_assets');
    }
  }, [actionIndex, name, setValue]);



  /*************************************************
   *             Callbacks and Handlers            *
   *************************************************/
  const renderWarning = useCallback(
    (value: string) => {
      // Insufficient data to calculate warning
      if (!tokenBalance || value === '') return null;

      if (Number(value) > Number(tokenBalance))
        return (
          <AlertInline label={t('warnings.amountGtDaoToken')} mode="warning" />
        );
    },
    [tokenBalance, t]
  );

  // add maximum amount to amount field
  const handleMaxClicked = useCallback(
    (onChange: React.ChangeEventHandler<HTMLInputElement>) => {
      if (tokenBalance) {
        onChange(tokenBalance);
        alert(t('alert.chip.max'));
      }
    },
    [alert, t, tokenBalance]
  );

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
   *                Field Validators               *
   *************************************************/
  const addressValidator = useCallback(
    async (address: string) => {
      if (isNativeToken(address)) return true;

      const validationResult = await validateTokenAddress(address, provider);

      // address invalid, reset token fields
      if (validationResult !== true) {
        resetField(`actions.${actionIndex}.tokenName`);
        resetField(`actions.${actionIndex}.tokenImgUrl`);
        resetField(`actions.${actionIndex}.tokenSymbol`);
        resetField(`actions.${actionIndex}.tokenBalance`);
      }

      return validationResult;
    },
    [actionIndex, provider, resetField]
  );


  const recipientValidator = useCallback(
    async (recipient: string) => {
      let ensAddress = null;

      try {
        ensAddress = await provider?.resolveName(recipient);
      } catch (err) {
        console.error('Error, fetching ens name', err);

        if (isAddress(recipient)) return validateAddress(recipient);
        return t('errors.ensUnsupported');
      }

      // if no associating ensAddress, assume normal address and not ens name
      if (ensAddress) return true;
      return validateAddress(recipient);
    },
    [provider, t]
  );

  /*************************************************
   *                    Render                     *
   *************************************************/
  return (
    <>
      {/* Recipient (to) */}
      <FormItem>
        <Label
          label={t('labels.recipient')}
          helpText={t('newStrategy.configureStrategy.toSubtitle')}
        />
        <Controller
          name={`actions.${actionIndex}.to`}
          control={control}
          defaultValue=""
          rules={{
            required: t('errors.required.recipient'),
            validate: recipientValidator,
          }}
          render={({
            field: {name, onBlur, onChange, value},
            fieldState: {error},
          }) => (
            <>
              <ValueInput
                mode={error ? 'critical' : 'default'}
                name={name}
                value={value}
                onBlur={onBlur}
                onChange={onChange}
                placeholder={t('placeHolders.walletOrEns')}
                adornmentText={value ? t('labels.clear') : t('labels.paste')}
                onAdornmentClick={() => handleAdornmentClick(value, onChange)}
              />
              {error?.message && (
                <AlertInline label={error.message} mode="critical" />
              )}
            </>
          )}
        />
      </FormItem>

      {/* Token amount */}
      <FormItem>
        <Label
          label={t('labels.amount')}
          helpText={t('newStrategy.configureStrategy.amountSubtitle')}
        />
        <Controller
          name={`actions.${actionIndex}.amount`}
          control={control}
          defaultValue=""
          rules={{
            required: t('errors.required.amount')
          }}
          render={({
            field: {name, onBlur, onChange, value},
            fieldState: {error},
          }) => (
            <>
              <StyledInput
                mode={error ? 'critical' : 'default'}
                name={name}
                type="number"
                value={value}
                placeholder="0"
                onBlur={onBlur}
                onChange={onChange}
                adornmentText={t('labels.max')}
                onAdornmentClick={() => handleMaxClicked(onChange)}
              />
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  {error?.message && (
                    <AlertInline label={error.message} mode="critical" />
                  )}
                  {renderWarning(value)}
                </div>
                {tokenBalance && (
                  <TokenBalance>
                    {`${t(
                      'labels.maxBalance'
                    )}: ${tokenBalance} ${tokenSymbol}`}
                  </TokenBalance>
                )}
              </div>
            </>
          )}
        />
      </FormItem>
    </>
  );
};

export default ConfigureManualStrategy;

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
  if (!dirtyFields?.to || !dirtyFields?.amount || !tokenAddress) return false;

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
