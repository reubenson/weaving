import _ from 'lodash';

function noteListener(props) {
  _.assign(this, props);
}

noteListener.prototype = {};

export default noteListener;
