<template>
  <div>
    home组件
    <el-button type="info" @click="logout">退出</el-button>
  </div>
</template>

<script>
export default {
  methods: {
    logout() {
      // 清除所有会话缓存
      window.sessionStorage.clear()
      // 跳转至登录组件
      this.$router.push('/login')
    }
  }
}
</script>

<style lang="less" scoped>
</style>
