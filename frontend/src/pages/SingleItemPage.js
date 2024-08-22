import React, { useContext, useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, ListGroup } from 'react-bootstrap';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { AuthContext } from '../context/Auth'; 
import 'bootstrap/dist/css/bootstrap.min.css';

const SingleItemPage = () => {
  const { itemId } = useParams();
  const { isAuthenticated } = useContext(AuthContext); 
  const [item, setItem] = useState(null);
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState([]);

  useEffect(() => {
    const fetchItem = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/items/${itemId}`);
        setItem(response.data);
      } catch (error) {
        console.error('Error fetching item details:', error);
      }
    };

    const fetchComments = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/items/${itemId}/comments`);
        setComments(response.data);
      } catch (error) {
        console.error('Error fetching comments:', error);
      }
    };

    fetchItem();
    fetchComments();
  }, [itemId]);

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`http://localhost:5000/items/${itemId}/comments`, { content: comment }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setComment('');
      const response = await axios.get(`http://localhost:5000/items/${itemId}/comments`);
      setComments(response.data);
    } catch (error) {
      console.error('Error submitting comment:', error);
    }
  };

  if (!item) return <p>Loading...</p>;

  return (
    <Container className="single-item-page mt-5">
      <Row>
        <Col md={8}>
          <Card>
            <Card.Img variant="top" src={item.image_url} />
            <Card.Body>
              <Card.Title>{item.name}</Card.Title>
              <Card.Text>{item.description}</Card.Text>
              <div className="item-tags">
                <strong>Tags:</strong>
                {item.tags && item.tags.length > 0 ? (
                  item.tags.map(tag => (
                    <span key={tag} className="tag">{tag}</span>
                  ))
                ) : (
                  <span>No tags</span>
                )}
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <h4>Comments</h4>
          <ListGroup>
            {comments.length > 0 ? (
              comments.map((comment, index) => (
                <ListGroup.Item key={index}>
                  {comment.content}
                </ListGroup.Item>
              ))
            ) : (
              <ListGroup.Item>No comments yet.</ListGroup.Item>
            )}
          </ListGroup>
          {isAuthenticated && (
            <Form onSubmit={handleCommentSubmit} className="mt-3">
              <Form.Group controlId="commentContent">
                <Form.Control
                  as="textarea"
                  rows={3}
                  placeholder="Add a comment..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                />
              </Form.Group>
              <Button variant="primary" type="submit">Submit</Button>
            </Form>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default SingleItemPage;
