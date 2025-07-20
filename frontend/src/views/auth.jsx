import React, { useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useContext } from "react";
import { AppSetting } from "./App-setting";

const AuthForm = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [serverError, setServerError] = useState('');
  const { user, setUser } = useContext(AppSetting);


  const toggleMode = () => {
    setIsLogin(!isLogin);
    setServerError('');
  };

  const initialValues = {
    email: '',
    password: '',
    ...(isLogin ? {} : { username: '' }),
  };

  const validationSchema = Yup.object({
    email: Yup.string().email('Invalid email').required('Required'),
    password: Yup.string().min(6, 'Min 6 characters').required('Required'),
    ...(isLogin ? {} : {
      username: Yup.string().min(3, 'Min 3 characters').required('Required'),
    }),
  });

  const handleSubmit = async (values, { setSubmitting }) => {
    setServerError('');
    const endpoint = isLogin ? 'auth/login' : 'auth/register';

    try {
      const response = await fetch(`http://localhost:3000/${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });
      const res = await response.json();
      // alert(JSON.stringify(res,null,2))
      console.log('✅ Auth Success:', res.success);
      // TODO: Store token / redirect
      if (res.success) {
        // setUser(JSON.stringify(res.user));
        setUser(res.user);
      }
    } catch (err) {
      console.error('Auth Error:', err);
      setServerError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={styles.container}>
      <h2>{isLogin ? 'Sign In' : 'Sign Up'}</h2>

      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
        enableReinitialize
      >
        {({ isSubmitting }) => (
          <Form style={styles.form}>
            {!isLogin && (
              <div style={styles.field}>
                <label>Username</label>
                <Field name="username" type="text" />
                <ErrorMessage name="username" component="div" style={styles.error} />
              </div>
            )}
            <div style={styles.field}>
              <label>Email</label>
              <Field name="email" type="email" />
              <ErrorMessage name="email" component="div" style={styles.error} />
            </div>
            <div style={styles.field}>
              <label>Password</label>
              <Field name="password" type="password" />
              <ErrorMessage name="password" component="div" style={styles.error} />
            </div>

            {serverError && <div style={styles.error}>{serverError}</div>}

            <button type="submit" disabled={isSubmitting} style={styles.button}>
              {isSubmitting ? 'Please wait...' : isLogin ? 'Login' : 'Register'}
            </button>
          </Form>
        )}
      </Formik>

      <p onClick={toggleMode} style={styles.toggle}>
        {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
      </p>
    </div>
  );
};

// Basic inline styles
const styles = {
  container: {
    maxWidth: '400px',
    margin: '50px auto',
    padding: '2rem',
    border: '1px solid #ccc',
    borderRadius: '8px',
    background: '#fff',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
  },
  error: {
    color: 'red',
    fontSize: '0.8rem',
  },
  button: {
    padding: '0.75rem',
    background: '#007bff',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  toggle: {
    marginTop: '1rem',
    textAlign: 'center',
    color: '#007bff',
    cursor: 'pointer',
    fontSize: '0.9rem',
  },
};

export default AuthForm;
