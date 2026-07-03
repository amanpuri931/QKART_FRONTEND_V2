import { Search, SentimentDissatisfied } from "@mui/icons-material";
import {
  CircularProgress,
  Grid,
  InputAdornment,
  TextField,
  Typography,
} from "@mui/material";
import { Box } from "@mui/system";
import axios from "axios";
import { useSnackbar } from "notistack";
import React, { useEffect, useState, useCallback } from "react";
import { config } from "../App";
import Footer from "./Footer";
import Header from "./Header";
import ProductCard from "./ProductCard";
import Cart, { generateCartItemsFrom } from "./Cart";
import "./Products.css";

const Products = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [debounceTimeout, setDebounceTimeout] = useState(null);

  const token = localStorage.getItem("token");
  const username = localStorage.getItem("username");

  const performAPICall = useCallback(async () => {
    try {
      const response = await axios.get(`${config.endpoint}/products`);
      setProducts(response.data);
      setFilteredProducts(response.data);
      return response.data;
    } catch (error) {
      enqueueSnackbar(
        "Something went wrong. Check the backend console for more details",
        { variant: "error" }
      );
      return null;
    }
  }, [enqueueSnackbar]);

  const fetchCart = useCallback(async (authToken) => {
    if (!authToken) return null;
    try {
      const response = await axios.get(`${config.endpoint}/cart`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      return response.data;
    } catch {
      enqueueSnackbar(
        "Could not fetch cart details. Check that the backend is running, reachable and returns valid JSON.",
        { variant: "error" }
      );
      return null;
    }
  }, [enqueueSnackbar]);

  useEffect(() => {
    const onLoadSequence = async () => {
      setIsLoading(true);
      const apiProducts = await performAPICall();
      if (apiProducts && token) {
        const cartData = await fetchCart(token);
        if (cartData) {
          setCartItems(generateCartItemsFrom(cartData, apiProducts));
        }
      }
      setIsLoading(false);
    };
    onLoadSequence();
  }, [performAPICall, fetchCart, token]);

  const performSearch = async (text) => {
    setIsLoading(true);
    try {
      const response = await axios.get(
        `${config.endpoint}/products/search?value=${text}`
      );
      setFilteredProducts(response.data);
    } catch (error) {
      if (error.response && error.response.status === 404) {
        setFilteredProducts([]);
      } else {
        enqueueSnackbar(
          "Something went wrong. Check the backend console for more details",
          { variant: "error" }
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const debounceSearch = (event, debounceTimeoutId) => {
    const value = event.target.value;
    if (debounceTimeoutId) {
      clearTimeout(debounceTimeoutId);
    }
    const newTimeoutId = setTimeout(() => {
      performSearch(value);
    }, 500);
    setDebounceTimeout(newTimeoutId);
  };

  const isItemInCart = (items, productId) => {
    if (!items) return false;
    return items.some((item) => item.productId === productId);
  };

  const addToCart = async (
    authToken,
    items,
    allProducts,
    productId,
    qty,
    options = { preventDuplicate: false }
  ) => {
    if (!authToken) {
      enqueueSnackbar("Login to add items to the cart", { variant: "warning" });
      return;
    }
    if (options.preventDuplicate && isItemInCart(items, productId)) {
      enqueueSnackbar(
        "Item already in cart. Use the cart sidebar to update quantity or remove item.",
        { variant: "warning" }
      );
      return;
    }

    try {
      const response = await axios.post(
        `${config.endpoint}/cart`,
        { productId, qty },
        { headers: { Authorization: `Bearer ${authToken}` } }
      );
      setCartItems(generateCartItemsFrom(response.data, allProducts));
    } catch (e) {
      if (e.response && e.response.data && e.response.data.message) {
        enqueueSnackbar(e.response.data.message, { variant: "error" });
      } else {
        enqueueSnackbar("Could not update cart. Try again later.", { variant: "error" });
      }
    }
  };

  return (
    <div>
      <Header>
        <TextField
          className="search-desktop"
          size="small"
          sx={{ width: "30vw" }}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <Search color="primary" />
              </InputAdornment>
            ),
          }}
          placeholder="Search for items/categories"
          name="search"
          onChange={(e) => debounceSearch(e, debounceTimeout)}
        />
      </Header>

      <TextField
        className="search-mobile"
        size="small"
        fullWidth
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <Search color="primary" />
            </InputAdornment>
          ),
        }}
        placeholder="Search for items/categories"
        name="search"
        onChange={(e) => debounceSearch(e, debounceTimeout)}
      />

      <Grid container>
        <Grid item xs={12} className="product-grid">
          <Box className="hero">
            <p className="hero-heading">
              India’s <span className="hero-highlight">FASTEST DELIVERY</span> to your door step
            </p>
          </Box>
        </Grid>

        <Grid item xs={12} md={username ? 9 : 12} padding="2rem">
          {isLoading ? (
            <Box className="loading">
              <CircularProgress color="success" />
              <Typography variant="body1" mt={1}>Loading Products...</Typography>
            </Box>
          ) : filteredProducts.length === 0 ? (
            <Box className="loading">
              <SentimentDissatisfied color="action" />
              <Typography variant="body1" mt={1}>No products found</Typography>
            </Box>
          ) : (
            <Grid container spacing={2}>
              {filteredProducts.map((product) => (
                <Grid item xs={6} md={username ? 4 : 3} key={product._id}>
                  <ProductCard
                    product={product}
                    handleAddToCart={async () => {
                      await addToCart(token, cartItems, products, product._id, 1, {
                        preventDuplicate: true,
                      });
                    }}
                  />
                </Grid>
              ))}
            </Grid>
          )}
        </Grid>

        {username && (
          <Grid item xs={12} md={3} sx={{ backgroundColor: "#E9F5E1" }}>
            <Cart products={products} items={cartItems} handleQuantity={addToCart} />
          </Grid>
        )}
      </Grid>
      <Footer />
    </div>
  );
};

export default Products;