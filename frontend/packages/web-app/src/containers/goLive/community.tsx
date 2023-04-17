import {Link, Tag} from '@aragon/ui-components';
import React from 'react';
import {Controller, useFormContext} from 'react-hook-form';
import {useTranslation} from 'react-i18next';

import {Dd, DescriptionListContainer, Dl, Dt} from 'components/descriptionList';
import {useFormStep} from 'components/fullScreenStepper';
import CommunityAddressesModal from 'containers/communityAddressesModal';
import {useGlobalModalContext} from 'context/globalModals';

const Community: React.FC = () => {
  const {control, getValues} = useFormContext();
  const {setStep} = useFormStep();
  const {open} = useGlobalModalContext();
  const {t} = useTranslation();
  const {
    membership,
    tokenName,
    wallets,
    isCustomToken,
    tokenSymbol,
    tokenTotalSupply,
    multisigWallets,
    reviewCheckError,
    eligibilityType,
    eligibilityTokenAmount,
  } = getValues();

  return (
    <Controller
      name="reviewCheck.community"
      control={control}
      defaultValue={false}
      rules={{
        required: t('errors.required.recipient'),
      }}
      render={({field: {onChange, value}}) => (
        <DescriptionListContainer
          title={t('labels.review.voters')}
          onEditClick={() => setStep(4)}
          checkBoxErrorMessage={t('createDAO.review.acceptContent')}
          checkedState={
            value ? 'active' : reviewCheckError ? 'error' : 'default'
          }
          tagLabel={t('labels.changeableVote')}
          onChecked={() => onChange(!value)}
        >
          <Dl>
            <Dt>{t('labels.review.eligibleVoters')}</Dt>
            <Dd>
              {membership === 'token'
                ? t('createDAO.step3.tokenMembership')
                : t('labels.multisigMembers')}
            </Dd>
          </Dl>

          {membership === 'multisig' && (
            <>
              <Dl>
                <Dt>{t('labels.review.distribution')}</Dt>
                <Dd>
                  <Link
                    label={t('labels.review.distributionLink', {
                      walletCount: multisigWallets.length,
                    })}
                    onClick={() => open('addresses')}
                  />
                </Dd>
              </Dl>
              <Dl>
                <Dt>{t('labels.proposalCreation')}</Dt>
                <Dd>
                  {eligibilityType === 'anyone'
                    ? t('labels.anyWallet')
                    : t('labels.multisigMembers')}
                </Dd>
              </Dl>
            </>
          )}

          {membership === 'token' && (
            <>
              <Dl>
                <Dt>{t('votingTerminal.token')}</Dt>
                <Dd>
                  <div className="flex items-center space-x-1.5">
                    <span>{tokenName}</span>
                    <span>{tokenSymbol}</span>
                    {isCustomToken && (
                      <Tag label={t('labels.new')} colorScheme="info" />
                    )}
                  </div>
                </Dd>
              </Dl>
              <Dl>
                <Dt>{t('labels.supply')}</Dt>
                <Dd>
                  <div className="flex items-center space-x-1.5">
                    <p>
                      {tokenTotalSupply} {tokenSymbol}
                    </p>
                    <Tag label={t('labels.mintable')} colorScheme="neutral" />
                  </div>
                </Dd>
              </Dl>
              <Dl>
                <Dt>{t('labels.review.distribution')}</Dt>
                <Dd>
                  <Link
                    label={t('createDAO.review.distributionLink', {
                      count: wallets?.length,
                    })}
                    onClick={() => open('addresses')}
                  />
                </Dd>
              </Dl>
              <Dl>
                <Dt>{t('labels.proposalCreation')}</Dt>
                <Dd>
                  {eligibilityType === 'token'
                    ? t('createDAO.review.proposalCreation', {
                        token: eligibilityTokenAmount,
                        symbol: tokenSymbol,
                      })
                    : t('createDAO.step3.eligibility.anyWallet.title')}
                </Dd>
              </Dl>
            </>
          )}

          <CommunityAddressesModal tokenMembership={membership === 'token'} />
        </DescriptionListContainer>
      )}
    />
  );
};

export default Community;
