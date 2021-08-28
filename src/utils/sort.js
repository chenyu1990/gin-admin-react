export default (field, order) => (a, b) => {
  if (order?.toLowerCase() === 'asc') {
    return a[field] - b[field];
  } else {
    return b[field] - a[field];
  }
};
