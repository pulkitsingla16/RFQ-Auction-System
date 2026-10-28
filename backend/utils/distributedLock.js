// In-memory simple lock for demonstration purposes since Redis isn't installed
const locks = new Set();

export const withLock = async (key, fn) => {
  if (locks.has(key)) {
    throw new Error('Resource is currently locked. Please try again.');
  }
  
  locks.add(key);
  try {
    return await fn();
  } finally {
    locks.delete(key);
  }
};
