import React, { useState } from 'react';
import bcrypt from 'bcryptjs';
import prisma from '../../lib/prisma';

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
    // Redirect to login or auto-signin
    window.location.href = '/auth/login';
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
      <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" />
      <select value={role} onChange={(e) => setRole(e.target.value)}>
        <option value="ATHLETE">Athlete</option>
        <option value="COACH">Coach</option>
        {/* Add other roles */}
      </select>
      <button type="submit">Register</button>
    </form>
  );
};

export default Register;