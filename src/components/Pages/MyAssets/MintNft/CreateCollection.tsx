import { ChangeEvent, FormEvent, memo, useCallback, useRef, useState } from 'react';
import { FormControl } from 'react-bootstrap';
import Collapse from 'react-bootstrap/esm/Collapse';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

import { saveImageToIpfs } from '@api/pinata';

import ActionButton from '@buttons/ActionButton';
import DateRangeButton from '@buttons/DateRangeButton';
import IconButton from '@buttons/IconButton';

import Checkbox from '@common/Checkbox';
import FileDropZone from '@common/FileDropZone';
import ModalStatus from '@common/ModalStatus';
import Radio from '@common/Radio';

import { useAccounts } from '@contexts/AccountsContext';

import { MintTypes } from '@helpers/constants';
import { CollectionConfig, CollectionMetadataData, MintType } from '@helpers/interfaces';
import {
  CssArrowDown,
  CssFontSemiBoldL,
  CssFontSemiBoldXL,
  SFormBlock,
  SInfoRow,
  SPageControls,
} from '@helpers/reusableStyles';
import { SFormLayout, SGroup, SLabel } from '@helpers/styledComponents';
import {
  convertToBitFlagValue,
  ellipseAddress,
  getBlockNumber,
  pricePattern,
  unitToPlanck,
  wholeNumbersPattern,
} from '@helpers/utilities';

import { useCollections } from '@hooks/useCollections';

import DropdownIcon from '@images/icons/arrow.svg';
import BackIcon from '@images/icons/back.svg';

const SHat = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 48px;

  button {
    width: 56px;
    height: 56px;
  }
`;

const STitle = styled.div`
  ${CssFontSemiBoldXL}
`;

const SToggleBlock = styled.div`
  padding-top: 32px;
`;

const SToggle = styled.button`
  ${CssFontSemiBoldL}

  padding: 0;
  border: 0;
  background: none;
  color: ${({ theme }) => theme.textAndIconsPrimary};

  .arrow-down {
    ${CssArrowDown}
    margin: 0;
  }
`;

const SDescription = styled.p`
  margin: 12px 0 24px;
  color: ${({ theme }) => theme.textAndIconsTertiary};

  :last-child {
    margin-bottom: 0;
  }
