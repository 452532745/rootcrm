<template>
  <div>
    <el-header>
      <div class="avatar">
        <img :src="logo" />
      </div>
      <div class="topNav">
        <el-button @click="handleAside">
          <span class="el-icon-s-grid"></span>
        </el-button>
        <el-button @click="back">
          <span class="el-icon-back"></span>
        </el-button>
        <el-button @click="forward">
          <span class="el-icon-right"></span>
        </el-button>
      </div>
      <div class="user-box">
        <el-avatar :src="user_data.user_avatar"></el-avatar>
        <el-dropdown @command="handleCommand">
          <span>{{user_data.user_name}}</span>
          <i class="el-icon-caret-bottom"></i>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item command="info">个人信息</el-dropdown-item>
            <el-dropdown-item command="psd">修改密码</el-dropdown-item>
            <el-dropdown-item command="logout">注销</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </div>
      <el-dialog title="修改密码" :visible.sync="dialogChangePasswordVisible" width="600px">
        <el-form
          ref="formCustom"
          :model="formCustom"
          :rules="ruleCustom"
          label-width="120px"
        >
          <el-form ref="formCustom" :model="formCustom" :rules="ruleCustom">
            <el-form-item label="原始密码:" prop="oldpasswd">
              <el-input type="password" v-model="formCustom.oldpasswd"></el-input>
            </el-form-item>
            <el-form-item label="新的密码:" prop="passwd">
              <el-input type="password" v-model="formCustom.passwd"></el-input>
            </el-form-item>
            <el-form-item label="确认密码:" prop="passwdCheck">
              <el-input type="password" v-model="formCustom.passwdCheck"></el-input>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="handleSubmit('formCustom')">提交</el-button>
              <el-button type="ghost" @click="handleReset('formCustom')" style="margin-left: 8px">重置</el-button>
            </el-form-item>
          </el-form>
        </el-form>
      </el-dialog>
    </el-header>
  </div>
</template>
<script>
import qs from "qs";
import { mapGetters } from "vuex";
import logo from "@/assets/images/logo2.png";
export default {
  name: "oa",
  data() {
    const validatePass = (rule, value, callback) => {
      if (value === "") {
        callback(new Error("请输入密码"));
      } else {
        if (this.formCustom.passwdCheck !== "") {
          // 对第二个密码框单独验证
          this.$refs.formCustom.validateField("passwdCheck");
        }
        callback();
      }
    };
    const validatePassCheck = (rule, value, callback) => {
      if (value === "") {
        callback(new Error("请再次输入密码"));
      } else if (value !== this.formCustom.passwd) {
        callback(new Error("两次输入密码不一致!"));
      } else {
        callback();
      }
    };
    const validateOldPwd = (rule, value, callback) => {
      if (value === "") {
        return callback(new Error("原密码不能为空"));
      } else {
        callback();
      }
    };
    return {
      logo: logo,
      formCustom: {
        passwd: "",
        passwdCheck: "",
        oldpasswd: ""
      },
      ruleCustom: {
        passwd: [{ required: true, validator: validatePass, trigger: "blur" }],
        passwdCheck: [
          { required: true, validator: validatePassCheck, trigger: "blur" }
        ],
        oldpasswd: [
          { required: true, validator: validateOldPwd, trigger: "blur" }
        ]
      },
      dialogChangePasswordVisible: false
    };
  },
  computed: {
    user_data() {
      return this.$store.getters.user_data;
    }
  },
  created() {
    this.getUser();
  },
  methods: {
    handleCommand(command) {
      switch (command) {
        case "info":
          this.$message("click on item " + command);
          break;
        case "psd":
          this.dialogChangePasswordVisible = true;
          break;
        case "logout":
          this.logOut();
      }
    },
    logOut() {
      this.$store.dispatch("logout");
      this.$notify({
        title: "退出登录",
        message: "您已退出登录",
        type: "success"
      });
      this.$router.push("/login");
    },
    back() {
      window.history.length > 1 ? this.$router.go(-1) : this.$router.push("/");
    },
    forward() {
      window.history.length > 1 ? this.$router.go(1) : this.$router.push("/");
    },
    handleAside() {
      this.$store.dispatch("handleaside");
    },
    getUser() {
      const user = this.$store.state.user_data;
      if (!!user) {
        const username = localStorage.getItem("USER_CODE");
        const params = qs.stringify({
          username: username
        });
        this.handleGet("/user", params).then(datas => {
          const data = {
            user: datas
          };
          this.$store.dispatch("login", data);
        });
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
    },
    handleSubmit(name) {
      //  送往后台 修改 oldpwd , newpwd
      this.$refs[name].validate(valid => {
        if (valid) {
          const params = qs.stringify({
            username: localStorage.getItem("USER_CODE"),
            oldpwd: this.formCustom.oldpasswd,
            newpwd: this.formCustom.passwd
          });
          this.$http
            .post("/user/changepwd", params)
            .then(res => {
              console.log(res.data);
              // 影响行数大于0
              if (res.data.err === 0) {
                this.$message({
                  message: "修改密码成功，请重新登录",
                  type: "success"
                });
                // 重置表单
                this.$refs[name].resetFields();
                this.$store.dispatch("logout");
                this.dialogChangePasswordVisible = false;
                this.$router.push("/login");
              } else {
                this.$message.error("修改失败，请重试");
              }
            })
            .catch(err => {
              console.log(err);
              this.$message.error("修改失败，请重试");
            });
        } else {
          this.$message.error("表单验证失败!");
        }
      });
    },
    handleReset(name) {
      this.$refs[name].resetFields();
    }
  }
};
</script>
<style lang="less" scoped>
.el-header {
  width: 100%;
  height: 50px !important;
  overflow: hidden;
  background-color: #2a2d36;
  padding: 0;

  .avatar {
    width: 220px;
    height: 50px;
    float: left;
    background-color: #18d576;
    padding: 7.5px 0;
    text-align: center;
    box-sizing: border-box;

    img {
      display: inline-block;
      height: 35px;
    }
  }

  .topNav {
    height: 50px;
    float: left;
    font-size: 0;

    .el-button {
      position: relative;
      width: 50px;
      height: 50px;
      line-height: 50px;
      text-align: center;
      padding: 0;
      background-color: transparent;
      border: 0px;
      font-size: 24px;
      color: #8d939d;
      margin: 0;

      &::after {
        content: "";
        position: absolute;
        right: 0px;
        top: 10px;
        width: 1px;
        height: 30px;
        background-color: #4a4a4a;
      }
    }
  }

  .user-box {
    position: relative;
    height: 42.5px;
    float: right;
    margin-top: 7.5px;
    padding: 0 15px;

    &::before {
      content: "";
      position: absolute;
      left: 0px;
      top: 2.5px;
      width: 1px;
      height: 30px;
      background-color: #4a4a4a;
    }

    > * {
      display: inline-block;
      vertical-align: middle;
      color: #fff;
      font-size: 14px;
      margin: 0 3px;
    }

    .el-dropdown {
      > span {
        display: inline-block;
        max-width: 100px;
        min-width: 40px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        vertical-align: middle;
        text-align: center;
      }
    }

    .el-avatar {
      width: 35px;
      height: 35px;
      border: 2px solid #fff;
    }

    .el-dropdown {
      cursor: pointer;
    }

    .el-icon-caret-bottom {
      margin-left: 6px;
    }
  }
}
</style>