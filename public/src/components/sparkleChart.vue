
<template>
    <svg class="sparkline" :width="width" :height="height" :stroke-width="stroke">
        <path class="sparkline--line" :d="shape" fill="none"></path>
        <path
            class="sparkline--fill"
            :d="[shape, fillEndPath].join(' ')"
            stroke="none"
        />
    </svg>
</template>

<script lang="ts" setup>
import { onMounted, computed, ref, watch } from 'vue'
import { processesStore } from 'src/stores/processes.store';
import { storeToRefs } from 'pinia';
import { type } from 'os';

const useProcessesStore = processesStore()
const { datapoints } = storeToRefs(useProcessesStore)
const stroke = 2
const width = 100
const height = 20
const res = ref<any>([0, 0, 0, 0, 0, 0, 0, 0, 0, 0])

const props = defineProps<{
    name: string,
    type: string
}>()

// setInterval( () => {
//     res.value.shift()
//     res.value.push(0)
// }, 1000)

watch(datapoints, (val) => {
    if (props.name && props.type && val[props.name][props.type] !== undefined ) {
        res.value.shift()
        switch( props.type ) {
            case 'cpu':
                res.value.push(val[props.name][props.type])
                break;
            case 'memory':
                res.value.push(useProcessesStore.calcMemory(val[props.name][props.type], true))
                break;
        }
    }
}, {
    deep: true
})

const shape = computed( () => {
      const h = height - stroke * 2;
      const d = res.value || [];

      const highestPoint = Math.max.apply(null, d) + 1;
      const coordinates: any = [];
      const totalPoints = d.length - 1;
      d.forEach((item: any, n: any) => {
        const x = (n / totalPoints) * width + stroke;
        const y = h - (item / highestPoint) * h + stroke;
        coordinates.push({ x, y: Math.floor(y) });
      });
      if (!coordinates[0]) {
        return (
          'M 0 ' +
          stroke +
          ' L 0 ' +
          stroke +
          ' L ' +
          width +
          ' ' +
          stroke
        );
      }
      const path: any = [];
      coordinates.forEach((point: any) =>
        path.push(['L', point.x, point.y].join(' '))
      );
      return ['M' + coordinates[0].x, coordinates[0].y, ...path].join(' ');
} )

const fillEndPath = computed( () => {
    return `V ${height} L 4 ${height} Z`;
} )

</script>
<style scoped lang="scss">
    svg {   
        stroke: $primary;
        fill: $grey-9;
        transition: all 1s ease-in-out;
    }

    svg path {
        box-sizing: border-box;
    }
</style>