import prisma from '../lib/prisma';

const schools = [
  { name: 'A.P. Brewer High School', city: 'Somerville', state: 'AL', class: '5A' },
  { name: 'Abbeville High School', city: 'Abbeville', state: 'AL', class: '2A' },
  { name: 'Abercorn Charter Academy', city: 'Savannah', state: 'GA', class: '2A' },
  { name: 'ACE Charter', city: 'Macon', state: 'GA', class: '2A' },
  { name: 'Adairsville', city: 'Adairsville', state: 'GA', class: '3A' },
  // Add more schools from your list here as needed
];

async function main() {
  for (const school of schools) {
    await prisma.school.upsert({
      where: { name: school.name },
      update: {},
      create: school,
    });
  }
  console.log('Alabama and Georgia schools seeded!');
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());
