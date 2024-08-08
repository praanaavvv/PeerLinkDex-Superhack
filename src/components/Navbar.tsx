import React, { useState } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import "../styles/Navbar.css";
import Home from "./Home";
import Trade from "./Trade";
import Stats from "./Stats";

const Navbar: React.FC = () => {
  const [activeComponent, setActiveComponent] = useState("home");
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleNavigation = (component: string) => {
    setActiveComponent(component);
    setIsMenuOpen(false); // Close menu after navigation
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <div className="navbarContainer">
      <nav>
        <div className="logo" onClick={() => handleNavigation("home")}>
          {/* Uncomment and update logo if needed */}
          {/* <img src="cat.jpg" alt="Logo" /> */}
        </div>
        <div className="menuToggle" onClick={toggleMenu}>
          ☰ {/* You can use an icon or hamburger menu symbol here */}
        </div>
        <div className={`menuItems ${isMenuOpen ? "open" : ""}`}>
          <p
            className={activeComponent === "home" ? "active" : ""}
            onClick={() => handleNavigation("home")}
          >
            Home
          </p>
          <p
            className={activeComponent === "trade" ? "active" : ""}
            onClick={() => handleNavigation("trade")}
          >
            Trade
          </p>
          <p
            className={activeComponent === "stats" ? "active" : ""}
            onClick={() => handleNavigation("stats")}
          >
            Stats
          </p>
        </div>
        <div className="connectWallet">
          <ConnectButton />
        </div>
      </nav>
      <div className="content">
        {activeComponent === "home" && (
          <div>
            <Home />
          </div>
        )}
        {activeComponent === "trade" && (
          <div>
            <Trade />
          </div>
        )}
        {activeComponent === "stats" && (
          <div>
            <Stats />
          </div>
        )}
      </div>
    </div>
  );
};

export default Navbar;
