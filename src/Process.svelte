<script>
  export let id;
  export let name;
  export let text;
  export let xloc;
  export let yloc;
  const radius = 50;
  const fill = "#D0F0C0";
</script>

<g>
  <g {id}>
    <!-- process node -->
    <circle
      stroke="black"
      stroke-width="0px"
      {fill}
      cx={xloc}
      cy={yloc}
      r={radius} />
    <!-- process name  -->
    <text
      font-weight="bold"
      x={xloc}
      y={yloc}
      dominant-baseline="central"
      text-anchor="middle"
      stroke-width="1px">
      {name}
    </text>
  </g>


</g>
