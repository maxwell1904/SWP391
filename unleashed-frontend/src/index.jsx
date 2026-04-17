import React from "react";
import ReactDOM from "react-dom/client";
import "./index.scss";
import App from "./App";
import AuthProvider from "react-auth-kit";
import { BrowserRouter } from "react-router-dom";
import createStore from "react-auth-kit/createStore";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { CartProvider } from "react-use-cart";
import { SearchProvider } from './components/hooks/SearchHook';
// import { ProductProvider } from "./components/Providers/Product";

const store = createStore({
  authName: "_auth",
  authType: "cookie",
  cookieDomain: window.location.hostname,
  cookieSecure: window.location.protocol === "https:",
});

const googleClientId =
  process.env.REACT_APP_GOOGLE_CLIENT_ID ||
  "118539556051-883ov35dcro331eo6f6jcp85kq2cjm2u.apps.googleusercontent.com";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <AuthProvider store={store}>
      <GoogleOAuthProvider clientId={googleClientId}>
        <BrowserRouter basename="/">
            <SearchProvider>
                <CartProvider>
                    {/*<ProductProvider>*/}
                    <App />
                    {/*</ProductProvider>*/}
                </CartProvider>
            </SearchProvider>
        </BrowserRouter>
      </GoogleOAuthProvider>
    </AuthProvider>
  </React.StrictMode>
);