
const express = require('express');

const app = express();
const PORT = 3000;

app.use(express.json());

// Initial leave records
let leaves = [
    {
        id: 701,
        employeeName: "Ananya Singh",
        leaveType: "Sick Leave",
        days: 2,
        status: "Pending"
    },
    {
        id: 702,
        employeeName: "Rahul Verma",
        leaveType: "Casual Leave",
        days: 3,
        status: "Approved"
    },
    {
        id: 703,
        employeeName: "Simran Kaur",
        leaveType: "Earned Leave",
        days: 5,
        status: "Pending"
    }
];

// Validation function
function validateLeave(leave) {
    if (!Number.isInteger(leave.days) || leave.days <= 0) {
        return "Days must be a positive integer";
    }

    if (typeof leave.leaveType !== 'string' || !leave.leaveType.trim()) {
        return "Invalid leaveType";
    }

    if (!['Pending', 'Approved', 'Rejected'].includes(leave.status)) {
        return "Invalid status";
    }

    return null;
}

// 1. GET all leave requests
app.get('/api/leaves', (req, res) => {
    res.json(leaves);
});

// 2. POST a new leave request
app.post('/api/leaves', (req, res) => {
    const newLeave = req.body;

    const error = validateLeave(newLeave);

    if (error) {
        return res.status(400).json({ message: error });
    }

    if (!newLeave.id || !newLeave.employeeName) {
        return res.status(400).json({
            message: "ID and employeeName are required"
        });
    }

    if (leaves.some(leave => leave.id === newLeave.id)) {
        return res.status(400).json({
            message: "Leave ID already exists"
        });
    }

    leaves.push(newLeave);

    res.status(201).json(newLeave);
});

// 3. GET pending leave requests
app.get('/api/leaves/pending', (req, res) => {
    const pending = leaves.filter(leave => leave.status === 'Pending');

    res.json(pending);
});

// 4. GET leave requests filtered by status
app.get('/api/leaves/filter', (req, res) => {
    const status = req.query.status;

    if (!status) {
        return res.status(400).json({
            message: "Status query parameter is required"
        });
    }

    const filtered = leaves.filter(leave =>
        leave.status.toLowerCase() === status.toLowerCase()
    );

    res.json(filtered);
});

// 5. GET one leave request by ID
app.get('/api/leaves/:id', (req, res) => {
    const id = Number(req.params.id);

    const leave = leaves.find(leave => leave.id === id);

    if (!leave) {
        return res.status(404).json({
            message: "Leave request not found"
        });
    }

    res.json(leave);
});

// 6. PUT update a leave request
app.put('/api/leaves/:id', (req, res) => {
    const id = Number(req.params.id);

    const leave = leaves.find(leave => leave.id === id);

    if (!leave) {
        return res.status(404).json({
            message: "Leave request not found"
        });
    }

    const updatedLeave = {
        ...leave,
        ...req.body,
        id: leave.id
    };

    const error = validateLeave(updatedLeave);

    if (error) {
        return res.status(400).json({ message: error });
    }

    Object.assign(leave, updatedLeave);

    res.json(leave);
});

// 7. DELETE a leave request
app.delete('/api/leaves/:id', (req, res) => {
    const id = Number(req.params.id);

    const index = leaves.findIndex(leave => leave.id === id);

    if (index === -1) {
        return res.status(404).json({
            message: "Leave request not found"
        });
    }

    leaves.splice(index, 1);

    res.json({
        message: "Leave request deleted successfully"
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
