const express = require('express');
const app = express();

const productData = {
  A: { center: "C1", weight: 3 },
  B: { center: "C1", weight: 2 },
  C: { center: "C1", weight: 8 },
  D: { center: "C2", weight: 12 },
  E: { center: "C2", weight: 25 },
  F: { center: "C2", weight: 15 },
  G: { center: "C3", weight: 0.5 },
  H: { center: "C3", weight: 1 },
  I: { center: "C3", weight: 2 },
};

const distances = {
  C1: { L1: 3, C2: 4, C3: 3 },
  C2: { L1: 2.5, C3: 3, C1: 4 },
  C3: { L1: 2, C1: 3, C2: 3 },
  L1: { C1: 3, C2: 2.5, C3: 2 },
};

function getCostPerUnitDistance(weight) {
  if (weight <= 5) return 10;
  return 10 + Math.ceil((weight - 5) / 5) * 8;
}

function calculateMinimumDeliveryCost(order) {
  const centerToWeight = { C1: 0, C2: 0, C3: 0 };

  for (const [product, quantity] of Object.entries(order)) {
    if (productData[product]) {
      const { center, weight } = productData[product];
      centerToWeight[center] += weight * quantity;
    }
  }

  let totalCost = 0;
  const visited = [];

  const centers = Object.keys(centerToWeight).filter(center => centerToWeight[center] > 0);

  for (const center of centers) {
    const weight = centerToWeight[center];
    const costPerUnit = getCostPerUnitDistance(weight);

    if (visited.length === 0) {
      totalCost += distances[center]["L1"] * costPerUnit;
    } else {
      totalCost += distances["L1"][center] * getCostPerUnitDistance(0);
      totalCost += distances[center]["L1"] * costPerUnit;
    }
    visited.push(center);
  }

  return totalCost;
}

app.use(express.json());

app.post('/calculate_min_cost', (req, res) => {
  const order = req.body;

  if (!order || Object.keys(order).length === 0) {
    return res.status(400).json({ error: 'Order data is required' });
  }

  const cost = calculateMinimumDeliveryCost(order);
  res.json({ cost });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
