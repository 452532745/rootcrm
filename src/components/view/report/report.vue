<template>
  <div>
    <v-header></v-header>
    <div class="qs-report">
      <div class="view-layout">
        <div class="main">
          <div class="header" v-show="naire.n_title">
            <h1>{{ naire.n_title }}</h1>
            <p class="isPublish yes" v-if="naire.n_status === 1"><i>已发布</i></p>
            <p class="isPublish no" v-else><i>未发布</i></p>
            <p class="publishTime">创建日期：{{ naire.n_creattime | timeFormat }} | 截止日期：{{ naire.n_deadline | timeFormat
              }}</p>
          </div>
          <div class="content">
            <transition name="fade">
              <loading v-if="isLoading"></loading>
            </transition>
            <div class="handleWrap">
              <span class="newCount" v-show="newCount">
                <i class="el-icon-warning"></i>
                <i>新用户 <b>{{ newCount }}</b> 人</i>
              </span>
              <span class="updateCount" @click="updateCount()">
                <i class="el-icon-refresh" title="刷新一下"></i>
                <i>刷新一下</i>
              </span>
            </div>
            <el-table :data="totalList.slice((currentPage-1) * pagesize,currentPage * pagesize)" style="width: 100%" stripe>
              <el-table-column type="expand" v-if="naire.isNaire">
                <template slot-scope="props">
                  <el-form label-position="left" inline class="demo-table-expand" v-for="item in props.row.userSelect"
                           :key="item.userName">
                    <el-form-item label="题目">
                      <span>{{ item.q_id }}</span>
                      <span>[{{ item.q_type }}]</span>
                    </el-form-item>
                    <el-form-item label="选项">
                      <span>{{ item.o_id }}</span>
                    </el-form-item>
                  </el-form>
                </template>
              </el-table-column>
              <el-table-column label="姓名" prop="u_name" sortable></el-table-column>
              <el-table-column label="班级" prop="u_class" sortable></el-table-column>
              <el-table-column label="手机" prop="u_phone"></el-table-column>
              <el-table-column label="区域" prop="u_area" sortable></el-table-column>
              <el-table-column label="时间" prop="u_time" sortable></el-table-column>
              <el-table-column label="访问IP" prop="u_position" sortable></el-table-column>
            </el-table>
            <el-pagination :hide-on-single-page="value" @size-change="handleSizeChange"
                           @current-change="handleCurrentChange"
                           :current-page="currentPage" :page-sizes="[10, 20, 50, 100]"
                           layout="total, sizes, prev, pager, next, jumper"
                           :total="totalList.length"></el-pagination>
          </div>
          <v-footer></v-footer>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
  import vHeader from '@/components/view/header/header'
  import vFooter from '@/components/view/footer/footer'
  import Loading from '@/components/component/loading/loading'
  import {formatDate, sortByKey} from '@/common/js/utils'

  export default {
    inject: ['reload'],
    data() {
      return {
        newCount: 0,
        copyCount: 0,
        refreshCount: 0,
        naire: {},
        isLoading: true,
        totalList:[],
        currentPage: 1,
        pagesize: 10,
        value: true
      }
    },
    filters: {
      timeFormat(value) {
        return formatDate(value)
      }
    },
    methods: {
      // 统计数据
      getReportDatas() {
        const nId = this.$route.query.nid
        // 判断nid
        if (!nId) {
          this.$message.error('出错了，请刷新页面重试！')
          return
        }
        // 获取统计数据
        this.$http.get('/naire/report', {
          params: {
            nId: nId
          }
        }).then((response) => {
          this.naire = response.data
          this.naire.userList = sortByKey(this.naire.userList, 'u_time')
          this.totalList = this.naire.userList
          this.isLoading =false
          this.newCount = this.naire.userList.length - this.naire.r_len
          if (!this.refreshCount) {
            this.notice()
          } else {
            console.log("刷新：" + this.refreshCount + "次")
            this.longPolling()
          }
        }, (err) => {
          console.log(err)
        })
      },
      // 长轮询
      longPolling() {
        const timer = setTimeout(() => {
          this.notice()
          this.refreshCount++
        }, 60000)
        // 通过$once来监听定时器，在beforeDestroy钩子可以被清除。
        this.$once('hook:beforeDestroy', () => {
          clearTimeout(timer)
        })
      },
      // 刷新页面
      notice() {
        let _this = this
        let nid = _this.$route.query.nid

        if (!_this.refreshCount) {
          _this.refreshCount++
          _this.longPolling()
        } else {
          _this.getReportDatas()
          if (_this.newCount > _this.copyCount) {
            _this.audio = new Audio()
            this.$notify.info({
              title: '消息提醒',
              message: '新用户' + _this.newCount + '人',
              duration: 120000
            })
            _this.audio.src = './static/audio/ts.mp3'
            _this.audio.play()
            console.log('提示音:新用户提醒~')
          }
        }
        _this.copyCount = _this.newCount > 0 ? _this.newCount : 0
      },
      updateCount() {
        if (this.newCount) {
          this.$http.post('/changeCount', {
            id: this.naire.n_id,
            count: this.naire.userList.length ? this.naire.userList.length : 0
          }).then((response) => {
            this.newCount = 0
            this.reload()
            this.$notify({
              title: '更新数据成功',
              type: 'success'
            })
          }, (err) => {
            console.log(err)
          })
        } else {
          this.$notify.error({
            title: '无需刷新'
          })
        }
      },
      // 初始页currentPage、初始每页数据数pagesize
      handleSizeChange: function (size) {
        this.pagesize = size;
        console.log(this.pagesize)  //每页下拉显示数据
      },
      handleCurrentChange: function (currentPage) {
        this.currentPage = currentPage;
        console.log(this.currentPage)  //点击第几页
      }
    },
    created() {
      this.getReportDatas()
    },
    components: {
      vHeader,
      vFooter,
      Loading
    }
  }
