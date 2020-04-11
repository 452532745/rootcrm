<template>
  <div>
    <div class="goods_type_box">
      <Loading v-if="isLoading"></Loading>
      <div class="control_box">
        <div class="handle_box">
          <el-button icon="el-icon-plus" @click="openAddDialog " round>添加</el-button>
        </div>
      </div>
      <el-table
        ref="filterTable"
        :data="goodsTypeData.slice((currentPage - 1) * pagesize,currentPage * pagesize)"
        style="width: 100%"
        :default-sort="{prop: 'date', order: 'descending'}"
      >
        <el-table-column label="编号 :" prop="goods_type_id" sortable></el-table-column>
        <el-table-column label="商品类型 :" prop="goods_type_name" sortable></el-table-column>
        <el-table-column label="修改时间 :" prop="goods_type_edittime" sortable></el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              circle
              @click="openEditDialog(scope.$index, scope.row)"
            ></el-button>
            <el-button
              icon="el-icon-delete"
              size="mini"
              type="danger"
              circle
              @click="deleteGoodsType(scope.$index, scope.row)"
            ></el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        :hide-on-single-page="value"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="currentPage"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        :total="goodsTypeData.length"
      ></el-pagination>
    </div>
    <el-dialog :title="dialogAddTitle" :visible.sync="dialogVisible" width="600px">
      <el-form ref="goodsTypeForm" :model="goodsTypeForm" label-width="80px">
        <div class="goodsTypeForm">
          <el-form-item label="编号 :" prop="id" v-show="false">
            <el-input v-model="goodsTypeForm.goods_type_id" placeholder></el-input>
          </el-form-item>
          <el-form-item label="商品类型 :" prop="name">
            <el-input v-model="goodsTypeForm.goods_type_name" placeholder></el-input>
          </el-form-item>
          <el-form-item label="修改时间 :" prop="edittime" v-if="dialogAddToggle === false">
            <el-input v-model="goodsTypeForm.goods_type_edittime" :disabled="true" placeholder></el-input>
          </el-form-item>
        </div>
        <el-form-item class="submit-btn">
          <el-button
            type="primary"
            @click="addGoodsType('goodsTypeForm')"
            v-if="dialogAddToggle === true"
            :disabled="finished"
          >确定</el-button>
          <el-button
            type="primary"
            @click="updateGoodsType('goodsTypeForm')"
            v-if="dialogAddToggle === false"
            :disabled="finished"
          >修改</el-button>
          <el-button @click="dialogVisible = false">取 消</el-button>
        </el-form-item>
        <div class="error">{{ err }}</div>
      </el-form>
    </el-dialog>
  </div>
