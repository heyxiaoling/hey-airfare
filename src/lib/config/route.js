import React, {Component, PropTypes} from 'react';
import {Router, Route, IndexRoute, browserHistory, hashHistory,Redirect} from 'react-router';

import Index from '../airfare/index'; //首页


var history = process.env.NODE_ENV !== 'production' ? browserHistory : hashHistory;

const RouteConfig = (
    <Router History={history}>
        <Route path="">
            <Redirect from="/" to="airfare" />
            <Route path="airfare">
                <IndexRoute component={Index} name="xxx"/>
            </Route>
        </Route>
        
    </Router>
);
export default RouteConfig;