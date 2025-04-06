import React, { useState, useEffect } from "react";
import styles from "./expensetracker.module.css";
import { enqueueSnackbar } from "notistack";
import { PieChart, Pie, Cell } from "recharts";
import { BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Modal from "@mui/material/Modal";

const data = [
  { name: "Group A", value: 700 },
  { name: "Group B", value: 100 },
  { name: "Group C", value: 300 },
];

const COLORS = ["#FF9304", "#FFBB28", "#A000FF"];

const RADIAN = Math.PI / 180;

const renderCustomizedLabel = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent,
}) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor={x > cx ? "start" : "end"}
      dominantBaseline="central"
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

const BasicModal = ({ open, onClose, onAddExpense }) => {
  const [formData, setFormData] = useState({
    title: "",
    price: "",
    category: "",
    date: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onAddExpense({
      ...formData,
      amount: formData.price,
    });
    setFormData({ title: "", price: "", category: "", date: "" });
  };
  return (
    <Modal open={open} onClose={onClose}>
      <Box className={styles.modalbox}>
        <Typography variant="h4">Add Expense</Typography>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="title"
            placeholder="Title"
            value={formData.title}
            onChange={handleChange}
          />
          <input
            type="number"
            name="price"
            placeholder="Price"
            value={formData.price}
            onChange={handleChange}
          />
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
          >
            <option value="">Select Category</option>
            <option value="Food">Food</option>
            <option value="Shopping">Shopping</option>
            <option value="Travel">Travel</option>
            <option value="Bills">Bills</option>
            <option value="Entertainment">Entertainment</option>
          </select>
          <input
            type="date"
            name="date"
            placeholder="Date"
            value={formData.date}
            onChange={handleChange}
          />
          <button type="submit">Add Expense</button>
          <button type="button" onClick={onClose}>
            Cancel
          </button>
        </form>
      </Box>
    </Modal>
  );
};

const Modaladdbalance = ({ balance, onClose, onAddIncome }) => {
  const [incomeAmount, setIncomeAmount] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    onAddIncome(incomeAmount);
    setIncomeAmount("");
  };
  return (
    <Modal open={balance} onClose={onClose}>
      <Box className={styles.modalbox}>
        <Typography variant="h4">Add Balance</Typography>
        <form onSubmit={handleSubmit}>
          <input
            type="number"
            name="amount"
            placeholder="Income Amount"
            value={incomeAmount}
            onChange={(e) => setIncomeAmount(e.target.value)}
          />
          <button type="submit">Add Balance</button>
          <button type="button" onClick={onClose}>
            Cancel
          </button>
        </form>
      </Box>
    </Modal>
  );
};

const ExpenseApp = () => {
  const [open, setOpen] = useState(false);
  const [balance, setbalance] = useState(false);
  const [walletBalance, setWalletBalance] = useState(
    localStorage.getItem("walletBalance") || 5000
  );
  const [expenses, setExpenses] = useState(
    JSON.parse(localStorage.getItem("expenses")) || []
  );

  useEffect(() => {
    localStorage.setItem("walletBalance", walletBalance);
  }, [walletBalance]);

  useEffect(() => {
    localStorage.setItem("expenses", JSON.stringify(expenses));
  }, [expenses]);

  const handleAddExpense = (newExpense) => {
    if (
      !newExpense.title ||
      !newExpense.amount ||
      !newExpense.category ||
      !newExpense.date
    ) {
      enqueueSnackbar("Please fill all fields");
      return;
    }

    if (newExpense.amount > walletBalance) {
      enqueueSnackbar("Not enough balance in wallet!");
      return;
    }

    setExpenses((prev) => [...prev, newExpense]);
    setWalletBalance((prev) => prev - newExpense.amount);
    setOpen(false);
    console.log("Adding new expense:", newExpense);
  };
  const handleAddIncome = (incomeAmount) => {
    if (!incomeAmount || isNaN(incomeAmount)) {
      enqueueSnackbar("Please enter a valid amount");
      return;
    }
    setWalletBalance((prev) => prev + incomeAmount);
    setbalance(false);
  };
  const totalExpenses = expenses.reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className={styles.box1}>
      <h1 style={{ color: "white" }}>Expense Tracker</h1>
      <div className={styles.box2}>
        <div className={styles.box3}>
          <section className={styles.wallet}>
            <h3 style={{ color: "white" }}>
              Wallet Balance: ₹{walletBalance}{" "}
            </h3>
            <button
              type="button"
              className={styles.btn1}
              onClick={() => setbalance(true)}
            >
              + Add Income
            </button>
            <Modaladdbalance
              balance={balance}
              onClose={() => setbalance(false)}
              onAddIncome={handleAddIncome}
            />
          </section>
          <section className={styles.expense}>
            <h3 style={{ color: "white" }}>Expenses: ₹{totalExpenses} </h3>
            <button
              type="button"
              className={styles.btn2}
              onClick={() => setOpen(true)}
            >
              + Add Expense
            </button>
            <BasicModal
              open={open}
              onClose={() => setOpen(false)}
              onAddExpense={handleAddExpense}
            />
          </section>
          <PieChart width={200} height={200}>
            <Pie
              data={data}
              cx={100}
              cy={100}
              labelLine={false}
              label={renderCustomizedLabel}
              outerRadius={80}
              fill="none"
              stroke="none"
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
          </PieChart>

          <BarChart layout="vertical" width={300} height={200} data={data}>
            <XAxis type="number" />
            <YAxis dataKey="name" type="category" />
            <Tooltip />
            <Bar dataKey="value">
              {data.map((entry, index) => (
                <Cell
                  key={`cell-bar-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Bar>
          </BarChart>
        </div>
      </div>

      <div className={styles.bottom}>
        <section>
          <h3 style={{ color: "white" }}>Recent Transactions</h3>
          <div className={styles.trnx}>
            {expenses.map((exp, index) => (
              <div key={index} className={styles.trnxItem}>
                <p>{exp.title}</p>
                <p>₹{exp.amount}</p>
                <p>{exp.date}</p>
              </div>
            ))}
          </div>
        </section>
        <section>
          <h3 style={{ color: "white" }}>Top Expenses</h3>
          <div className={styles.topexpense}>
            {expenses
              .sort((a, b) => b.amount - a.amount)
              .slice(0, 3)
              .map((exp, index) => (
                <div key={index}>
                  <p>
                    {exp.title}
                  </p>
                </div>
              ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default ExpenseApp;
