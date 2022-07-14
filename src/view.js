/* eslint-disable no-param-reassign */
import onChange from 'on-change';

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

  feeds.map((feed) => {
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

    return liElement;
  });
};

const renderViewedPost = (viewedPosts) => {
  viewedPosts.map((viewedPost) => {
    const viewedPostElement = document.querySelector(`[data-id="${viewedPost.id}"]`);
    viewedPostElement.classList.add('fw-normal', 'link-secondary');
    viewedPostElement.classList.remove('fw-bold');
    return viewedPost;
  });
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

const renderPosts = (elements, posts, i18nextInstance, state) => {
  elements.postsContainer.innerHTML = '';
  const headerText = `${i18nextInstance.t('posts')}`;
  const postsGroup = viewListGroup(elements.postsContainer, headerText);

  posts.map((post) => {
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
    linkElement.addEventListener('click', (event) => {
      const currentElement = event.target;
      const viewedPost = {
        id: currentElement.dataset.id,
      };
      state.uiState.viewedPosts.push(viewedPost);
      renderViewedPost(state.uiState.viewedPosts);
    });

    const button = document.createElement('button');
    button.classList.add('btn', 'btn-outline-primary', 'btn-sm');
    button.setAttribute('type', 'button');
    button.setAttribute('data-id', post.id);
    button.setAttribute('data-bs-toggle', 'modal');
    button.setAttribute('data-bs-target', '#modal');
    button.textContent = `${i18nextInstance.t('viewing')}`;
    liElement.append(button);
    button.addEventListener('click', (event) => {
      state.uiState.currentModalId = event.target.dataset.id;
      renderModal(state.uiState.currentModalId, state);
      const headlingElement = event.target.previousSibling;
      const viewedPost = {
        id: headlingElement.dataset.id,
      };
      state.uiState.viewedPosts.push(viewedPost);
      renderViewedPost(state.uiState.viewedPosts);
    });
    return liElement;
  });
  renderViewedPost(state.uiState.viewedPosts);
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

      case 'Type Error':
        elements.statusParagraph.textContent = i18nextInstance.t('errors.invalidRss');
        break;

      case 'Network Error':
        elements.statusParagraph.textContent = i18nextInstance.t('errors.networkError');
        break;

      default:
        throw new Error(`Unknown error type: '${error}'!`);
    }
  }
};

const render = (elements, i18nextInstance, state) => {
  const watchedState = onChange(state, (path, value) => {
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

      default:
        break;
    }
  });
  return watchedState;
};

export default render;
