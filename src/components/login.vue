<template>
  <div class="login-wrapper">
    <div class="login-box">
      <div class="login-form">
        <div class="login-logo">
          <p>
            <img :src="logo" />
            <span>CRM MANAGE SYSTEM</span>
          </p>
        </div>
        <div class="login-info">
          <div class="login-padding">
            <div class="title">登陆/Login</div>
            <el-form
              ref="formValidate"
              :model="formValidate"
              :rules="ruleValidate"
              label-position="top"
              class="form-area"
              @submit.native.prevent
              @keyup.enter="handleSubmit('formValidate')"
            >
              <el-form-item prop="username">
                <el-input v-model="formValidate.username" placeholder="OA账号 / user"></el-input>
              </el-form-item>
              <el-form-item prop="password">
                <el-input
                  v-model="formValidate.password"
                  placeholder="OA密码 / password"
                  show-password
                ></el-input>
              </el-form-item>
              <el-form-item class="submit">
                <el-button
                  type="primary"
                  html-type="submit"
                  @click="handleSubmit('formValidate')"
                  @keyup.native.13="handleSubmit('formValidate')"
                  long
                >立即登录</el-button>
              </el-form-item>
            </el-form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import qs from "qs";
import logo from "@/assets/images/logo.png";

export default {
  data() {
    return {
      logo,
      formValidate: {
        username: "",
        password: ""
      },
      ruleValidate: {
        username: [
          {
            required: true,
            message: "请输入用户名",
            trigger: "blur"
          }
        ],
        password: [
          {
            required: true,
            message: "请输入密码",
            trigger: "blur"
          }
        ]
      }
    };
  },
  created() {
    // 按钮键盘事件无焦点，将事件绑定在文档document上
    let _this = this;
    document.onkeydown = e => {
      let key = window.event.keyCode;
      if (key == 13) {
        _this.handleSubmit("formValidate");
      }
    };
  },
  methods: {
    handleSubmit(name) {
      this.$refs[name].validate(valid => {
        if (valid) {
          const params = qs.stringify({
            username: this.formValidate.username,
            password: this.formValidate.password
          });
          console.log(params)
          this.$http
            .post("/login", params)
            .then(res => {
              if (res.data.err === 0) {
                const data = {
                  user: res.data.data,
                  token: res.data.token,
                  isAdmin: res.data.isAdmin
                };
                this.$store.dispatch("login", data);
                
                this.$message({
                  message: "登录成功",
                  type: "success"
                });
                this.$notify({
                  title: "登录成功",
                  message: "尊敬的管理员，欢迎回来",
                  type: "success"
                });
                this.$router.push("/index");
              } else {
                this.$message.error("帐号或密码有误,请重新输入");
              }
            })
            .catch(() => {
              this.$message.error("网络请求有误，请稍后重试!");
            });
        } else {
          this.$message.error("表单填写有误!");
        }
      });
    }
  }
};
</script>
<style lang="less" scoped>
.login-wrapper {
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

  .login-box {
    display: flex;
    justify-content: center;
    align-items: center;
    text-align: left;
    width: 1040px;
    height: 584px;
    background: url("~@/assets/images/login-bg.jpg") no-repeat center;
    box-shadow: 0 0 10px rgba(0, 0, 0, 1);
    border-radius: 2px;
  }

  .login-form {
    display: inline-flex;
    justify-content: center;
    align-items: center;
    width: 790px;
    height: 380px;
    background-color: rgb(46, 46, 46);
  }

  .login-logo {
    display: flex;
    width: 385px;
    justify-content: center;
    align-items: center;
    text-align: center;
    img {
      display: block;
      width: 235px;
    }
    p {
      font-size: 22px;
      color: #fff;
      letter-spacing: 5px;
      text-align: left;
      span {
        display: block;
        margin-top: 10px;
        font-size: 16px;
      }
    }
  }

  .login-info {
    display: flex;
    width: 405px;
    justify-content: center;
    align-items: center;
    text-align: center;
    border-left: 1px solid #767677;
    .login-padding {
      width: 275px;
      text-align: left;
      font-size: 2.4px;
      color: #fff;
      .title {
        margin-bottom: 30px;
      }
    }

    .title {
      font-size: 18px;
    }

    /deep/ .el-input__inner {
      background-color: #2e2e2e;
      height: 30px;
      border: 0;
      border-bottom: 1px solid #767677;
      border-radius: 0;
      padding: 0;
      font-size: 1.2px;
    }
  }

  .login-github {
    position: absolute;
    top: 20px;
    right: 30px;
    margin: 20px 0;
    color: #fff;
    vertical-align: middle;
  }

  .icon-github {
    display: inline-block;
  }

  .icon-github img {
    width: 20px;
    height: auto;
  }

  .submit {
    button {
      width: 100%;
      height: 25px;
      line-height: 25px;
      text-align: center;
      background-color: #4fd1a9;
      color: #fff;
      border-radius: 20px;
      border: 0;
      padding: 0;
    }
  }
}
</style>