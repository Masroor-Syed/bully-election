<script>
  import Process from "./Process.svelte";
  import Arrow from "./Arrow.svelte";
  import { Simulation } from "./index.js";
  import { onMount } from "svelte";

  let pcount = 4;
  let starter = 1;
  let processViews;

  let interval;

  function setSpeedStep() {
    clearInterval(interval);
  }

  function setSpeedRegular() {
    clearInterval(interval);
    interval = setInterval(() => {
      handleClick();
    }, 1000);
  }

  function setSpeedFast() {
    clearInterval(interval);
    interval = setInterval(() => {
      handleClick();
    }, 300);
  }

  $: sim = new Simulation(pcount,starter);

  function getViewsFrom(s) {
    if (sim) {
      if (!sim.processes) {
        return [];
      }
    }
    return sim.processes.map(p => p.getState());
  }

  // get process info for rendering
  $: processViews = [...getViewsFrom(sim)];

  function handleClick() {
    sim.step();
    processViews = sim.processes.map(p => p.getState());
  }

  onMount(() => {
    return () => {
      clearInterval(interval);
    };
  });

  let w_width = 786;
  let w_height = 576;
  $: svg_side = Math.min(w_width - 400, w_height);
  let svg_wh = 650;
</script>

<style>
  div#options {
    border: 4px dotted blue;
    top: 1rem;
    display: flex;
    flex-direction: column;
    justify-content: center;
    height : 80%;
  }
  div.option {
    margin: 1rem;
  }
  #procs {
    text-align: left;
  }
  #procs div {
    text-align: center;
    display: flex;
    justify-content: center;
    padding: 0.5rem;
    flex: 1;
  }
  #procs div input {
    padding: 0.5rem;
    margin: 0rem 1rem 0rem 0rem;
  }
  #times div div {
    display: flex;
    justify-content: space-evenly;
  }
  #times div div input {
    margin: 0;
    padding: 0;
    width: 3rem;
  }
  #times div div span {
    /* min-width: 4rem; */
    align-self: flex-end;
    text-align: end;
    height: 100%;
    padding: 0 0.25rem 0 0;
  }
  #speed {
    display: flex;
    justify-content: stretch;
  }
  #speed button {
    flex: 1;
    margin: 0rem 0.25rem;
    padding: 0.125rem;
    text-align: center;
  }
  #speed button svg {
    width: 1rem;
    height: 1rem;
  }
  #stepper {
    display: flex;
  }
  #step {
    flex: 1;
    margin: 0rem 0.25rem;
  }
  #times div {
    text-align: left;
  }
  main {
    padding: 0;
    margin: 0 auto;
  }
  h1 {
    color: #ff3e00;
    text-transform: uppercase;
    font-size: 4em;
    font-weight: 100;
    margin-top : 0;
    text-align: center;
  }
  #container {
    display: flex;
    flex-direction: row-reverse;
    margin: auto;
    justify-content: center;
  }
  #sim {
    display: flex;
    justify-content: center;
  }
  #msgs {
    display: flex;
    justify-content: start;
    text-align: start;
    margin: 20px;
  }
</style>

<svelte:window bind:innerWidth={w_width} bind:innerHeight={w_height} />
<main>
  <div>
    <h1>Bully Election Simulation</h1> 
  </div>
  <div id="container">
    <div id ="sim">
      <svg viewBox="50 -50 800 800" width={svg_wh} height={svg_wh}>
        <defs>
          <marker
            id="head"
            orient="auto"
            markerWidth="2"
            markerHeight="4"
            refX="0.1"
            refY="2">
            <!-- triangle pointing right (+x) -->
            <path d="M0,0 V4 L2,2 Z" fill="black" />
          </marker>
        </defs>

        {#each processViews as p, i}
          <Process
            {...p}
            xloc={450 + 250 * Math.sin(((2 * Math.PI) / pcount) * i)}
            yloc={300 + 250 * -Math.cos(((2 * Math.PI) / pcount) * i)} />

          <!-- arrow logic TODO  -->
          {#if p.active}
            <!-- loop over its arrows and draw them -->
            {#each p.arrows as dir, i}
              <Arrow from={dir.from} to={dir.to} {pcount} text={dir.msg}/>
            {/each}
          {/if}
        {/each}
      </svg>
    
    </div>
    <div id="options">
      <h2>Options</h2>
      <div id="procs" class="option">
        <b># Processes:</b>
        <div>
          <input type="range" bind:value={pcount} min="2" max="7" />
          <span>{pcount}</span>
        </div>
      </div>

      <div id="times" class="option">
        <b>Process starting election</b>
        <div id="code">
          <div class="range">
            <input type="number" bind:value={starter} min={2} max={pcount} />
          </div>
        </div>
      </div>

      <div id="speed" class="option">

        <button id="manual" on:click={setSpeedStep}>
          <svg viewbox="0 0 50 50">
            <g xmlns="http://www.w3.org/2000/svg" id="Layer_1_1_">
              <path d="M23,49V1H11v48H23z M13,3h8v44h-8V3z" />
              <path d="M39,49V1H27v48H39z M29,3h8v44h-8V3z" />
            </g>
          </svg>
        </button>
        <button id="default" on:click={setSpeedRegular}>
          <svg viewbox="0 0 50 50">
            <path
              xmlns="http://www.w3.org/2000/svg"
              d="M7,1.217v47.566L45.918,25L7,1.217z
              M9,4.783L42.082,25L9,45.217V4.783z" />

          </svg>
        </button>
        <button id="fast" on:click={setSpeedFast}>
          <svg viewbox="0 0 50 50">
            <path
              xmlns="http://www.w3.org/2000/svg"
              d="M24,49.414L48.414,25L24,0.586v23l-23-23v48.828l23-23V49.414z
              M3,44.586V5.414L22.586,25L3,44.586z M26,5.414L45.586,25
              L26,44.586V5.414z" />
          </svg>
        </button>
      </div>
      <div id="stepper" class="option">
        <button id="step" on:click={handleClick}>Step</button>
      </div>
    </div>
  </div>
  <div>
    <h2> Process Messages </h2>
    <div id="msgs" class="option">
        {#each processViews as p, i}
          <p>{p.name}: {p.text}</p>
        {/each}
      </div>
  </div>

</main>
