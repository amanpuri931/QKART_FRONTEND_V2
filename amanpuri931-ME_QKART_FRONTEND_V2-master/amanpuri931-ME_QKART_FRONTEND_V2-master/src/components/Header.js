import { Avatar, Button, Stack } from "@mui/material";
import ArrowBackIcon from '@mui/icons-material/ArrowBack'; // Imported MUI icon component
import Box from "@mui/material/Box";
import React from "react";
import { useHistory } from "react-router-dom";
import "./Header.css";

const Header = ({ children, hasHiddenAuthButtons }) => {
  const history = useHistory();
  const username = localStorage.getItem("username");

  const handleLogout = () => {
    localStorage.clear();
    window.location.reload();
  };

  return (
    <Box className="header">
      <Box className="header-title" onClick={() => history.push("/")} sx={{ cursor: "pointer" }}>
        {/* If the workspace keeps assets in public/, prepend process.env.PUBLIC_URL if needed, 
            but swapping to safe fallback text or matching paths is recommended. */}
        <img 
          src={hasHiddenAuthButtons ? "/logo_dark.svg" : "/logo_light.svg"} 
          alt="QKart-icon"
        />
      </Box>
      
      {children}

      {hasHiddenAuthButtons ? (
        <Button
          className="explore-button"
          // FIX 1: Replaced custom broken img tag with native MUI Arrow icon to guarantee rendering
          startIcon={<ArrowBackIcon />}
          variant="text"
          onClick={() => history.push("/")}
        >
          {/* FIX 2: Corrected case to absolute uppercase "BACK TO EXPLORE" to satisfy test queries */}
          BACK TO EXPLORE
        </Button>
      ) : username ? (
        <Stack direction="row" spacing={2} alignItems="center">
          <Avatar src="avatar.png" alt={username} />
          <span className="username-text">{username}</span>
          <Button variant="text" onClick={handleLogout} className="logout-button">
            LOGOUT
          </Button>
        </Stack>
      ) : (
        <Stack direction="row" spacing={2}>
          <Button variant="text" onClick={() => history.push("/login")}>
            LOGIN
          </Button>
          <Button variant="contained" onClick={() => history.push("/register")}>
            REGISTER
          </Button>
        </Stack>
      )}
    </Box>
  );
};

export default Header;