`;

const CreateCollection = () => {
  const { api, activeAccount } = useAccounts();
  const { createCollection } = useCollections();
  const collectionNameRef = useRef<HTMLInputElement>(null);
  const collectionDescriptionRef = useRef<HTMLTextAreaElement>(null);
  const transferrableItemsRef = useRef<HTMLInputElement | null>(null);
  const unlockedMetadataRef = useRef<HTMLInputElement | null>(null);
  const unlockedAttributesRef = useRef<HTMLInputElement | null>(null);
  const unlockedMaxSupplyRef = useRef<HTMLInputElement | null>(null);
  const maxSupplyRef = useRef<HTMLInputElement | null>(null);
  const transferrableItemRef = useRef<HTMLInputElement | null>(null);
  const unlockedItemMetadataRef = useRef<HTMLInputElement | null>(null);
  const unlockedItemAttributesRef = useRef<HTMLInputElement | null>(null);
  const holderOfCollectionIdRef = useRef<HTMLInputElement | null>(null);
  const [price, setPrice] = useState<string>('');
  const [imageCid, setImageCid] = useState<string>();
  const [imageSourceUrl, setImageSourceUrl] = useState<string>();
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [mintType, setMintType] = useState<MintTypes>(MintTypes.ISSUER);
  const [toggleCollectionSettings, setToggleCollectionSettings] = useState<boolean>(false);
  const [toggleMintSettings, setToggleMintSettings] = useState<boolean>(false);

  const submitCreateCollection = useCallback(
    async (event: FormEvent) => {
      event.preventDefault();

      if (
        api !== null &&
        collectionNameRef.current !== null &&
        collectionDescriptionRef.current !== null &&
        transferrableItemsRef.current !== null &&
        unlockedMetadataRef.current !== null &&
        unlockedAttributesRef.current !== null &&
        unlockedMaxSupplyRef.current !== null &&
        maxSupplyRef.current !== null &&
        transferrableItemRef.current !== null &&
        unlockedItemMetadataRef.current !== null &&
        unlockedItemAttributesRef.current !== null
      ) {
        const settings = convertToBitFlagValue([
          transferrableItemsRef.current.checked,
          unlockedMetadataRef.current.checked,
          unlockedAttributesRef.current.checked,
          unlockedMaxSupplyRef.current.checked,
        ]);

        const defaultItemSettings = convertToBitFlagValue([
          transferrableItemRef.current.checked,
          unlockedItemMetadataRef.current.checked,
          unlockedItemAttributesRef.current.checked,
        ]);

        const startBlock = await getBlockNumber(api, startDate?.getTime());
        const endBlock = await getBlockNumber(api, endDate?.getTime());

        let mintTypeFinalized: MintType = mintType;
        if (mintType === MintTypes.HOLDER_OF) {
          if (holderOfCollectionIdRef.current === null) {
            return;
          }

          mintTypeFinalized = {
            [MintTypes.HOLDER_OF]: holderOfCollectionIdRef.current.value,
          };
        }

        const collectionConfig: CollectionConfig = {
          settings,
          maxSupply: maxSupplyRef.current.value === '' ? undefined : parseInt(maxSupplyRef.current.value, 10),
          mintSettings: {
            mintType: mintTypeFinalized,
            price: price === '' ? undefined : unitToPlanck(price, api.registry.chainDecimals[0]),
            startBlock,
            endBlock,
            defaultItemSettings,
          },
        };

        const collectionMetadata: CollectionMetadataData = {
          name: collectionNameRef.current.value,
          description: collectionDescriptionRef.current ? collectionDescriptionRef.current.value : undefined,
          image: imageCid,
        };

        Promise.all([saveImageToIpfs(imageSourceUrl), createCollection(collectionConfig, collectionMetadata)]);
      }
    },
    [api, startDate, endDate, mintType, price, imageCid, imageSourceUrl, createCollection],
  );

  const mintTypeChangeHandler = (event: ChangeEvent<HTMLInputElement>) => setMintType(event.target.value as MintTypes);

  if (!api) {
    return null;
  }

  const chainDecimals = api.registry.chainDecimals[0];

  return (
    <>
      <ModalStatus />
      <SHat>
        <Link to='..'>
          <IconButton icon={<BackIcon />} />
        </Link>
        <STitle>Create New Collection</STitle>
      </SHat>

      <SFormLayout onSubmit={submitCreateCollection}>
        <aside>
          <SGroup>
            <SLabel>
              Media <i>(optional)</i>
            </SLabel>
            <FileDropZone
              imageSourceUrl={imageSourceUrl}
              setImageSourceUrl={setImageSourceUrl}
              imageCid={imageCid}
              setImageCid={setImageCid}
            />
          </SGroup>

          <SInfoRow>
            <span>Collection Owner</span>
            <span>{ellipseAddress(activeAccount?.address)}</span>
          </SInfoRow>

          <SInfoRow>
            <span>Collection Mint Price</span>
            <span>
              {price || '0'} {api.registry.chainTokens[0]}
            </span>
          </SInfoRow>
        </aside>

        <section>
          <SFormBlock>
            <SGroup>
              <SLabel>Collection name</SLabel>
              <FormControl type='text' ref={collectionNameRef} placeholder='Enter Collection Name' required />
            </SGroup>
          </SFormBlock>

          <SFormBlock>
            <SGroup>
              <SLabel>Description</SLabel>
              <FormControl as='textarea' ref={collectionDescriptionRef} placeholder='Enter Collection Description' />
            </SGroup>
          </SFormBlock>

          <SFormBlock>
            <SToggle type='button' onClick={() => setToggleCollectionSettings(!toggleCollectionSettings)}>
              Collection settings <DropdownIcon className='arrow-down' />
            </SToggle>
            <Collapse in={toggleCollectionSettings}>
              <SToggleBlock>
                <SGroup>
                  <Checkbox ref={transferrableItemsRef} label='Transferrable items' defaultChecked />
                  <SDescription>
                    When disabled, the items will be non-transferrable (good for soul-bound NFTs)
                  </SDescription>

                  <Checkbox ref={unlockedMetadataRef} label='Unlocked metadata' defaultChecked />
                  <SDescription>When disabled, the metadata will be locked</SDescription>

                  <Checkbox ref={unlockedAttributesRef} label='Unlocked attributes' defaultChecked />
                  <SDescription>
                    When disabled, the attributes in the CollectionOwner namespace will be locked
                  </SDescription>

                  <Checkbox ref={unlockedMaxSupplyRef} label='Unlocked max supply' defaultChecked />
                  <SDescription>
                    allows to change the max supply until it gets locked (i.e. the possibility to change the supply for
                    a limited amount of time)
                  </SDescription>
                </SGroup>
                <SGroup>
                  <SLabel>
                    Max supply <i>(optional)</i>
                  </SLabel>
                  <FormControl
                    type='number'
                    ref={maxSupplyRef}
                    min={0}
                    pattern={wholeNumbersPattern}
                    placeholder='Set amount'
                  />
                </SGroup>
              </SToggleBlock>
            </Collapse>
          </SFormBlock>

          <SFormBlock>
            <SToggle type='button' onClick={() => setToggleMintSettings(!toggleMintSettings)}>
              Mint settings <DropdownIcon className='arrow-down' />
            </SToggle>
            <Collapse in={toggleMintSettings}>
              <SToggleBlock>
                <SGroup>
                  <SLabel>Mint type</SLabel>
                  <Radio
                    name='mint-type'
                    label='Only You Can Mint'
                    value={MintTypes.ISSUER}
                    onChange={mintTypeChangeHandler}
                    selectedValue={mintType}
                  />
                  <Radio
                    name='mint-type'
                    label='Everyone Can Mint'
                    value={MintTypes.PUBLIC}
                    onChange={mintTypeChangeHandler}
                    selectedValue={mintType}
                  />
                  <Radio
                    name='mint-type'
                    label='Holder of Other NFT Collection Can Mint'
                    value={MintTypes.HOLDER_OF}
                    onChange={mintTypeChangeHandler}
                    selectedValue={mintType}
                  />
                </SGroup>

                {mintType === MintTypes.HOLDER_OF && (
                  <SGroup>
                    <SLabel>Collection ID (must have a NFT from this collection)</SLabel>
                    <FormControl type='number' ref={holderOfCollectionIdRef} min={0} required />
                  </SGroup>
                )}

                <SGroup>
                  <SLabel>
                    Price <i>(optional)</i>
                  </SLabel>
                  <FormControl
                    type='text'
                    pattern={pricePattern(chainDecimals)}
                    title={`Please enter a number e.g. 10.25, max precision is ${chainDecimals} decimals after .`}
                    onChange={(event) => setPrice(event.target.value)}
                    placeholder='Set amount'
                  />
                </SGroup>

                <DateRangeButton
                  startDate={startDate}
                  setStartDate={setStartDate}
                  labelStart={
                    <>
                      Mint start <i>(optional)</i>
                    </>
                  }
                  endDate={endDate}
                  setEndDate={setEndDate}
                  labelEnd={
                    <>
                      Mint end <i>(optional)</i>
                    </>
                  }
                />

                <SGroup>
                  <SLabel className='bigger-margin'>Default item settings</SLabel>
                  <Checkbox ref={transferrableItemRef} label='Transferrable' defaultChecked />
                  <Checkbox ref={unlockedItemMetadataRef} label='Unlocked metadata' defaultChecked />
                  <Checkbox ref={unlockedItemAttributesRef} label='Unlocked attributes' defaultChecked />
                </SGroup>
              </SToggleBlock>
            </Collapse>
          </SFormBlock>

          <SPageControls>
            <ActionButton type='submit' className='main S w-100'>
              Create collection
            </ActionButton>
          </SPageControls>
        </section>
      </SFormLayout>
    </>
  );
};

export default memo(CreateCollection);
