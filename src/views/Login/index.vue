<template>
  <account-area>
    <a-form-model ref="form" :rules="rules" :model="form" hideRequiredMark>
      <a-form-model-item
        label="用户名"
        prop="login"
        :help="help.login"
        :validateStatus="validateStatus.login"
      >
        <a-input v-model="form.login" placeholder="请输入用户名">
          <a-icon slot="prefix" type="user" />
        </a-input>
      </a-form-model-item>
      <a-form-model-item label="密码" prop="password">
        <a-input-password v-model="form.password" placeholder="请输入密码">
          <a-icon slot="prefix" type="lock" />
        </a-input-password>
      </a-form-model-item>
      <a-form-model-item class="submit-item">
        <a-button type="primary" @click="onSubmit">登录</a-button>
        <p class="f-csp hint" @click="onForget">忘记密码</p>
      </a-form-model-item>
    </a-form-model>
  </account-area>
</template>

<script>
import AccountArea from './base/AccountArea.vue'
export default {
  name: '',
  data() {
    const vm = this
    return {
      form: {
        login: '',
        password: ''
      },
      help: {
        login: '',
        password: ''
      },
      validateStatus: {
        login: '',
        password: ''
      },
      rules: {
        login: [
          {
            validator: (rule, value, callback) => {
              value = value.trim()
              if (value) {
                callback()
                vm.help.login = ''
                vm.validateStatus.login = ''
              } else {
                callback(new Error('请输入账号')) // todo:校验
              }
            },
            trigger: 'blur'
          }
        ],
        password: [
          {
            validator: (rule, value, callback) => {
              value = value.trim()
              if (value) {
                callback()
              } else {
                // this.$message.error('请输入密码')
                callback(new Error('请输入密码')) // todo:校验
                // callback() // todo:校验
              }
            },
            trigger: 'blur'
          }
        ]
      }
    }
  },
  components: {
    AccountArea
  },
  created() {},
  mounted() {},
  methods: {
    onSubmit() {
      this.$refs.form.validate(valid => {
        if (!valid) return
        this.$store
          .dispatch('user/login', this.form)
          .then(() => {
            this.$router.push({
              path: '/'
            })
          })
          .catch(err => {
            console.error(err.response)
            if (
              err.response.data.code === 10010005 ||
              err.response.data.code === 10010003
            ) {
              this.help.login = '账号或密码错误'
              this.validateStatus.login = 'error'
            }
          })
        // this.setRoutes(2)
      })
    },

    onForget() {
      this.$message.error(' 请联系管理员重置密码')
    }
  }
}
</script>
<style lang="scss" scoped>
@import '@/style/var.scss';
main {
  height: inherit;
  display: flex;
  aside {
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 62%;
    background-color: $dark-blue;
    overflow: hidden;
    h3 {
      position: absolute;
      left: 22px;
      top: 25px;
      font-size: 16px;
      color: #ffffff;
    }
    img {
      display: block;
      width: 72%;
      min-width: 400px;
    }
  }
  section {
    display: flex;
    flex-direction: column;
    justify-content: center;
    width: 38%;
    min-width: 460px;
    // padding-left: calc((38% - 340px) * 0.4);
    // padding-left: calc(38% * 0.1);
    text-align: center;
    background-color: #f9f9f9;
    h3 {
      margin-bottom: 73px;
      font-size: 48px;
      color: #002766;
    }
    .ant-form {
      width: 400px;
      margin: 0 auto;
      margin-bottom: 24px;
      ::v-deep .ant-form-item-label {
        display: none;
        & > label {
          font-size: 16px;
          &::after {
            content: '';
          }
        }
      }
      ::v-deep .ant-form-item-control-wrapper {
        width: 100%;
      }
      ::v-deep .ant-input {
        height: 45px;
        line-height: 45px;
        font-size: 20px;
        font-weight: initial;
        border-color: transparent;
      }
    }

    .submit-item {
      padding-top: 36px;
    }
    .ant-btn {
      width: 100%;
      height: 40px;
      font-size: 20px;
    }
    .hint {
      margin-top: 24px;
      text-align: center;
      font-size: 16px;
      line-height: initial;
      color: #1b84ff;
    }
    .btn-login {
      width: 152px;
      height: 64px;
      font-size: 30px;
      color: #ffffff;
      border: none;
      outline: none;
      background-color: #1890ff;
      box-shadow: 0px 9px 13px 0px rgba(24, 144, 255, 0.3);
      border-radius: 64px;
    }
  }
}
</style>
