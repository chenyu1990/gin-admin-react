const jsonToArr = (data, idField, parentField, sortFunc) => {
  let dataJson = {};
  data?.map?.(item => {
    if (parentField && item[parentField] > 0) {
      if (!dataJson[item[parentField]]) {
        dataJson[item[parentField]] = { children: [] };
      }
      dataJson[item[parentField]].children.push(item);
    } else {
      dataJson[item[idField]] = { ...item, ...dataJson[item[idField]] };
    }
  });

  let dataArr = [];
  for (const id in dataJson) {
    if (sortFunc) {
      dataJson[id].children?.sort(sortFunc);
    }
    dataArr.push(dataJson[id]);
  }
  if (sortFunc) {
    return dataArr.sort(sortFunc);
  }
  return dataArr;
};

export {
  jsonToArr,
};
