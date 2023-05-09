import { defineComponent, createVNode } from "vue";
import { c as createError } from "../server.mjs";
import "ofetch";
import "#internal/nitro";
import "hookable";
import "unctx";
import "@vue/devtools-api";
import "destr";
import "devalue";
import "klona";
import "@unhead/ssr";
import "unhead";
import "@unhead/shared";
import "ufo";
import "h3";
import "@vueuse/core";
import "@vue/shared";
import "vuex";
import "vue/server-renderer";
import "lodash-unified";
import "lodash";
import "colormap";
import "mtof";
import "@popperjs/core";
import "@ctrl/tinycolor";
import "tonal-chord";
import "tonal";
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
export {
  islandRenderer as default
};
//# sourceMappingURL=island-renderer-cd3c6483.js.map
