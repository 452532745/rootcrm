// 时间戳格式化
export const formatDate = (timestamp) => {
  timestamp = typeof timestamp === 'number' ? timestamp : Number(timestamp)
  const date = new Date(timestamp)
  const Y = date.getFullYear() + '-'
  const M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '-'
  const D = (date.getDate() < 10 ? '0' + (date.getDate()) : date.getDate()) + ' '
  const h = (date.getHours() < 10 ? '0' + (date.getHours()) : date.getHours()) + ':'
  const m = (date.getMinutes() < 10 ? '0' + (date.getMinutes()) : date.getMinutes()) + ':'
  const s = date.getSeconds() < 10 ? '0' + (date.getSeconds()) : date.getSeconds()
  return Y + M + D + h + m + s
}

// 时间戳去格式化
export const formatNotDate = (timestamp) => {
  let time = "";
  if (String(timestamp) == '') {
    time = 0
  } else {
    time = new Date(timestamp).getTime();
  }
  return time
}

// 时间差
export const beforeTime = (timestamp) => {
  timestamp = typeof timestamp === 'number' ? timestamp : Number(timestamp)
  const date = new Date().getTime()
  return parseInt((date - timestamp) / (1000 * 60 * 60 * 24))
}

// ip地址
export const ipAddress = () => {
  const ipStr = returnCitySN["cip"]
  const addressStr = returnCitySN["cname"]

  return addressStr + "," + ipStr
}

// 数组键值排序
export const sortByKey = (arr, key) => {
  return arr.sort((a, b) => {
    let x = a[key]
    let y = b[key]
    return ((x > y) ? -1 : ((x < y) ? 1 : 0));
  })
}

// 生成长订单号
export const tradeNo = () => {
  const now = new Date()
  const year = now.getFullYear();
  let month = now.getMonth() + 1;
  let day = now.getDate();
  let hour = now.getHours();
  let minutes = now.getMinutes();
  let seconds = now.getSeconds();
  String(month).length < 2 ? (month = Number("0" + month)) : month;
  String(day).length < 2 ? (day = Number("0" + day)) : day;
  String(hour).length < 2 ? (hour = Number("0" + hour)) : hour;
  String(minutes).length < 2 ? (minutes = Number("0" + minutes)) : minutes;
  String(seconds).length < 2 ? (seconds = Number("0" + seconds)) : seconds;
  const yyyyMMddHHmmss = `${year}${month}${day}${hour}${minutes}${seconds}`;
  return 'M' + yyyyMMddHHmmss + Math.random().toString(36).substr(2, 9);
}

// 生成短订单号
export const tradeShortNo = () => {
  const now = new Date()
  const year = now.getFullYear();
  let month = now.getMonth() + 1;
  let day = now.getDate();
  let hour = now.getHours();
  let minutes = now.getMinutes();
  let seconds = now.getSeconds();
  let mSeconds = now.getTime();
  String(month).length < 2 ? (month = Number("0" + month)) : month;
  String(day).length < 2 ? (day = Number("0" + day)) : day;
  String(hour).length < 2 ? (hour = Number("0" + hour)) : hour;
  String(minutes).length < 2 ? (minutes = Number("0" + minutes)) : minutes;
  String(seconds).length < 2 ? (seconds = Number("0" + seconds)) : seconds;
  mSeconds = String(mSeconds).substr(-1, 3);
  const yyyyMMddHHmmSSsss = `${year}${month}${day}${hour}${minutes}${seconds}${mSeconds}`;
  return 'M' + yyyyMMddHHmmSSsss;
}

// 匹配省市区
export const cityMatch = (data, options) => {
  let cityArr = typeof data == "object" ? data : data.split(",");
  let cityData = "";
  let sData = {};
  let xData = {};
  cityArr.map((item, index) => {
    switch (index) {
      case 0:
        for (let i = 0; i < options.length; i++) {
          if (options[i].value == item) {
            sData = options[i];
            cityData += options[i].label;
          }
        }
        break;
      case 1:
        for (let i = 0; i < sData.children.length; i++) {
          if (sData.children[i].value == item) {
            xData = sData.children[i];
            cityData += sData.children[i].label;
          }
        }
        break;
      case 2:
        for (let i = 0; i < xData.children.length; i++) {
          if (xData.children[i].value == item) {
            cityData += xData.children[i].label;
          }
        }
        break;
      default:
        break;
    }
  });
  return cityData;
}
