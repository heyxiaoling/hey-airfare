import React, { findDOMNode, Component } from 'react';
import ReactDOM from 'react-dom';
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux';
import * as action from '../actions/actions'

class Index extends Component {
  render() {
    return (
      <div>
        <input type='text' value={this.props.LOGINSTATE}  ref="input"/>
        {this.props.LOGINSTATE}
      </div>
    );
  }
  changeHandle(){
    const node = ReactDOM.findDOMNode(this.refs.input);
    const value = node.value.trim();
    this.props.change(value);
  }
}

function mapStateToProps(state) {
  return {
      LOGINSTATE:state.get('LOGINSTATE'),
      LOADINGSTATE:state.get('LOADINGSTATE')
      
  };
}

//将action的所有方法绑定到props上
function mapDispatchToProps(dispatch) {
  return bindActionCreators(action, dispatch)
}


//将state的指定值映射在props上，将action的所有方法映射在props上
export default connect(mapStateToProps,mapDispatchToProps)(Index);