import client from './client';

// Sends only product ids and quantities. The server looks up prices and computes totals.
export const placeOrder = async ({ items, shipping, paymentMethod }) => {
  const response = await client.post('/orders', { items, shipping, paymentMethod });
  return response.data;
};

// The signed-in user's orders, newest first.
export const fetchMyOrders = async () => {
  const response = await client.get('/orders');
  return response.data;
};
