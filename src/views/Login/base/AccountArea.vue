<template>
  <main>
    <aside>
      <img :src="require('@/assets/image/chatu.png')" alt="" />
    </aside>
    <section>
      <h3>{{ title }}</h3>
      <slot></slot>
    </section>
  </main>
</template>

<script>
export default {
  name: 'AccountArea',
  props: {
    title: {
      type: String,
      default: '登录'
    }
  },
  data() {
    return {}
  },
  components: {},
  created() {},
  mounted() {},
  methods: {}
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
