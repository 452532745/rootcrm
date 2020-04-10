import Vue from 'vue'
export default new Vue()

// 组件1
// methods:{
//     changesize(){
//         Bus.$emit('add',this.arg)
//     }
// }


// 组件2
// created(){
//     Bus.$on('add',(message)=>{
//         //一些操作，message就是从top组件传过来的值
//         console.log(message)
//     })
// },