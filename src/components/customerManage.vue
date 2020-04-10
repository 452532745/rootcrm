<template>
  <div>
    <div class="customer_box">
      <div class="control_box">
        <!-- <div class="search_box">
          <el-input v-model="search" size="mini" placeholder="请输入昵称或账号搜索" />
          <el-button
            size="mini"
            icon="el-icon-refresh"
            @click="handleRefresh(scope.$index, scope.row)"
            circle
          ></el-button>
        </div>-->
        <div class="handle_box">
          <el-button icon="el-icon-plus" @click="openAddDialog " round>添加</el-button>
        </div>
      </div>
      <el-table
        ref="filterTable"
        :data="customersData.slice((currentPage - 1) * pagesize,currentPage * pagesize)"
        style="width: 100%"
        :default-sort="{prop: 'customer_id', order: 'descending'}"
      >
        <el-table-column label="客户名称" prop="customer_name" sortable></el-table-column>
        <el-table-column label="联系电话" prop="customer_phone" sortable></el-table-column>
        <el-table-column label="性别" prop="customer_sex" sortable></el-table-column>
        <el-table-column label="皮肤类型" prop="customer_skin_name" sortable></el-table-column>
        <el-table-column label="录入日期" prop="customer_creattime" sortable></el-table-column>
        <el-table-column label="产品结束" prop="customer_product_finish" sortable></el-table-column>
        <el-table-column label="负责人" prop="user_name" sortable></el-table-column>
        <!-- <el-table-column label="销售部门" prop="department_id" sortable></el-table-column> -->
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
              @click="deleteCustomers(scope.$index, scope.row)"
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
        :total="customersData.length"
      ></el-pagination>
    </div>
    <el-dialog title="修改用户" :visible.sync="dialogUpdateVisible" width="600px">
      <el-form
        ref="customersForm"
        :model="customersForm"
        :rules="customersFormRule"
        label-width="120px"
      >
        <div class="customersForm">
          <el-tabs v-model="activeName" @tab-click="handleClick">
            <el-tab-pane label="基本资料" name="1">
              <el-form-item label="编号 :" prop="customer_id" v-show="false">
                <el-input v-model="customersForm.customer_id" :disabled="true" placeholder></el-input>
              </el-form-item>
              <el-form-item label="客户名称 :" prop="customer_name">
                <el-input v-model="customersForm.customer_name" placeholder></el-input>
              </el-form-item>
              <el-form-item label="联系电话 :" prop="customer_phone">
                <el-input v-model="customersForm.customer_phone" placeholder></el-input>
              </el-form-item>
              <el-form-item label="客户性别 :" prop="customer_sex">
                <el-select v-model="customersForm.customer_sex" placeholder="请选择">
                  <el-option
                    v-for="item in sexOptions"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  ></el-option>
                </el-select>
              </el-form-item>
              <el-form-item label="微信号 :" prop="customer_wechat">
                <el-input v-model="customersForm.customer_wechat" placeholder></el-input>
              </el-form-item>
              <el-form-item label="微信昵称 :" prop="customer_wechat_name">
                <el-input v-model="customersForm.customer_wechat_name" placeholder></el-input>
              </el-form-item>
              <el-form-item label="皮肤类型 :" prop="customer_skin">
                <el-select v-model="customersForm.customer_skin" placeholder="请选择">
                  <el-option
                    v-for="item in skinOptions"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  ></el-option>
                </el-select>
              </el-form-item>
              <el-form-item label="皮肤问题 :" prop="customer_skin_problem">
                <el-input
                  v-model="customersForm.customer_skin_problem"
                  type="textarea"
                  :rows="2"
                  placeholder="请输入内容"
                ></el-input>
              </el-form-item>
            </el-tab-pane>
            <el-tab-pane label="收货地址" name="2">
              <div class="handle_box">
                <el-button icon="el-icon-edit-outline" @click="openAddressAddDialog" round>添加地址</el-button>
              </div>
              <el-table
                ref="filterTable"
                :data="expressData"
                style="width: 100%"
                :default-sort="{prop: 'express_receiver', order: 'descending'}"
              >
                <el-table-column label="收件人" prop="express_receiver" sortable></el-table-column>
                <el-table-column label="联系电话" prop="express_phone" sortable></el-table-column>
                <el-table-column label="收货地址" prop="express_address_merge" sortable></el-table-column>
                <el-table-column label="邮政编码" prop="express_postalcode" sortable></el-table-column>
                <el-table-column label="操作">
                  <template slot-scope="scope">
                    <el-button
                      type="primary"
                      icon="el-icon-edit"
                      size="mini"
                      circle
                      @click="openAddressEditDialog(scope.$index, scope.row)"
                    ></el-button>
                    <el-button
                      icon="el-icon-delete"
                      size="mini"
                      type="danger"
                      circle
                      @click="deleteAddress(scope.$index, scope.row)"
                    ></el-button>
                  </template>
                </el-table-column>
              </el-table>
              <el-dialog
                width="450px"
                :title="dialogTitle"
                :visible.sync="dialogAddressVisible"
                append-to-body
              >
                <el-form
                  ref="expressForm"
                  :rules="expressFormRule"
                  :model="expressForm"
                  label-width="120px"
                >
                  <div class="expressForm">
                    <el-form-item label="编号 :" prop="id" v-if="false">
                      <el-input v-model="expressForm.express_id" placeholder></el-input>
                    </el-form-item>
                    <el-form-item label="收件人 :" prop="express_receiver">
                      <el-input v-model="expressForm.express_receiver" placeholder></el-input>
                    </el-form-item>
                    <el-form-item label="联系电话 :" prop="express_phone">
                      <el-input v-model="expressForm.express_phone" placeholder></el-input>
                    </el-form-item>
                    <el-form-item label="邮政编码 :" prop="express_postalcode">
                      <el-input v-model="expressForm.express_postalcode" placeholder></el-input>
                    </el-form-item>
                    <el-form-item label="收货地址 :" prop="express_address_ssx">
                      <el-cascader
                        v-model="expressForm.express_address_ssx"
                        :options="options"
                        :props="{ expandTrigger: 'hover' }"
                        @change="handleChange"
                      ></el-cascader>
                    </el-form-item>
                    <el-form-item label="详细地址 :" prop="express_address">
                      <el-input
                        v-model="expressForm.express_address"
                        type="textarea"
                        :rows="2"
                        placeholder="请输入内容"
                      ></el-input>
                    </el-form-item>
                  </div>
                  <el-form-item class="submit-btn">
                    <el-button
                      type="primary"
                      @click="addAddress('expressForm')"
                      v-if="dialogAddressToggle === true"
                      :disabled="finished"
                    >确定</el-button>
                    <el-button
                      type="primary"
                      @click="updateAddress('expressForm')"
                      v-if="dialogAddressToggle === false"
                      :disabled="finished"
                    >修改</el-button>
                    <el-button @click="dialogAddressVisible = false">取 消</el-button>
                  </el-form-item>
                  <div class="error">{{ err }}</div>
                </el-form>
              </el-dialog>
            </el-tab-pane>
            <el-tab-pane label="其他资料" name="3">
              <el-form-item label="出单账号 :" prop="issuing_number">
                <el-input v-model="customersForm.issuing_number" :disabled="true" placeholder></el-input>
              </el-form-item>
              <el-form-item label="客户职业 :" prop="customer_profession">
                <el-input v-model="customersForm.customer_profession" placeholder></el-input>
              </el-form-item>
              <el-form-item label="出生日期 :" prop="customer_birthday">
                <el-date-picker
                  type="date"
                  v-model="customersForm.customer_birthday"
                  placeholder
                  @change="handleChange"
                ></el-date-picker>
              </el-form-item>
              <el-form-item label="产品结束日期 :" prop="customer_product_finish">
                <el-date-picker
                  type="date"
                  v-model="customersForm.customer_product_finish"
                  placeholder
                  @change="handleChange"
                ></el-date-picker>
              </el-form-item>
              <el-form-item label="备注 :" prop="customer_remarks">
                <el-input
                  v-model="customersForm.customer_remarks"
                  type="textarea"
                  :rows="2"
                  placeholder="请输入内容"
                ></el-input>
              </el-form-item>
              <el-form-item label="客户图片 :" prop="picture">
                <upload @uploadPic="showUploadMessage" :sendPic="this.fileList"></upload>
              </el-form-item>
            </el-tab-pane>
          </el-tabs>
        </div>
        <el-form-item class="submit-btn">
          <el-button
            type="primary"
            @click="addCustomers('customersForm')"
            v-if="dialogAddToggle === true"
            :disabled="finished"
          >确定</el-button>
          <el-button
            type="primary"
            @click="updateCustomers('customersForm')"
            v-if="dialogAddToggle === false"
            :disabled="finished"
          >修改</el-button>
          <el-button @click="dialogUpdateVisible = false">取 消</el-button>
        </el-form-item>
        <div class="error">{{ err }}</div>
      </el-form>
    </el-dialog>
    <el-dialog title="新增用户" :visible.sync="dialogAddVisible" width="600px">
      <el-form
        ref="customersForm"
        :model="customersForm"
        :rules="customersFormRule"
        label-width="120px"
      >
        <div class="customersForm">
          <el-tabs v-model="activeName" @tab-click="handleClick">
            <el-tab-pane label="基本资料" name="1">
              <el-form-item label="编号 :" prop="customer_id" v-show="false">
                <el-input v-model="customersForm.customer_id" :disabled="true" placeholder></el-input>
              </el-form-item>
              <el-form-item label="客户名称 :" prop="customer_name">
                <el-input v-model="customersForm.customer_name" placeholder></el-input>
              </el-form-item>
              <el-form-item label="联系电话 :" prop="customer_phone">
                <el-input v-model="customersForm.customer_phone" placeholder></el-input>
              </el-form-item>
              <el-form-item label="客户性别 :" prop="customer_sex">
                <el-select v-model="customersForm.customer_sex" placeholder="请选择">
                  <el-option
                    v-for="item in sexOptions"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  ></el-option>
                </el-select>
              </el-form-item>
              <el-form-item label="微信号 :" prop="customer_wechat">
                <el-input v-model="customersForm.customer_wechat" placeholder></el-input>
              </el-form-item>
              <el-form-item label="微信昵称 :" prop="customer_wechat_name">
                <el-input v-model="customersForm.customer_wechat_name" placeholder></el-input>
              </el-form-item>
              <el-form-item label="皮肤类型 :" prop="customer_skin">
                <el-select v-model="customersForm.customer_skin" placeholder="请选择">
                  <el-option
                    v-for="item in skinOptions"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  ></el-option>
                </el-select>
              </el-form-item>
              <el-form-item label="皮肤问题 :" prop="customer_skin_problem">
                <el-input
                  v-model="customersForm.customer_skin_problem"
                  type="textarea"
                  :rows="2"
                  placeholder="请输入内容"
                ></el-input>
              </el-form-item>
            </el-tab-pane>
            <el-tab-pane label="收货地址" name="2">
              <div class="handle_box">
                <el-button icon="el-icon-edit-outline" @click="openAddressAddDialog" round>添加地址</el-button>
              </div>
              <el-table
                ref="filterTable"
                :data="expressData"
                style="width: 100%"
                :default-sort="{prop: 'express_receiver', order: 'descending'}"
              >
                <el-table-column label="收件人" prop="express_receiver" sortable></el-table-column>
                <el-table-column label="联系电话" prop="express_phone" sortable></el-table-column>
                <el-table-column label="收货地址" prop="express_address_merge" sortable></el-table-column>
                <el-table-column label="邮政编码" prop="express_postalcode" sortable></el-table-column>
                <el-table-column label="操作">
                  <template slot-scope="scope">
                    <el-button
                      icon="el-icon-delete"
                      size="mini"
                      type="danger"
                      circle
                      @click="deleteAddress(scope.$index, scope.row)"
                    ></el-button>
                  </template>
                </el-table-column>
              </el-table>
              <el-dialog
                width="450px"
                :title="dialogTitle"
                :visible.sync="dialogAddressVisible"
                append-to-body
              >
                <el-form
                  ref="expressForm"
                  :model="expressForm"
                  :rules="expressFormRule"
                  label-width="120px"
                >
                  <div class="expressForm">
                    <el-form-item label="编号 :" prop="express_id" v-if="false">
                      <el-input v-model="expressForm.express_id" placeholder></el-input>
                    </el-form-item>
                    <el-form-item label="收件人 :" prop="express_receiver">
                      <el-input v-model="expressForm.express_receiver" placeholder></el-input>
                    </el-form-item>
                    <el-form-item label="联系电话 :" prop="express_phone">
                      <el-input v-model="expressForm.express_phone" placeholder></el-input>
                    </el-form-item>
                    <el-form-item label="邮政编码 :" prop="express_postalcode">
                      <el-input v-model="expressForm.express_postalcode" placeholder></el-input>
                    </el-form-item>
                    <el-form-item label="收货地址 :" prop="express_address_ssx">
                      <el-cascader
                        v-model="expressForm.express_address_ssx"
                        :options="options"
                        :props="{ expandTrigger: 'hover' }"
                        @change="handleChange"
                      ></el-cascader>
                    </el-form-item>
                    <el-form-item label="详细地址 :" prop="express_address">
                      <el-input
                        v-model="expressForm.express_address"
                        type="textarea"
                        :rows="2"
                        placeholder="请输入内容"
                      ></el-input>
                    </el-form-item>
                  </div>
                  <el-form-item class="submit-btn">
                    <el-button
                      type="primary"
                      @click="addCustomersAddress('expressForm')"
                      :disabled="finished"
                    >确定</el-button>
                    <el-button @click="dialogAddressVisible = false">取 消</el-button>
                  </el-form-item>
                  <div class="error">{{ err }}</div>
                </el-form>
              </el-dialog>
            </el-tab-pane>
            <el-tab-pane label="其他资料" name="3">
              <el-form-item label="出单账号 :" prop="issuing_number">
                <el-select v-model="customersForm.issuing_number" placeholder="请选择">
                  <el-option
                    v-for="item in issuingData"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  ></el-option>
                </el-select>
              </el-form-item>
              <el-form-item label="客户职业 :" prop="customer_profession">
                <el-input v-model="customersForm.customer_profession" placeholder></el-input>
              </el-form-item>
              <el-form-item label="出生日期 :" prop="customer_birthday">
                <el-date-picker
                  type="date"
                  v-model="customersForm.customer_birthday"
                  placeholder
                  @change="handleChange"
                ></el-date-picker>
              </el-form-item>
              <el-form-item label="产品结束日期 :" prop="customer_product_finish">
                <el-date-picker
                  type="date"
                  v-model="customersForm.customer_product_finish"
                  placeholder
                  @change="handleChange"
                ></el-date-picker>
              </el-form-item>
              <el-form-item label="备注 :" prop="customer_remarks">
                <el-input
                  v-model="customersForm.customer_remarks"
                  type="textarea"
                  :rows="2"
                  placeholder="请输入内容"
                ></el-input>
              </el-form-item>
              <el-form-item label="客户图片 :" prop="picture">
                <upload @uploadPic="showUploadMessage"></upload>
              </el-form-item>
            </el-tab-pane>
          </el-tabs>
        </div>
        <el-form-item class="submit-btn">
          <el-button
            type="primary"
            @click="addCustomers('customersForm')"
            v-if="dialogAddToggle === true"
            :disabled="finished"
          >确定</el-button>
          <el-button
            type="primary"
            @click="updateCustomers('customersForm')"
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
import { formatNotDate, formatDate, cityMatch } from "@/common/js/utils";
import { options } from "@/common/js/city";
import Upload from "@/components/component/upload/upload";
export default {
  data() {
    return {
      dialogVisible: false,
      disabled: false,
      customersData: [],
      expressData: [],
      issuingData: [],
      search: "",
      currentPage: 1,
      pagesize: 10,
      value: true,
      finished: false,
      dialogUpdateVisible: false,
      dialogAddVisible: false,
      dialogAddressVisible: false,
      isCode: false,
      activeName: "1",
      dialogTitle: "",
      dialogAddToggle: true,
      dialogAddressToggle: true,
      fileList: [],
      customersForm: {
        customer_id: 0,
        customer_name: "",
        customer_phone: "",
        customer_sex: "",
        customer_wechat: "",
        customer_wechat_name: "",
        customer_skin: "",
        customer_skin_problem: "",
        express_receiver: "",
        customer_profession: "",
        customer_creattime: "",
        customer_birthday: "",
        customer_product_finish: "",
        customer_remarks: "",
        user_id: "",
        department_id: "",
        issuing_id: "",
        issuing_number: ""
      },
      expressForm: {
        express_id: 0,
        express_receiver: "",
        express_phone: "",
        express_postalcode: "",
        express_address_ssx: "",
        express_address: "",
        customer_id: 0,
        customer_name: ""
      },
      options: options,
      sexOptions: [
        {
          value: "女",
          label: "女"
        },
        {
          value: "男",
          label: "男"
        }
      ],
      skinOptions: [],
      exportList: [],
      customersFormRule: {
        customer_name: [{ required: true, message: "必填项", trigger: "blur" }],
        customer_phone: [
          { required: true, message: "必填项", trigger: "blur" },
          { type: "string", max: 11, min: 11, message: " ", trigger: "blur" }
        ],
        customer_skin: [{ required: true, message: "必填项", trigger: "blur" }],
        customer_skin_problem: [
          { required: true, message: "必填项", trigger: "blur" }
        ],
        customer_profession: [
          { required: true, message: "必填项", trigger: "blur" }
        ],
        customer_birthday: [
          { required: true, message: "必填项", trigger: "blur" }
        ],
        customer_product_finish: [
          { required: true, message: "必填项", trigger: "blur" }
        ],
        customer_remarks: [
          { required: true, message: "必填项", trigger: "blur" }
        ]
      },
      expressFormRule: {
        express_receiver: [
          { required: true, message: "必填项", trigger: "blur" }
        ],
        express_phone: [
          { required: true, message: "必填项", trigger: "blur" },
          { type: "string", max: 11, min: 11, message: " ", trigger: "blur" }
        ],
        express_address_ssx: [
          { required: true, message: "必填项", trigger: "blur" }
        ],
        express_address: [
          { required: true, message: "必填项", trigger: "blur" }
        ]
      },
      permission: 10,
      user_id: 0,
      department_id: 0,
      err: ""
    };
  },
  created() {
    this.getCustomers();
  },
  watch: {
    search: {
      handler(newValue, oldValue) {
        let _search = this.search;
        this.customersData = this.customersData.filter(
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
    getCustomers() {
      const USER_PERMISSION = localStorage.getItem("USER_PERMISSION");
      const DEPARTMENT_ID = localStorage.getItem("DEPARTMENT_ID");
      const USER_ID = localStorage.getItem("USER_ID");
      this.permission = USER_PERMISSION;
      this.department_id = DEPARTMENT_ID;
      this.user_id = USER_ID;
      const params = qs.stringify({ dict_type_code: "003" });
      const param = qs.stringify({
        user_id: USER_ID
      });

      this.handleGet("/customer").then(customerDatas => {
        this.handleGet("/issuing").then(issuingDatas => {
          this.handlePost("/params/skin", params).then(skinDatas => {
            this.handleGet("/users").then(usersDatas => {
              let issuingArr = [];
              for (let i = 0; i < customerDatas.length; i++) {
                for (let j = 0; j < issuingDatas.length; j++) {
                  if (
                    customerDatas[i].issuing_id == issuingDatas[j].issuing_id
                  ) {
                    customerDatas[i].issuing_number =
                      issuingDatas[j].issuing_number;
                  }
                }

                for (let k = 0; k < skinDatas.length; k++) {
                  if (customerDatas[i].customer_skin == skinDatas[k].dict_id) {
                    customerDatas[i].customer_skin_name =
                      skinDatas[k].dict_item_name;
                  }
                }

                for (let h = 0; h < usersDatas.length; h++) {
                  if (customerDatas[i].user_id == usersDatas[h].user_id) {
                    customerDatas[i].user_name = usersDatas[h].user_name;
                  }
                }

                customerDatas[i].customer_creattime = formatDate(
                  customerDatas[i].customer_creattime
                );
                customerDatas[i].customer_birthday = formatDate(
                  customerDatas[i].customer_birthday
                );
                customerDatas[i].customer_product_finish = formatDate(
                  customerDatas[i].customer_product_finish
                );
              }

              for (let i = 0; i < issuingDatas.length; i++) {
                let user = this.$store.getters.user_data;
                if (user.user_id == issuingDatas[i].user_id) {
                  issuingArr.push({
                    label: issuingDatas[i].issuing_number,
                    value: issuingDatas[i].issuing_id
                  });
                }
              }

              for (let i = 0; i < skinDatas.length; i++) {
                let obj = {
                  value: skinDatas[i].dict_id,
                  label: skinDatas[i].dict_item_name
                };
                this.skinOptions.push(obj);
              }

              if (USER_PERMISSION == 2) {
                let user_customer = [];
                customerDatas.map(item => {
                  if (item.user_id == USER_ID) {
                    user_customer.push(item);
                  }
                });
                this.customersData = user_customer;
              } else if (USER_PERMISSION == 1) {
                let user_customer = [];
                customerDatas.map(item => {
                  let itemDepartment = item.department_id.split(",");
                  if (itemDepartment[0] == DEPARTMENT_ID) {
                    user_customer.push(item);
                  }
                });
                this.customersData = user_customer;
              } else if (USER_PERMISSION == 0) {
                this.customersData = customerDatas;
              }
              this.issuingData = issuingArr;
            });
          });
        });
      });
    },
    // 新增数据弹窗
    openAddDialog() {
      this.isCode = false;
      this.dialogAddToggle = true;
      this.customersForm = {
        customer_id: 0,
        customer_name: "",
        customer_phone: "",
        customer_sex: "",
        customer_wechat: "",
        customer_wechat_name: "",
        customer_skin: "",
        customer_skin_problem: "",
        customer_profession: "",
        customer_creattime: "",
        customer_birthday: "",
        customer_product_finish: "",
        customer_remarks: "",
        customer_picture: "",
        user_id: "",
        department_id: "",
        issuing_id: "",
        customer_pic: []
      };
      this.expressForm = {
        express_id: 0,
        express_receiver: "",
        express_phone: "",
        express_address_ssx: "",
        express_address: "",
        customer_id: 0,
        customer_name: ""
      };

      this.expressData = [];
      this.dialogAddVisible = true;
    },
    // 新增数据
    addCustomers(formName) {
      // 防止重复提交
      this.finished = true;
      let timestamp = new Date().getTime();
      const registData = {
        customer_id: this.customersForm.customer_id,
        customer_name: this.customersForm.customer_name,
        customer_phone: this.customersForm.customer_phone,
        customer_sex: this.customersForm.customer_sex,
        customer_wechat: this.customersForm.customer_wechat,
        customer_wechat_name: this.customersForm.customer_wechat_name,
        customer_skin: this.customersForm.customer_skin,
        customer_skin_problem: this.customersForm.customer_skin_problem,
        customer_profession: this.customersForm.customer_profession,
        customer_creattime: timestamp,
        customer_birthday: formatNotDate(this.customersForm.customer_birthday),
        customer_product_finish: formatNotDate(
          this.customersForm.customer_product_finish
        ),
        customer_remarks: this.customersForm.customer_remarks,
        customer_picture: this.customersForm.customer_picture,
        user_id: this.user_id,
        department_id: this.department_id,
        issuing_id: this.customersForm.issuing_number,
        customer_pic: JSON.stringify(this.fileList),
        express: this.expressData
      };
      console.log(registData);
      this.$refs[formName].validate(valid => {
        if (valid) {
          this.$http.post("/customer/add", registData).then(
            res => {
              this.$message({
                message: "添加成功",
                type: "success",
                duration: 3000
              });
              this.getCustomers();
              this.finished = false;
              this.dialogAddVisible = false;
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
    // 新增用户新增收货地址弹窗
    openCustomersAddressAddDialog() {
      this.dialogTitle = "添加地址";
      this.dialogAddressToggle = true;
      const registData = {
        express_receiver: "",
        express_phone: "",
        express_postalcode: "",
        express_address_ssx: "",
        express_address: "",
        customer_id: 0
      };
      this.dialogAddressVisible = true;
    },
    // 新增用户新增收货地址数据
    addCustomersAddress(formName) {
      // 防止重复提交
      this.finished = true;
      this.$refs[formName].validate(valid => {
        if (valid) {
          const registData = {
            express_receiver: this.expressForm.express_receiver,
            express_phone: this.expressForm.express_phone,
            express_postalcode: String(this.expressForm.express_postalcode),
            express_address_ssx: this.expressForm.express_address_ssx,
            express_address: this.expressForm.express_address,
            express_address_merge:
              cityMatch(this.expressForm.express_address_ssx, options) +
              " " +
              this.expressForm.express_address,
            customer_id: this.customersForm.customer_id
          };
          this.expressData.push(registData);
          this.expressForm = {
            express_receiver: "",
            express_phone: "",
            express_address_ssx: "",
            express_address: "",
            express_address_merge: "",
            customer_id: 0,
            customer_name: ""
          };
          this.dialogAddressVisible = false;
          this.finished = false;
        } else {
          alert("请正确填写信息");
          this.finished = false;
        }
      });
    },
    // 修改数据弹窗
    openEditDialog(index, data) {
      let expressArr = [];
      this.isCode = true;
      this.dialogAddToggle = false;
      let dataStrArr = data.department_id.split(",");
      let dataIntArr = dataStrArr.map(item => {
        return +item;
      });
      let cityData = eval(options);
      this.handleGet("/express").then(datas => {
        for (let i = 0; i < datas.length; i++) {
          if (datas[i].customer_id == data.customer_id) {
            let obj = {
              express_id: datas[i].express_id,
              express_receiver: datas[i].express_receiver,
              express_phone: datas[i].express_phone,
              express_postalcode: datas[i].express_postalcode,
              express_address_ssx: datas[i].express_address_ssx,
              express_address: datas[i].express_address,
              express_address_merge:
                cityMatch(datas[i].express_address_ssx, options) +
                " " +
                datas[i].express_address,
              customer_id: datas[i].customer_id,
              customer_name: data.customer_name
            };
            expressArr.push(obj);
          }
        }

        this.expressData = expressArr;
        console.log(this.expressData);
      });
      this.customersForm = {
        customer_id: data.customer_id,
        customer_name: data.customer_name,
        customer_phone: data.customer_phone,
        customer_sex: data.customer_sex,
        customer_wechat: data.customer_wechat,
        customer_wechat_name: data.customer_wechat_name,
        customer_skin: data.customer_skin,
        customer_skin_problem: data.customer_skin_problem,
        express_receiver: data.express_receiver,
        customer_profession: data.customer_profession,
        customer_creattime: data.customer_creattime,
        customer_birthday: data.customer_birthday,
        customer_product_finish: data.customer_product_finish,
        customer_remarks: data.customer_remarks,
        customer_picture: data.customer_picture,
        user_id: data.user_id,
        department_id: data.department_id,
        issuing_id: data.issuing_id,
        issuing_number: data.issuing_number
      };
      this.fileList = data.customer_pic ? JSON.parse(data.customer_pic) : [];

      console.log(this.fileList);

      this.dialogUpdateVisible = true;
    },
    // 修改数据
    updateCustomers() {
      const params = qs.stringify({
        customer_id: this.customersForm.customer_id,
        customer_name: this.customersForm.customer_name,
        customer_phone: this.customersForm.customer_phone,
        customer_sex: this.customersForm.customer_sex,
        customer_wechat: this.customersForm.customer_wechat,
        customer_wechat_name: this.customersForm.customer_wechat_name,
        customer_skin: this.customersForm.customer_skin,
        customer_skin_problem: this.customersForm.customer_skin_problem,
        customer_profession: this.customersForm.customer_profession,
        customer_birthday: formatNotDate(this.customersForm.customer_birthday),
        customer_product_finish: formatNotDate(
          this.customersForm.customer_product_finish
        ),
        customer_remarks: this.customersForm.customer_remarks,
        customer_picture: this.customersForm.customer_picture,
        user_id: this.user_id,
        department_id: this.$store.getters.user_data.department_id,
        issuing_id: this.customersForm.issuing_id,
        customer_pic: JSON.stringify(this.fileList)
      });
      this.$http
        .post("/customer/update", params)
        .then(res => {
          console.log(res.data);
          // 影响行数大于0
          if (res.data.err === 0) {
            this.$message({
              message: "修改成功",
              type: "success"
            });
            this.dialogUpdateVisible = false;
            this.getCustomers();
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
    deleteCustomers(index, data) {
      this.$confirm("是否删除用户?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(() => {
          const deleteNode = {
            id: data.customer_id
          };
          this.$http.post("/customer/delete", deleteNode).then(
            res => {
              this.$message({
                message: "删除成功",
                type: "success",
                duration: 3000
              });
              this.getCustomers();
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
    // 新增收货地址弹窗
    openAddressAddDialog() {
      this.dialogTitle = "添加地址";
      this.dialogAddressToggle = true;
      const registData = {
        express_id: 0,
        express_receiver: "",
        express_phone: "",
        express_postalcode: "",
        express_address_ssx: "",
        express_address: "",
        customer_id: 0
      };
      this.dialogAddressVisible = true;
    },
    // 新增收货地址数据
    addAddress(formName) {
      // 防止重复提交
      this.finished = true;
      const registData = {
        express_id: this.expressForm.express_id,
        express_receiver: this.expressForm.express_receiver,
        express_phone: this.expressForm.express_phone,
        express_postalcode: this.expressForm.express_postalcode,
        express_address_ssx: this.expressForm.express_address_ssx,
        express_address: this.expressForm.express_address,
        express_address_merge:
          cityMatch(this.expressForm.express_address_ssx, options) +
          " " +
          this.expressForm.express_address,
        customer_id: this.customersForm.customer_id
      };
      console.log(registData);
      this.$refs[formName].validate(valid => {
        if (valid) {
          this.$http.post("/express/add", registData).then(
            res => {
              registData.express_id = res.data.insertId;
              this.$message({
                message: "添加成功",
                type: "success",
                duration: 3000
              });
              console.log(res)
              this.$refs[formName].resetFields();
              this.finished = false;
              this.dialogAddressVisible = false;
              this.expressData.push(registData);
              console.log(this.expressData);
            },
            err => {
              console.log(err);
            }
          );
        } else {
          alert("请正确填写信息");
          this.finished = false;
        }
      });
    },
    // 修改收货地址弹窗
    openAddressEditDialog(index, data) {
      this.dialogTitle = "修改地址";
      this.dialogAddressToggle = false;
      this.expressForm = {
        express_id: data.express_id,
        express_receiver: data.express_receiver,
        express_phone: data.express_phone,
        express_postalcode: data.express_postalcode,
        express_address_ssx: data.express_address_ssx.split(","),
        express_address: data.express_address,
        customer_id: data.customer_id,
        customer_name: data.customer_name
      };
      this.dialogAddressVisible = true;
    },
    // 修改收货地址数据
    updateAddress() {
      const params = qs.stringify({
        express_id: this.expressForm.express_id,
        express_receiver: this.expressForm.express_receiver,
        express_phone: this.expressForm.express_phone,
        express_postalcode: this.expressForm.express_postalcode,
        express_address_ssx: this.expressForm.express_address_ssx
          ? this.expressForm.express_address_ssx.join(",")
          : 0,
        express_address: this.expressForm.express_address,
        customer_id: this.customersForm.customer_id
      });

      console.log(params);
      this.$http
        .post("/express/update", params)
        .then(res => {
          console.log(res.data);
          // 影响行数大于0
          if (res.data.err === 0) {
            this.$message({
              message: "修改成功",
              type: "success"
            });
            this.dialogUpdateVisible = false;
          } else {
            this.$message.error("修改失败，请重试");
          }
        })
        .catch(err => {
          console.log(err);
          this.$message.error("修改失败，请重试");
        });
      this.dialogAddressVisible = false;
    },
    // 删除节点
    deleteAddress(index, data) {
      let _eData = this.expressData;
      this.$confirm("是否删除用户?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(() => {
          const deleteNode = {
            id: data.express_id
          };

          console.log(deleteNode);

          this.$http.post("/express/delete", deleteNode).then(
            res => {
              for (let i = 0; i < _eData.length; i++) {
                if (_eData[i].express_id == data.express_id) {
                  this.expressData.splice(i, 1);
                }
              }
              this.$message({
                message: "删除成功",
                type: "success",
                duration: 3000
              });
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
    // 从upload获取图片链接
    showUploadMessage(data) {
      this.fileList = data;
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
    Upload
  }
};
</script>
<style lang="less" scoped>
.customer_box {
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