</script>
<style scoped lang="less">
  .qs-report {
    width: 1200px;
    max-width: 100%;
    margin: 2% auto;

    .main {
      padding-bottom: 2%;
      box-shadow: 0 2px 5px 1px hsla(0, 0%, 49%, .2);
    }

    .header {
      padding: 2%;
      border-bottom: 2px dotted #eee;
      margin-bottom: 2%;

      h1 {
        font-size: 3rem;
        line-height: 150%;
        color: #657180;
      }

      p {
        margin-top: 0.5%;
      }

      .isPublish {
        i {
          display: inline-block;
          font-size: 1.2rem;
          font-style: normal;
          line-height: 180%;
          padding: 0 8px;
          border-radius: 3px;
          border: 1px solid #333;
        }

        &.yes {
          i {
            color: #0c6;
            border-color: #0c6;
          }
        }

        &.no {
          i {
            color: #f30;
            border-color: #f30;
          }
        }
      }

      .publishTime {
        line-height: 150%;
      }
    }

    .content {
      position: relative;
      padding: 0 3%;

      .handleWrap {
        text-align: right;

        span {
          margin-right: 1%;
          cursor: pointer;

          i {
            display: inline-block;
            vertical-align: middle;
            font-size: 1.4rem;
            margin-left: 5px;
            font-style: normal;
          }

          [class ^= "el-icon"] {
            font-size: 2.2rem;
          }

          &:hover {
            .el-icon-refresh {
              transform: rotate(360deg);
              transition: all 0.8s ease-out;
            }
          }

        }

        .newCount {
          i {
            color: #ff0000;
          }
        }
      }

      .demo-table-expand {
        font-size: 0;

        label {
          width: 90px;
          color: #99a9bf;
        }

        .el-form-item {
          margin-right: 0;
          margin-bottom: 0;
          width: 50%;
        }
      }
    }

    .el-pagination {
      margin-top: 5%;
    }
  }
</style>