<script steup lang="ts">
    import { Player } from '../Player';

    interface Props{
        hasWonRound: boolean,
        player: Player,
        interest: number,
        bonusInterest: number
    }
    const props = defineProps<Props>()

</script>

<template>
    <div class="round-summary">
        <h3>
            Node complete
        </h3>
        <div class="interest-summary">
            Total interest earned: {{ }}
        </div>
    </div>
</template>