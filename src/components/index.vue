<template>
  <div>
    <div class="index_box">
      <Loading v-if="isLoading"></Loading>
      <div class="message_box">
        <h4>系统公告</h4>
        <el-menu
          v-for="(item,index) in messageData.slice(0, 3)"
          :key="index"
          class="el-menu-vertical-demo"
          @open="handleOpen"
          @close="handleClose"
        >
          <el-menu-item @click="handleCick(item.message_text)" index="index">
            <i class="el-icon-message"></i>
            <span slot="title">{{item.message_title}}</span>
          </el-menu-item>
        </el-menu>
        <el-dialog
          title="系统公告"
          :visible.sync="dialogVisible"
          width="50%"
          :before-close="handleClose"
        >
          <span v-html="messageContent"></span>
          <span slot="footer" class="dialog-footer">
            <el-button @click="dialogVisible = false">关闭</el-button>
          </span>
        </el-dialog>
      </div>
    </div>
  </div>
</template>
<script>
import Loading from "@/components/component/loading/loading";
export default {
  data() {
    return {
      messageData: [],
      isLoading: true,
      messageContent: "",
      dialogVisible: false
    };
  },
  created() {
    this.init();
    this.getMessage();
  },
  methods: {
    init() {
      let num = localStorage.getItem("NUM");
      console.log(num);
      if (num != 1) {
        localStorage.setItem("NUM", 1);
        this.$router.go(0);
      }
    },
    getMessage() {
      this.handleGet("/message").then(datas => {
        this.messageData = datas;
        console.log(datas);
        this.isLoading = false;
      });
    },
    handleGet(url) {
      return new Promise((resolve, reject) => {
        this.$http
          .get(url)
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
    },
    handleOpen(key, keyPath) {
      console.log(key, keyPath);
    },
    handleClose(key, keyPath) {
      console.log(key, keyPath);
    },
    handleCick(data) {
      this.messageContent = data;
      this.dialogVisible = true;
    }
  },
  components: {
    Loading
  }
};
</script>
<style lang="less" scoped>
.index_box {
  h4 {
    color: #797b83;
    border-left: 5px solid #18d576;
    padding-left: 10px;
    margin-left: 10px;
    margin-bottom: 15px;
    font-weight: bold;
  }
  .el-menu {
    background-color: #2a2d36;
    border: 0;
    .el-menu-item {
      color: #797b83;
      &:focus {
        background-color: transparent;
      }
      &:hover {
        color: #fff;
      }
    }
  }
}
</style>