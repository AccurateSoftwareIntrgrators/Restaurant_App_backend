
import logger from "../Utils/logger.js";

const getAllEmployees = async (req, res) => {
    try {

    }catch (error) {
        logger.error({ err: error }, "Error fetching all employees");
        res.status(500).json({ message: "Internal Server Error" });
    }
}


const getSingleEmployee = async (req, res) => {
    try {
        
    }catch (error) {
        logger.error({ err: error }, "Error fetching single employee");
        res.status(500).json({ message: "Internal Server Error" });
    }
}


const createEmployee = async (req, res) => {
    try {
        
    }catch (error) {
        logger.error({ err: error }, "Error creating employee");
        res.status(500).json({ message: "Internal Server Error" });
    }
}


const updateEmployee = async (req, res) => {
    try {
        
    }catch (error) {
        logger.error({ err: error }, "Error updating employee");
        res.status(500).json({ message: "Internal Server Error" });
    }
}

const deleteEmployee = async (req, res) => {
    try {
        
    }catch (error) {
        logger.error({ err: error }, "Error deleting employee");
        res.status(500).json({ message: "Internal Server Error" });
    }
}

export { getAllEmployees, createEmployee, getSingleEmployee, updateEmployee, deleteEmployee };