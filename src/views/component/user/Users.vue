<template>
  <div>
    <!-- 面包屑区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片区域 -->
    <el-card>
      <!-- 搜索与添加区域 -->
      <el-row :gutter="20">
        <el-col :span="10">
          <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getUserList">
            <el-button slot="append" icon="el-icon-search" @click="getUserList"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="addDialogVisible = true">添加用户</el-button>
        </el-col>
      </el-row>
      <!-- 用户展示区域 -->
      <el-table :data="userList" style="width: 100%" stripe border>
        <el-table-column type="index"></el-table-column>
        <el-table-column prop="username" label="姓名"></el-table-column>
        <el-table-column prop="email" label="邮箱"></el-table-column>
        <el-table-column prop="mobile" label="电话"></el-table-column>
        <el-table-column prop="role_name" label="角色"></el-table-column>
        <!-- 状态区域 -->
        <el-table-column label="状态">
          <template slot-scope="scope">
            <el-switch v-model="scope.row.mg_state" @change="userStateChanged(scope.row)"></el-switch>
          </template>
        </el-table-column>
        <!-- 操作区域 -->
        <el-table-column label="操作" width="180px">
          <template slot-scope="scope">
            <!-- 修改按钮 -->
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              @click="showEditDialog(scope.row.id)"
            ></el-button>
            <!-- 删除按钮 -->
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="mini"
              @click="removeUserById(scope.row.id)"
            ></el-button>
            <!-- 分配角色按钮 -->
            <el-tooltip effect="dark" content="分配角色" placement="top" :enterable="false">
              <el-button
                type="warning"
                icon="el-icon-star-off"
                size="mini"
                @click="showSetRoleDialog(scope.row)"
              ></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[1, 2, 5, 10]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
    </el-card>
    <!-- 添加用户的对话框，默认隐藏 -->
    <el-dialog title="添加用户" :visible.sync="addDialogVisible" width="50%" @close="dialogClose">
      <!-- 对话框主体区域 -->
      <el-form
        :model="dialogForm"
        :rules="dialogFormRules"
        ref="addDialogFormRef"
        label-width="70px"
      >
        <el-form-item label="用户名" prop="username">
          <el-input v-model="dialogForm.username"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="dialogForm.password"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="dialogForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="dialogForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <!-- 对话框底部按钮区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addUser">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 修改用户的对话框，默认隐藏 -->
    <el-dialog
      title="修改用户信息"
      :visible.sync="editDialogVisible"
      width="50%"
      @close="editDialogClose"
    >
      <el-form
        :model="editForm"
        :rules="dialogFormRules"
        ref="editDialogFormRef"
        label-width="70px"
      >
        <el-form-item label="用户名">
          <el-input v-model="editForm.username" disabled></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="editForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editUser(editForm.id)">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 分配角色对话框 -->
    <el-dialog title="分配角色" :visible.sync="setRoleDialogVisible" width="50%" @close="setRoleClose">
      <P>当前用户：{{userInfo.username}}</P>
      <P>当前角色：{{userInfo.role_name}}</P>
      <p>分配新角色：
        <el-select v-model="roleId" placeholder="请选择">
        <el-option
          v-for="item in roleList"
          :key="item.id"
          :label="item.roleName"
          :value="item.id"
        ></el-option>
      </el-select>
      </p>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRoleDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="setRole">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    // 定义验证邮箱的正则规则
    var checkEmail = (rule, value, cb) => {
      const regEmail = /^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-])+/
      if (regEmail.test(value)) {
        return cb()
      }
      cb(new Error('请输入合法的邮箱'))
    }
    // 定义验证手机的正则规则
    var checkMobile = (rule, value, cb) => {
      const regMobile = /^1[345789]\d{9}$/
      if (regMobile.test(value)) {
        return cb()
      }
      cb(new Error('请输入合法的手机'))
    }
    return {
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 2
      },
      userList: [],
      // 需要分配角色的用户信息
      userInfo: {},
      // 获取的角色列表数据
      roleList: [],
      // 分配角色时所选角色ID
      roleId: '',
      total: 0,
      // 添加用户对话框的显示与隐藏状态
      addDialogVisible: false,
      // 修改用户对话框的显示与隐藏状态
      editDialogVisible: false,
      // 分配角色对话框的显示与隐藏状态
      setRoleDialogVisible: false,
      // 对话框绑定数据
      dialogForm: {
        username: '',
        password: '',
        email: '',
        mobile: ''
      },
      // 修改对话框查询的数据
      editForm: {},
      // 添加用户对话框校验规则/修改用户也用这个
      dialogFormRules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, max: 15, message: '长度在 6 到 15 个字符', trigger: 'blur' }
        ],
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { validator: checkEmail, trigger: 'blur' }
        ],
        mobile: [
          { required: true, message: '请输入手机', trigger: 'blur' },
          { validator: checkMobile, trigger: 'blur' }
        ]
      }
    }
  },
  created() {
    this.getUserList()
  },
  methods: {
    // 页面初始时发请求获取用户列表数据
    async getUserList() {
      const { data: res } = await this.$http.get('users', {
        params: this.queryInfo
      })
      // console.log(res)
      if (res.meta.status !== 200) {
        return this.$message.error('获取用户列表失败!')
      }
      this.userList = res.data.users
      this.total = res.data.total
    },
    // 监听每页多少条的改变，接收每页需要多少条，重发请求
    handleSizeChange(val) {
      // console.log(val)
      this.queryInfo.pagesize = val
      this.getUserList()
    },
    // 监听当前第几页，接收当前页数，重发请求
    handleCurrentChange(val) {
      // console.log(val)
      this.queryInfo.pagenum = val
      this.getUserList()
    },
    // 存储用户状态到数据库
    async userStateChanged(info) {
      // console.log(info)
      const { data: res } = await this.$http.put(
        `users/${info.id}/state/${info.mg_state}`
      )
      if (res.meta.status !== 200) {
        info.mg_state = !info.mg_state
        return this.$message.error('更新状态失败')
      }
      this.$message.success('更新状态成功')
    },
    // 添加用户对话框重置
    dialogClose() {
      this.$refs.addDialogFormRef.resetFields()
    },
    // 修改用户对话框重置
    editDialogClose() {
      this.$refs.editDialogFormRef.resetFields()
    },
    // 添加用户表单的预校验
    addUser() {
      this.$refs.addDialogFormRef.validate(async valid => {
        if (!valid) return
        // 发送真正的添加用户的请求
        const { data: res } = await this.$http.post('users', this.dialogForm)
        if (res.meta.status !== 201) {
          return this.$message.error('添加用户失败！')
        }
        this.$message.success('添加用户成功！')
        // 隐藏对话框
        this.addDialogVisible = false
        // 重新获取用户列表
        this.getUserList()
      })
    },
    // 修改用户表单的预校验
    editUser(id) {
      this.$refs.editDialogFormRef.validate(async valid => {
        if (!valid) return
        // 发送修改用户信息请求
        const { data: res } = await this.$http.put('users/' + id, {
          email: this.editForm.email,
          mobile: this.editForm.mobile
        })
        if (res.meta.status !== 200) {
          return this.$message.error('修改用户失败！')
        }
        // 隐藏对话框
        this.editDialogVisible = false
        // 重新获取用户列表
        this.getUserList()
        this.$message.success('修改用户成功！')
      })
    },
    // 显示修改用户对话框
    async showEditDialog(id) {
      const { data: res } = await this.$http.get('users/' + id)
      if (res.meta.status !== 200) {
        return this.$message.error('查询用户失败！')
      }
      this.editForm = res.data
      this.editDialogVisible = true
    },
    // 显示分配角色对话框
    async showSetRoleDialog(userInfo) {
      console.log(userInfo)
      // 将用户信息存到data中，供对话框使用；
      this.userInfo = userInfo
      // 获取所有角色列表
      const { data: res } = await this.$http.get('roles')
      if (res.meta.status !== 200) {
        return this.$message.error('获取角色列表失败！')
      }
      this.roleList = res.data
      console.log(res.data)
      this.setRoleDialogVisible = true
    },
    // 分配角色权限对话框的提交
    async setRole() {
      if (!this.roleId) { return this.$message.error('请选择用户角色！') }
      const { data: res } = await this.$http.put(`users/${this.userInfo.id}/role`, { rid: this.roleId })
      if (res.meta.status !== 200) { return this.$message.error('角色修改失败！') }
      this.$message.success('角色添加成功！')
      this.getUserList()
      this.setRoleDialogVisible = false
    },
    // 分配角色对话框关闭重置
    setRoleClose() {
      this.userInfo = {}
      this.roleId = ''
    },
    // 删除用户
    async removeUserById(id) {
      const confirmResult = await this.$confirm(
        '此操作将永久删除该用户, 是否继续?',
        '提示',
        { confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning' }
      ).catch(err => err)
      // console.log(confirmResult)
      if (confirmResult !== 'confirm') {
        return this.$message.info('已取消删除')
      }
      const { data: res } = await this.$http.delete('users/' + id)
      if (res.meta.status !== 200) {
        return this.$message.error('删除失败')
      }
      this.$message.success('删除成功')
      // this.editDialogVisible = false
      this.getUserList()
    }
  }
}
</script>

<style lang="less" scoped>
</style>
