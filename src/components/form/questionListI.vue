<template>
  <div>
    <el-form ref="userInfo" :model="userInfo" :rules="userInfoRule" class="question-list zyl">
      <el-form-item class="question-item" v-for="(item,index) in questionList" :key="item.id">
        <h3>
          <span>{{index + 1}}、 {{item.content}}</span>
          <span v-if="item.description !== ''"> ({{ item.description }})</span>
        </h3>
        <div class="question-options">
          <div v-if="item.type === '单选'">
            <el-radio-group v-model="item.selectContent">
              <el-radio-button class="option-item" v-for="(o_item,index) in item.options" :label="o_item.options_id "
                               :key="o_item.id">
                {{"0" + (index + 1)}}: {{o_item.options_content}}
              </el-radio-button>
            </el-radio-group>
          </div>
          <div v-if="item.type === '多选'" class="check-box">
            <el-checkbox-group v-model="item.selectMultipleContent">
              <el-checkbox class="option-item" v-for="(o_item,index) in item.options" :label="o_item.options_id"
                           :key="o_item.id">
                {{"0" + (index + 1)}}: {{o_item.options_content}}
              </el-checkbox>
            </el-checkbox-group>
          </div>
          <div v-if="item.type === '文本'">
            <el-input v-model="item.selectContent" type="textarea" :autosize="{ minRows: 1, maxRows: 5}"
                      placeholder="请输入内容">
            </el-input>
          </div>
        </div>
      </el-form-item>
      <div class="userInfo">
        <h4>您的基本信息</h4>
        <el-form-item prop="name" class="question-item c-info">
          <label>孩子姓名:</label>
          <el-input v-model="userInfo.name" placeholder="孩子姓名"></el-input>
        </el-form-item>
        <el-form-item prop="grade" class="question-item c-info">
          <label>年级:</label>
          <el-input v-model="userInfo.grade" placeholder="年级"></el-input>
        </el-form-item>
        <el-form-item prop="phone" class="question-item c-info">
          <label>手机号码:</label>
          <el-input v-model="userInfo.phone" placeholder="手机号码"></el-input>
        </el-form-item>
      </div>
      <el-form-item class="question-item submit-btn">
        <el-button type="primary" @click="submitNaire('userInfo')" :disabled="finished">免费领取测评报告</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>
<script>
  import {ipAddress} from '@/common/js/utils'

  export default {
    props: ['questionList', 'nId'],
    data() {
      return {
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
            {type: 'string', max: 11, min: 11, message: '手机长度不正确', trigger: 'blur'}
          ],
          content: [
            {required: true, message: '请选择', trigger: 'blur'}
          ]
        },
        userInfo: {
          name: '',
          grade: '',
          phone: ''
        }
      }
    },
    methods: {
      // 表单提交
      submitNaire(formName) {
        const nId = this.nId
        let result = []
        // 防止重复提交
        this.finished = true
        // 判断nid
        if (!nId) {
          this.$message.error('出错了，请刷新页面重试！')
          this.finished = false
          return
        }
        // 验证表单数据
        if (!this.validateNaire()) {
          this.$message.error('请完整填写问卷')
          this.finished = false
          return
        }
        // 验证用户表单
        this.$refs[formName].validate((valid) => {
          // 获取表单填写时间
          let timestamp = (new Date()).getTime()
          // 获取用户IP地址
          let ipPosition = ipAddress() ? ipAddress() : ''
          if (valid) {
            // 提交用户表单数据
            this.$http.post('/user/getId', {
              name: this.userInfo.name,
              grade: this.userInfo.grade,
              phone: this.userInfo.phone,
              time: timestamp,
              ip: ipPosition,
              n_id: this.nId
            }).then((response) => {
              // 获取生成用户id
              let userId = response.data.insertId
              // 重构问卷表单数据
              this.questionList.forEach((question, index) => {
                if (question.type === '单选') {
                  const curQues = [
                    nId,
                    response.data.insertId,
                    question.id,
                    question.selectContent,
                    ''
                  ]
                  result.push(curQues)
                } else if (question.type === '多选') {
                  question.selectMultipleContent.forEach((item, index) => {
                    let curQues = [
                      nId,
                      response.data.insertId,
                      question.id,
                      question.selectMultipleContent[index],
                      ''
                    ]
                    result.push(curQues)
                  })
                } else {
                  const curQues = [
                    nId,
                    response.data.insertId,
                    question.id,
                    0,
                    question.selectContent
                  ]
                  result.push(curQues)
                }
              })
              // 提交问卷表单数据
              this.$http.post('/naire/submit', {
                result: result
              }).then((response) => {
                // 跳转到提交成功
                alert('您填写的表单我们已经收到，我们将尽快回复您，如需再次填写请刷新页面!')
                // 重置表单
                this.$refs[formName].resetFields()
                this.finished = false
              })
            }, (err) => {
              console.log(err)
              this.finished = false
            })
          } else {
            this.$message.error('请正确填写表单')
            this.finished = false
          }
        })
      },
      // 表单验证
      validateNaire() {
        let _flag = true
        let _addtion = false
        let _isfinished = true
        this.questionList.forEach((item, index) => {
            if (item.isRequired) {
              if (item.type === '文本') {
                if (!item.selectContent.length > 0) {
                  _flag = false
                }
              }
              if (item.type === '单选') {
                if (!item.selectContent > 0) {
                  _flag = false
                }
              }
              if (item.type === '多选') {
                if (!item.selectMultipleContent.length > 0) {
                  _flag = false
                }
              }
            }
          }
        )
        if (!_flag) {
          _isfinished = false
        }
        return _isfinished
      }
    }
  }
