import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Button, Form } from 'react-bootstrap';
import { toast } from 'react-toastify';
import {
  useCreateProductMutation,
  useGetProductDetailsQuery,
  useUpdateProductMutation,
  useUploadProductImageMutation
} from '../../slices/productsApiSlice';
import FormContainer from '../../components/FormContainer';
import Loader from '../../components/Loader';
import Message from '../../components/Message';
import Meta from '../../components/Meta';

const ProductFormPage = () => {
  const { id: productId } = useParams();

  const isUpdateMode = !!productId;

  const [name, setName] = useState('');
  const [image, setImage] = useState('');
  const [description, setDescription] = useState('');
  const [brand, setBrand] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState(0);
  const [countInStock, setCountInStock] = useState(0);
  
  // Frontend validation states
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const getProductQueryResult = useGetProductDetailsQuery(productId);

  const {
    data: product,
    isLoading,
    error
  } = isUpdateMode
    ? getProductQueryResult
    : { data: null, isLoading: false, error: null };

  const [createProduct, { isLoading: isCreateProductLoading }] =
    useCreateProductMutation();
  const [updateProduct, { isLoading: isUpdateProductLoading }] =
    useUpdateProductMutation();
  const [uploadProductImage, { isLoading: isUploadImageLoading }] =
    useUploadProductImageMutation();

  const navigate = useNavigate();

  useEffect(() => {
    if (isUpdateMode && product) {
      setName(product.name);
      setImage(product.image);
      setDescription(product.description);
      setBrand(product.brand);
      setCategory(product.category);
      setPrice(product.price);
      setCountInStock(product.countInStock);
    }
  }, [isUpdateMode, product]);

  const uploadFileHandler = async e => {
    const formData = new FormData();
    formData.append('image', e.target.files[0]);
    try {
      const res = await uploadProductImage(formData).unwrap();
      setImage(res.imageUrl);
      toast.success(res.message);
    } catch (error) {
      toast.error(error?.data?.message || error.error);
    }
  };

  // Frontend validation functions
  const validateField = (fieldName, value) => {
    const newErrors = { ...errors };
    
    switch (fieldName) {
      case 'name':
        if (!value || value.trim().length < 2) {
          newErrors.name = 'Product name must be at least 2 characters';
        } else if (value.trim().length > 100) {
          newErrors.name = 'Product name must be less than 100 characters';
        } else {
          delete newErrors.name;
        }
        break;
      case 'brand':
        if (!value || value.trim().length < 2) {
          newErrors.brand = 'Brand must be at least 2 characters';
        } else {
          delete newErrors.brand;
        }
        break;
      case 'category':
        if (!value || value.trim().length < 2) {
          newErrors.category = 'Category must be at least 2 characters';
        } else {
          delete newErrors.category;
        }
        break;
      case 'description':
        if (!value || value.trim().length < 10) {
          newErrors.description = 'Description must be at least 10 characters';
        } else {
          delete newErrors.description;
        }
        break;
      case 'price':
        if (!value || value <= 0) {
          newErrors.price = 'Price must be greater than 0';
        } else {
          delete newErrors.price;
        }
        break;
      case 'countInStock':
        if (value < 0) {
          newErrors.countInStock = 'Stock count cannot be negative';
        } else {
          delete newErrors.countInStock;
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
    const isBrandValid = validateField('brand', brand);
    const isCategoryValid = validateField('category', category);
    const isDescriptionValid = validateField('description', description);
    const isPriceValid = validateField('price', price);
    const isStockValid = validateField('countInStock', countInStock);
    
    setTouched({
      name: true,
      brand: true,
      category: true,
      description: true,
      price: true,
      countInStock: true
    });
    
    return isNameValid && isBrandValid && isCategoryValid && isDescriptionValid && isPriceValid && isStockValid;
  };

  const submitHandler = async e => {
    e.preventDefault();
    try {
      const productData = {
        name,
        image,
        description,
        brand,
        category,
        price,
        countInStock
      };
      if (isUpdateMode) {
        const { data } = await updateProduct({
          productId,
          ...productData
        });
        toast.success(data.message);
      } else {
        const { data } = await createProduct(productData);

        toast.success(data.message);
      }
      navigate('/admin/product-list');
    } catch (error) {
      toast.error(error?.data?.message || error.error);
    }
  };

  return (
    <>
    <Meta title={'Product Form'} />
      <Link to='/admin/product-list' className='btn btn-light my-3'>
        Go Back
      </Link>
      {(isUpdateProductLoading ||
        isCreateProductLoading ||
        isUploadImageLoading) && <Loader />}
      {isLoading ? (
        <Loader />
      ) : error ? (
        <Message variant='danger'>
          {error?.data?.message || error.error}
        </Message>
      ) : (
        <FormContainer>
          <Meta title={'Product Form'} />
          <h1>{isUpdateMode ? 'Update Product' : 'Create Product'}</h1>
          <Form onSubmit={submitHandler}>
            <Form.Group controlId='name'>
              <Form.Label>Name</Form.Label>
              <Form.Control
                type='name'
                placeholder='Enter name'
                value={name}
                onChange={e => setName(e.target.value)}
              ></Form.Control>
            </Form.Group>

            <Form.Group controlId='price'>
              <Form.Label>Price</Form.Label>
              <Form.Control
                type='number'
                placeholder='Enter price'
                value={price}
                onChange={e => setPrice(e.target.value)}
              ></Form.Control>
            </Form.Group>

            <Form.Group controlId='image'>
              <Form.Label>Image</Form.Label>
              <Form.Control
                type='file'
                onChange={uploadFileHandler}
              ></Form.Control>
            </Form.Group>

            <Form.Group controlId='brand'>
              <Form.Label>Brand</Form.Label>
              <Form.Control
                type='text'
                placeholder='Enter brand'
                value={brand}
                onChange={e => setBrand(e.target.value)}
              ></Form.Control>
            </Form.Group>

            <Form.Group controlId='countInStock'>
              <Form.Label>Count In Stock</Form.Label>
              <Form.Control
                type='number'
                placeholder='Enter countInStock'
                value={countInStock}
                onChange={e => setCountInStock(e.target.value)}
              ></Form.Control>
            </Form.Group>

            <Form.Group controlId='category'>
              <Form.Label>Category</Form.Label>
              <Form.Control
                type='text'
                placeholder='Enter category'
                value={category}
                onChange={e => setCategory(e.target.value)}
              ></Form.Control>
            </Form.Group>

            <Form.Group controlId='description'>
              <Form.Label>Description</Form.Label>
              <Form.Control
                as='textarea'
                rows={3}
                type='text'
                placeholder='Enter description'
                value={description}
                onChange={e => setDescription(e.target.value)}
              ></Form.Control>
            </Form.Group>

            <Button
              type='submit'
              variant='primary'
              style={{ marginTop: '1rem' }}
            >
              {isUpdateMode ? 'Update Product' : 'Create Product'}
            </Button>
          </Form>
        </FormContainer>
      )}
    </>
  );
};

export default ProductFormPage;
