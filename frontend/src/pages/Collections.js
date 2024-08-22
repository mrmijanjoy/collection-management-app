import React, { useEffect, useState, useContext } from 'react';
import { Container, Row, Col, Card, Form, Button, Modal, Badge } from 'react-bootstrap';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import './css/Collections.css'; // Ensure this file exists and is correctly styled
import CollectionForm from '../components/CollectionForm'; // Ensure CollectionForm is correctly implemented
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/Auth'; // Ensure AuthContext is correctly set up

const CollectionsPage = () => {
  const { t } = useTranslation(); // Translation hook
  const navigate = useNavigate();
  const { authState } = useContext(AuthContext); // Access authentication state
  const [collections, setCollections] = useState([]);
  const [sortOrder, setSortOrder] = useState('asc');
  const [filter, setFilter] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Fetch collections 
  const fetchCollections = async () => {
    try {
      const response = await axios.get('http://localhost:5000/collections');
      setCollections(response.data);
    } catch (error) {
      console.error('Error fetching collections:', error.response ? error.response.data : error.message);
    }
  };

  useEffect(() => {
    fetchCollections();
  }, []);

  // Handle sort order change
  const handleSortChange = (event) => {
    setSortOrder(event.target.value);
  };

  // Handle filter text change
  const handleFilterChange = (event) => {
    setFilter(event.target.value);
  };

  // Navigation
  const handleCollectionClick = (collectionId) => {
    navigate(`/collections/${collectionId}`);
  };

  // Modal
  const handleCreateModalOpen = () => setShowCreateModal(true);
  const handleCreateModalClose = () => setShowCreateModal(false);

  // Filter and sort collections
  const filteredCollections = collections
    .filter(collection =>
      collection.name.toLowerCase().includes(filter.toLowerCase())
    )
    .sort((a, b) =>
      sortOrder === 'asc'
        ? a.name.localeCompare(b.name)
        : b.name.localeCompare(a.name)
    );

  return (
    <Container>
      <Row className="mb-4">
        <Col>
          <h1>{t('collections')}</h1>
        </Col>
        {authState.isAuthenticated && (
          <Col className="text-end">
            <Button onClick={handleCreateModalOpen} variant="primary">
              {t('createCollection')}
            </Button>
          </Col>
        )}
      </Row>
      <Row className="mb-4">
        <Col>
          <Form.Group controlId="sortOrder">
            <Form.Label>{t('sortBy')}</Form.Label>
            <Form.Control as="select" value={sortOrder} onChange={handleSortChange}>
              <option value="asc">{t('ascending')}</option>
              <option value="desc">{t('descending')}</option>
            </Form.Control>
          </Form.Group>
        </Col>
        <Col>
          <Form.Group controlId="filter">
            <Form.Label>{t('filter')}</Form.Label>
            <Form.Control
              type="text"
              placeholder={t('filterCollections')}
              value={filter}
              onChange={handleFilterChange}
            />
          </Form.Group>
        </Col>
      </Row>
      <Row>
        {filteredCollections.map(collection => (
          <Col key={collection.id} md={4}>
            <Card onClick={() => handleCollectionClick(collection.id)} className="mb-4 collection-card">
              <Card.Img variant="top" src={collection.imageUrl} alt={collection.name} />
              <Card.Body>
                <Card.Title>{collection.name}</Card.Title>
                <Card.Text>{collection.description}</Card.Text>
                <Badge bg="secondary">{collection.category}</Badge>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
      <Modal show={showCreateModal} onHide={handleCreateModalClose}>
        <Modal.Header closeButton>
          <Modal.Title>{t('createCollection')}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <CollectionForm onClose={handleCreateModalClose} />
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default CollectionsPage;
