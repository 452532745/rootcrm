<template>
  <div class="control-wrapper">
    <ul>
      <router-link to="/oa" tag="li">OA系统</router-link>
      <router-link to="/crm" tag="li">CRM系统</router-link>
    </ul>
  </div>
</template>
<script>
export default {
  data() {
    return {};
  },
  methods: {}
};
</script>
<style lang="less" scoped>
.control-wrapper {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url("~@/assets/images/bg.jpg") no-repeat center;
  background-size: cover;
}
</style>