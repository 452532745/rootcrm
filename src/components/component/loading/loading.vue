<template>
  <div class="loading">
    <span class="el-icon-loading"></span>
  </div>
</template>
<script>
  export default {
    name: "Loading"
  }
</script>
<style scoped lang="less">
  .loading {
    position: absolute;
    left: 0;
    top: 0;
    background: transparent;
    width: 100vw;
    height: 100vh;
    z-index: 1000;
    font-size: 30px;
    span{
      position: fixed;
      left: 50%;
      top: 50%;
      transform: translate(-50%,-50%);
    }
  }
</style>