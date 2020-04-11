<template>
  <div>
    <div class="user_box">
      <Loading v-if="isLoading"></Loading>
      <div class="control_box">
        <div class="search_box"></div>
        <div class="handle_box">
          <el-button icon="el-icon-plus" @click="openAddDialog " round>添加</el-button>
          <el-button icon="el-icon-receiving" @click="exportData()" round>导出</el-button>
        </div>
      </div>
      <el-table
        ref="filterTable"
        :data="usersData.slice((currentPage - 1) * pagesize,currentPage * pagesize)"
        style="width: 100%"
        :default-sort="{prop: 'date', order: 'descending'}"
      >
        <el-table-column label="账号" prop="user_code" sortable></el-table-column>
        <el-table-column label="昵称" prop="user_name" sortable></el-table-column>
        <el-table-column label="职位" prop="user_post" sortable></el-table-column>
        <el-table-column label="状态" prop="isWork" sortable></el-table-column>
        <el-table-column label="部门" prop="department_name" sortable></el-table-column>
        <el-table-column label="入职" prop="user_creattime" sortable></el-table-column>
        <el-table-column label="离职" prop="user_deadline" sortable></el-table-column>
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
              icon="el-icon-view"
              size="mini"
              circle
              @click="resetUsers(scope.$index, scope.row)"
            ></el-button>
            <el-button
              icon="el-icon-delete"
              size="mini"
              type="danger"
              circle
              @click="deleteUsers(scope.$index, scope.row)"
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
        :total="usersData.length"
      ></el-pagination>
    </div>
    <el-dialog :title="dialogAddTitle" :visible.sync="dialogAddVisible" width="600px">
      <el-form ref="usersForm" :model="usersForm" :rules="userFormRule" label-width="120px">
        <div class="usersForm">
          <el-form-item label="编号 :" prop="user_id" v-show="false">
            <el-input v-model="usersForm.user_id" :disabled="true" placeholder></el-input>
          </el-form-item>
          <el-form-item label="帐号 :" prop="user_code">
            <el-input v-model="usersForm.user_code" :disabled="isCode" placeholder></el-input>
          </el-form-item>
          <el-form-item label="昵称 :" prop="user_name">
            <el-input v-model="usersForm.user_name" placeholder></el-input>
          </el-form-item>
          <el-form-item label="联系电话 :" prop="user_phone">
            <el-input v-model="usersForm.user_phone" placeholder></el-input>
          </el-form-item>
          <el-form-item label="入职日期 :" prop="user_creattime">
            <el-date-picker type="date" v-model="usersForm.user_creattime" placeholder></el-date-picker>
          </el-form-item>
          <el-form-item label="离职日期 :" prop="user_deadline" v-if="dialogAddToggle == false">
            <el-date-picker
              type="date"
              v-model="usersForm.user_deadline"
              placeholder
              @change="handleChangeDate"
            ></el-date-picker>
          </el-form-item>
          <el-form-item label="职位 :" prop="user_post">
            <el-input v-model="usersForm.user_post" placeholder></el-input>
          </el-form-item>
          <el-form-item label="是否在职 :" prop="user_state" v-if="dialogAddToggle == false">
            <el-switch
              v-model="usersForm.user_state"
              active-color="#13ce66"
              inactive-color="#ff4949"
              @change="handleChangeSwitch"
            ></el-switch>
          </el-form-item>
          <el-form-item label="所属部门 :" prop="department_id">
            <el-cascader
              v-model="usersForm.department_id"
              :options="departmentDatas"
              :props="{ checkStrictly: true,expandTrigger: 'hover' }"
              clearable
            ></el-cascader>
          </el-form-item>
        </div>
        <el-form-item class="submit-btn">
          <el-button
            type="primary"
            @click="addUsers('usersForm')"
            v-if="dialogAddToggle === true"
            :disabled="finished"
          >确定</el-button>
          <el-button
            type="primary"
            @click="updateUser('usersForm')"
            v-if="dialogAddToggle === false"
            :disabled="finished"
          >修改</el-button>
          <el-button @click="dialogAddVisible = false">取 消</el-button>
        </el-form-item>
        <div class="error">{{ err }}</div>
      </el-form>
    </el-dialog>
  </div>
