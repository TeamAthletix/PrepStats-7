const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

// First 50 schools as a test - we'll add the full 654 later
const schools = [
  {"classification": "7A", "name": "Auburn High School", "city": "Auburn", "state": "AL"},
  {"classification": "7A", "name": "Hoover High School", "city": "Hoover", "state": "AL"},
  {"classification": "6A", "name": "Mountain Brook High School", "city": "Mountain Brook", "state": "AL"},
  {"classification": "3A", "name": "Bayside Academy", "city": "Daphne", "state": "AL"},
  {"classification": "7A", "name": "Grayson", "city": "Loganville", "state": "GA"},
  {"classification": "6A", "name": "Carrollton", "city": "Carrollton", "state": "GA"}
];

async function main() {
  console.log('Testing school seeding...')
  
  for (const school of schools) {
    await prisma.school.create({
      data: {
        name: school.name,
        city: school.city,
        state: school.state,
        classification: school.classification,
        isApproved: true
      }
    })
  }
  
  console.log(`Seeded ${schools.length} test schools`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
