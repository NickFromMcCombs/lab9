const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

function normalizeEmployee(e) {
  return {
    ...e,
    // Expose salary in dollars for the frontend
    salary: e.salary_cents == null ? null : e.salary_cents / 100,
  };
}

// Get all employees
app.get('/employees', async (req, res) => {
  try {
    const employees = await prisma.employees.findMany();
    res.json(employees.map(normalizeEmployee));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add a new employee
app.post('/employees', async (req, res) => {
  const { first_name, last_name, email, birthdate, salary } = req.body;

  try {
    const created = await prisma.employees.create({
      data: {
        first_name,
        last_name,
        email,
        birthdate: birthdate ? new Date(birthdate) : null,
        salary_cents:
          salary === '' || salary == null || Number.isNaN(Number(salary))
            ? null
            : Math.round(Number(salary) * 100),
      },
    });
    res.json(normalizeEmployee(created));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));