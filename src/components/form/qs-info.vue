<template>
  <div class="view-layout">
    <div class="main">
      <div class="content">
        <transition name="fade">
          <Loading v-if="isLoading"></Loading>
        </transition>
        <el-form ref="userInfo" :model="userInfo" :rules="userInfoRule" class="info-list">
          <div class="userInfo">
            <el-form-item prop="name" class="question-item c-info">
              <label>姓名 :</label>
              <el-input v-model="userInfo.name" placeholder="孩子姓名"></el-input>
            </el-form-item>
            <el-form-item prop="grade" class="question-itemv c-info">
              <label>年级 :</label>
              <el-input v-model="userInfo.grade" placeholder="年级"></el-input>
            </el-form-item>
            <el-form-item prop="phone" class="question-item c-info">
              <label>电话 :</label>
              <el-input v-model="userInfo.phone" placeholder="电话"></el-input>
            </el-form-item>
          </div>
          <el-form-item class="question-item submit-btn">
            <el-button type="primary" @click="submitInfo('userInfo')" :disabled="finished">点击申请</el-button>
          </el-form-item>
          <div class="error">{{ err }}</div>
        </el-form>
      </div>
    </div>
  </div>
</template>
<script>
  import {ipAddress} from '@/common/js/utils'
  import Loading from '@/components/component/loading/loading'

  export default {
    data() {
      return {
        isLoading: true,
        finished: false,
        userInfoRule: {
          name: [
            {required: true, message: ' ', trigger: 'blur'}
          ],
          grade: [
            {required: true, message: ' ', trigger: 'blur'}
          ],
          phone: [
            {required: true, message: ' ', trigger: 'blur'},
            {type: 'string', max: 11, min: 11, message: ' ', trigger: 'blur'}
          ]
        },
        userInfo: {
          name: '',
          grade: '',
          phone: ''
        },
        err:''
      }
    },
    watch: {
      // 路由变化再次执行
      '$route': 'fetchData'
    },
    methods: {
      submitInfo(formName) {
        // 防止重复提交
        this.finished = true
        const nid = this.$route.query.nid
        if (!nid) {
          alert("出错了，请刷新页面重试！")
          return
        }

        this.$refs[formName].validate((valid) => {
          //获取当前时间
          let timestamp = (new Date()).getTime()

          // 获取访问IP
          let ipPosition = ipAddress() ? ipAddress() : ""

          if (valid) {
            // 提交用户信息数据
            this.$http.post('/user/getId', {
              name: this.userInfo.name,
              grade: this.userInfo.grade,
              phone: this.userInfo.phone,
              time: timestamp,
              ip: ipPosition,
              n_id: nid
            })
              .then((response) => {
                console.log(response.data)
                // 提交成功
                alert('您填写的表单我们已经收到，我们将尽快回复您。')
                // 重置表单
                this.$refs[formName].resetFields()
                this.finished = false
              }, (err) => {
                console.log(err)
                this.finished = false
              })
          } else {
            alert('请正确填写信息')
            this.finished = false
          }
        })
      }
    },
    mounted(){
      this.isLoading = false
    },
    components:{
      Loading
    }
  }
</script>
<style scoped lang="less">
  .view-layout {
    width: 580px;
    max-width: 100%;

    .content{
      position: relative;
    }


    .el-form-item {
      margin-bottom: 10px;
    }

    label {
      font-size: 2.4rem;
      width: 60px;
      font-family: 宋体;
      color: #333;
      font-weight: bold;
    }

    .el-input {
      display: inline-block;
      width: 380px;

      .el-input__inner {
        height: 50px;
      }
    }

    .submit-btn {
      width: 580px;
      max-width: 100%;

      .el-button {
        font-size: 2.4rem;
        background-color: #ff0000;
        border: 0;
        padding: 10px 20px;
        border-radius: 10px;
      }
    }
  }

  @media screen and (max-width: 450px) {
    .view-layout {
      width: 100%;
      max-width: 750px;

      .info-list {
        .el-form-item {
          margin-bottom: 3px !important;
        }

        /deep/ .el-form-item__content {
          line-height: 22px !important;
        }

        label {
          display: inline-block;
          font-size: 10px;
          width: 18%;
          font-family: 宋体;
          color: #333;
          font-weight: bold;
        }

        .el-input {
          display: inline-block !important;
          width: 78% !important;
          height: 22px !important;
          line-height: 22px !important;

          /deep/ .el-input__inner {
            max-width: 100%;
            height: 22px !important;
            line-height: 22px !important;
          }

          input {
            height: 22px;
          }

          /deep/ .el-input__inner {
            max-width: 100%;
            height: 22px !important;
            line-height: 22px !important;
          }
        }

        .submit-btn {
          margin-top: 3px;

          .el-button {
            font-size: 12px;
            background-color: #ff0000;
            border: 0;
            padding: 6px 20px;
            border-radius: 10px;
            margin-bottom: 0;
          }
        }
      }
    }
  }
</style>