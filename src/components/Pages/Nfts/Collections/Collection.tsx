import { memo } from 'react';
import Card from 'react-bootstrap/esm/Card';
import { Link } from 'react-router-dom';

import ActionButton from '@buttons/ActionButton';

import ShowImage from '@common/ShowImage';

import { CollectionMetadata } from '@helpers/interfaces';
import { routes } from '@helpers/routes';
import { SCard, SCardEdit } from '@helpers/styledComponents';

import EditIcon from '@images/icons/edit.svg';

interface CollectionProps {
  collectionMetadata: CollectionMetadata;
}

const Collection = ({ collectionMetadata }: CollectionProps) => {
  const { id, name, description, image } = collectionMetadata;

  return (
    <SCard>
      <ShowImage imageCid={image} altText={description} />
      <Card.Body>
        <SCardEdit className='text-muted'>
          <span>Collection ID #{id}</span>
          <Link to={routes.myAssets.collectionEdit(id)}>
            Edit
            <EditIcon />
          </Link>
        </SCardEdit>
        <Card.Title>{name}</Card.Title>
        <Card.Text>{description}</Card.Text>
      </Card.Body>
      <Card.Footer className='text-center'>
        <Link to={routes.myAssets.nfts(id)}>
          <ActionButton className='main S'>Show NFTs</ActionButton>
        </Link>
      </Card.Footer>
    </SCard>
  );
};

export default memo(Collection);
