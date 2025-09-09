import React, { useState } from 'react';
import bcrypt from 'bcrypt';
import prisma from '../../lib/prisma';
import Layout from '../../components/Layout';

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('ATHLETE');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const hashedPassword = await bcrypt.hash(password, 10);
    await prisma.user.create({
      data: { email, password: hashedPassword, role },
    });
    window.location.href = '/auth/login';
  };

  return (
    <Layout>
      <div className="register-container">
        <h1>PrepStats</h1>
        <img src="/logo.png" alt="PrepStats Logo" className="logo" />
        <p className="slogan">Rise Up and Score Big!</p>
        <form onSubmit={handleSubmit}>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" />
          <select value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="ATHLETE">Athlete</option>
            <option value="COACH">Coach</option>
            <option value="MEDIA">Media</option>
            <option value="PARENT">Parent</option>
            <option value="FAN">Fan</option>
            <option value="ORGANIZATION">Organization</option>
          </select>
          <button type="submit">Sign Up</button>
        </form>
        <div className="login-link">
          <p>Already have an account? <a href="/auth/login">Login</a></p>
        </div>
      </div>
    </Layout>
  );
};

export default Register;