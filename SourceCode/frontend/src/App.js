import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import RequireAuth from './components/auth/RequireAuth';
import Home from './pages/Home';
import ProductDetails from './components/products/ProductDetails';
import Cart from './pages/Cart';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Checkout from './pages/Checkout';
import Orders from './pages/Orders';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Layout />}>
          <Route index element={<Home />} />
          <Route path='products/:id' element={<ProductDetails />} />
          <Route path='cart' element={<Cart />} />

          <Route path='login' element={<Login />} />
          <Route path='signup' element={<Signup />} />

          <Route
            path='checkout'
            element={
              <RequireAuth>
                <Checkout />
              </RequireAuth>
            }
          />
          <Route
            path='orders'
            element={
              <RequireAuth>
                <Orders />
              </RequireAuth>
            }
          />

          <Route path='*' element={<div>404 - Page Not Found</div>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
