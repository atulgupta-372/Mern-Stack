import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { useNavigate, useParams, Link } from 'react-router-dom';
import axios from 'axios';

const TodoForm = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    dueDate: '',
    completed: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);

  useEffect(() => {
    if (isEditing) {
      fetchTodo();
    }
  }, [id, isEditing]);

  const fetchTodo = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/todos/${id}`);
      const todo = response.data;
      
      setFormData({
        title: todo.title || '',
        description: todo.description || '',
        priority: todo.priority || 'medium',
        dueDate: todo.dueDate ? new Date(todo.dueDate).toISOString().split('T')[0] : '',
        completed: todo.completed || false
      });
    } catch (error) {
      setError('Failed to fetch todo details');
      console.error('Fetch todo error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const submitData = {
        ...formData,
        dueDate: formData.dueDate || null
      };

      if (isEditing) {
        await axios.put(`/api/todos/${id}`, submitData);
        setSuccess('Todo updated successfully!');
      } else {
        await axios.post('/api/todos', submitData);
        setSuccess('Todo created successfully!');
      }

      // Navigate back to todos list after a short delay
      setTimeout(() => {
        navigate('/todos');
      }, 1500);
    } catch (error) {
      const message = error.response?.data?.message || 
                    `Failed to ${isEditing ? 'update' : 'create'} todo`;
      setError(message);
      console.error('Submit todo error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/todos');
  };

  if (loading && isEditing && !formData.title) {
    return (
      <Container>
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <Row className="justify-content-center">
        <Col md={8} lg={6}>
          <Card>
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-4">
                <Card.Title>
                  {isEditing ? 'Edit Todo' : 'Create New Todo'}
                </Card.Title>
                <Button 
                  variant="outline-secondary" 
                  as={Link} 
                  to="/todos"
                  size="sm"
                >
                  Back to Todos
                </Button>
              </div>

              {error && <Alert variant="danger">{error}</Alert>}
              {success && <Alert variant="success">{success}</Alert>}

              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Title *</Form.Label>
                  <Form.Control
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    placeholder="Enter todo title"
                    maxLength={100}
                  />
                  <Form.Text className="text-muted">
                    {formData.title.length}/100 characters
                  </Form.Text>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Description</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Enter todo description (optional)"
                    maxLength={500}
                  />
                  <Form.Text className="text-muted">
                    {formData.description.length}/500 characters
                  </Form.Text>
                </Form.Group>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Priority</Form.Label>
                      <Form.Select
                        name="priority"
                        value={formData.priority}
                        onChange={handleChange}
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Due Date</Form.Label>
                      <Form.Control
                        type="date"
                        name="dueDate"
                        value={formData.dueDate}
                        onChange={handleChange}
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                {isEditing && (
                  <Form.Group className="mb-3">
                    <Form.Check
                      type="checkbox"
                      name="completed"
                      checked={formData.completed}
                      onChange={handleChange}
                      label="Mark as completed"
                    />
                  </Form.Group>
                )}

                <div className="d-flex gap-2 justify-content-end">
                  <Button 
                    variant="secondary" 
                    onClick={handleCancel}
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                  <Button 
                    variant="primary" 
                    type="submit"
                    disabled={loading || !formData.title.trim()}
                  >
                    {loading 
                      ? (isEditing ? 'Updating...' : 'Creating...') 
                      : (isEditing ? 'Update Todo' : 'Create Todo')
                    }
                  </Button>
                </div>
              </Form>

              {/* Form Tips */}
              <Card className="mt-4 bg-light">
                <Card.Body className="py-2">
                  <Card.Title className="h6 mb-1">Tips:</Card.Title>
                  <ul className="mb-0 small">
                    <li>Title is required and should be descriptive</li>
                    <li>Set a due date to stay organized</li>
                    <li>Use priority levels to focus on important tasks</li>
                    <li>Description helps provide additional context</li>
                  </ul>
                </Card.Body>
              </Card>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default TodoForm;