import React from 'react';
import { Helmet } from 'react-helmet-async';
import DOMPurify from 'dompurify';

const Meta = ({ title, description, keywords }) => {
  // Sanitize all inputs to prevent XSS attacks
  const safeTitle = DOMPurify.sanitize(title || '', { ALLOWED_TAGS: [] });
  const safeDescription = DOMPurify.sanitize(description || '', { ALLOWED_TAGS: [] });
  const safeKeywords = DOMPurify.sanitize(keywords || '', { ALLOWED_TAGS: [] });
  
  return (
    <Helmet>
      <title>{safeTitle}</title>
      <meta name='description' content={safeDescription} />
      <meta name='keywords' content={safeKeywords} />
    </Helmet>
  );
};

Meta.defaultProps = {
  title: 'MERN Shop | Buy Electronics Online',
  description:
    'Browse and buy the latest electronic gadgets and devices on our online store. Find great deals on smartphones, laptops, and more. Fast shipping and secure payments.',
  keywords:
    'electronics, gadgets, smartphones, laptops, online shopping, tech accessories'
};

export default Meta;
