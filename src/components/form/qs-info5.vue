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
              <el-input v-model="userInfo.name" placeholder="姓名："></el-input>
            </el-form-item>
            <el-form-item prop="grade" class="question-item">
              <el-select v-model="userInfo.grade" placeholder="年级：">
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
              <el-cascader size="large" :options="options" v-model="selectedOptions" @change="handleChange">
              </el-cascader>
            </el-form-item>
            <el-form-item prop="phone" class="question-item">
              <el-input v-model="userInfo.phone" placeholder="联系电话："></el-input>
            </el-form-item>
          </div>
          <el-form-item class="question-item submit-btn">
            <el-button type="primary" @click="submitInfo('userInfo')" :disabled="finished">立即预约</el-button>
          </el-form-item>
        </el-form>
      </div>
    </div>
  </div>
</template>
<script>
  import {ipAddress} from '@/common/js/utils'
  import {CodeToText, provinceAndCityData} from 'element-china-area-data'
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
            {required: true, message: ' ', trigger: 'change'}
          ],
          phone: [
            {required: true, message: ' ', trigger: 'blur'},
            {type: 'string', max: 11, min: 11, message: ' ', trigger: 'blur'}
          ]
        },
        userInfo: {
          name: '',
          grade: '',
          phone: '',
          area: ''
        },
        options: provinceAndCityData,
        selectedOptions: []
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
      },
      handleChange(value) {
        let province = CodeToText[value[0]]
        let city = CodeToText[value[1]]

        if (city) {
          this.userInfo.area = province + "/" + city
        }else{
          this.userInfo.area = province
        }
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
    position: relative;
    width: 100vw;
    height: 100vh;
    max-width: 750px;
    box-sizing: border-box;
    font-family: PingFangSC-Regular;
    color: #808080;

    .content {
      position: relative;
    }

    .el-form {
      width: 233px;
      height: 320px;
      text-align: center;
    }

    .question-item {
      display: inline-block;
      width: 233px;
      height: 40px;
      line-height: 40px;
      border-radius: 4px;
      border: none;
      margin-bottom: 22px;
      box-sizing: border-box;
      background-color: #fff;
      font-size: 16px;
      color: #a5a6a6;
      box-shadow: 5px 5px 10px 1px rgba(0, 0, 0, 0.2);

      /deep/ .el-form-item__content {
        line-height: 100%;
        text-align: left;
      }

      .el-select, .el-cascader {
        text-align: left;

        /deep/ .el-input input {
          width: 233px;
          height: 38px;
          line-height: 40px;
          color: #000;
          padding-left: 10px;
          border: none;
          color: #999;
          outline: none;
          background-color: #fff;
        }
      }

      .el-input {
        /deep/ input {
          width: 100%;
          height: 40px;
          line-height: 40px;
          color: #a5a6a6;
          padding-left: 10px;
          font-size: 13.333px;
          background-color: #fff;
          border: none;
          border-top: 2px solid #ECECEC;
          color: #999;
          border-radius: 4px;
          outline: none;
          background-color: #fff;
        }
      }

      .el-select, .el-button {
        display: block;
        width: 100%;
      }
    }

    .submit-btn {
      width: 159px;
      height: 39px;
      line-height: 39px;
      font-size: 16px;
      color: #FFFFFF;
      background: transparent;
      border-radius: 4px;
      cursor: pointer;
      background-color: #e60012;


      .el-button {
        background-color: #e60012;
        border: none;
        outline: none;

        /deep/ span {
          font-weight: bold;
        }
      }
    }
  }
</style>