import React from "react";
import "../styles/Home.css";

const Home: React.FC = () => {
  return (
    <div className="homeContainer">
      <section className="introSection">
        <h1 className="headline">PEER LINK DEX</h1>
        <p className="subHeadline">
          The premier platform for secure and efficient token exchanges.
        </p>
      </section>
      <section className="featuresSection">
        <div className="feature">
          {/* <img src = "cat.jpg" alt="Escrow Icon" className="featureIcon" /> */}
          <h2 className="featureTitle">Escrow Arrangements</h2>
          <p className="featureDescription">
            Create secure escrow arrangements to exchange tokens safely. Our
            platform ensures that both parties fulfill their obligations before
            any tokens are transferred.
          </p>
        </div>
        <div className="feature">
          <h2 className="featureTitle">How It Works</h2>
          <p className="featureDescription">
            Initiate an escrow by depositing your tokens and setting the terms.
            Once agreed upon, the tokens are securely held until both parties
            complete their end of the deal.
          </p>
        </div>
        <div className="feature">
          <h2 className="featureTitle">Benefits</h2>
          <p className="featureDescription">
            Reduce the risk of fraud, ensure fair exchanges, and gain confidence
            in your trades with our robust escrow system.
          </p>
        </div>
      </section>
      <section className="infoSection">
        <h2 className="infoTitle">About Us</h2>
        <p className="infoText">
          Peer Link Dex is designed to provide a seamless and secure trading
          experience. Our platform is built to support efficient token exchanges
          through escrow arrangements, ensuring safety and transparency for all
          users.
        </p>
      </section>
    </div>
  );
};

export default Home;
