import axios from 'axios';

const BASE_API = './api'; // TODO: env

const fetchRandom = async () => {
  const res = await axios(`${BASE_API}/random`);
  return res.data;
}

const fetchProfile = async (profileId) => {
  const res = await axios(`${BASE_API}/profile/${profileId}`);
  return res.data;
}

export {
  fetchRandom,
  fetchProfile
}