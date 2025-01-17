import { FormEvent, memo, useCallback, useEffect, useRef, useState } from 'react';
import Form from 'react-bootstrap/esm/Form';
import Stack from 'react-bootstrap/esm/Stack';
import { Link, useParams } from 'react-router-dom';

import { saveImageToIpfs } from '@api/pinata';

import ActionButton from '@buttons/ActionButton';

import FileDropZone from '@common/FileDropZone';
import ModalStatus from '@common/ModalStatus';

import { CollectionMetadataData } from '@helpers/interfaces';

import { useCollections } from '@hooks/useCollections';

const CollectionEdit = () => {
  const { collectionId } = useParams();
  const { getCollectionMetadata, saveCollectionMetadata, collectionMetadata, isCollectionDataLoading } =
    useCollections();
  const collectionNameRef = useRef<HTMLInputElement>(null);
  const collectionDescriptionRef = useRef<HTMLTextAreaElement>(null);
  const [imageCid, setImageCid] = useState<string>();
  const [imageSourceUrl, setImageSourceUrl] = useState<string>();

  const submitMetadata = useCallback(
    async (event: FormEvent) => {
      event.preventDefault();

      if (collectionId && collectionNameRef.current) {
        const updatedMetadata: CollectionMetadataData = {
          name: collectionNameRef.current.value,
          description: collectionDescriptionRef.current ? collectionDescriptionRef.current.value : undefined,
          image: imageCid,
        };

        Promise.all([saveImageToIpfs(imageSourceUrl), saveCollectionMetadata(collectionId, updatedMetadata)]);
      }
    },
    [collectionId, saveCollectionMetadata, imageSourceUrl, imageCid],
  );

  useEffect(() => {
    setImageCid(collectionMetadata?.image);
  }, [collectionMetadata]);

  useEffect(() => {
    if (collectionId) {
      getCollectionMetadata(collectionId);
    }
  }, [collectionId, getCollectionMetadata]);

  if (isCollectionDataLoading) {
    return <>Gathering data... please wait</>;
  }

  return (
    <>
      <ModalStatus />
      <h2>NFT collection ID #{collectionId} metadata:</h2>

      <Form onSubmit={submitMetadata}>
        <Form.Group className='mb-3'>
          <Form.Label>Collection name:</Form.Label>
          <Form.Control type='text' defaultValue={collectionMetadata?.name} ref={collectionNameRef} required />
        </Form.Group>
        <Form.Group className='mb-3'>
          <Form.Label>Description:</Form.Label>
          <Form.Control
            as='textarea'
            rows={3}
            defaultValue={collectionMetadata?.description}
            ref={collectionDescriptionRef}
          />
        </Form.Group>
        <Form.Group className='mb-3'>
          <Form.Label>Image:</Form.Label>
          <FileDropZone
            imageSourceUrl={imageSourceUrl}
            setImageSourceUrl={setImageSourceUrl}
            imageCid={imageCid}
            setImageCid={setImageCid}
          />
        </Form.Group>
        <Stack direction='horizontal' gap={2} className='justify-content-end'>
          <ActionButton type='submit' className='main S'>
            Submit metadata
          </ActionButton>
          <Link to='..'>
            <ActionButton type='button' className='secondary S'>
              Back
            </ActionButton>
          </Link>
        </Stack>
      </Form>
    </>
  );
};

export default memo(CollectionEdit);
