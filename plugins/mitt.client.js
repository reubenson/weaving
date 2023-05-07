import mitt from 'mitt'

export default defineNuxtPlugin(() => {
  const emitter = mitt()

  return {
    provide: {
      event: emitter.emit, // Will emit an event
      listen: emitter.on // Will register a listener for an event
    }
  }
});

// import mitt from "mitt";
// const emitter = mitt();

// export default defineNuxtPlugin((/* nuxtApp */) => {
//   return {
//     provide: {
//       bus: {
//         $on: emitter.on,
//         $emit: emitter.emit,
//     }
//   }
// }});


// // export default defineNuxtPlugin((nuxtApp) => {
// //   nuxtApp.provide: {
// //     bus: {
// //       $on: emitter.on,
// //       $emit: emitter.emit,
// //   })
// // });
