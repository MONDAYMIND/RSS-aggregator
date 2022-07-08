/* eslint-disable no-param-reassign */
import axios from 'axios';
import i18next from 'i18next';
import onChange from 'on-change';
import _ from 'lodash';
import render from './render.js';
import validate from './validator.js';
import resources from './locales/index.js';
import domParser from './domParser.js';

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
  };

  const i18nextInstance = i18next.createInstance();
  i18nextInstance.init({
    lng: defaultLanguage,
    debug: false,
    resources,
  })
    .then(() => {
      const watchedState = onChange(state, render(elements, i18nextInstance));
      elements.form.addEventListener('submit', (e) => {
        e.preventDefault();

        const { value } = elements.input;
        const { loadedLinks } = state.form;
        return validate(value, loadedLinks)
          .catch((err) => {
            watchedState.form.valid = false;
            watchedState.form.processState = 'failed';
            watchedState.form.error = err;
            throw new Error(err);
          })
          .then((validUrl) => {
            watchedState.form.value = validUrl;
            watchedState.form.valid = true;
            watchedState.form.processState = 'sending';
            return validUrl;
          })
          .then(() => {
            const url = watchedState.form.value;
            const id = setInterval(() => axios.get(`https://allorigins.hexlet.app/get?disableCache=true&url=${encodeURIComponent(url)}`), 5000);
            return id;
          })
          .then((response) => domParser(response.data.contents))
          .then((parsedData) => {
            console.log(parsedData);
            const link = parsedData.querySelector('link').nextSibling.textContent.trim();
            const newFeed = {
              id: _.uniqueId(),
              title: parsedData.querySelector('title').textContent,
              description: parsedData.querySelector('description').textContent,
              link,
            };
            watchedState.form.loadedLinks.push(watchedState.form.value);
            watchedState.form.loadedFeeds.push(newFeed);

            const items = parsedData.querySelectorAll('item');
            Array.from(items).map((item) => {
              const newPost = {
                id: _.uniqueId(),
                title: item.querySelector('title').textContent,
                description: item.querySelector('description').textContent,
                link: item.querySelector('link').nextSibling.textContent.trim(),
              };
              watchedState.form.loadedPosts.push(newPost);
              return newPost;
            });
            return parsedData;
          })
          .then(() => {
            watchedState.form.error = '';
            watchedState.form.processState = 'processed';
          });
      });
    });

  // return controllers;
};
