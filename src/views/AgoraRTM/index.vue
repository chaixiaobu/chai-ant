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
          <a-input v-model="data.memberId" placeholder="请输入memberId">
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
    <a-row :gutter="8">
      <a-col :span="10">
        <img :src="imgSrc" alt="" />
        <img :src="img" alt="" v-for="img in imgList" :key="img" />
      </a-col>
      <a-col :span="8">
        <a-button type="primary" @click="sendPeerImg">
          Peer send
        </a-button>
      </a-col>
      <a-col :span="8">
        <a-button type="primary" @click="sendChannelImg">
          Channel send
        </a-button>
      </a-col>
    </a-row>
    <a-row :gutter="8">
      <a-col :span="8">
        <a-button type="primary" @click="sendCall">
          呼叫邀请
        </a-button>
      </a-col>
      <a-col :span="8">
        <a-button type="primary" @click="sendChannelCall">
          群聊呼叫邀请
        </a-button>
      </a-col>
      <a-col :span="8">
        <p>{{ localStatus }}</p>
      </a-col>
    </a-row>
  </div>
</template>

<script>
import AgoraRTM from '@/utils/AgoraJS/agora-rtm-client'
import { imageToBlob, blobToImage } from '@/utils/common'
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
        memberId: ''
      },
      imgSrc: require('../../assets/logo.png'),
      imgList: [],
      localStatus: null
    }
  },
  mounted() {
    this.initWatch()
  },
  methods: {
    initWatch() {
      this.rtm = new AgoraRTM()
      const rtm = this.rtm

      rtm.on('ConnectionStateChanged', (newState, reason) => {
        console.log('newState, reason', newState, reason)
      })

      rtm.on('MessageFromPeer', async (message, peerId) => {
        if (message.messageType === 'IMAGE') {
          const blob = await rtm.client.downloadMedia(message.mediaId)
          blobToImage(blob, image => {
            // console.log('image', image.src)
            this.imgList.push(image.src)
          })
        } else {
          console.log('message, peerId', message.text, peerId)
        }
      })
      rtm.on('MemberJoined', ({ chaN, args }) => {
        const memberId = args[0]
        console.log('MemberJoined 加入通知 ', chaN, memberId)
      })
      rtm.on('MemberLeft', ({ chaN, args }) => {
        console.log('MemberLeft 离开通知', chaN, args)
      })

      rtm.on('ChannelMessage', async ({ chaN, args }) => {
        const [message, memberId] = args
        if (message.messageType === 'IMAGE') {
          const blob = await rtm.client.downloadMedia(message.mediaId)
          // console.log('bolb', blob)
          blobToImage(blob, image => {
            // console.log('image', image.src)
            this.imgList.push(image.src)
          })
        } else {
          console.log(chaN, message.text, memberId)
        }
      })

      rtm.on('RemoteInvitationReceived', res => {
        this.$confirm({
          title: res.callerId + '向你发来呼叫邀请！',
          content: '',
          okText: '接受',
          okType: 'danger',
          cancelText: '拒绝',
          onOk() {
            rtm.acceptCall()
          },
          onCancel() {
            rtm.refuseCall()
          }
        })
      })
      this.initInvitation()
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

      rtm.init()

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
    async handleExitChannel() {
      await this.checkLogin()

      const chaN = this.form.channelName
      const rtm = this.rtm

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
    async sendChannel() {
      await this.checkLogin()
      await this.checkJoin()
      const rtm = this.rtm
      const params = this.data

      rtm
        .sendChannelMessage(params.channelMessage, this.form.channelName)
        .then(() => {
          // 置空
          params.channelMessage = ''
          this.$message.success('发送成功')
        })
    },
    async sendPeer() {
      await this.checkLogin()

      const rtm = this.rtm
      const params = this.data
      rtm.sendPeerMessage(params.peerMessage, params.peerId).then(() => {
        // 置空
        params.peerMessage = ''
        this.$message.success('发送成功')
      })
    },
    async sendQuery() {
      await this.checkLogin()

      const rtm = this.rtm
      const params = this.data
      rtm.queryPeersOnlineStatus(params.memberId).then(res => {
        res[params.memberId]
          ? this.$message.success(params.memberId + '在线！')
          : this.$message.success(params.memberId + '不在线！')
      })
    },
    async sendPeerImg() {
      await this.checkLogin()

      const rtm = this.rtm
      const params = this.data
      imageToBlob(this.imgSrc, blob => {
        rtm.sendMessageToPeer(blob, params.peerId).then(() => {
          this.$message.success('图片发送成功！')
        })
      })
    },
    async sendChannelImg() {
      await this.checkLogin()

      const rtm = this.rtm
      const chaN = this.form.channelName
      imageToBlob(this.imgSrc, blob => {
        rtm.sendChannelMediaMessage(blob, chaN).then(() => {
          this.$message.success('群聊图片发送成功！')
        })
      })
    },
    async sendCall() {
      await this.checkLogin()
      const rtm = this.rtm
      await rtm.sendCall(this.data.peerId)
      this.initInvitation()
    },
    async sendChannelCall() {
      await this.checkLogin()
      const rtm = this.rtm
      rtm.sendCall(this.form.channelName)
    },
    joinValidate() {
      return new Promise(resolve => {
        this.$refs.form.validate(valid => {
          if (!valid) return
          resolve()
        })
      })
    },
    async joinChannelValidate() {
      await this.checkLogin()
      return new Promise(resolve => {
        this.joinValidate().then(() => {
          if (!this.form.channelName) {
            this.$message.error('请输入channelName')
            return
          }

          resolve()
        })
      })
    },
    checkLogin() {
      return new Promise(resolve => {
        const rtm = this.rtm
        if (!rtm._logined) {
          this.$message.error('Please Login First')
          return
        }
        resolve()
      })
    },
    checkJoin() {
      return new Promise(resolve => {
        const rtm = this.rtm
        const chaN = this.form.channelName
        if (
          !rtm.channels[chaN] ||
          (rtm.channels[chaN] && !rtm.channels[chaN].joined)
        ) {
          this.$message.error('Please Join first')
          return
        }
        resolve()
      })
    },
    initInvitation() {
      const rtm = this.rtm
      rtm.on('LocalInvitationReceivedByPeer', () => {
        console.log('res===================', rtm._status)
        this.localStatus = '等待中。。。'
      })
      rtm.on('LocalInvitationAccepted', () => {
        console.log('res===================', rtm._status)
        this.localStatus = '接受了'
      })
      rtm.on('LocalInvitationCanceled', () => {
        console.log('res===================', rtm._status)
        this.localStatus = 'local取消了'
      })
      rtm.on('LocalInvitationFailure', () => {
        console.log('res===================', rtm._status)
        this.localStatus = '呼叫失败了'
      })
      rtm.on('LocalInvitationRefused', () => {
        console.log('res===================', rtm._status)
        this.localStatus = '呼叫被拒绝了'
      })
    }
  }
}
</script>

<style></style>
