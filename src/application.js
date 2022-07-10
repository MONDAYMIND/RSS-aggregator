/* eslint-disable no-param-reassign */
import axios from 'axios';
import i18next from 'i18next';
import onChange from 'on-change';
import _ from 'lodash';
import render from './render.js';
import validate from './validator.js';
import resources from './locales/index.js';
import domParser from './domParser.js';

const parse = (response, watchedState, url) => {
  const parsedData = domParser(response.data.contents);
  const loadedFeedsUrl = watchedState.form.loadedFeeds.map((feed) => feed.link);
  if (!loadedFeedsUrl.includes(url)) {
    const newFeed = {
      id: _.uniqueId(),
      title: parsedData.querySelector('title').textContent,
      description: parsedData.querySelector('description').textContent,
      link: url,
    };
    watchedState.form.loadedLinks.push(url);
    watchedState.form.loadedFeeds.push(newFeed);
  }

  const items = parsedData.querySelectorAll('item');
  const loadedPostsLinks = watchedState.form.loadedPosts.map((post) => post.link);
  Array.from(items).map((item) => {
    const newPost = {
      id: _.uniqueId(),
      title: item.querySelector('title').textContent,
      description: item.querySelector('description').textContent,
      link: item.querySelector('link').nextSibling.textContent.trim(),
    };
    if (!loadedPostsLinks.includes(newPost.link)) {
      watchedState.form.loadedPosts.push(newPost);
    }
    return newPost;
  });

  setTimeout(() => {
    watchedState.form.loadedLinks.map((loadedLink) => axios.get(`https://allorigins.hexlet.app/get?disableCache=true&url=${encodeURIComponent(loadedLink)}`)
      .then((newResponse) => parse(newResponse, watchedState, url)));
  }, 5000);

  return 'All is rendered';
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
      error: null,
      loadedLinks: [],
      loadedFeeds: [],
      loadedPosts: [],
      value: null,
    },
    uiState: {
      viewedPosts: [],
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
      const watchedState = onChange(state, render(elements, i18nextInstance, state));
      elements.form.addEventListener('submit', (e) => {
        e.preventDefault();
        const { value } = elements.input;
        const { loadedLinks } = state.form;
        return validate(value, loadedLinks)
          .then((validUrl) => {
            watchedState.form.value = validUrl;
            watchedState.form.processState = 'sending';
            return validUrl;
          })
          .then((validUrl) => axios.get(`https://allorigins.hexlet.app/get?disableCache=true&url=${encodeURIComponent(validUrl)}`))
          .then((response) => parse(response, watchedState, watchedState.form.value))
          .then((result) => {
            watchedState.form.valid = true;
            watchedState.form.error = null;
            watchedState.form.processState = 'processed';
            return result;
          })
          .then(() => {
            const modalButtons = document.querySelectorAll('[data-bs-toggle="modal"]');
            modalButtons.forEach((button) => {
              button.addEventListener('click', (event) => {
                watchedState.uiState.currentModalId = event.target.dataset.id;
                const headlingElement = event.target.previousSibling;
                const viewedPost = {
                  id: headlingElement.dataset.id,
                  headlingElement,
                };
                watchedState.uiState.viewedPosts.push(viewedPost);
              });
            });
          })
          .catch((err) => {
            watchedState.form.valid = false;
            watchedState.form.processState = 'failed';
            if (err.name === 'TypeError') {
              watchedState.form.error = err.name;
            } else if (err.message === 'Network Error') {
              watchedState.form.error = err.message;
            } else {
              watchedState.form.error = err;
            }
          });
      });
    });
};
