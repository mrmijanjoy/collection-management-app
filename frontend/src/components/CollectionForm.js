import React, { useState, useEffect } from 'react';
import { Form, Button } from 'react-bootstrap';
import axios from 'axios';

const CollectionForm = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    imageUrl: ''
  });
  const [customFields, setCustomFields] = useState({
    integerField: '',
    stringField: '',
    textField: '',
    booleanField: false,
    dateField: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get('http://localhost:5000/categories');
        setCategories(response.data);
      } catch (error) {
        console.error('Error fetching categories:', error);
        setError('Failed to fetch categories');
      }
    };
    fetchCategories();
  }, []);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleCustomFieldChange = (e, type) => {
    const { name, value, checked, type: fieldType } = e.target;
    if (fieldType === 'checkbox') {
      setCustomFields({ ...customFields, [type]: checked });
    } else {
      setCustomFields({ ...customFields, [type]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await axios.post('http://localhost:5000/collections', { ...formData, customFields });
      if (onSubmit) onSubmit(); 
    } catch (err) {
      setError('Failed to save collection');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form onSubmit={handleSubmit}>
      <Form.Group controlId="formCollectionName">
        <Form.Label>Name</Form.Label>
        <Form.Control
          type="text"
          placeholder="Enter collection name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
        />
      </Form.Group>

      <Form.Group controlId="formCollectionDescription" className="mt-3">
        <Form.Label>Description</Form.Label>
        <Form.Control
          as="textarea"
          rows={3}
          placeholder="Enter description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          required
        />
      </Form.Group>

      <Form.Group controlId="formCollectionCategory" className="mt-3">
        <Form.Label>Category</Form.Label>
        <Form.Control
          as="select"
          name="category"
          value={formData.category}
          onChange={handleChange}
          required
        >
          <option value="">Select Category</option>
          {categories.map(category => (
            <option key={category.id} value={category.id}>{category.name}</option>
          ))}
        </Form.Control>
      </Form.Group>

      <Form.Group controlId="formImageUrl" className="mt-3">
        <Form.Label>Image URL</Form.Label>
        <Form.Control
          type="text"
          placeholder="Enter image URL"
          name="imageUrl"
          value={formData.imageUrl}
          onChange={handleChange}
        />
      </Form.Group>

      <fieldset className="mt-3">
        <legend>Custom Fields</legend>
      </fieldset>

      {error && <p className="text-danger mt-3">{error}</p>}
      <Button type="submit" disabled={loading} className="mt-3">
        {loading ? 'Saving...' : 'Save Collection'}
      </Button>
    </Form>
  );
};

export default CollectionForm;