</template>
<script>
import qs from "qs";
import Loading from "@/components/component/loading/loading";
import { formatNotDate, formatDate } from "@/common/js/utils";
export default {
  data() {
    return {
      goodsTypeData: [],
      isLoading: true,
      search: "",
      currentPage: 1,
      pagesize: 10,
      value: true,
      finished: false,
      dialogVisible: false,
      dialogAddTitle: "",
      dialogAddToggle: true,
      goodsTypeForm: {
        goods_type_id: 0,
        goods_type_name: "",
        goods_type_edittime: ""
      },
      err: ""
    };
  },
  created() {
    this.getGoodsType();
  },
  watch: {
    search: {
      handler(newValue, oldValue) {
        let _search = this.search;
        this.goodsTypeData = this.goodsTypeData.filter(
          data =>
            !_search ||
            data.message_title.toLowerCase().includes(_search.toLowerCase()) ||
            data.message_for.toLowerCase().includes(_search.toLowerCase())
        );
      }
    }
  },
  methods: {
    // 获取数据
    getGoodsType() {
      this.handleGet("/goodstype").then(datas => {
        for (let i = 0; i < datas.length; i++) {
          datas[i].goods_type_edittime = formatDate(
            datas[i].goods_type_edittime
          );
        }
        this.goodsTypeData = datas;
        this.isLoading = false;
      });
    },
    // 新增数据弹窗
    openAddDialog() {
      this.dialogAddTitle = "新增类型";
      this.dialogAddToggle = true;
      this.goodsTypeForm = {
        goods_type_id: 0,
        goods_type_name: "",
        goods_type_edittime: ""
      };
      this.dialogVisible = true;
    },
    // 新增数据
    addGoodsType(formName) {
      // 防止重复提交
      this.finished = true;
      let timestamp = new Date().getTime();
      const registData = {
        goods_type_id: this.goodsTypeForm.goods_type_id,
        goods_type_name: this.goodsTypeForm.goods_type_name,
        goods_type_edittime: timestamp
      };
      console.log(registData);
      this.$refs[formName].validate(valid => {
        if (valid) {
          this.$http.post("/goodstype/add", registData).then(
            res => {
              this.$message({
                message: "添加成功",
                type: "success",
                duration: 3000
              });
              this.finished = false;
              this.dialogVisible = false;
              this.getGoodsType();
            },
            err => {
              console.log(err);
              this.finished = false;
            }
          );
        } else {
          alert("请正确填写信息");
          this.finished = false;
        }
      });
    },
    // 修改数据弹窗
    openEditDialog(index, data) {
      this.dialogAddTitle = "修改类型";
      this.dialogAddToggle = false;
      this.goodsTypeForm = {
        goods_type_id: data.goods_type_id,
        goods_type_name: data.goods_type_name,
        goods_type_edittime: data.goods_type_edittime
      };
      console.log(data);
      console.log(this.goodsTypeForm);

      this.dialogVisible = true;
    },
    // 修改数据
    updateGoodsType() {
      let timestamp = new Date().getTime();
      const params = qs.stringify({
        goods_type_id: this.goodsTypeForm.goods_type_id,
        goods_type_name: this.goodsTypeForm.goods_type_name,
        goods_type_edittime: timestamp
      });
      this.$http
        .post("/goodstype/update", params)
        .then(res => {
          console.log(res.data);
          // 影响行数大于0
          if (res.data.err === 0) {
            this.$message({
              message: "修改成功",
              type: "success"
            });
            this.dialogVisible = false;
            this.getGoodsType();
          } else {
            this.$message.error("修改失败，请重试");
          }
        })
        .catch(err => {
          console.log(err);
          this.$message.error("修改失败，请重试");
        });
    },
    // 删除节点
    deleteGoodsType(index, data) {
      this.$confirm("是否删除?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(() => {
          const deleteNode = {
            id: data.goods_type_id
          };
          this.$http.post("/goodstype/delete", deleteNode).then(
            res => {
              this.$message({
                message: "删除成功",
                type: "success",
                duration: 3000
              });
              this.getGoodsType();
            },
            err => {
              console.log(err);
            }
          );
        })
        .catch(() => {
          console.log("取消");
        });
    },
    // 获取函数
    handleGet(url, params) {
      return new Promise((resolve, reject) => {
        this.$http
          .get(url)
          .then(res => {
            if (res.data.err === 0) {
              resolve(res.data.data);
            } else {
              this.$message({
                message: res.data.msg,
                type: "warning",
                duration: 3000
              });
            }
          })
          .catch(err => {
            console.log(err);
            reject(err);
          });
      });
    },
    handleSizeChange: function(size) {
      this.pagesize = size;
      console.log(this.pagesize); //每页下拉显示数据
    },
    handleCurrentChange: function(currentPage) {
      this.currentPage = currentPage;
      console.log(this.currentPage); //点击第几页
    },
    handleChange(value) {
      console.log(value);
    }
  },
  components: {
    Loading
  }
};
</script>
<style lang="less" scoped>
.goods_type_box {
  .control_box {
    overflow: hidden;
    margin-bottom: 20px;
    .search_box {
      float: left;
      .el-input {
        width: 200px;
        height: 35px;
        vertical-align: middle;

        /deep/ .el-input__inner {
          background-color: #2b2e38;
          border-radius: 20px;
          height: 35px;
          line-height: 35px;
        }
      }
      .el-button {
        width: 35px;
        height: 35px;
        line-height: 35px;
        font-size: 26px;
        padding: 0;
        text-align: center;
        vertical-align: middle;
        background: transparent;
        border: 0;
        color: #fff;
      }
    }
    .handle_box {
      text-align: right;
      float: right;
      .el-button {
        padding: 10px 15px;
        border-radius: 8px;
        background-color: #18d576;
        border: 0;
        color: #333;
        /deep/ span {
          font-weight: bold;
          vertical-align: middle;
        }
        /deep/ i {
          font-size: 16px;
          font-weight: bold;
          vertical-align: middle;
        }
      }
    }
  }
  .el-table {
    &::before {
      display: none;
    }
    /deep/ tr {
      background-color: #2b2e38;
      th,
      td {
        border: 0;
        color: #fff;
      }
      th {
        font-size: 16px;
        border: 0;
        color: #fff;
        background-color: #2b2e38;
        padding: 3px 0;
      }
      td {
        padding: 8.5px 0;
        .cell {
          white-space: nowrap;
        }
      }
    }

    /deep/ tr:hover > td {
      color: #2b2e38;
    }

    /deep/ .el-table__row:nth-child(odd) {
      background-color: #252831;
    }
  }

  .el-pagination {
    margin-top: 30px;
    /deep/ .el-input__inner,
    /deep/ .el-pager li,
    /deep/ button {
      background-color: transparent;
      border: 1px solid #fff;
      margin-right: -1px;
      color: #606266;
    }

    /deep/ .el-pager li.active {
      color: #fff;
    }
  }
}
</style>
