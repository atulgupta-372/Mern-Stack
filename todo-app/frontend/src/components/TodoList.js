import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Row, 
  Col, 
  Card, 
  Button, 
  Form, 
  InputGroup, 
  Badge, 
  Alert,
  Pagination,
  Modal
} from 'react-bootstrap';
import { Link } from 'react-router-dom';
import axios from 'axios';

const TodoList = () => {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [todoToDelete, setTodoToDelete] = useState(null);

  useEffect(() => {
    fetchTodos();
  }, [currentPage, searchTerm]);

  const fetchTodos = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/todos', {
        params: {
          page: currentPage,
          limit: 6,
          search: searchTerm
        }
      });
      setTodos(response.data.todos);
      setPagination(response.data.pagination);
      setError('');
    } catch (error) {
      setError('Failed to fetch todos');
      console.error('Fetch todos error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchTodos();
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    if (e.target.value === '') {
      setCurrentPage(1);
    }
  };

  const toggleTodoStatus = async (todoId, currentStatus) => {
    try {
      await axios.put(`/api/todos/${todoId}`, {
        completed: !currentStatus
      });
      fetchTodos();
    } catch (error) {
      setError('Failed to update todo status');
      console.error('Toggle todo error:', error);
    }
  };

  const handleDeleteClick = (todo) => {
    setTodoToDelete(todo);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      await axios.delete(`/api/todos/${todoToDelete._id}`);
      setShowDeleteModal(false);
      setTodoToDelete(null);
      fetchTodos();
    } catch (error) {
      setError('Failed to delete todo');
      console.error('Delete todo error:', error);
    }
  };

  const getPriorityBadge = (priority) => {
    const variants = {
      low: 'success',
      medium: 'warning',
      high: 'danger'
    };
    return <Badge bg={variants[priority]}>{priority.toUpperCase()}</Badge>;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString();
  };

  // Pagination component
  const renderPagination = () => {
    if (pagination.totalPages <= 1) return null;

    const items = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(pagination.totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    // Previous button
    items.push(
      <Pagination.Prev
        key="prev"
        disabled={!pagination.hasPrevPage}
        onClick={() => setCurrentPage(currentPage - 1)}
      />
    );

    // Page numbers
    for (let number = startPage; number <= endPage; number++) {
      items.push(
        <Pagination.Item
          key={number}
          active={number === currentPage}
          onClick={() => setCurrentPage(number)}
        >
          {number}
        </Pagination.Item>
      );
    }

    // Next button
    items.push(
      <Pagination.Next
        key="next"
        disabled={!pagination.hasNextPage}
        onClick={() => setCurrentPage(currentPage + 1)}
      />
    );

    return (
      <Pagination className="justify-content-center mt-4">
        {items}
      </Pagination>
    );
  };

  if (loading && todos.length === 0) {
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
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h2>My Todos</h2>
            <Button as={Link} to="/todos/new" variant="primary">
              Create New Todo
            </Button>
          </div>

          {/* Search Form */}
          <Form onSubmit={handleSearch}>
            <InputGroup className="mb-3">
              <Form.Control
                type="text"
                placeholder="Search todos..."
                value={searchTerm}
                onChange={handleSearchChange}
              />
              <Button variant="outline-secondary" type="submit">
                Search
              </Button>
              {searchTerm && (
                <Button 
                  variant="outline-danger" 
                  onClick={() => {
                    setSearchTerm('');
                    setCurrentPage(1);
                  }}
                >
                  Clear
                </Button>
              )}
            </InputGroup>
          </Form>

          {error && <Alert variant="danger">{error}</Alert>}

          {/* Todos Count */}
          {pagination.totalTodos !== undefined && (
            <p className="text-muted mb-3">
              Showing {todos.length} of {pagination.totalTodos} todos
              {searchTerm && ` for "${searchTerm}"`}
            </p>
          )}
        </Col>
      </Row>

      {/* Todo Cards */}
      <Row>
        {todos.length === 0 ? (
          <Col>
            <Alert variant="info" className="text-center">
              {searchTerm ? 'No todos found matching your search.' : 'No todos yet. Create your first todo!'}
            </Alert>
          </Col>
        ) : (
          todos.map((todo) => (
            <Col md={6} lg={4} key={todo._id} className="mb-3">
              <Card className={`h-100 ${todo.completed ? 'border-success' : ''}`}>
                <Card.Body className="d-flex flex-column">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <Card.Title 
                      className={`mb-0 ${todo.completed ? 'text-decoration-line-through text-muted' : ''}`}
                      style={{ fontSize: '1.1rem' }}
                    >
                      {todo.title}
                    </Card.Title>
                    {getPriorityBadge(todo.priority)}
                  </div>

                  {todo.description && (
                    <Card.Text 
                      className={`mb-2 ${todo.completed ? 'text-muted' : ''}`}
                      style={{ fontSize: '0.9rem' }}
                    >
                      {todo.description}
                    </Card.Text>
                  )}

                  {todo.dueDate && (
                    <Card.Text className="text-muted small mb-2">
                      <strong>Due:</strong> {formatDate(todo.dueDate)}
                    </Card.Text>
                  )}

                  <Card.Text className="text-muted small mb-3">
                    <strong>Created:</strong> {formatDate(todo.createdAt)}
                  </Card.Text>

                  <div className="mt-auto">
                    <div className="d-flex gap-2 flex-wrap">
                      <Button
                        size="sm"
                        variant={todo.completed ? "outline-warning" : "outline-success"}
                        onClick={() => toggleTodoStatus(todo._id, todo.completed)}
                      >
                        {todo.completed ? 'Mark Incomplete' : 'Mark Complete'}
                      </Button>
                      
                      <Button
                        size="sm"
                        variant="outline-primary"
                        as={Link}
                        to={`/todos/edit/${todo._id}`}
                      >
                        Edit
                      </Button>
                      
                      <Button
                        size="sm"
                        variant="outline-danger"
                        onClick={() => handleDeleteClick(todo)}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))
        )}
      </Row>

      {/* Pagination */}
      {renderPagination()}

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete "{todoToDelete?.title}"? This action cannot be undone.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={confirmDelete}>
            Delete Todo
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default TodoList;