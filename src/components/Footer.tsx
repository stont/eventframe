import React from 'react';
import './Footer.css';

const Footer: React.FC = () => {
  return (
    <footer className="app-footer">
      <p>
        &copy; {new Date().getFullYear()} All rights reserved #GEF | Developed by{' '}
        <a href="https://paperlessenv.app" target="_blank" rel="noopener noreferrer">
          Paperless
        </a>{' '}
        |{' '}
        <a href="https://sites.google.com/view/gefmixer/home" target="_blank" rel="noopener noreferrer">
          Privacy
        </a>
      </p>
    </footer>
  );
};

export default Footer;
