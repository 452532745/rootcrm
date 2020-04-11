<template>
  <div>
    <div class="orders_box">
      <Loading v-if="isLoading"></Loading>
      <div class="control_box">
        <div class="search_box">
          <el-input v-model="search" size="mini" placeholder="请输入客服或客户姓名搜索" />
          <!-- <el-button
            size="mini"
            icon="el-icon-refresh"
            @click="handleRefresh(scope.$index, scope.row)"
            circle
          ></el-button>-->
        </div>
        <div class="handle_box">
          <el-button
            icon="el-icon-finished"
            @click="statusFilter(2)"
            v-if="permission == 3"
            round
          >只显示已审核</el-button>
          <el-button
            icon="el-icon-truck"
            @click="statusFilter(3)"
            v-if="permission == 3"
            round
          >只显示已收货</el-button>
          <el-button icon="el-icon-plus" @click="openAddDialog" round>添加</el-button>
          <el-button icon="el-icon-receiving" @click="exportData()" round>导出</el-button>
        </div>
      </div>
      <el-table
        ref="filterTable"
        :data="ordersData.slice((currentPage - 1) * pagesize,currentPage * pagesize)"
        style="width: 100%"
        :default-sort="{prop: 'order_creattime', order: 'descending'}"
      >
        <el-table-column label="订单号" prop="order_number" sortable></el-table-column>
        <el-table-column label="销售客服" prop="user_name" sortable></el-table-column>
        <el-table-column label="客户姓名" prop="customer_name" sortable></el-table-column>
        <el-table-column label="所属部门" prop="department_name" sortable></el-table-column>
        <el-table-column label="快递单号" prop="order_express" sortable></el-table-column>
        <el-table-column label="订单状态" prop="order_status_text" sortable></el-table-column>
        <el-table-column label="录单时间" prop="order_creattime" sortable></el-table-column>
        <el-table-column label="发货日期" prop="order_delivery" sortable></el-table-column>
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
              type="success"
              icon="el-icon-s-flag"
              size="mini"
              circle
              @click="openAuditLevelDialog(scope.$index, scope.row)"
              v-if="permission == 0"
            ></el-button>
            <el-button
              type="success"
              icon="el-icon-document-copy"
              size="mini"
              circle
              @click="outputData(scope.$index, scope.row)"
              v-if="permission == 3"
            ></el-button>
            <el-button
              icon="el-icon-delete"
              size="mini"
              type="danger"
              circle
              @click="deleteOrders(scope.$index, scope.row)"
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
        :total="ordersData.length"
      ></el-pagination>
    </div>
    <el-dialog :title="dialogTitle" :visible.sync="dialogAddVisible" width="600px">
      <el-form ref="ordersForm" :rules="ordersFormRule" :model="ordersForm" label-width="120px">
        <div class="ordersForm">
          <el-tabs v-model="activeName" @tab-click="handleClick">
            <el-tab-pane label="客户信息" name="1">
              <div class="select_box" v-if="dialogAddToggle === true">
                <el-button type="success" @click="openSelectUserDialog()" :disabled="finished">客户</el-button>
                <el-button
                  type="success"
                  @click="openSelectExpressDialog()"
                  :disabled="finished"
                >收货地址</el-button>
              </div>
              <el-form-item label="客户姓名 :" prop="customer_name">
                <el-input v-model="ordersForm.customer_name" :disabled="true" placeholder></el-input>
              </el-form-item>
              <el-form-item label="微信号 :" prop="customer_wechat_qq">
                <el-input v-model="ordersForm.customer_wechat_qq" :disabled="true" placeholder></el-input>
              </el-form-item>
              <el-form-item label="收件人 :" prop="express_receiver">
                <el-input v-model="ordersForm.express_receiver" :disabled="true" placeholder></el-input>
              </el-form-item>
              <el-form-item label="联系电话 :" prop="express_phone">
                <el-input v-model="ordersForm.express_phone" :disabled="true" placeholder></el-input>
              </el-form-item>
              <el-form-item label="邮编/区号 :" prop="express_postalcode">
                <el-input v-model="ordersForm.express_postalcode" :disabled="true" placeholder></el-input>
              </el-form-item>
              <el-form-item label="收货地址 :" prop="express_address_all">
                <el-input
                  type="textarea"
                  v-model="ordersForm.express_address_all"
                  :disabled="true"
                  placeholder
                ></el-input>
              </el-form-item>
              <el-dialog
                title="选择客户"
                :visible.sync="dialogChooseUserVisible"
                width="450px"
                append-to-body
              >
                <div class="search_box">
                  <el-input v-model="listSearch" size="mini" placeholder="请输入昵称或账号搜索" />
                </div>
                <div class="list_box">
                  <el-table
                    ref="filterTable"
                    :data="customersDatas"
                    style="width: 100%"
                    :default-sort="{prop: 'user_code', order: 'descending'}"
                  >
                    <el-table-column label="姓名" prop="customer_name" sortable></el-table-column>
                    <el-table-column label="联系电话" prop="customer_phone" sortable></el-table-column>
                    <el-table-column label="负责人" prop="user_id" sortable></el-table-column>
                    <el-table-column label="操作">
                      <template slot-scope="scope">
                        <el-button
                          type="primary"
                          icon="el-icon-edit"
                          size="mini"
                          circle
                          @click="setUser(scope.$index, scope.row)"
                        ></el-button>
                      </template>
                    </el-table-column>
                  </el-table>
                </div>
              </el-dialog>
              <el-dialog
                title="选择客户"
                :visible.sync="dialogChooseExpressVisible"
                width="450px"
                append-to-body
              >
                <div class="list_box">
                  <el-table
                    ref="filterTable"
                    :data="expressData"
                    style="width: 100%"
                    :default-sort="{prop: 'express_receiver', order: 'descending'}"
                  >
                    <el-table-column label="收件人" prop="express_receiver" sortable></el-table-column>
                    <el-table-column label="联系电话" prop="express_phone" sortable></el-table-column>
                    <el-table-column label="收货地址" prop="express_address_all" sortable></el-table-column>
                    <el-table-column label="操作">
                      <template slot-scope="scope">
                        <el-button
                          type="primary"
                          icon="el-icon-edit"
                          size="mini"
                          circle
                          @click="setExpress(scope.$index, scope.row)"
                        ></el-button>
                      </template>
                    </el-table-column>
                  </el-table>
                </div>
              </el-dialog>
            </el-tab-pane>
            <el-tab-pane label="购买产品" name="2">
              <div class="select_box">
                <el-button
                  type="success"
                  @click="openSelectSaleDialog()"
                  v-if="dialogAddToggle === true"
                  :disabled="finished"
                >添加产品</el-button>
              </div>
              <el-table
                ref="filterTable"
                :data="ordersForm.sale_datas"
                style="width: 100%"
                :default-sort="{prop: 'express_receiver', order: 'descending'}"
              >
                <el-table-column label="产品名称" prop="goods_name" sortable></el-table-column>
                <el-table-column label="单价" prop="goods_price" sortable></el-table-column>
                <el-table-column label="数量" prop="sale_quantity" sortable></el-table-column>
                <el-table-column label="总价" prop="total_prices" sortable></el-table-column>
                <el-table-column label="操作">
                  <template slot-scope="scope">
                    <el-button
                      icon="el-icon-delete"
                      size="mini"
                      type="danger"
                      v-if="dialogAddToggle === true"
                      circle
                      @click="deleteSale(scope.$index, scope.row)"
                    ></el-button>
                  </template>
                </el-table-column>
              </el-table>
              <el-dialog
                title="添加产品"
                :visible.sync="dialogChooseGoodsVisible"
                width="600px"
                append-to-body
              >
                <!-- <div class="search_box">
                  <el-input v-model="listSearch" size="mini" placeholder="请输入昵称或账号搜索" />
                </div>-->
                <div class="list_box">
                  <el-table
                    ref="filterTable"
                    :data="goodsDatas"
                    style="width: 100%"
                    :default-sort="{prop: 'goods_type_id', order: 'descending'}"
                  >
                    <el-table-column label="商品类型" prop="goods_type_id" sortable></el-table-column>
                    <el-table-column label="产品名称" prop="goods_name" sortable></el-table-column>
                    <el-table-column label="单价" prop="goods_price" sortable></el-table-column>
                    <el-table-column label="操作">
                      <template slot-scope="scope">
                        <el-button
                          type="primary"
                          icon="el-icon-edit"
                          size="mini"
                          circle
                          @click="setSale(scope.$index, scope.row)"
                        ></el-button>
                      </template>
                    </el-table-column>
                  </el-table>
                </div>
              </el-dialog>
            </el-tab-pane>
            <el-tab-pane label="支付信息" name="3">
              <el-form-item label="支付方式 :" prop="order_pay_type">
                <el-select
                  v-model="ordersForm.order_pay_type"
                  :disabled="dialogAddToggle === false"
                  placeholder="请选择"
                >
                  <el-option
                    v-for="item in payOptions"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  ></el-option>
                </el-select>
              </el-form-item>
              <el-form-item label="总价(元) :" prop="order_price">
                <el-input v-model="ordersForm.order_price" :disabled="true" placeholder></el-input>
              </el-form-item>
              <el-form-item label="实收(元) :" prop="order_actual_price">
                <el-input
                  v-model="ordersForm.order_actual_price"
                  :disabled="dialogAddToggle === false"
                  placeholder
                ></el-input>
              </el-form-item>
              <el-form-item label="代收(元) :" prop="order_dai_price">
                <el-input
                  v-model="ordersForm.order_dai_price"
                  :disabled="dialogAddToggle === false"
                  placeholder
                ></el-input>
              </el-form-item>
              <el-form-item label="出单帐号 :" prop="issuing_id">
                <el-select
                  v-model="ordersForm.issuing_id"
                  :disabled="dialogAddToggle === false"
                  placeholder="请选择"
                >
                  <el-option
                    v-for="item in issuingOptions"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  ></el-option>
                </el-select>
              </el-form-item>
              <el-form-item label="销售备注 :" prop="order_sale_remarks">
                <el-input
                  type="textarea"
                  :disabled="dialogAddToggle === false"
                  v-model="ordersForm.order_sale_remarks"
                  placeholder
                ></el-input>
              </el-form-item>
              <el-form-item label="支付图片 :" prop="order_pic">
                <upload @uploadPic="showUploadMessage" :sendPic="this.fileList"></upload>
              </el-form-item>
            </el-tab-pane>
            <el-tab-pane label="仓库信息" v-if="dialogAddToggle === false" name="4">
              <el-form-item label="快递类别 :" prop="order_express_type">
                <el-select
                  v-model="ordersForm.order_express_type"
                  :disabled="permission < 3"
                  placeholder="请选择"
                >
                  <el-option
                    v-for="item in orderExpressOptions"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  ></el-option>
                </el-select>
              </el-form-item>
              <el-form-item label="快递单号 :" prop="order_express">
                <el-input v-model="ordersForm.order_express" placeholder :disabled="permission < 3"></el-input>
              </el-form-item>
              <el-form-item label="仓库备注 :" prop="order_store_remarks">
                <el-input
                  type="textarea"
                  v-model="ordersForm.order_store_remarks"
                  placeholder
                  :disabled="permission < 3"
                ></el-input>
              </el-form-item>
            </el-tab-pane>
          </el-tabs>
        </div>
        <el-form-item class="submit-btn">
          <el-button
            type="primary"
            @click="addOrders('ordersForm')"
            v-if="dialogAddToggle === true"
            :disabled="finished"
          >确定</el-button>
          <el-button
            type="primary"
            @click="updateOrders('ordersForm')"
            v-if="dialogAddToggle === false"
            v-show="permission == 3"
            :disabled="finished"
          >修改</el-button>
          <el-button
            @click="dialogAddVisible = false"
            v-if="permission == 3 || dialogAddToggle === true"
          >取 消</el-button>
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
import {
  formatNotDate,
  formatDate,
  tradeNo,
  cityMatch
} from "@/common/js/utils";
import { options } from "@/common/js/city";
import Upload from "@/components/component/upload/upload";
export default {
  data() {
    return {
      ordersData: [],
      isLoading: true,
      ordersSearchData: [],
      expressData: [],
      customersDatas: [],
      goodsDatas: [],
      saleData: [],
      cacheDatas: [],
      cacheCodeDatas: [],
      search: "",
      listSearch: "",
      currentPage: 1,
      pagesize: 10,
      value: true,
      finished: false,
      activeName: "1",
      dialogUpdateVisible: false,
      dialogChooseUserVisible: false,
      dialogChooseExpressVisible: false,
      dialogChooseGoodsVisible: false,
      dialogAddVisible: false,
      dialogAddressVisible: false,
      isCode: false,
      activeName: "1",
      dialogTitle: "",
      dialogAddToggle: true,
      dialogAddressToggle: true,
      amount: 1,
      fileList: [],
      ordersForm: {
        order_number: "",
        user_id: "",
        order_express: "",
        order_creattime: "",
        order_delivery: "",
        customer_id: 0,
        customer_name: "",
        customer_wechat_qq: "",
        express_receiver: "",
        express_phone: "",
        express_postalcode: "",
        express_address: "",
        express_address_ssx: "",
        express_address_all: "",
        goods_id: "",
        order_pay_type: "",
        order_prcice: 0,
        order_actual_price: 0,
        order_dai_price: 0,
        goods_price: "",
        issuing_id: "",
        order_express_type: "",
        order_sale_remarks: "",
        order_store_remarks: "",
        order_id: "",
        sale_quantity: "",
        total_prices: "",
        sale_datas: []
      },
      ordersFormRule: {
        customer_name: [{ required: true, message: "必填项", trigger: "blur" }],
        express_receiver: [
          { required: true, message: "必填项", trigger: "blur" }
        ],
        express_phone: [
          { required: true, message: "必填项", trigger: "blur" },
          { type: "string", max: 11, min: 11, message: " ", trigger: "blur" }
        ],
        express_address_all: [
          { required: true, message: "必填项", trigger: "blur" }
        ],
        order_pay_type: [
          { required: true, message: "必填项", trigger: "blur" }
        ],
        order_price: [{ required: true, message: "必填项", trigger: "blur" }],
        order_actual_price: [
          { required: true, message: "必填项", trigger: "blur" }
        ],
        issuing_id: [{ required: true, message: "必填项", trigger: "blur" }]
      },
      issuingOptions: [],
      payOptions: [
        {
          value: "1",
          label: "货到付款"
        },
        {
          value: "2",
          label: "微信"
        },
        {
          value: "3",
          label: "支付宝"
        }
      ],
      orderExpressOptions: [
        {
          value: "6",
          label: "圆通"
        },
        {
          value: "1",
          label: "顺丰"
        },
        {
          value: "2",
          label: "韵达"
        },
        {
          value: "3",
          label: "中通"
        },
        {
          value: "4",
          label: "EMS"
        },
        {
          value: "5",
          label: "自提"
        },
        {
          value: "7",
          label: "申通"
        }
      ],
      exportList: [],
      err: "",
      permission: 10,
      user_id: 0
    };
  },
  created() {
    this.getOrders();
  },
  watch: {
    search: {
      handler(newValue, oldValue) {
        let _search = this.search;
        this.ordersData = this.ordersSearchData.filter(
          data =>
            !_search ||
            data.customer_name.toLowerCase().includes(_search.toLowerCase()) ||
            data.order_number.toLowerCase().includes(_search.toLowerCase()) ||
            data.user_name.toLowerCase().includes(_search.toLowerCase())
        );
      }
    }
  },
  methods: {
    // 获取数据
    getOrders() {
      const USER_PERMISSION = localStorage.getItem("USER_PERMISSION");
      const DEPARTMENT_ID = localStorage.getItem("DEPARTMENT_ID");
      const USER_ID = localStorage.getItem("USER_ID");
      this.permission = USER_PERMISSION;
      this.department_id = DEPARTMENT_ID;
      this.user_id = USER_ID;
      const params = qs.stringify({
        user_id: USER_ID
      });

      this.handleGet("/order").then(datas => {
        this.handleGet("/users").then(data2 => {
          this.handleGet("/customer").then(data3 => {
            this.handleGet("/departments").then(data4 => {
              console.log(data4);
              for (let i = 0; i < datas.length; i++) {
                for (let j = 0; j < data2.length; j++) {
                  if (datas[i].user_id == data2[j].user_id) {
                    datas[i].user_name = data2[j].user_name;
                  }
                }
                for (let k = 0; k < data3.length; k++) {
                  if (datas[i].customer_id == data3[k].customer_id) {
                    datas[i].customer_name = data3[k].customer_name;
                  }
                }
                for (let l = 0; l < data4.length; l++) {
                  if (datas[i].department_code == data4[l].department_code) {
                    datas[i].department_name = data4[l].department_name;
                  }
                }
                datas[i].order_creattime = formatDate(datas[i].order_creattime);
                datas[i].order_delivery =
                  datas[i].order_delivery == null
                    ? ""
                    : formatDate(datas[i].order_delivery);
                if (datas[i].order_status == 1) {
                  datas[i].order_status_text = "已下单";
                } else if (datas[i].order_status == 2) {
                  datas[i].order_status_text = "已审核";
                } else if (datas[i].order_status == 3) {
                  datas[i].order_status_text = "已发货";
                }
              }

              if (USER_PERMISSION == 2) {
                let user_order = [];
                datas.map(item => {
                  if (item.user_id == USER_ID) {
                    user_order.push(item);
                  }
                });
                this.ordersData = user_order;
              } else if (USER_PERMISSION == 1) {
                let user_order = [];
                datas.map(item => {
                  let itemDepartment = item.department_code.split(",");
                  if (itemDepartment[0] == DEPARTMENT_ID) {
                    user_order.push(item);
                  }
                });
                this.ordersData = user_order;
              } else if (USER_PERMISSION == 0) {
                this.ordersData = datas;
              } else if (USER_PERMISSION == 3) {
                let user_order = [];
                datas.map(item => {
                  if (item.order_status == 2 || item.order_status == 3) {
                    user_order.push(item);
                  }
                });
                this.ordersData = user_order;
              }
              this.ordersSearchData = this.ordersData;
              console.log(this.ordersSearchData);
              this.isLoading = false;
            });
          });
        });
      });
    },
    // 新增数据弹窗
    openAddDialog() {
      this.isCode = false;
      this.dialogAddToggle = true;
      this.ordersForm = {
        order_number: "",
        user_id: "",
        order_express: "",
        order_creattime: "",
        order_delivery: "",
        customer_id: 0,
        customer_name: "",
        customer_wechat_qq: "",
        express_id: "",
        express_receiver: "",
        express_phone: "",
        express_postalcode: "",
        express_address: "",
        express_address_ssx: "",
        express_address_all: "",
        goods_id: "",
        order_pay_type: "",
        order_price: 0,
        order_actual_price: 0,
        order_dai_price: 0,
        goods_price: "",
        issuing_id: "",
        order_express_type: "",
        order_sale_remarks: "",
        order_store_remarks: "",
        order_id: "",
        sale_quantity: "",
        total_prices: "",
        sale_datas: [],
        order_pic: []
      };

      const params = qs.stringify({
        user_id: this.$store.getters.user_data.user_id
      });
      this.handlePost("/issu", params).then(datas => {
        this.issuingOptions = datas;
        console.log(this.issuing);
      });

      this.dialogAddVisible = true;
    },
    // 新增数据
    addOrders(formName) {
      // 防止重复提交
      this.finished = true;
      let timestamp = new Date().getTime();
      if (this.cacheCodeDatas.length > 0) {
        const registData = {
          order_number: tradeNo(),
          user_id: this.user_id,
          order_creattime: timestamp,
          customer_id: this.ordersForm.customer_id,
          customer_name: this.ordersForm.customer_name,
          customer_wechat_qq: this.ordersForm.customer_wechat_qq,
          express_id: this.ordersForm.express_id,
          express_receiver: this.ordersForm.express_receiver,
          express_phone: this.ordersForm.express_phone,
          express_postalcode: this.ordersForm.express_postalcode,
          express_address: this.ordersForm.express_address,
          order_pay_type: this.ordersForm.order_pay_type,
          order_price: this.ordersForm.order_price,
          order_actual_price: this.ordersForm.order_actual_price,
          order_dai_price: this.ordersForm.order_dai_price,
          issuing_id: this.ordersForm.issuing_id,
          order_express_type: this.ordersForm.order_express_type,
          order_sale_remarks: String(this.ordersForm.order_sale_remarks),
          order_store_remarks: String(this.ordersForm.order_store_remarks),
          sale_datas: this.cacheCodeDatas,
          department_code: this.department_id,
          order_pic: JSON.stringify(this.fileList)
        };
        console.log(registData);
        this.$refs[formName].validate(valid => {
          if (valid) {
            this.finished = false;
            this.dialogAddVisible = false;
            this.$http.post("/order/add", registData).then(
              res => {
                this.$message({
                  message: "添加成功",
                  type: "success",
                  duration: 3000
                });
                this.finished = false;
                this.dialogAddVisible = false;
                this.getOrders();
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
      } else {
        this.$message({
          message: "下单时请添加产品",
          type: "warning",
          duration: 3000
        });
        this.finished = false;
      }
    },
    // 修改数据弹窗
    openEditDialog(index, data) {
      this.dialogAddTitle = "修改订单";
      this.dialogAddToggle = false;

      const param = qs.stringify({
        user_id: this.user_id
      });
      console.log(param);
      this.handlePost("/issu", param).then(datas => {
        this.issuingOptions = datas;
      });

      const params = qs.stringify({
        customer_id: data.customer_id,
        order_id: data.order_id,
        express_id: data.express_id
      });

      this.$http
        .post("/order/all", params)
        .then(res => {
          this.handleGet("/goods").then(datas => {
            if (res.data.err === 0) {
              let orderPart = res.data;

              orderPart.saleData.map(item => {
                item.total_prices = item.goods_price * item.sale_quantity;
                datas.map(item2 => {
                  if (item.goods_id == item2.goods_id) {
                    item.goods_name = item2.goods_name;
                  }
                });
              });

              this.ordersForm = {
                order_number: data.order_number,
                user_id: data.user_id,
                order_express: data.order_express,
                order_creattime: data.order_creattime,
                order_delivery: data.order_delivery,
                customer_id: data.customer_id,
                customer_name: orderPart.customerData[0].customer_name,
                customer_wechat_qq: orderPart.customerData[0].customer_wechat
                  ? orderPart.customerData[0].customer_wechat
                  : orderPart.customerData[0].customer_qq,
                express_receiver: orderPart.expressData.express_receiver,
                express_phone: orderPart.expressData.express_phone,
                express_postalcode: orderPart.expressData.express_postalcode,
                express_address_ssx: orderPart.expressData.express_address_ssx,
                express_address: orderPart.expressData.express_address,
                express_address_all:
                  cityMatch(
                    orderPart.expressData.express_address_ssx.split(","),
                    options
                  ) +
                  " " +
                  orderPart.expressData.express_address,
                order_pay_type: data.order_pay_type,
                order_price: data.order_price,
                order_actual_price: data.order_actual_price,
                order_dai_price: data.order_dai_price,
                issuing_id: data.issuing_id,
                order_express_type: data.order_express_type,
                order_sale_remarks: data.order_sale_remarks,
                order_store_remarks: data.order_store_remarks,
                order_id: data.order_id,
                sale_datas: orderPart.saleData
              };
              console.log(this.ordersForm);
              this.fileList = data.order_pic ? JSON.parse(data.order_pic) : [];
            } else {
              this.$message({
                message: res.data.msg,
                type: "warning",
                duration: 3000
              });
            }
          });
        })
        .catch(err => {
          console.log(err);
        });

      this.dialogAddVisible = true;
    },
    // 修改数据
    updateOrders() {
      let timestamp = new Date().getTime();
      const param = {
        order_id: this.ordersForm.order_id,
        order_express_type: this.ordersForm.order_express_type,
        order_express: this.ordersForm.order_express,
        order_store_remarks: this.ordersForm.order_store_remarks,
        order_delivery: timestamp
      };
      const params = qs.stringify({
        order_id: this.ordersForm.order_id,
        order_express_type: this.ordersForm.order_express_type,
        order_express: this.ordersForm.order_express,
        order_store_remarks: this.ordersForm.order_store_remarks,
        order_delivery: timestamp
      });
      console.log(param);
      this.$http
        .post("/order/update", params)
        .then(res => {
          console.log(res.data);
          // 影响行数大于0
          if (res.data.err === 0) {
            this.$message({
              message: "修改成功",
              type: "success"
            });
            this.dialogAddVisible = false;
            this.getOrders();
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
    deleteOrders(index, data) {
      this.$confirm("是否删除?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(() => {
          const deleteNode = {
            id: data.order_id
          };
          this.$http.post("/order/delete", deleteNode).then(
            res => {
              this.$message({
                message: "删除成功",
                type: "success",
                duration: 3000
              });
              this.getOrders();
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
    // 选择下单人弹窗
    openSelectUserDialog() {
      let customersArr = [];
      const params = qs.stringify({
        user_id: this.user_id
      });
      this.handlePost("/customer/assign", params).then(datas => {
        this.customersDatas = datas;
      });
      this.dialogChooseUserVisible = true;
    },
    // 设置下单人
    setUser(index, data) {
      let params = qs.stringify({
        customer_id: data.customer_id
      });

      this.expressData = [];
      this.ordersForm.express_id = "";
      this.ordersForm.express_receiver = "";
      this.ordersForm.express_phone = "";
      this.ordersForm.express_postalcode = "";
      this.ordersForm.express_address_ssx = "";
      this.ordersForm.express_address = "";
      this.ordersForm.express_address_all = "";

      this.$http
        .post("/expres", params)
        .then(res => {
          this.expressData = res.data.data;
          let indexExpress = this.expressData[0];
          this.ordersForm.customer_id = data.customer_id;
          this.ordersForm.customer_name = data.customer_name;
          this.ordersForm.customer_wechat_qq = data.customer_wechat
            ? data.customer_wechat
            : data.customer_qq;
          this.ordersForm.express_id = indexExpress.express_id
            ? indexExpress.express_id
            : "";
          this.ordersForm.express_receiver = indexExpress.express_receiver
            ? indexExpress.express_receiver
            : "";
          this.ordersForm.express_phone = indexExpress.express_phone
            ? indexExpress.express_phone
            : "";
          this.ordersForm.express_postalcode = indexExpress.express_postalcode
            ? indexExpress.express_postalcode
            : "";
          this.ordersForm.express_address_ssx = indexExpress.express_address_ssx
            ? indexExpress.express_address_ssx
            : "";
          this.ordersForm.express_address = indexExpress.express_address
            ? indexExpress.express_address
            : "";
          this.ordersForm.express_address_all =
            cityMatch(indexExpress.express_address_ssx.split(","), options) +
            indexExpress.express_address
              ? cityMatch(
                  indexExpress.express_address_ssx.split(","),
                  options
                ) + indexExpress.express_address
              : "";

          console.log(this.ordersForm);
        })
        .catch(err => {
          console.log(err);
        });

      this.dialogChooseUserVisible = false;
    },
    // 选择收货地址弹窗
    openSelectExpressDialog() {
      this.dialogChooseExpressVisible = true;
    },
    // 设置收货信息
    setExpress(index, data) {
      console.log(data);
      this.ordersForm.express_id = data.express_id;
      this.ordersForm.express_receiver = data.express_receiver
        ? data.express_receiver
        : "";
      this.ordersForm.express_phone = data.express_phone
        ? data.express_phone
        : "";
      this.ordersForm.express_postalcode = data.express_postalcode
        ? data.express_postalcode
        : "";
      this.ordersForm.express_address_ssx = data.express_address_ssx
        ? data.express_address_ssx
        : "";
      this.ordersForm.express_address = data.express_address
        ? data.express_address
        : "";
      this.ordersForm.express_address_all =
        cityMatch(data.express_address_ssx, options) + data.express_address
          ? cityMatch(data.express_address_ssx, options) + data.express_address
          : "";
      this.dialogChooseExpressVisible = false;
    },
    // 选择产品弹窗
    openSelectSaleDialog() {
      this.ordersForm.sale_datas = [];
      this.ordersForm.order_prcice = 0;
      this.cacheCodeDatas = [];
      this.handleGet("/goods").then(datas => {
        this.goodsDatas = datas;
      });
      this.dialogChooseGoodsVisible = true;
    },
    // 选择产品
    setSale(index, data) {
      this.$prompt("请输入购买数量", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        inputPattern: /^[1-9][0-9]{0,2}$/,
        inputErrorMessage: "请输入1-999之间的数字"
      })
        .then(({ value }) => {
          this.ordersForm.order_price = 0;
          let isPush = true;
          let cacheData = {
            goods_id: data.goods_id,
            goods_price: data.goods_price,
            sale_quantity: Number(value)
          };

          for (let i = 0; i < this.cacheCodeDatas.length; i++) {
            if (this.cacheCodeDatas[i].goods_id == cacheData.goods_id) {
              this.cacheCodeDatas[i].sale_quantity += cacheData.sale_quantity;
              isPush = false;
            }
          }

          if (isPush) {
            this.cacheCodeDatas.push(cacheData);
          }

          let cacheDatas = this.cacheCodeDatas;
          let cacheArr = [];

          for (let j = 0; j < cacheDatas.length; j++) {
            for (let i = 0; i < this.goodsDatas.length; i++) {
              if (this.goodsDatas[i].goods_id == cacheDatas[j].goods_id) {
                let obj = {
                  goods_name: this.goodsDatas[i].goods_name,
                  goods_code: this.goodsDatas[i].goods_code,
                  goods_price: this.goodsDatas[i].goods_price,
                  sale_quantity: cacheDatas[j].sale_quantity,
                  total_prices:
                    Number(this.goodsDatas[i].goods_price) *
                    Number(cacheDatas[j].sale_quantity)
                };
                this.ordersForm.order_price += obj.total_prices;
                cacheArr.push(obj);
              }
            }
          }

          this.ordersForm.sale_datas = cacheArr;

          this.$notify({
            title: "success",
            message: "购买: " + data.goods_name + " x " + value,
            duration: 0
          });
        })
        .catch(() => {
          console.log("取消");
        });
    },
    // 删除选择产品
    deleteSale(index, data) {
      this.cacheDatas.splice(index, 1);
      this.cacheCodeDatas.splice(index, 1);
      this.ordersForm.sale_datas.splice(index, 1);

      this.ordersForm.order_price =
        this.ordersForm.order_price - data.goods_price * data.sale_quantity;
      console.log(this.ordersForm.order_price);
    },
    // 从upload获取图片链接
    showUploadMessage(data) {
      this.fileList = data;
    },
    // 审核
    openAuditLevelDialog(index, data) {
      console.log(data);
      this.$confirm("是否通过订单审核?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(() => {
          if (data.order_status == "1") {
            const params = qs.stringify({
              order_id: data.order_id,
              order_status: 2
            });
            this.$http
              .post("/order/status", params)
              .then(res => {
                console.log(res.data);
                // 影响行数大于0
                if (res.data.err === 0) {
                  this.$message({
                    type: "success",
                    message: "审核通过,等待发货!"
                  });
                }
                this.getOrders();
              })
              .catch(err => {
                console.log(err);
                this.$message.error("修改失败，请重试");
              });
          } else {
            this.$message({
              type: "danger",
              message: "无需审核"
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
    // 发货弹窗
    openDeliverDialog(index, data) {
      this.dialogAddTitle = "订单发货";
      this.dialogAddToggle = false;
      this.dialogAddVisible = true;
    },
    // 修改发货
    updateOrders() {
      let timestamp = new Date().getTime();
      const param = {
        order_id: this.ordersForm.order_id,
        order_express_type: this.ordersForm.order_express_type,
        order_express: this.ordersForm.order_express,
        order_store_remarks: this.ordersForm.order_store_remarks,
        order_delivery: timestamp
      };
      const params = qs.stringify({
        order_id: this.ordersForm.order_id,
        order_express_type: this.ordersForm.order_express_type,
        order_express: this.ordersForm.order_express,
        order_store_remarks: this.ordersForm.order_store_remarks,
        order_delivery: timestamp,
        order_status: 3
      });
      console.log(param);
      this.$http
        .post("/order/update", params)
        .then(res => {
          console.log(res.data);
          // 影响行数大于0
          if (res.data.err === 0) {
            this.$message({
              message: "修改成功",
              type: "success"
            });
            this.dialogAddVisible = false;
            this.getOrders();
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

      this.handleGet("/order").then(datas => {
        this.handleGet("/users").then(data2 => {
          this.handleGet("/customer").then(data3 => {
            this.handleGet("/express").then(data4 => {
              this.handleGet("/sale").then(data5 => {
                this.handleGet("/goods").then(data6 => {
                  for (let i = 0; i < datas.length; i++) {
                    let obj = [];
                    for (let j = 0; j < data2.length; j++) {
                      if (datas[i].user_id == data2[j].user_id) {
                        datas[i].user_name = data2[j].user_name;
                      }
                    }
                    for (let k = 0; k < data3.length; k++) {
                      if (datas[i].customer_id == data3[k].customer_id) {
                        datas[i].customer_name = data3[k].customer_name;
                      }
                    }
                    for (let l = 0; l < data4.length; l++) {
                      data4[l].express_address_all =
                        cityMatch(data4[l].express_address_ssx, options) +
                        data4[l].express_address
                          ? cityMatch(data4[l].express_address_ssx, options) +
                            data4[l].express_address
                          : "";
                      if (datas[i].customer_id == data4[l].customer_id) {
                        Object.assign(datas[i], data4[l]);
                      }
                    }
                    for (let m = 0; m < data5.length; m++) {
                      if (datas[i].order_id == data5[m].order_id) {
                        obj.push(data5[m]);
                      }
                    }

                    datas[i].saleData = obj;

                    for (let n = 0; n < datas[i].saleData.length; n++) {
                      for (let o = 0; o < data6.length; o++) {
                        if (
                          datas[i].saleData[n].goods_id == data6[o].goods_id
                        ) {
                          datas[i].saleData[n].goods_name = data6[o].goods_name;
                        }
                      }
                    }

                    datas[i].order_creattime = formatDate(
                      datas[i].order_creattime
                    );
                    datas[i].order_delivery =
                      datas[i].order_delivery == null
                        ? ""
                        : formatDate(datas[i].order_delivery);
                    if (datas[i].order_status == 1) {
                      datas[i].order_status_text = "已下单";
                    } else if (datas[i].order_status == 2) {
                      datas[i].order_status_text = "已审核";
                    } else if (datas[i].order_status == 3) {
                      datas[i].order_status_text = "已发货";
                    }
                  }

                  this.exportList = datas;

                  console.log(this.exportList);
                  this.export2Excel();
                });
              });
            });
          });
        });
      });
    },
    // 导出excel数据
    export2Excel() {
      let list = this.exportList;

      for (let i = 0; i < list.length; i++) {
        list[i].saleDataTxt = "";
        for (let j = 0; j < list[i].saleData.length; j++) {
          list[i].saleData[j] =
            list[i].saleData[j].goods_name +
            "*" +
            list[i].saleData[j].sale_quantity;
          list[i].saleDataTxt += list[i].saleData[j] + ",";
        }
      }

      require.ensure([], () => {
        const {
          export_json_to_excel
        } = require("@/components/component/excel/Export2Excel");

        const tHeader = [
          "订单号",
          "销售客服",
          "客户姓名",
          "下单日期",
          "发货日期",
          "收件人",
          "联系电话",
          "收货地址",
          "总价",
          "实收",
          "代收",
          "销售备注",
          "物流方式",
          "快递单号",
          "仓库备注",
          "明细"
        ];

        const filterVal = [
          "order_number",
          "user_name",
          "customer_name",
          "order_creattime",
          "order_delivery",
          "express_receiver",
          "express_phone",
          "express_address_all",
          "order_price",
          "order_actual_price",
          "order_dai_price",
          "order_sale_remarks",
          "order_express_type",
          "order_express",
          "order_store_remarks",
          "saleData"
        ];

        const data = this.formatJson(filterVal, list);

        export_json_to_excel(tHeader, data, "**报表" + new Date().getTime());
      });
    },
    // 复制数据data
    outputData(index, data) {
      const params = qs.stringify({
        customer_id: data.customer_id,
        order_id: data.order_id,
        express_id: data.express_id
      });

      this.$http
        .post("/order/all", params)
        .then(res => {
          let personData = res.data;
          let personDatas =
            personData.expressData.express_receiver +
            "," +
            personData.customerData[0].customer_phone +
            "," +
            cityMatch(
              personData.expressData.express_address_ssx.split(","),
              options
            ) +
            personData.expressData.express_address;

          this.copy(personDatas);
        })
        .catch(err => {
          console.log(err);
        });
    },
    // 复制数据
    copy(data) {
      this.$copyText(data).then(
        e => {
          this.$message({
            message: "复制成功:" + e.text,
            type: "success"
          });
        },
        e => {
          console.log(e);
          alert("无法复制");
        }
      );
    },
    // 订单状态过滤
    statusFilter(status) {
      setTimeout(() => {
        let onlyCheckData = [];
        this.ordersSearchData.map(item => {
          if (item.order_status == status) {
            onlyCheckData.push(item);
          }
        });
        this.ordersData = onlyCheckData;
      }, 0);
    },
    formatJson(filterVal, jsonData) {
      return jsonData.map(v => filterVal.map(j => v[j]));
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
    Upload,
    Loading
  }
};
</script>
<style lang="less" scoped>
.orders_box {
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

    /deep/.el-table__body {
      table-layout: auto;
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

.el-input.is-disabled /deep/ .el-input__inner,
.el-textarea.is-disabled /deep/ .el-textarea__inner {
  background-color: #fff;
  color: #333;
}
</style>
