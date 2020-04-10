<template>
  <div>
    <el-form ref="userInfo" :model="userInfo" :rules="userInfoRule" class="question-list">
      <el-form-item class="question-item" v-for="(item,index) in questionList" :key="item.id">
        <el-row>
          <el-col :span="6">{{ "Q" + (index + 1) + ":"}}</el-col>
          <el-col :span="18">
            <h3>
              [{{ item.type }}] {{item.content}} {{ item.isRequired ? "(必填)" :"(选填)" }}
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
        <el-button type="primary" @click="handleSubmit('userInfo')" :disabled="finished">免费领取测评报告</el-button>
      </el-form-item>
      <div class="error">{{ err }}</div>
    </el-form>
  </div>
</template>
<script>
  export default {
    props: ['questionList', 'nId'],
    data() {
      return {
        userId: 0,
        finished: false,
        checked: [],
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
        },
        err: ''
      }
    },
    methods: {
      handleSubmit(formName) {
        this.$refs[formName].validate((valid) => {
          if (valid) {
            // 提交用户信息数据
            this.$http.post('/users', {
              name: this.userInfo.name,
              grade: this.userInfo.grade,
              phone: this.userInfo.phone
            })
              .then((response) => {
                this.getCallDatas()
              }, (err) => {
                console.log(err)
              })
          } else {
            console.log('请先填写用户信息!')
          }
        })
      },
      getCallDatas() {
        this.$http.post('/getId', {
          name: this.userInfo.name,
          grade: this.userInfo.grade,
          phone: this.userInfo.phone
        })
          .then((response) => {
            this.userId = response.data[0].u_id
            this.submitNaire()
          }, (err) => {
            console.log(err)
          })
      },
      submitNaire() {
        // 提交问卷表数据
        let _flag = true
        const nId = this.nId
        const result = []
        this.questionList.forEach((question, index) => {
          if (question.type === '单选') {
            const curQues = [
              nId,
              this.userId,
              question.id,
              question.selectContent,
              ''
            ]
            result.push(curQues)
          } else if (question.type === '多选') {
            question.selectMultipleContent.forEach((item, index) => {
              let curQues = [
                nId,
                this.userId,
                question.id,
                question.selectMultipleContent[index],
                ''
              ]
              result.push(curQues)
            })
          } else {
            const curQues = [
              nId,
              this.userId,
              question.id,
              0,
              question.selectContent
            ]
            result.push(curQues)
          }
        })
        console.log(result)

        // 验证表单数据
        if (!this.validateNaire()) {
          console.log("验证失败")
          return
        }

        // 防止重复提交
        this.finished = true
        this.$http.post('/result', {
          result: result
        })
          .then((response) => {
            this.finished = false
          }, (err) => {
            console.log(err)
            this.finished = false
          })

        //跳转到提交成功
        this.$router.push('/complete')
      },
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
          this.err = '您还有必填项未填，请检查后提交！'
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
</style>