import React from 'react';
import PropTypes from 'prop-types';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import App from './App';
import ConfigProvider from 'antd/es/config-provider';
import 'antd/es/config-provider/style';
import mainColors from '../constants/mainColors';


const Root = ({ store }) => {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <ConfigProvider theme={{
          token: {
            fontFamily: mainColors.fontFamily,
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
