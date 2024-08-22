import React, { useState, useEffect, useContext } from 'react';
import { Container, Row, Col, Card, Button, Dropdown, Form, Modal } from 'react-bootstrap';
import axios from 'axios';
import ItemForm from '../components/ItemForm';
import { FaHeart } from 'react-icons/fa';
import 'bootstrap/dist/css/bootstrap.min.css';
import { AuthContext } from '../context/Auth'; 
import './css/Items.css';

const Items = () => {
  const [items, setItems] = useState([]);
  const [collections, setCollections] = useState([]);
  const [selectedCollectionId, setSelectedCollectionId] = useState('');
  const [showItemForm, setShowItemForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredItems, setFilteredItems] = useState([]);
  const [sortOrder, setSortOrder] = useState('asc');
  const { isAuthenticated, user } = useContext(AuthContext);

  useEffect(() => {
    const fetchCollections = async () => {
      try {
        const response = await axios.get('https://collection-management-app-rbzm.onrender.com/collections');
        setCollections(response.data);
      } catch (error) {
        console.error('Error fetching collections:', error);
      }
    };

    fetchCollections();
  }, []);

  const fetchItems = async () => {
    try {
      const url = new URL('https://collection-management-app-rbzm.onrender.com/items');
      if (selectedCollectionId) {
        url.searchParams.append('collectionId', selectedCollectionId);
      }
      if (searchTerm) {
        url.searchParams.append('searchTerm', searchTerm);
      }
      if (sortOrder) {
        url.searchParams.append('sortOrder', sortOrder);
      }
      const response = await axios.get(url.toString());
      setItems(response.data);
      setFilteredItems(response.data);
    } catch (error) {
      console.error('Error fetching items:', error);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [selectedCollectionId]);

  useEffect(() => {
    const applyFilter = () => {
      const lowerCaseSearchTerm = searchTerm.toLowerCase();
      const sortedItems = [...items].sort((a, b) =>
        sortOrder === 'asc' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name)
      );
      const filtered = sortedItems.filter(item =>
        item.name.toLowerCase().includes(lowerCaseSearchTerm)
      );
      setFilteredItems(filtered);
    };

    applyFilter();
  }, [searchTerm, sortOrder, items]);

  const handleItemFormClose = () => setShowItemForm(false);
  const handleItemFormSubmit = () => {
    fetchItems();
    handleItemFormClose();
  };

  const handleLike = async (itemId) => {
    try {
      await axios.post(`http://localhost:5000/items/${itemId}/like`, {}, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      fetchItems(); //refresh
    } catch (error) {
      console.error('Error liking item:', error);
    }
  };
  

  return (
    <Container fluid className="item-page-container">
      <Row className="mt-5">
        <Col>
          <Dropdown onSelect={(key) => setSelectedCollectionId(key)}>
            <Dropdown.Toggle variant="success" id="dropdown-basic">
              {selectedCollectionId ? `Collection ${selectedCollectionId}` : 'Select Collection'}
            </Dropdown.Toggle>

            <Dropdown.Menu>
              {collections.map(collection => (
                <Dropdown.Item key={collection.id} eventKey={collection.id}>
                  {collection.name}
                </Dropdown.Item>
              ))}
            </Dropdown.Menu>
          </Dropdown>

          {isAuthenticated && ( 
            <Button variant="primary" onClick={() => setShowItemForm(true)} className="mt-3">
              Create Item
            </Button>
          )}

          <Form className="mt-3">
            <Form.Control
              type="text"
              placeholder="Search items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Form.Select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="mt-2"
            >
              <option value="asc">Sort A-Z</option>
              <option value="desc">Sort Z-A</option>
            </Form.Select>
          </Form>
          <Row className="mt-4">
            {filteredItems && filteredItems.length > 0 ? (
              filteredItems.map(item => (
                <Col md={4} key={item.id} className="mb-4">
                  <Card>
                    <Card.Img variant="top" src={item.image_url} />
                    <Card.Body>
                      <Card.Title>{item.name}</Card.Title>
                      <Card.Text>{item.description}</Card.Text>
                      <div>
                        {item.tags && item.tags.length > 0 ? (
                          item.tags.map(tag => (
                            <span key={tag.id} className="item-tag">
                              {tag.name}
                            </span>
                          ))
                        ) : (
                          <span>No tags available</span> 
                        )}
                      </div>
                      <Button variant="primary" href={`/items/${item.id}`}>View Details</Button>
                      {isAuthenticated && (
                        <Button
                          variant="outline-primary"
                          className="mt-2"
                          onClick={() => handleLike(item.id)}
                          style={{ marginLeft: '10px' }} 
                        >
                          <FaHeart /> 
                        </Button>
                      )}
                    </Card.Body>
                  </Card>
                </Col>
              ))
            ) : (
              <p>No items found.</p> 
            )}
          </Row>
        </Col>
      </Row>

      <Modal
        show={showItemForm}
        onHide={handleItemFormClose}
        centered
        backdrop="static"
        keyboard={false}
      >
        <ItemForm
          show={showItemForm}
          handleClose={handleItemFormClose}
          onFormSubmit={handleItemFormSubmit}
          collectionId={selectedCollectionId} 
        />
      </Modal>
    </Container>
  );
};

export default Items;
