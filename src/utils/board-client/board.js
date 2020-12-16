import { EventEmitter } from 'events'
import { WhiteWebSdk, RoomWhiteboard } from 'white-web-sdk'

export default class BoardClient extends EventEmitter {
  constructor() {
    super()
    this.whiteWebSdk = new WhiteWebSdk({
      appIdentifier: 'HwNfMD3iEeuIHrEufR7KaQ/l7RazHrjtPlPaw'
    })
    this.room = ''
    this.sdkToken =
      'NETLESSSDK_YWs9cVVrc1poM2NNLVhZS1NxbSZub25jZT0xNjA3OTMzNTEyMzUzMDAmcm9sZT0wJnNpZz00NzBlNDRmNGI1NWJiZjEwNzBkODVhYzE2NmIzZTZkYzk4OGFkMzQ4NDk5MzM5ZDgyNzhlZDRlMmM5MzFjNWYy'
  }
  createRoom() {
    console.log('========================', RoomWhiteboard)
    var url = 'https://api.netless.link/v5/rooms'
    var requestInit = {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        token: this.sdkToken
      }
    }
    return window.fetch(url, requestInit).then(function(res) {
      return res.json()
    })
  }
  createRoomToken(roomUUID) {
    var url = 'https://api.netless.link/v5/tokens/rooms/' + roomUUID
    var requestInit = {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        token: this.sdkToken
      },
      body: JSON.stringify({
        lifespan: 0, // 表明 Room Token 永不失效
        role: 'admin' // 表明 Room Token 有 Admin 的权限
      })
    }
    window
      .fetch(url, requestInit)
      .then(function(response) {
        return response.json()
      })
      .then(roomToken => {
        // 成功获取房间的 Room Token
        this.joinRoom(roomUUID, roomToken)
      })
  }
  joinRoom(roomUUID, roomToken) {
    var joinRoomParams = {
      uuid: roomUUID,
      roomToken: roomToken
    }
    this.whiteWebSdk
      .joinRoom(joinRoomParams, {
        onDisconnectWithError: function() {
          // 房间因为错误，和服务端断开连接
        },

        onKickedWithReason: function() {
          // 用户被踢出房间
        }
      })
      .then(room => {
        // 加入房间成功，获取 room 对象
        // 并将之前的 <div id="whiteboard"/> 占位符变成白板
        this.room = room
        room.bindHtmlElement(document.getElementById('whiteboard'))
      })
      .catch(function(err) {
        // 加入房间失败
        console.error(err)
      })
  }
  leaveRoom() {
    return this.room.disconnect()
  }
}
