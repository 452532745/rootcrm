<template>
  <div class="header">
    <ul>
      <router-link to="/" tag="li">
        <i class="el-icon-edit-outline"></i>问卷调查系统
      </router-link>
      <router-link to="/" tag="li">我的问卷</router-link>
      <router-link to="/reportall" tag="li">用户管理</router-link>
      <router-link to="/changepwd" tag="li">管理员设置</router-link>
      <li class="logout" @click="logOut()">注销 admin</li>
    </ul>
  </div>
</template>
<script>
export default {
  methods: {
    logOut() {
      this.$store.dispatch("logout");
      this.$notify({
        title: "退出登录",
        message: "您已退出登录",
        type: "success"
      });
      this.$router.push("/login");
    }
  }
};
</script>
<style scoped lang="less">
.header {
  width: 100%;
  height: 72px;
  line-height: 72px;
  box-sizing: border-box;
  background-color: #2672ff;
  text-align: left;
  padding: 0 5%;

  ul {
    width: 1200px;
    max-width: 100%;
    margin: 0 auto;
  }

  li {
    float: left;
    color: #fff;
    text-decoration: none;
    margin-right: 50px;
    font-size: 20px;
    cursor: pointer;

    i {
      font-size: 30px;
      vertical-align: middle;
      margin-right: 10px;
    }

    &:not(:first-child) {
      font-size: 16px;
    }
  }

  .logout {
    float: right;
    font-size: 12px !important;
    color: #fff;
    opacity: 0.6;
    cursor: pointer;
    margin-right: 0;
  }
}
</style>

