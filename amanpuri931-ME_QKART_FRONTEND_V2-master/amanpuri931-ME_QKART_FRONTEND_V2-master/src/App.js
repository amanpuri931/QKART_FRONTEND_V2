import Register from "./components/Register";
import Login from "./components/Login";
import Products from "./components/Products";
import Checkout from "./components/Checkout";
import Thanks from "./components/Thanks";
import { Route, Switch } from "react-router-dom";
import ipConfig from "./ipConfig.json";

export const config = {
  endpoint: "https://qkart-frontend-v2-gxyh.onrender.com",
};

function App() {
  return (
    <div className="App">
      <Switch>
        {/* Products Page */}
        <Route exact path="/" component={Products} />

        {/* Login */}
        <Route exact path="/login" component={Login} />

        {/* Register */}
        <Route exact path="/register" component={Register} />

        {/* Checkout */}
        <Route exact path="/checkout" component={Checkout} />

        {/* Thank You Page */}
        <Route exact path="/thanks" component={Thanks} />
      </Switch>
    </div>
  );
}

export default App;
