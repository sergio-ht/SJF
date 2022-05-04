const form = document.querySelector("form");
const tbody = document.querySelector("tbody");
const burstTime = document.getElementById("burst-time");
const arrivalTime = document.getElementById("arrival-time");
const animateBtn = document.getElementById("animate-btn");

// global variables
let processId = 0;
const processList = [];

class Process {
  constructor(id, burstTime, arrivalTime) {
    this.id = id;
    this.burstTime = burstTime;
    this.totalTime = 0;
    this.arrivalTime = arrivalTime;
    this.startTime = -1;
    this.endTime = -1;
    this.isCompleted = false;
    this.order = -1;
    this.hue = Math.round(Math.random() * 360);
  }

  work(time) {
    if (this.startTime === -1) {
      this.startTime = time;
    }
    this.totalTime += 1;
    if (this.totalTime === this.burstTime) {
      this.isCompleted = true;
      this.endTime = time + 1;
    }
  }
}

form.addEventListener("submit", (e) => {
  e.preventDefault();

  if (burstTime.value === "") return;

  // add process
  processList.push(
    new Process(
      processId++,
      parseInt(burstTime.value),
      parseInt(arrivalTime.value)
    )
  );

  // add process to table
  addProcessToTable(processList[processList.length - 1]);

  // clear inputs
  burstTime.value = "";
});

function addProcessToTable(process) {
  const tr = document.createElement("tr");
  const cols = ["id", "burstTime", "arrivalTime"];

  cols.forEach((col) => {
    const td = document.createElement("td");
    td.innerHTML = process[col];
    tr.appendChild(td);
  });

  tbody.appendChild(tr);
}

function sjf() {
  let completed = 0;
  const currentList = [];
  let time = 0;
  let currentProcess = null;
  while (completed < processList.length) {
    // add processes that have just arrived
    processList
      .filter((process) => process.arrivalTime === time)
      .forEach((process) => currentList.push(process));

    // sort list
    currentList.sort((a, b) => a.burstTime - b.burstTime);

    if (!currentProcess && processList.length > 0) {
      currentProcess = currentList.shift();
    }

    if (currentProcess) {
      currentProcess.work(time);
    }
    if (currentProcess && currentProcess.isCompleted) {
      currentProcess.order = ++completed;
      currentProcess = null;
    }
    time++;
  }
}

function displayHiddenElements() {
  const hiddenTable = document.querySelectorAll(".hidden-table");
  hiddenTable.forEach((element) => element.classList.remove("hidden-table"));
}

function updateTable() {
  const rows = tbody.getElementsByTagName("tr");
  const cols = ["startTime", "endTime", "order"];

  let i = 0;
  for (let row of rows) {
    for (let col of cols) {
      const td = document.createElement("td");
      td.textContent = processList[i][col];
      row.appendChild(td);
    }
    i++;
  }
}

animateBtn.addEventListener("click", (e) => {
  e.preventDefault();

  // sjf algorithm
  sjf();

  displayHiddenElements();
  updateTable();

  // config
  let delayed;
  const config = {
    type: "bar",
    data: {
      labels: processList.map((process) => process.id),
      datasets: [
        {
          label: "Procesos",
          data: processList.map((process) => [
            process.startTime,
            process.endTime,
          ]),
          backgroundColor: processList.map(
            (process) => `hsl(${process.hue}, 50%, 70%)`
          ),

          borderColor: processList.map(
            (process) => `hsl(${process.hue}, 50%, 50%)`
          ),
        },
        {
          label: "Llegada",
          data: processList.map((process) => [
            process.arrivalTime,
            process.arrivalTime + 0.1,
          ]),
          backgroundColor: ["rgba(255, 0, 0, 0.8)"],
        },
      ],
    },
    options: {
      plugins: {
        title: {
          display: true,
          text: "MLQ",
          font: {
            weight: "bold",
            size: 20,
          },
        },
        legend: {
          display: true,
        },
      },
      indexAxis: "y",
      scales: {
        y: {
          title: {
            display: true,
            text: "Proceso",
          },
          beginAtZero: true,
          stacked: true,
        },
        x: {
          title: {
            display: true,
            text: "tiempo",
          },
          stacked: false,
        },
      },
      animation: {
        onComplete: () => {
          delayed = true;
        },
        delay: (context) => {
          let delay = 0;
          if (
            context.type === "data" &&
            context.mode === " default" &&
            !delayed
          ) {
            delay = context.dataIndex * 300 + context.datasetIndex * 100;
          }
          return delay;
        },
      },
    },
  };

  const myChart = new Chart(document.getElementById("myChart"), config);
});
