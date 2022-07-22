/* eslint-disable no-param-reassign */
import axios from 'axios';
import i18next from 'i18next';
import _ from 'lodash';
import onChange from 'on-change';
import view from './view.js';
import validate from './validator.js';
import resources from './locales/index.js';
import parser from './parser.js';

const typeError = (error) => {
  if (error.name === 'TypeError') {
    return 'Type Error';
  } if (error.message === 'Network Error') {
    return 'Network Error';
  } if (error.isParsingError) {
    return 'Parser Error';
  }
  return error.type;
};

const fetchNewPosts = (watchedState) => {
  const { loadedLinks } = watchedState.form;
  const loadedPostsLinks = watchedState.form.loadedPosts.map((post) => post.link);
  const responsePromises = loadedLinks.map((link) => axios.get(`https://allorigins.hexlet.app/get?disableCache=true&url=${encodeURIComponent(link)}`));
  Promise.all(responsePromises).then((responses) => {
    responses.map((response) => {
      const { items } = parser(response.data.contents);
      return Array.from(items).map((item) => {
        if (!loadedPostsLinks.includes(item.link)) {
          item.id = _.uniqueId();
          watchedState.form.loadedPosts.push(item);
        }
        return item;
      });
    });
  })
    .then(() => setTimeout(() => fetchNewPosts(watchedState), 5000));
};

const processSSr = (response, watchedState, url) => {
  const parsedData = parser(response.data.contents);
  const { title, description, items } = parsedData;
  const feed = {
    title,
    description,
    id: _.uniqueId(),
  };
  watchedState.form.loadedLinks.push(url);
  watchedState.form.loadedFeeds.push(feed);
  Array.from(items).map((item) => {
    item.id = _.uniqueId();
    watchedState.form.loadedPosts.push(item);
    return item;
  });
};

export default () => {
  const elements = {
    formContainer: document.querySelector('.container-fluid'),
    form: document.querySelector('.rss-form'),
    input: document.querySelector('#url-input'),
    statusParagraph: document.querySelector('.feedback'),
    submitButton: document.querySelector('.rss-form button'),
    feedsContainer: document.querySelector('.feeds'),
    postsContainer: document.querySelector('.posts'),
  };

  const defaultLanguage = 'ru';
  const state = {
    lng: defaultLanguage,
    form: {
      valid: true,
      processState: 'filling',
      error: typeError,
      loadedLinks: [],
      loadedFeeds: [],
      loadedPosts: [],
      value: null,
    },
    uiState: {
      viewedPostsIds: [],
      currentModalId: null,
    },
  };

  const i18nextInstance = i18next.createInstance();
  i18nextInstance.init({
    lng: defaultLanguage,
    debug: false,
    resources,
  })
    .then(() => {
      const watchedState = onChange(state, view(elements, i18nextInstance, state));
      elements.form.addEventListener('submit', (e) => {
        e.preventDefault();
        const { value } = elements.input;
        const { loadedLinks } = state.form;
        return validate(value, loadedLinks)
          .then((validUrl) => {
            watchedState.form.valid = true;
            watchedState.form.value = validUrl;
            watchedState.form.processState = 'sending';
            return axios.get(`https://allorigins.hexlet.app/get?disableCache=true&url=${encodeURIComponent(validUrl)}`);
          })
          .then((response) => processSSr(response, watchedState, watchedState.form.value))
          .then(() => {
            watchedState.form.error = null;
            watchedState.form.processState = 'processed';
          })
          .catch((err) => {
            watchedState.form.error = typeError(err);
            watchedState.form.valid = false;
            watchedState.form.processState = 'failed';
          });
      });
      elements.postsContainer.addEventListener('click', (event) => {
        if (!event.target.matches('[data-id]')) {
          return;
        }
        watchedState.uiState.currentModalId = event.target.dataset.id;
        const viewedPostId = event.target.dataset.id;
        if (!watchedState.uiState.viewedPostsIds.includes(viewedPostId)) {
          watchedState.uiState.viewedPostsIds.push(viewedPostId);
        }
      });
      setTimeout(() => fetchNewPosts(watchedState), 5000);
    });
};
