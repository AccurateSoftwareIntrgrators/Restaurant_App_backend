
import Employee from "../Models/Employee.js";
import logger from "../src/logger.js";


//===== Controller functions for Employee =====

//===============================
// Get all employees
//===============================

const getAllEmployees = async (req, res) => {
    try {

        const employees = await Employee.findAll({
            order: [["id", "ASC"]],
        });
        logger.info({ count: employees.length }, "Fetched all employees");
        res.status(200).json(employees);

    }catch (error) {
        logger.error({ err: error }, "Error fetching all employees");
        res.status(500).json({ message: "Internal Server Error" });
    }
}

//===============================
// Get single employee
//===============================


const getSingleEmployee = async (req, res) => {
    try {
        const employee = await Employee.findByPk(req.params.id);
        if (!employee) {
            return res.status(404).json({ message: "Employee not found" });
            logger.warn({ id: req.params.id }, "Employee not found");
        }
        logger.info({ id: employee.id }, "Fetched single employee");
        res.status(200).json(employee);
    }catch (error) {
        logger.error({ err: error }, "Error fetching single employee");
        res.status(500).json({ message: "Internal Server Error" });
    }
}


//===============================
// Create new employee
//===============================



const createEmployee = async (req, res) => {
    const { name, email, nationalId, phone, address, emergencyContact, position, salary, employmentDate, employeeStatus, employeeType, employeeId } = req.body;
    try {

        const isEmployeeIdExists = await Employee.findOne({ where: { employeeId } });
        if (isEmployeeIdExists) {
            logger.warn({ employeeId }, "Employee ID already exists");
            return res.status(400).json({ message: "Employee ID already exists" });
        }

        const createdEmployee = await Employee.create({
            name,
            email,
            nationalId,
            phone,
            address,
            emergencyContact,
            position,
            salary,
            employmentDate,
            employeeStatus,
            employeeType,
            employeeId
        });

        logger.info({ id: createdEmployee.id }, "Created new employee");
        res.status(201).json({
            message: "Employee created successfully",
            data: createdEmployee});
        
    }catch (error) {
        logger.error({ err: error }, "Error creating employee");
        res.status(500).json({ message: "Internal Server Error" });
    }
}


//===============================
// Update employee
//===============================

const updateEmployee = async (req, res) => {
    const { id } = req.params;
    const { name, email, nationalId, phone, address, emergencyContact, position, salary, employmentDate, employeeStatus, employeeType, employeeId } = req.body;
    try {

        const isEmployeeExists = await Employee.findByPk(id);

        if (!isEmployeeExists) {
            logger.warn({ id }, "Employee not found for update");
            return res.status(404).json({ message: "Employee not found" });
        }

        await Employee.update(
            {
                name,
                email,
                nationalId,
                phone,
                address,
                emergencyContact,
                position,
                salary,
                employmentDate,
                employeeStatus,
                employeeType
            },
            { where: { id } }
        );

        logger.info({ id }, "Updated employee");
        res.status(200).json({ message: "Employee updated successfully" });


        
    }catch (error) {
        logger.error({ err: error }, "Error updating employee");
        res.status(500).json({ message: "Internal Server Error" });
    }
}



//===============================
// Delete employee
//===============================

const deleteEmployee = async (req, res) => {
    const { id } = req.params;
    try {

        const isEmployeeExists = await Employee.findByPk(id);

        if (!isEmployeeExists) {
            logger.warn({ id }, "Employee not found for deletion");
            return res.status(404).json({ message: "Employee not found" });
        }

        await Employee.update({ isDeleted: true }, { where: { id } });

        logger.info({ id }, "Deleted employee");
        res.status(200).json({ message: "Employee deleted successfully" });

    }catch (error) {
        logger.error({ err: error }, "Error deleting employee");
        res.status(500).json({ message: "Internal Server Error" });
    }
}

export { getAllEmployees, createEmployee, getSingleEmployee, updateEmployee, deleteEmployee };