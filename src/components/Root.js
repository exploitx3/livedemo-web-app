import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import App from './App';
import ConfigProvider from 'antd/es/config-provider';
import 'antd/es/config-provider/style';
import theme from 'antd/es/theme';
import mainColors, { getThemePrimary, isDarkTheme, THEME_CHANGE_EVENT } from '../constants/mainColors';


const Root = ({ store }) => {
  const [dark, setDark] = useState(isDarkTheme);
  const [primary, setPrimary] = useState(getThemePrimary);

  useEffect(() => {
    const onThemeChange = event => {
      setDark(event.detail.dark);
      // antd derives hover/active shades from a concrete hex; CSS vars won't do.
      setPrimary(getThemePrimary());
    };
    window.addEventListener(THEME_CHANGE_EVENT, onThemeChange);
    return () => window.removeEventListener(THEME_CHANGE_EVENT, onThemeChange);
  }, []);

  return (
    <Provider store={store}>
      <BrowserRouter>
        <ConfigProvider theme={{
          algorithm: dark ? theme.darkAlgorithm : theme.defaultAlgorithm,
          token: {
            fontFamily: mainColors.fontFamily,
            colorPrimary: primary,
          },
        }}>
          <App />
        </ConfigProvider>
      </BrowserRouter>
    </Provider>
  );
};

Root.propTypes = {
  store: PropTypes.object.isRequired
};

export default Root;
