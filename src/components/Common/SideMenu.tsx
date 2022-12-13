import { memo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import styled from 'styled-components';

import { routes } from '@helpers/routes';
import { styleSettings } from '@helpers/config';
import { normalizePath } from '@helpers/utilities';

const SNav = styled.nav`
  display: flex;
  flex-direction: column;
  min-width: 166px;
  gap: 20px;

  a {
    color: ${styleSettings.colors.shark};
  }
`;

const SMenuButton = styled(Link)<SMenuButtonProps>`
  color: ${styleSettings.colors.shark};
  text-decoration: none;
  padding: 8px 20px;
  background-color: ${({ route, currentroute }) => (route === currentroute ? styleSettings.colors.cerise : styleSettings.colors.alto)};
  border-radius: 20px;
  text-align: center;
`;

interface SMenuButtonProps {
  route: string;
  currentroute: string;
}

const SideMenu = () => {
  const { pathname } = useLocation();

  if (normalizePath(pathname) === routes.homepage) {
    return null;
  }

  return (
    <SNav>
      <SMenuButton to={routes.nftCollections} route={routes.nftCollections} currentroute={pathname}>
        My Nft Collection
      </SMenuButton>
      <SMenuButton to={routes.newCollection} route={routes.newCollection} currentroute={pathname}>
        New Collection
      </SMenuButton>
    </SNav>
  );
};

export default memo(SideMenu);