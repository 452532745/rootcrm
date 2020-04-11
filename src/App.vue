<template>
  <div id="app">
    <div class="oa-wrapper">
      <div class="oa-box">
        <v-header v-show="showApp"></v-header>
        <el-container :class="isAsideHidden">
          <v-aside></v-aside>
          <el-main>
            <div class="main_box">
              <router-view></router-view>
            </div>
            <v-footer></v-footer>
          </el-main>
        </el-container>
      </div>
    </div>
  </div>
</template>
<script>
import { mapGetters } from "vuex";
import vHeader from "@/components/header";
import vFooter from "@/components/footer";
import vAside from "@/components/aside";
export default {
  name: "App",
  data() {
    return {};
  },
  computed: {
    ...mapGetters(["isAsideHidden", "showApp"])
  },
  watch: {
    $route(to, from) {
      if (to.path == "/login" || to.path == "/control") {
        this.$store.dispatch("hiddenApp");
      } else {
        this.$store.dispatch("showApp");
      }
    }
  },
  components: {
    vHeader,
    vFooter,
    vAside
  }
};
</script>
<style lang="less">
@import "./common/less/index.less";

#app {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
}

.oa-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: left;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url("~@/assets/images/bg.jpg") no-repeat center;
  background-size: cover;

  .oa-box {
    width: 1600px;
  }

  .el-container {
    position: relative;
    height: 800px;
    background-color: #21242c;
    padding: 0;
    overflow: hidden;

    &.asideNotHidden {
      .el-aside {
        display: block;
      }
      .el-main {
        margin-left: 220px;
      }
    }

    &.asideHidden {
      .el-aside {
        display: none;
      }
      .el-main {
        margin-left: 0;
        width: 1380px;
      }
    }
  }

  .el-main {
    display: block;
    height: 800px;
    padding: 0px;
    background-color: #252831;
    font-size: 14px;

    .main_box {
      width: 100%;
      padding: 40px 20px;
      box-sizing: border-box;
    }
  }

  /deep/ .el-button--mini.is-circle {
    padding: 5px;
  }
}
</style>