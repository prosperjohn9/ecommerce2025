import client from './client';

export const getAllProducts = async () => {
  const response = await client.get('/products');
  return response.data;
};
