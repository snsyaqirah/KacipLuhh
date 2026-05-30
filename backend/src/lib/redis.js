import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL, {
  maxRetriesPerRequest: 3,
  lazyConnect: false,
});

redis.on('error', (err) => console.error('[redis] error:', err.message));
redis.on('connect', () => console.log('[redis] connected'));

export default redis;
