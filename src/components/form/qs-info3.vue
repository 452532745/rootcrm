<template>
  <div class="view-layout">
    <div class="main">
      <div class="content">
        <transition name="fade">
          <Loading v-if="isLoading"></Loading>
        </transition>
        <el-form ref="userInfo" :model="userInfo" :rules="userInfoRule" class="info-list-m">
          <div class="userInfo">
            <el-form-item prop="name" class="question-item">
              <el-input v-model="userInfo.name" placeholder="您的称呼"></el-input>
            </el-form-item>
            <el-form-item prop="phone" class="question-item">
              <el-input v-model="userInfo.phone" placeholder="联系电话"></el-input>
            </el-form-item>
            <el-form-item prop="grade" class="question-item">
              <el-select v-model="userInfo.grade" placeholder="孩子年级">
                <el-option label="1年级" value="1"></el-option>
                <el-option label="2年级" value="2"></el-option>
                <el-option label="3年级" value="3"></el-option>
                <el-option label="4年级" value="4"></el-option>
                <el-option label="5年级" value="5"></el-option>
                <el-option label="6年级" value="6"></el-option>
                <el-option label="7年级" value="7"></el-option>
                <el-option label="8年级" value="8"></el-option>
                <el-option label="9年级" value="9"></el-option>
                <el-option label="10年级" value="10"></el-option>
                <el-option label="11年级" value="11"></el-option>
                <el-option label="12年级" value="12"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item prop="area" class="question-item">
              <el-select v-model="userInfo.area" placeholder="请选择区域">
                <el-option label="龙岗区" value="龙岗区"></el-option>
                <el-option label="龙华区" value="龙华区"></el-option>
                <el-option label="坪山区" value="坪山区"></el-option>
                <el-option label="罗湖区" value="罗湖区"></el-option>
                <el-option label="盐田区" value="盐田区"></el-option>
                <el-option label="福田区" value="福田区"></el-option>
                <el-option label="南山区" value="南山区"></el-option>
                <el-option label="宝安区" value="宝安区"></el-option>
                <el-option label="光明新区" value="光明新区"></el-option>
                <el-option label="大鹏新区" value="大鹏新区"></el-option>
              </el-select>
            </el-form-item>
          </div>
          <el-form-item class="question-item submit-btn">
            <el-button type="primary" @click="submitInfo('userInfo')" :disabled="finished">立即提交获取</el-button>
          </el-form-item>
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
            {required: true, message: '此项不能为空，请输入', trigger: 'blur'}
          ],
          grade: [
            {required: true, message: '请选择', trigger: 'change'}
          ],
          phone: [
            {required: true, message: '请输入手机号', trigger: 'blur'},
            {type: 'string', max: 11, min: 11, message: ' ', trigger: 'blur'}
          ],
          area: [
            {required: true, message: '请选择', trigger: 'change'}
          ]
        },
        userInfo: {
          name: '',
          grade: '',
          phone: '',
          area: ''
        }
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
          alert('出错了，请刷新页面重试！')
          return
        }

        this.$refs[formName].validate((valid) => {
          // 获取当前时间
          let timestamp = (new Date()).getTime()

          // 获取访问IP
          let ipPosition = ipAddress() ? ipAddress() : ''

          if (valid) {
            // 提交用户信息数据
            this.$http.post('/user/getId', {
              name: this.userInfo.name,
              grade: this.userInfo.grade,
              phone: this.userInfo.phone,
              time: timestamp,
              ip: ipPosition,
              area: this.userInfo.area,
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
    mounted() {
      this.isLoading = false
    },
    components: {
      Loading
    }
  }
</script>
<style scoped lang="less">
  .view-layout {
    width: 100%;
    max-width: 750px;
    box-sizing: border-box;
    font-family: PingFangSC-Regular;
    color: #808080;

    .content {
      position: relative;
    }

    .question-item {
      width: 27.5rem;
      max-width: 100%;
      text-align: left;
      margin: 0 auto;

      /deep/ .el-form-item__content {
        line-height: 100%;
      }

      .el-select {

        /deep/ .el-input input {
          width: 100%;
          height: 39px;
          line-height: 100%;
          padding: 6px 0;
          margin-bottom: 10px;
          color: #000;
          font-size: 12px;
          background-color: #fff;
          border: 1px solid #c2c2c2;
          color: #999;
          border-radius: 8px;
          text-indent: 8.3px;
          outline: none;
        }
      }

      .el-input {
        height: 39px;
        margin-bottom: 10px;

        /deep/ input {
          width: 100%;
          height: 39px;
          line-height: 100%;
          padding: 6px 0;
          color: #000;
          font-size: 12px;
          background-color: #fff;
          border: 1px solid #c2c2c2;
          color: #999;
          border-radius: 8px;
          text-indent: 8.3px;
          outline: none;
        }
      }

      .el-select, .el-button {
        display: block;
        width: 100%;
      }
    }

    .submit-btn {
      margin-top: 5px;
      border-radius: 8px;

      .el-button {
        font-size: 18px;
        background-color: #4AA5D1;
        border: 0;
        outline: 0;

        /deep/ span {
          font-weight: bold;
        }
      }
    }
  }
</style>