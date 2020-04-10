<template>
  <div class="homeMain">
    <v-header></v-header>
    <div class="qs-list">
      <h1>定制表单</h1>
      <transition name="fade">
        <loading v-if="isLoading"></loading>
      </transition>
      <el-row class="qs-wrap" :gutter="20">
        <el-col :span="6" tag="li" v-for="item in naire" :key="item.n_id">
          <div class="wrap" v-if="item.n_id == 16">
            <h3>{{ item.n_title }}</h3>
            <div class="start_time">{{ item.n_creattime | timeFormat }} 天前</div>
            <div class="state count">{{ item.r_len }} 份数据</div>
            <div class="state collect" v-if="item.n_status">收集中</div>
            <div class="state close" v-else>未收集</div>
            <div class="operate_bar">
              <router-link :to="'/info6?nid=' + item.n_id">
                <i class="el-icon-link"></i>
                <p>预览</p>
              </router-link>
              <a @click="publishStatus(item.n_id)" v-if="item.n_status">
                <i class="el-icon-s-promotion"></i>
                <p>停止</p>
              </a>
              <a @click="unPublishStatus(item.n_id)" v-else>
                <i class="el-icon-s-promotion"></i>
                <p>发布</p>
              </a>
              <router-link :to="'/report?nid=' + item.n_id">
                <i class="el-icon-data-analysis"></i>
                <p>数据</p>
              </router-link>
            </div>
          </div>
          <div class="wrap" v-if="item.n_id == 17">
            <h3>{{ item.n_title }}</h3>
            <div class="start_time">{{ item.n_creattime | timeFormat }} 天前</div>
            <div class="state count">{{ item.r_len }} 份数据</div>
            <div class="state collect" v-if="item.n_status">收集中</div>
            <div class="state close" v-else>未收集</div>
            <div class="operate_bar">
              <router-link :to="'/info5?nid=' + item.n_id">
                <i class="el-icon-link"></i>
                <p>预览</p>
              </router-link>
              <a @click="publishStatus(item.n_id)" v-if="item.n_status">
                <i class="el-icon-s-promotion"></i>
                <p>停止</p>
              </a>
              <a @click="unPublishStatus(item.n_id)" v-else>
                <i class="el-icon-s-promotion"></i>
                <p>发布</p>
              </a>
              <router-link :to="'/report?nid=' + item.n_id">
                <i class="el-icon-data-analysis"></i>
                <p>数据</p>
              </router-link>
            </div>
          </div>
          <div class="wrap" v-if="item.n_id == 18">
            <h3>{{ item.n_title }}</h3>
            <div class="start_time">{{ item.n_creattime | timeFormat }} 天前</div>
            <div class="state count">{{ item.r_len }} 份数据</div>
            <div class="state collect" v-if="item.n_status">收集中</div>
            <div class="state close" v-else>未收集</div>
            <div class="operate_bar">
              <router-link :to="'/info4?nid=' + item.n_id">
                <i class="el-icon-link"></i>
                <p>预览</p>
              </router-link>
              <a @click="publishStatus(item.n_id)" v-if="item.n_status">
                <i class="el-icon-s-promotion"></i>
                <p>停止</p>
              </a>
              <a @click="unPublishStatus(item.n_id)" v-else>
                <i class="el-icon-s-promotion"></i>
                <p>发布</p>
              </a>
              <router-link :to="'/report?nid=' + item.n_id">
                <i class="el-icon-data-analysis"></i>
                <p>数据</p>
              </router-link>
            </div>
          </div>
          <div class="wrap" v-if="item.n_id == 19">
            <h3>{{ item.n_title }}</h3>
            <div class="start_time">{{ item.n_creattime | timeFormat }} 天前</div>
            <div class="state count">{{ item.r_len }} 份数据</div>
            <div class="state collect" v-if="item.n_status">收集中</div>
            <div class="state close" v-else>未收集</div>
            <div class="operate_bar">
              <router-link :to="'/info3?nid=' + item.n_id">
                <i class="el-icon-link"></i>
                <p>预览</p>
              </router-link>
              <a @click="publishStatus(item.n_id)" v-if="item.n_status">
                <i class="el-icon-s-promotion"></i>
                <p>停止</p>
              </a>
              <a @click="unPublishStatus(item.n_id)" v-else>
                <i class="el-icon-s-promotion"></i>
                <p>发布</p>
              </a>
              <router-link :to="'/report?nid=' + item.n_id">
                <i class="el-icon-data-analysis"></i>
                <p>数据</p>
              </router-link>
            </div>
          </div>
          <div class="wrap" v-if="item.n_id == 20">
            <h3>{{ item.n_title }}</h3>
            <div class="start_time">{{ item.n_creattime | timeFormat }} 天前</div>
            <div class="state count">{{ item.r_len }} 份数据</div>
            <div class="state collect" v-if="item.n_status">收集中</div>
            <div class="state close" v-else>未收集</div>
            <div class="operate_bar">
              <router-link :to="'/info?nid=' + item.n_id">
                <i class="el-icon-link"></i>
                <p>预览</p>
              </router-link>
              <a @click="publishStatus(item.n_id)" v-if="item.n_status">
                <i class="el-icon-s-promotion"></i>
                <p>停止</p>
              </a>
              <a @click="unPublishStatus(item.n_id)" v-else>
                <i class="el-icon-s-promotion"></i>
                <p>发布</p>
              </a>
              <router-link :to="'/report?nid=' + item.n_id">
                <i class="el-icon-data-analysis"></i>
                <p>数据</p>
              </router-link>
            </div>
          </div>
          <div class="wrap" v-if="item.n_id == 21">
            <h3>{{ item.n_title }}</h3>
            <div class="start_time">{{ item.n_creattime | timeFormat }} 天前</div>
            <div class="state count">{{ item.r_len }} 份数据</div>
            <div class="state collect" v-if="item.n_status">收集中</div>
            <div class="state close" v-else>未收集</div>
            <div class="operate_bar">
              <router-link :to="'/info2?nid=' + item.n_id">
                <i class="el-icon-link"></i>
                <p>预览</p>
              </router-link>
              <a @click="publishStatus(item.n_id)" v-if="item.n_status">
                <i class="el-icon-s-promotion"></i>
                <p>停止</p>
              </a>
              <a @click="unPublishStatus(item.n_id)" v-else>
                <i class="el-icon-s-promotion"></i>
                <p>发布</p>
              </a>
              <router-link :to="'/report?nid=' + item.n_id">
                <i class="el-icon-data-analysis"></i>
                <p>数据</p>
              </router-link>
            </div>
          </div>
          <div class="wrap" v-if="item.n_id == 22">
            <h3>{{ item.n_title }}</h3>
            <div class="start_time">{{ item.n_creattime | timeFormat }} 天前</div>
            <div class="state count">{{ item.r_len }} 份数据</div>
            <div class="state collect" v-if="item.n_status">收集中</div>
            <div class="state close" v-else>未收集</div>
            <div class="operate_bar">
              <router-link :to="'/naire?nid=' + item.n_id">
                <i class="el-icon-link"></i>
                <p>预览</p>
              </router-link>
              <a @click="publishStatus(item.n_id)" v-if="item.n_status">
                <i class="el-icon-s-promotion"></i>
                <p>停止</p>
              </a>
              <a @click="unPublishStatus(item.n_id)" v-else>
                <i class="el-icon-s-promotion"></i>
                <p>发布</p>
              </a>
              <router-link :to="'/report?nid=' + item.n_id">
                <i class="el-icon-data-analysis"></i>
                <p>数据</p>
              </router-link>
            </div>
          </div>
          <div class="wrap" v-if="item.n_id == 23">
            <h3>{{ item.n_title }}</h3>
            <div class="start_time">{{ item.n_creattime | timeFormat }} 天前</div>
            <div class="state count">{{ item.r_len }} 份数据</div>
            <div class="state collect" v-if="item.n_status">收集中</div>
            <div class="state close" v-else>未收集</div>
            <div class="operate_bar">
              <router-link :to="'/evalu?nid=' + item.n_id">
                <i class="el-icon-link"></i>
                <p>预览</p>
              </router-link>
              <a @click="publishStatus(item.n_id)" v-if="item.n_status">
                <i class="el-icon-s-promotion"></i>
                <p>停止</p>
              </a>
              <a @click="unPublishStatus(item.n_id)" v-else>
                <i class="el-icon-s-promotion"></i>
                <p>发布</p>
              </a>
              <router-link :to="'/report?nid=' + item.n_id">
                <i class="el-icon-data-analysis"></i>
                <p>数据</p>
              </router-link>
            </div>
          </div>
        </el-col>
      </el-row>
    </div>
  </div>
