import client from './client';

export const getAllProducts = async (category) => {
  const params = {};

  // only send category when not ALL
  if (category && category !== 'ALL') {
    params.category = category; // BAG or SHOE
  }

  const response = await client.get('/products', { params });
  return response.data;
};