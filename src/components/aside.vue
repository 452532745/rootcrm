<template>
  <div>
    <el-aside width="220px">
      <el-menu
        v-for="(item,index) in menuDatas"
        :key="index"
        default-active="1"
        class="el-menu-vertical-demo"
        background-color="transparent"
        text-color="#fff"
        active-text-color="#18d576"
      >
        <el-menu-item index="index" v-if="item.url">
          <i :class="item.icon"></i>
          <span slot="title">
            <router-link :to="item.url" tag="span">{{item.title}}</router-link>
          </span>
        </el-menu-item>
        <el-submenu index="index" v-if="!item.url">
          <template slot="title">
            <i :class="item.icon"></i>
            <span>{{item.title}}</span>
          </template>
          <el-menu-item-group>
            <el-menu-item v-for="(items,indexs) in item.children" :key="indexs">
              <router-link index="`${index}-${indexs}`" :to="items.url" tag="span">{{items.title}}</router-link>
            </el-menu-item>
          </el-menu-item-group>
        </el-submenu>
      </el-menu>
    </el-aside>
  </div>
</template>
<script>
import qs from "qs";
import { mapGetters } from "vuex";
export default {
  data() {
    return {
      menuDatas: [],
      menuArr: [
        {
          url: "/index",
          title: "首页",
          icon: "el-icon-menu",
          permission: 10
        },
        {
          title: "人事管理",
          icon: "el-icon-user-solid",
          permission: 0,
          children: [
            {
              url: "/departmentManage",
              title: "部门管理"
            },
            {
              url: "/userManage",
              title: "员工管理"
            }
          ]
        },
        {
          title: "客户管理",
          icon: "el-icon-user-solid",
          permission: 2,
          children: [
            {
              url: "/customerManage",
              title: "客户管理"
            }
          ]
        },
        {
          title: "出单账号",
          icon: "el-icon-s-promotion",
          permission: 2,
          children: [
            {
              url: "/issuing",
              title: "账号管理"
            }
          ]
        },
        {
          title: "订单管理",
          icon: "el-icon-s-order",
          permission: 3,
          children: [
            {
              url: "/orderManage",
              title: "订单管理"
            }
          ]
        },
        {
          title: "产品管理",
          icon: "el-icon-s-order",
          permission: 0,
          children: [
            {
              url: "/goodsType",
              title: "产品类型"
            },
            {
              url: "/goodsManage",
              title: "产品管理"
            },
            {
              url: "/goodsStop",
              title: "停售产品"
            }
          ]
        },
        {
          url: "/sysNotice",
          title: "系统通知",
          icon: "el-icon-message-solid",
          permission: 0
        }
      ]
    };
  },
  created() {
    this.init();
  },
  methods: {
    init() {
      const userpermission = localStorage.getItem("USER_PERMISSION");
      let menuArrs = this.menuArr;
      for (let i = 0; i < menuArrs.length; i++) {
        if (menuArrs[i].permission >= userpermission) {
          this.menuDatas.push(menuArrs[i]);
        }
      }
    },
    handleGet(url, params) {
      return new Promise((resolve, reject) => {
        this.$http
          .post(url, params)
          .then(res => {
            if (res.data.err === 0) {
              resolve(res.data.data);
            } else {
              this.$message({
                message: res.data.msg,
                type: "warning",
                duration: 3000
              });
            }
          })
          .catch(err => {
            console.log(err);
            reject(err);
          });
      });
    }
  }
};
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
    background-color: transparent;
    margin-bottom: 15px;

    ul {
      .el-menu-item {
        color: #fff;
        padding-left: 0 !important;
        padding-right: 0 !important;

        span {
          display: inline-block;
          width: 100%;
          height: 50px;
          line-height: 50px;
          padding: 0 45px;
          box-sizing: border-box;
        }

        &.is-active {
          color: #18d576;
        }

        &:hover {
          span {
            color: #333;
          }
        }
        &:focus {
          background-color: transparent;
        }
      }
    }
  }
}
</style>
