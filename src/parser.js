export default (rssFlow) => {
  const parser = new DOMParser();
  const parsedData = parser.parseFromString(rssFlow, 'text/html');
  const newFeed = {
    title: parsedData.querySelector('title').textContent,
    description: parsedData.querySelector('description').textContent,
    items: [],
  };
  const items = parsedData.querySelectorAll('item');
  Array.from(items).map((item) => {
    const newPost = {
      title: item.querySelector('title').textContent,
      description: item.querySelector('description').textContent,
      link: item.querySelector('link').nextSibling.textContent.trim(),
    };
    return newFeed.items.push(newPost);
  });
  return newFeed;
};