</template>
<script>
import qs from "qs";
import { mapGetters } from "vuex";
import Loading from "@/components/component/loading/loading";
import { formatNotDate, formatDate } from "@/common/js/utils";
export default {
  data() {
    return {
      usersData: [],
      isLoading: true,
      usersSearchData: [],
      search: "",
      currentPage: 1,
      pagesize: 10,
      value: true,
      finished: false,
      dialogAddVisible: false,
      isCode: false,
      dialogAddTitle: "",
      dialogAddToggle: true,
      departmentDatas: [],
      usersForm: {
        user_id: 0,
        user_code: "",
        user_name: "",
        user_phone: "",
        user_creattime: "",
        user_deadline: "",
        user_post: "",
        user_state: "",
        department_id: ""
      },
      exportList: [],
      userFormRule: {
        user_code: [
          { required: true, message: "请正确填写账号", trigger: "blur" }
        ],
        user_name: [
          { required: true, message: "请正确填写用户名", trigger: "blur" }
        ],
        user_phone: [
          { required: true, message: "请正确手机号码", trigger: "blur" },
          {
            type: "string",
            max: 11,
            min: 11,
            message: "必填项",
            trigger: "blur"
          }
        ],
        user_creattime: [
          { required: true, message: "请选择入职时间", trigger: "blur" }
        ],
        user_post: [
          { required: true, message: "请正确填写职位", trigger: "blur" }
        ],
        department_id: [
          { required: true, message: "请正确填写部门", trigger: "blur" }
        ]
      },
      permission: 10,
      err: ""
    };
  },
  created() {
    this.getUsers();
  },
  watch: {
    search: {
      handler(newValue, oldValue) {
        let _search = this.search;
        this.usersData = this.usersSearchData.filter(
          data =>
            !_search ||
            data.user_name.toLowerCase().includes(_search.toLowerCase()) ||
            data.user_code.toLowerCase().includes(_search.toLowerCase())
        );
      }
    }
  },
  methods: {
    // 获取数据
    getUsers() {
      this.permission = localStorage.getItem("USER_PERMISSION");
      this.handleGet("/users").then(datas => {
        this.handleGet("/departments").then(departmentDatas => {
          for (let i = 0; i < datas.length; i++) {
            for (let j = 0; j < departmentDatas.length; j++) {
              if (
                datas[i].department_id == departmentDatas[j].department_code
              ) {
                datas[i].department_name = departmentDatas[j].department_name;
              }
            }
            datas[i].isWork = datas[i].user_state ? "在职" : "离职";
            datas[i].user_creattime = formatDate(datas[i].user_creattime);
            datas[i].user_deadline = !datas[i].user_deadline
              ? ""
              : formatDate(datas[i].user_deadline);
          }
          this.usersData = datas;
          this.usersSearchData = this.usersData;
          console.log(this.usersData);
          this.isLoading = false;
        });
      });

      this.handleGet("/department").then(datas => {
        this.departmentDatas = datas;
      });
    },
    // 新增数据弹窗
    openAddDialog() {
      this.isCode = false;
      this.dialogAddTitle = "新增用户";
      this.dialogAddToggle = true;
      this.usersForm = {
        user_id: 0,
        user_code: "",
        user_name: "",
        user_phone: "",
        user_creattime: "",
        user_deadline: "",
        user_post: "销售",
        department_id: "",
        user_state: true
      };
      this.dialogAddVisible = true;
    },
    // 新增数据
    addUsers(formName) {
      // 防止重复提交
      this.finished = true;
      const registData = {
        id: this.usersForm.user_id,
        code: this.usersForm.user_code,
        name: this.usersForm.user_name,
        phone: this.usersForm.user_phone,
        time: formatNotDate(this.usersForm.user_creattime),
        time2: formatNotDate(this.usersForm.user_deadline),
        post: this.usersForm.user_post,
        state: this.usersForm.user_state ? "1" : "0",
        department: this.usersForm.department_id
      };
      console.log(registData);
      this.$refs[formName].validate(valid => {
        if (valid) {
          this.$http.post("/user/add", registData).then(
            res => {
              this.$message({
                message: "添加成功",
                type: "success",
                duration: 3000
              });
              this.finished = false;
              this.dialogAddVisible = false;
              this.getUsers();
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
      let dataStrArr = data.department_id.split(",");
      let dataIntArr = dataStrArr.map(item => {
        return +item;
      });
      this.usersForm = {
        user_id: data.user_id,
        user_code: data.user_code,
        user_name: data.user_name,
        user_phone: data.user_phone,
        user_creattime: data.user_creattime,
        user_deadline: data.user_deadline,
        user_post: data.user_post,
        user_state: Boolean(data.user_state),
        department_id: dataIntArr
      };

      this.dialogAddVisible = true;
    },
    // 修改数据
    updateUser() {
      const params = qs.stringify({
        user_id: this.usersForm.user_id,
        user_code: this.usersForm.user_code,
        user_name: this.usersForm.user_name,
        user_phone: this.usersForm.user_phone,
        user_creattime: formatNotDate(this.usersForm.user_creattime),
        user_deadline: formatNotDate(this.usersForm.user_deadline),
        user_post: this.usersForm.user_post,
        user_state: this.usersForm.user_state ? 1 : 0,
        department_id: this.usersForm.department_id
          ? this.usersForm.department_id.join(",")
          : 0
      });

      console.log(params);
      this.$http
        .post("/user/update", params)
        .then(res => {
          console.log(res.data);
          // 影响行数大于0
          if (res.data.err === 0) {
            this.$message({
              message: "修改成功",
              type: "success"
            });
            this.dialogAddVisible = false;
            this.getUsers();
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
    deleteUsers(index, data) {
      this.$confirm("是否删除用户?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(() => {
          const deleteNode = {
            id: data.user_id
          };
          this.$http.post("/user/delete", deleteNode).then(
            res => {
              this.$message({
                message: "删除成功",
                type: "success",
                duration: 3000
              });
              this.getUsers();
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
    // 重置用户密码
    resetUsers(index, data) {
      console.log();
      this.$confirm("是否重置该用户密码?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(() => {
          if (this.permission == "0") {
            const resetNode = {
              id: data.user_id,
              password: "123456"
            };
            this.$http.post("/user/password/update", resetNode).then(
              res => {
                this.$message({
                  message: "重置密码:123456",
                  type: "success",
                  duration: 3000
                });
              },
              err => {
                console.log(err);
              }
            );
          } else {
            this.$message({
              type: "info",
              message: "权限不足，请联系超管修改"
            });
          }
        })
        .catch(() => {
          this.$message({
            type: "info",
            message: "取消"
          });
        });
    },
    // 导出数据
    exportData() {
      // this.loading = true; //缓冲条加载

      //此代码实现向后台异步请求数据

      this.handleGet("/users").then(datas => {
        for (let i = 0; i < datas.length; i++) {
          datas[i].user_creattime = formatDate(datas[i].user_creattime);
          if (datas[i].user_deadline == null) {
            datas[i].user_deadline = "-";
          } else {
            datas[i].user_deadline = formatDate(datas[i].user_deadline);
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
          "user_code",
          "user_name",
          "user_phone",
          "user_post",
          "user_state",
          "user_creattime",
          "user_deadline"
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
    handleSizeChange: function(size) {
      this.pagesize = size;
      console.log(this.pagesize); //每页下拉显示数据
    },
    handleCurrentChange: function(currentPage) {
      this.currentPage = currentPage;
      console.log(this.currentPage); //点击第几页
    },
    handleChangeSwitch(value) {
      if (value) {
        this.usersForm.user_deadline = "";
      } else {
        this.usersForm.user_deadline = new Date();
      }
    },
    handleChangeDate(value) {
      this.usersForm.user_state = 0;
    }
  },
  components: {
    Loading
  }
};
</script>
<style lang="less" scoped>
.user_box {
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
