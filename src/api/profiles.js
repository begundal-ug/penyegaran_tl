import axios from 'axios';

const BASE_API = './api'; // TODO: env

export const fetchRandom = async () => {
  const res = await axios(`${BASE_API}/random`);
  return res.data;
}