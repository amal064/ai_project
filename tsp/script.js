class Coordinate {
  constructor(xCoord, yCoord) {
    this.xCoord = xCoord;
    this.yCoord = yCoord;
  }

  calculateDistanceTo(target) {
    const diffX = this.xCoord - target.xCoord;
    const diffY = this.yCoord - target.yCoord;
    return Math.hypot(diffX, diffY);
  }
}

class Path {
  constructor(locations) {
    this.locations = locations;
    this.totalDistance = this.computeTotalDistance();
  }

  computeTotalDistance() {
    let distanceSum = 0;
    for (let i = 0; i < this.locations.length - 1; i++) {
      distanceSum += this.locations[i].calculateDistanceTo(
        this.locations[i + 1]
      );
    }
    distanceSum += this.locations[
      this.locations.length - 1
    ].calculateDistanceTo(this.locations[0]);
    return distanceSum;
  }

  static createOffspring(parentA, parentB) {
    const cutStart = Math.floor(Math.random() * parentA.locations.length);
    const cutEnd =
      Math.floor(Math.random() * (parentA.locations.length - cutStart)) +
      cutStart;

    const offspringLocations = parentA.locations.slice(cutStart, cutEnd + 1);

    parentB.locations.forEach((city) => {
      if (!offspringLocations.includes(city)) {
        offspringLocations.push(city);
      }
    });
    return new Path(offspringLocations);
  }

  mutatePath() {
    const idx1 = Math.floor(Math.random() * this.locations.length);
    let idx2 = Math.floor(Math.random() * this.locations.length);

    while (idx2 === idx1) {
      idx2 = Math.floor(Math.random() * this.locations.length);
    }

    [this.locations[idx1], this.locations[idx2]] = [
      this.locations[idx2],
      this.locations[idx1],
    ];

    this.totalDistance = this.computeTotalDistance();
  }
}

class EvolutionaryAlgorithm {
  constructor(populationSize, locations) {
    this.populationSize = populationSize;
    this.locations = locations;
    this.population = this.initializePopulation();
    this.currentGeneration = 0;
    this.maxGenerations = 1000;
    this.stagnationLimit = 100;
    this.bestScore = this.population[0].totalDistance;
    this.stagnationCounter = 0;
  }

  initializePopulation() {
    const population = [];
    for (let i = 0; i < this.populationSize; i++) {
      const shuffledLocations = this.locations.slice();
      for (let j = shuffledLocations.length - 1; j > 0; j--) {
        const randomIdx = Math.floor(Math.random() * (j + 1));
        [shuffledLocations[j], shuffledLocations[randomIdx]] = [
          shuffledLocations[randomIdx],
          shuffledLocations[j],
        ];
      }
      population.push(new Path(shuffledLocations));
    }
    return population;
  }

  evolvePopulation() {
    this.population.sort(
      (routeA, routeB) => routeA.totalDistance - routeB.totalDistance
    );

    const newGeneration = [this.population[0]];

    for (let i = 1; i < this.population.length; i++) {
      const parentA = this.population[i - 1];
      const parentB = this.population[i];
      const offspring = Path.createOffspring(parentA, parentB);

      if (Math.random() < 0.1) {
        offspring.mutatePath();
      }

      newGeneration.push(offspring);
    }

    this.population = newGeneration;
    this.currentGeneration++;
  }

  getFittestPath() {
    this.population.sort(
      (routeA, routeB) => routeA.totalDistance - routeB.totalDistance
    );
    return this.population[0];
  }

  restart() {
    this.currentGeneration = 0;
    this.stagnationCounter = 0;
    this.bestScore = Infinity;
    this.population = this.initializePopulation();
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const canvasElement = document.getElementById("canvas");
  const ctx = canvasElement.getContext("2d");

  const cityCount = 10;
  const cityLocations = createRandomLocations(
    cityCount,
    canvasElement.width,
    canvasElement.height
  );

  const crossoverRateElem = document.getElementById("crossoverRate");
  const mutationRateElem = document.getElementById("mutationRate");
  const generationLimitElem = document.getElementById("maxGenerations");
  const animationRateElem = document.getElementById("animationRate");
  const startButton = document.getElementById("startButton");
  const stopButton = document.getElementById("pauseButton");
  const logOutput = document.getElementById("output");

  let running = false;
  let animationFrameId = null;

  function createRandomLocations(count, maxWidth, maxHeight) {
    const locations = [];
    for (let i = 0; i < count; i++) {
      locations.push(
        new Coordinate(Math.random() * maxWidth, Math.random() * maxHeight)
      );
    }
    return locations;
  }

  const geneticAlgorithm = new EvolutionaryAlgorithm(50, cityLocations);

  function renderCities() {
    ctx.clearRect(0, 0, canvasElement.width, canvasElement.height);
    cityLocations.forEach((location) => {
      ctx.beginPath();
      ctx.arc(location.xCoord, location.yCoord, 8, 0, Math.PI * 2);
      ctx.fillStyle = "red";
      ctx.fill();
      ctx.stroke();
    });
  }

  function renderRoute(path) {
    ctx.beginPath();
    ctx.moveTo(path.locations[0].xCoord, path.locations[0].yCoord);
    path.locations.forEach((city) => ctx.lineTo(city.xCoord, city.yCoord));
    ctx.lineTo(path.locations[0].xCoord, path.locations[0].yCoord);
    ctx.strokeStyle = "blue";
    ctx.stroke();
  }

  function updateLog(message) {
    logOutput.value += message + "\n";
    logOutput.scrollTop = logOutput.scrollHeight;
  }

  function runEvolution() {
    if (running) {
      renderCities();

      geneticAlgorithm.evolvePopulation();

      const bestPath = geneticAlgorithm.getFittestPath();
      renderRoute(bestPath);
      updateLog(
        `Generation ${
          geneticAlgorithm.currentGeneration
        }: Shortest Distance - ${bestPath.totalDistance.toFixed(2)}`
      );

      const animationRate = parseInt(animationRateElem.value);
      const maxGenerations = parseInt(generationLimitElem.value);

      // Ensure the current generation does not exceed the max generations
      if (geneticAlgorithm.currentGeneration >= maxGenerations) {
        stopEvolution();
        updateLog("Max generations reached. Evolution stopped.");
      } else {
        animationFrameId = setTimeout(runEvolution, animationRate);
      }
    }
  }

  function startEvolution() {
    running = true;
    startButton.disabled = true;
    stopButton.disabled = false;
    geneticAlgorithm.restart();
    runEvolution();
  }

  function stopEvolution() {
    running = false;
    startButton.disabled = false;
    stopButton.disabled = true;
    if (animationFrameId !== null) {
      clearTimeout(animationFrameId);
    }
  }

  startButton.addEventListener("click", startEvolution);
  stopButton.addEventListener("click", stopEvolution);
});
