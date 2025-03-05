import {createClient} from 'redis';

const redisClient = createClient({
  url: 'redis://localhost:6379'
});

redisClient.on('error', (err) => console.log('Redis Client Error', err));

const connectRedis = async () => {
  await redisClient.connect();
};

const cacheData = async (key, data, ttl = 3600) => {
  await redisClient.setEx(key, ttl, JSON.stringify(data));
};

const getCachedData = async (key) => {
  const data = await redisClient.get(key);
  return data ? JSON.parse(data) : null;
};

const deleteCache = async (key) => {
  await redisClient.del(key);
};

export {cacheData, connectRedis, deleteCache, getCachedData};
