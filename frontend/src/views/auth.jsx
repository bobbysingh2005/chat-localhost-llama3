import React, { useState, useRef, useEffect } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { useContext } from "react";
import { AppSetting } from "./App-setting";
import { useNavigate } from "react-router-dom";

// Simple toast for screen reader and visible feedback
function Toast({ message, type, onClose }) {
  // type: 'success' | 'error'
  useEffect(() => {
    if (message) {
      const timer = setTimeout(onClose, 4000);
      return () => clearTimeout(timer);
    }
  }, [message, onClose]);
  if (!message) return null;
  return (
    <div
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
      style={{
        position: "fixed",
        top: 10,
        left: "50%",
        transform: "translateX(-50%)",
        background: type === "success" ? "#198754" : "#dc3545",
        color: "#fff",
        padding: "1rem 2rem",
        borderRadius: 8,
        zIndex: 9999,
        fontSize: "1.1rem",
        boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
      }}
    >
      {message}
    </div>
  );
}

const AuthForm = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [serverError, setServerError] = useState("");
  const { user, setUser } = useContext(AppSetting);
  const navigate = useNavigate();
  const [toast, setToast] = useState({ message: "", type: "" });
  const [stage, setStage] = useState("form-loaded"); // for screen reader
  const emailRef = useRef(null);
  const usernameRef = useRef(null);
  const liveRegionRef = useRef(null);
  // Focus first field on mount or mode switch
  useEffect(() => {
    setTimeout(() => {
      if (isLogin && emailRef.current) emailRef.current.focus();
      if (!isLogin && usernameRef.current) usernameRef.current.focus();
    }, 100);
    setStage(isLogin ? "login-form-loaded" : "register-form-loaded");
  }, [isLogin]);

  // Announce stage changes for screen reader
  useEffect(() => {
    if (liveRegionRef.current && stage) {
      liveRegionRef.current.textContent =
        stage === "login-form-loaded"
          ? "Login form loaded."
          : stage === "register-form-loaded"
            ? "Registration form loaded."
            : stage === "submitting"
              ? isLogin
                ? "Logging in..."
                : "Registering..."
              : stage === "success"
                ? isLogin
                  ? "Login successful."
                  : "Registration successful."
                : stage === "error"
                  ? isLogin
                    ? "Login failed."
                    : "Registration failed."
                  : "";
    }
  }, [stage, isLogin]);

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setServerError("");
    setToast({ message: "", type: "" });
    setStage(!isLogin ? "login-form-loaded" : "register-form-loaded");
  };

  const initialValues = {
    email: "",
    password: "",
    ...(isLogin ? {} : { username: "" }),
  };

  const validationSchema = Yup.object({
    email: Yup.string().email("Invalid email").required("Required"),
    password: Yup.string().min(6, "Min 6 characters").required("Required"),
    ...(isLogin
      ? {}
      : {
          username: Yup.string()
            .min(3, "Min 3 characters")
            .required("Required"),
        }),
  });

  const { apiUrl } = useContext(AppSetting);

  const handleSubmit = async (values, { setSubmitting }) => {
    setServerError("");
    setToast({ message: "", type: "" });
    setStage("submitting");
    const endpoint = isLogin ? "auth/login" : "auth/register";

    try {
      const response = await fetch(`${apiUrl}/${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(values),
      });
      const res = await response.json();
      // alert(JSON.stringify(res,null,2))
      console.log("\u2705 Auth Success:", res.success);
      if (res.success) {
        setToast({
          message: isLogin ? "Login successful!" : "Registration successful!",
          type: "success",
        });
        setStage("success");
        // After successful login/register, call /auth/me to get fresh user
        try {
          const meRes = await fetch(`${apiUrl}/auth/me`, {
            credentials: "include",
          });
          const meJson = await meRes.json();
          if (meJson?.success) setUser(meJson.user);
          else setUser(res.user || {});
        } catch (e) {
          setUser(res.user || {});
        }
        // Redirect to dashboard/chat after login/register
        setTimeout(() => navigate("/chat"), 500);
      } else {
        setServerError(res.message || "Login failed.");
        setToast({ message: res.message || "Login failed.", type: "error" });
        setStage("error");
      }
    } catch (err) {
      console.error("Auth Error:", err);
      setServerError(
        err.response?.data?.message || err.message || "Something went wrong",
      );
      setToast({
        message:
          err.response?.data?.message || err.message || "Something went wrong",
        type: "error",
      });
      setStage("error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section
      style={styles.container}
      role="region"
      aria-labelledby="auth-title"
    >
      {/* Live region for screen reader stage notifications */}
      <div
        ref={liveRegionRef}
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
        tabIndex={-1}
      ></div>
      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: "", type: "" })}
      />
      <h2 id="auth-title">{isLogin ? "Sign In" : "Sign Up"}</h2>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
        enableReinitialize
      >
        {({ isSubmitting }) => (
          <Form
            style={styles.form}
            aria-describedby="auth-desc"
            aria-live="polite"
          >
            <p id="auth-desc" className="sr-only">
              Use this form to sign in or register. All fields are required.
            </p>
            {!isLogin && (
              <div style={styles.field}>
                <label htmlFor="username">Username</label>
                <Field
                  id="username"
                  name="username"
                  type="text"
                  aria-required="true"
                  innerRef={usernameRef}
                  inputRef={usernameRef}
                  aria-label="Username"
                />
                <ErrorMessage
                  name="username"
                  component="div"
                  style={styles.error}
                  aria-live="assertive"
                />
              </div>
            )}
            <div style={styles.field}>
              <label htmlFor="email">Email</label>
              <Field
                id="email"
                name="email"
                type="email"
                aria-required="true"
                innerRef={emailRef}
                inputRef={emailRef}
                aria-label="Email"
              />
              <ErrorMessage
                name="email"
                component="div"
                style={styles.error}
                aria-live="assertive"
              />
            </div>
            <div style={styles.field}>
              <label htmlFor="password">Password</label>
              <Field
                id="password"
                name="password"
                type="password"
                aria-required="true"
                aria-label="Password"
              />
              <ErrorMessage
                name="password"
                component="div"
                style={styles.error}
                aria-live="assertive"
              />
            </div>

            {serverError && (
              <div
                style={styles.error}
                role="alert"
                aria-live="assertive"
                tabIndex={0}
              >
                {serverError}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              style={styles.button}
              aria-label={
                isLogin ? "Login to your account" : "Register a new account"
              }
            >
              {isSubmitting ? "Please wait..." : isLogin ? "Login" : "Register"}
            </button>
          </Form>
        )}
      </Formik>

      <button
        onClick={toggleMode}
        style={styles.toggle}
        aria-label={
          isLogin ? "Switch to registration form" : "Switch to login form"
        }
      >
        {isLogin
          ? "Don't have an account? Sign up"
          : "Already have an account? Sign in"}
      </button>
    </section>
  );
};

// Basic inline styles
const styles = {
  container: {
    maxWidth: "400px",
    margin: "50px auto",
    padding: "2rem",
    border: "1px solid #ccc",
    borderRadius: "8px",
    background: "#fff",
    boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
  },
  field: {
    display: "flex",
    flexDirection: "column",
  },
  error: {
    color: "red",
    fontSize: "0.8rem",
  },
  button: {
    padding: "0.75rem",
    background: "#007bff",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
  },
  toggle: {
    marginTop: "1rem",
    textAlign: "center",
    color: "#007bff",
    cursor: "pointer",
    fontSize: "0.9rem",
  },
};

export default AuthForm;