</template>
<script>
  import vHeader from '@/components/view/header/header'
  import Loading from '@/components/component/loading/loading'
  import {beforeTime} from '@/common/js/utils'

  export default {
    inject: ["reload"],
    data() {
      return {
        naire: {},
        isLoading: true
      }
    },
    created() {
      this.getList();
    },
    filters: {
      timeFormat(value) {
        return beforeTime(value)
      }
    },
    methods: {
      getList() {
        this.$http.get('/naire').then((res) => {
          this.naire = res.data
          this.isLoading = false
        }, (err) => {
          console.log(err)
        })
      },
      publishStatus(id) {
        this.$http.post('/publishStatus', {
          id: id,
          status: 0
        }).then((res) => {
          this.reload()
          this.$notify({
            title: '更新数据成功',
            type: 'success'
          })
        })
      },
      unPublishStatus(id) {
        this.$http.post('/publishStatus', {
          id: id,
          status: 1
        }).then((res) => {
          this.reload()
          this.$notify({
            title: '更新数据成功',
            type: 'success'
          })
        })
      },
    },
    components: {
      vHeader,
      Loading
    }
  }
</script>
<style scoped lang="less">
  .qs-list {
    position: relative;
    width: 1200px;
    max-width: 100%;
    margin: 3% auto 0;

    li {
      position: relative;
      padding: 10px;

      .wrap {
        position: relative;
        border: 2px solid #dcdcdc;
        height: 160px;
        padding: 15px;
        box-sizing: border-box;
        overflow: hidden;
        background: #fff;
        border-radius: 5px;
        box-shadow: 0px 0px 6px #dcdcdc;
        text-align: left;
        font-size: 14px;
      }

      h3 {
        font-size: 16px;
        color: #333;
      }

      .start_time {
        display: block;
        color: #adadad;
        margin-top: 5px;
        text-align: left;
      }

      .state {
        position: absolute;
        transition: 0.2s;

        &:before {
          content: '';
          position: absolute;
          display: block;
          width: 6px;
          height: 6px;
          border-radius: 50%;
          left: 0;
          top: 50%;
          transform: translateY(-50%);

        }

        &.count {
          left: 15px;
          bottom: 25px;
          color: #aaa;
        }

        &.collect {
          right: 35px;
          bottom: 25px;
          padding-left: 15px;
          color: #68bb47;

          &:before {
            background-color: #68bb47;
            box-shadow: 0 0 4px 0 #68bb47;
          }
        }

        &.close {
          right: 35px;
          bottom: 25px;
          padding-left: 15px;
          color: #FFBE3A;

          &:before {
            background-color: #FFBE3A;
            box-shadow: 0 0 4px 0 #FFBE3A;
          }
        }
      }

      .operate_bar {
        position: absolute;
        left: 15px;
        bottom: 12px;
        opacity: 0;
        transition: 0.2s;

        a {
          display: inline-block;
          text-align: center;
          font-size: 14px;
          margin-right: 25px;
          transition: 0.2s;
          cursor: pointer;

          i {
            font-size: 26px;
          }
        }
      }

      &:hover, &.active {
        .wrap {
          border: 2px solid #2672ff;
          box-shadow: 0px 0px 5px #838383;
        }

        .state {
          opacity: 0;
        }

        .operate_bar {
          opacity: 1;

          a:hover {
            color: #2672ff;
          }
        }
      }
    }

    > h1 {
      font-size: 2.4rem;
      text-align: left;
      border-bottom: 1px dashed #DCDFE6;
      padding-bottom: 15px;
      margin-bottom: 15px;
    }

    .el-divider {
      margin: 4% 0;
    }
  }
</style>