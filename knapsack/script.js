class Item {
  constructor(weight, value) {
    this.weight = weight;
    this.value = value;
  }
}

class Chromosome {
  constructor(genes, items, maxWeight) {
    this.genes = genes;
    this.items = items;
    this.maxWeight = maxWeight;
    this.fitness = this.calculateFitness();
  }

  calculateFitness() {
    let totalWeight = 0;
    let totalValue = 0;

    for (let i = 0; i < this.genes.length; i++) {
      if (this.genes[i] === 1) {
        totalWeight += this.items[i].weight;
        totalValue += this.items[i].value;
      }
    }

    if (totalWeight > this.maxWeight) {
      return 0;
    }
    return totalValue;
  }

  mutate() {
    const mutationIndex = Math.floor(Math.random() * this.genes.length);
    this.genes[mutationIndex] = this.genes[mutationIndex] === 0 ? 1 : 0;
    this.fitness = this.calculateFitness();
  }

  static crossover(parentA, parentB) {
    const crossoverPoint = Math.floor(Math.random() * parentA.genes.length);
    const childGenes = parentA.genes
      .slice(0, crossoverPoint)
      .concat(parentB.genes.slice(crossoverPoint));
    return new Chromosome(childGenes, parentA.items, parentA.maxWeight);
  }
}

class GeneticAlgorithm {
  constructor(populationSize, mutationRate, crossoverRate, items, maxWeight) {
    this.populationSize = populationSize;
    this.mutationRate = mutationRate;
    this.crossoverRate = crossoverRate;
    this.items = items;
    this.maxWeight = maxWeight;
    this.population = this.initializePopulation();
    this.generation = 0;
  }

  initializePopulation() {
    const population = [];
    for (let i = 0; i < this.populationSize; i++) {
      const genes = Array.from({ length: this.items.length }, () =>
        Math.random() > 0.5 ? 1 : 0
      );
      population.push(new Chromosome(genes, this.items, this.maxWeight));
    }
    return population;
  }

  evolvePopulation() {
    this.population.sort((a, b) => b.fitness - a.fitness);

    const newPopulation = [];
    while (newPopulation.length < this.populationSize) {
      const parentA = this.selectParent();
      const parentB = this.selectParent();

      let offspring;
      if (Math.random() < this.crossoverRate) {
        offspring = Chromosome.crossover(parentA, parentB);
      } else {
        offspring = parentA;
      }

      if (Math.random() < this.mutationRate) {
        offspring.mutate();
      }

      newPopulation.push(offspring);
    }

    this.population = newPopulation;
    this.generation++;
  }

  selectParent() {
    const randomIndex1 = Math.floor(Math.random() * this.populationSize);
    const randomIndex2 = Math.floor(Math.random() * this.populationSize);
    return this.population[randomIndex1].fitness >
      this.population[randomIndex2].fitness
      ? this.population[randomIndex1]
      : this.population[randomIndex2];
  }

  getBestSolution() {
    return this.population.reduce((best, current) =>
      current.fitness > best.fitness ? current : best
    );
  }
}

// DP function to solve the 0/1 Knapsack Problem
function solveKnapsackDP(items, maxWeight) {
  const n = items.length;
  const dp = Array(n + 1)
    .fill(null)
    .map(() => Array(maxWeight + 1).fill(0));

  // Fill dp table
  for (let i = 1; i < n + 1; i++) {
    const item = items[i - 1];
    for (let w = 0; w < maxWeight + 1; w++) {
      if (item.weight <= w) {
        dp[i][w] = Math.max(
          dp[i - 1][w],
          dp[i - 1][w - item.weight] + item.value
        );
      } else {
        dp[i][w] = dp[i - 1][w];
      }
    }
  }

  // Backtrack to find the selected items
  let w = maxWeight;
  const selectedItems = [];
  for (let i = n; i > 0; i--) {
    if (dp[i][w] !== dp[i - 1][w]) {
      selectedItems.push(i - 1); // item was selected
      w -= items[i - 1].weight;
    }
  }

  return { maxValue: dp[n][maxWeight], selectedItems };
}

