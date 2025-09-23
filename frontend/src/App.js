import React, { useEffect } from 'react';
import { Container } from 'react-bootstrap';
import { Outlet } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Header from './components/Header';
import Footer from './components/Footer';
import { useGetUserProfileQuery } from './slices/usersApiSlice';
import { useDispatch, useSelector } from 'react-redux';
import { setCredentials } from './slices/authSlice';

const App = () => {
  const dispatch = useDispatch();
  const { userInfo } = useSelector(state => state.auth);
  const { data: profileData, isSuccess } = useGetUserProfileQuery();

  useEffect(() => {
    if (!userInfo && isSuccess && profileData) {
      const { userId, name, email, isAdmin } = profileData;
      dispatch(setCredentials({ userId, name, email, isAdmin }));
    }
  }, [userInfo, isSuccess, profileData, dispatch]);

  // Fallback: explicitly fetch profile once on mount if nothing in Redux
  useEffect(() => {
    if (!userInfo) {
      fetch('/api/v1/users/profile', { credentials: 'include' })
        .then(res => (res.ok ? res.json() : null))
        .then(data => {
          if (data && data.userId) {
            const { userId, name, email, isAdmin } = data;
            dispatch(setCredentials({ userId, name, email, isAdmin }));
          }
        })
        .catch(() => {});
    }
  }, [userInfo, dispatch]);
  return (
    <div className='position-relative'>
      <Header />
      <main>
        <Container>
          <Outlet />
        </Container>
      </main>
      <Footer />
      <ToastContainer autoClose={1000} />
    </div>
  );
};

export default App;
