<template>
  <div class="view-layout">
    <div class="main">
      <div class="header">
        <h1>{{naire.n_title}}</h1>
      </div>
      <div class="content">
        <transition name="fade">
          <Loading v-if="isLoading"></Loading>
        </transition>
        <div class="intro">{{naire.n_intro}}</div>
        <questionListE :question-list="this.naire.questionList" :n-id="this.naire.n_id"></questionListE>
      </div>
    </div>
  </div>
</template>
<script>
  import questionListE from '@/components/form/questionListE'
  import Loading from '@/components/component/loading/loading'

  export default {
    data() {
      return {
        naire: {},
        isLoading: true
      }
    },
    watch: {
      // 路由变化再次执行
      '$route': 'fetchData'
    },
    methods: {
      fetchData() {
        const nId = this.$route.query.nid
        // 判断nid
        if (!nId) {
          this.$message.error('出错了，请刷新页面重试！')
          return
        }

        this.$store.dispatch('getNaire', {
          n_id: nId
        }).then((response) => {
          if (response.data.err === 0) {
            this.$store.commit('REQUEST_QUESTION_LIST', {
              naire: response.data
            })
            // 通过 JSON 序列化将数组不再为引用，避免出现在 store 外修改 state 的内容
            this.naire = response.data
            this.isLoading = false
            console.log(this.naire)
          } else {
            this.$message.error(response.data)
            this.$router.push('/404')
          }
        }).catch((error) => {
          console.log(error)
          this.$message.error('网络错误，请稍后重试')
        })
      }
    },
    created() {
      this.fetchData()
    },
    mounted() {
      this.isLoading = false
    },
    components: {
      questionListE,
      Loading
    }
  }
</script>
<style scoped lang="less">
  .view-layout {
    width: 100%;
    height: 100%;
    max-width: 1000px;
    min-height: 100%;
    max-height: 100%;
    padding: 20px 10px;
    box-sizing: border-box;

    .main {
      width: 100%;
      height: auto;
      margin: 0 auto;
      background-color: #fff;
      text-align: left;

      .header {
        color: #4ba5d1;
        font-size: 20px;
        height: 60px;
        line-height: 60px;
        padding-left: 30px;
        border-bottom: 3px solid #b5b5b5;
      }

      .content {
        min-height: 10px;
        border: 4px solid #f1f1f1;
        background: #fff;
        margin-top: 15px;
        border-radius: 8px;
        padding: 0 5% 5%;
        font-size: 16px;

        .intro {
          position: relative;
          color: #666;
          line-height: 32px;
          padding: 5% 0 3%;
          border-bottom: 1px dotted #efefef;
          overflow: hidden;
          text-indent: 32px;
          font-size: 16px;
        }
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