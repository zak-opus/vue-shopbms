<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片区域 -->
    <el-card>
      <!-- 添加角色按钮 -->
      <el-row>
        <el-col>
          <el-button type="primary">添加角色</el-button>
        </el-col>
      </el-row>

      <!-- 角色列表显示区域 -->
      <el-table :data="roleList" border stripe>
        <!-- 展开列 -->
        <el-table-column type="expand">
          <template slot-scope="scope">
            <!-- 每一行：循环展示当前角色的所有权限信息 -->
            <el-row
              :class="['bg-bottom', i1 === 0 ? 'bg-top' : '', 'vcenter']"
              v-for="(item1, i1) in scope.row.children"
              :key="item1.id"
            >
              <!-- 第一列：一级权限列表：显示一个一级权限 -->
              <el-col :span="5">
                <el-tag closable @close="removeRightById(scope.row, item1.id)">{{item1.authName}}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!-- 第二列：显示一个一级权限对应的二级、三级权限显示 -->
              <el-col :span="19">
                <el-row
                  :class="[i2 === 0 ? '' : 'bg-top', 'vcenter']"
                  v-for="(item2, i2) in item1.children"
                  :key="item2.id"
                >
                  <!-- 第二列：中的第一列：显示二级权限 -->
                  <el-col :span="6">
                    <el-tag
                      type="success"
                      closable
                      @close="removeRightById(scope.row, item2.id)"
                    >{{item2.authName}}</el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <!-- 第二列：中的第二列：显示三级权限 -->
                  <el-col :span="18">
                    <el-tag
                      type="warning"
                      v-for="item3 in item2.children"
                      :key="item3.id"
                      closable
                      @close="removeRightById(scope.row, item3.id)"
                    >{{item3.authName}}</el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <el-table-column type="index"></el-table-column>
        <el-table-column label="角色名称" prop="roleName"></el-table-column>
        <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
        <el-table-column label="操作" width="300px">
          <template slot-scope="scope">
            <el-button size="mini" type="primary" icon="el-icon-edit">编辑</el-button>
            <el-button size="mini" type="danger" icon="el-icon-delete">删除</el-button>
            <el-button
              size="mini"
              type="warning"
              icon="el-icon-setting"
              @click="showSetRightDialog(scope.row)"
            >分配权限</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <!-- 分配权限功能的对话框 -->
    <el-dialog title="分配权限" :visible.sync="setRightDialogVisible" width="50%" @close="setRightDialogClosed">
      <!-- tree树形展示权限列表 -->
      <el-tree :data="rightsList" :props="treeProps" show-checkbox default-expand-all node-key="id" :default-checked-keys="defList" ref="treeRef"></el-tree>
      <!-- 权限对话框底部按钮区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRightDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="allKeys">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 角色列表
      roleList: [],
      // 权限列表
      rightsList: [],
      // tree默认选中的节点id
      defList: [],
      // tree树形显示权限的属性配置
      treeProps: {
        children: 'children',
        label: 'authName'
      },
      // 分配权限对话框的显示隐藏
      setRightDialogVisible: false,
      // 保存分配权限对话框中的id
      roleId: ''
    }
  },
  created() {
    this.getRoleList()
  },
  methods: {
    // 初始化获取角色列表/所有角色、权限数据
    async getRoleList() {
      const { data: res } = await this.$http.get('/roles')
      if (res.meta.status !== 200) {
        return this.$message.error('获取角色列表失败！')
      }
      this.roleList = res.data
      // console.log(this.roleList)
    },
    // 利用tag标签根据权限id删除权限
    async removeRightById(role, rightId) {
      const confirmResult = await this.$confirm(
        '此操作将永久删除该权限, 是否继续?',
        '提示',
        { confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning' }
      ).catch(err => err)
      if (confirmResult !== 'confirm') {
        return this.$message.info('已取消删除')
      }
      const { data: res } = await this.$http.delete(
        `roles/${role.id}/rights/${rightId}`
      )
      if (res.meta.status !== 200) {
        return this.$message.error('删除权限失败！')
      }
      this.$message.success('删除权限成功！')
      role.children = res.data
    },
    // 分配权限对话框
    async showSetRightDialog(role) {
      // console.log(role)
      // 保存角色ID，以表对话框使用
      this.roleId = role.id
      const { data: res } = await this.$http.get('rights/tree')
      // console.log(res)
      if (res.meta.status !== 200) {
        return this.$message.error('获取权限列表失败！')
      }
      // this.$message.success('获取权限列表成功')
      this.rightsList = res.data
      // console.log(res.data)
      // 获取当前角色所有三级节点id
      this.getDefList(role, this.defList)
      this.setRightDialogVisible = true
    },
    // 通过递归的方式获取角色的所有三级权限id，并存到数组defList中
    getDefList(node, arr) {
      // 如果已经是三级节点，就直接存id
      if (!node.children) { return arr.push(node.id) }
      // 不是三级节点，遍历子节点
      node.children.forEach(item => {
        this.getDefList(item, arr)
      })
    },
    // 分配权限对话框关闭重置数组
    setRightDialogClosed() {
      this.defList = []
    },
    // 收集所有选中的节点id，实现分配权限功能
    async allKeys() {
      const keys = [
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedKeys()
      ]
      // console.log(keys)
      const str = keys.join(',')
      const { data: res } = await this.$http.post(`roles/${this.roleId}/rights`, { rids: str })
      if (res.meta.status !== 200) { return this.$message.error('更新权限失败！') }
      this.$message.success('更新权限成功！')
      this.getRoleList()
      this.setRightDialogVisible = false
    }
  }
}
</script>

<style lang="less" scoped>
.el-tag {
  margin: 7px;
}
.bg-top {
  border-top: 1px solid #eee;
}
.bg-bottom {
  border-bottom: 1px solid #eee;
}
.vcenter {
  display: flex;
  align-items: center;
}
</style>
