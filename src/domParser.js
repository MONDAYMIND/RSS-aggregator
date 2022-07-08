export default (rssFlow) => {
  const parser = new DOMParser();
  return parser.parseFromString(rssFlow, 'text/html');
};
