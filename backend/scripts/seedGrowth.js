const mongoose = require('mongoose');
const Child = require('../models/Child');
require('dotenv').config();

const growthData = [
  // paste from growth_records.csv — match by motherNIC + childDOB
  { motherNIC: '852345678V', childDOB: '2025-11-28', records: [
    { ageInMonths: 0,  weight: 3.3,  height: 49.9, headCircumference: 34.5, date: '2025-11-28' },
    { ageInMonths: 1,  weight: 4.5,  height: 54.7, headCircumference: 36.2, date: '2025-12-28' },
    { ageInMonths: 3,  weight: 6.2,  height: 61.0, headCircumference: 39.5, date: '2026-02-28' },
  ]},
];

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  for (const entry of growthData) {
    const child = await Child.findOne({ dateOfBirth: new Date(entry.childDOB) });
    if (child) {
      child.growthRecords.push(...entry.records.map(r => ({
        ageInMonths: r.ageInMonths,
        weight: r.weight,
        height: r.height,
        headCircumference: r.headCircumference,
        date: new Date(r.date),
      })));
      await child.save();
      console.log(`Updated child: ${child._id}`);
    }
  }
  mongoose.disconnect();
}

seed();