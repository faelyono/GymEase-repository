const driver = require('../config/neo4j');

const syncBookingToGraph = async (req, res) => {
  const { member_id, member_name, class_id, class_name, trainer_id, trainer_name } = req.body;
  const session = driver.session();
  try {
    await session.run(
      `
      MERGE (m:Member {id: $member_id})
        ON CREATE SET m.name = $member_name

      MERGE (c:Class {id: $class_id})
        ON CREATE SET c.name = $class_name

      MERGE (t:Trainer {id: $trainer_id})
        ON CREATE SET t.name = $trainer_name

      MERGE (m)-[r:BOOKED]->(c)
        ON CREATE SET r.count = 1
        ON MATCH  SET r.count = r.count + 1

      MERGE (c)-[:TAUGHT_BY]->(t)
      `,
      { member_id, member_name, class_id, class_name, trainer_id, trainer_name }
    );
    res.status(201).json({ success: true, message: 'Graph synced successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  } finally {
    await session.close();
  }
};

/**
 * Rekomendasi class untuk member tertentu.
 * Logika: cari member lain yang pernah booking class yang sama,
 * lalu rekomendasikan class lain yang mereka booking tapi member ini belum.
 *
 * GET /api/graph/recommend/:member_id
 */
const getRecommendations = async (req, res) => {
  const member_id = parseInt(req.params.member_id);
  const session = driver.session();
  try {
    const result = await session.run(
      `
      MATCH (me:Member {id: $member_id})-[:BOOKED]->(c:Class)<-[:BOOKED]-(other:Member)
      MATCH (other)-[:BOOKED]->(rec:Class)
      WHERE NOT (me)-[:BOOKED]->(rec)
        AND rec.id <> $member_id
      OPTIONAL MATCH (rec)-[:TAUGHT_BY]->(t:Trainer)
      RETURN rec.id AS class_id, rec.name AS class_name,
             t.name AS trainer_name,
             COUNT(DISTINCT other) AS recommended_by_count
      ORDER BY recommended_by_count DESC
      LIMIT 5
      `,
      { member_id }
    );

    const recommendations = result.records.map(r => ({
      class_id: r.get('class_id'),
      class_name: r.get('class_name'),
      trainer_name: r.get('trainer_name'),
      recommended_by_count: r.get('recommended_by_count').toNumber(),
    }));

    res.json({ success: true, member_id, recommendations });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  } finally {
    await session.close();
  }
};

/**
 * Trainer paling populer berdasarkan jumlah BOOKED ke class mereka.
 * GET /api/graph/popular-trainers
 */
const getPopularTrainers = async (req, res) => {
  const session = driver.session();
  try {
    const result = await session.run(
      `
      MATCH (m:Member)-[r:BOOKED]->(c:Class)-[:TAUGHT_BY]->(t:Trainer)
      RETURN t.id AS trainer_id, t.name AS trainer_name,
             COUNT(DISTINCT m) AS unique_members,
             SUM(r.count) AS total_bookings
      ORDER BY total_bookings DESC
      LIMIT 5
      `
    );

    const trainers = result.records.map(r => ({
      trainer_id: r.get('trainer_id'),
      trainer_name: r.get('trainer_name'),
      unique_members: r.get('unique_members').toNumber(),
      total_bookings: r.get('total_bookings').toNumber(),
    }));

    res.json({ success: true, trainers });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  } finally {
    await session.close();
  }
};

/**
 * Detail node member beserta semua class yang pernah diikuti.
 * GET /api/graph/member/:member_id
 */
const getMemberGraph = async (req, res) => {
  const member_id = parseInt(req.params.member_id);
  const session = driver.session();
  try {
    const result = await session.run(
      `
      MATCH (m:Member {id: $member_id})-[r:BOOKED]->(c:Class)
      OPTIONAL MATCH (c)-[:TAUGHT_BY]->(t:Trainer)
      RETURN m.name AS member_name, c.id AS class_id,
             c.name AS class_name, t.name AS trainer_name,
             r.count AS booking_count
      `,
      { member_id }
    );

    const data = result.records.map(r => ({
      member_name: r.get('member_name'),
      class_id: r.get('class_id'),
      class_name: r.get('class_name'),
      trainer_name: r.get('trainer_name'),
      booking_count: r.get('booking_count').toNumber(),
    }));

    res.json({ success: true, member_id, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  } finally {
    await session.close();
  }
};

/**
 * Detail node class: siapa saja member yang pernah booking.
 * GET /api/graph/class/:class_id
 */
const getClassGraph = async (req, res) => {
  const class_id = parseInt(req.params.class_id);
  const session = driver.session();
  try {
    const result = await session.run(
      `
      MATCH (m:Member)-[r:BOOKED]->(c:Class {id: $class_id})
      OPTIONAL MATCH (c)-[:TAUGHT_BY]->(t:Trainer)
      RETURN c.name AS class_name, t.name AS trainer_name,
             m.id AS member_id, m.name AS member_name,
             r.count AS booking_count
      `,
      { class_id }
    );

    const data = result.records.map(r => ({
      class_name: r.get('class_name'),
      trainer_name: r.get('trainer_name'),
      member_id: r.get('member_id'),
      member_name: r.get('member_name'),
      booking_count: r.get('booking_count').toNumber(),
    }));

    res.json({ success: true, class_id, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  } finally {
    await session.close();
  }
};

/**
 * Jaringan trainer: semua class yang diajar dan total member per class.
 * GET /api/graph/trainer/:trainer_id
 */
const getTrainerGraph = async (req, res) => {
  const trainer_id = parseInt(req.params.trainer_id);
  const session = driver.session();
  try {
    const result = await session.run(
      `
      MATCH (c:Class)-[:TAUGHT_BY]->(t:Trainer {id: $trainer_id})
      OPTIONAL MATCH (m:Member)-[:BOOKED]->(c)
      RETURN t.name AS trainer_name, c.id AS class_id, c.name AS class_name,
             COUNT(DISTINCT m) AS total_members
      `,
      { trainer_id }
    );

    const data = result.records.map(r => ({
      trainer_name: r.get('trainer_name'),
      class_id: r.get('class_id'),
      class_name: r.get('class_name'),
      total_members: r.get('total_members').toNumber(),
    }));

    res.json({ success: true, trainer_id, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  } finally {
    await session.close();
  }
};

/**
 * Class similarity: pasangan class yang sering dibooking oleh member yang sama.
 * GET /api/graph/class-similarity
 */
const getClassSimilarity = async (req, res) => {
  const session = driver.session();
  try {
    const result = await session.run(
      `
      MATCH (c1:Class)<-[:BOOKED]-(m:Member)-[:BOOKED]->(c2:Class)
      WHERE c1.id < c2.id
      RETURN c1.name AS class_a, c2.name AS class_b,
             COUNT(DISTINCT m) AS shared_members
      ORDER BY shared_members DESC
      LIMIT 10
      `
    );

    const pairs = result.records.map(r => ({
      class_a: r.get('class_a'),
      class_b: r.get('class_b'),
      shared_members: r.get('shared_members').toNumber(),
    }));

    res.json({ success: true, pairs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  } finally {
    await session.close();
  }
};

/**
 * Jaringan sosial member: member lain yang sering berada di class yang sama.
 * GET /api/graph/member-network/:member_id
 */
const getMemberNetwork = async (req, res) => {
  const member_id = parseInt(req.params.member_id);
  const session = driver.session();
  try {
    const result = await session.run(
      `
      MATCH (me:Member {id: $member_id})-[:BOOKED]->(c:Class)<-[:BOOKED]-(other:Member)
      WHERE other.id <> $member_id
      RETURN other.id AS member_id, other.name AS member_name,
             COUNT(DISTINCT c) AS shared_classes
      ORDER BY shared_classes DESC
      LIMIT 10
      `,
      { member_id }
    );

    const network = result.records.map(r => ({
      member_id: r.get('member_id'),
      member_name: r.get('member_name'),
      shared_classes: r.get('shared_classes').toNumber(),
    }));

    res.json({ success: true, member_id, network });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  } finally {
    await session.close();
  }
};

module.exports = {
  syncBookingToGraph,
  getRecommendations,
  getPopularTrainers,
  getMemberGraph,
  getClassGraph,
  getTrainerGraph,
  getClassSimilarity,
  getMemberNetwork,
};