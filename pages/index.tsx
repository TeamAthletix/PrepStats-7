import React from 'react';
import Layout from '../components/Layout';
import Link from 'next/link';

const Home = () => {
  return (
    <Layout>
      {/* Header */}
      <header style={{ backgroundColor: '#ffffff', padding: '10px', borderBottom: '2px solid #b3a369' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '5px', maxWidth: '1200px', margin: '0 auto' }}>
          <button style={{ backgroundColor: '#b3a369', color: '#ffffff', padding: '8px 15px', borderRadius: '5px', fontFamily: 'Oswald, sans-serif', border: 'none', cursor: 'pointer' }}>SEARCH</button>
          <div style={{ display: 'flex', gap: '10px' }}>
            <Link href="/auth/signin">
              <button style={{ backgroundColor: '#b3a369', color: '#ffffff', padding: '10px 20px', borderRadius: '10px', fontFamily: 'Oswald, sans-serif', border: 'none', cursor: 'pointer' }}>SIGN IN</button>
            </Link>
            <button style={{ backgroundColor: '#b3a369', color: '#ffffff', padding: '10px 20px', borderRadius: '10px', fontFamily: 'Oswald, sans-serif', border: 'none', cursor: 'pointer' }}>LEADERBOARD</button>
            <button style={{ backgroundColor: '#b3a369', color: '#ffffff', padding: '10px 20px', borderRadius: '10px', fontFamily: 'Oswald, sans-serif', border: 'none', cursor: 'pointer' }}>POTW</button>
            <button style={{ backgroundColor: '#b3a369', color: '#ffffff', padding: '10px 20px', borderRadius: '10px', fontFamily: 'Oswald, sans-serif', border: 'none', cursor: 'pointer' }}>POLLS</button>
          </div>
        </div>
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <img src="/logo.png" alt="PrepStats Logo" style={{ width: '60px', verticalAlign: 'middle', marginRight: '15px' }} />
          <span style={{ color: '#000000', fontSize: '36px', fontWeight: 'bold', fontFamily: 'Squada One, sans-serif' }}>PrepStats</span>
        </div>
      </header>

      {/* Hero Section */}
      <section style={{ backgroundColor: '#f8f9fa', padding: '80px 20px', textAlign: 'center' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h1 style={{ fontSize: '48px', fontWeight: 'bold', color: '#333', marginBottom: '20px', fontFamily: 'Squada One, sans-serif' }}>
            Verified High School Sports Stats
          </h1>
          <p style={{ fontSize: '20px', color: '#666', marginBottom: '40px', lineHeight: '1.6' }}>
            The premier platform for tracking, verifying, and showcasing high school athletic performance. 
            Starting with Alabama Football and Girls Flag Football.
          </p>
          <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/auth/signup">
              <button style={{ backgroundColor: '#b3a369', color: '#ffffff', padding: '15px 30px', borderRadius: '10px', fontFamily: 'Oswald, sans-serif', fontSize: '18px', border: 'none', cursor: 'pointer' }}>
                GET STARTED
              </button>
            </Link>
            <button style={{ backgroundColor: 'transparent', color: '#b3a369', padding: '15px 30px', borderRadius: '10px', fontFamily: 'Oswald, sans-serif', fontSize: '18px', border: '2px solid #b3a369', cursor: 'pointer' }}>
              LEARN MORE
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section style={{ padding: '80px 20px', backgroundColor: '#ffffff' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{ textAlign: 'center', fontSize: '36px', fontWeight: 'bold', color: '#333', marginBottom: '60px', fontFamily: 'Squada One, sans-serif' }}>
            Why PrepStats?
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '40px' }}>
            
            <div style={{ textAlign: 'center', padding: '30px', border: '1px solid #e0e0e0', borderRadius: '10px' }}>
              <div style={{ backgroundColor: '#b3a369', width: '60px', height: '60px', borderRadius: '50%', margin: '0 auto 20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ color: 'white', fontSize: '24px', fontWeight: 'bold' }}>✓</span>
              </div>
              <h3 style={{ fontSize: '24px', fontWeight: 'bold', color: '#333', marginBottom: '15px', fontFamily: 'Oswald, sans-serif' }}>VERIFIED STATS</h3>
              <p style={{ color: '#666', lineHeight: '1.6' }}>All statistics are verified by coaches, media, or admins before appearing on leaderboards.</p>
            </div>

            <div style={{ textAlign: 'center', padding: '30px', border: '1px solid #e0e0e0', borderRadius: '10px' }}>
              <div style={{ backgroundColor: '#b3a369', width: '60px', height: '60px', borderRadius: '50%', margin: '0 auto 20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ color: 'white', fontSize: '24px', fontWeight: 'bold' }}>🏆</span>
              </div>
              <h3 style={{ fontSize: '24px', fontWeight: 'bold', color: '#333', marginBottom: '15px', fontFamily: 'Oswald, sans-serif' }}>REAL-TIME RANKINGS</h3>
              <p style={{ color: '#666', lineHeight: '1.6' }}>Live leaderboards updated instantly as new verified stats come in.</p>
            </div>

            <div style={{ textAlign: 'center', padding: '30px', border: '1px solid #e0e0e0', borderRadius: '10px' }}>
              <div style={{ backgroundColor: '#b3a369', width: '60px', height: '60px', borderRadius: '50%', margin: '0 auto 20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ color: 'white', fontSize: '24px', fontWeight: 'bold' }}>📱</span>
              </div>
              <h3 style={{ fontSize: '24px', fontWeight: 'bold', color: '#333', marginBottom: '15px', fontFamily: 'Oswald, sans-serif' }}>MOBILE FIRST</h3>
              <p style={{ color: '#666', lineHeight: '1.6' }}>Designed for mobile use by coaches, players, and fans on the go.</p>
            </div>

          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{ backgroundColor: '#b3a369', padding: '60px 20px', textAlign: 'center' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '32px', fontWeight: 'bold', color: '#ffffff', marginBottom: '20px', fontFamily: 'Squada One, sans-serif' }}>
            Ready to Track Your Stats?
          </h2>
          <p style={{ fontSize: '18px', color: '#ffffff', marginBottom: '30px', opacity: '0.9' }}>
            Join coaches, players, and fans who trust PrepStats for accurate high school sports data.
          </p>
          <Link href="/auth/signup">
            <button style={{ backgroundColor: '#ffffff', color: '#b3a369', padding: '15px 30px', borderRadius: '10px', fontFamily: 'Oswald, sans-serif', fontSize: '18px', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>
              START TRACKING
            </button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ backgroundColor: '#333', color: '#ffffff', padding: '40px 20px', textAlign: 'center' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <p style={{ marginBottom: '20px', fontFamily: 'Squada One, sans-serif', fontSize: '18px' }}>PrepStats</p>
          <p style={{ color: '#ccc', fontSize: '14px' }}>© 2024 PrepStats. All rights reserved.</p>
        </div>
      </footer>
    </Layout>
  );
};

export default Home;
