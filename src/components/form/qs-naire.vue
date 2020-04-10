<template>
  <div class="view-layout">
    <div class="main">
      <div class="content">
        <transition name="fade">
          <Loading v-if="isLoading"></Loading>
        </transition>
        <questionList :question-list="this.naire.questionList" :n-id="this.naire.n_id"></questionList>
      </div>
    </div>
  </div>
</template>
<script>
  import questionList from '@/components/form/questionList'
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
    mounted(){
      this.isLoading = false
    },
    components: {
      questionList,
      Loading
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

  @media screen and (max-width: 450px) {
    .view-layout {
      width: 100%;
      height: 100%;
      max-width: 750px;
      min-height: 100%;
      max-height: 100%;
      padding: 10px;
      box-sizing: border-box;

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
          font-size: 14px;
          padding: 0;
        }

        .footer {
          margin-top: 10px;
          padding-top: 10px;
          text-align: center;
          border-top: 1px dotted #eee;
        }
      }
    }
  }
</style>