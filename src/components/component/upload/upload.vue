``<template>
  <div>
    <el-upload
      action="/upload"
      list-type="picture-card"
      :http-request="upload"
      :file-list="sendPic"
    >
      <i slot="default" class="el-icon-plus"></i>
      <div slot="file" slot-scope="{file}">
        <img class="el-upload-list__item-thumbnail" :src="file.url" alt />
        <span class="el-upload-list__item-actions">
          <span class="el-upload-list__item-preview" @click="handlePictureCardPreview(file)">
            <i class="el-icon-zoom-in"></i>
          </span>
          <span v-if="!disabled" class="el-upload-list__item-delete" @click="handleDownload(file)">
            <i class="el-icon-download"></i>
          </span>
          <span v-if="!disabled" class="el-upload-list__item-delete" @click="handleRemove(file)">
            <i class="el-icon-delete"></i>
          </span>
        </span>
      </div>
    </el-upload>
    <el-dialog :visible.sync="dialogPicVisible" append-to-body>
      <img width="100%" :src="dialogImageUrl" alt />
    </el-dialog>
    <el-alert title="请上传不超过1Mb的图片格式" type="error"></el-alert>
  </div>
</template>
<script>
export default {
  name: "Upload",
  props: ["sendPic"],
  data() {
    return {
      baseUrl: "http://4g.lovelesi.com/votes/upload/",
      dialogPicVisible: false,
      dialogImageUrl: "",
      disabled: false,
      image: "",
      imageUrl: "",
      urlArr: []
    };
  },
  methods: {
    upload(f) {
      if (f.file.size < 1048576) {
        let formData = new FormData();
        console.log(f);
        formData.append("file", f.file);

        this.$http
          .post("/uploads", formData)
          .then(res => {
            let obj = {
              name: f.file.name,
              url: this.baseUrl + res.data.data.slice(7)
            };
            this.urlArr.push(obj);
            this.$emit("uploadPic", this.urlArr);
          })
          .catch(error => {
            console.log(error);
          });
      }
    },
    handleRemove(file) {
      console.log(file);
    },
    handlePictureCardPreview(file) {
      console.log(file);
      this.dialogImageUrl = file.url;
      this.dialogPicVisible = true;
    },
    handleDownload(file) {
      console.log(file);
    }
  }
};
</script>
<style scoped lang="less">
</style>