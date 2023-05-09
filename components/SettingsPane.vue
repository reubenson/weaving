<template>
  <div class="settings-pane">
    <header>{{ props.title }}</header>
    <slot></slot>
    <!-- <el-input v-model="store.bpm" placeholder="BPM">
    <template #prepend>BPM</template>
    </el-input>
    <el-slider
        label="clock"
        :min="50"
        :max="1000"
        :step="10"
        v-model="store.bpm"
    ></el-slider> -->
  </div>
</template>

<script setup>
  const props = defineProps({
    title: String
  });
</script>
