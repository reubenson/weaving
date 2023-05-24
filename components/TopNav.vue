<template>
  <nav class="top-nav">
    <h1>Weaving Music</h1>
    <div class="switches">
      <el-switch
        active-text="start"
        inactive-text="stop"
        v-model="isOn"
      ></el-switch>
      <el-switch 
        v-model="useWebAudio"
        active-text="Use Web Audio"
        inactive-text="Use External MIDI"
      ></el-switch>
    </div>
    <el-alert v-if="errorMsg" :title="errorMsg" type="error" show-icon />
  </nav>
</template>

<script setup>
  import { useStore } from '~/store/main';
  import { storeToRefs } from 'pinia';
  const store = useStore();
  const { useWebAudio, isOn, errorMsg } = storeToRefs(store);
</script>

<style scoped lang="scss">
  .top-nav {
    background-color: white;
    border-bottom: solid black 2px;
    position: sticky;
    height: 70px;
    left: 0;
    padding: 10px;
    top: 0;
    width: 100vw;
    z-index: 10;

    h1 {
      line-height: 1em;
      left: 20px;
    }

    .btn {
      right: 20px;
    }
    .switches {
      position: absolute;
      top: 0;
      right: 10px;
      display: flex;
      flex-direction: column;
    }

    .el-switch {
      align-self: end;
    }

    .error {
      margin-top: 10px;
      color: red;
    }
  }
</style>
