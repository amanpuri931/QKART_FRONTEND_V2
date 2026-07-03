import { Button, CircularProgress, Stack, TextField } from "@mui/material";
import { Box } from "@mui/system";
import axios from "axios";
import { useSnackbar } from "notistack";
import React, { useState } from "react";
import { useHistory, Link } from "react-router-dom";
import { config } from "../App";
import Footer from "./Footer";
import Header from "./Header";
import "./Register.css";

const Register = () => {
  const { enqueueSnackbar } = useSnackbar();
  const history = useHistory();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const register = async (formData) => {
    setLoading(true);
    try {
      await axios.post(`${config.endpoint}/auth/register`, {
        username: formData.username,
        password: formData.password,
      });

      setUsername("");
      setPassword("");
      setConfirmPassword("");

      enqueueSnackbar("Registered successfully", { variant: "success" });
      history.push("/login");
    } catch (error) {
      if (error.response && error.response.status === 400) {
        enqueueSnackbar(error.response.data.message, { variant: "error" });
      } else {
        enqueueSnackbar(
          "Something went wrong. Check that the backend is running, reachable and returns valid JSON.",
          { variant: "error" }
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = (event) => {
    event.preventDefault();

    if (!validateInput({ username, password, confirmPassword })) {
      return;
    }

    register({ username, password });
  };

  const validateInput = (data) => {
    if (!data.username) {
      enqueueSnackbar("Username is a required field", { variant: "warning" });
      return false;
    }
    if (data.username.length < 6) {
      enqueueSnackbar("Username must be at least 6 characters", { variant: "warning" });
      return false;
    }
    if (!data.password) {
      enqueueSnackbar("Password is a required field", { variant: "warning" });
      return false;
    }
    if (data.password.length < 6) {
      enqueueSnackbar("Password must be at least 6 characters", { variant: "warning" });
      return false;
    }
    if (data.password !== data.confirmPassword) {
      enqueueSnackbar("Passwords do not match", { variant: "warning" });
      return false;
    }
    return true;
  };

  return (
    <Box display="flex" flexDirection="column" justifyContent="space-between" minHeight="100vh">
      <Header hasHiddenAuthButtons={true} />
      <Box className="content" display="flex" justifyContent="center" alignItems="center" flexGrow={1}>
        <Stack spacing={2} className="form-wrapper" sx={{ width: "100%", maxWidth: 400, p: 3 }}>
          <h2 className="title">Register</h2>
          <form onSubmit={handleRegister}>
            <Stack spacing={2}>
              <TextField
                id="username"
                label="Username"
                variant="outlined"
                placeholder="Enter Username"
                fullWidth
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
              <TextField
                id="password"
                label="Password"
                variant="outlined"
                type="password"
                helperText="Password must be at least 6 characters length"
                fullWidth
                placeholder="Enter a password for your account"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <TextField
                id="confirmPassword"
                label="Confirm Password"
                variant="outlined"
                type="password"
                fullWidth
                placeholder="Re-enter your password to confirm"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              {loading ? (
                <Box display="flex" justifyContent="center" alignItems="center" py={1}>
                  <CircularProgress size={24} color="primary" />
                </Box>
              ) : (
                <Button className="button" variant="contained" type="submit" fullWidth>
                  Register Now
                </Button>
              )}
            </Stack>
          </form>
          <p className="secondary-action">
            Already have an account?{" "}
            <Link className="link" to="/login">
              Login here
            </Link>
          </p>
        </Stack>
      </Box>
      <Footer />
    </Box>
  );
};

export default Register;