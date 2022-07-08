/* eslint-disable no-param-reassign */
const renderProcessState = (elements, processState, i18nextInstance) => {
  switch (processState) {
    case 'sending':
      elements.input.setAttribute('readonly', 'true');
      elements.submitButton.setAttribute('disabled', 'disabled');
      elements.statusParagraph.textContent = '';
      break;

    case 'processed':
      elements.statusParagraph.classList.remove('text-danger');
      elements.statusParagraph.classList.add('text-success');
      elements.input.removeAttribute('readonly');
      elements.input.classList.remove('is-invalid');
      elements.submitButton.removeAttribute('disabled');
      elements.statusParagraph.textContent = i18nextInstance.t('urlLoaded');
      elements.form.reset();
      elements.input.focus();
      break;

    default:
      break;
  }
};

const renderFeeds = (elements, feeds, i18nextInstance) => {
  elements.feedsContainer.innerHTML = `<div class="card border-0">
  <div class="card-body"><h2 class="card-title h4">${i18nextInstance.t('feeds')}</h2></div>
  <ul class="list-group border-0 rounded-0"></ul></div>`;
  const ulElement = elements.feedsContainer.querySelector('ul');
  feeds.map((feed) => {
    const liElement = document.createElement('li');
    liElement.classList.add('list-group-item', 'border-0', 'border-end-0');
    ulElement.append(liElement);

    const headingElement = document.createElement('h3');
    headingElement.classList.add('h6', 'm-0');
    headingElement.textContent = feed.title;
    liElement.append(headingElement);

    const paragraphElement = document.createElement('p');
    paragraphElement.classList.add('m-0', 'small', 'text-black-50');
    paragraphElement.textContent = feed.description;
    liElement.append(paragraphElement);

    return liElement;
  });
};

const renderPosts = (elements, posts, i18nextInstance) => {
  elements.postsContainer.innerHTML = `<div class="card border-0">
    <div class="card-body"><h2 class="card-title h4">${i18nextInstance.t('posts')}</h2></div>
    <ul class="list-group border-0 rounded-0"></ul></div>`;
  const ulElement = elements.postsContainer.querySelector('ul');
  posts.map((post) => {
    const liElement = document.createElement('li');
    liElement.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start', 'border-0', 'border-end-0');
    ulElement.prepend(liElement);

    const linkElement = document.createElement('a');
    linkElement.classList.add('fw-bold');
    linkElement.setAttribute('href', post.link);
    linkElement.setAttribute('data-id', post.id);
    linkElement.setAttribute('target', '_blank');
    linkElement.setAttribute('rel', 'noopener; noreferrer');
    linkElement.textContent = post.title;
    liElement.append(linkElement);

    const button = document.createElement('button');
    button.classList.add('btn', 'btn-outline-primary', 'btn-sm');
    button.setAttribute('type', button);
    button.setAttribute('data-id', post.id);
    button.setAttribute('data-bs-toggle', 'modal');
    button.setAttribute('data-bs-target', '#modal');
    button.textContent = `${i18nextInstance.t('viewing')}`;
    liElement.append(button);

    return liElement;
  });
};

const renderErrors = (elements, error) => {
  elements.statusParagraph.classList.add('text-danger');
  elements.statusParagraph.classList.remove('text-success');
  elements.input.classList.add('is-invalid');
  elements.statusParagraph.textContent = error;
};

const render = (elements, i18nextInstance) => (path, value) => {
  switch (path) {
    case 'form.processState':
      renderProcessState(elements, value, i18nextInstance);
      break;

    case 'form.error':
      renderErrors(elements, value);
      break;

    case 'form.loadedFeeds':
      renderFeeds(elements, value, i18nextInstance);
      break;

    case 'form.loadedPosts':
      renderPosts(elements, value, i18nextInstance);
      break;

    default:
      break;
  }
};

export default render;