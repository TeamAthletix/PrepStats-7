import React from 'react';
import Layout from '../components/Layout';

const Home = () => {
  return (
    <Layout>
      <header className="hero">
        <div className="logo-container">
          <img src="/logo.png" alt="PrepStats Logo" className="logo" />
        </div>
        <h1 className="prepstats-title">PrepStats</h1>
        <h2 className="heading">Rise Up and Score Big!</h2>
        <p className="subtitle">Track your stats, vote for champs, and join the team.</p>
        <div className="cta-buttons">
          <a href="/auth/login" className="btn">Join the Game</a>
          <a href="/auth/register" className="btn secondary">Sign Up Today</a>
        </div>
      </header>
    </Layout>
  );
};

export default Home;
