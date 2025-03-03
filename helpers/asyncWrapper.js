export const asyncWrapper = (fn) => {
  return async (...args) => {
    try {
      const result = await fn(...args);
      return [null, result];
    } catch (error) {
      console.log('====================================');
      console.log(error);
      console.log('====================================');
      return [error, null];
    }
  };
};
