import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Form, Button, InputGroup } from 'react-bootstrap';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './css/Home.css';

const HomePage = () => {
  const { t, i18n } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');  
  const [searchResults, setSearchResults] = useState([]);  
  const [recentItems, setRecentItems] = useState([]);  
  const [topCollections, setTopCollections] = useState([]);  
  const [tags, setTags] = useState([]);  

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetching
        const [recentRes, topRes, tagsRes] = await Promise.all([
          axios.get('http://localhost:5000/recentitems'),
          axios.get('http://localhost:5000/topcollections'),
          axios.get('http://localhost:5000/tags'),
        ]);
        setRecentItems(recentRes.data);  
        setTopCollections(topRes.data);  
        setTags(tagsRes.data);  
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
    document.body.className = i18n.language === 'bn' ? 'bengali' : '';
  }, [i18n.language]); 

  const handleSearch = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.get(`http://localhost:5000/search?q=${searchQuery}`);
      setSearchResults(response.data);
    } catch (error) {
      console.error('Error performing search:', error);
    }
  };

  const renderListItems = (items, isRecent = false) => (
    items.map(item => (
      <li key={item.id}>
        <Link to={`/items/${item.id}`}>{item.name}</Link>
        {isRecent ? ` (Collection: ${item.collectionName}, Author: ${item.author})` : ` (Items: ${item.itemCount})`}
      </li>
    ))
  );

  return (
    <Container className="home-page-container">
      <header className="header d-flex justify-content-between align-items-center">
        <h1>{t('welcome')}</h1>
      </header>

      <Form onSubmit={handleSearch} className="search-form">
        <InputGroup>
          <Form.Control
            type="text"
            placeholder={t('searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Button variant="primary" type="submit" className='search-btn'>{t('Search')}</Button>
        </InputGroup>
      </Form>

      <Row className="mt-4">
        <Col md={4}>
          <Card className="mb-4">
            <Card.Header>{t('recentlyAdded')}</Card.Header>
            <Card.Body>
              <ul>{renderListItems(recentItems, true)}</ul>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4}>
          <Card className="mb-4">
            <Card.Header>{t('topCollections')}</Card.Header>
            <Card.Body>
              <ul>{renderListItems(topCollections)}</ul>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4}>
          <Card className="mb-4">
            <Card.Header>{t('tagCloud')}</Card.Header>
            <Card.Body>
              <div className="tag-cloud">
                {tags.map(tag => (
                  <Link to={`/search?q=${tag.name}`} key={tag.name} className="tag">
                    {tag.name}
                  </Link>
                ))}
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {searchResults.length > 0 && (
        <Row className="mt-4">
          <Col md={12}>
            <Card>
              <Card.Header>{t('searchResults')}</Card.Header>
              <Card.Body>
                <ul>{renderListItems(searchResults)}</ul>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}
    </Container>
  );
};

export default HomePage;
