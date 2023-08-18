import { BN } from '@polkadot/util';
import { FormEvent, memo, useCallback, useEffect, useState } from 'react';
import Form from 'react-bootstrap/Form';
import Stack from 'react-bootstrap/Stack';
import styled from 'styled-components';

import ActionButton from '@buttons/ActionButton';

import ModalStatus from '@common/ModalStatus';
import Title from '@common/Title';

import { useAccounts } from '@contexts/AccountsContext';

import { MultiAssetId, TokenWithBalance } from '@helpers/interfaces';
import {
  getCleanFormattedBalance,
  isValidAddress,
  multiAssetToParam,
  parseAssetParam,
  pricePattern,
  unitToPlanck,
} from '@helpers/utilities';

import { useAssets } from '@hooks/useAssets';

const SNotification = styled.div`
  padding: 10px;
  margin-bottom: 10px;
  border: 1px red solid;
  border-radius: 5px;
`;

const SInputRow = styled.section`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  align-items: center;
`;

const SLeftColumn = styled.section`
  display: flex;
  flex-direction: row;
  flex: 1;
`;

const SRightColumn = styled.section`
  display: flex;
  flex-direction: row;
  flex: 0;
  margin-left: 10px;
`;

interface SendAssetWidgetProps {
  sendToken: TokenWithBalance;
  feeTokens: TokenWithBalance[];
}

const SendTokenWidget = ({ sendToken, feeTokens }: SendAssetWidgetProps) => {
  const { activeAccount, api } = useAccounts();
  const { doSendToken } = useAssets();
  const [feeToken, setFeeToken] = useState<MultiAssetId>();
  const [sendAmount, setSendAmount] = useState<string>('');
  const [receiver, setReceiver] = useState<string>('');
  const [notification, setNotification] = useState<string>('');
  const [formDisabled, setFormDisabled] = useState<boolean>(true);

  const submitForm = useCallback(
    async (event: FormEvent) => {
      event.preventDefault();
      if (formDisabled || !api || !activeAccount || !feeToken) return;

      doSendToken(sendToken.id, new BN(unitToPlanck(sendAmount, sendToken.decimals)), receiver, feeToken);
    },
    [api, activeAccount, formDisabled, doSendToken, sendToken, sendAmount, receiver, feeToken],
  );

  const onSendAmountChanged = useCallback(
    (amount: string) => {
      if (amount === '') {
        setSendAmount('');
        return;
      }

      if (!amount.match(pricePattern(sendToken.decimals))) return;
      setSendAmount(amount);
    },
    [sendToken],
  );

  useEffect(() => {
    if (!feeTokens || !feeTokens.length) return;
    const native = feeTokens.find((t) => t.id.isNative);

    if (native) setFeeToken(native.id);
    else setFeeToken(feeTokens[0].id);
  }, [feeTokens]);

  useEffect(() => {
    setNotification('');
    setSendAmount('');
  }, [sendToken]);

  // fields validation
  useEffect(() => {
    setFormDisabled(true);
    setNotification('');

    let hasErrors = false;
    if (!receiver || !sendAmount) hasErrors = true;

    if (receiver !== '' && !isValidAddress(receiver)) {
      hasErrors = true;
      setNotification('Invalid receiver');
    }

    if (sendAmount !== '') {
      const sendPlanck = unitToPlanck(sendAmount, sendToken.decimals);
      if (!sendToken.balance || sendToken.balance.lt(new BN(sendPlanck))) {
        hasErrors = true;
        setNotification('Insufficient funds');
      }
    }

    setFormDisabled(hasErrors);
  }, [sendAmount, receiver, sendToken]);

  if (!api || !activeAccount) {
    return null;
  }

  return (
    <>
      <Title className='L'>
        <>Send {sendToken.symbol.toUpperCase()}</>
      </Title>
      <ModalStatus />

      <Form onSubmit={submitForm}>
        <Form.Group className='mb-3'>
          <Form.Label>Amount</Form.Label>
          <SInputRow>
            <SLeftColumn>
              <Form.Control
                value={sendAmount}
                placeholder='0.0'
                type='text'
                pattern={pricePattern(sendToken.decimals)}
                onChange={(event) => onSendAmountChanged(event.target.value)}
                min={0}
              />
            </SLeftColumn>
            {sendToken.balance && (
              <SRightColumn>
                <ActionButton
                  className='main XS'
                  type='button'
                  action={() =>
                    onSendAmountChanged(getCleanFormattedBalance(sendToken.balance as BN, sendToken.decimals))
                  }
                >
                  Max
                </ActionButton>
              </SRightColumn>
            )}
          </SInputRow>
        </Form.Group>

        <Form.Group className='mb-3'>
          <Form.Label>Receiver</Form.Label>
          <Form.Control value={receiver} type='text' onChange={(event) => setReceiver(event.target.value)} />
        </Form.Group>

        <Form.Group className='mb-3'>
          <Form.Label>Pay fee with</Form.Label>
          <Form.Select
            className='mb-3'
            value={feeToken && multiAssetToParam(feeToken)}
            onChange={(event) => setFeeToken(parseAssetParam(event.target.value, api)!)}
          >
            {feeTokens.map(({ id, symbol }) => (
              <option key={symbol} value={multiAssetToParam(id)}>
                {symbol.toUpperCase()}
              </option>
            ))}
          </Form.Select>
        </Form.Group>

        {notification && <SNotification>{notification}</SNotification>}

        <Stack direction='horizontal' gap={2} className='justify-content-end'>
          <ActionButton type='submit' className='main S' isDisabled={formDisabled}>
            Send
          </ActionButton>
        </Stack>
      </Form>
    </>
  );
};

export default memo(SendTokenWidget);
