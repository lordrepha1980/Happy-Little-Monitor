<template>
    <div class="row q-mb-xs">
        <div class="col-12">
            <q-separator spaced dark />
            <span class="text-bold q-pr-md">{{ `${props.value._id.year}-${props.value._id.month}-${props.value._id.day}` }}</span> max: {{ maxObj && maxObj.count }} / last hour: {{ props.value && props.value.data[props.value.data.length - 1].count }}
        </div>
        <div class="col-12 q-pt-sm">
            <canvas ref="barChart" width="0" :height="canvasHeight"></canvas>
        </div>
    </div>
</template>
<script setup lang="ts">
import { ref, nextTick, onMounted, watch } from 'vue'
import { Screen } from 'quasar';

const barChart = ref(null)
const maxObj = ref(null)

const props = defineProps({
    value: Object
})

onMounted(() => {
    nextTick(() => {
        drawBarChart();
    })
})

watch(Screen, () => {
    drawBarChart();
})

const canvasHeight = 60

function drawBarChart() {
    var canvas: any = barChart.value;
    if ( canvas && props.value ) {
        const dayofMonth = props.value._id

        let ctx = canvas.getContext("2d");
        ctx.canvas.width = Screen.width - 60
        const barSpacing = 20;
        const barWidth = (ctx.canvas.width - 24 * barSpacing) / 24;

        // position first bar
        var x = 0;

        maxObj.value = props.value.data.reduce(function(prev: any, current: any) {
            return (prev.count > current.count) ? prev : current
        });
        const scale = (canvasHeight - 15) / maxObj.value.count

        for (var i = 0; i < 24; i++) {
            const item = props.value.data.find((dat: any) => { return dat.hour == i ? dat : null }) || { hour: i, count: 0 }
            // calc rectangel hight
            const barHeight = item.count;

            // create rectangel
            ctx.fillStyle = "#fff176"
            ctx.font = "10px Arial";
            ctx.textAlign = "center";
            ctx.fillRect(x, canvas.height - 15 - ( scale * barHeight ), barWidth, scale * barHeight);
            ctx.fillStyle = "#fff"
            ctx.fillText(item.hour, x + barWidth / 2, canvas.height - 0);

            // ctx.fillStyle = "#fff"
            // ctx.fillText(item.count, x + barWidth / 2, canvas.height - 20);

            // Position des nächsten Balkens berechnen
            x += barWidth + barSpacing;
        }
    }
}

watch( props, () => {
    drawBarChart();
})

</script>