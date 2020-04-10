<template>
  <div>
    <v-header></v-header>
    <div class="qs-report">
      <div class="view-layout">
        <div class="main">
          <div class="header">
            <h1>用户管理</h1>
          </div>
          <div class="content">
            <transition name="fade">
              <loading v-if="isLoading"></loading>
            </transition>
            <el-table
              :data="uDatas.slice((currentPage - 1) * pagesize,currentPage * pagesize)"
              style="width: 100%"
              stripe
            >
              <el-table-column label="姓名" prop="u_name" sortable></el-table-column>
              <el-table-column label="班级" prop="u_class" sortable></el-table-column>
              <el-table-column label="手机" prop="u_phone"></el-table-column>
              <el-table-column label="区域" prop="u_area" sortable></el-table-column>
              <el-table-column label="时间" prop="u_time" sortable></el-table-column>
              <el-table-column label="访问IP" prop="u_position" sortable></el-table-column>
            </el-table>
            <el-pagination
              :hide-on-single-page="value"
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
              :current-page="currentPage"
              :page-sizes="[10, 20, 50, 100]"
              layout="total, sizes, prev, pager, next, jumper"
              :total="uDatas.length"
            ></el-pagination>
          </div>
          <v-footer></v-footer>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import vHeader from "@/components/view/header/header";
import vFooter from "@/components/view/footer/footer";
import Loading from "@/components/component/loading/loading";
import { formatDate, sortByKey } from "@/common/js/utils";

export default {
  data() {
    return {
      uDatas: [],
      isLoading: true,
      currentPage: 1,
      pagesize: 10,
      value: true
    };
  },
  watch: {
    uDatas: {
      handler(newValue, oldValue) {
        for (let i = 0; i < this.uDatas.length; i++) {
          this.uDatas[i].u_time = formatDate(this.uDatas[i].u_time);
        }
      }
    }
  },
  methods: {
    getData() {
      let _this = this;
      //get users datas
      _this.$http.get("/users").then(
        res => {
          _this.uDatas = sortByKey(res.data, "u_time");
          _this.isLoading = false;
        },
        err => {
          console.log(err);
        }
      );
    },
    // 初始页currentPage、初始每页数据数pagesize
    handleSizeChange: function(size) {
      this.pagesize = size;
      console.log(this.pagesize); //每页下拉显示数据
    },
    handleCurrentChange: function(currentPage) {
      this.currentPage = currentPage;
      console.log(this.currentPage); //点击第几页
    }
  },
  mounted() {
    this.getData();
  },
  components: {
    vHeader,
    vFooter,
    Loading
  }
};
</script>
<style scoped lang="less">
.qs-report {
  width: 1200px;
  max-width: 100%;
  margin: 2% auto;

  .main {
    padding-bottom: 2%;
    box-shadow: 0 2px 5px 1px hsla(0, 0%, 49%, 0.2);
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

        [class^="el-icon"] {
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