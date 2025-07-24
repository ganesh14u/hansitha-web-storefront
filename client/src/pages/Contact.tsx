import React from 'react';

const ContactPage = () => {
  return (
    <div className="p-4 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Contact Us</h1>
      <p className="text-gray-700 mb-2">
        Have questions or need support? Reach out to us.
      </p>
      <div className="space-y-3 text-gray-700">
        <p><strong>Email:</strong> support@hansithacreations.com</p>
        <p><strong>Phone:</strong> +91 98765 43210</p>
        <p><strong>Address:</strong> 123 Fashion Street, Hyderabad, India</p>
      </div>
    </div>
  );
};

export default ContactPage;
