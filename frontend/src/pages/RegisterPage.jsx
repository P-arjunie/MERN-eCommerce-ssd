import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Form, Button, Row, Col, InputGroup } from 'react-bootstrap';
import { useSelector, useDispatch } from 'react-redux';
import { useRegisterMutation } from '../slices/usersApiSlice';
import { setCredentials } from '../slices/authSlice';
import { toast } from 'react-toastify';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import FormContainer from '../components/FormContainer';
import Loader from '../components/Loader';
import Meta from '../components/Meta';

const RegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setConfirmShowPassword] = useState(false);
  
  // Frontend validation states
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [register, { isLoading }] = useRegisterMutation();

  const { userInfo } = useSelector(state => state.auth);

  const { search } = useLocation();
  const searchParams = new URLSearchParams(search);
  const redirect = searchParams.get('redirect') || '/';

  useEffect(() => {
    if (userInfo) {
      navigate(redirect);
    }
  }, [userInfo, redirect, navigate]);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  const toggleConfirmPasswordVisibility = () => {
    setConfirmShowPassword(!showConfirmPassword);
  };

  // Frontend validation functions
  const validateField = (fieldName, value) => {
    const newErrors = { ...errors };
    
    switch (fieldName) {
      case 'name':
        if (!value || value.trim().length < 2) {
          newErrors.name = 'Name must be at least 2 characters';
        } else if (value.trim().length > 50) {
          newErrors.name = 'Name must be less than 50 characters';
        } else {
          delete newErrors.name;
        }
        break;
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!value) {
          newErrors.email = 'Email is required';
        } else if (!emailRegex.test(value)) {
          newErrors.email = 'Please enter a valid email address';
        } else {
          delete newErrors.email;
        }
        break;
      case 'password':
        if (!value) {
          newErrors.password = 'Password is required';
        } else if (value.length < 6) {
          newErrors.password = 'Password must be at least 6 characters';
        } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value)) {
          newErrors.password = 'Password must contain uppercase, lowercase, and number';
        } else {
          delete newErrors.password;
        }
        break;
      case 'confirmPassword':
        if (!value) {
          newErrors.confirmPassword = 'Please confirm your password';
        } else if (value !== password) {
          newErrors.confirmPassword = 'Passwords do not match';
        } else {
          delete newErrors.confirmPassword;
        }
        break;
      default:
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleBlur = (fieldName, value) => {
    setTouched({ ...touched, [fieldName]: true });
    validateField(fieldName, value);
  };

  const handleChange = (fieldName, value, setter) => {
    setter(value);
    if (touched[fieldName]) {
      validateField(fieldName, value);
    }
  };

  const validateForm = () => {
    const isNameValid = validateField('name', name);
    const isEmailValid = validateField('email', email);
    const isPasswordValid = validateField('password', password);
    const isConfirmPasswordValid = validateField('confirmPassword', confirmPassword);
    
    setTouched({
      name: true,
      email: true,
      password: true,
      confirmPassword: true
    });
    
    return isNameValid && isEmailValid && isPasswordValid && isConfirmPasswordValid;
  };

  const submitHandler = async e => {
    e.preventDefault();
    
    // Frontend validation
    if (!validateForm()) {
      toast.error('Please fix the validation errors');
      return;
    }
    
    if (password !== confirmPassword) {
      toast.error('Passwords do not match!');
      return;
    } else {
      try {
        const res = await register({ name, email, password }).unwrap();
        dispatch(setCredentials({ ...res }));
        navigate(redirect);
        toast.success('Registration successful. Welcome!');
      } catch (error) {
        toast.error(error?.data?.message || error.error);
      }
    }
  };

  return (
    <FormContainer>
      <Meta title={'Register'} />
      <h1>Register</h1>
      <Form onSubmit={submitHandler}>
        <Form.Group className='mb-3' controlId='name'>
          <Form.Label>Name *</Form.Label>
          <Form.Control
            value={name}
            type='text'
            placeholder='Enter name (minimum 2 characters)'
            onChange={e => handleChange('name', e.target.value, setName)}
            onBlur={e => handleBlur('name', e.target.value)}
            isInvalid={touched.name && errors.name}
            isValid={touched.name && !errors.name && name.trim().length >= 2}
          />
          <Form.Control.Feedback type="invalid">
            {errors.name}
          </Form.Control.Feedback>
          <Form.Control.Feedback type="valid">
            Looks good!
          </Form.Control.Feedback>
        </Form.Group>
        <Form.Group className='mb-3' controlId='email'>
          <Form.Label>Email address *</Form.Label>
          <Form.Control
            value={email}
            type='email'
            placeholder='Enter email'
            onChange={e => handleChange('email', e.target.value, setEmail)}
            onBlur={e => handleBlur('email', e.target.value)}
            isInvalid={touched.email && errors.email}
            isValid={touched.email && !errors.email && email}
          />
          <Form.Control.Feedback type="invalid">
            {errors.email}
          </Form.Control.Feedback>
          <Form.Control.Feedback type="valid">
            Valid email format!
          </Form.Control.Feedback>
        </Form.Group>
        <Form.Group className='mb-3' controlId='password'>
          <Form.Label>Password *</Form.Label>
          <InputGroup>
            <Form.Control
              type={showPassword ? 'text' : 'password'}
              value={password}
              placeholder='Enter password (min 6 chars, include A-Z, a-z, 0-9)'
              onChange={e => handleChange('password', e.target.value, setPassword)}
              onBlur={e => handleBlur('password', e.target.value)}
              isInvalid={touched.password && errors.password}
              isValid={touched.password && !errors.password && password.length >= 6}
            />
            <InputGroup.Text
              onClick={togglePasswordVisibility}
              id='togglePasswordVisibility'
              style={{ cursor: 'pointer' }}
            >
              {showPassword ? <FaEye /> : <FaEyeSlash />}
            </InputGroup.Text>
            <Form.Control.Feedback type="invalid">
              {errors.password}
            </Form.Control.Feedback>
            <Form.Control.Feedback type="valid">
              Strong password!
            </Form.Control.Feedback>
          </InputGroup>
        </Form.Group>
        <Form.Group className='mb-3' controlId='confirmPassword'>
          <Form.Label>Confirm Password *</Form.Label>
          <InputGroup>
            <Form.Control
              type={showConfirmPassword ? 'text' : 'password'}
              value={confirmPassword}
              placeholder='Confirm password'
              onChange={e => handleChange('confirmPassword', e.target.value, setConfirmPassword)}
              onBlur={e => handleBlur('confirmPassword', e.target.value)}
              isInvalid={touched.confirmPassword && errors.confirmPassword}
              isValid={touched.confirmPassword && !errors.confirmPassword && confirmPassword === password}
            />
            <InputGroup.Text
              onClick={toggleConfirmPasswordVisibility}
              id='toggleConfirmPasswordVisibility'
              style={{ cursor: 'pointer' }}
            >
              {showConfirmPassword ? <FaEye /> : <FaEyeSlash />}
            </InputGroup.Text>
            <Form.Control.Feedback type="invalid">
              {errors.confirmPassword}
            </Form.Control.Feedback>
            <Form.Control.Feedback type="valid">
              Passwords match!
            </Form.Control.Feedback>
          </InputGroup>
        </Form.Group>
        <Button
          className='mb-3 w-100'
          variant='warning'
          type='submit'
          disabled={isLoading}
        >
          Register
        </Button>
      </Form>
      <Row>
        <Col>
          Already have an account?
          <Link
            to={redirect ? `/login?redirect=${redirect}` : '/login'}
            className=' mx-2'
          >
            Sign In
          </Link>
        </Col>
      </Row>
    </FormContainer>
  );
};

export default RegisterPage;
