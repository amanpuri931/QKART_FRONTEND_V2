import Register from "./components/Register";
import ipConfig from "./ipConfig.json";
import { Route, Switch } from "react-router-dom";
import Login from "./components/Login";
import Products from "./components/Products";

export const config = {
  endpoint: `http://${ipConfig.workspaceIp}:8082/api/v1`,
};

function App() {
  return (
    <div className="App">
      {/* Switch makes sure only one matching component route is rendered at a time */}
      <Switch>
        {/* Render the Products grid catalog at the absolute root URL path */}
        <Route exact path="/" component={Products} />

        {/* Render the Login page flow when matching path is visited */}
        <Route path="/login" component={Login} />

        {/* Render the Register card flow when matching path is visited */}
        <Route path="/register" component={Register} />
      </Switch>
    </div>
  );
}

export default App;