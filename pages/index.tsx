import React from 'react';
import Layout from '../components/Layout';

const Home = () => {
  return (
    <Layout>
      <header style={{ backgroundColor: '#ffffff', padding: '10px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '5px' }}>
          <button style={{ backgroundColor: '#b3a369', color: '#ffffff', padding: '5px 10px', borderRadius: '5px', fontFamily: 'Oswald, sans-serif' }}>SEARCH</button>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button style={{ backgroundColor: '#b3a369', color: '#ffffff', padding: '10px 20px', borderRadius: '10px', fontFamily: 'Oswald, sans-serif' }}>SIGN IN</button>
            <button style={{ backgroundColor: '#b3a369', color: '#ffffff', padding: '10px 20px', borderRadius: '10px', fontFamily: 'Oswald, sans-serif' }}>LEADERBOARD</button>
            <button style={{ backgroundColor: '#b3a369', color: '#ffffff', padding: '10px 20px', borderRadius: '10px', fontFamily: 'Oswald, sans-serif' }}>POTW</button>
            <button style={{ backgroundColor: '#b3a369', color: '#ffffff', padding: '10px 20px', borderRadius: '10px', fontFamily: 'Oswald, sans-serif' }}>POLLS</button>
          </div>
        </div>
        <div style={{ textAlign: 'center', padding: '10px' }}>
          <img src="/logo.png" alt="PrepStats Logo" style={{ width: '40px', verticalAlign: 'middle', marginRight: '10px' }} />
          <span style={{ color: '#000000', fontSize: '24px', fontWeight: 'bold', fontFamily: 'Squada One, sans-serif' }}>PrepStats</span>
        </div>
      </header>
    </Layout>
  );
};

export default Home;
