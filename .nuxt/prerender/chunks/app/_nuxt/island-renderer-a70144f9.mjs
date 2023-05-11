import { defineComponent, createVNode } from 'file:///Users/reubenson/Projects/weaving/node_modules/vue/index.mjs';
import { c as createError } from '../server.mjs';
import 'file:///Users/reubenson/Projects/weaving/node_modules/ofetch/dist/node.mjs';
import 'file:///Users/reubenson/Projects/weaving/node_modules/hookable/dist/index.mjs';
import 'file:///Users/reubenson/Projects/weaving/node_modules/unctx/dist/index.mjs';
import 'file:///Users/reubenson/Projects/weaving/node_modules/@unhead/ssr/dist/index.mjs';
import 'file:///Users/reubenson/Projects/weaving/node_modules/unhead/dist/index.mjs';
import 'file:///Users/reubenson/Projects/weaving/node_modules/@unhead/shared/dist/index.mjs';
import 'file:///Users/reubenson/Projects/weaving/node_modules/ufo/dist/index.mjs';
import 'file:///Users/reubenson/Projects/weaving/node_modules/h3/dist/index.mjs';
import 'file:///Users/reubenson/Projects/weaving/node_modules/@vueuse/core/index.mjs';
import 'file:///Users/reubenson/Projects/weaving/node_modules/@vue/shared/index.js';
import 'file:///Users/reubenson/Projects/weaving/node_modules/vue-devtools-stub/dist/index.mjs';
import 'file:///Users/reubenson/Projects/weaving/node_modules/vue/server-renderer/index.mjs';
import 'file:///Users/reubenson/Projects/weaving/node_modules/lodash-unified/import.js';
import 'file:///Users/reubenson/Projects/weaving/node_modules/@popperjs/core/dist/index.mjs';
import 'file:///Users/reubenson/Projects/weaving/node_modules/@ctrl/tinycolor/dist/public_api.js';
import 'file:///Users/reubenson/Projects/weaving/node_modules/lodash/lodash.js';
import 'file:///Users/reubenson/Projects/weaving/node_modules/tonal/dist/index.js';
import 'file:///Users/reubenson/Projects/weaving/node_modules/lerp/index.js';
import 'file:///Users/reubenson/Projects/weaving/node_modules/mtof/index.js';
import 'file:///Users/reubenson/Projects/weaving/node_modules/tonal-chord/build/es5.js';
import 'file:///Users/reubenson/Projects/weaving/node_modules/abcjs/index.js';
import '../../nitro/nitro-prerenderer.mjs';
import 'file:///Users/reubenson/Projects/weaving/node_modules/node-fetch-native/dist/polyfill.mjs';
import 'file:///Users/reubenson/Projects/weaving/node_modules/destr/dist/index.mjs';
import 'file:///Users/reubenson/Projects/weaving/node_modules/unenv/runtime/fetch/index.mjs';
import 'file:///Users/reubenson/Projects/weaving/node_modules/scule/dist/index.mjs';
import 'file:///Users/reubenson/Projects/weaving/node_modules/defu/dist/defu.mjs';
import 'file:///Users/reubenson/Projects/weaving/node_modules/ohash/dist/index.mjs';
import 'file:///Users/reubenson/Projects/weaving/node_modules/unstorage/dist/index.mjs';
import 'file:///Users/reubenson/Projects/weaving/node_modules/unstorage/drivers/fs.mjs';
import 'file:///Users/reubenson/Projects/weaving/node_modules/radix3/dist/index.mjs';

const components_islands = {};
const islandComponents = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  default: components_islands
});
const islandRenderer = /* @__PURE__ */ defineComponent({
  props: {
    context: {
      type: Object,
      required: true
    }
  },
  setup(props) {
    const component = islandComponents[props.context.name];
    if (!component) {
      throw createError({
        statusCode: 404,
        statusMessage: `Island component not found: ${JSON.stringify(component)}`
      });
    }
    return () => createVNode(component || "span", props.context.props);
  }
});

export { islandRenderer as default };
//# sourceMappingURL=island-renderer-a70144f9.mjs.map
