import {createStore, combineReducers, applyMiddleware} from 'redux';
import reducer from '../reducers/reducers';
import thunk from 'redux-thunk';

//创建一个 Redux store 来以存放应用中所有的 state，应用中应有且仅有一个 store。
// const store = createStore(
//     combineReducers(reducer),
//     applyMiddleware(thunk)
// );


const createStoreWithMiddleware = applyMiddleware(thunk)(createStore);

const store = createStoreWithMiddleware(reducer);

export default store;





