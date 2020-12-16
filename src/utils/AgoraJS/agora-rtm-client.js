import AgoraRTM from 'agora-rtm-sdk'
import EventEmitter from 'events'

export default class RTCClient extends EventEmitter {
  constructor() {
    super()
    // 加入频道的集合
    this.channels = {}
    this._client = null
    this._logined = false
    this._invitation = null
    this._remoteInvitation = null

    this.handleError = err => {
      console.log('Error', err)
    }
  }
  init(appId) {
    this._client = AgoraRTM.createInstance(appId)

    this.subscribeClientEvents()
  }

  // 登录
  async login(accountName, token) {
    this.accountName = accountName
    return this._client.login({ uid: accountName, token })
  }

  // 退出
  logout() {
    return this._client.logout()
  }

  /**
   * 加入频道
   * @param {*} name
   */
  joinChannel(name) {
    const channel = this._client.createChannel(name)
    this.channels[name] = {
      channel,
      joined: false
    }
    this.subscribeChannelEvents(name)
    return channel.join()
  }
  /**
   * 离开频道
   * @param {*} name
   */
  async leaveChannel(name) {
    if (
      !this.channels[name] ||
      (this.channels[name] && !this.channels[name].joined)
    )
      return
    return this.channels[name].channel.leave()
  }

  /**
   * 发送频道消息，所有加入频道的用户都会收到该频道消息。
   * @param {*} text
   * @param {*} chaN
   */
  async sendChannelMessage(text, chaN) {
    if (!this.channels[chaN] || !this.channels[chaN].joined) return
    return this.channels[chaN].channel.sendMessage({ text })
  }

  /**
   * 本地用户（发送者）向指定用户（接收者）发送点对点消息或点对点的离线消息。
   * @param {*} text
   * @param {*} peerId
   */
  async sendPeerMessage(text, peerId) {
    return this._client.sendMessageToPeer({ text }, peerId.toString())
  }

  /**
   * 查询指定用户的在线状态
   * @param {*} memberId 用户 ID 列表。用户 ID 的数量不能超过 256
   */
  async queryPeersOnlineStatus(memberId) {
    return this._client.queryPeersOnlineStatus([memberId])
  }

  /**
   * 单聊发送图片消息
   * @param {*} blob 上传文件的内容。大小不能超过 32 MB
   * @param {*} peerId
   */
  async sendMessageToPeer(blob, peerId) {
    const mediaMessage = await this._client.createMediaMessageByUploading(
      blob,
      {
        messageType: 'IMAGE', // 消息类型
        fileName: 'agora.jpg',
        description: 'send image',
        thumbnail: blob, // 上传文件的缩略图
        width: 100,
        height: 200,
        thumbnailWidth: 50,
        thumbnailHeight: 200
      }
    )
    return this._client.sendMessageToPeer(mediaMessage, peerId)
  }

  /**
   * 群聊发送图片消息
   * @param {*} blob
   * @param {*} chaN
   */
  async sendChannelMediaMessage(blob, chaN) {
    if (!this.channels[chaN] || !this.channels[chaN].joined) return
    const mediaMessage = await this._client.createMediaMessageByUploading(
      blob,
      {
        messageType: 'IMAGE', // 消息类型
        fileName: 'agora.jpg',
        description: 'send image',
        thumbnail: blob, // 上传文件的缩略图
        width: 100,
        height: 200,
        thumbnailWidth: 50,
        thumbnailHeight: 200
      }
    )
    return this.channels[chaN].channel.sendMessage(mediaMessage)
  }

  /**
   * 取消上传或下载任务，也可以获取上传或下载的进度
   *
   * @param {*} message
   */
  async cancelImage(message) {
    // 使用 AbortController 接口。IE 浏览器需要 polyfill 才能使用 AbortController 接口。
    const controller = new AbortController()
    // 上传超时触发取消操作
    setTimeout(() => controller.abort(), 1000)
    // 通过 media ID 从 Agora 服务器下载文件或图片
    await this._client.downloadMedia(message.mediaId, {
      cancelSignal: controller.signal,
      onOperationProgress: ({ curentSize, totalSize }) => {
        console.log('curentSize, totalSize', curentSize, totalSize)
      }
    })
  }
  // 发送呼叫
  async sendCall(calleeId) {
    if (this._invitation !== null) {
      this._invitation.removeAllListeners()
      this._invitation = null
    }
    // 创建 LocalInvitation
    this._invitation = await this._client.createLocalInvitation(calleeId)
    this.subscribeLocalInvitation()
    // 发送呼叫邀请
    return this._invitation.send()
  }

  cancelCall() {
    return this._invitation.cancel()
  }

  // 接受呼叫邀请
  acceptCall() {
    return this._remoteInvitation.accept()
  }

  // 拒绝呼叫邀请
  refuseCall() {
    return this._remoteInvitation.refuse()
  }

  /**
   * 订阅客户事件
   * ConnectionStateChanged: 获得 SDK 连接状态改变的通知
   * MessageFromPeer: 接收点对点消息
   */
  subscribeClientEvents() {
    const clientEvents = [
      'ConnectionStateChanged',
      'MessageFromPeer',
      'RemoteInvitationReceived'
    ]
    clientEvents.forEach(evt => {
      this._client.on(evt, (...args) => {
        this.emit(evt, ...args)
      })
    })
  }
  /**
   * 订阅频道活动
   * ChannelMessage:接收到频道消息
   * MemberJoined:收到用户进入频道的通知。
   * MemberLeft:收到用户离开频道的通知。
   */
  subscribeChannelEvents(chaN) {
    const channelEvents = ['ChannelMessage', 'MemberJoined', 'MemberLeft']
    channelEvents.forEach(evt => {
      this.channels[chaN].channel.on(evt, (...args) => {
        this.emit(evt, {
          chaN,
          args
        })
      })
    })
  }
  /**
   * 订阅主叫
   */
  subscribeLocalInvitation() {
    const events = [
      'LocalInvitationReceivedByPeer',
      'LocalInvitationAccepted',
      'LocalInvitationCanceled',
      'LocalInvitationFailure',
      'LocalInvitationRefused'
    ]
    events.forEach(evt => {
      this._invitation.on(evt, (...args) => {
        console.log('evt=============', evt)
        this.emit(evt, ...args)
      })
    })
  }

  /**
   * 订阅被呼叫
   */
  subscribeRemoteInvitation() {
    const events = [
      'RemoteInvitationAccepted',
      'RemoteInvitationCanceled',
      'RemoteInvitationFailure',
      'RemoteInvitationRefused'
    ]
    events.forEach(evt => {
      this._remoteInvitation.on(evt, (...args) => {
        this.emit(evt, ...args)
      })
    })
  }
  // on(evt, callback) {
  //   const customEvents = [
  //     'LocalInvitationReceivedByPeer',
  //     'LocalInvitationCanceled',
  //     'LocalInvitationAccepted',
  //     'LocalInvitationRefused',
  //     'LocalInvitationFailure',
  //     'RemoteInvitationReceived',
  //     'RemoteInvitationCanceled',
  //     'RemoteInvitationAccepted',
  //     'RemoteInvitationRefused',
  //     'RemoteInvitationFailure'
  //   ]
  //   if (customEvents.indexOf(evt) !== -1) {
  //     this.emit(evt, callback)
  //     return
  //   }
  //   this._client.on(evt, callback)
  // }
}
