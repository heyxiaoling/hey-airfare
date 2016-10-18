import React, {Component, PropTypes} from 'react';
import ReactDOM, {render} from 'react-dom';
import {Provider} from 'react-redux';

import route from './lib/config/route';
import store from './lib/config/store';


render(
    <Provider store={store} >
        {route}
    </Provider>,
    document.getElementById('app')
)


