import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Card, Button, ListGroup } from 'react-bootstrap';

const CollectionDetailPage = () => {
  const { collectionId } = useParams();
  const [collection, setCollection] = useState(null);
  const [items, setItems] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCollectionData = async () => {
      try {
        const collectionResponse = await axios.get(`http://localhost:5000/collections/${collectionId}`);
        const itemsResponse = await axios.get(`http://localhost:5000/collections/${collectionId}/items`);
        setCollection(collectionResponse.data);
        setItems(itemsResponse.data);
      } catch (err) {
        setError('Failed to load collection data');
      } finally {
        setLoading(false);
      }
    };
    fetchCollectionData();
  }, [collectionId]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="text-danger">{error}</p>;

  return (
    <div>
      {collection && (
        <Card>
          <Card.Body>
            <Card.Title>{collection.name}</Card.Title>
            <Card.Subtitle className="mb-2 text-muted">{collection.category}</Card.Subtitle>
            <Card.Text>{collection.description}</Card.Text>
            <Card.Img variant="top" src={collection.imageUrl} />
          </Card.Body>
        </Card>
      )}
      <h3 className="mt-4">Items</h3>
      <ListGroup>
        {items.map(item => (
          <ListGroup.Item key={item.id}>
            <h5>{item.name}</h5>
            <p>{item.description}</p>
            <img src={item.imageUrl} alt={item.name} style={{ width: '100px' }} />
          </ListGroup.Item>
        ))}
      </ListGroup>
    </div>
  );
};

export default CollectionDetailPage;
