<template>
  <div class="view-layout">
    <div class="main">
      <div class="content tj">
        <p>您填写的表单我们已经收到，我们将尽快回复您。<span id="num">{{count}}</span>秒后转至表单</p>
      </div>
    </div>
  </div>
</template>
<script>
  export default {
    data() {
      return {
        count: '' // 倒计时
      }
    },
    created() {
      this.reloadOnce()
    },
    mounted() {
      this.goGrdoupRecor()
    },
    methods: {
      goGrdoupRecor() {
        const TIME_COUNT = 5
        if (!this.timer) {
          this.count = TIME_COUNT
          this.show = false
          this.timer = setInterval(() => {
            if (this.count > 0 && this.count <= TIME_COUNT) {
              this.count--
            } else {
              this.show = true
              clearInterval(this.timer)
              this.timer = null
              console.log('back')
              this.$router.go(-2)
            }
          }, 1000)
        }
      },
      reloadOnce() {
        if (location.href.indexOf('#reloaded') == -1) {
          location.href = location.href + "#reloaded"
          location.reload()
        }
      }
    }
  }
</script>
<style lang="less">
  .tj {
    position: absolute;
    left: 50%;
    bottom: 8%;
    transform: translateX(-50%);

    p {
      font-size: 2.4rem;
      color: #3d16f2;

      span {
        color: #ff0000;
      }
    }
  }
</style>