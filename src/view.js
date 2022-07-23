/* eslint-disable no-param-reassign */
const renderProcessState = (elements, processState, i18nextInstance) => {
  switch (processState) {
    case 'sending':
      elements.input.setAttribute('readonly', 'true');
      elements.submitButton.setAttribute('disabled', 'disabled');
      elements.statusParagraph.textContent = '';
      break;

    case 'processed':
      elements.statusParagraph.classList.add('text-success');
      elements.input.removeAttribute('readonly');
      elements.submitButton.removeAttribute('disabled');
      elements.statusParagraph.textContent = i18nextInstance.t('loading.urlLoaded');
      elements.form.reset();
      elements.input.focus();
      break;

    case 'filling':
    case 'failed':
      break;

    default:
      throw new Error(`Unknown state: '${processState}'!`);
  }
};

const viewListGroup = (container, headerText) => {
  const containerBorder = document.createElement('div');
  containerBorder.classList.add('card', 'border-0');
  container.append(containerBorder);

  const containerCardBody = document.createElement('div');
  containerCardBody.classList.add('card-body');
  containerBorder.append(containerCardBody);

  const header = document.createElement('h2');
  header.classList.add('card-title', 'h4');
  header.textContent = headerText;
  containerCardBody.append(header);

  const listGroup = document.createElement('ul');
  listGroup.classList.add('list-group', 'border-0', 'rounded-0');
  containerBorder.append(listGroup);

  return listGroup;
};

const renderFeeds = (elements, feeds, i18nextInstance) => {
  elements.feedsContainer.innerHTML = '';
  const headerText = `${i18nextInstance.t('feeds')}`;
  const feedsGroup = viewListGroup(elements.feedsContainer, headerText);

  feeds.forEach((feed) => {
    const liElement = document.createElement('li');
    liElement.classList.add('list-group-item', 'border-0', 'border-end-0');
    feedsGroup.append(liElement);

    const headingElement = document.createElement('h3');
    headingElement.classList.add('h6', 'm-0');
    headingElement.textContent = feed.title;
    liElement.append(headingElement);

    const paragraphElement = document.createElement('p');
    paragraphElement.classList.add('m-0', 'small', 'text-black-50');
    paragraphElement.textContent = feed.description;
    liElement.append(paragraphElement);
  });
};

const renderViewedPost = (viewedPostsIds) => {
  viewedPostsIds.forEach((viewedPostId) => {
    const viewedPostElement = document.querySelector(`[data-id="${viewedPostId}"]`);
    viewedPostElement.classList.add('fw-normal', 'link-secondary');
    viewedPostElement.classList.remove('fw-bold');
  });
};

const renderPosts = (elements, posts, i18nextInstance, state) => {
  elements.postsContainer.innerHTML = '';
  const headerText = `${i18nextInstance.t('posts')}`;
  const postsGroup = viewListGroup(elements.postsContainer, headerText);

  posts.forEach((post) => {
    const liElement = document.createElement('li');
    liElement.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start', 'border-0', 'border-end-0');
    postsGroup.append(liElement);

    const linkElement = document.createElement('a');
    linkElement.classList.add('fw-bold');
    linkElement.setAttribute('href', post.link);
    linkElement.setAttribute('data-id', post.id);
    linkElement.setAttribute('target', '_blank');
    linkElement.setAttribute('rel', 'noopener noreferrer');
    linkElement.textContent = post.title;
    liElement.append(linkElement);

    const button = document.createElement('button');
    button.classList.add('btn', 'btn-outline-primary', 'btn-sm');
    button.setAttribute('type', 'button');
    button.setAttribute('data-id', post.id);
    button.setAttribute('data-bs-toggle', 'modal');
    button.setAttribute('data-bs-target', '#modal');
    button.textContent = `${i18nextInstance.t('viewing')}`;
    liElement.append(button);
  });
  renderViewedPost(state.uiState.viewedPostsIds);
};

const renderModal = (currentModalId, state) => {
  const [currentPost] = state.form.loadedPosts
    .filter((loadedPost) => loadedPost.id === currentModalId);
  const { title } = currentPost;
  const { description } = currentPost;
  const { link } = currentPost;

  const modalTitle = document.querySelector('.modal-title');
  modalTitle.textContent = title;
  const modalBody = document.querySelector('.modal-body');
  modalBody.textContent = description;
  const modalFooter = document.querySelector('.modal-footer');
  const modalFooterLink = modalFooter.querySelector('a');
  modalFooterLink.setAttribute('href', link);
};

const renderErrors = (elements, error, i18nextInstance) => {
  if (error === null) {
    elements.statusParagraph.classList.remove('text-danger');
    elements.input.classList.remove('is-invalid');
  } else {
    elements.statusParagraph.classList.add('text-danger');
    elements.input.removeAttribute('readonly');
    elements.submitButton.removeAttribute('disabled');
    elements.statusParagraph.classList.remove('text-success');
    elements.input.classList.add('is-invalid');

    switch (error) {
      case 'url':
        elements.statusParagraph.textContent = i18nextInstance.t('errors.invalidUrl');
        break;

      case 'notOneOf':
        elements.statusParagraph.textContent = i18nextInstance.t('errors.notOneOf');
        break;

      case 'Network Error':
        elements.statusParagraph.textContent = i18nextInstance.t('errors.networkError');
        break;

      case 'Parser Error':
        elements.statusParagraph.textContent = i18nextInstance.t('errors.parserError');
        break;

      default:
        throw new Error(`Unknown error type: '${error}'!`);
    }
  }
};

const view = (elements, i18nextInstance, state) => (path, value) => {
  switch (path) {
    case 'form.processState':
      renderProcessState(elements, value, i18nextInstance);
      break;

    case 'form.error':
      renderErrors(elements, value, i18nextInstance);
      break;

    case 'form.loadedFeeds':
      renderFeeds(elements, value, i18nextInstance);
      break;

    case 'form.loadedPosts':
      renderPosts(elements, value, i18nextInstance, state);
      break;

    case 'uiState.viewedPostsIds':
      renderViewedPost(value);
      break;

    case 'uiState.currentModalId':
      renderModal(value, state);
      break;

    default:
      break;
  }
};

export default view;
