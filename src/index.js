class Process {
  constructor(id, name) {
    this.id = id;
    this.name = name;
    this.messages = [];
    this.msg_queue = "";
    this.leader = id;
    this.recieved_leader = 0;
    this.text = "";
    this.running = false;
    this.otherProcesses = [];
    this.active = false;
    this.arrows = [];
  }

  setOtherProcesses(processes) {
    for (let i = 0; i < processes.length; i++) {
      if (processes[i].id != this.id) {
        this.otherProcesses.push(processes[i]);
      }
    }

  }

  setRunnig(state) {
    this.running = state;
  }
  // retrun state to control rendering
  getState() {
    let msgs = this.messages.join(" ");
    return {
      id: this.id,
      name: this.name,
      text: msgs,
      active : this.active,
      arrows : this.arrows
    };
  }
}

class Simulation {
  constructor(numberOfProcesses, starter) {
    this.processes = [...Array(numberOfProcesses).keys()].map(
      (i) =>
        new Process(
          1 + i,
          "Process ".concat((1 + i).toString())
        )
    );
    this.election_starter = this.processes[starter-1];
    this.election_starter.setRunnig(true);
    this.sim_running = true;

    // tell processes about other processes
    for (let i = 0; i < this.processes.length; i++) {
      this.processes[i].setOtherProcesses(this.processes);
    }

    // for (let i = 0; i < this.processes.length; i++) {
    //   console.log(`${this.processes[i].id}'s other processes`);
    //   console.log(this.processes[i].otherProcesses);
    // }

  }

  getBully(process) {
    let bullyid = process.id;
    for (let i = 0; i < process.otherProcesses.length; i++) {
      if (process.otherProcesses[i].id > bullyid) {
        bullyid = process.otherProcesses[i].id;
      }
    }
    return bullyid;
  }

  leader_msg(process, other_process) {
    let msg = `Leader( ${process.id} )`;
    // update next queue
    other_process.msg_queue = msg;
    process.active = true;
    let dir = {
      to : other_process.id-1,
      from: process.id-1,
      msg : msg
    }
    process.arrows.push(dir);
  }
  election_msg(process, other_process) {
    let msg = `Election( ${process.id} )`;
    // update next queue
    other_process.msg_queue = msg;
    process.active = true;
    let dir = {
      to : other_process.id-1,
      from: process.id-1,
      msg : msg
    }
    process.arrows.push(dir);
  }
  bully_msg(to, from) {
    let msg = `Bully( ${to.id} )`;
    // update next queue
    to.msg_queue = msg;
    from.msg_queue = "I";
    from.active = true;
    let dir = {
      to : to.id-1,
      from: from.id-1,
      msg: msg
    }
    from.arrows.push(dir);
  }

  init_election(process) {
    process.running = true;
    let bully = this.getBully(process);
    if(bully === process.id) {
      // send iam leader to every other process
      let msg = `Leader( ${process.id} )`;
      // update your own msgs
      process.messages = [...process.messages, msg];
      for (let i = 0; i < process.otherProcesses.length; i++) {
        if (process.otherProcesses[i].id != process.id) {
          // send leader msg
          this.leader_msg(process, process.otherProcesses[i])
        }
      }
    } else {
      // send election to every other process
      let msg = `Election( ${process.id} )`;
      // update your own msgs
      process.messages = [...process.messages, msg];
      for (let i = 0; i < process.otherProcesses.length; i++) {
        if (process.otherProcesses[i].id > process.id) {
          // send leader msg
          this.election_msg(process, process.otherProcesses[i])
        }
      }
    }

  }

  particpateInElection(process) {
    let recieved_msg = process.msg_queue;
    process.msg_queue = "";
    if (recieved_msg.startsWith("L")) {
      // add to the message queue
      process.messages = [...process.messages, recieved_msg];
      this.sim_running = false;
      process.leader = parseInt(recieved_msg.split(" ")[1]);
    } else if (recieved_msg.startsWith("E")) {
      // add to the message queue
      process.messages = [...process.messages, recieved_msg];
      let temp_leader = parseInt(recieved_msg.split(" ")[1]);
      if (temp_leader < process.id) {
        // send bully
        let to = this.processes[temp_leader-1];
        let msg = `Bully( ${to.id} )`;
        // update your own msgs
        process.messages = [...process.messages, msg];
        this.bully_msg(to, process);
      } 
    } else if (recieved_msg.startsWith("B")) {
      process.running = false;
    } else if (recieved_msg.startsWith("I")) {
      this.init_election(process);
    }
  }

  // look at state and pass new mess or ignore
  election() {
    if (this.election_starter) {
      this.init_election(this.processes[this.election_starter.id - 1]);
      this.election_starter = null;
    } else {
      for (let i = 0; i < this.processes.length; i++) {
        // check message queue to deal with messages
        if(this.processes[i].msg_queue) {
          // console.log
          this.particpateInElection(this.processes[i]);
        }
      }
    }
  }

  unactivateArrows() {
    for (let i = 0; i < this.processes.length; i++) {
      this.processes[i].active = false;
      this.processes[i].arrows =[];
    }
  }

  step() {
    // election happens here
    if(this.sim_running) {
      // unactivate all the arrows
      this.unactivateArrows();
      this.election();
      console.log(this.processes);
    }
  }
}

export { Simulation, Process };
