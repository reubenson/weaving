function getDriverNames() {
  console.log('window.navigator', window.navigator);

  return Promise.resolve();
  // return window.navigator.requestMIDIAccess()
  //   .then((access) => {
  //     const inputs = [];
  //     const outputs = [];

  //     console.log('hitting?');

  //     access.inputs.forEach((entry) => {
  //       inputs.push(entry[1].name);
  //     });

  //     access.outputs.forEach((entry) => {
  //       console.log('entry', entry);
  //       outputs.push(entry[1].name);
  //     });
  //     // for (var entry of access.inputs) {
  //     //   inputs.push(entry[1].name);
  //     // }

  //     // for (var entry of access.outputs) {
  //     //   outputs.push(entry[1].name);
  //     // }
  //     // console.log('inputs', inputs);

  //     return { inputs, outputs };
  //   });
}

module.exports.getDriverNames = getDriverNames;
