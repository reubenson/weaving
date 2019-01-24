/* eslint-disable */

import _ from 'lodash';

function cell(length) {
  this.length = length;
  this.cursor = 0;
  this.repetitionMax = 2;
  this.repetitionCount = 0;

  this.generate();
}

cell.prototype = {
  generate() {
    this.data = _.times(this.length, (i) => {
      return Math.random(i);
    });
  },
  get() {
    return this.data[this.cursor];
  },
  step() {
    this.cursor = (this.cursor + 1) % this.length;
    if (this.cursor === 0) {
      this.repetitionCount++;
      if (this.repetitionCount === this.repetitionMax) {
        this.generate();
        this.repetitionCount = 0;
      }
    }
  },
};

export default cell;
