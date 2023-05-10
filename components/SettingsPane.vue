<template>
  <div class="settings-pane">
    <header>{{ props.title }}</header>
    <slot></slot>
  </div>
</template>

<script setup>
  const props = defineProps({
    title: String
  });
</script>
