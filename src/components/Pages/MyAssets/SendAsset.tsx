import { BN } from '@polkadot/util';
import SendTokenWidget from '@widgets/SendTokenWidget';
import { isEmpty } from 'lodash';
import { memo, useCallback, useEffect, useState } from 'react';
import styled from 'styled-components';

import Title from '@common/Title';

import type { TokenWithBalance } from '@helpers/interfaces';

import { useAssets } from '@hooks/useAssets';

import TokenWithBalanceRow from '@pages/Assets/Tokens/TokenWithBalanceRow';

const SMyAssets = styled.div`
  display: flex;
  gap: 50px;
`;

const SMainContent = styled.div`
  flex-grow: 2;

  section {
    margin-bottom: 20px;
  }
`;

const SSideContent = styled.aside`
  flex-grow: 1;
  max-width: 380px;
`;

const MyAssets = () => {
  const [tokens, setTokens] = useState<TokenWithBalance[]>();
  const [feeTokens, setFeeTokens] = useState<TokenWithBalance[]>([]);
  const [selectedToken, setSelectedToken] = useState<TokenWithBalance>();
  const { getAllTokensWithNativeAndBalances } = useAssets();

  useEffect(() => {
    getAllTokensWithNativeAndBalances().then(setTokens);
  }, [getAllTokensWithNativeAndBalances]);

  const onRowClick = useCallback((token: TokenWithBalance) => {
    setSelectedToken(token);
  }, []);

  useEffect(() => {
    if (!tokens) return;
    const native = tokens.find((t) => t.id.isNative);
    if (native) setSelectedToken(native);

    setFeeTokens(tokens.filter((token) => token.balance && token.balance.gt(new BN(0))));
  }, [tokens]);

  return (
    <SMyAssets>
      <SMainContent>
        <section>
          <Title className='L'>My assets</Title>
        </section>
        <section>
          {!tokens || isEmpty(tokens) ? (
            <>Gathering data... please wait</>
          ) : (
            <>
              {tokens.map((token) => (
                <TokenWithBalanceRow key={token.id.toHex()} token={token} handleRowClick={onRowClick} />
              ))}
            </>
          )}
        </section>
      </SMainContent>

      <SSideContent>
        {tokens && !isEmpty(tokens) && selectedToken && (
          <SendTokenWidget sendToken={selectedToken} feeTokens={feeTokens} />
        )}
      </SSideContent>
    </SMyAssets>
  );
};

export default memo(MyAssets);
