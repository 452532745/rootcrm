const express = require('express')
const mysql = require('mysql')
const Jwt = require('./jwt')
const {aesEncrypt, aesDecrypt, formatDate} = require('../libs/common')

const db = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '', // HWMfOczgFlRhwSiq6SF6B
  database: 'ailesi_questionaire'
})

module.exports = () => {
  // aes 密钥
  let key = 'password'

  const route = express.Router()

  function getDatas(getStr, res) {
    db.query(getStr, (err, data) => {
      if (err) {
        console.log(err)
        return res.status(500).send('database err').end()
      } else {
        if (data.length === 0) {
          return res.status(500).send('no datas').end()
        } else {
          return res.send(data)
        }
      }
    })
  }

  function delReg(insUserInfo, res) {
    db.query(insUserInfo, (err) => {
      if (err) {
        console.error(err)
        res.status(500).send('服务器出错').end()
      } else {
        res.status(200).send('注册成功').end()
      }
    })
  }

  function updateDatas(updateStr, res) {
    db.query(updateStr, (err, data) => {
      if (err) {
        console.log(err)
        return res.status(500).send('database err').end()
      } else {
        if (data.length === 0) {
          return res.status(500).send('no datas').end()
        } else {
          return res.send(data)
        }
      }
    })
  }

  // get naire datas
  route.get('/naire', (req, res) => {
    let nId = req.query.nId
    if (nId) {
      const getQuestionStr = `SELECT * FROM naire WHERE n_id='${nId}'`
      getDatas(getQuestionStr, res)
    } else {
      const getQuestionStr = 'SELECT * FROM naire'
      getDatas(getQuestionStr, res)
    }
  })

  // get question datas
  route.get('/question', (req, res) => {
    let nId = req.query.nId
    const getQuestionStr = `SELECT q_id,q_content,q_type,n_id,q_isrequire,q_description FROM question WHERE n_id='${nId}' order by q_id`
    getDatas(getQuestionStr, res)
  })

  // get questionOptions datas
  route.get('/questionoptions', (req, res) => {
    let nId = req.query.nId
    const getOptionsStr = `SELECT o_id,o_value,n_id,q_id,o_isaddtion FROM options WHERE n_id='${nId}' order by o_id`
    getDatas(getOptionsStr, res)
  })

  // get result datas
  route.get('/report', (req, res) => {
    let nId = req.query.nId
    const getResultStr = `SELECT * FROM result WHERE n_id='${nId}' order by q_id`
    getDatas(getResultStr, res)
  })

  // get user datas
  route.get('/users', (req, res) => {
    let nId = req.query.nId
    if (nId) {
      const getUsersStr = `SELECT * FROM users WHERE n_id='${nId}' ORDER BY u_id`
      getDatas(getUsersStr, res)
    } else {
      const getUsersStr = `SELECT * FROM users`
      getDatas(getUsersStr, res)
    }
  })

  // update naire.r_len datas
  route.post('/changeCount', (req, res) => {
    let mObj = []
    for (let obj in req.body) {
      mObj = JSON.parse(obj)
    }

    let id = mObj.id
    let count = mObj.count

    const upResultLen = `UPDATE naire SET r_len='${count}' WHERE n_id='${id}'`
    updateDatas(upResultLen, res)
  })

  // update naire.n_status datas
  route.post('/publishStatus', (req, res) => {
    let mObj = []
    for (let obj in req.body) {
      mObj = JSON.parse(obj)
    }

    let id = mObj.id
    let status = mObj.status

    const upResultStatus = `UPDATE naire SET n_status='${status}' WHERE n_id='${id}'`
    updateDatas(upResultStatus, res)
  })

  // login
  route.post('/admin/login', (req, res) => {
    let userName = req.body.username
    let pass = req.body.password
    const getAdminStr = `SELECT * FROM admin WHERE a_username='${userName}'`

    new Promise((resolve, reject) => {
      // 根据用户名查询用户
      db.query(getAdminStr, (err, data) => {
        if (err) {
          reject(err)
        } else {
          resolve(data)
        }
      })
    }).then((data) => {
      console.log(data)
      if (data) {
        // 密码解密 利用aes
        let aes = data[0].a_password
        let password = aesDecrypt(aes, key)
        console.log(pass + ' ' + password)
        if (pass == password) {
          // 登陆成功，添加token验证
          let _id = (data[0].a_id).toString()
          // 将用户id传入并生成token
          let jwt = new Jwt(_id)
          let token = jwt.generateToken()
          // 将 token 返回给客户端
          res.status(200).send({msg: '登陆成功', token: token, err: 0})
        } else {
          res.status(200).send({msg: '账号密码错误'})
        }
      } else {
        res.status(404).send({msg: '账号不存在'})
      }
    }).catch((err) => {
      console.log(err)
      res.status(500).send({msg: '网络错误，请稍后重试'})
    })
  })

  // changPassword
  route.post('/admin/changepwd', (req, res) => {
    let userName = req.body.username
    let oldpwd = req.body.oldpwd
    let newpwd = req.body.newpwd

    const getAdminStr = `SELECT a_password FROM admin WHERE a_username = '${userName}'`

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
        let aes = data[0].a_password
        let password = aesDecrypt(aes, key)
        let updatePwd = aesEncrypt(newpwd, key)
        if (oldpwd == password) {
          const upAdminPwd = `UPDATE admin SET a_password='${updatePwd}' WHERE a_username='${userName}'`
          db.query(upAdminPwd, (err, data) => {
            if (err) {
              console.log(err)
              return res.status(500).send('database err').end()
            } else {
              return res.status(200).send({msg: '修改成功', err: 0}).end()
            }
          })
        }
      }
    }, (err) => {
      console.log(err)
      res.status(500).send({msg: '网络错误，请稍后重试'})
    })
  })

  // questionList
  route.post('/naire/detail', (req, res) => {
    let mObj = {}
    for (let obj in req.body) {
      mObj = JSON.parse(obj)
    }
    let nId = mObj.n_id
    const naireStr = `SELECT * FROM naire WHERE n_id='${nId}'`
    const questionStr = `SELECT * FROM question WHERE n_id='${nId}' order by q_id`
    const optionsStr = `SELECT * FROM options WHERE n_id='${nId}' order by o_id`
    let topic = {}

    // 获取naire数据
    db.query(naireStr, (err, naireData) => {
      if (err) {
        console.log(err)
        return res.status(500).send('database err').end()
      } else {
        topic = Object.assign(naireData[0], {questionList: []})
        // 获取question数据
        db.query(questionStr, (err, questionData) => {
          if (err) {
            console.log(err)
            return res.status(500).send('database err').end()
          } else {
            // 获取options数据
            db.query(optionsStr, (err, optionsData) => {
              if (err) {
                console.log(err)
                return res.status(500).send('database err').end()
              } else {
                // 合并问卷题目和选项
                for (let i = 0; i < questionData.length; i++) {
                  for (let j = 0; j < optionsData.length; j++) {
                    if (questionData[i].q_type === '单选') {
                      if (questionData[i].q_id === optionsData[j].q_id) {
                        let obj = {
                          id: questionData[i].q_id,
                          content: questionData[i].q_content,
                          options: {
                            options_content: optionsData[j].o_value,
                            options_id: optionsData[j].o_id,
                          },
                          type: questionData[i].q_type,
                          isRequired: questionData[i].q_isrequire,
                          description: questionData[i].q_description,
                          selectContent: ''
                        }
                        topic.questionList.push(obj)
                      }
                    }
                    if (questionData[i].q_type === '多选') {
                      if (questionData[i].q_id === optionsData[j].q_id) {
                        let obj = {
                          id: questionData[i].q_id,
                          content: questionData[i].q_content,
                          options: {
                            options_content: optionsData[j].o_value,
                            options_id: optionsData[j].o_id,
                          },
                          type: questionData[i].q_type,
                          isRequired: questionData[i].q_isrequire,
                          description: questionData[i].q_description,
                          selectMultipleContent: []
                        }
                        topic.questionList.push(obj)
                      }
                    }
                    if (questionData[i].q_type === '文本') {
                      let obj = {
                        id: questionData[i].q_id,
                        content: questionData[i].q_content,
                        text: '',
                        type: questionData[i].q_type,
                        isRequired: questionData[i].q_isrequire,
                        description: questionData[i].q_description,
                        selectContent: ''
                      }
                      topic.questionList.push(obj)
                    }
                  }
                }
                topic.questionList = topic.questionList.map((item, index, arr) => {
                  const i = arr.find(_item => item.id === _item.id)
                  if (i !== item) {
                    if (item.options != null) {
                      i.options.push(item.options)
                      return undefined
                    }
                  } else {
                    i.options = [i.options]
                    return i
                  }
                }).filter(item => item !== undefined)
                topic = Object.assign(topic, {err: 0})
                return res.send(topic).end()
              }
            })
          }
        })
      }
    })
  })

  // naireSubmit
  route.post('/user/getId', (req, res) => {
    let mObj = {}
    for (let obj in req.body) {
      mObj = JSON.parse(obj)
    }
    let name = mObj.name
    let grade = mObj.grade
    let phone = mObj.phone
    let time = mObj.time
    let ip = mObj.ip
    let n_id = mObj.n_id
    let area = mObj.area || '暂无资料'
    const insUserInfo = `INSERT INTO users(u_name,u_class,u_phone,u_time,u_position,n_id,u_area) VALUES('${name}','${grade}','${phone}','${time}','${ip}','${n_id}','${area}')`
    // 插入用户信息
    db.query(insUserInfo, (err, data) => {
      if (err) {
        console.error(err)
        res.status(500).send('服务器出错').end()
      } else {
        return res.status(200).send(data).end()
      }
    })
  })
  route.post('/naire/submit', (req, res) => {
    let mObj = []
    for (let obj in req.body) {
      mObj = JSON.parse(obj)
    }

    mObj = mObj.result

    const insUserInfo = 'INSERT INTO result(`n_id`,`u_id`,`q_id`, `o_id`, `o_addtion`) VALUES ?'
    db.query(insUserInfo, [mObj], (err) => {
      if (err) {
        console.error(err)
        res.status(500).send('服务器出错').end()
      } else {
        res.status(200).send('注册成功').end()
      }
    })
  })

  // naireReport
  route.get('/naire/report', (req, res) => {
    const nId = req.query.nId
    const naireStr = `SELECT * FROM naire WHERE n_id='${nId}'`
    const usersStr = `SELECT * FROM users WHERE n_id='${nId}' ORDER BY u_id`
    const questionStr = `SELECT * FROM question WHERE n_id='${nId}' ORDER BY q_id`
    const optionsStr = `SELECT * FROM options WHERE n_id='${nId}' ORDER BY o_id`
    const resultStr = `SELECT * FROM result WHERE n_id='${nId}' ORDER BY q_id`
    let report = {
      userList: [],
      isNaire: false
    }

    // 获取naire数据
    db.query(naireStr, (err, naireData) => {
      if (err) {
        console.log(err)
        return res.status(500).send('naireData err').end()
      } else {
        // 合并naire到接口
        Object.assign(report, naireData[0])
        db.query(usersStr, (err, usersData) => {
          if (err) {
            console.log(err)
            return res.status(500).send('usersData err').end()
          } else {
            for (let item in  usersData) {
              usersData[item].u_time = formatDate(usersData[item].u_time)
            }
            // 获取result数据
            db.query(resultStr, (err, resultData) => {
              if (err) {
                console.log(err)
                return res.status(500).send('resultData err').end()
              } else {
                // 判断表单是否有result数据
                if (resultData.length === 0) {
                  report.userList = usersData
                  // 表单状态
                  report.isNaire = false
                  // 输出未拥有result的表单
                  return res.status(200).send(report).end()
                } else {
                  // 获取question数据
                  db.query(questionStr, (err, questionData) => {
                    if (err) {
                      console.log(err)
                      return res.status(500).send('questionData err').end()
                    } else {
                      // 获取options数据
                      db.query(optionsStr, (err, optionsData) => {
                        if (err) {
                          console.log(err)
                          return res.status(500).send('optionsData err').end()
                        } else {
                          let map = {}
                          let dest = []
                          let mixData = []

                          // 数据结构重构
                          for (let i = 0; i < questionData.length; i++) {
                            for (let j = 0; j < resultData.length; j++) {
                              for (let k = 0; k < optionsData.length; k++) {
                                if (questionData[i].q_id === resultData[j].q_id) {
                                  if (optionsData[k].o_id === resultData[j].o_id) {
                                    let obj = {
                                      u_id: resultData[j].u_id,
                                      n_id: resultData[j].n_id,
                                      q_id: questionData[i].q_content,
                                      o_id: optionsData[k].o_value,
                                      o_addtion: resultData[j].o_addtion,
                                      q_type: questionData[i].q_type
                                    }
                                    mixData.push(obj)
                                  }
                                }
                              }
                            }
                          }
                          for (let i = 0; i < mixData.length; i++) {
                            let ai = mixData[i]
                            if (!map[ai.u_id]) {
                              dest.push({
                                u_id: ai.u_id,
                                data: [ai]
                              })
                              map[ai.u_id] = ai
                            } else {
                              for (let j = 0; j < dest.length; j++) {
                                let dj = dest[j]
                                if (dj.u_id == ai.u_id) {
                                  dj.data.push(ai)
                                  break
                                }
                              }
                            }
                          }
                          for (let i = 0; i < usersData.length; i++) {
                            for (let j = 0; j < dest.length; j++) {
                              if (usersData[i].u_id === dest[j].u_id) {
                                let obj = {
                                  u_name: usersData[i].u_name,
                                  u_class: usersData[i].u_class,
                                  u_phone: usersData[i].u_phone,
                                  u_area: usersData[i].u_area,
                                  u_time: usersData[i].u_time,
                                  u_position: usersData[i].u_position,
                                  userSelect: dest[j].data
                                }
                                report.userList.push(obj)
                              }
                            }
                          }
                          report.isNaire = true
                          return res.status(200).send(report).end()
                        }
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

  return route
}
