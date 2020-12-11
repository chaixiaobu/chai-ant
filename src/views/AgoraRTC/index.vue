<template>
  <div class="container">
    <a-form-model
      ref="form"
      :rules="rules"
      :model="form"
      :label-col="{ span: 2 }"
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
      <a-form-model-item label="channel" prop="channel">
        <a-input v-model="form.channel" placeholder="请输入channel">
          <a-icon slot="prefix" type="user" />
        </a-input>
      </a-form-model-item>
      <a-form-model-item class="submit-item">
        <a-button
          type="primary"
          @click="handleJoin"
          :disabled="disableJoin"
          style="margin: 20px 60px;"
          >加入频道</a-button
        >
        <a-button
          type="primary"
          @click="handleExit"
          style="margin: 20px 0;"
          :disabled="!disableJoin"
          >退出频道</a-button
        >
      </a-form-model-item>
    </a-form-model>

    <!-- 视频窗 -->
    <div class="agora-view">
      <div class="agora-video">
        <!-- 播放器 -->
        <stream-player
          :stream="localStream"
          :domId="localStream.getId()"
          v-if="localStream"
        ></stream-player>
      </div>
      <div
        class="agora-video"
        :key="index"
        v-for="(remoteStream, index) in remoteStreams"
      >
        <!-- 播放器 -->
        <stream-player
          :stream="remoteStream"
          :domId="remoteStream.getId()"
        ></stream-player>
      </div>
    </div>
  </div>
</template>

<script>
import RTCClient from '@/utils/AgoraJS/agora-rtc-client'
import StreamPlayer from './base/StreamPlayer.vue'

export default {
  components: { StreamPlayer },
  data() {
    return {
      form: {
        appid: '08dc8d600e3941e5bdb929750bd76311',
        // appid: '',
        token:
          '00608dc8d600e3941e5bdb929750bd76311IABJ7G6tlgFpS078kyroIgZQFmGED2dQOUCyYV7g2EBkI9dXaPgAAAAAEACokQXesyXTXwEAAQCyJdNf',
        uid: null,
        channel: 'chaixiaobu'
      },
      rules: {
        channel: [
          {
            required: true,
            message: '请输入channel',
            trigger: 'blur'
          }
        ],
        appid: [
          {
            required: true,
            message: '请输入appid',
            trigger: 'blur'
          }
        ],
        token: [
          {
            required: true,
            message: '请输入token',
            trigger: 'blur'
          }
        ]
      },
      disableJoin: false,
      localStream: null, // 本地视频流
      remoteStreams: [] // 远程视频流
    }
  },
  created() {
    this.init()
  },
  methods: {
    handleJoin() {
      this.$refs.form.validate(valid => {
        if (!valid) return
        this.joinEvent()
      })
    },
    joinEvent() {
      this.rtc.joinChannel(this.form).then(() => {
        this.$message.success('Join Success')
        this.rtc.pushlishStream().then(stream => {
          // 本地视频流
          this.localStream = stream
        })
      })
      this.disableJoin = true
    },
    handleExit() {
      this.disableJoin = false
      this.leaveEvent()
    },

    leaveEvent() {
      this.rtc
        .leaveChannel()
        .then(() => {
          this.$message.success('Leave Success')
        })
        .catch(err => {
          this.$message.error('Leave Failure', err)
        })
      this.localStream = null
      this.remoteStreams = []
    },
    init() {
      this.rtc = new RTCClient()
      const rtc = this.rtc
      rtc.on('stream-added', evt => {
        const { stream } = evt
        rtc.client.subscribe(stream)
      })

      rtc.on('stream-subscribed', evt => {
        let { stream } = evt
        if (!this.remoteStreams.find(it => it.getId() === stream.getId())) {
          this.remoteStreams.push(stream)
        }
      })

      rtc.on('stream-removed', evt => {
        let { stream } = evt
        this.remoteStreams = this.remoteStreams.filter(
          it => it.getId() !== stream.getId()
        )
      })

      rtc.on('peer-online', evt => {
        this.$message.success(`Peer ${evt.uid} is online`)
      })

      rtc.on('peer-leave', evt => {
        this.$message.success(`Peer ${evt.uid} already leave`)
        this.remoteStreams = this.remoteStreams.filter(
          it => it.getId() !== evt.uid
        )
      })
    }
  }
}
</script>

<style lang="scss" scoped>
// .container {
//   width: 400px;
// }
.agora-view {
  display: flex;
  flex-wrap: wrap;
}
.agora-video {
  width: 320px;
  height: 240px;
  margin: 20px;
}

::v-deep .ant-form {
  .ant-form-item-label {
    flex: none !important;
  }
}
</style>
