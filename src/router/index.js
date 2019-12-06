import Vue from 'vue'
import VueRouter from 'vue-router'

const Login = () => import('../views/Login')
const Home = () => import('../views/Home')
const Welcome = () => import('../views/component/Welcome')
const Users = () => import('../views/component/user/Users')
const Rights = () => import('../views/component/power/Rights')
const Roles = () => import('../views/component/power/Roles')

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    component: Login
  },
  {
    path: '/home',
    component: Home,
    redirect: '/welcome',
    children: [
      { path: '/welcome', component: Welcome },
      { path: '/users', component: Users },
      { path: '/rights', component: Rights },
      { path: '/roles', component: Roles }
    ]
  }
]

const router = new VueRouter({
  routes
})
// 挂载路由全局导航守卫
router.beforeEach((to, from, next) => {
  if (to.path === '/login') return next()
  const tokenStr = window.sessionStorage.getItem('token')
  if (!tokenStr) return next('/login')
  next()
})
export default router
