export function change(value){
    return{
        type:"change",
        value:value
    }
}

export const loginState = (data) => {
    return {
        type: 'LOGINSTATE',
        data
    }
}
export const loadingTip = (data) => {
    return {
        type: 'LOADINGSTATE',
        data
    }
}
export const ajaxFailed = (data) => {
    return {
        type: 'AJAXSTATE',
        data
    }
}

