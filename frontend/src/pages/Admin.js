import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Table, Button, Card, Modal, Form } from 'react-bootstrap';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import './css/Admin.css';

const AdminPage = () => {
  const { t, i18n } = useTranslation();
  const [users, setUsers] = useState([]);
  const [items, setItems] = useState([]);
  const [collections, setCollections] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalData, setModalData] = useState(null);
  const [action, setAction] = useState('');
  const [itemType, setItemType] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userResponse = await axios.get('http://localhost:5000/admin/users', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        setUsers(userResponse.data);

        const itemResponse = await axios.get('http://localhost:5000/admin/items', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        setItems(itemResponse.data);

        const collectionResponse = await axios.get('http://localhost:5000/admin/collections', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        setCollections(collectionResponse.data);

      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
    document.body.className = i18n.language === 'bn' ? 'bengali' : '';
  }, [i18n.language]);

  const handleAction = async (id, actionType, type) => {
    try {
      const url = `http://localhost:5000/admin/${type}/${id}/${actionType}`;
      const method = actionType === 'delete' ? 'DELETE' : 'POST';
      await axios({ method, url, headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });

      if (type === 'users') {
        setUsers(users.filter(user => user.id !== id));
      } else if (type === 'items') {
        setItems(items.filter(item => item.id !== id));
      } else if (type === 'collections') {
        setCollections(collections.filter(collection => collection.id !== id));
      }
    } catch (error) {
      console.error(`Error performing action ${actionType}:`, error);
    }
  };

  const handleOpenModal = (data, actionType, type) => {
    setModalData(data);
    setAction(actionType);
    setItemType(type);
    setShowModal(true);
  };

  const handleConfirmAction = async () => {
    if (action === 'delete') {
      await handleAction(modalData.id, action, itemType);
    } else {
      const url = `http://localhost:5000/admin/${itemType}/${modalData.id}/${action}`;
      try {
        await axios.post(url, {}, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
        await handleAction(modalData.id, action, itemType);
      } catch (error) {
        console.error(`Error performing action ${action}:`, error);
      }
    }
    setShowModal(false);
  };

  const handleChange = (e) => {
    setModalData({ ...modalData, [e.target.name]: e.target.value });
  };

  return (
    <Container className="admin-page-container">
      <h2>{t('adminPanel')}</h2>

      {/* Users Management */}
      <Row>
        <Col md={12}>
          <Card className="admin-card">
            <Card.Header>{t('userManagement')}</Card.Header>
            <Card.Body>
              <Table striped bordered hover responsive>
                <thead>
                  <tr>
                    {['ID', 'username', 'email', 'admin', 'blocked', 'actions'].map(header => (
                      <th key={header}>{t(header)}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {users.map(user => (
                    <tr key={user.id}>
                      <td>{user.id}</td>
                      <td>{user.username}</td>
                      <td>{user.email}</td>
                      <td>{t(user.isAdmin ? 'yes' : 'no')}</td>
                      <td>{t(user.isBlocked ? 'yes' : 'no')}</td>
                      <td>
                        <Button variant="danger" onClick={() => handleOpenModal(user, 'delete', 'users')} className="me-2">
                          {t('delete')}
                        </Button>
                        <Button variant={user.isBlocked ? 'success' : 'warning'} onClick={() => handleOpenModal(user, user.isBlocked ? 'unblock' : 'block', 'users')} className="me-2">
                          {t(user.isBlocked ? 'unblock' : 'block')}
                        </Button>
                        <Button variant={user.isAdmin ? 'secondary' : 'primary'} onClick={() => handleOpenModal(user, user.isAdmin ? 'remove-admin' : 'make-admin', 'users')}>
                          {t(user.isAdmin ? 'removeAdmin' : 'makeAdmin')}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Items Management */}
      <Row className="mt-5">
        <Col md={12}>
          <Card className="admin-card">
            <Card.Header>{t('itemManagement')}</Card.Header>
            <Card.Body>
              <Table striped bordered hover responsive>
                <thead>
                  <tr>
                    {['ID', 'name', 'description', 'image', 'actions'].map(header => (
                      <th key={header}>{t(header)}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {items.map(item => (
                    <tr key={item.id}>
                      <td>{item.id}</td>
                      <td>{item.name}</td>
                      <td>{item.description}</td>
                      <td><img src={item.image_url} alt={item.name} style={{ width: '50px', height: '50px' }} /></td>
                      <td>
                        <Button variant="danger" onClick={() => handleOpenModal(item, 'delete', 'items')} className="me-2">
                          {t('delete')}
                        </Button>
                        <Button variant="primary" onClick={() => handleOpenModal(item, 'edit', 'items')}>
                          {t('edit')}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Collections Management */}
      <Row className="mt-5">
        <Col md={12}>
          <Card className="admin-card">
            <Card.Header>{t('collectionManagement')}</Card.Header>
            <Card.Body>
              <Table striped bordered hover responsive>
                <thead>
                  <tr>
                    {['ID', 'name', 'description', 'actions'].map(header => (
                      <th key={header}>{t(header)}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {collections.map(collection => (
                    <tr key={collection.id}>
                      <td>{collection.id}</td>
                      <td>{collection.name}</td>
                      <td>{collection.description}</td>
                      <td>
                        <Button variant="danger" onClick={() => handleOpenModal(collection, 'delete', 'collections')} className="me-2">
                          {t('delete')}
                        </Button>
                        <Button variant="primary" onClick={() => handleOpenModal(collection, 'edit', 'collections')}>
                          {t('edit')}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{t('confirmAction')}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {itemType === 'items' || itemType === 'collections' ? (
            <Form>
              {itemType === 'items' && (
                <>
                  <Form.Group controlId="itemName">
                    <Form.Label>{t('name')}</Form.Label>
                    <Form.Control
                      type="text"
                      name="name"
                      defaultValue={modalData?.name}
                      onChange={handleChange}
                    />
                  </Form.Group>
                  <Form.Group controlId="itemDescription">
                    <Form.Label>{t('description')}</Form.Label>
                    <Form.Control
                      type="text"
                      name="description"
                      defaultValue={modalData?.description}
                      onChange={handleChange}
                    />
                  </Form.Group>
                  <Form.Group controlId="itemImage">
                    <Form.Label>{t('imageURL')}</Form.Label>
                    <Form.Control
                      type="text"
                      name="image_url"
                      defaultValue={modalData?.image_url}
                      onChange={handleChange}
                    />
                  </Form.Group>
                </>
              )}
              {itemType === 'collections' && (
                <>
                  <Form.Group controlId="collectionName">
                    <Form.Label>{t('name')}</Form.Label>
                    <Form.Control
                      type="text"
                      name="name"
                      defaultValue={modalData?.name}
                      onChange={handleChange}
                    />
                  </Form.Group>
                  <Form.Group controlId="collectionDescription">
                    <Form.Label>{t('description')}</Form.Label>
                    <Form.Control
                      type="text"
                      name="description"
                      defaultValue={modalData?.description}
                      onChange={handleChange}
                    />
                  </Form.Group>
                </>
              )}
            </Form>
          ) : (
            <p>{t(`confirm${action.charAt(0).toUpperCase() + action.slice(1)}Message`, { name: modalData?.name })}</p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            {t('cancel')}
          </Button>
          <Button variant="primary" onClick={handleConfirmAction}>
            {t('confirm')}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default AdminPage;
