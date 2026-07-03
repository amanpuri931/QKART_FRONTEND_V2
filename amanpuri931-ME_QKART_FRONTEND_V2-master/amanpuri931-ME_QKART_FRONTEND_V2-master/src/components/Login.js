import { Button, CircularProgress, Stack, TextField } from "@mui/material";
import { Box } from "@mui/system";
import axios from "axios";
import { useSnackbar } from "notistack";
import React, { useState } from "react";
import { useHistory, Link } from "react-router-dom";
import { config } from "../App";
import Footer from "./Footer";
import Header from "./Header";
import "./Login.css";

const Login = () => {
  const { enqueueSnackbar } = useSnackbar();
  const history = useHistory();

  // State hooks for input handling and loading indicator
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);

  // Synchronize field input changes to state
  const handleInput = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Client-side validation helper logic
  const validateInput = (data) => {
    if (!data.username) {
      enqueueSnackbar("Username is a required field", { variant: "warning" });
      return false;
    }
    if (!data.password) {
      enqueueSnackbar("Password is a required field", { variant: "warning" });
      return false;
    }
    return true;
  };

  // Main login network flow handler
  const login = async (formData) => {
    if (!validateInput(formData)) return;

    setLoading(true);
    try {
      const response = await axios.post(`${config.endpoint}/auth/login`, {
        username: formData.username,
        password: formData.password,
      });

      // Persist user token and profile values securely inside localStorage
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("username", response.data.username);
      localStorage.setItem("balance", response.data.balance);

      enqueueSnackbar("Logged in successfully", { variant: "success" });

      // Clean redirect to Catalog Products view
      history.push("/");
    } catch (error) {
      if (error.response && error.response.data && error.response.data.message) {
        enqueueSnackbar(error.response.data.message, { variant: "error" });
      } else {
        enqueueSnackbar(
          "Something went wrong. Check the backend console for more details",
          { variant: "error" }
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      display="flex"
      flexDirection="column"
      justifyContent="space-between"
      minHeight="100vh"
    >
      <Header hasHiddenAuthButtons />
      <Box className="content">
        <Stack spacing={2} className="form">
          {/* CRITICAL FIX: component="h2" gives it the native accessible "heading" role */}
          <Box component="h2" className="title">
            Login
          </Box>
          <TextField
            id="username"
            label="Username"
            variant="outlined"
            title="Username"
            name="username"
            placeholder="Enter Username"
            fullWidth
            value={formData.username}
            onChange={handleInput}
          />
          <TextField
            id="password"
            label="Password"
            variant="outlined"
            title="Password"
            name="password"
            type="password"
            placeholder="Enter a password"
            fullWidth
            value={formData.password}
            onChange={handleInput}
          />
          {loading ? (
            <Box display="flex" justifyContent="center" alignItems="center">
              <CircularProgress color="success" />
            </Box>
          ) : (
            <Button
              className="button"
              variant="contained"
              onClick={() => login(formData)}
            >
              LOGIN TO QKART
            </Button>
          )}
          <p className="secondary-action">
            Don't have an account?{" "}
            {/* CRITICAL FIX: Exact exact link match for register redirect test strings */}
            <Link className="link" to="/register">
              Register now
            </Link>
          </p>
        </Stack>
      </Box>
      <Footer />
    </Box>
  );
};

export default Login;