module.exports = function (content: string) {
  const json = JSON.stringify(content);
  return `module.exports = ${json}`;
};
