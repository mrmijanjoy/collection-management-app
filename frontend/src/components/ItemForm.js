import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Form, Button } from 'react-bootstrap';
import '../pages/css/Items.css';

const ItemForm = ({ show, handleClose, onFormSubmit, collectionId }) => {
  const [collections, setCollections] = useState([]);
  const [tags, setTags] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [itemName, setItemName] = useState('');
  const [itemDescription, setItemDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [customFields, setCustomFields] = useState([]);

  useEffect(() => {
    const fetchCollections = async () => {
      try {
        const response = await axios.get('http://localhost:5000/collections');
        setCollections(response.data);
      } catch (error) {
        console.error('Error fetching collections:', error);
      }
    };

    const fetchTags = async () => {
      try {
        const response = await axios.get('http://localhost:5000/tags');
        setTags(response.data);
      } catch (error) {
        console.error('Error fetching tags:', error);
      }
    };

    fetchCollections();
    fetchTags();
  }, []);

  const handleTagInputChange = async (e) => {
    const query = e.target.value;
    try {
      const response = await axios.get(`http://localhost:5000/tags?query=${query}`);
      setSuggestions(response.data);
    } catch (error) {
      console.error('Error fetching tag suggestions:', error);
    }
  };

  const handleTagSelect = (tag) => {
    setSelectedTags(prevTags => [...prevTags, tag.id]);
    setSuggestions([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const itemData = {
      name: itemName,
      description: itemDescription,
      collection_id: collectionId,
      image_url: imageUrl,
      tags: selectedTags,
      ...customFields.reduce((acc, field) => {
        acc[field.name] = e.target[field.name].value;
        return acc;
      }, {}),
    };

    try {
      await axios.post('http://localhost:5000/items', itemData);
      onFormSubmit(); 
      handleClose(); 
    } catch (error) {
      console.error('Error creating item:', error);
    }
  };

  return (
    <Form onSubmit={handleSubmit} className="item-form">
      <Form.Group controlId="formItemName">
        <Form.Label>Item Name</Form.Label>
        <Form.Control
          type="text"
          placeholder="Enter item name"
          value={itemName}
          onChange={(e) => setItemName(e.target.value)}
          required
        />
      </Form.Group>

      <Form.Group controlId="formItemDescription">
        <Form.Label>Item Description</Form.Label>
        <Form.Control
          as="textarea"
          rows={3}
          placeholder="Enter item description"
          value={itemDescription}
          onChange={(e) => setItemDescription(e.target.value)}
          required
        />
      </Form.Group>

      <Form.Group controlId="formImageUrl">
        <Form.Label>Image URL</Form.Label>
        <Form.Control
          type="text"
          placeholder="Enter image URL"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
        />
      </Form.Group>

      <Form.Group controlId="formTags">
        <Form.Label>Tags</Form.Label>
        <Form.Control
          type="text"
          placeholder="Enter tags"
          onChange={handleTagInputChange}
        />
        {suggestions.length > 0 && (
          <ul className="suggestions-list">
            {suggestions.map(tag => (
              <li key={tag.id} onClick={() => handleTagSelect(tag)}>
                {tag.name}
              </li>
            ))}
          </ul>
        )}
        <div>
          Selected Tags:
          {tags.filter(tag => selectedTags.includes(tag.id)).map(tag => (
            <span key={tag.id} className="selected-tag">
              {tag.name}
            </span>
          ))}
        </div>
      </Form.Group>

      {customFields.map((field) => (
        <Form.Group key={field.name} controlId={`formCustomField-${field.name}`}>
          <Form.Label>{field.name}</Form.Label>
          {field.type === 'string' && <Form.Control type="text" placeholder={field.name} name={field.name} />}
          {field.type === 'integer' && <Form.Control type="number" placeholder={field.name} name={field.name} />}
          {field.type === 'text' && <Form.Control as="textarea" rows={3} placeholder={field.name} name={field.name} />}
          {field.type === 'boolean' && <Form.Check type="checkbox" label={field.name} name={field.name} />}
          {field.type === 'date' && <Form.Control type="date" placeholder={field.name} name={field.name} />}
        </Form.Group>
      ))}

      <Button variant="primary" type="submit">
        Submit
      </Button>
    </Form>
  );
};

export default ItemForm;
