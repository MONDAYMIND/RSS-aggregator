import * as yup from 'yup';

export default (value, loadedFeeds) => {
  const schema = yup.string().required().trim().url()
    .notOneOf(loadedFeeds);

  return schema.validate(value)
    .then(() => value)
    .catch((err) => {
      throw err;
    });
};