</script>
<style scoped lang="less">
  .question-list {
    padding: 0;
    margin: 10px 0;

    .question-item{
      margin: 30px 0;
    }

    > .question-item:not(.submit-btn) {
      position: relative;
      color: #666;
      list-style: none;
      border-bottom: 1px solid #000;
      background-color: transparent;

      &:hover {
        color: #409EFF;
        background: #fcfcfc;
      }

      h3 {
        line-height: 40px;

        span {
          font-size: 16px;
        }
      }

      .question-options {
        line-height: 40px;
      }
    }

    .check-box {
      .option-item {
        width: 50%;
        float: left;
      }
    }

    .c-info {
      padding: 10px 0;
      display: inline-block;
      height: 32px;
      background-color: #fff;
      margin-top: 20px;
      margin-bottom: 0;
      margin-right: 0;
    }

    .error {
      font-size: 14px;
    }

    .submit-btn {
      width: 100%;
      padding: 5px 0;
      text-align: center;
      height: 43px;
      margin-top: 20px;
      background-color: #fff;

      .el-button {
        width: 100%;
        font-size: 3rem;
        background-color: #ff0000;
        border: 0;
        padding: 18px 25px;
        border-radius: 10px;

        &:hover {
          opacity: 0.6;
        }
      }
    }

    b {
      color: #ff0000;

      i {
        font-style: normal;
        font-weight: bold;
        background-color: #e2dadd;
        margin: 0 3px;
        padding: 8px;
        border-radius: 5px;
      }
    }

    .userInfo {
      text-align: center;
      margin-top: 80px;
      font-size: 0;
      text-align: left;

      /deep/ .el-form-item__content {
        font-size: 0;
      }

      /deep/ .el-input__inner {
        width: 300px;
        max-width: 100%;
        font-size: 14px;
        border-radius: 0;
        opacity: 0.8;
        padding-left: 5px;
        outline: none;
        border: 1px solid #abc;
        border-left: none;
        border-right: none;
        border-top: none;
      }

      h4 {
        color: #4ba5d1;
        font-size: 18px;
        height: 40px;
        line-height: 40px;
        border-bottom: 1px dotted #efefef;
      }

      label {
        display: inline-block;
        width: 25%;
        font-size: 12px;
        text-align: right;
        padding-right: 20px;
        box-sizing: border-box;
      }

      .el-input {
        width: 75%;
        font-size: 14px;
      }
    }

    .el-radio-group {
      width: 100%;
      padding-bottom: 15px;

      .el-radio-button {
        display: block;
        margin-bottom: 10px;
      }

      /deep/ .el-radio-button__inner {
        width: 100%;
        padding: 0;
        line-height: 200%;
        border: 0;
        border-radius: 0;
        white-space: normal;
        text-align: left;
      }
    }
  }
</style>
<style lang="less">
  .userInfo {
    /deep/ .el-form-item__content {
      font-size: 0;
    }

    /deep/ .el-input__inner {
      max-width: 100%;
      font-size: 14px;
      border-radius: 0;
      opacity: 0.8;
      padding-left: 5px;
      outline: none;
      border: 1px solid #abc;
      border-left: none;
      border-right: none;
      border-top: none;
    }
  }
</style>