import { formatBalance } from '@polkadot/util';
import { ToBn } from '@polkadot/util/types';
import { memo } from 'react';
import styled from 'styled-components';

import { TokenWithBalance } from '@helpers/interfaces';

interface TokenWithBalanceRowProps {
  token: TokenWithBalance;
  handleRowClick: (token: TokenWithBalance) => void;
}

const SRow = styled.section`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  height: 50px;
  border: 1px solid #e8dcdc;
  padding: 10px;
  border-radius: 15px;

  :hover {
    cursor: pointer;
  }

  &.active,
  :hover {
    background-color: ${({ theme }) => theme.fill12};
  }
`;

const SColumn = styled.section`
  display: flex;
  flex-direction: column;
  flex: 1;
`;

const SSupply = styled.span`
  text-align: right;
`;

const TokenWithBalanceRow = ({ token, handleRowClick }: TokenWithBalanceRowProps) => {
  const { name, symbol, decimals, balance } = token;
  const formattedSymbol = symbol.toUpperCase();
  const formattedSupply = balance
    ? formatBalance(balance as unknown as ToBn, {
        decimals,
        withSi: true,
        withUnit: formattedSymbol,
        withZero: false,
      })
    : '0';

  return (
    <SRow onClick={() => handleRowClick(token)}>
      <SColumn>
        <span>{name}</span>
      </SColumn>
      <SColumn>
        <SSupply>{formattedSupply}</SSupply>
      </SColumn>
    </SRow>
  );
};

export default memo(TokenWithBalanceRow);
