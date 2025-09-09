const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function importSchools() {
  try {
    console.log('Starting school import from schools.csv...');

    const csvPath = path.join(__dirname, 'schools.csv');
    const csvData = fs.readFileSync(csvPath, 'utf8');
    
    const lines = csvData.split('\n');
    const schools = [];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      const parts = line.split(',');
      if (parts.length >= 3) {
        const schoolName = parts[0].trim();
        const city = parts[1].trim();
        const state = parts[2].trim();
        const classification = parts[3] ? parts[3].trim() : null;
        
        if (schoolName && city && state) {
          schools.push({
            name: schoolName,
            city: city,
            state: state,
            classification: classification,
            verified: true
          });
        }
      }
    }
    
    console.log(`Parsed ${schools.length} schools from CSV`);
    
    // Import one by one to handle duplicates
    let imported = 0;
    let skipped = 0;
    
    for (const school of schools) {
      try {
        await prisma.school.create({
          data: school
        });
        imported++;
        if (imported % 50 === 0) {
          console.log(`Imported ${imported} schools...`);
        }
      } catch (error) {
        if (error.code === 'P2002') {
          skipped++; // Duplicate
        } else {
          console.error('Error importing school:', school.name, error.message);
        }
      }
    }
    
    console.log(`Successfully imported ${imported} schools`);
    console.log(`Skipped ${skipped} duplicates`);
    
  } catch (error) {
    console.error('Error importing schools:', error);
  } finally {
    await prisma.$disconnect();
  }
}

importSchools();
