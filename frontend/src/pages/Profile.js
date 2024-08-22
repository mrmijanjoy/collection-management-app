import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Container, Row, Col, Card, Button, ListGroup, Modal, Form } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import ItemForm from '../components/ItemForm'; 
import CollectionForm from '../components/CollectionForm'; 

const ProfilePage = () => {
  const [collections, setCollections] = useState([]);
  const [items, setItems] = useState([]);
  const [showItemModal, setShowItemModal] = useState(false);
  const [showCollectionModal, setShowCollectionModal] = useState(false);
  const [showTagModal, setShowTagModal] = useState(false);
  const [modalData, setModalData] = useState(null);
  const [tags, setTags] = useState([]);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const response = await axios.get('http://localhost:5000/profile', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        setCollections(response.data.collections);
        setItems(response.data.items);
        setTags(response.data.tags);
      } catch (error) {
        console.error('Error fetching profile data:', error);
      }
    };

    fetchProfileData();
  }, []);

  const handleEditItem = (item) => {
    setModalData(item);
    setShowItemModal(true);
  };

  const handleEditCollection = (collection) => {
    setModalData(collection);
    setShowCollectionModal(true);
  };

  const handleDeleteItem = async (itemId) => {
    try {
      await axios.delete(`http://localhost:5000/items/${itemId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      setItems(items.filter(item => item.id !== itemId));
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  const handleDeleteCollection = async (collectionId) => {
    try {
      await axios.delete(`http://localhost:5000/collections/${collectionId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      setCollections(collections.filter(collection => collection.id !== collectionId));
    } catch (error) {
      console.error('Error deleting collection:', error);
    }
  };

  const handleCreateTag = async (newTag) => {
    try {
      const response = await axios.post('http://localhost:5000/tags', newTag, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      setTags([...tags, response.data]);
      setShowTagModal(false);
    } catch (error) {
      console.error('Error creating tag:', error);
    }
  };

  const handleDeleteTag = async (tagId) => {
    try {
      await axios.delete(`http://localhost:5000/tags/${tagId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      setTags(tags.filter(tag => tag.id !== tagId));
    } catch (error) {
      console.error('Error deleting tag:', error);
    }
  };

  return (
    <Container>
      <Row className="mt-5">
        <Col md={6}>
          <h3>Your Collections</h3>
          <Button variant="primary" onClick={() => setShowCollectionModal(true)}>Create Collection</Button>
          <ListGroup className="mt-3">
            {collections.map((collection) => (
              <ListGroup.Item key={collection.id}>
                {collection.name}
                <Button variant="danger" onClick={() => handleDeleteCollection(collection.id)} className="float-end ms-2">Delete</Button>
                <Button variant="warning" onClick={() => handleEditCollection(collection)} className="float-end ms-2">Edit</Button>
              </ListGroup.Item>
            ))}
          </ListGroup>
        </Col>
        <Col md={6}>
          <h3>Your Items</h3>
          <Button variant="primary" onClick={() => setShowItemModal(true)}>Create Item</Button>
          <Row className="mt-3">
            {items.map((item) => (
              <Col md={4} key={item.id} className="mb-4">
                <Card>
                  <Card.Body>
                    <Card.Title>{item.name}</Card.Title>
                    <Card.Text>{item.description}</Card.Text>
                    <Button onClick={() => handleEditItem(item)}>Edit</Button>
                    <Button variant="danger" onClick={() => handleDeleteItem(item.id)} className="float-end ms-2">Delete</Button>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Col>
      </Row>

      {/* Item Modal */}
      <Modal show={showItemModal} onHide={() => setShowItemModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{modalData ? 'Edit Item' : 'Create Item'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <ItemForm
            item={modalData}
            onClose={() => setShowItemModal(false)}
            onSave={() => {
              // Reload data or update state
              setShowItemModal(false);
            }}
          />
        </Modal.Body>
      </Modal>

      {/* Collection Modal */}
      <Modal show={showCollectionModal} onHide={() => setShowCollectionModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{modalData ? 'Edit Collection' : 'Create Collection'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <CollectionForm
            collection={modalData}
            onClose={() => setShowCollectionModal(false)}
            onSave={() => {
              // Reload data or update state
              setShowCollectionModal(false);
            }}
          />
        </Modal.Body>
      </Modal>

      {/* Tag Modal */}
      <Modal show={showTagModal} onHide={() => setShowTagModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Create Tag</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={(e) => {
            e.preventDefault();
            const form = e.target;
            handleCreateTag({ name: form.tagName.value });
          }}>
            <Form.Group controlId="tagName">
              <Form.Label>Tag Name</Form.Label>
              <Form.Control type="text" name="tagName" required />
            </Form.Group>
            <Button variant="primary" type="submit">
              Create Tag
            </Button>
          </Form>
          <ListGroup className="mt-3">
            {tags.map((tag) => (
              <ListGroup.Item key={tag.id}>
                {tag.name}
                <Button variant="danger" onClick={() => handleDeleteTag(tag.id)} className="float-end">Delete</Button>
              </ListGroup.Item>
            ))}
          </ListGroup>
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default ProfilePage;
