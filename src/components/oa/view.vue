<template>
  <div class="oa-wrapper">
    <div class="oa-box">
      <v-header></v-header>
      <el-container :class="isAsideHidden">
        <el-aside width="220px">
          <el-menu :default-openeds="['1']">
            <el-submenu index="1">
              <template slot="title">
                <i class="el-icon-user-solid"></i>人事管理
              </template>
              <el-menu-item index="1-1">
                <router-link to="/departmentManage" tag="li">部门管理</router-link>
              </el-menu-item>
              <el-menu-item index="1-2">
                <router-link to="/userManage" tag="li">员工管理</router-link>
              </el-menu-item>
            </el-submenu>
            <el-submenu index="2">
              <template slot="title">
                <i class="el-icon-setting"></i>系统设置
              </template>
              <el-menu-item index="2-1">
                <router-link to="/sysParam" tag="li">系统参数</router-link>
              </el-menu-item>
            </el-submenu>
            <el-submenu index="3">
              <template slot="title">
                <i class="el-icon-message"></i>系统通知
              </template>
              <el-menu-item index="3-1">
                <router-link to="/postMessage" tag="li">发布信息</router-link>
              </el-menu-item>
            </el-submenu>
          </el-menu>
        </el-aside>
        <el-main>
          main
        </el-main>
      </el-container>
    </div>
  </div>
</template>
<script>
import vHeader from "@/components/view/header";
export default {
  name: "oa",
  data() {
    return {};
  },
  methods: {},
  components: {
    vHeader
  },
  computed: {
    isAsideHidden() {
      return this.$store.state.isAsideHidden;
    }
  }
};
</script>
<style lang="less" scoped>
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
    width: 1380px;
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
      }
    }
  }

  .el-aside {
    position: absolute;
    left: 0;
    top: 0px;
    height: 100%;
    background-color: #2a2d36 !important;
    color: #fff;

    .el-menu {
      background-color: transparent;
      border: 0;

      .el-menu-item-group {
        /deep/ .el-menu-item-group__title {
          padding: 0 !important;
          margin: 10px 0;
        }
      }

      [aria-expanded="true"] {
        /deep/ .el-submenu__title {
          background-color: #21242c;
        }
      }

      /deep/ .el-submenu__title {
        color: #fff;
        height: 40px;
        line-height: 40px;

        &:hover {
          background-color: #21242c;
        }
      }

      /deep/ .el-menu {
        background-color: transparent;

        .el-menu-item {
          color: #fff;

          &:hover {
            background-color: transparent;
            color: #18d576;
          }
        }
      }
    }

    .el-collapse {
      border: 0;
      /deep/ .el-collapse-item__header {
        background-color: transparent;
        color: #8f949d;
      }
      /deep/ .el-collapse-item__wrap {
        background-color: transparent;
        border-bottom: 0;
        .el-collapse-item__content {
          color: #8f949d;
        }
      }
    }
  }

  .el-main {
    display: block;
  }
}
</style>