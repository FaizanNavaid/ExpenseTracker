import i18n from '../../../config/localization/i18n';
import { setLanguage } from '../../../config/redux/slices/localizationSlice';
import { store } from '../../../config/redux/store/store';

export const changeAppLanguage = async (lang: 'en' | 'ur') => {
  await i18n.changeLanguage(lang);
  store.dispatch(setLanguage(lang));
};
