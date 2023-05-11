<template>
  <nav class="top-nav">
    <h1>Weaving Music</h1>
    <p class="error" v-if="errorMsg">{{ errorMsg }}</p>
    <div class="switches">
      <el-switch 
        v-model="useWebAudio"
        active-text="Use Web Audio to Play"
        inactive-text="Use External MIDI to Play"
      ></el-switch>
      <el-switch
        active-text="start"
        inactive-text="stop"
        v-model="isOn"
      ></el-switch>
    </div>
  </nav>
</template>

<script setup>
  import { useStore } from '@/store/main';
  import { storeToRefs } from 'pinia';
  const store = useStore();
  const { useWebAudio, isOn, errorMsg } = storeToRefs(store);
</script>

<style scoped lang="scss">
  .top-nav {
    background-color: white;
    border-bottom: solid black 1px;
    position: sticky;
    height: 70px;
    left: 0;
    padding: 10px;
    top: 0;
    width: 100vw;
    z-index: 10;

    h1 {
      line-height: 1em;
      // position: absolute;
      left: 20px;
    }

    .btn {
      // position: absolute; 
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
      // display: inliblock;
      // position: relative;
    }

    .error {
      margin-top: 10px;
      color: red;
    }
  }
</style>
