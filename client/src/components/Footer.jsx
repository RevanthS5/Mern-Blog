import React from "react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer>
      <ul className="footer__categories">
        <li><Link to="/posts/categories/Deserts">Deserts</Link></li>
        <li><Link to="/posts/categories/Healthy">Healthy</Link></li>
        <li><Link to="/posts/categories/Indian">Indian</Link></li>
        <li><Link to="/posts/categories/Italian">Italian</Link></li>
        <li><Link to="/posts/categories/Vegan">Vegan</Link></li>
        <li><Link to="/posts/categories/Easy">Easy</Link></li>
        <li><Link to="/posts/categories/Uncategorized">Uncategorized</Link></li>
        <li><Link to="/posts/categories/Baking">Baking</Link></li>
      </ul>
      <div className="footer__copyright">
      </div>
    </footer>
  );
};

export default Footer;
