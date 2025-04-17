import React, { useState, useEffect } from "react";
import styles from "./expensetracker.module.css";
import { useSnackbar } from "notistack";
import { PieChart, Pie, Cell } from "recharts";
import { BarChart, Bar, XAxis, YAxis, Tooltip, LabelList } from "recharts";
import { IoFastFoodSharp, IoReceipt } from "react-icons/io5";
import { MdOutlineDeleteForever } from "react-icons/md";
import { MdOutlineEdit, MdShoppingCart, MdFlight } from "react-icons/md";
import { BiSolidCameraMovie } from "react-icons/bi";

const COLORS = ["#FF9304", "#FFBB28", "#A000FF"];

const RADIAN = Math.PI / 180;

const ModaladdExpense = ({ onClose, onAddExpense, editingExpense }) => {
  const [formData, setFormData] = useState({
    title: "",
    price: "",
    category: "",
    date: "",
  });

  useEffect(() => {
    if (editingExpense) {
      setFormData({
        title: editingExpense.title || "",
        price: editingExpense.amount || "", // `amount` is stored, but you're using `price` in the form
        category: editingExpense.category || "",
        date: editingExpense.date || "",
      });
    }
  }, [editingExpense]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onAddExpense({
      ...formData,
      amount: formData.price, // or parseFloat(formData.price)
    });
    setFormData({ title: "", price: "", category: "", date: "" });
    onClose(); // optionally close the modal after submit
  };

  return (
    <div className="fixed inset-0 grid place-items-center bg-black/75 z-10">
      <div className="absolute inset-0 bg-black/25 -z-10" onClick={onClose} />

      <form
        onSubmit={handleSubmit}
        className="bg-white p-4 rounded shadow-md max-w-md w-full"
      >
        <h1 className="text-center text-2xl font-bold">Add Expense</h1>

        <input
          type="text"
          name="title"
          placeholder="Title"
          value={formData.title}
          onChange={handleChange}
          className="w-full p-2 border border-gray-300 rounded mt-4"
        />

        <input
          type="number"
          name="price"
          placeholder="Price"
          value={formData.price}
          onChange={handleChange}
          className="w-full p-2 border border-gray-300 rounded mt-4"
        />

        <select
          name="category"
          value={formData.category}
          onChange={handleChange}
          className="w-full p-2 border border-gray-300 rounded mt-4"
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
          value={formData.date}
          onChange={handleChange}
          className="w-full p-2 border border-gray-300 rounded mt-4"
        />

        <div className="flex justify-between mt-4 items-center gap-4">
          <button
            type="submit"
            className="p-2 px-4 bg-green-300 text-green-800 rounded-full"
          >
            Add Expense
          </button>
          <button
            type="button"
            className="p-2 px-4 bg-red-300 text-red-800 rounded-full"
            onClick={onClose}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

const Modaladdbalance = ({ onClose, onAddIncome }) => {
  const [incomeAmount, setIncomeAmount] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    onAddIncome(incomeAmount);
    setIncomeAmount("");
  };

  return (
    <div className="fixed inset-0 grid place-items-center bg-black/75 z-10">
      {/* fullscreen overlay to close the model on clcking outside */}
      <div className="absolute inset-0 bg-black/25 -z-10" onClick={onClose} />
      <form
        onSubmit={handleSubmit}
        className="bg-white p-4 rounded shadow-md max-w-md w-full"
      >
        <h1 className="text-center text-2xl font-bold">Add Balance</h1>
        <input
          type="number"
          name="amount"
          placeholder="Income Amount"
          value={incomeAmount}
          onChange={(e) => setIncomeAmount(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded mt-4"
        />
        <div className="flex justify-between mt-4 items-center gap-4">
          <button
            type="submit"
            className="p-2 px-4 bg-green-300 text-geen-800 rounded-full"
          >
            Add Balance
          </button>
          <button
            type="button"
            className="p-2 px-4 bg-red-300 text-red-800 rounded-full"
            onClick={onClose}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

const ExpenseApp = () => {
  const [open, setOpen] = useState(false);
  const [balance, setbalance] = useState(false);
  const [walletBalance, setWalletBalance] = useState(
    //default 5000 set
    localStorage.getItem("walletBalance") || 5000
  );
  const [expenses, setExpenses] = useState(
    // default empty
    JSON.parse(localStorage.getItem("expenses")) || []
  );

  const { enqueueSnackbar } = useSnackbar();
  const [editingExpense, setEditingExpense] = useState(null);

  useEffect(() => {
    localStorage.setItem("walletBalance", walletBalance);
  }, [walletBalance]);

  useEffect(() => {
    localStorage.setItem("expenses", JSON.stringify(expenses));
  }, [expenses]);

  const getChartDataFromExpenses = (expenses) => {
    const dataMap = {};

    expenses.forEach((expense) => {
      dataMap[expense.category] =
        (dataMap[expense.category] || 0) + parseFloat(expense.amount);
    });
    const colors = ["#FF9304", "#A000FF", "#FDE006"];

    return Object.entries(dataMap).map(([category, value], index) => ({
      category,
      value,
      fill: colors[index % colors.length], // Dynamic color for each category
    }));
  };

  const chartData = getChartDataFromExpenses(expenses);

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

    const amountNum = Number(newExpense.amount);

    if (editingExpense) {
      const original = expenses.find((exp) => exp.id === editingExpense.id);
      const originalAmount = Number(original.amount);

      // Calculate difference and adjust wallet
      const difference = amountNum - originalAmount;

      if (walletBalance < difference) {
        enqueueSnackbar("Not enough balance to update this expense!");
        return;
      }

      const updatedExpenses = expenses.map((exp) =>
        exp.id === editingExpense.id
          ? { ...newExpense, id: editingExpense.id }
          : exp
      );
      setExpenses(updatedExpenses);
      setWalletBalance((prev) => prev - difference);
      setEditingExpense(null);
    } else {
      if (amountNum > walletBalance) {
        enqueueSnackbar("Not enough balance in wallet!");
        return;
      }

      const expenseWithId = { ...newExpense, id: Date.now() };
      setExpenses((prev) => [...prev, expenseWithId]);
      setWalletBalance((prev) => prev - amountNum);
    }

    setOpen(false);
  };

  const handleAddIncome = (incomeAmount) => {
    const parsed = parseFloat(incomeAmount);

    if (!parsed || isNaN(parsed)) {
      // if not a number
      enqueueSnackbar("Please enter a valid amount");
      return;
    }

    setWalletBalance((prev) => {
      const prevNum = parseFloat(prev); // parsefloat so that it is converted to string
      return prevNum + parsed; //add
    });

    setbalance(false);
  };
  const totalExpenses = expenses.reduce(
    (acc, curr) => acc + Number(curr.amount),
    0
  ); // add the spent amt n use number() to actuall add

  const barChartData = expenses.map((exp, index) => ({
    name: `${exp.title}-${index}`, // Ensure uniqueness with index
    value: parseFloat(exp.amount),
  }));
  

  const getCategoryIcon = (category) => {
    switch (category) {
      case "Food":
        return <IoFastFoodSharp size={30} />;
      case "Shopping":
        return <MdShoppingCart size={30} />;
      case "Travel":
        return <MdFlight size={30} />;
      case "Bills":
        return <IoReceipt size={30} />;
      case "Entertainment":
        return <BiSolidCameraMovie size={30} />;
      default:
        return null;
    }
  };

  const handleDelete = (idToDelete) => {
    const updatedExpenses = expenses.filter((exp) => exp.id !== idToDelete);

    localStorage.setItem("expenses", JSON.stringify(updatedExpenses));

    setExpenses(updatedExpenses);
  };

  return (
    <div className={styles.box1}>
      <h1 className={styles.h1tag}>Expense Tracker</h1>
      <div className={styles.box2}>
        <section className={styles.wallet}>
          <h3 className={styles.walletBalance}>
            Wallet Balance: ₹{walletBalance}
          </h3>

          <div></div>
          <button
            style={{ color: "white" }}
            type="button"
            className={styles.btn1}
            onClick={() => setbalance(true)}
          >
            + Add Income
          </button>

          {balance && (
            <Modaladdbalance
              balance={balance}
              onClose={() => setbalance(false)}
              onAddIncome={handleAddIncome}
            />
          )}
        </section>
        <section className={styles.expense}>
          <h3 className={styles.expensebox}>Expenses: ₹{totalExpenses} </h3>
          <button
            style={{ color: "white" }}
            type="button"
            className={styles.btn2}
            onClick={() => setOpen(true)}
          >
            + Add Expense
          </button>
          {open && (
            <ModaladdExpense
              onClose={() => setOpen(false)}
              onAddExpense={handleAddExpense}
              editingExpense={editingExpense}
            />
          )}
        </section>
        <section className={styles.charts}>
          <PieChart width={300} height={200}>
            <Pie data={chartData} dataKey="value" nameKey="category">
              {chartData.map((entry, index) => (
                <Cell key={index} fill={entry.fill} />
              ))}
            </Pie>
          </PieChart>

          <BarChart width={100} height={50} data={chartData}>
            <XAxis type="category" dataKey="category" />
            <YAxis hide />
            <Bar dataKey="value" radius={[10, 10, 10, 10]}>
              {" "}
              {chartData.map((entry, index) => (
                <Cell  key={`cell-bar-${entry.name}`} // <- Unique key for each bar
                fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </section>
      </div>

      <div className={styles.bottom}>
        <section>
          <h3 className={styles.transactionh3}>Recent Transactions</h3>
          <div className={styles.trnx}>
            {expenses.map((exp, index) => (
              <div key={index} className={styles.trnxItem}>
                <h3
                  style={{
                    padding: "10px",
                    display: "flex",
                    gap: "10px",
                    fontSize: "20px",
                  }}
                >
                  {getCategoryIcon(exp.category)}
                  {exp.title}
                </h3>
                <div
                  style={{
                    display: "flex",
                    padding: "10px",
                    color: "gray",
                    borderBottom: "1px solid gray",
                    width: "95%",
                  }}
                >
                  <p>
                    {new Date(exp.date).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "2-digit",
                    })}
                  </p>

                  <p style={{ marginLeft: "500px", paddingRight: "5px" }}>
                    ₹{exp.amount}
                  </p>
                  <MdOutlineDeleteForever
                    size={30}
                    style={{ cursor: "pointer" }}
                    onClick={() => handleDelete(exp.id)}
                  />
                  <MdOutlineEdit
                    size={30}
                    style={{ cursor: "pointer" }}
                    onClick={() => {
                      setEditingExpense(exp);
                      setOpen(true);
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
        <section>
          <h3 className={styles.expenseh3}>Top Expenses</h3>
          <div className={styles.topexpense}>
            <BarChart
              layout="vertical"
              width={200}
              height={100}
              data={barChartData}
              barCategoryGap={20}
              style={{ paddingLeft: "20px" }}
            >
              <XAxis type="number" hide />
              <YAxis dataKey="name" type="category" hide />

              <Bar dataKey="value" minPointSize={20}>
                

                {barChartData.map((entry, index) => (
                  <Cell
                  key={`cell-bar-${entry.name}`} 
                  fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Bar>
            </BarChart>
          </div>
        </section>
      </div>
    </div>
  );
};

export default ExpenseApp;
