import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Form, Button, Row, Col, InputGroup } from 'react-bootstrap';
import { BASE_URL } from '../constants';
import { useDispatch, useSelector } from 'react-redux';
import { useLoginMutation } from '../slices/usersApiSlice';
import { setCredentials } from '../slices/authSlice';
import { toast } from 'react-toastify';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import FormContainer from '../components/FormContainer';
import Loader from '../components/Loader';
import Meta from '../components/Meta';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  
  // Frontend validation states
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [login, { isLoading }] = useLoginMutation();

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

  // Frontend validation functions
  const validateField = (fieldName, value) => {
    const newErrors = { ...errors };
    
    switch (fieldName) {
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
        } else {
          delete newErrors.password;
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
    const isEmailValid = validateField('email', email);
    const isPasswordValid = validateField('password', password);
    
    setTouched({
      email: true,
      password: true
    });
    
    return isEmailValid && isPasswordValid;
  };

  const submitHandler = async e => {
    e.preventDefault();
    
    // Frontend validation
    if (!validateForm()) {
      toast.error('Please fix the validation errors');
      return;
    }
    
    try {
      const res = await login({ email, password, remember }).unwrap();
      dispatch(setCredentials({ ...res }));
      navigate(redirect);
      toast.success('Login successful');
    } catch (error) {
      toast.error(error?.data?.message || error.error);
    }
  };
  return (
    <FormContainer>
      <Meta title={'Sign In'} />
      <h1>Sign In</h1>
      <Form onSubmit={submitHandler}>
        <Form.Group className='mb-3' controlId='email'>
          <Form.Label>Email address *</Form.Label>
          <Form.Control
            type='email'
            value={email}
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
              placeholder='Enter password (minimum 6 characters)'
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
              Password length is valid!
            </Form.Control.Feedback>
          </InputGroup>
        </Form.Group>
        <Row>
          <Col>
            <Form.Group className='mb-3' controlId='checkbox'>
              <Form.Check
                type='checkbox'
                label='Keep me signed in.'
                checked={remember}
                onChange={() => setRemember(!remember)}
              />
            </Form.Group>
          </Col>
          <Col className='text-end'>
            <Link to={'/reset-password'} className=' mx-2'>
              Forgot password?
            </Link>
          </Col>
        </Row>
        <Button
          className='mb-3 w-100'
          variant='warning'
          type='submit'
          disabled={isLoading}
        >
          Sign In
        </Button>
        {/* OIDC (Google) start: sends user to backend to start Authorization Code + PKCE */}
        <Button
          className='mb-3 w-100'
          type='button'
          aria-label='Continue with Google'
          style={{
            backgroundColor: '#ffffff',
            borderColor: '#dadce0',
            color: '#3c4043',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            height: '44px'
          }}
          onMouseOver={e => {
            e.currentTarget.style.backgroundColor = '#f7f8f8';
          }}
          onMouseOut={e => {
            e.currentTarget.style.backgroundColor = '#ffffff';
          }}
          onClick={() => {
            const backendOrigin = process.env.NODE_ENV === 'development' ? 'http://localhost:5000' : window.location.origin;
            const redirect = "/";
            window.location.href = `${backendOrigin}/api/v1/auth/oidc/start?redirect=${redirect}`;
          }}
        >
          <span style={{ display: 'inline-flex' }}>
            <svg width='18' height='18' viewBox='0 0 48 48' xmlns='http://www.w3.org/2000/svg'>
              <path fill='#FFC107' d='M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12 c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C33.64,6.053,29.082,4,24,4C12.955,4,4,12.955,4,24 s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z'/>
              <path fill='#FF3D00' d='M6.306,14.691l6.571,4.819C14.655,16.108,18.961,13,24,13c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657 C33.64,6.053,29.082,4,24,4C16.318,4,9.656,8.337,6.306,14.691z'/>
              <path fill='#4CAF50' d='M24,44c5.166,0,9.86-1.977,13.409-5.197l-6.19-5.238C29.211,35.091,26.715,36,24,36 c-5.202,0-9.619-3.317-11.283-7.946l-6.54,5.036C9.505,39.556,16.227,44,24,44z'/>
              <path fill='#1976D2' d='M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-3.994,5.565 c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z'/>
            </svg>
          </span>
          <span style={{ fontWeight: 600 }}>Continue with Google</span>
        </Button>
      </Form>
      <Row>
        <Col>
          New Customer?
          <Link
            to={redirect ? `/register?redirect=${redirect}` : '/register'}
            className=' mx-2'
          >
            Register
          </Link>
        </Col>
      </Row>
    </FormContainer>
  );
};

export default LoginPage;
