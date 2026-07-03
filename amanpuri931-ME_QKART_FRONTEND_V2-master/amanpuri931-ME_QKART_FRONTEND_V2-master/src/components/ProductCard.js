import {
  Button,
  Card,
  CardActions,
  CardContent,
  CardMedia,
  Rating,
  Typography,
} from "@mui/material";
import AddShoppingCartOutlinedIcon from "@mui/icons-material/AddShoppingCartOutlined";
import React from "react";
import "./ProductCard.css";

const ProductCard = ({ product, handleAddToCart }) => {
  return (
    <Card className="card">
      {/* Product Image */}
      <CardMedia
        component="img"
        image={product.image}
        alt={product.name}
        sx={{ height: 250, objectFit: "contain", paddingTop: 2 }}
      />
      
      {/* Product Details */}
      <CardContent>
        <Typography gutterBottom variant="h6" component="div">
          {product.name}
        </Typography>
        <Typography variant="h5" color="text.primary" sx={{ fontWeight: 'bold', my: 1 }}>
          ${product.cost}
        </Typography>
        <Rating 
          name="read-only" 
          value={product.rating} 
          readOnly 
          precision={0.5} 
        />
      </CardContent>

      {/* Action Button */}
      <CardActions sx={{ padding: 2, paddingTop: 0 }}>
        <Button
          className="card-button"
          variant="contained"
          fullWidth
          startIcon={<AddShoppingCartOutlinedIcon />}
          onClick={handleAddToCart}
          sx={{
            backgroundColor: "#4caf50",
            "&:hover": {
              backgroundColor: "#388e3c",
            },
          }}
        >
          ADD TO CART
        </Button>
      </CardActions>
    </Card>
  );
};

export default ProductCard;