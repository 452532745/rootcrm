<template>
  <div>
    <div class="department_box">
      <div class="department_title">
        <span>部门名称</span>
        <span>选择操作</span>
      </div>
      <el-tree
        :data="departmentDatas"
        node-key="id"
        :expand-on-click-node="false"
      >
        <span class="custom-tree-node" slot-scope="{ node, data }">
          <span>{{ node.label }}</span>
          <span>
            <el-button
              type="success"
              size="mini"
              icon="el-icon-plus"
              circle
              @click="() => addDdeparment(data)"
            ></el-button>
            <el-button
              type="primary"
              size="mini"
              icon="el-icon-edit"
              circle
              @click="() => openEditDialog(node, data)"
            ></el-button>
            <el-button
              type="danger"
              size="mini"
              icon="el-icon-delete"
              circle
              @click="() => deleteDdeparment(node, data)"
            ></el-button>
          </span>
        </span>
      </el-tree>
      <el-dialog title="所属部门" :visible.sync="dialogVisible" width="600px">
        <el-form ref="departmentForm" :model="departmentForm" label-width="120px">
          <div class="departmentForm">
            <el-form-item label="上级部门 :" prop="top">
              <el-input v-model="departmentForm.top" placeholder :disabled="true"></el-input>
            </el-form-item>
            <el-form-item label="部门名称 :" prop="name">
              <el-input v-model="departmentForm.name" placeholder></el-input>
            </el-form-item>
          </div>
          <el-form-item class="submit-btn">
            <el-button type="primary" @click="updateDepartment()" :disabled="finished">确定</el-button>
            <el-button @click="dialogVisible = false">取 消</el-button>
          </el-form-item>
          <div class="error">{{ err }}</div>
        </el-form>
      </el-dialog>
    </div>
  </div>
</template>
<script>
import qs from "qs";

let id = 1000;

export default {
  data() {
    return {
      departmentDatas: [
        {
          id: "0",
          label: "公司架构",
          level: 0,
          top: 0,
          children: []
        }
      ],
      dialogVisible: false,
      departmentForm: {
        top: 0,
        id: 0,
        name: ""
      },
      copyData: {
        name: ""
      },
      finished: false,
      err: ""
    };
  },
  created() {
    this.getDepartment();
  },
  methods: {
    // 获取数据
    getDepartment() {
      this.handleGet("/department").then(datas => {
        this.departmentDatas[0].children = datas;
        console.log(this.departmentDatas);
      });
    },
    // 新增节点数据
    addDdeparment(data) {
      this.$confirm("确定新增一个部门吗?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(() => {
          const newChild = { id: id++, label: "New", children: [] };
          if (!data.children) {
            this.$set(data, "children", []);
          }
          // 防止重复提交
          this.finished = true;
          const AddData = {
            department_name: newChild.label,
            department_level: data.level + 1,
            department_parent_id: data.id,
            department_top_id: data.level === 1 ? data.id : data.top
          };
          this.$http.post("/department/add", AddData).then(
            res => {
              this.$message({
                message: "添加成功",
                type: "success",
                duration: 3000
              });

              data.children.push(newChild);
              this.finished = false;
              this.getDepartment();
            },
            err => {
              console.log(err);
              this.finished = false;
            }
          );
        })
        .catch(() => {
          console.log("取消操作");
        });
    },
    // 删除节点
    deleteDdeparment(node, data) {
      this.$confirm("是否删除部门?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(() => {
          let deleteNode = 0;
          const parent = node.parent;
          const children = parent.data.children || parent.data;
          const index = children.findIndex(d => d.id === data.id);
          deleteNode = children[index];
          this.$http.post("/department/delete", deleteNode).then(
            res => {
              this.$message({
                message: "删除成功",
                type: "success",
                duration: 3000
              });

              children.splice(index, 1);
            },
            err => {
              console.log(err);
            }
          );
        })
        .catch(() => {
          console.log("取消")
        });
    },
    // 查询数据弹窗
    openEditDialog(node, data) {
      this.dialogVisible = true;
      this.copyData.name = data.label;
      this.departmentForm.top = data.top;
      this.departmentForm.name = data.label;
      this.departmentForm.id = data.id;
    },
    // 修改部门数据
    updateDepartment() {
      if (this.departmentForm.name === this.copyData.name) {
        this.$message({
          message: "未操作",
          type: "info",
          duration: 3000
        });
      } else {
        const params = qs.stringify({
          name: this.departmentForm.name,
          id: this.departmentForm.id
        });
        this.$http
          .post("/department/update", params)
          .then(res => {
            console.log(res.data);
            // 影响行数大于0
            if (res.data.err === 0) {
              this.$message({
                message: "修改成功",
                type: "success"
              });
              this.dialogVisible = false;
              this.getDepartment();
            } else {
              this.$message.error("修改失败，请重试");
            }
          })
          .catch(err => {
            console.log(err);
            this.$message.error("修改失败，请重试");
          });
      }
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
    }
  }
};
</script>
<style lang="less" scoped>
.department_box {
  background-color: #252831;

  .department_title {
    background-color: #2b2e38;
    padding-left: 24px;
    font-size: 16px;
    color: #fff;
    overflow: hidden;
    span {
      float: left;
      width: 50%;
      height: 40px;
      line-height: 40px;
    }
  }

  .el-tree {
    background-color: #2b2e38;
    font-size: 14px;
    color: #fff;
    margin-top: 3px;
    padding: 20px;

    /deep/ .el-tree-node > .el-tree-node__content {
      margin-left: -24px;
      .custom-tree-node span:last-child {
        transform: translateX(12px);
      }
    }

    /deep/ .el-tree-node__children .el-tree-node > .el-tree-node__content {
      margin-left: 0;
      .custom-tree-node span:last-child {
        transform: translateX(0);
      }
    }

    /deep/ .el-tree-node:focus > .el-tree-node__content {
      color: #2b2e38;
    }

    /deep/ .el-tree-node__content {
      height: 40px;
      line-height: 40px;
      padding-left: 0 !important;

      &:hover {
        color: #2b2e38;
      }
    }
    .custom-tree-node {
      width: 100%;
      > span {
        float: left;
        width: 50%;
      }
    }
  }
}
</style>