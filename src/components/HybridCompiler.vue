<script setup lang="ts">
    import { PieceBlueprint, HybridBlueprint } from '../types';

    export function makeHybridBlueprint(
        a: PieceBlueprint,
        b: PieceBlueprint
        ): HybridBlueprint {
        const avg = (x: number, y: number) => Math.floor((x + y) / 2);

        return {
            kind: 'hybrid',
            name: `${a.name}/${b.name}`,
            description: `Hybrid of ${a.name} and ${b.name}`,
            unicode: a.unicode,
            extraUnicode: b.unicode,

            // averaged stats
            maxSize: avg(a.maxSize, b.maxSize),
            attack: avg(a.attack, b.attack),
            defence: avg(a.defence, b.defence),
            moves: avg(a.moves, b.moves),
            rarity: avg(a.rarity, b.rarity) + 2,

            // behavior comes from first blueprint
            //targetType: a.targetType,
            //special: a.special,

            baseA: a,
            baseB: b,
        };
    }

</script>