document.addEventListener("DOMContentLoaded", () => {
  const maxWeightInput = document.getElementById("maxWeight");
  const itemCountInput = document.getElementById("itemCount");
  const mutationRateInput = document.getElementById("mutationRate");
  const crossoverRateInput = document.getElementById("crossoverRate");
  const maxGenerationsInput = document.getElementById("maxGenerations");
  const startButton = document.getElementById("startButton");
  const logOutput = document.getElementById("output");

  const mutationRateValue = document.getElementById("mutationRateValue");
  const crossoverRateValue = document.getElementById("crossoverRateValue");
  const maxGenerationsValue = document.getElementById("maxGenerationsValue");

  // Update displayed values when sliders are moved
  mutationRateInput.addEventListener("input", () => {
    mutationRateValue.textContent = `Mutation Rate: ${mutationRateInput.value}`;
  });

  crossoverRateInput.addEventListener("input", () => {
    crossoverRateValue.textContent = `Crossover Rate: ${crossoverRateInput.value}`;
  });

  maxGenerationsInput.addEventListener("input", () => {
    maxGenerationsValue.textContent = `Max Generations: ${maxGenerationsInput.value}`;
  });

  function generateRandomItems(count) {
    const items = [];
    for (let i = 0; i < count; i++) {
      const weight = Math.floor(Math.random() * 10) + 1;
      const value = Math.floor(Math.random() * 100) + 1;
      items.push(new Item(weight, value));
    }
    return items;
  }

  function updateLog(message) {
    logOutput.value += message + "\n";
    logOutput.scrollTop = logOutput.scrollHeight;
  }

  startButton.addEventListener("click", () => {
    // Clear the log output
    logOutput.value = "";

    const maxWeight = parseInt(maxWeightInput.value);
    const itemCount = parseInt(itemCountInput.value);
    const mutationRate = parseFloat(mutationRateInput.value);
    const crossoverRate = parseFloat(crossoverRateInput.value);
    const maxGenerations = parseInt(maxGenerationsInput.value);
    const items = generateRandomItems(itemCount);

    const populationSize = 50;
    const geneticAlgorithm = new GeneticAlgorithm(
      populationSize,
      mutationRate,
      crossoverRate,
      items,
      maxWeight
    );

    for (let i = 0; i < maxGenerations; i++) {
      geneticAlgorithm.evolvePopulation();
      const bestSolution = geneticAlgorithm.getBestSolution();
      updateLog(
        `Generation ${i + 1}: Best Fitness = ${
          bestSolution.fitness
        }, Genes = [${bestSolution.genes}]`
      );
    }

    const finalSolution = geneticAlgorithm.getBestSolution();
    updateLog("Final Best Solution from Genetic Algorithm:");
    updateLog(`Fitness = ${finalSolution.fitness}`);
    finalSolution.genes.forEach((gene, index) => {
      if (gene === 1) {
        updateLog(
          `Item ${index + 1}: Weight = ${items[index].weight}, Value = ${
            items[index].value
          }`
        );
      }
    });

    // Compute the optimal solution using DP
    const dpSolution = solveKnapsackDP(items, maxWeight);

    updateLog("\nOptimal Solution using Dynamic Programming:");
    updateLog(`Max Value = ${dpSolution.maxValue}`);
    dpSolution.selectedItems.forEach((itemIndex) => {
      updateLog(
        `Item ${itemIndex + 1}: Weight = ${items[itemIndex].weight}, Value = ${
          items[itemIndex].value
        }`
      );
    });

    // Compare Genetic Algorithm and DP results
    updateLog("\nComparison:");
    updateLog(
      `Genetic Algorithm Fitness: ${finalSolution.fitness}, DP Optimal Value: ${dpSolution.maxValue}`
    );
  });
});
