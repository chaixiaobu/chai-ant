<template>
  <div>
    画布

    <div id="whiteboard" style="width: 100%; height: 500px;"></div>
  </div>
</template>

<script>
import BoardClient from '@/utils/board-client/board'

export default {
  data() {
    return {}
  },
  created() {
    this.board = new BoardClient()
    this.board.createRoom().then(json => {
      const roomUUID = json.uuid
      this.board.createRoomToken(roomUUID)
    })
  }
}
</script>

<style>
#whiteboard {
  width: 100%;
  height: 500px;
  box-shadow: 5px 5px 5px 10px #333;
}
</style>
