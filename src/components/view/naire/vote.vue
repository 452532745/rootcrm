<template>
  <div class="view-layout">
    <div class="main">
      <div class="header">
        <h1>{{naire.n_title}}</h1>
      </div>
      <div class="content">
        <div class="intro">
          <p style="text-align: center;margin-bottom: 15px">截止日期：{{naire.n_deadline | timeFormat}}</p>
          <el-alert :title="naire.n_intro" type="warning"></el-alert>
        </div>
        <voteList :question-list="this.naire.qList" :n-id="this.naire.n_id"></voteList>
      </div>
      <div class="footer">
        <p>爱乐斯教育科技有限公司</p>
      </div>
    </div>
  </div>
</template>
<script>
  import voteList from '@/components/view/naire/voteList'

  export default {
    data() {
      return {
        naire: {
          qList: [],
        },
        qDatas: [],
        oDatas: []
      }
    },
    filters: {
      timeFormat(value) {
        return formatDate(value)
      }
    },
    mounted() {
      this.getData(this.$route.query.nid)
    },
    watch: {
      oDatas: {
        handler(newValue, oldValue) {
          this.matchData()
        }
      }
    },
    methods: {
      getData(nid) {
        let _this = this;
        //get naire datas
        _this.$http.get('/naire', {
          params: {
            nId: nid
          }
        }).then((res) => {
          Object.assign(_this.naire, res.data[0])
        }, (err) => {
          console.log(err)
        })

        //get question datas
        _this.$http.get('/question', {
          params: {
            nId: nid
          }
        }).then((res) => {
          _this.qDatas = res.data
        }, (err) => {
          console.log(err)
        })

        //get questionOptions datas
        _this.$http.get('/questionoptions', {
          params: {
            nId: nid
          }
        }).then((res) => {
          _this.oDatas = res.data
        }, (err) => {
          console.log(err)
        })
      },
      matchData() {
        let _this = this;
        let _arrQuestion = _this.qDatas;
        let _arrOption = _this.oDatas;

        //合并问卷题目和选项
        for (let i = 0; i < _arrQuestion.length; i++) {
          for (let j = 0; j < _arrOption.length; j++) {
            if (_arrQuestion[i].q_type === "单选") {
              if (_arrQuestion[i].q_id === _arrOption[j].q_id) {
                let obj = {
                  id: _arrQuestion[i].q_id,
                  content: _arrQuestion[i].q_content,
                  options: {
                    options_content: _arrOption[j].o_value,
                    options_id: _arrOption[j].o_id,
                  },
                  type: _arrQuestion[i].q_type,
                  isRequired: _arrQuestion[i].q_isrequire,
                  description: _arrQuestion[i].q_description,
                  selectContent: ''
                }
                _this.naire.qList.push(obj)
              }
            }
            if (_arrQuestion[i].q_type === "多选") {
              if (_arrQuestion[i].q_id === _arrOption[j].q_id) {
                let obj = {
                  id: _arrQuestion[i].q_id,
                  content: _arrQuestion[i].q_content,
                  options: {
                    options_content: _arrOption[j].o_value,
                    options_id: _arrOption[j].o_id,
                  },
                  type: _arrQuestion[i].q_type,
                  isRequired: _arrQuestion[i].q_isrequire,
                  description: _arrQuestion[i].q_description,
                  selectMultipleContent: []
                }
                _this.naire.qList.push(obj)
              }
            }
            if (_arrQuestion[i].q_type === "文本") {
              let obj = {
                id: _arrQuestion[i].q_id,
                content: _arrQuestion[i].q_content,
                text: '',
                type: _arrQuestion[i].q_type,
                isRequired: _arrQuestion[i].q_isrequire,
                description: _arrQuestion[i].q_description,
                selectContent: ''
              }
              _this.naire.qList.push(obj)
            }
          }
        }

        _this.naire.qList = _this.naire.qList.map((item, index, arr) => {
          const i = arr.find(_item => item.id === _item.id);
          if (i !== item) {
            if (item.options != null) {
              i.options.push(item.options);
              return undefined;
            }
          } else {
            i.options = [i.options];
            return i;
          }
        }).filter(item => item !== undefined)

        console.log(_this.naire)
      }
    },
    components: {
      voteList
    }
  }
</script>
<style scoped lang="less">
  .view-layout {
    width: 100%;
    height: 100%;
    max-width: 1200px;
    min-height: 100%;
    max-height: 100%;
    padding: 20px 10px;

    .main {
      width: 100%;
      height: auto;
      margin: 0 auto;
      /*padding-bottom: 30px;*/
      background-color: #fff;
      /*box-shadow: 0 2px 5px 1px hsla(0, 0%, 49%, .2);*/
      text-align: left;

      .header {
        padding: 30px 20px;
        height: auto;
        min-height: 33px;
        border-bottom: 2px dotted #eee;

        h1 {
          width: 100%;
          margin: 0 auto;
          text-align: center;
          font-size: 2rem;
          font-weight: bold;
        }
      }

      .content {
        padding: 20px;
        font-size: 14px;
      }

      .footer {
        margin-top: 10px;
        padding-top: 10px;
        text-align: center;
        border-top: 1px dotted #eee;
      }
    }
  }
</style>