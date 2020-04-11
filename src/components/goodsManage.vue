<template>
  <div>
    <div class="goods_box">
      <Loading v-if="isLoading"></Loading>
      <div class="control_box">
        <div class="handle_box">
          <el-button icon="el-icon-plus" @click="openAddDialog " round>添加</el-button>
        </div>
      </div>
      <el-table
        ref="filterTable"
        :data="goodsData.slice((currentPage - 1) * pagesize,currentPage * pagesize)"
        style="width: 100%"
        :default-sort="{prop: 'goods_type_id', order: 'descending'}"
      >
        <el-table-column label="商品编号:" prop="goods_code" sortable></el-table-column>
        <el-table-column label="商品类型:" prop="goods_type_id" sortable></el-table-column>
        <el-table-column label="商品名称:" prop="goods_name" sortable></el-table-column>
        <el-table-column label="商品条形码:" prop="goods_barcode" sortable></el-table-column>
        <el-table-column label="容量:" prop="goods_capacity" sortable></el-table-column>
        <el-table-column label="商品售价:" prop="goods_price" sortable></el-table-column>
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
              @click="deleteGoods(scope.$index, scope.row)"
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
        :total="goodsData.length"
      ></el-pagination>
    </div>
    <el-dialog :title="dialogAddTitle" :visible.sync="dialogVisible" width="600px">
      <el-form ref="goodsForm" :model="goodsForm" label-width="80px">
        <div class="goodsForm">
          <el-tabs v-model="activeName" @tab-click="handleClick">
            <el-tab-pane label="商品详情" name="1">
              <el-form-item label="商品id :" prop="id" v-show="false">
                <el-input v-model="goodsForm.goods_id" placeholder></el-input>
              </el-form-item>
              <el-form-item label="商品类型 :" prop="type_id">
                <el-select v-model="options[0].value" placeholder="请选择">
                  <el-option
                    v-for="item in options"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  ></el-option>
                </el-select>
              </el-form-item>
              <el-form-item label="产品名称 :" prop="name">
                <el-input v-model="goodsForm.goods_name" placeholder></el-input>
              </el-form-item>
              <el-form-item label="产品编号 :" prop="code">
                <el-input v-model="goodsForm.goods_code" placeholder></el-input>
              </el-form-item>
              <el-form-item label="条形码 :" prop="barcode">
                <el-input v-model="goodsForm.goods_barcode" placeholder></el-input>
              </el-form-item>
              <el-form-item label="商品售价 :" prop="price">
                <el-input v-model="goodsForm.goods_price" placeholder></el-input>
              </el-form-item>
            </el-tab-pane>
            <el-tab-pane label="商品状态" name="2">
              <el-form-item label="计量单位 :" prop="unit">
                <el-input v-model="goodsForm.goods_unit" placeholder></el-input>
              </el-form-item>
              <el-form-item label="商品容量 :" prop="capacity">
                <el-input v-model="goodsForm.goods_capacity" placeholder></el-input>
              </el-form-item>
              <el-form-item label="上架时间 :" prop="creattime">
                <el-input v-model="goodsForm.goods_creattime" :disabled="true" placeholder></el-input>
              </el-form-item>
              <el-form-item label="下架时间 :" prop="deadline">
                <el-input v-model="goodsForm.goods_deadline" :disabled="true" placeholder></el-input>
              </el-form-item>
              <el-form-item label="商品折扣 :" prop="discount">
                <el-input v-model="goodsForm.goods_discount" placeholder></el-input>
              </el-form-item>
            </el-tab-pane>
          </el-tabs>
        </div>
        <el-form-item class="submit-btn">
          <el-button
            type="primary"
            @click="addGoods('goodsForm')"
            v-if="dialogAddToggle === true"
            :disabled="finished"
          >确定</el-button>
          <el-button
            type="primary"
            @click="updateGoods('goodsForm')"
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
      goodsData: [],
      isLoading: true,
      search: "",
      currentPage: 1,
      pagesize: 10,
      value: true,
      finished: false,
      activeName: "1",
      dialogVisible: false,
      dialogAddTitle: "",
      dialogAddToggle: true,
      goodsForm: {
        goods_id: 0,
        goods_code: "",
        goods_barcode: "",
        goods_name: "",
        goods_type_id: 0,
        goods_unit: "",
        goods_capacity: "",
        goods_price: "",
        goods_discount: "",
        goods_creattime: "",
        goods_deadline: ""
      },
      options: [
        {
          value: "0",
          label: "多肽系列"
        },
        {
          value: "1",
          label: "米卡姿系列"
        },
        {
          value: "2",
          label: "膜攸系列"
        }
      ],
      err: ""
    };
  },
  created() {
    this.getGoods();
  },
  watch: {
    search: {
      handler(newValue, oldValue) {
        let _search = this.search;
        this.goodsData = this.goodsData.filter(
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
    getGoods() {
      this.handleGet("/goods").then(datas => {
        for (let i = 0; i < datas.length; i++) {
          datas[i].goods_creattime = formatDate(datas[i].goods_creattime);
        }
        this.goodsData = datas;
        console.log(this.goodsData);
        this.isLoading = false;
      });
      this.handleGet("/goodstype").then(datas => {
        for (let i = 0; i < datas.length; i++) {
          datas[i].value = String(datas[i].goods_type_id);
          datas[i].label = datas[i].goods_type_name;
        }
        this.options = datas;
        console.log(this.options);
      });
    },
    // 新增数据弹窗
    openAddDialog() {
      this.dialogAddTitle = "新增商品";
      this.dialogAddToggle = true;
      this.goodsForm = {
        goods_id: 0,
        goods_code: "",
        goods_barcode: "",
        goods_name: "",
        goods_type_id: 0,
        goods_unit: "",
        goods_capacity: "",
        goods_price: "",
        goods_discount: "",
        goods_creattime: "",
        goods_deadline: ""
      };
      this.dialogVisible = true;
    },
    // 新增数据
    addGoods(formName) {
      // 防止重复提交
      this.finished = true;
      let timestamp = new Date().getTime();
      const registData = {
        goods_id: this.goodsForm.goods_id,
        goods_code: this.goodsForm.goods_code,
        goods_barcode: this.goodsForm.goods_barcode,
        goods_name: this.goodsForm.goods_name,
        goods_type_id: this.goodsForm.goods_type_id,
        goods_unit: this.goodsForm.goods_unit,
        goods_capacity: this.goodsForm.goods_capacity,
        goods_price: this.goodsForm.goods_price,
        goods_discount: this.goodsForm.goods_discount,
        goods_creattime: timestamp,
        goods_deadline: this.goodsForm.goods_deadline
      };
      console.log(registData);
      this.$refs[formName].validate(valid => {
        if (valid) {
          this.$http.post("/goods/add", registData).then(
            res => {
              this.$message({
                message: "添加成功",
                type: "success",
                duration: 3000
              });
              this.finished = false;
              this.dialogVisible = false;
              this.getGoods();
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
      this.dialogAddTitle = "修改通知";
      this.dialogAddToggle = false;
      this.goodsForm = {
        goods_id: data.goods_id,
        goods_code: data.goods_code,
        goods_barcode: data.goods_barcode,
        goods_name: data.goods_name,
        goods_type_id: data.goods_type_id,
        goods_unit: data.goods_unit,
        goods_capacity: data.goods_capacity,
        goods_price: data.goods_price,
        goods_discount: data.goods_discount,
        goods_creattime: data.goods_creattime,
        goods_deadline: data.goods_deadline
      };
      console.log(this.goodsForm);

      this.dialogVisible = true;
    },
    // 修改数据
    updateGoods() {
      const params = qs.stringify({
        goods_id: this.goodsForm.goods_id,
        goods_code: this.goodsForm.goods_code,
        goods_barcode: this.goodsForm.goods_barcode,
        goods_name: this.goodsForm.goods_name,
        goods_type_id: this.goodsForm.goods_type_id,
        goods_unit: this.goodsForm.goods_unit,
        goods_capacity: this.goodsForm.goods_capacity,
        goods_price: this.goodsForm.goods_price,
        goods_discount: this.goodsForm.goods_discount
      });
      console.log(params);
      this.$http
        .post("/goods/update", params)
        .then(res => {
          console.log(res.data);
          // 影响行数大于0
          if (res.data.err === 0) {
            this.$message({
              message: "修改成功",
              type: "success"
            });
            this.dialogVisible = false;
            this.getGoods();
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
    deleteGoods(index, data) {
      this.$confirm("是否删除?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(() => {
          const deleteNode = {
            id: data.goods_id
          };
          this.$http.post("/goods/delete", deleteNode).then(
            res => {
              this.$message({
                message: "删除成功",
                type: "success",
                duration: 3000
              });
              this.getGoods();
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
    },
    handleClick(tab, event) {
      console.log(tab, event);
    }
  },
  components: {
    Loading
  }
};
</script>
<style lang="less" scoped>
.goods_box {
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
        font-size: 14px;
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
