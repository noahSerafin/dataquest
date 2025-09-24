<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from "vue"
import type { Coordinate } from "../types"
import { Piece } from "../Pieces" // adjust path if needed


interface Props{
    piece: Piece
    tileSize: number // we’ll get this from the board to keep scaling consistent
}
</script>

<template>
    <div :class='piece'
     class="piece"
    :title="`${piece.name}: ${piece.desc}`"
    :style="{
      left: piece.headPosition.x * tileSize + 'px',
      top: piece.headPosition.y * tileSize + 'px',
      width: tileSize + 'px',
      height: tileSize + 'px',
      lineHeight: tileSize + 'px',
      fontSize: Math.floor(tileSize * 0.8) + 'px'
    }"
  >
  {{ piece.unicode }}        
    </div>
</template>

<style scoped>
.piece {
  position: absolute;
  text-align: center;
  cursor: pointer;
  user-select: none;
}
</style>