const { faker } = require('@faker-js/faker');

function createFaker(deterministic = false) {
  if (deterministic) {
    faker.seed(1729);
  }
  return faker;
}

const departmentMap = [
  { name: 'Engineering', code: 'ENG' },
  { name: 'HR', code: 'HR' },
  { name: 'Finance', code: 'FIN' },
  { name: 'Sales', code: 'SAL' },
  { name: 'Marketing', code: 'MKT' },
];

const candidateStatuses = ['NEW', 'SCREENING', 'INTERVIEW', 'OFFERED', 'HIRED', 'REJECTED'];
const offerStatuses = ['DRAFT', 'PENDING', 'APPROVED', 'REJECTED', 'RELEASED', 'ACCEPTED', 'DECLINED'];
const candidateRoles = ['Software Engineer', 'Product Manager', 'Marketing Specialist', 'Sales Executive', 'Financial Analyst'];

function getCandidateStatus(index) {
  if (index < 4) return 'NEW';
  if (index < 8) return 'SCREENING';
  if (index < 12) return 'INTERVIEW';
  if (index < 16) return 'OFFERED';
  if (index < 18) return 'HIRED';
  return 'REJECTED';
}

function roundSalary(value) {
  return Math.round(value / 100) * 100;
}

function buildCandidatePayload(faker, recruiterIds, departments) {
  const firstName = faker.person.firstName();
  const lastName = faker.person.lastName();
  const department = faker.helpers.arrayElement(departments);
  const recruiterId = faker.helpers.arrayElement(recruiterIds);
  const status = faker.helpers.arrayElement(candidateStatuses);
  const role = faker.helpers.arrayElement(candidateRoles);
  const experienceYears = faker.number.int({ min: 1, max: 12 });
  const currentCtc = roundSalary(faker.number.int({ min: 60000, max: 220000 }));
  const expectedCtc = roundSalary(currentCtc * faker.number.float({ min: 1.05, max: 1.35 }));

  return {
    fullName: `${firstName} ${lastName}`,
    email: faker.internet.email({ firstName, lastName }).toLowerCase(),
    phone: faker.phone.number('###-###-####'),
    role,
    department: department.name,
    location: faker.location.city(),
    status,
    experienceYears,
    expectedCtc,
    currentCtc,
    noticePeriodDays: faker.number.int({ min: 0, max: 90 }),
    skills: faker.helpers.arrayElements([
      'JavaScript', 'TypeScript', 'React', 'Node.js', 'Python', 'SQL', 'Product Strategy', 'Communication', 'Negotiation', 'Recruiting', 'Excel', 'Design', 'Data Analytics', 'Go', 'Cloud', 'AI', 'Rust'
    ], { min: 3, max: 6 }),
    resumeUrl: '',
    notes: faker.lorem.sentences({ min: 1, max: 2 }),
    recruiterId,
  };
}

function buildOfferPayload(faker, candidate, creatorId, templateId) {
  const status = faker.helpers.arrayElement(['DRAFT', 'PENDING', 'APPROVED', 'RELEASED', 'ACCEPTED', 'REJECTED']);
  const offerDate = faker.date.past({ years: 1 });
  const validUntil = faker.date.soon({ days: faker.number.int({ min: 7, max: 21 }), refDate: offerDate });
  const baseSalary = roundSalary(faker.number.int({ min: 70000, max: 260000 }));
  const variablePay = roundSalary(baseSalary * faker.number.float({ min: 0.1, max: 0.25 }));
  const joiningBonus = roundSalary(faker.number.int({ min: 5000, max: 30000 }));
  const retentionBonus = roundSalary(faker.number.int({ min: 5000, max: 25000 }));
  const totalCtc = baseSalary + variablePay + joiningBonus + retentionBonus;

  return {
    candidateId: candidate.id,
    createdById: creatorId,
    templateId,
    title: `${candidate.fullName} - ${candidate.role}`,
    department: candidate.department,
    designation: candidate.role,
    status,
    baseSalary,
    variablePay,
    joiningBonus,
    retentionBonus,
    probationPeriodMonths: faker.number.int({ min: 1, max: 6 }),
    offerDate: offerDate.toISOString(),
    validUntil: validUntil.toISOString(),
    approvalComments: faker.lorem.sentence(),
  };
}

function buildNotificationMessage(type, label, name) {
  return {
    candidate: `New candidate profile created: ${name}`,
    offer: `Offer '${label}' has entered the hiring workflow.`,
    approval: `${label} is waiting for approval.`,
    template: `Template '${label}' was updated.`,
    resume: `New resume uploaded for ${name}.`,
  }[type];
}

module.exports = {
  createFaker,
  departmentMap,
  candidateStatuses,
  offerStatuses,
  buildCandidatePayload,
  buildOfferPayload,
  buildNotificationMessage,
};
