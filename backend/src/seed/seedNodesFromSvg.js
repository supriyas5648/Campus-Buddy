const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const { XMLParser } = require('fast-xml-parser');

const { connectDatabase: connectDB } = require('../config/db');
const Node = require('../models/Node');

dotenv.config();

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "",
});

const svgPath = path.join(process.cwd(), "campus_map.svg");

const toArray = (item) => {
  if (!item) return [];
  return Array.isArray(item) ? item : [item];
};

async function seedNodes() {
  try {
    // Connect Database
    await connectDB();

    // Read SVG
    const svgContent = fs.readFileSync(svgPath, "utf8");
    const svg = parser.parse(svgContent);

    const root = svg.svg;

    // Extract all ellipse nodes
    const ellipses = toArray(root.ellipse);

    if (ellipses.length === 0) {
      console.log("❌ No ellipse nodes found in SVG.");
      process.exit(0);
    }

    // Convert SVG nodes to Mongo documents
    const nodes = ellipses.map((ellipse) => ({
      nodeId: ellipse.id,
      x: Number(ellipse.cx),
      y: Number(ellipse.cy),
      neighbors: [],
      isActive: true,
    }));

    // Remove old nodes
    await Node.deleteMany({});

    // Insert new nodes
    await Node.insertMany(nodes);

    console.log(`✅ Successfully inserted ${nodes.length} nodes.`);
    console.log("🎉 Node seeding completed.");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error while seeding nodes:");
    console.error(error);
    process.exit(1);
  }
}

seedNodes();