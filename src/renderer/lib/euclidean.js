/* eslint-disable */

function buildString(level, arr, count, remainder) {
  if (level === -1) {
    arr.unshift(false);
    // append a “0” to the end of the bitmap;
  }
  else if (level === -2) {
    arr.unshift(true);
    // append a “1” to the end of the bitmap;
  }
  else {
    if (!count) {
      return;
    }
    for (let i=0; i < count[level]; i++) {
      buildString(level-1, arr, count, remainder);
    }
    if (remainder[level] != 0) {
      buildString(level-2, arr, count, remainder);
    }
  }
}

// Implementation of the Bjorklund algo for even distribution of timing events
// For reference, see http://cgm.cs.mcgill.ca/~godfried/publications/banff.pdf
function generateEuclideanSequence(numSlots, numPulses) {
  /*---------------------
   * First, compute the count and remainder arrays
   */
  let divisor = numSlots - numPulses;
  const remainder = [numPulses];
  // divisor = numPulses;
  // remainder = [numSlots - numPulses];
  const count = new Array;
  let level = 0;
  do {
    count[level] = Math.floor(divisor / remainder[level]);
    remainder[level + 1] = divisor % remainder[level];
    divisor = remainder[level];
    level += 1;
  }
  while (remainder[level] > 1);
  count[level] = divisor;

  /*---------------------
   * Now build the bitmap string
   */
  const arr = [];
  buildString(level, arr, count, remainder);
  return arr;
}



module.exports = {
  generateEuclideanSequence,
  buildString
}
