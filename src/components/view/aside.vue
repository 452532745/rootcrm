<template>
  <div>
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
  </div>
</template>
<script>
export default {};
</script>
<style lang="less" scoped>
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
      background-color: #21242c !important;
    }

    /deep/ .el-menu {
      background-color: transparent;
      margin-bottom: 15px;

      .el-menu-item {
        color: #fff;
        height: 40px;
        line-height: 40px;

        &.is-active {
          color: #18d576;
        }

        &:hover {
          background-color: transparent;
          color: #18d576;
        }
        &:focus {
          background-color: transparent;
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
</style>
