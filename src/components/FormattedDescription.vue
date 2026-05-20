<script setup lang="ts">
import { computed } from 'vue';
import { STATUS_INFO, STATUS_ICONS, STATUS_COLORS } from '../statuses';

const props = withDefaults(
  defineProps<{
    description: string;
    isHeader?: boolean;
  }>(),
  {
    isHeader: false,
  }
);

const statusKeys = Object.keys(STATUS_INFO);

// Common variations of status words to catch more mentions
const statusAliases: Record<string, string> = {
  'freeze': 'frozen',
  'freezes': 'frozen',
  'poison': 'poisoned',
  'burn': 'burning',
  'burns': 'burning',
  'disease': 'diseased',
  'blind': 'blinded',
  'confuse': 'confused',
  'charm': 'charmed',
  'hide': 'hidden',
  'hiding': 'hidden',
  'expose': 'exposed',
  'exposes': 'exposed',
  'exposing': 'exposed',
  'enrage': 'enraged',
  'disarm': 'disarmed',
  'Longshot': 'Longshot',
  'Holographic': 'Holographic',
  'Deadly': 'Deadly',
  'Gold': 'Gold',
  'Overclocked': 'Overclocked',
  'Stone': 'Stone',
  'Steel': 'Steel',
  'Savage': 'Savage',
  'Cautious': 'Cautious',
  'Towering': 'Towering',
  'Lead': 'Lead',
  'Beserker': 'Beserker',
  'Reaching': 'Reaching',
  'Lightweight': 'Lightweight',
  'Bloated': 'Bloated',
  'Bronze': 'Bronze',
  'Sharp': 'Sharp',
  'Speedy': 'Speedy',
  'Fast': 'Fast',
  'Giant': 'Giant',
  'Glass': 'Glass',
  'Vicious': 'Vicious',
  'Compressed': 'Compressed'
};

const allSearchTerms = [...statusKeys, ...Object.keys(statusAliases)];
// Sort by length descending to match longer terms first (e.g. "poisoned" before "poison")
allSearchTerms.sort((a, b) => b.length - a.length);

const statusRegex = new RegExp(`\\b(${allSearchTerms.join('|')})\\b`, 'gi');

const chunks = computed(() => {
  if (!props.description) return [];

  const result = [];
  let lastIndex = 0;
  let match;

  // Reset regex index
  statusRegex.lastIndex = 0;

  while ((match = statusRegex.exec(props.description)) !== null) {
    // Add text before the match
    if (match.index > lastIndex) {
      result.push({
        type: 'text',
        content: props.description.substring(lastIndex, match.index)
      });
    }

    // Add the status match
    const keyword = match[0];
    let statusKey: string | undefined = undefined;

    // Check statusAliases first (exact case)
    if (statusAliases[keyword]) {
      statusKey = statusAliases[keyword];
    } else if (STATUS_INFO[keyword]) {
      statusKey = keyword;
    } else {
      // Check lowercase fallback (for case-insensitive status words)
      const lowerKeyword = keyword.toLowerCase();
      if (statusAliases[lowerKeyword]) {
        statusKey = statusAliases[lowerKeyword];
      } else if (STATUS_INFO[lowerKeyword]) {
        statusKey = lowerKeyword;
      }
    }

    if (statusKey && STATUS_INFO[statusKey]) {
      result.push({
        type: 'status',
        content: keyword,
        key: statusKey,
        info: STATUS_INFO[statusKey],
        icon: STATUS_ICONS[statusKey],
        color: STATUS_COLORS[statusKey]
      });
    } else {
      result.push({
        type: 'text',
        content: keyword
      });
    }

    lastIndex = statusRegex.lastIndex;
  }

  // Add remaining text
  if (lastIndex < props.description.length) {
    result.push({
      type: 'text',
      content: props.description.substring(lastIndex)
    });
  }

  return result;
});
</script>

<template>
  <span class="formatted-description">
    <template v-for="(chunk, index) in chunks" :key="index">
      <span v-if="chunk.type === 'text'">{{ chunk.content }}</span>
      <span v-else class="status-wrapper">
        <span :class="['status-keyword', { 'header-mode': isHeader }]" :style="{ color: chunk.color }">
          {{ chunk.content }}
          <span v-if="!isHeader && chunk.icon" class="status-icon-inline">{{ chunk.icon }}</span>

          <span class="status-tooltip-distinct">
            <div class="tooltip-header" :style="{ borderBottomColor: chunk.color || '#00ffcc' }">
              <span v-if="chunk.icon" class="tooltip-icon">{{ chunk.icon }}</span>
              <span class="tooltip-title" :style="{ color: chunk.color || '#00ffcc' }">{{ chunk.key }}</span>
            </div>
            <div class="tooltip-body">
              {{ chunk.info }}
            </div>
          </span>
        </span>
      </span>
    </template>
  </span>
</template>

<style scoped>
.formatted-description {
  line-height: 1.4;
}

.status-wrapper {
  position: relative;
  display: inline-block;
}

.status-keyword {
  font-weight: 600;
  cursor: help;
  position: relative;
  text-decoration: underline dotted;
  text-underline-offset: 3px;
  transition: all 0.2s ease;
}

.status-keyword:hover {
  filter: brightness(1.2);
  text-decoration: underline solid;
}

.status-keyword.header-mode {
  font-weight: inherit;
  cursor: help;
  text-decoration: none;
}

.status-keyword.header-mode:hover {
  text-decoration: none;
  filter: brightness(1.2);
}

.status-icon-inline {
  font-size: 0.9em;
  margin-left: 2px;
  filter: saturate(0.8);
}

/* Premium Tooltip Styling */
.status-tooltip-distinct {
  visibility: hidden;
  position: absolute;
  bottom: 125%;
  left: 50%;
  transform: translateX(-50%) translateY(10px);
  width: 200px;
  background: rgba(20, 20, 20, 0.98);
  backdrop-filter: blur(12px);
  color: #eee;
  border-radius: 8px;
  padding: 0;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.6),
    0 0 0 1px rgba(255, 255, 255, 0.1);
  z-index: 10000;
  opacity: 0;
  transition: opacity 0.25s ease, transform 0.25s ease;
  pointer-events: none;
  overflow: hidden;
  text-decoration: none;
  font-style: normal;
}

.status-keyword:hover .status-tooltip-distinct {
  visibility: visible;
  opacity: 1;
  transform: translateX(-50%) translateY(0);
}

.tooltip-header {
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.05);
  border-bottom: 2px solid;
  display: flex;
  align-items: center;
  gap: 8px;
}

.tooltip-icon {
  font-size: 1.2em;
}

.tooltip-title {
  font-weight: bold;
  text-transform: capitalize;
  letter-spacing: 0.5px;
  font-size: 14px;
}

.tooltip-body {
  padding: 10px 12px;
  font-size: 12px;
  line-height: 1.4;
  color: #ddd;
  white-space: normal;
}

/* Tooltip Arrow */
.status-tooltip-distinct::after {
  content: "";
  position: absolute;
  top: 100%;
  left: 50%;
  margin-left: -6px;
  border-width: 6px;
  border-style: solid;
  border-color: rgba(20, 20, 20, 0.98) transparent transparent transparent;
}
</style>
