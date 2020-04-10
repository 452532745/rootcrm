<template>
  <div>
    <div class="issuing">
      <div class="control_box">
        <!-- <div class="search_box">
          <el-input v-model="search" size="mini" placeholder="请输入昵称或账号搜索" />
          <el-button
            size="mini"
            icon="el-icon-refresh"
            @click="handleRefresh(scope.$index, scope.row)"
            circle
          ></el-button>
        </div> -->
        <div class="handle_box">
          <el-button icon="el-icon-plus" @click="openAddDialog " round>添加</el-button>
        </div>
      </div>
      <el-table
        ref="filterTable"
        :data="issuingData.slice((currentPage - 1) * pagesize,currentPage * pagesize)"
        style="width: 100%"
        :default-sort="{prop: 'date', order: 'descending'}"
      >
        <el-table-column label="登录账号" prop="issuing_number" sortable></el-table-column>
        <el-table-column label="账号类型" prop="issuing_type" sortable></el-table-column>
        <el-table-column label="使用状态" prop="issuing_status" sortable></el-table-column>
        <el-table-column label="销售客服" prop="user_name" sortable></el-table-column>
        <el-table-column label="备注" prop="issuing_remarks" sortable></el-table-column>
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
              type="info"
              icon="el-icon-user"
              size="mini"
              circle
              @click="openSetDialog(scope.$index, scope.row)"
              v-if="permission < 2"
            ></el-button>
            <el-button
              icon="el-icon-delete"
              size="mini"
              type="danger"
              circle
              @click="deleteIssuing(scope.$index, scope.row)"
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
        :total="issuingData.length"
      ></el-pagination>
    </div>
    <el-dialog :title="dialogAddTitle" :visible.sync="dialogAddVisible" width="600px">
      <el-form ref="issuingForm" :model="issuingForm" :rules="issuingFormRule" label-width="120px">
        <div class="issuingForm">
          <el-form-item label="编号 :" prop="issuing_id" v-if="false">
            <el-input v-model="issuingForm.issuing_id" :disabled="true" placeholder></el-input>
          </el-form-item>
          <el-form-item label="账号类型 :" prop="issuing_type">
            <el-select v-model="issuingForm.issuing_type" placeholder="请选择">
              <el-option
                v-for="item in options"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              ></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="登录帐号 :" prop="issuing_number">
            <el-input v-model="issuingForm.issuing_number" placeholder></el-input>
          </el-form-item>
          <el-form-item label="登录密码 :" prop="issuing_password">
            <el-input v-model="issuingForm.issuing_password" placeholder></el-input>
          </el-form-item>
          <el-form-item label="备注 :" prop="issuing_remarks">
            <el-input type="textarea" v-model="issuingForm.issuing_remarks" placeholder></el-input>
          </el-form-item>
        </div>
        <el-form-item class="submit-btn">
          <el-button
            type="primary"
            @click="addIssuing('issuingForm')"
            v-if="dialogAddToggle === true"
            :disabled="finished"
          >确定</el-button>
          <el-button
            type="primary"
            @click="updateIssuing('issuingForm')"
            v-if="dialogAddToggle === false"
            :disabled="finished"
          >修改</el-button>
          <el-button @click="dialogAddVisible = false">取 消</el-button>
        </el-form-item>
        <div class="error">{{ err }}</div>
      </el-form>
    </el-dialog>
    <el-dialog title="选择用户" :visible.sync="dialogChooseVisible" width="600px">
      <div class="search_box">
        <!-- <el-button type="danger" icon="el-icon-delete" circle @click="updateClear"></el-button> -->
        <el-input v-model="listSearch" size="mini" placeholder="请输入昵称或账号搜索" />
      </div>
      <div class="list_box">
        <el-table
          ref="filterTable"
          :data="usersDatas"
          style="width: 100%"
          :default-sort="{prop: 'user_code', order: 'descending'}"
        >
          <el-table-column label="账号" prop="user_code" sortable></el-table-column>
          <el-table-column label="昵称" prop="user_name" sortable></el-table-column>
          <el-table-column label="职位" prop="user_post" sortable></el-table-column>
          <el-table-column label="状态" prop="user_state" sortable></el-table-column>
          <el-table-column label="部门" prop="department_id" sortable></el-table-column>
          <el-table-column label="操作">
            <template slot-scope="scope">
              <el-button
                type="primary"
                icon="el-icon-edit"
                size="mini"
                circle
                @click="updateSet(scope.$index, scope.row)"
              ></el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import qs from "qs";
