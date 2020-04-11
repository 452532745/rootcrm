const express = require('express')
const mysql = require('mysql')
const Jwt = require('./jwt')
const { aesEncrypt, aesDecrypt, formatDate } = require('../libs/common')
const multer = require('multer')

const db = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '', // HWMfOczgFlRhwSiq6SF6B
  database: 'crm_oa'
})

//上传的文件保存在 upload
const storage = multer.diskStorage({
  //存储的位置
  destination(req, file, cb) {
    cb(null, 'upload/')
  },
  //文件名字的确定 multer默认帮我们取一个没有扩展名的文件名，因此需要我们自己定义
  filename(req, file, cb) {
    cb(null, Date.now() + file.originalname)
  }
})

// 将配置应用到multer上
const upload = multer({ storage })

module.exports = () => {
  // aes 密钥
  let key = 'password'

  const route = express.Router()

  // 文件上传,作为中间件使用
  route.post('/uploads', upload.single('file'), (req, res) => {
    console.log(res.req.file)
    let filename = res.req.file.path
    return res.json({
      code: 200,
      data: filename
    })
  })

  route.post('/login', (req, res) => {
    let userName = req.body.username
    let pass = req.body.password
    const getStr = `SELECT * FROM users WHERE user_code='${userName}'`


    console.log(getStr)

    new Promise((resolve, reject) => {
      // 根据用户名查询用户
      db.query(getStr, (err, data) => {
        if (err) {
          reject(err)
        } else {
          resolve(data)
        }
      })
    }).then((data) => {
      if (data) {
        // 密码解密 利用aes
        let aes = data[0].user_password
        let password = aesDecrypt(aes, key)
        console.log(pass + ' ' + password)
        if (pass == password) {
          // 登陆成功，添加token验证
          let _id = (data[0].user_id).toString()
          // 将用户id传入并生成token
          let jwt = new Jwt(_id)
          let token = jwt.generateToken()
          // 将 token 返回给客户端
          if (data[0].department_id == 0) {
            res.status(200).send({
              data: data,
              msg: '超管登陆',
              token: token,
              err: 0,
              isAdmin: true
            })
          } else {
            res.status(200).send({
              data: data,
              msg: '普通用户登陆',
              token: token,
              err: 0,
              isAdmin: false
            })
          }
        } else {
          res.status(200).send({ msg: '账号密码错误' })
        }
      } else {
        res.status(404).send({ msg: '账号不存在' })
      }
    }).catch((err) => {
      console.log(err)
      res.status(500).send({ msg: '账号不存在' })
    })

  })

  // changPassword
  route.post('/user/changepwd', (req, res) => {
    let userName = req.body.username
    let oldpwd = req.body.oldpwd
    let newpwd = req.body.newpwd

    const getAdminStr = `SELECT user_password FROM users WHERE user_code = '${userName}'`

    new Promise((resolve, reject) => {
      db.query(getAdminStr, (err, data) => {
        if (err) {
          reject(err)
        } else {
          resolve(data)
        }
      })
    }).then((data) => {
      if (data) {
        let aes = data[0].user_password
        let password = aesDecrypt(aes, key)
        let updatePwd = aesEncrypt(newpwd, key)
        if (oldpwd == password) {
          const upAdminPwd = `UPDATE users SET user_password='${updatePwd}' WHERE user_code='${userName}'`
          db.query(upAdminPwd, (err, data) => {
            if (err) {
              console.log(err)
              return res.status(500).send('database err').end()
            } else {
              return res.status(200).send({ msg: '修改成功', err: 0 }).end()
            }
          })
        } else {
          return res.status(200).send({ msg: '原始密码错误，请重试', err: 1 }).end()
        }
      }
    }, (err) => {
      console.log(err)
      res.status(500).send({ msg: '网络错误，请稍后重试' })
    })
  })

  route.post('/user', (req, res) => {
    let userName = req.body.username
    console.log(userName)
    const getStr = `SELECT * FROM users WHERE user_code='${userName}'`

    db.query(getStr, (err, data) => {
      if (err) {
        console.log(err)
        return res.status(500).send('database err').end()
      } else {
        if (data.length === 0) {
          return res.status(500).send('no datas').end()
        } else {
          return res.status(200).send({
            data: data,
            msg: 'success',
            err: 0,
          })
        }
      }
    })

  })

  route.get('/users', (req, res) => {
    const getStr = `SELECT * FROM users`

    db.query(getStr, (err, data) => {
      if (err) {
        console.log(err)
        return res.status(500).send('database err').end()
      } else {
        if (data.length === 0) {
          return res.status(500).send('no datas').end()
        } else {
          return res.status(200).send({
            data: data,
            msg: 'success',
            err: 0,
          })
        }
      }
    })

  })

  route.post('/user/add', (req, res) => {
    let mObj = {}
    for (let obj in req.body) {
      mObj = JSON.parse(obj)
    }
    let code = mObj.code
    let name = mObj.name
    let phone = mObj.phone
    let time = mObj.time
    let post = mObj.post
    let state = mObj.state
    let department = mObj.department ? mObj.department : "暂无"
    let permission = department.length
    const insStr = `INSERT INTO users(user_code,user_name,user_phone,user_creattime,user_post,user_state,department_id,user_permission) VALUES('${code}','${name}','${phone}','${time}','${post}','${state}','${department}','${permission}')`
    db.query(insStr, (err, data) => {
      if (err) {
        console.error(err)
        res.status(500).send('服务器出错').end()
      } else {
        return res.status(200).send(data).end()
      }
    })
  })

  route.post('/user/update', (req, res) => {
    let id = req.body.user_id
    let phone = req.body.user_phone
    let creattime = req.body.user_creattime
    let deadline = req.body.user_deadline == "0" ? "" : req.body.user_deadline
    let post = req.body.user_post
    let state = req.body.user_state
    let departmentId = req.body.department_id
    let permission = req.body.department_id.split(",").length
    console.log(departmentId.length)

    const updateStr = `UPDATE users SET user_phone='${phone}',user_creattime='${creattime}',user_deadline='${deadline}',user_post='${post}',user_state='${state}',department_id='${departmentId}',user_permission='${permission}' WHERE user_id='${id}'`

    new Promise((resolve, reject) => {
      db.query(updateStr, (err, data) => {
        if (err) {
          reject(err)
        } else {
          resolve(data)
        }
      })
    }).then((data) => {
      return res.status(200).send({
        msg: '更新成功',
        err: 0,
      })
    }, (err) => {
      console.log(err)
      res.status(500).send({ msg: '网络错误，请稍后重试' })
    })
  })

  route.post('/user/delete', (req, res) => {
    let mObj = {}
    for (let obj in req.body) {
      mObj = JSON.parse(obj)
    }
    let id = mObj.id

    const deleteStr = `DELETE FROM users WHERE user_id='${id}'`

    // 插入用户信息
    db.query(deleteStr, (err, data) => {
      if (err) {
        console.error(err)
        res.status(500).send('服务器出错').end()
      } else {
        return res.status(200).send(data).end()
      }
    })
  })

  route.post('/user/password/update', (req, res) => {
    let mObj = {}
    for (let obj in req.body) {
      mObj = JSON.parse(obj)
    }
    let id = mObj.id
    let password = mObj.password
    let psd = aesEncrypt(password, key)

    const updateStr = `UPDATE users SET user_password='${psd}' WHERE user_id='${id}'`

    new Promise((resolve, reject) => {
      db.query(updateStr, (err, data) => {
        if (err) {
          reject(err)
        } else {
          resolve(data)
        }
      })
    }).then((data) => {
      return res.status(200).send({
        msg: '更新成功',
        err: 0,
      })
    }, (err) => {
      console.log(err)
      res.status(500).send({ msg: '网络错误，请稍后重试' })
    })

  })

  route.get('/department', (req, res) => {
    const getStr = `SELECT * FROM departments`

    db.query(getStr, (err, data) => {
      if (err) {
        console.log(err)
        return res.status(500).send('database err').end()
      } else {
        if (data.length === 0) {
          return res.status(500).send('no datas').end()
        } else {

          let departmentArrs = [];

          for (let i = 0; i < data.length; i++) {
            if (data[i].department_level == 1) {
              let obj = {
                id: data[i].department_id,
                label: data[i].department_name,
                level: data[i].department_level,
                top: data[i].department_top_id,
                value: data[i].department_id,
                children: []
              }
              departmentArrs.push(obj)
            }
          }

          for (let i = 0; i < data.length; i++) {
            for (let j = 0; j < departmentArrs.length; j++) {
              if (data[i].department_parent_id === departmentArrs[j].id) {
                let obj = {
                  id: data[i].department_id,
                  label: data[i].department_name,
                  level: data[i].department_level,
                  top: data[i].department_top_id,
                  value: data[i].department_id
                }
                departmentArrs[j].children.push(obj)
              }
            }
          }

          return res.status(200).send({
            data: departmentArrs,
            msg: '超管登陆',
            err: 0,
          })
        }
      }
    })

  })

  route.get('/departments', (req, res) => {
    const getStr = `SELECT * FROM departments`

    db.query(getStr, (err, data) => {
      if (err) {
        console.log(err)
        return res.status(500).send('database err').end()
      } else {
        if (data.length === 0) {
          return res.status(500).send('no datas').end()
        } else {
          return res.status(200).send({
            data: data,
            msg: '超管登陆',
            err: 0,
          })
        }
      }
    })

  })

  route.post('/department/add', (req, res) => {
    let mObj = {}
    for (let obj in req.body) {
      mObj = JSON.parse(obj)
    }
    let name = mObj.department_name
    let level = mObj.department_level
    let parent_id = mObj.department_parent_id
    let top_id = mObj.department_top_id
    const insStr = `INSERT INTO departments(department_name,department_level,department_parent_id,department_top_id) VALUES('${name}','${level}','${parent_id}','${top_id}')`
    // 插入用户信息
    db.query(insStr, (err, data) => {
      if (err) {
        console.error(err)
        res.status(500).send('服务器出错').end()
      } else {
        let department_id = data.insertId;
        let department_code = parent_id == "0" ? data.insertId : parent_id + "," + data.insertId;
        const updateStr = `UPDATE departments SET department_code='${department_code}' WHERE department_id='${department_id}'`
        db.query(updateStr, (err, data) => {
          if (err) {
            console.error(err)
            res.status(500).send('服务器出错').end()
          } else {
            return res.status(200).send(data).end()
          }
        })
      }
    })
  })

  route.post('/department/delete', (req, res) => {
    let mObj = {}
    for (let obj in req.body) {
      mObj = JSON.parse(obj)
    }
    let id = mObj.id

    const deleteStr = `DELETE FROM departments WHERE (department_id='${id}') OR (department_top_id='${id}')`

    // 插入用户信息
    db.query(deleteStr, (err, data) => {
      if (err) {
        console.error(err)
        res.status(500).send('服务器出错').end()
      } else {
        return res.status(200).send(data).end()
      }
    })
  })

  route.post('/department/update', (req, res) => {
    let name = req.body.name
    let id = req.body.id

    const updateStr = `UPDATE departments SET department_name='${name}' WHERE department_id='${id}'`

    new Promise((resolve, reject) => {
      db.query(updateStr, (err, data) => {
        if (err) {
          reject(err)
        } else {
          resolve(data)
        }
      })
    }).then((data) => {
      return res.status(200).send({
        msg: '更新成功',
        err: 0,
      })
    }, (err) => {
      console.log(err)
      res.status(500).send({ msg: '网络错误，请稍后重试' })
    })
  })

  route.get('/message', (req, res) => {
    const getStr = `SELECT * FROM messages`

    db.query(getStr, (err, data) => {
      if (err) {
        console.log(err)
        return res.status(500).send('database err').end()
      } else {
        if (data.length === 0) {
          return res.status(500).send('no datas').end()
        } else {
          return res.status(200).send({
            data: data,
            msg: 'success',
            err: 0,
          })
        }
      }
    })

  })

  route.post('/message/add', (req, res) => {
    let mObj = {}
    for (let obj in req.body) {
      mObj = JSON.parse(obj)
    }
    let mid = mObj.message_id
    let mtitle = mObj.message_title
    let mfor = mObj.message_for
    let mtext = mObj.message_text
    let mtime = mObj.message_time

    let insStr = ""

    if (mtime) {
      insStr = `INSERT INTO messages(message_id,message_title,message_for,message_text,message_time) VALUES('${mid}','${mtitle}','${mfor}','${mtext}','${mtime}')`
    } else {
      insStr = `INSERT INTO messages(message_id,message_title,message_for,message_text) VALUES('${mid}','${mtitle}','${mfor}','${mtext}')`
    }
    // 插入用户信息
    db.query(insStr, (err, data) => {
      if (err) {
        console.error(err)
        res.status(500).send('服务器出错').end()
      } else {
        return res.status(200).send(data).end()
      }
    })
  })

  route.post('/message/update', (req, res) => {
    let mid = req.body.message_id
    let mtitle = req.body.message_title
    let mfor = req.body.message_for
    let mtext = req.body.message_text
    let mtime = req.body.message_time

    let updateStr = ""

    if (mtime) {
      updateStr = `UPDATE messages SET message_title='${mtitle}',message_for='${mfor}',message_text='${mtext}',message_time='${mtime}' WHERE message_id='${mid}'`
    } else {
      updateStr = `UPDATE messages SET message_title='${mtitle}',message_for='${mfor}',message_text='${mtext}' WHERE message_id='${mid}'`
    }

    new Promise((resolve, reject) => {
      db.query(updateStr, (err, data) => {
        if (err) {
          reject(err)
        } else {
          resolve(data)
        }
      })
    }).then((data) => {
      return res.status(200).send({
        msg: '更新成功',
        err: 0,
      })
    }, (err) => {
      console.log(err)
      res.status(500).send({ msg: '网络错误，请稍后重试' })
    })
  })

  route.post('/message/delete', (req, res) => {
    let mObj = {}
    for (let obj in req.body) {
      mObj = JSON.parse(obj)
    }
    let id = mObj.id

    const deleteStr = `DELETE FROM messages WHERE message_id='${id}'`

    // 插入用户信息
    db.query(deleteStr, (err, data) => {
      if (err) {
        console.error(err)
        res.status(500).send('服务器出错').end()
      } else {
        return res.status(200).send(data).end()
      }
    })
  })

  route.get('/customer', (req, res) => {
    const getStr = `SELECT * FROM customers`

    db.query(getStr, (err, data) => {
      if (err) {
        console.log(err)
        return res.status(500).send('database err').end()
      } else {
        if (data.length === 0) {
          return res.status(500).send('no datas').end()
        } else {
          return res.status(200).send({
            data: data,
            msg: 'success',
            err: 0,
          })
        }
      }
    })

  })

  route.post('/customer/assign', (req, res) => {
    let user_id = req.body.user_id

    const getStr = `SELECT * FROM customers WHERE user_id='${user_id}'`

    db.query(getStr, (err, data) => {
      if (err) {
        console.log(err)
        return res.status(500).send('database err').end()
      } else {
        if (data.length === 0) {
          return res.status(500).send('no datas').end()
        } else {
          return res.status(200).send({
            data: data,
            msg: 'success',
            err: 0,
          })
        }
      }
    })

  })

  route.post('/customer/add', (req, res) => {
    let mObj = {}
    for (let obj in req.body) {
      mObj = JSON.parse(obj)
    }
    let customer_name = mObj.customer_name
    let customer_phone = mObj.customer_phone
    let customer_sex = mObj.customer_sex
    let customer_wechat = mObj.customer_wechat
    let customer_wechat_name = mObj.customer_wechat_name
    // let customer_qq = mObj.customer_qq
    // let customer_qq_name = mObj.customer_qq_name
    let customer_skin = mObj.customer_skin
    let customer_skin_problem = mObj.customer_skin_problem
    let customer_profession = mObj.customer_profession
    let customer_creattime = mObj.customer_creattime
    let customer_birthday = mObj.customer_birthday
    let customer_product_finish = mObj.customer_product_finish
    let customer_remarks = mObj.customer_remarks
    let user_id = mObj.user_id
    let department_id = mObj.department_id
    let issuing_id = mObj.issuing_id
    let customer_pic = mObj.customer_pic
    let express = mObj.express

    // const insStr = `INSERT INTO customers(customer_name,customer_phone,customer_sex,customer_wechat,customer_wechat_name,customer_qq,customer_qq_name,customer_skin,customer_skin_problem,customer_profession,customer_creattime,customer_birthday,customer_product_finish,customer_remarks,user_id,department_id,issuing_id,customer_pic) VALUES('${customer_name}','${customer_phone}','${customer_sex}','${customer_wechat}','${customer_wechat_name}','${customer_qq}','${customer_qq_name}','${customer_skin}','${customer_skin_problem}','${customer_profession}','${customer_creattime}','${customer_birthday}','${customer_product_finish}','${customer_remarks}','${user_id}','${department_id}','${issuing_id}','${customer_pic}')`
    const insStr = `INSERT INTO customers(customer_name,customer_phone,customer_sex,customer_wechat,customer_wechat_name,customer_skin,customer_skin_problem,customer_profession,customer_creattime,customer_birthday,customer_product_finish,customer_remarks,user_id,department_id,issuing_id,customer_pic) VALUES('${customer_name}','${customer_phone}','${customer_sex}','${customer_wechat}','${customer_wechat_name}','${customer_skin}','${customer_skin_problem}','${customer_profession}','${customer_creattime}','${customer_birthday}','${customer_product_finish}','${customer_remarks}','${user_id}','${department_id}','${issuing_id}','${customer_pic}')`

    db.query(insStr, (err, data) => {
      if (err) {
        console.error(err)
        res.status(500).send('服务器出错').end()
      } else {
        let arr = [];
        for (let i = 0; i < express.length; i++) {
          express[i].customer_id = data.insertId;
          express[i].express_address_ssx = express[i].express_address_ssx.join(',');
          delete express[i].express_address_merge;
          arr.push(Object.values(express[i]))
        }
        console.log(express)
        const insStrs = 'INSERT INTO express(`express_receiver`,`express_phone`, `express_address_ssx`, `express_address`, `customer_id`) VALUES ?'
        // 插入用户信息
        db.query(insStrs, [arr], (err, datas) => {
          if (err) {
            console.error(err)
            res.status(500).send('服务器出错').end()
          } else {
            return res.status(200).send(datas).end()
          }
        })
      }
    })

  })

  route.post('/customer/update', (req, res) => {
    let customer_id = req.body.customer_id
    let customer_name = req.body.customer_name
    let customer_phone = req.body.customer_phone
    let customer_sex = req.body.customer_sex
    let customer_wechat = req.body.customer_wechat
    let customer_wechat_name = req.body.customer_wechat_name
    // let customer_qq = req.body.customer_qq
    // let customer_qq_name = req.body.customer_qq_name
    let customer_skin = req.body.customer_skin
    let customer_skin_problem = req.body.customer_skin_problem
    let customer_profession = req.body.customer_profession
    let customer_birthday = req.body.customer_birthday
    let customer_product_finish = req.body.customer_product_finish
    let customer_remarks = req.body.customer_remarks
    let customer_pic = req.body.customer_pic
    let user_id = req.body.user_id
    let department_id = req.body.department_id
    let issuing_id = req.body.issuing_id

    // const updateStr = `UPDATE customers SET customer_name='${customer_name}',customer_phone='${customer_phone}',customer_sex='${customer_sex}',customer_wechat='${customer_wechat}',customer_wechat_name='${customer_wechat_name}',customer_qq='${customer_qq}',customer_qq_name='${customer_qq_name}',customer_skin='${customer_skin}',customer_skin_problem='${customer_skin_problem}',customer_profession='${customer_profession}',customer_birthday='${customer_birthday}',customer_product_finish='${customer_product_finish}',customer_remarks='${customer_remarks}',customer_pic='${customer_pic}',user_id='${user_id}',department_id='${department_id}',issuing_id='${issuing_id}' WHERE customer_id='${customer_id}'`
    const updateStr = `UPDATE customers SET customer_name='${customer_name}',customer_phone='${customer_phone}',customer_sex='${customer_sex}',customer_wechat='${customer_wechat}',customer_wechat_name='${customer_wechat_name}',customer_skin='${customer_skin}',customer_skin_problem='${customer_skin_problem}',customer_profession='${customer_profession}',customer_birthday='${customer_birthday}',customer_product_finish='${customer_product_finish}',customer_remarks='${customer_remarks}',customer_pic='${customer_pic}',user_id='${user_id}',department_id='${department_id}',issuing_id='${issuing_id}' WHERE customer_id='${customer_id}'`

    new Promise((resolve, reject) => {
      db.query(updateStr, (err, data) => {
        if (err) {
          reject(err)
        } else {
          resolve(data)
        }
      })
    }).then((data) => {
      return res.status(200).send({
        msg: '更新成功',
        err: 0,
      })
    }, (err) => {
      console.log(err)
      res.status(500).send({ msg: '网络错误，请稍后重试' })
    })
  })

  route.post('/customer/delete', (req, res) => {
    let mObj = {}
    for (let obj in req.body) {
      mObj = JSON.parse(obj)
    }
    let id = mObj.id

    const deleteStr = `DELETE FROM customers WHERE	customer_id='${id}'`

    // 插入用户信息
    db.query(deleteStr, (err, data) => {
      if (err) {
        console.error(err)
        res.status(500).send('服务器出错').end()
      } else {
        return res.status(200).send(data).end()
      }
    })
  })

  route.get('/issuing', (req, res) => {
    const getStr = `SELECT * FROM issuing`

    db.query(getStr, (err, data) => {
      if (err) {
        console.log(err)
        return res.status(500).send('database err').end()
      } else {
        if (data.length === 0) {
          return res.status(500).send('no datas').end()
        } else {
          return res.status(200).send({
            data: data,
            msg: 'success',
            err: 0,
          })
        }
      }
    })

  })

  route.post('/issuing/assign', (req, res) => {
    let user_id = req.body.user_id

    const getStr = `SELECT * FROM issuing WHERE user_id='${user_id}'`

    db.query(getStr, (err, data) => {
      if (err) {
        console.log(err)
        return res.status(500).send('database err').end()
      } else {
        if (data.length === 0) {
          return res.status(500).send('no datas').end()
        } else {
          return res.status(200).send({
            data: data,
            msg: 'success',
            err: 0,
          })
        }
      }
    })

  })

  route.post('/issu', (req, res) => {
    let user_id = req.body.user_id

    console.log(user_id)

    const getStr = `SELECT * FROM issuing WHERE user_id='${user_id}'`

    db.query(getStr, (err, data) => {
      if (err) {
        console.log(err)
        return res.status(500).send('database err').end()
      } else {
        if (data.length === 0) {
          return res.status(500).send('no datas').end()
        } else {
          let issuingArr = []
          for (let i = 0; i < data.length; i++) {
            let obj = {
              value: data[i].issuing_id,
              label: data[i].issuing_number
            }
            issuingArr.push(obj)
          }

          let issuingData = issuingArr;

          return res.status(200).send({
            data: issuingData,
            msg: 'success',
            err: 0,
          })
        }
      }
    })
  })

  route.post('/issuing/add', (req, res) => {
    let mObj = {}
    for (let obj in req.body) {
      mObj = JSON.parse(obj)
    }
    let issuing_type = mObj.issuing_type
    let issuing_number = mObj.issuing_number
    let issuing_password = mObj.issuing_password
    let issuing_remarks = mObj.issuing_remarks
    let user_id = mObj.user_id
    let issuing_creattime = mObj.issuing_creattime
    let department_id = mObj.department_id
    const insStr = `INSERT INTO issuing(issuing_type,issuing_number,issuing_password,issuing_remarks,user_id,issuing_creattime,department_code) VALUES('${issuing_type}','${issuing_number}','${issuing_password}','${issuing_remarks}','${user_id}','${issuing_creattime}','${department_id}')`
    // 插入用户信息
    db.query(insStr, (err, data) => {
      if (err) {
        console.error(err)
        res.status(500).send('服务器出错').end()
      } else {
        return res.status(200).send(data).end()
      }
    })
  })

  route.post('/issuing/update', (req, res) => {
    let issuing_id = req.body.issuing_id
    let issuing_type = req.body.issuing_type
    let issuing_number = req.body.issuing_number
    let issuing_password = req.body.issuing_password
    let issuing_remarks = req.body.issuing_remarks

    const updateStr = `UPDATE issuing SET issuing_type='${issuing_type}',issuing_number='${issuing_number}',issuing_password='${issuing_password}',issuing_remarks='${issuing_remarks}' WHERE issuing_id='${issuing_id}'`

    new Promise((resolve, reject) => {
      db.query(updateStr, (err, data) => {
        if (err) {
          reject(err)
        } else {
          resolve(data)
        }
      })
    }).then((data) => {
      return res.status(200).send({
        msg: '更新成功',
        err: 0,
      })
    }, (err) => {
      console.log(err)
      res.status(500).send({ msg: '网络错误，请稍后重试' })
    })
  })

  route.post('/issuing/update/set', (req, res) => {
    let issuing_id = req.body.issuing_id
    let user_id = req.body.user_id
    let department_code = req.body.department_code
    let issuing_status = req.body.issuing_status
    let updateStr = ""

    if (user_id) {
      updateStr = `UPDATE issuing SET user_id='${user_id}',issuing_status='${issuing_status}',department_code='${department_code}' WHERE issuing_id='${issuing_id}'`
    } else {
      updateStr = `UPDATE issuing SET user_id=null,issuing_status='${issuing_status}',department_code=null WHERE issuing_id='${issuing_id}'`
    }

    db.query(updateStr, (err, data) => {
      if (err) {
        console.error(err)
        res.status(500).send('服务器出错').end()
      } else {
        return res.status(200).send({
          msg: '更新成功',
          err: 0,
        })
      }
    })
  })

  route.post('/issuing/delete', (req, res) => {
    let mObj = {}
    for (let obj in req.body) {
      mObj = JSON.parse(obj)
    }
    let id = mObj.id

    const deleteStr = `DELETE FROM issuing WHERE issuing_id='${id}'`

    // 插入用户信息
    db.query(deleteStr, (err, data) => {
      if (err) {
        console.error(err)
        res.status(500).send('服务器出错').end()
      } else {
        return res.status(200).send(data).end()
      }
    })
  })

  route.get('/express', (req, res) => {
    const getStr = `SELECT * FROM express`;

    db.query(getStr, (err, data) => {
      if (err) {
        console.log(err)
        return res.status(500).send('database err').end()
      } else {
        if (data.length === 0) {
          return res.status(500).send('no datas').end()
        } else {
          return res.status(200).send({
            data: data,
            msg: 'success',
            err: 0,
          })
        }
      }
    })

  })

  route.post('/expres', (req, res) => {
    let customer_id = req.body.customer_id

    const getStr = `SELECT * FROM express WHERE customer_id='${customer_id}'`

    db.query(getStr, (err, data) => {
      if (err) {
        console.log(err)
        return res.status(500).send('database err').end()
      }
      else {
        return res.status(200).send({
          data: data,
          msg: 'success',
          err: 0,
        })
      }
    })

  })

  route.post('/express/add', (req, res) => {
    let mObj = {}
    for (let obj in req.body) {
      mObj = JSON.parse(obj)
    }
    console.log(req.body)
    let express_receiver = mObj.express_receiver
    let express_phone = mObj.express_phone
    let express_address_ssx = mObj.express_address_ssx
    let express_address = mObj.express_address
    let customer_id = mObj.customer_id
    const insStr = `INSERT INTO express(express_receiver,express_phone,express_address_ssx,express_address,customer_id) VALUES('${express_receiver}','${express_phone}','${express_address_ssx}','${express_address}','${customer_id}')`
    // 插入用户信息
    db.query(insStr, (err, data) => {
      if (err) {
        console.error(err)
        res.status(500).send('服务器出错').end()
      } else {
        return res.status(200).send(data).end()
      }
    })
  })

  route.post('/express/update', (req, res) => {
    let express_id = req.body.express_id
    let express_receiver = req.body.express_receiver
    let express_phone = req.body.express_phone
    let express_address_ssx = req.body.express_address_ssx
    let express_address = req.body.express_address

    const updateStr = `UPDATE express SET express_receiver='${express_receiver}',express_phone='${express_phone}',express_address_ssx='${express_address_ssx}',express_address='${express_address}' WHERE express_id='${express_id}'`

    new Promise((resolve, reject) => {
      db.query(updateStr, (err, data) => {
        if (err) {
          reject(err)
        } else {
          resolve(data)
        }
      })
    }).then((data) => {
      return res.status(200).send({
        msg: '更新成功',
        err: 0,
      })
    }, (err) => {
      console.log(err)
      res.status(500).send({ msg: '网络错误，请稍后重试' })
    })
  })

  route.post('/express/delete', (req, res) => {
    let mObj = {}
    for (let obj in req.body) {
      mObj = JSON.parse(obj)
    }
    let id = mObj.id

    const deleteStr = `DELETE FROM express WHERE express_id='${id}'`

    // 插入用户信息
    db.query(deleteStr, (err, data) => {
      if (err) {
        console.error(err)
        res.status(500).send('服务器出错').end()
      } else {
        return res.status(200).send(data).end()
      }
    })
  })

  route.get('/goods', (req, res) => {
    const getStr = `SELECT * FROM goods WHERE goods_status=1`

    db.query(getStr, (err, data) => {
      if (err) {
        console.log(err)
        return res.status(500).send('database err').end()
      } else {
        if (data.length === 0) {
          return res.status(500).send('no datas').end()
        } else {
          return res.status(200).send({
            data: data,
            msg: 'success',
            err: 0,
          })
        }
      }
    })

  })

  route.post('/goods/add', (req, res) => {
    let mObj = {}
    for (let obj in req.body) {
      mObj = JSON.parse(obj)
    }
    let goods_id = mObj.goods_id
    let goods_code = mObj.goods_code
    let goods_barcode = mObj.goods_barcode
    let goods_name = mObj.goods_name
    let goods_type_id = mObj.goods_type_id
    let goods_unit = mObj.goods_unit
    let goods_capacity = mObj.goods_capacity
    let goods_price = mObj.goods_price
    let goods_discount = mObj.goods_discount
    let goods_creattime = mObj.goods_creattime
    const insStr = `INSERT INTO goods(goods_code,goods_barcode,goods_name,goods_type_id,goods_unit,goods_capacity,goods_price,goods_discount,goods_creattime) VALUES('${goods_code}','${goods_barcode}','${goods_name}','${goods_type_id}','${goods_unit}','${goods_capacity}','${goods_price}','${goods_discount}','${goods_creattime}')`
    // 插入用户信息
    db.query(insStr, (err, data) => {
      if (err) {
        console.error(err)
        res.status(500).send('服务器出错').end()
      } else {
        return res.status(200).send(data).end()
      }
    })
  })

  route.post('/goods/update', (req, res) => {
    let goods_id = req.body.goods_id
    let goods_code = req.body.goods_code
    let goods_barcode = req.body.goods_barcode
    let goods_name = req.body.goods_name
    let goods_type_id = req.body.goods_type_id
    let goods_unit = req.body.goods_unit
    let goods_capacity = req.body.goods_capacity
    let goods_price = req.body.goods_price
    let goods_discount = req.body.goods_discount

    const updateStr = `UPDATE goods SET goods_code='${goods_code}',goods_barcode='${goods_barcode}',goods_name='${goods_name}',goods_type_id='${goods_type_id}',goods_unit='${goods_unit}',goods_capacity='${goods_capacity}',goods_price='${goods_price}',goods_discount='${goods_discount}' WHERE goods_id='${goods_id}'`

    new Promise((resolve, reject) => {
      db.query(updateStr, (err, data) => {
        if (err) {
          reject(err)
        } else {
          resolve(data)
        }
      })
    }).then((data) => {
      return res.status(200).send({
        msg: '更新成功',
        err: 0,
      })
    }, (err) => {
      console.log(err)
      res.status(500).send({ msg: '网络错误，请稍后重试' })
    })
  })

  route.post('/goods/delete', (req, res) => {
    let mObj = {}
    for (let obj in req.body) {
      mObj = JSON.parse(obj)
    }
    let id = mObj.id

    const deleteStr = `DELETE FROM goods WHERE goods_id='${id}'`

    // 插入用户信息
    db.query(deleteStr, (err, data) => {
      if (err) {
        console.error(err)
        res.status(500).send('服务器出错').end()
      } else {
        return res.status(200).send(data).end()
      }
    })
  })

  route.get('/goodstop', (req, res) => {
    const getStr = `SELECT * FROM goods WHERE goods_status=0`

    db.query(getStr, (err, data) => {
      if (err) {
        console.log(err)
        return res.status(500).send('database err').end()
      } else {
        if (data.length === 0) {
          return res.status(500).send('no datas').end()
        } else {
          return res.status(200).send({
            data: data,
            msg: 'success',
            err: 0,
          })
        }
      }
    })

  })

  route.post('/goodstop/add', (req, res) => {
    let mObj = {}
    for (let obj in req.body) {
      mObj = JSON.parse(obj)
    }
    let goods_id = mObj.goods_id
    let goods_code = mObj.goods_code
    let goods_barcode = mObj.goods_barcode
    let goods_name = mObj.goods_name
    let goods_type_id = mObj.goods_type_id
    let goods_unit = mObj.goods_unit
    let goods_capacity = mObj.goods_capacity
    let goods_price = mObj.goods_price
    let goods_discount = mObj.goods_discount
    let goods_creattime = mObj.goods_creattime
    const insStr = `INSERT INTO goods(goods_code,goods_barcode,goods_name,goods_type_id,goods_unit,goods_capacity,goods_price,goods_discount,goods_creattime) VALUES('${goods_code}','${goods_barcode}','${goods_name}','${goods_type_id}','${goods_unit}','${goods_capacity}','${goods_price}','${goods_discount}','${goods_creattime}')`
    // 插入用户信息
    db.query(insStr, (err, data) => {
      if (err) {
        console.error(err)
        res.status(500).send('服务器出错').end()
      } else {
        return res.status(200).send(data).end()
      }
    })
  })

  route.post('/goodstop/update', (req, res) => {
    let goods_id = req.body.goods_id
    let goods_code = req.body.goods_code
    let goods_barcode = req.body.goods_barcode
    let goods_name = req.body.goods_name
    let goods_type_id = req.body.goods_type_id
    let goods_unit = req.body.goods_unit
    let goods_capacity = req.body.goods_capacity
    let goods_price = req.body.goods_price
    let goods_discount = req.body.goods_discount

    const updateStr = `UPDATE goods SET goods_code='${goods_code}',goods_barcode='${goods_barcode}',goods_name='${goods_name}',goods_type_id='${goods_type_id}',goods_unit='${goods_unit}',goods_capacity='${goods_capacity}',goods_price='${goods_price}',goods_discount='${goods_discount}' WHERE goods_id='${goods_id}'`

    new Promise((resolve, reject) => {
      db.query(updateStr, (err, data) => {
        if (err) {
          reject(err)
        } else {
          resolve(data)
        }
      })
    }).then((data) => {
      return res.status(200).send({
        msg: '更新成功',
        err: 0,
      })
    }, (err) => {
      console.log(err)
      res.status(500).send({ msg: '网络错误，请稍后重试' })
    })
  })

  route.post('/goodstop/delete', (req, res) => {
    let mObj = {}
    for (let obj in req.body) {
      mObj = JSON.parse(obj)
    }
    let id = mObj.id

    const deleteStr = `DELETE FROM goods WHERE goods_id='${id}'`

    // 插入用户信息
    db.query(deleteStr, (err, data) => {
      if (err) {
        console.error(err)
        res.status(500).send('服务器出错').end()
      } else {
        return res.status(200).send(data).end()
      }
    })
  })

  route.get('/goodstype', (req, res) => {
    const getStr = `SELECT * FROM goods_type`

    db.query(getStr, (err, data) => {
      if (err) {
        console.log(err)
        return res.status(500).send('database err').end()
      } else {
        if (data.length === 0) {
          return res.status(500).send('no datas').end()
        } else {
          return res.status(200).send({
            data: data,
            msg: 'success',
            err: 0,
          })
        }
      }
    })

  })

  route.post('/goodstype/add', (req, res) => {
    let mObj = {}
    for (let obj in req.body) {
      mObj = JSON.parse(obj)
    }
    let goods_type_id = mObj.goods_type_id
    let goods_type_name = mObj.goods_type_name
    let goods_type_edittime = mObj.goods_type_edittime
    const insStr = `INSERT INTO goods_type(goods_type_name,goods_type_edittime) VALUES('${goods_type_name}','${goods_type_edittime}')`
    // 插入用户信息
    db.query(insStr, (err, data) => {
      if (err) {
        console.error(err)
        res.status(500).send('服务器出错').end()
      } else {
        return res.status(200).send(data).end()
      }
    })
  })

  route.post('/goodstype/update', (req, res) => {
    let goods_type_id = req.body.goods_type_id
    let goods_type_name = req.body.goods_type_name
    let goods_type_edittime = req.body.goods_type_edittime

    const updateStr = `UPDATE goods_type SET goods_type_name='${goods_type_name}',goods_type_edittime='${goods_type_edittime}' WHERE goods_type_id='${goods_type_id}'`

    new Promise((resolve, reject) => {
      db.query(updateStr, (err, data) => {
        if (err) {
          reject(err)
        } else {
          resolve(data)
        }
      })
    }).then((data) => {
      return res.status(200).send({
        msg: '更新成功',
        err: 0,
      })
    }, (err) => {
      console.log(err)
      res.status(500).send({ msg: '网络错误，请稍后重试' })
    })
  })

  route.post('/goodstype/delete', (req, res) => {
    let mObj = {}
    for (let obj in req.body) {
      mObj = JSON.parse(obj)
    }
    let id = mObj.id

    const deleteStr = `DELETE FROM goods_type WHERE goods_type_id='${id}'`

    // 插入用户信息
    db.query(deleteStr, (err, data) => {
      if (err) {
        console.error(err)
        res.status(500).send('服务器出错').end()
      } else {
        return res.status(200).send(data).end()
      }
    })
  })

  route.get('/order', (req, res) => {
    const getStr = `SELECT * FROM orders ORDER BY order_creattime DESC`

    db.query(getStr, (err, data) => {
      if (err) {
        console.log(err)
        return res.status(500).send('database err').end()
      } else {
        if (data.length === 0) {
          return res.status(500).send('no datas').end()
        } else {
          return res.status(200).send({
            data: data,
            msg: 'success',
            err: 0,
          })
        }
      }
    })

  })

  route.post('/order/assign', (req, res) => {
    let user_id = req.body.user_id

    const getStr = `SELECT * FROM orders WHERE user_id='${user_id}'`

    db.query(getStr, (err, data) => {
      if (err) {
        console.log(err)
        return res.status(500).send('database err').end()
      } else {
        if (data.length === 0) {
          return res.status(500).send('no datas').end()
        } else {
          return res.status(200).send({
            data: data,
            msg: 'success',
            err: 0,
          })
        }
      }
    })

  })

  route.post('/order/add', (req, res) => {
    let mObj = {}
    for (let obj in req.body) {
      mObj = JSON.parse(obj)
    }

    console.log(req)
    let order_number = mObj.order_number
    let user_id = mObj.user_id
    let order_creattime = mObj.order_creattime
    let customer_id = mObj.customer_id
    let order_pay_type = mObj.order_pay_type
    let order_price = mObj.order_price
    let order_actual_price = mObj.order_actual_price
    let order_dai_price = mObj.order_dai_price
    let issuing_id = mObj.issuing_id
    let order_express_type = mObj.order_express_type
    let order_sale_remarks = mObj.order_sale_remarks
    let order_store_remarks = mObj.order_store_remarks
    let sale_datas = mObj.sale_datas
    let department_code = mObj.department_code
    let order_pic = mObj.order_pic
    let express_id = mObj.express_id

    const insStr = `INSERT INTO orders(order_number,user_id,order_creattime,customer_id,order_pay_type,order_price,order_actual_price,order_dai_price,issuing_id,order_express_type,order_sale_remarks,order_store_remarks,department_code,order_pic,express_id) VALUES('${order_number}','${user_id}','${order_creattime}','${customer_id}','${order_pay_type}','${order_price}','${order_actual_price}','${order_dai_price}','${issuing_id}','${order_express_type}','${order_sale_remarks}','${order_store_remarks}','${department_code}','${order_pic}','${express_id}')`

    // 插入用户信息
    db.query(insStr, (err, data) => {
      if (err) {
        console.error(err)
        res.status(500).send('服务器出错').end()
      } else {
        let result = []
        let order_id = data.insertId
        console.log(sale_datas)
        sale_datas.map((item, index) => {
          let itemArr = [
            order_id,
            item.goods_id,
            item.goods_price,
            item.sale_quantity
          ]
          result.push(itemArr)
        })
        console.log(result)
        let insSaleStr = 'INSERT INTO sale(`order_id`,`goods_id`,goods_price,`sale_quantity`) VALUES ?'
        db.query(insSaleStr, [result], (err, data) => {
          if (err) {
            console.log(err)
            return res.status(500).send('database err').end()
          } else {
            return res.status(200).send({ msg: '成功', err: 0 }).end()
          }
        })
      }
    })
  })

  route.post('/order/adds', (req, res) => {
    let mObj = {}
    for (let obj in req.body) {
      mObj = JSON.parse(obj)
    }
    let order_number = mObj.order_number
    let user_id = mObj.user_id
    let order_creattime = mObj.order_creattime
    let customer_id = mObj.customer_id
    let express_receiver = mObj.express_receiver
    let order_pay_type = mObj.order_pay_type
    let order_price = mObj.order_price
    let issuing_id = mObj.issuing_id
    let order_express_type = mObj.order_express_type
    let order_sale_remarks = mObj.order_sale_remarks
    let order_store_remarks = mObj.order_store_remarks
    let sale_datas = mObj.sale_datas
    console.log(sale_datas)

    const insStr = `INSERT INTO orders(order_number,user_id,order_creattime,customer_id,order_pay_type,order_price,issuing_id,order_express_type,order_sale_remarks,order_store_remarks) VALUES('${order_number}','${user_id}','${order_creattime}','${customer_id}','${order_pay_type}','${order_price}','${issuing_id}','${order_express_type}','${order_sale_remarks}','${order_store_remarks}')`

    // 插入用户信息
    db.query(insStr, (err, data) => {
      if (err) {
        console.error(err)
        res.status(500).send('服务器出错').end()
      } else {
        let result = []
        let order_id = data.insertId
        console.log(sale_datas)
        sale_datas.map((item, index) => {
          let itemArr = [
            order_id,
            item.goods_id,
            item.goods_price,
            item.sale_quantity
          ]
          result.push(itemArr)
        })
        console.log(result)
        let insSaleStr = 'INSERT INTO sale(`order_id`,`goods_id`,goods_price,`sale_quantity`) VALUES ?'
        db.query(insSaleStr, [result], (err, data) => {
          if (err) {
            console.log(err)
            return res.status(500).send('database err').end()
          } else {
            return res.status(200).send({ msg: '成功', err: 0 }).end()
          }
        })
      }
    })
  })

  route.post('/order/update', (req, res) => {
    let order_id = req.body.order_id
    let order_express_type = req.body.order_express_type
    let order_express = req.body.order_express
    let order_store_remarks = req.body.order_store_remarks
    let order_delivery = req.body.order_delivery
    let order_status = req.body.order_status

    const updateStr = `UPDATE orders SET order_express_type='${order_express_type}',order_express='${order_express}',order_store_remarks='${order_store_remarks}',order_delivery='${order_delivery}',order_status='${order_status}' WHERE order_id='${order_id}'`

    new Promise((resolve, reject) => {
      db.query(updateStr, (err, data) => {
        if (err) {
          reject(err)
        } else {
          resolve(data)
        }
      })
    }).then((data) => {
      return res.status(200).send({
        msg: '更新成功',
        err: 0,
      })
    }, (err) => {
      console.log(err)
      res.status(500).send({ msg: '网络错误，请稍后重试' })
    })

  })

  route.post('/order/delete', (req, res) => {
    let mObj = {}
    for (let obj in req.body) {
      mObj = JSON.parse(obj)
    }
    let id = mObj.id

    const deleteStr = `DELETE FROM orders WHERE order_id='${id}'`

    // 插入用户信息
    db.query(deleteStr, (err, data) => {
      if (err) {
        console.error(err)
        res.status(500).send('服务器出错').end()
      } else {
        return res.status(200).send(data).end()
      }
    })
  })

  route.post('/order/sale/delete', (req, res) => {
    let mObj = {}
    for (let obj in req.body) {
      mObj = JSON.parse(obj)
    }
    let id = mObj.id

    const deleteStr = `DELETE FROM sale WHERE sale_id='${id}'`

    // 插入用户信息
    db.query(deleteStr, (err, data) => {
      if (err) {
        console.error(err)
        res.status(500).send('服务器出错').end()
      } else {
        return res.status(200).send(data).end()
      }
    })
  })

  route.post('/order/all', (req, res) => {
    let customer_id = req.body.customer_id
    let order_id = req.body.order_id
    let express_id = req.body.express_id

    const customerStr = `SELECT * FROM customers WHERE customer_id='${customer_id}'`
    const saleStr = `SELECT * FROM sale WHERE order_id='${order_id}'`
    const expressStr = `SELECT * FROM express WHERE customer_id='${customer_id}'`

    db.query(customerStr, (err, customerData) => {
      if (err) {
        console.log(err)
        return res.status(500).send('database err').end()
      } else {
        db.query(saleStr, (err, saleData) => {
          if (err) {
            console.log(err)
            return res.status(500).send('database err').end()
          }
          else {
            db.query(expressStr, (err, expressData) => {
              if (err) {
                console.log(err)
                return res.status(500).send('database err').end()
              }
              else {
                if (express_id == 0 || expressData.length == 1) {
                  expressDatas = expressData
                  return res.status(200).send({
                    customerData: customerData,
                    saleData: saleData,
                    expressData: expressData[0],
                    msg: 'success',
                    err: 0,
                  })
                } else {
                  expressData.map(item => {
                    if (item.express_id == express_id) {

                      return res.status(200).send({
                        customerData: customerData,
                        saleData: saleData,
                        expressData: item,
                        msg: 'success',
                        err: 0,
                      })
                    }
                  })
                }
              }
            })
          }
        })
      }
    })

  })

  route.post('/order/status', (req, res) => {
    let order_id = req.body.order_id
    let order_status = req.body.order_status

    const updateStr = `UPDATE orders SET order_status='${order_status}' WHERE order_id='${order_id}'`

    console.log(updateStr)

    db.query(updateStr, (err, data) => {
      if (err) {
        console.log(err)
        return res.status(500).send('database err').end()
      } else {
        return res.status(200).send({
          data: data,
          msg: 'success',
          err: 0,
        })
      }
    })

  })

  route.post('/params/skin', (req, res) => {
    let dict_type_code = req.body.dict_type_code
    const getStr = `SELECT * FROM base_dict WHERE dict_type_code='${dict_type_code}'`

    db.query(getStr, (err, data) => {
      if (err) {
        console.log(err)
        return res.status(500).send('database err').end()
      } else {
        if (data.length === 0) {
          return res.status(500).send('no datas').end()
        } else {
          return res.status(200).send({
            data: data,
            msg: 'success',
            err: 0,
          })
        }
      }
    })

  })

  route.get('/message', (req, res) => {
    const getStr = 'SELECT * from messages ORDER BY message_time DESC'

    db.query(getStr, (err, data) => {
      if (err) {
        console.log(err)
        return res.status(500).send('database err').end()
      } else {
        if (data.length === 0) {
          return res.status(500).send('no datas').end()
        } else {
          return res.status(200).send({
            data: data,
            msg: 'success',
            err: 0,
          })
        }
      }
    })

  })

  route.get('/sale', (req, res) => {
    const getStr = 'SELECT * from sale'

    db.query(getStr, (err, data) => {
      if (err) {
        console.log(err)
        return res.status(500).send('database err').end()
      } else {
        if (data.length === 0) {
          return res.status(500).send('no datas').end()
        } else {
          return res.status(200).send({
            data: data,
            msg: 'success',
            err: 0,
          })
        }
      }
    })

  })

  return route
}
