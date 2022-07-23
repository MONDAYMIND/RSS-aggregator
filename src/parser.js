export default (rssFlow) => {
  const parser = new DOMParser();
  const parsedData = parser.parseFromString(rssFlow, 'text/xml');
  const parseError = parsedData.querySelector('parsererror');
  if (parseError) {
    const error = new Error();
    error.isParsingError = true;
    throw error;
  }
  const newFeed = {
    title: parsedData.querySelector('title').textContent,
    description: parsedData.querySelector('description').textContent,
    items: [],
  };
  const items = parsedData.querySelectorAll('item');
  Array.from(items).forEach((item) => {
    const newPost = {
      title: item.querySelector('title').textContent,
      description: item.querySelector('description').textContent,
      link: item.querySelector('link').textContent.trim(),
    };
    newFeed.items.push(newPost);
  });
  return newFeed;
};
