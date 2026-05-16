const neo4j = require('neo4j-driver');
require('dotenv').config();

const driver = neo4j.driver(
  process.env.NEO4J_URI,
  neo4j.auth.basic(process.env.NEO4J_USER, process.env.NEO4J_PASSWORD)
);

driver.verifyConnectivity()
  .then(() => console.log('✅ Connected to Neo4j'))
  .catch((err) => console.error('❌ Neo4j connection error:', err.message));

module.exports = driver;