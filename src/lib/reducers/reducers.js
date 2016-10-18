import Immutable,{List,Map,fromJS} from 'immutable';

const MgInitState = fromJS({
    LOGINSTATE: false,
    LOADINGSTATE: true,
    AJAXSTATE: false,
    USERINFO: {},
    TICKET: {},
    CRUISE: {},
    HOTEL: {},
    FLIGHT: {},
    HOLIDAY: {},
});

const CommonState = (state = MgInitState,action)=>{
    switch(action.type){
        case "LOGINSTATE" : // 登录状态
            state = state.mergeIn(['LOGINSTATE'],action.data);
            return state;
        case "LOADINGSTATE" : // loading状态
            state = state.mergeIn(['LOADINGSTATE'],action.data);
            return state;
        case "AJAXSTATE" : // 请求失败
            state = state.mergeIn(['AJAXSTATE'],action.data);
            return state;
        default : 
            return state;
    }
}

export default CommonState;