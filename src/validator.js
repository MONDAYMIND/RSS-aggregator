import * as yup from 'yup';
import { setLocale } from 'yup';

setLocale({
  mixed: {
    notOneOf: 'RSS уже существует',
  },
  string: {
    url: 'Ссылка должна быть валидным URL',
  },
});

export default (value, loadedFeeds) => {
  const schema = yup.string().required().trim().url()
    .notOneOf(loadedFeeds);

  return schema.validate(value)
    .then(() => value)
    .catch((err) => {
      throw err.message;
    });
};
