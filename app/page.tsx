"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Edit, Trash2 } from "lucide-react";
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isToday,
  isSameDay,
} from "date-fns";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Badge } from "@/components/ui/badge";

interface Expense {
  id: string;
  title: string;
  amount: number;
  date: Date;
  color: string;
  frequency: "one-time" | "daily" | "weekly" | "monthly" | "yearly";
}

export default function Page() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [newExpense, setNewExpense] = useState<Expense>({
    id: "",
    title: "",
    amount: 0,
    date: new Date(),
    color: "#3b82f6",
    frequency: "one-time",
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  const addOrUpdateExpense = () => {
    if (newExpense.title && newExpense.amount) {
      if (editingExpense) {
        setExpenses(
          expenses.map((exp) =>
            exp.id === editingExpense.id
              ? { ...newExpense, id: editingExpense.id }
              : exp,
          ),
        );
      } else {
        setExpenses([
          ...expenses,
          { ...newExpense, id: Date.now().toString() },
        ]);
      }
      setNewExpense({
        id: "",
        title: "",
        amount: 0,
        date: new Date(),
        color: "#3b82f6",
        frequency: "one-time",
      });
      setEditingExpense(null);
      setIsModalOpen(false);
    }
  };

  const deleteExpense = (id: string) => {
    setExpenses(expenses.filter((exp) => exp.id !== id));
  };

  const editExpense = (expense: Expense) => {
    setEditingExpense(expense);
    setNewExpense(expense);
    setIsModalOpen(true);
  };

  const openModalForDay = (day: Date) => {
    setNewExpense((prev) => ({ ...prev, date: day }));
    setIsModalOpen(true);
  };

  const getExpensesForDay = (day: Date) => {
    return expenses.filter((expense) => {
      if (expense.frequency === "one-time") {
        return isSameDay(new Date(expense.date), day);
      }
      if (expense.frequency === "daily") {
        return true;
      }
      if (expense.frequency === "weekly") {
        return new Date(expense.date).getDay() === day.getDay();
      }
      if (expense.frequency === "monthly") {
        return new Date(expense.date).getDate() === day.getDate();
      }
      if (expense.frequency === "yearly") {
        return (
          new Date(expense.date).getMonth() === day.getMonth() &&
          new Date(expense.date).getDate() === day.getDate()
        );
      }
      return false;
    });
  };

  const getTotalExpenseForMonth = () => {
    return expenses.reduce((total, expense) => {
      if (
        expense.frequency === "one-time" &&
        isSameMonth(new Date(expense.date), currentMonth)
      ) {
        return total + expense.amount;
      }
      if (expense.frequency === "daily") {
        return total + expense.amount * monthDays.length;
      }
      if (expense.frequency === "weekly") {
        return total + expense.amount * 4; // Approximating 4 weeks per month
      }
      if (expense.frequency === "monthly") {
        return total + expense.amount;
      }
      if (
        expense.frequency === "yearly" &&
        new Date(expense.date).getMonth() === currentMonth.getMonth()
      ) {
        return total + expense.amount;
      }
      return total;
    }, 0);
  };

  useEffect(() => {
    const savedExpenses = localStorage.getItem("expenses");
    if (savedExpenses) {
      setExpenses(
        JSON.parse(savedExpenses).map((exp: Expense) => ({
          ...exp,
          date: new Date(exp.date),
        })),
      );
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("expenses", JSON.stringify(expenses));
  }, [expenses]);

  return (
    <div className="p-8 min-h-screen bg-gradient-to-br from-teal-100 to-indigo-200 dark:from-gray-900 dark:to-indigo-950">
      <Card className="overflow-hidden mx-auto max-w-6xl rounded-3xl shadow-xl bg-white/80 backdrop-blur-sm dark:bg-gray-800/80">
        <CardContent className="p-8">
          <motion.h1
            className="mb-8 text-5xl font-bold text-center text-teal-800 dark:text-teal-300"
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Super Dev Expense Calendar
          </motion.h1>

          <motion.div
            className="flex justify-between items-center mb-6"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Button
              onClick={prevMonth}
              variant="outline"
              size="icon"
              className="rounded-full hover:bg-teal-200 dark:hover:bg-teal-800"
            >
              <ChevronLeft className="w-6 h-6" />
            </Button>
            <h2 className="text-3xl font-semibold text-teal-800 dark:text-teal-200">
              {format(currentMonth, "MMMM yyyy")}
            </h2>
            <Button
              onClick={nextMonth}
              variant="outline"
              size="icon"
              className="rounded-full hover:bg-teal-200 dark:hover:bg-teal-800"
            >
              <ChevronRight className="w-6 h-6" />
            </Button>
          </motion.div>

          <motion.div
            className="mb-6 text-right"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <p className="text-2xl font-semibold text-teal-800 dark:text-teal-300">
              Total Monthly Expenses: ${getTotalExpenseForMonth().toFixed(2)}
            </p>
          </motion.div>

          <div className="grid grid-cols-7 gap-2 mb-4">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div
                key={day}
                className="text-lg font-semibold text-center text-teal-600 dark:text-teal-400"
              >
                {day}
              </div>
            ))}
          </div>

          <motion.div
            className="grid grid-cols-7 gap-2"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            {monthDays.map((day, index) => {
              const dayExpenses = getExpensesForDay(day);
              return (
                <HoverCard key={day.toString()}>
                  <HoverCardTrigger asChild>
                    <motion.div
                      className={`min-h-[120px] p-2 border rounded-lg shadow-md cursor-pointer ${
                        !isSameMonth(day, currentMonth)
                          ? "bg-gray-100 dark:bg-gray-800"
                          : isToday(day)
                            ? "bg-teal-100 dark:bg-teal-900"
                            : "bg-white dark:bg-gray-700"
                      }`}
                      whileHover={{
                        scale: 1.05,
                        boxShadow: "0px 0px 8px rgba(0,0,0,0.2)",
                      }}
                      transition={{ type: "spring", stiffness: 300 }}
                      onClick={() => openModalForDay(day)}
                    >
                      <div className="mb-1 text-lg font-semibold">
                        {format(day, "d")}
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {dayExpenses.slice(0, 2).map((expense) => (
                          <Badge
                            key={expense.id}
                            style={{ backgroundColor: expense.color }}
                          >
                            {expense.title}
                          </Badge>
                        ))}
                        {dayExpenses.length > 2 && (
                          <Badge variant="secondary">
                            +{dayExpenses.length - 2} more
                          </Badge>
                        )}
                      </div>
                    </motion.div>
                  </HoverCardTrigger>
                  <HoverCardContent className="p-4 w-80 bg-white rounded-lg shadow-lg dark:bg-gray-800">
                    <h3 className="mb-2 text-lg font-semibold text-teal-800 dark:text-teal-200">
                      {format(day, "MMMM d, yyyy")}
                    </h3>
                    {dayExpenses.length > 0 ? (
                      <ul className="space-y-2">
                        {dayExpenses.map((expense) => (
                          <li
                            key={expense.id}
                            className="flex justify-between items-center"
                          >
                            <span className="text-teal-700 dark:text-teal-300">
                              {expense.title}
                            </span>
                            <div className="flex items-center">
                              <span className="mr-2 font-semibold text-teal-600 dark:text-teal-400">
                                ${expense.amount.toFixed(2)}
                              </span>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  editExpense(expense);
                                }}
                              >
                                <Edit className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteExpense(expense.id);
                                }}
                              >
                                <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
                              </Button>
                            </div>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-gray-600 dark:text-gray-400">
                        No expenses for this day.
                      </p>
                    )}
                    <div className="pt-2 mt-2 border-t border-teal-200 dark:border-teal-700">
                      <p className="text-lg font-semibold text-teal-800 dark:text-teal-200">
                        Total: $
                        {dayExpenses
                          .reduce((sum, exp) => sum + exp.amount, 0)
                          .toFixed(2)}
                      </p>
                    </div>
                  </HoverCardContent>
                </HoverCard>
              );
            })}
          </motion.div>

          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogContent className="bg-white dark:bg-gray-800 sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle className="text-2xl font-semibold text-teal-800 dark:text-teal-200">
                  {editingExpense ? "Edit Expense" : "Add New Expense"}
                </DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 gap-4 items-center">
                  <Label
                    htmlFor="title"
                    className="text-right text-teal-700 dark:text-teal-300"
                  >
                    Title
                  </Label>
                  <Input
                    id="title"
                    value={newExpense.title}
                    onChange={(e) =>
                      setNewExpense({ ...newExpense, title: e.target.value })
                    }
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 gap-4 items-center">
                  <Label
                    htmlFor="amount"
                    className="text-right text-teal-700 dark:text-teal-300"
                  >
                    Amount
                  </Label>
                  <Input
                    id="amount"
                    type="number"
                    value={newExpense.amount || ""}
                    onChange={(e) =>
                      setNewExpense({
                        ...newExpense,
                        amount: parseFloat(e.target.value),
                      })
                    }
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 gap-4 items-center">
                  <Label
                    htmlFor="date"
                    className="text-right text-teal-700 dark:text-teal-300"
                  >
                    Date
                  </Label>
                  <Input
                    id="date"
                    type="date"
                    value={format(new Date(newExpense.date), "yyyy-MM-dd")}
                    onChange={(e) =>
                      setNewExpense({
                        ...newExpense,
                        date: new Date(e.target.value),
                      })
                    }
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 gap-4 items-center">
                  <Label
                    htmlFor="frequency"
                    className="text-right text-teal-700 dark:text-teal-300"
                  >
                    Frequency
                  </Label>
                  <Select
                    value={newExpense.frequency}
                    onValueChange={(value: Expense["frequency"]) =>
                      setNewExpense({ ...newExpense, frequency: value })
                    }
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="one-time">One-time</SelectItem>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="yearly">Yearly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 gap-4 items-center">
                  <Label
                    htmlFor="color"
                    className="text-right text-teal-700 dark:text-teal-300"
                  >
                    Color
                  </Label>
                  <Input
                    id="color"
                    type="color"
                    value={newExpense.color}
                    onChange={(e) =>
                      setNewExpense({ ...newExpense, color: e.target.value })
                    }
                    className="col-span-3 h-10"
                  />
                </div>
              </div>
              <Button
                onClick={addOrUpdateExpense}
                className="w-full text-white bg-teal-600 hover:bg-teal-700"
              >
                {editingExpense ? "Update" : "Add"} Expense
              </Button>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </div>
  );
}
