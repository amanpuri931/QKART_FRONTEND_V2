import {
  AddOutlined,
  RemoveOutlined,
  ShoppingCart,
  ShoppingCartOutlined,
} from "@mui/icons-material";
import { Button, IconButton, Stack } from "@mui/material";
import { Box } from "@mui/system";
import React from "react";
import { useHistory } from "react-router-dom";
import "./Cart.css";

// Definition of Data Structures used
/**
 * @typedef {Object} Product - Data on product available to buy
 * @property {string} name - The name or title of the product
 * @property {string} category - The category that the product belongs to
 * @property {number} cost - The price to buy the product
 * @property {number} rating - The aggregate rating of the product (integer out of five)
 * @property {string} image - Contains URL for the product image
 * @property {string} _id - Unique ID for the product
 */

/**
 * @typedef {Object} CartItem -  - Data on product added to cart
 * @property {string} name - The name or title of the product in cart
 * @property {string} qty - The quantity of product added to cart
 * @property {string} category - The category that the product belongs to
 * @property {number} cost - The price to buy the product
 * @property {number} rating - The aggregate rating of the product (integer out of five)
 * @property {string} image - Contains URL for the product image
 * @property {string} productId - Unique ID for the product
 */

/**
 * Returns the complete data on all products in cartData by searching in productsData
 */
export const generateCartItemsFrom = (cartData, productsData) => {
  if (!cartData || !productsData) return [];

  return cartData.map((item) => {
    const productDetail = productsData.find((p) => p._id === item.productId);
    return {
      ...productDetail,
      productId: item.productId,
      qty: item.qty,
    };
  }).filter((item) => item.name);
};

/**
 * Get the total value of all products added to the cart
 */
export const getTotalCartValue = (items = []) => {
  if (!items.length) return 0;
  return items.reduce((total, item) => total + item.cost * item.qty, 0);
};

/**
 * Return the sum of quantities of all products added to the cart
 */
export const getTotalItems = (items = []) => {
  if (!items.length) return 0;
  // TYPO FIXED HERE: Removed any rogue expressions
  return items.reduce((total, item) => total + Number(item.qty), 0);
};

/**
 * Component to display the current quantity for a product
 */
const ItemQuantity = ({
  value,
  handleAdd,
  handleDelete,
  isReadOnly = false,
}) => {
  if (isReadOnly) {
    return (
      <Box padding="0.5rem" data-testid="item-qty" color="#3C3C3C">
        Qty: {value}
      </Box>
    );
  }

  return (
    <Stack direction="row" alignItems="center">
      <IconButton size="small" color="primary" onClick={handleDelete}>
        <RemoveOutlined />
      </IconButton>
      <Box padding="0.5rem" data-testid="item-qty">
        {value}
      </Box>
      <IconButton size="small" color="primary" onClick={handleAdd}>
        <AddOutlined />
      </IconButton>
    </Stack>
  );
};

/**
 * Component to display the Cart view
 */
const Cart = ({
  products,
  items = [],
  handleQuantity,
  isReadOnly = false,
}) => {
  const history = useHistory();

  if (!items.length) {
    return (
      <Box className="cart empty">
        <ShoppingCartOutlined className="empty-cart-icon" />
        <Box color="#aaa" textAlign="center">
          Cart is empty. Add more items to the cart to checkout.
        </Box>
      </Box>
    );
  }

  return (
    <>
      <Box className="cart">
        {items.map((item) => (
          <Box key={item.productId}>
            <Box display="flex" alignItems="flex-start" padding="1rem">
              <Box className="image-container">
                <img
                  src={item.image}
                  alt={item.name}
                  width="100%"
                  height="100%"
                  style={{ objectFit: "contain" }}
                />
              </Box>
              <Box
                display="flex"
                flexDirection="column"
                justifyContent="space-between"
                paddingX="1rem"
                flexGrow={1}
              >
                <Box color="#3C3C3C" fontSize="0.9rem">{item.name}</Box>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <ItemQuantity
                    value={item.qty}
                    isReadOnly={isReadOnly}
                    handleAdd={() => handleQuantity(
                      localStorage.getItem("token"),
                      items,
                      products,
                      item.productId,
                      item.qty + 1
                    )}
                    handleDelete={() => handleQuantity(
                      localStorage.getItem("token"),
                      items,
                      products,
                      item.productId,
                      item.qty - 1
                    )}
                  />
                  <Box padding="0.5rem" fontWeight="700" color="#3C3C3C">
                    ${item.cost}
                  </Box>
                </Box>
              </Box>
            </Box>
          </Box>
        ))}

        <Box
          padding="1rem"
          display="flex"
          justifyContent="space-between"
          alignItems="center"
        >
          <Box color="#3C3C3C" alignSelf="center">
            Order total
          </Box>
          <Box
            color="#3C3C3C"
            fontWeight="700"
            fontSize="1.5rem"
            alignSelf="center"
            data-testid="cart-total"
          >
            ${getTotalCartValue(items)}
          </Box>
        </Box>

        {!isReadOnly && (
          <Box display="flex" justifyContent="flex-end" className="cart-footer">
            <Button
              color="primary"
              variant="contained"
              startIcon={<ShoppingCart />}
              className="checkout-btn"
              onClick={() => history.push("/checkout")}
            >
              Checkout
            </Button>
          </Box>
        )}
      </Box>
    </>
  );
};

export default Cart;