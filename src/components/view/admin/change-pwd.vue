<template>
  <div class="homeMain">
    <v-header></v-header>
    <div class="change-pwd">
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
    </div>
  </div>
</template>
<script>
  import vHeader from '@/components/view/header/header'
  import qs from 'qs'

  export default {
    data() {
      const validatePass = (rule, value, callback) => {
        if (value === '') {
          callback(new Error('请输入密码'))
        } else {
          if (this.formCustom.passwdCheck !== '') {
            // 对第二个密码框单独验证
            this.$refs.formCustom.validateField('passwdCheck')
          }
          callback()
        }
      }
      const validatePassCheck = (rule, value, callback) => {
        if (value === '') {
          callback(new Error('请再次输入密码'))
        } else if (value !== this.formCustom.passwd) {
          callback(new Error('两次输入密码不一致!'))
        } else {
          callback()
        }
      }
      const validateOldPwd = (rule, value, callback) => {
        if (value === '') {
          return callback(new Error('原密码不能为空'))
        } else {
          callback()
        }
      }

      return {
        formCustom: {
          passwd: '',
          passwdCheck: '',
          oldpasswd: ''
        },
        ruleCustom: {
          passwd: [
            {required: true,validator: validatePass, trigger: 'blur'}
          ],
          passwdCheck: [
            {required: true,validator: validatePassCheck, trigger: 'blur'}
          ],
          oldpasswd: [
            {required: true,validator: validateOldPwd, trigger: 'blur'}
          ]
        }
      }
    },
    mounted(){
    },
    methods: {
      handleSubmit(name) {
        //  送往后台 修改 oldpwd , newpwd
        this.$refs[name].validate((valid) => {
          if (valid) {
            const params = qs.stringify({
              'username': localStorage.getItem('USER_NAME'),
              'oldpwd': this.formCustom.oldpasswd,
              'newpwd': this.formCustom.passwd
            })
            this.$http.post('/admin/changepwd', params)
              .then((res) => {
                console.log(res.data)
                // 影响行数大于0
                if (res.data.err === 0) {
                  this.$message({
                    message: '修改密码成功',
                    type: 'success'
                  })
                  // 重置表单
                  this.$refs[name].resetFields()
                  this.$store.dispatch('logout')
                  this.$message({
                    message: '请重新登录!',
                    type: 'warning'
                  })
                  this.$router.push('/login')
                } else {
                  this.$message.error('修改失败，请重试')
                }
              })
              .catch((err) => {
                console.log(err)
                this.$message.error('修改失败，请重试')
              })
          } else {
            this.$message.error('表单验证失败!')
          }
        })
      },
      handleReset(name) {
        this.$refs[name].resetFields()
      }
    },
    components: {
      vHeader
    }
  }
</script>
<style scoped lang="less">
  .change-pwd {
    width: 1200px;
    max-width: 100%;
    margin: 3% auto 0;
    padding-top: 100px;

    .el-form {
      width: 100%;
      max-width: 400px;
      margin: 0 auto;

      /deep/ label {
        width: 85px;
        text-align: left;
      }

      /deep/ .el-form-item__content {
        width: calc(~'100% - 85px');
        float: left;
      }
    }
  }
</style>