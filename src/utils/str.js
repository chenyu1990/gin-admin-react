function split(s) {
  s = s?.replaceAll('，', ',');
  s = s?.replaceAll('、', ',');
  s = s?.replaceAll(';', ',');
  s = s?.replaceAll('；', ',');
  s = s?.replaceAll('\\', ',');
  s = s?.replaceAll('。', ',');
  s = s?.replaceAll('.', ',');
  s = s?.replaceAll('|', ',');
  return s?.split(',');
}

export {
  split,
};
