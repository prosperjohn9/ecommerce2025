import { useEffect, useState } from 'react';
import { getAllProducts } from '../api/productAPI';

function Home() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await getAllProducts();
        setProducts(data);
      } catch (error) {
        console.error('Failed to fetch products', error);
      }
    };

    fetchProducts();
  }, []);

  return (
    <div>
      <h2>Products</h2>
      {products.map((p) => (
        <div key={p.id}>
          <strong>{p.name}</strong> – ${p.price}
        </div>
      ))}
    </div>
  );
}

export default Home;
