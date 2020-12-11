<template>
  <div>
    <a-form-model
      ref="form"
      :model="form"
      :rules="rules"
      :label-col="{ span: 3 }"
      :wrapper-col="{ span: 10 }"
    >
      <a-form-model-item label="appid" prop="appid">
        <a-input v-model="form.appid" placeholder="请输入appid">
          <a-icon slot="prefix" type="user" />
        </a-input>
      </a-form-model-item>
      <a-form-model-item label="token" prop="token">
        <a-input v-model="form.token" placeholder="请输入token">
          <a-icon slot="prefix" type="user" />
        </a-input>
      </a-form-model-item>
      <a-form-model-item label="accountName" prop="accountName">
        <a-input v-model="form.accountName" placeholder="请输入accountName">
          <a-icon slot="prefix" type="user" />
        </a-input>
      </a-form-model-item>
      <a-form-model-item class="submit-item">
        <a-button type="primary" @click="handleJoin">加入频道</a-button>
        <a-button type="primary" @click="handleExit" style="margin-left: 20px;">
          退出频道
        </a-button>
      </a-form-model-item>
      <a-form-model-item label="channelName" prop="channelName">
        <a-input v-model="form.channelName" placeholder="请输入channelName">
          <a-icon slot="prefix" type="user" />
        </a-input>
      </a-form-model-item>
      <a-form-model-item class="submit-item">
        <a-button type="primary" @click="handleJoinChannel">加入群聊</a-button>
        <a-button
          type="primary"
          @click="handleExitChannel"
          style="margin-left: 20px;"
        >
          退出群聊
        </a-button>
      </a-form-model-item>
    </a-form-model>
    <a-input-group>
      <a-row :gutter="8">
        <a-col :span="10">
          <a-input
            v-model="data.channelMessage"
            placeholder="请输入ChannelMessage"
          >
            <a-icon slot="prefix" type="user" />
          </a-input>
        </a-col>
        <a-col :span="8">
          <a-button type="primary" @click="sendChannel">
            send
          </a-button>
        </a-col>
      </a-row>
      <br />
      <a-row :gutter="8">
        <a-col :span="10">
          <a-input v-model="data.peerId" placeholder="请输入peerId">
            <a-icon slot="prefix" type="user" />
          </a-input>
        </a-col>
      </a-row>
      <br />
      <a-row :gutter="8">
        <a-col :span="10">
          <a-input v-model="data.peerMessage" placeholder="请输入peerMessage">
            <a-icon slot="prefix" type="user" />
          </a-input>
        </a-col>
        <a-col :span="8">
          <a-button type="primary" @click="sendPeer">
            send
          </a-button>
        </a-col>
      </a-row>
      <br />
      <a-row :gutter="8">
        <a-col :span="10">
          <a-input v-model="data.queryMember" placeholder="请输入queryMember">
            <a-icon slot="prefix" type="user" />
          </a-input>
        </a-col>
        <a-col :span="8">
          <a-button type="primary" @click="sendQuery">
            send
          </a-button>
        </a-col>
      </a-row>
    </a-input-group>
  </div>
</template>

<script>
import AgoraRTM from '@/utils/AgoraJS/agora-rtm-client'
export default {
  data() {
    return {
      form: {
        appid: 'b0e6021dc12c4571871ad120d6804d82',
        // appid: '',
        token: '',
        accountName: 'chai',
        channelName: ''
      },
      rules: {
        appid: [
          {
            required: true,
            message: '请输入appid',
            trigger: 'blur'
          }
        ],
        accountName: [
          {
            required: true,
            message: '请输入accountName',
            trigger: 'blur'
          }
        ]
      },
      data: {
        channelMessage: '',
        peerId: '',
        peerMessage: '',
        queryMember: ''
      }
    }
  },
  mounted() {
    this.init()
  },
  methods: {
    init() {
      this.rtm = new AgoraRTM()
      const rtm = this.rtm

      rtm.on('ConnectionStateChanged', (newState, reason) => {
        console.log('newState, reason', newState, reason)
      })

      rtm.on('MessageFromPeer', async (message, peerId) => {
        console.log('message, peerId', message, peerId)
      })

      rtm.on('MemberLeft', ({ chaN, args }) => {
        console.log('{ chaN, args }', chaN, args)
      })

      rtm.on('ChannelMessage', async ({ chaN, args }) => {
        const [message, memberId] = args
        if (message.messageType === 'IMAGE') {
          const blob = await rtm.client.downloadMedia(message.mediaId)
          console.log('bolb', blob)
        } else {
          console.log(chaN, message.text, memberId)
        }
      })
    },
    // 加入频道
    async handleJoin() {
      await this.joinValidate()
      const rtm = this.rtm
      const accountName = this.form.accountName

      if (rtm._logined) {
        this.$message.error('You already logined')
        return
      }

      rtm.init(this.form.appid)

      rtm.login(accountName, this.form.token).then(() => {
        this.$message.success('登录成功！')
        rtm._logined = true
      })
    },
    // 退出频道
    handleExit() {
      const rtm = this.rtm
      if (!rtm._logined) {
        this.$message.error('You already logout')
        return
      }

      rtm.logout().then(() => {
        this.$message.success(rtm.accountName + '退出成功！')
        rtm._logined = false
      })
    },
    // 加入群聊
    async handleJoinChannel() {
      await this.joinChannelValidate()

      const rtm = this.rtm
      const chaN = this.form.channelName
      if (
        rtm.channels[chaN] ||
        (rtm.channels[chaN] && rtm.channels[chaN].joined)
      ) {
        this.$message.error('You already joined')
        return
      }
      rtm.joinChannel(chaN).then(() => {
        this.$message.success('群聊加入成功！')
        rtm.channels[chaN].joined = true
      })
    },
    // 退出群聊
    handleExitChannel() {
      const chaN = this.form.channelName
      const rtm = this.rtm

      if (!rtm._logined) {
        this.$message.error('Please Login First')
        return
      }
      if (
        !rtm.channels[chaN] ||
        (rtm.channels[chaN] && !rtm.channels[chaN].joined)
      ) {
        this.$message.error('You already leave')
        return
      }

      rtm.leaveChannel(chaN).then(() => {
        this.$message.success(this.rtm.accountName + '退出成功！')
        if (rtm.channels[chaN]) {
          rtm.channels[chaN].joined = false
          rtm.channels[chaN] = null
        }
      })
    },
    sendChannel() {},
    sendPeer() {},
    sendQuery() {},
    joinValidate() {
      return new Promise(resolve => {
        this.$refs.form.validate(valid => {
          if (!valid) return
          resolve()
        })
      })
    },
    joinChannelValidate() {
      return new Promise(resolve => {
        if (!this.rtm._logined) {
          this.$message.error('Please Login First')
          return
        }
        this.joinValidate().then(() => {
          if (!this.form.channelName) {
            this.$message.error('请输入channelName')
            return
          }

          resolve()
        })
      })
    }
  }
}
</script>

<style></style>
