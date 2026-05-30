import rateLimit from 'express-rate-limit';

const defaults = {
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests. Try again later.' },
};

export const globalLimiter = rateLimit({
  ...defaults,
  windowMs: 60 * 1000,
  max: 100,
});

export const roomCreateLimiter = rateLimit({
  ...defaults,
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: { error: 'Room creation limit reached. Try again in an hour.' },
});

export const roomJoinLimiter = rateLimit({
  ...defaults,
  windowMs: 10 * 60 * 1000,
  max: 20,
});

export const roomExtendLimiter = rateLimit({
  ...defaults,
  windowMs: 60 * 60 * 1000,
  max: 10,
});

export const reportLimiter = rateLimit({
  ...defaults,
  windowMs: 10 * 60 * 1000,
  max: 5,
  message: { error: 'Too many reports. Try again later.' },
});
