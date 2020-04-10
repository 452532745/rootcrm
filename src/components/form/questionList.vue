<template>
  <div>
    <el-form ref="userInfo" :model="userInfo" :rules="userInfoRule" class="question-list">
      <el-form-item class="question-item" v-for="(item,index) in questionList" :key="item.id">
        <el-row>
          <el-col :span="6">{{ 'Q' + (index + 1) + ':'}}</el-col>
          <el-col :span="18">
            <h3>
              [{{ item.type }}] {{item.content}} {{ item.isRequired ? '(必填)' :'(选填)' }}
              <span style="color: #f00;" v-if="item.isRequired">*</span>
            </h3>
            <p class="question-desc" v-if="item.description !== ''">说明: {{ item.description }}</p>
            <div class="question-options">
              <div v-if="item.type === '单选'">
                <el-radio-group v-model="item.selectContent">
                  <el-radio class="option-item" v-for="o_item in item.options" :label="o_item.options_id "
                            :key="o_item.id">
                    {{o_item.options_content}}
                  </el-radio>
                </el-radio-group>
              </div>
              <div v-if="item.type === '多选'" class="check-box">
                <el-checkbox-group v-model="item.selectMultipleContent">
                  <el-checkbox class="option-item" v-for="o_item in item.options" :label="o_item.options_id"
                               :key="o_item.id">
                    {{o_item.options_content}}
                  </el-checkbox>
                </el-checkbox-group>
              </div>
              <div v-if="item.type === '文本'">
                <el-input v-model="item.selectContent" type="textarea" :autosize="{ minRows: 1, maxRows: 5}"
                          placeholder="请输入内容">
                </el-input>
              </div>
            </div>
          </el-col>
        </el-row>
      </el-form-item>
      <div class="userInfo">
        <el-form-item prop="name" class="question-item c-info">
          <el-input v-model="userInfo.name" placeholder="孩子姓名"></el-input>
        </el-form-item>
        <el-form-item prop="grade" class="question-item c-info">
          <el-input v-model="userInfo.grade" placeholder="年级"></el-input>
        </el-form-item>
        <el-form-item prop="phone" class="question-item c-info">
          <el-input v-model="userInfo.phone" placeholder="手机号码"></el-input>
        </el-form-item>
      </div>
      <div class="warn">
        请填写正确信息，<b>免费获得价值980元专业综合认知能力CAS测评一份</b>。已有<b><i>2</i><i>5</i><i>6</i><i>5</i><i>8</i><i>1</i></b>位家长获取测评报告
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
            {required: true, message: '请填写孩子姓名', trigger: 'blur'}
          ],
          grade: [
            {required: true, message: '请填写年级', trigger: 'blur'}
          ],
          phone: [
            {required: true, message: '请填写手机号码', trigger: 'blur'},
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
    font-size: 0;

    .el-form-item {
      margin-bottom: 10px;
    }

    .question-item {
      padding: 20px 0;
      margin-bottom: 0;
      display: inline-block;
      width: 48%;
      vertical-align: top;
      background-color: #f5f5f5;
      height: 150px;
      border-radius: 10px;
      margin: 1%;

      .el-col-6 {
        width: 60px;
        text-align: center;
        font-size: 1.8rem;
        font-weight: bold;
      }

      .el-col-18 {
        font-size: 1.4rem;

        h3 {
          font-weight: bold;
        }

        .question-desc {
          font-size: 1.2rem;
        }

        .option-item {
          display: block;
          height: 30px;
          line-height: 30px;
          margin-right: 0;
        }
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
      width: 30%;
      height: 32px;
      background-color: #fff;
      margin-right: 1%;
      margin-bottom: 0;
    }

    .warn {
      display: block;
      padding: 8px 48px 8px 16px;
      height: 38px;
      margin: 0 1%;
      font-size: 1.8rem;
      text-align: center;
    }

    .error {
      font-size: 14px;
    }

    .submit-btn {
      width: 100%;
      padding: 5px 0;
      text-align: center;
      height: 43px;
      background-color: #fff;

      .el-button {
        font-size: 3rem;
        background-color: #ff0000;
        border: 0;
        padding: 18px 25px;
        border-radius: 10px;
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
  }

  @media screen and (max-width: 750px) {
    .userInfo {
      .el-form-item--small .el-form-item__content {
        line-height: 50px;
      }

      .el-input--small .el-input__inner {
        height: 50px;
        line-height: 50px;
        border-radius: 0;
        border-color: #000;
      }

      .el-form-item--small.el-form-item {
        margin-bottom: 0px;
      }
    }

    .question-list {
      padding: 0;
      font-size: 0;

      .question-item {
        width: 100%;
        margin-bottom: 0;
        vertical-align: top;
        background-color: #f5f5f5;
        border-radius: 10px;
        margin: 0 0 1%;
        padding: 0;
        height: auto;

        .el-col-6 {
          width: 60px;
          text-align: center;
          font-size: 1.8rem;
          font-weight: bold;
        }

        .el-col-18 {
          font-size: 1.4rem;

          h3 {
            font-weight: bold;
          }

          .question-desc {
            font-size: 1.2rem;
          }

          .option-item {
            display: block;
            height: 30px;
            line-height: 30px;
            margin-right: 0;
            float: none;
            width: 100%;
          }
        }
      }

      .c-info {
        padding: 3px 0;
        height: 50px;
        background-color: #fff;
        margin-right: 1%;
        margin-bottom: 0;
      }

      .warn {
        display: block;
        height: auto;
        padding: 5px;
        margin: 0 1%;
        font-size: 10px;
        text-align: center;
        line-height: 250%;
      }

      .submit-btn {
        width: 100%;
        padding: 5px 0;
        text-align: center;
        height: 43px;
        background-color: #fff;

        .el-button {
          width: 43.6%;
          font-size: 16px;
          font-family: 黑体;
          background-color: #ff0000;
          padding: 11px 6.5px;
          text-align: center;
          border-radius: 5px;
          margin: 0 auto;
          border: 0
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
    }
  }
</style>