import { formatNotDate, formatDate } from "@/common/js/utils";
export default {
  data() {
    return {
      issuingData: [],
      usersDatas: [],
      search: "",
      listSearch: "",
      useStatus: 1,
      currentPage: 1,
      pagesize: 10,
      value: true,
      finished: false,
      dialogAddVisible: false,
      dialogChooseVisible: false,
      isCode: false,
      dialogAddTitle: "",
      dialogAddToggle: true,
      departmentDatas: [],
      issuingForm: {
        issuing_id: 0,
        issuing_type: "",
        issuing_number: "",
        issuing_password: "",
        issuing_remarks: "",
        issuing_status: "",
        issuing_creattime: "",
        user_id: "",
        user_name: "",
        department_id: ""
      },
      options: [
        {
          value: "wechat",
          label: "微信号"
        }
      ],
      setData: {},
      exportList: [],
      issuingFormRule: {
        issuing_type: [{ required: true, message: "必填项", trigger: "blur" }],
        issuing_number: [
          { required: true, message: "必填项", trigger: "blur" }
        ],
        issuing_password: [
          { required: true, message: "必填项", trigger: "blur" }
        ],
        issuing_remarks: [
          { required: true, message: "必填项", trigger: "blur" }
        ]
      },
      permission: 10,
      user_id: 0,
      err: ""
    };
  },
  created() {
    this.getIssuing();
  },
  watch: {
    search: {
      handler(newValue, oldValue) {
        let _search = this.search;
        this.issuingData = this.issuingData.filter(
          data =>
            !_search ||
            data.issuing_number.toLowerCase().includes(_search.toLowerCase())
        );
      }
    },
    listSearch: {
      handler(newValue, oldValue) {
        let _listSearch = this.listSearch;
        this.usersDatas = this.usersDatas.filter(
          data =>
            !_listSearch ||
            data.user_name.toLowerCase().includes(_listSearch.toLowerCase()) ||
            data.user_code.toLowerCase().includes(_listSearch.toLowerCase())
        );
      }
    }
  },
  methods: {
    // 获取数据
    getIssuing() {
      const USER_PERMISSION = localStorage.getItem("USER_PERMISSION");
      const DEPARTMENT_ID = localStorage.getItem("DEPARTMENT_ID");
      const USER_ID = localStorage.getItem("USER_ID");
      this.permission = USER_PERMISSION;
      this.department_id = DEPARTMENT_ID;
      this.user_id = USER_ID;

      this.handleGet("/issuing").then(issuingDatas => {
        this.handleGet("/users").then(usersDatas => {
          this.usersDatas = usersDatas;

          for (let i = 0; i < issuingDatas.length; i++) {
            for (let j = 0; j < usersDatas.length; j++) {
              if (issuingDatas[i].user_id == usersDatas[j].user_id) {
                issuingDatas[i].user_name = usersDatas[j].user_name;
              }
            }
            issuingDatas[i].issuing_creattime = formatDate(
              issuingDatas[i].issuing_creattime
            );
          }

          if (USER_PERMISSION == 2) {
            let user_issuing = [];
            issuingDatas.map(item => {
              if (item.user_id == USER_ID) {
                user_issuing.push(item);
              }
            });
            this.issuingData = user_issuing;
          } else if (USER_PERMISSION == 1) {
            let user_issuing = [];
            issuingDatas.map(item => {
              let itemDepartment = item.department_code.split(",");
              if (itemDepartment[0] == DEPARTMENT_ID) {
                user_issuing.push(item);
              }
            });
            this.issuingData = user_issuing;
          } else if (USER_PERMISSION == 0) {
            this.issuingData = issuingDatas;
          }
        });
      });
    },
    // 新增数据弹窗
    openAddDialog() {
      this.isCode = false;
      this.dialogAddTitle = "新增用户";
      this.dialogAddToggle = true;
      this.issuingForm = {
        issuing_id: 0,
        issuing_type: "",
        issuing_number: "",
        issuing_password: "",
        issuing_remarks: "",
        issuing_status: "",
        issuing_creattime: "",
        user_id: "",
        user_name: "",
        department_id: ""
      };
      this.dialogAddVisible = true;
    },
    // 新增数据
    addIssuing(formName) {
      // 防止重复提交
      this.finished = true;
      let timestamp = new Date().getTime();
      const registData = {
        issuing_id: this.issuingForm.issuing_id,
        issuing_type: this.issuingForm.issuing_type,
        issuing_number: this.issuingForm.issuing_number,
        issuing_password: this.issuingForm.issuing_password,
        issuing_remarks: this.issuingForm.issuing_remarks,
        user_id: this.user_id,
        issuing_creattime: timestamp,
        department_id: this.department_id
      };
      console.log(registData);
      this.$refs[formName].validate(valid => {
        if (valid) {
          this.$http.post("/issuing/add", registData).then(
            res => {
              this.$message({
                message: "添加成功",
                type: "success",
                duration: 3000
              });
              this.finished = false;
              this.dialogAddVisible = false;
              this.getIssuing();
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
      this.isCode = true;
      this.dialogAddTitle = "修改用户";
      this.dialogAddToggle = false;
      this.issuingForm = {
        issuing_id: data.issuing_id,
        issuing_type: data.issuing_type,
        issuing_number: data.issuing_number,
        issuing_password: data.issuing_password,
        issuing_remarks: data.issuing_remarks
      };

      this.dialogAddVisible = true;
    },
    // 修改数据
    updateIssuing() {
      const params = qs.stringify({
        issuing_id: this.issuingForm.issuing_id,
        issuing_type: this.issuingForm.issuing_type,
        issuing_number: this.issuingForm.issuing_number,
        issuing_password: this.issuingForm.issuing_password,
        issuing_remarks: this.issuingForm.issuing_remarks
      });
      this.$http
        .post("/issuing/update", params)
        .then(res => {
          console.log(res.data);
          // 影响行数大于0
          if (res.data.err === 0) {
            this.$message({
              message: "修改成功",
              type: "success"
            });
            this.dialogAddVisible = false;
            this.getIssuing();
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
    deleteIssuing(index, data) {
      this.$confirm("是否删除?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(() => {
          const deleteNode = {
            id: data.issuing_id
          };
          this.$http.post("/issuing/delete", deleteNode).then(
            res => {
              this.$message({
                message: "删除成功",
                type: "success",
                duration: 3000
              });
              this.getIssuing();
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
    openSetDialog(index, data) {
      console.log(data);
      this.setData = data;
      this.dialogChooseVisible = true;
    },
    // 设置用户
    updateSet(index, data) {
      console.log(data);
      const params = qs.stringify({
        issuing_id: this.setData.issuing_id,
        user_id: data.user_id,
        department_code: data.department_id,
        issuing_status: 1
      });

      this.dialogChooseVisible = false;

      console.log(params);
      this.$http
        .post("/issuing/update/set", params)
        .then(res => {
          console.log(res.data);
          // 影响行数大于0
          if (res.data.err === 0) {
            this.$message({
              message: "修改成功",
              type: "success"
            });
            this.dialogAddVisible = false;
            this.getIssuing();
          } else {
            this.$message.error("修改失败，请重试");
          }
        })
        .catch(err => {
          console.log(err);
          this.$message.error("修改失败，请重试");
        });
    },
    // 清空设置
    updateClear() {
      const params = qs.stringify({
        issuing_id: this.setData.issuing_id,
        user_id: null,
        issuing_status: 0
      });

      this.dialogChooseVisible = false;

      console.log(params);
      this.$http
        .post("/issuing/update/set", params)
        .then(res => {
          console.log(res.data);
          // 影响行数大于0
          if (res.data.err === 0) {
            this.$message({
              message: "修改成功",
              type: "success"
            });
            this.dialogAddVisible = false;
          } else {
            this.$message.error("修改失败，请重试");
          }
        })
        .catch(err => {
          console.log(err);
          this.$message.error("修改失败，请重试");
        });
    },
    // 导出数据
    exportData() {
      // this.loading = true; //缓冲条加载

      //此代码实现向后台异步请求数据

      this.handleGet("/users").then(datas => {
        for (let i = 0; i < datas.length; i++) {
          datas[i].issuing_remarks = formatDate(datas[i].issuing_remarks);
          if (datas[i].issuing_status == null) {
            datas[i].issuing_status = "-";
          } else {
            datas[i].issuing_status = formatDate(datas[i].issuing_status);
          }
        }
        this.exportList = datas;
      });
      this.export2Excel();
    },
    // 导出excel数据
    export2Excel() {
      require.ensure([], () => {
        const {
          export_json_to_excel
        } = require("@/components/component/excel/Export2Excel");

        const tHeader = [
          "账号",
          "昵称",
          "电话",
          "职位",
          "是否在职",
          "入职时间",
          "离职时间"
        ];

        const filterVal = [
          "issuing_type",
          "issuing_number",
          "issuing_password",
          "issuing_creattime",
          "user_id",
          "issuing_remarks",
          "issuing_status"
        ];

        const list = this.exportList;

        const data = this.formatJson(filterVal, list);

        export_json_to_excel(tHeader, data, "**报表" + new Date().getTime());
      });
    },
    formatJson(filterVal, jsonData) {
      return jsonData.map(v => filterVal.map(j => v[j]));
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
    // 获取函数
    handlePost(url, params) {
      return new Promise((resolve, reject) => {
        this.$http
          .post(url, params)
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
  }
};
</script>
<style lang="less" scoped>
.issuing {
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
