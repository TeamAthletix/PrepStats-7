import React from 'react';

const AdminDashboard = () => {
  return <h1>Admin Dashboard</h1>;
};

export default AdminDashboard;

import { getSession } from 'next-auth/react';

export async function getServerSideProps(context) {
  const session = await getSession(context);
  if (!session || session.user.role !== 'ADMIN') {
    return { redirect: { destination: '/auth/login', permanent: false } };
  }
  return { props: {} };
}