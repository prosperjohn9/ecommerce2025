import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Home from './pages/Home';
import ProductDetails from './components/products/ProductDetails';
import Cart from './pages/Cart';
import Login from './pages/Login';
import Signup from './pages/Signup';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Layout />}>
          <Route index element={<Home />} />
          <Route path='products/:id' element={<ProductDetails />} />
          <Route path='cart' element={<Cart />} />

          {/* ✅ Auth routes */}
          <Route path='login' element={<Login />} />
          <Route path='signup' element={<Signup />} />

          {/* ✅ 404 */}
          <Route path='*' element={<div>404 - Page Not Found</div>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
