<template>
  <div>
    <!-- 头部面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>数据统计</el-breadcrumb-item>
      <el-breadcrumb-item>数据报表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片主体视图区域 -->
    <el-card>
      <!-- 第二步：为echarts准备一个用于显示图表的dom区域 -->
      <div id="main" style="width:600px; height:400px;"></div>
    </el-card>
  </div>
</template>

<script>
// 第一步：导入echarts
import echarts from 'echarts'
// 导入lodash，使用合并对象功能

export default {
  data() {
    return {
      // 需要合并的图表数据
      options: {
        title: {
          text: '用户来源'
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross',
            label: {
              backgroundColor: '#E9EEF3'
            }
          }
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: [
          {
            boundaryGap: false
          }
        ],
        yAxis: [
          {
            type: 'value'
          }
        ]
      }
    }
  },
  created() {},
  async mounted() {
    // 第三步：基于准备好的DOM，调用echarts的init接口，初始化echarts实例
    const myCharts = echarts.init(document.getElementById('main'))
    // 第四步：发送请求获取图表数据
    const { data: res } = await this.$http.get('reports/type/1')
    console.log(res)
    if (res.meta.status !== 200) { return this.$message.error('获取图表数据失败！') }
    // 第五步：调用echarts的setOption接口展示数据
    myCharts.setOption(res.data)
  },
  methods: {}
}
</script>

<style lang="less" scoped>
</style>
