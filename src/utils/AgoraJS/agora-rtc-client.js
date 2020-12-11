import AgoraRTC from 'agora-rtc-sdk'
import EventEmitter from 'events'

export default class RTCClient {
  constructor() {
    // 加入频道的参数
    this.option = {
      appId: '',
      channel: '',
      uid: '',
      token: ''
    }
    this.client = null
    this.localStream = null
    this._eventBus = new EventEmitter()
  }
  // 初始化and加入一个频道
  joinChannel(option) {
    return new Promise((resolve, reject) => {
      // 创建客户端
      this.client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' })
      this.client.init(
        option.appid,
        () => {
          this.clientListener()
          this.handleJoin(option, resolve)
        },
        err => {
          reject(err)
        }
      )
    })
  }
  handleJoin(option, resolve) {
    this.client.join(
      option.token ? option.token : null,
      option.channel,
      null,
      uid => {
        this.option = {
          appid: option.appid,
          token: option.token,
          channel: option.channel,
          uid: uid
        }
        resolve()
      },
      err => {
        console.error('client join failed', err)
      }
    )
  }
  pushlishStream() {
    return new Promise((resolve, reject) => {
      // 创建本地流
      this.localStream = AgoraRTC.createStream({
        streamID: this.option.uid,
        audio: true,
        video: true,
        screen: false
      })
      // 初始化本地流
      this.localStream.init(
        () => {
          resolve(this.localStream)
          // 发布本地流
          this.client.publish(this.localStream, err => {
            console.error(err)
          })
        },
        err => {
          reject(err)
        }
      )
    })
  }
  // 客户端监听
  clientListener() {
    const client = this.client
    // 该回调通知应用远端音视频流已添加
    client.on('stream-added', ent => {
      this._eventBus.emit('stream-added', ent)
    })
    // 该回调通知应用已接收远端音视频流
    client.on('stream-subscribed', ent => {
      this._eventBus.emit('stream-subscribed', ent)
    })
    // 该回调通知应用已删除远端音视频流
    client.on('stream-removed', ent => {
      this._eventBus.emit('stream-removed', ent)
    })
    // 该回调提示有远端用户/主播加入频道
    client.on('peer-online', ent => {
      this._eventBus.emit('peer-online', ent)
    })
    // 该回调通知应用有远端用户离线
    client.on('peer-leave', ent => {
      this._eventBus.emit('peer-leave', ent)
    })
  }
  on(eventName, callback) {
    this._eventBus.on(eventName, callback)
  }

  leaveChannel() {
    return new Promise((resolve, reject) => {
      // 离开频道
      this.client.unpublish(this.localStream, err => {
        console.log(err)
      })
      this.client.leave(
        () => {
          // 停止播放本地流
          if (this.localStream.isPlaying()) {
            this.localStream.stop()
          }
          // 关闭本地流
          this.localStream.close()
          this.client = null
          resolve()
        },
        err => {
          reject(err)
        }
      )
    })
  }
}
