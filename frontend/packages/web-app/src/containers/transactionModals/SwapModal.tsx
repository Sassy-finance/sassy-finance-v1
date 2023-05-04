import {
  AlertInline,
  ButtonText,
  IconReload,
  LinearProgress,
  Spinner,
} from '@aragon/ui-components';
import ModalBottomSheetSwitcher from 'components/modalBottomSheetSwitcher';
import {useNetwork} from 'context/network';
import React, {useEffect, useMemo, useState} from 'react';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';
import {CHAIN_METADATA, TransactionState} from 'utils/constants';
import {formatUnits} from 'utils/library';

type TransactionModalProps = {
  state: TransactionState;
  handleSwap: () => void;
  handleApproval?: () => void;
  isOpen: boolean;
  onClose: () => void;
  closeOnDrag: boolean;
  currentStep: number;
  includeApproval?: boolean;
  tokenDecimals: number;
  tokenAddress: string;
  tokenSymbol?: string;
  handleOpenModal: () => void;
};

const icons = {
  [TransactionState.WAITING]: undefined,
  [TransactionState.LOADING]: <Spinner size="xs" color="white" />,
  [TransactionState.SUCCESS]: undefined,
  [TransactionState.ERROR]: <IconReload />,
};

const SwapModal: React.FC<TransactionModalProps> = ({
  state = TransactionState.WAITING,
  handleSwap,
  handleApproval,
  isOpen,
  onClose,
  closeOnDrag,
  currentStep,
  includeApproval = false,
  tokenDecimals,
  tokenSymbol,
  tokenAddress,
  handleOpenModal,
}) => {
  const {t} = useTranslation();
  const {network} = useNetwork();
  const [updateBlink, setUpdateBlink] = useState(false);

  const label = {
    [TransactionState.WAITING]: 'Swap tokens',
    [TransactionState.LOADING]: 'Swap tokens',
    [TransactionState.SUCCESS]: t('TransactionModal.goToFinance'),
    [TransactionState.ERROR]: t('TransactionModal.tryAgain'),
  };

  const handleApproveClick = () => {
    handleApproval?.();
  };

  const handleButtonClick = () => {
    switch (state) {
      case TransactionState.SUCCESS:
        onClose();
        break;
      case TransactionState.ERROR:
        handleOpenModal();
        break;
      case TransactionState.LOADING:
        break;
      default:
        handleSwap();
    }
  };


  return (
    <ModalBottomSheetSwitcher
      {...{isOpen, onClose, closeOnDrag}}
      title={'Swap tokens'}
    >
      <GasCostTableContainer>
        <GasCostEthContainer>
          <VStack>
            <VStack>
              <Label>{t('TransactionModal.estimatedFees')}</Label>
              <p className="text-sm text-ui-500">
                {t('TransactionModal.maxFee')}
              </p>
            </VStack>
          </VStack>
          <VStack>
            <StrongText {...{updateBlink}}>{0}</StrongText>
            <LightText {...{updateBlink}}>{0}</LightText>
          </VStack>
        </GasCostEthContainer>

        <GasCostUSDContainer>
          <Label>{t('TransactionModal.totalCost')}</Label>
          <VStack>
            <StrongText {...{updateBlink}}>{0}</StrongText>
            <LightText {...{updateBlink}}>{0}</LightText>
          </VStack>
        </GasCostUSDContainer>
      </GasCostTableContainer>
      <ApproveTxContainer>
        {includeApproval && (
          <>
            <WizardContainer>
              <PrimaryColoredText>
                {currentStep === 1
                  ? 'Approve Swap'
                  : 'Swap tokens'
                }
              </PrimaryColoredText>
              <p className="text-ui-400">{`${t(
                'labels.step'
              )} ${currentStep} ${t('labels.of')} 2`}</p>
            </WizardContainer>

            <LinearProgress max={2} value={currentStep} />

            <ApproveSubtitle>
              {'Approve Swap'}
            </ApproveSubtitle>
          </>
        )}
        <HStack>
          {includeApproval && (
            <ButtonText
              className="mt-3 w-full"
              label={'Approve Swap'}
              iconLeft={currentStep === 1 ? icons[state] : undefined}
              onClick={handleApproveClick}
              disabled={currentStep !== 1}
            />
          )}
          <ButtonText
            className={includeApproval ? 'mt-3 w-full' : 'w-full'}
            label={label[state]}
            iconLeft={currentStep === 2 ? icons[state] : undefined}
            onClick={handleButtonClick}
            disabled={currentStep !== 2}
          />
        </HStack>

        {state === TransactionState.ERROR && (
          <AlertInlineContainer>
            <AlertInline
              label={t('TransactionModal.errorLabel')}
              mode="critical"
            />
          </AlertInlineContainer>
        )}
        {state === TransactionState.SUCCESS && (
          <AlertInlineContainer>
            <AlertInline
              label={t('TransactionModal.successLabel')}
              mode="success"
            />
          </AlertInlineContainer>
        )}
      </ApproveTxContainer>
    </ModalBottomSheetSwitcher>
  );
};

export default SwapModal;

type StrongLightTextProps = {
  updateBlink?: boolean;
};

const GasCostTableContainer = styled.div.attrs({
  className: 'm-3 bg-white rounded-xl border border-ui-100',
})``;

const GasCostEthContainer = styled.div.attrs({
  className: 'flex justify-between py-1.5 px-2',
})``;

const DepositAmountContainer = styled.div.attrs({
  className: 'flex justify-between py-1.5 px-2 border-ui-100',
})`
  border-bottom-width: 2px;
`;

const GasCostUSDContainer = styled.div.attrs({
  className: 'flex justify-between py-1.5 px-2 rounded-b-xl bg-ui-100',
})``;

const ApproveTxContainer = styled.div.attrs({
  className: 'p-3 bg-white rounded-b-xl',
})``;

const AlertInlineContainer = styled.div.attrs({
  className: 'mx-auto mt-2 w-max',
})``;

const HStack = styled.div.attrs({
  className: 'flex gap-x-2',
})``;

const WizardContainer = styled.div.attrs({
  className: 'flex justify-between mb-1 text-sm',
})``;

const VStack = styled.div.attrs({
  className: 'space-y-0.25',
})``;

const StrongText = styled.p.attrs({
  className: 'font-bold text-right text-ui-600',
})<StrongLightTextProps>`
  ${props =>
    props.updateBlink &&
    `
  animation: blinker 1s linear infinite;
  @keyframes blinker {
    50% {
      opacity: 0;
    }
  }
  `}
`;

const LightText = styled.p.attrs({
  className: 'text-sm text-right text-ui-500',
})<StrongLightTextProps>`
  ${props =>
    props.updateBlink &&
    `
  animation: blinker 1s linear infinite;
  @keyframes blinker {
    50% {
      opacity: 0;
    }
  }
  `}
`;

const Label = styled.p.attrs({
  className: 'text-ui-600',
})``;

const PrimaryColoredText = styled.p.attrs({
  className: 'font-bold text-primary-500',
})``;

const ApproveSubtitle = styled.p.attrs({
  className: 'mt-1 text-sm text-ui-600',
})``;
