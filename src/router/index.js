//公用
const Login = (resolve) => {
  import('@/components/login').then((module) => {
    resolve(module)
  })
}
const Index = (resolve) => {
  import('@/components/index').then((module) => {
    resolve(module)
  })
}
const DepartmentManage = (resolve) => {
  import('@/components/departmentManage').then((module) => {
    resolve(module)
  })
}
const UserManage = (resolve) => {
  import('@/components/userManage').then((module) => {
    resolve(module)
  })
}
const SysNotice = (resolve) => {
  import('@/components/sysNotice').then((module) => {
    resolve(module)
  })
}
const CustomerManage = (resolve) => {
  import('@/components/customerManage').then((module) => {
    resolve(module)
  })
}
const Issuing = (resolve) => {
  import('@/components/issuing').then((module) => {
    resolve(module)
  })
}
const OrderManage = (resolve) => {
  import('@/components/orderManage').then((module) => {
    resolve(module)
  })
}
const GoodsType = (resolve) => {
  import('@/components/goodsType').then((module) => {
    resolve(module)
  })
}
const GoodsManage = (resolve) => {
  import('@/components/goodsManage').then((module) => {
    resolve(module)
  })
}
const GoodsStop = (resolve) => {
  import('@/components/goodsStop').then((module) => {
    resolve(module)
  })
}



export default [
  {
    path: '/',
    redirect: '/index'
  },
  {
    path: '/index',
    name: 'Index',
    component: Index,
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/login',
    name: 'Login',
    component: Login
  },
  {
    path: '/oa',
    redirect: '/departmentManage'
  },
  {
    path: '/departmentManage',
    name: 'DepartmentManage',
    component: DepartmentManage,
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/userManage',
    name: 'UserManage',
    component: UserManage,
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/sysNotice',
    name: 'SysNotice',
    component: SysNotice,
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/customerManage',
    name: 'CustomerManage',
    component: CustomerManage,
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/issuing',
    name: 'Issuing',
    component: Issuing,
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/orderManage',
    name: 'OrderManage',
    component: OrderManage,
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/goodsType',
    name: 'GoodsType',
    component: GoodsType,
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/goodsManage',
    name: 'GoodsManage',
    component: GoodsManage,
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/goodsStop',
    name: 'GoodsStop',
    component: GoodsStop,
    meta: {
      requiresAuth: true
    }
  }
]