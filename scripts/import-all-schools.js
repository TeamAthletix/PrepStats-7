const { PrismaClient } = require('@prisma/client')
const fs = require('fs')

const prisma = new PrismaClient()

async function importSchools() {
  try {
    // Read the CSV file
    const csvData = fs.readFileSync('schools.csv', 'utf8')
    const lines = csvData.trim().split('\n')
    
    console.log(`Processing ${lines.length - 1} schools...`)
    
    // Process in small batches to avoid timeouts
    const batchSize = 10
    let totalImported = 0
    let totalSkipped = 0
    
    for (let i = 1; i < lines.length; i += batchSize) {
      const batch = []
      
      for (let j = i; j < Math.min(i + batchSize, lines.length); j++) {
        const line = lines[j].trim()
        if (!line) continue
        
        // Handle carriage returns and split properly
        const cleanLine = line.replace(/\r/g, '')
        const [school, city, state, classification] = cleanLine.split(',')
        
        if (school && city && state && classification) {
          batch.push({
            name: school.trim(),
            city: city.trim(), 
            state: state.trim(),
            classification: classification.trim()
          })
        }
      }
      
      // Import each school individually to handle duplicates
      for (const schoolData of batch) {
        try {
          await prisma.school.create({
            data: schoolData
          })
          totalImported++
        } catch (error) {
          if (error.code === 'P2002') {
            // Duplicate school, skip it
            totalSkipped++
          } else {
            console.error(`Error importing ${schoolData.name}:`, error.message)
          }
        }
      }
      
      console.log(`Progress: ${totalImported} imported, ${totalSkipped} skipped`)
      
      // Small delay to prevent overwhelming the database
      await new Promise(resolve => setTimeout(resolve, 50))
    }
    
    console.log(`Import complete! ${totalImported} schools imported, ${totalSkipped} duplicates skipped`)
  } catch (error) {
    console.error('Import error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

importSchools()
