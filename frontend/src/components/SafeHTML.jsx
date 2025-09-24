import React from 'react';
import DOMPurify from 'dompurify';

const SafeHTML = ({ content, tag = 'div', className, ...props }) => {
  // Sanitize the content to prevent XSS attacks
  const sanitizedContent = DOMPurify.sanitize(content || '', {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br', 'span'],
    ALLOWED_ATTR: ['class', 'style'],
    ALLOW_DATA_ATTR: false
  });
  
  return React.createElement(tag, {
    ...props,
    className,
    dangerouslySetInnerHTML: { __html: sanitizedContent }
  });
};

export default SafeHTML;
