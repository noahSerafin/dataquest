<script setup lang="ts">
    import { Piece, allPieces } from '../Pieces';
    import type { PieceBlueprint, HybridBlueprint, Coordinate } from '../types';
    import { makeBlueprint } from '../helperFunctions';

    class HybridPiece extends Piece {//might not need this
        private primaryImpl: Piece;

        extraUnicode?: string;

        constructor(
            primary: Piece,
            secondary: PieceBlueprint,
            removeCallback?: (p: Piece) => void,
            id?: string
        ) {
            const stats = makeHybridStats(makeBlueprint(primary), secondary);

            super(
            `${primary.name}/${secondary.name}`,
            primary.description,
            primary.unicode,
            stats.moves,
            stats.attack,
            stats.defence,
            stats.actions,
            stats.range,
            primary.color,
            primary.headPosition,
            [primary.headPosition],
            primary.team,
            Math.floor((primary.rarity + secondary.rarity) / 2),
            removeCallback,
            id
            );

            this.extraUnicode = secondary.unicode;

            // 🔑 Store behavior source
            this.primaryImpl = primary;

            // Copy behavior metadata
            this.targetType = primary.targetType;
            this.specialName = primary.specialName;
        }

        async special(payload: any) {
            // Delegate, but bind `this` to hybrid
            return this.primaryImpl.special.call(this, payload);
        }
    }

    export function createHybridBlueprint(//stats aren't static, so we could change the primary values using one of the below function
        primary: PieceBlueprint,
        secondary: PieceBlueprint
        ): HybridBlueprint {
        return {
            id: crypto.randomUUID(),
            name: `${primary.name}/${secondary.name}`,
            description: 'A Hybrid, primary feature: '+primary.description,
            unicode: primary.unicode,
            extraUnicode: secondary.unicode,
            // averaged stats (rounded down)
            maxSize: Math.floor((primary.maxSize + secondary.maxSize) / 2),
            moves: Math.floor((primary.moves + secondary.moves) / 2),
            range: Math.floor((primary.range + secondary.range) / 2),
            attack: Math.floor((primary.attack + secondary.attack) / 2),
            defence: Math.floor((primary.defence + secondary.defence) / 2),
            rarity: Math.max(primary.rarity, secondary.rarity),
            color: primary.color,
            isPlaced: false,
            cost: primary.cost + secondary.cost,
            kind: 'hybrid',
            primary: primary,
            secondary: secondary
        }
    };

    function applyBlueprintStats(piece: Piece, bp: PieceBlueprint) {
        piece.maxSize = Math.floor((piece.maxSize + bp.maxSize) / 2),
        piece.attack =  Math.floor((piece.attack + bp.attack) / 2),
        piece.defence = Math.floor((piece.defence + bp.defence) / 2),
        piece.range = Math.floor((piece.range + bp.range) / 2),
        piece.moves = Math.floor((piece.moves + bp.moves) / 2),
        piece.rarity = bp.rarity
    }

    function applyHybridMetadata(piece: Piece, bp: HybridBlueprint) {
        piece.name = bp.name
        piece.unicode = bp.primary.unicode
        piece.extraUnicode = bp.secondary.unicode

        //piece.isHybrid = true
        //piece.secondarySource = bp.secondary.name
    }

    export function instantiateHybridFromBlueprint(//this goes in app
        bp: HybridBlueprint,
        coord: Coordinate,
        team: string,
        removeCallback: (p: Piece) => void
    ): Piece {
        // Step 1: always instantiate PRIMARY class
        const primaryName =
            bp.kind === 'hybrid' ? bp.primary.name : bp.name

        const PieceClass = allPieces.find(p => p.name === primaryName)
        if (!PieceClass) {
            throw new Error(`Unknown piece: ${primaryName}`)
        }

        const piece = new PieceClass(coord, team, removeCallback, bp.id)

        // Step 2: apply blueprint stats (normal OR hybrid)
        applyBlueprintStats(piece, bp)

        // Step 3: hybrid-specific augmentation
        if (bp.kind === 'hybrid') {
            applyHybridMetadata(piece, bp)
        }

        return piece//modified piece with new stats
    }

</script>