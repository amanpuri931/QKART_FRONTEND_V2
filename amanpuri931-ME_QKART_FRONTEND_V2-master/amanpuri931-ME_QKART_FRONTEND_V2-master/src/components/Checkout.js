import { Delete } from "@mui/icons-material";
import {
  Button,
  Divider,
  Grid,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { Box } from "@mui/system";
import axios from "axios";
import { useSnackbar } from "notistack";
import React, { useEffect, useState, useCallback } from "react";
import { useHistory } from "react-router-dom";
import { config } from "../App";
import Cart, { getTotalCartValue, generateCartItemsFrom, getTotalItems } from "./Cart";
import "./Checkout.css";
import Footer from "./Footer";
import Header from "./Header";

/**
 * Sub-component to display the inline form for adding a new address
 */
const AddNewAddressView = ({
  token,
  newAddress,
  handleNewAddress,
  addAddress,
}) => {
  return (
    <Box display="flex" flexDirection="column">
      <TextField
        multiline
        minRows={4}
        placeholder="Enter your complete address"
        value={newAddress.value}
        onChange={(e) =>
          handleNewAddress((curr) => ({ ...curr, value: e.target.value }))
        }
      />
      <Stack direction="row" my="1rem" spacing={2}>
        <Button
          variant="contained"
          sx={{ backgroundColor: "#00A278", "&:hover": { backgroundColor: "#008663" } }}
          onClick={() => addAddress(token, newAddress.value)}
        >
          ADD
        </Button>
        <Button
          variant="text"
          sx={{ color: "#00A278" }}
          onClick={() =>
            handleNewAddress({ isAddingNewAddress: false, value: "" })
          }
        >
          CANCEL
        </Button>
      </Stack>
    </Box>
  );
};

const Checkout = () => {
  const token = localStorage.getItem("token");
  const history = useHistory();
  const { enqueueSnackbar } = useSnackbar();
  
  // State elements
  const [items, setItems] = useState([]);
  const [products, setProducts] = useState([]);
  const [addresses, setAddresses] = useState({ all: [], selected: "" });
  const [newAddress, setNewAddress] = useState({
    isAddingNewAddress: false,
    value: "",
  });

  // Fetch product list data catalog
  const getProducts = async () => {
    try {
      const response = await axios.get(`${config.endpoint}/products`);
      setProducts(response.data);
      return response.data;
    } catch (e) {
      enqueueSnackbar(
        "Could not fetch products. Check that the backend is running, reachable and returns valid JSON.",
        { variant: "error" }
      );
      return null;
    }
  };

  // Fetch private customer shopping cart contents
  const fetchCart = async (authToken) => {
    if (!authToken) return null;
    try {
      const response = await axios.get(`${config.endpoint}/cart`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });
      return response.data;
    } catch {
      enqueueSnackbar(
        "Could not fetch cart details. Check that the backend is running, reachable and returns valid JSON.",
        { variant: "error" }
      );
      return null;
    }
  };

  // Fetch list of addresses for a user
  const getAddresses = useCallback(async (authToken) => {
    if (!authToken) return null;
    try {
      const response = await axios.get(`${config.endpoint}/user/addresses`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });
      setAddresses((prev) => ({ ...prev, all: response.data }));
      return response.data;
    } catch {
      enqueueSnackbar(
        "Could not fetch addresses. Check that the backend is running, reachable and returns valid JSON.",
        { variant: "error" }
      );
      return null;
    }
  }, [enqueueSnackbar]);

  // Handler function to add a new address
  const addAddress = async (authToken, addressText) => {
    if (!addressText.trim()) {
      enqueueSnackbar("Address cannot be empty", { variant: "warning" });
      return;
    }
    try {
      const response = await axios.post(
        `${config.endpoint}/user/addresses`,
        { address: addressText },
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );
      setAddresses((prev) => ({ ...prev, all: response.data }));
      setNewAddress({ isAddingNewAddress: false, value: "" });
      enqueueSnackbar("Address added successfully", { variant: "success" });
    } catch (e) {
      enqueueSnackbar(
        "Could not add this address. Check that the backend is running, reachable and returns valid JSON.",
        { variant: "error" }
      );
    }
  };

  // Handler function to delete an address
  const deleteAddress = async (authToken, addressId) => {
    try {
      const response = await axios.delete(
        `${config.endpoint}/user/addresses/${addressId}`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );
      setAddresses((prev) => ({
        ...prev,
        all: response.data,
        selected: prev.selected === addressId ? "" : prev.selected,
      }));
      enqueueSnackbar("Address deleted successfully", { variant: "success" });
    } catch (e) {
      enqueueSnackbar(
        "Could not delete this address. Check that the backend is running, reachable and returns valid JSON.",
        { variant: "error" }
      );
    }
  };

  // Validate core parameters before firing transaction order creations
  const validateRequest = (cartItems, userAddresses) => {
    const balance = Number(localStorage.getItem("balance"));
    const totalCost = getTotalCartValue(cartItems);

    if (balance < totalCost) {
      enqueueSnackbar("You do not have enough balance in your wallet for this purchase", {
        variant: "warning",
      });
      return false;
    }
    if (!userAddresses.selected) {
      enqueueSnackbar("Please select one shipping address to proceed.", {
        variant: "warning",
      });
      return false;
    }
    return true;
  };

  // Execute checkout order lifecycle actions
  const performCheckout = async (authToken, cartItems, userAddresses) => {
    if (!validateRequest(cartItems, userAddresses)) return false;

    try {
      await axios.post(
        `${config.endpoint}/cart/checkout`,
        { addressId: userAddresses.selected },
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      const balance = Number(localStorage.getItem("balance"));
      const remainingBalance = balance - getTotalCartValue(cartItems);
      localStorage.setItem("balance", remainingBalance);

      enqueueSnackbar("Order placed successfully", { variant: "success" });
      history.push("/thanks");
      return true;
    } catch (e) {
      enqueueSnackbar("Wallet balance not sufficient to place order", { variant: "error" });
      return false;
    }
  };

  useEffect(() => {
    if (!token) {
      enqueueSnackbar("You must be logged in to access checkout page", { variant: "info" });
      history.push("/login");
      return;
    }
    getAddresses(token);
    
    const onLoadHandler = async () => {
      const productsData = await getProducts();
      const cartData = await fetchCart(token);

      if (productsData && cartData) {
        const cartDetails = generateCartItemsFrom(cartData, productsData);
        setItems(cartDetails);
      }
    };
    onLoadHandler();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, getAddresses]);

  return (
    <Box display="flex" flexDirection="column" minHeight="100vh">
      <Header />
      <Grid container flexGrow={1}>
        <Grid item xs={12} md={9}>
          <Box className="shipping-container">
            <Typography color="#3C3C3C" variant="h4" my="1rem">
              Shipping
            </Typography>
            <Typography color="#3C3C3C" my="1rem">
              Manage all the shipping addresses you want. This way you won't
              have to enter the shipping address manually with every order.
              Select the address you want to get your order delivered.
            </Typography>
            <Divider />
            
            <Box my="1rem">
              {addresses.all.length === 0 ? (
                <Typography my="1rem" className="address-empty">
                  No addresses found for this account. Please add one to proceed
                </Typography>
              ) : (
                addresses.all.map((addr) => (
                  <Box
                    key={addr._id}
                    className={`address-item ${
                      addresses.selected === addr._id ? "selected" : "not-selected"
                    }`}
                    onClick={() => setAddresses((prev) => ({ ...prev, selected: addr._id }))}
                  >
                    <Typography color="#3C3C3C">{addr.address}</Typography>
                    <Button
                      startIcon={<Delete />}
                      color="error"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteAddress(token, addr._id);
                      }}
                    >
                      DELETE
                    </Button>
                  </Box>
                ))
              )}
            </Box>

            {!newAddress.isAddingNewAddress ? (
              <Button
                variant="contained"
                id="add-new-btn"
                sx={{ backgroundColor: "#00A278", "&:hover": { backgroundColor: "#008663" } }}
                onClick={() =>
                  setNewAddress((curr) => ({ ...curr, isAddingNewAddress: true }))
                }
              >
                Add new address
              </Button>
            ) : (
              <AddNewAddressView
                token={token}
                newAddress={newAddress}
                handleNewAddress={setNewAddress}
                addAddress={addAddress}
              />
            )}

            <Typography color="#3C3C3C" variant="h4" my="2rem">
              Payment
            </Typography>
            <Typography color="#3C3C3C" my="1rem" variant="h6">
              Payment Method
            </Typography>
            <Divider />

            <Box my="1.5rem">
              <Typography sx={{ fontWeight: "bold" }} color="#3C3C3C">Wallet</Typography>
              <Typography color="text.secondary" my={0.5}>
                Pay ${getTotalCartValue(items)} of available ${localStorage.getItem("balance")}
              </Typography>
            </Box>

            <Button
              variant="contained"
              sx={{ backgroundColor: "#00A278", "&:hover": { backgroundColor: "#008663" } }}
              onClick={() => performCheckout(token, items, addresses)}
            >
              PLACE ORDER
            </Button>
          </Box>
        </Grid>
        
        {/* Right Sidebar */}
        <Grid item xs={12} md={3} sx={{ backgroundColor: "#E9F5E1", p: 2 }}>
          <Cart isReadOnly products={products} items={items} />
          
          <Box className="cart" sx={{ backgroundColor: "#ffffff", borderRadius: "4px", p: 2, mt: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2, color: "#3C3C3C" }}>
              Order Details
            </Typography>
            <Box display="flex" justifyContent="space-between" my={1}>
              <Typography color="text.secondary">Products</Typography>
              <Typography color="#3C3C3C">{getTotalItems(items)}</Typography>
            </Box>
            <Box display="flex" justifyContent="space-between" my={1}>
              <Typography color="text.secondary">Subtotal</Typography>
              <Typography color="#3C3C3C">${getTotalCartValue(items)}</Typography>
            </Box>
            <Box display="flex" justifyContent="space-between" my={1}>
              <Typography color="text.secondary">Shipping Charges</Typography>
              <Typography color="#3C3C3C">$0</Typography>
            </Box>
            <Box display="flex" justifyContent="space-between" mt={2} sx={{ fontWeight: "bold" }}>
              <Typography color="#3C3C3C">Total</Typography>
              <Typography color="#3C3C3C">${getTotalCartValue(items)}</Typography>
            </Box>
          </Box>
        </Grid>
      </Grid>
      <Footer />
    </Box>
  );
};
