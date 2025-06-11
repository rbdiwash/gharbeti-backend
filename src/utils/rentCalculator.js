const calculateRentDue = (startDate, monthlyRate, lastPaymentDate = null) => {
  const start = new Date(startDate);
  const now = new Date();
  const lastPayment = lastPaymentDate ? new Date(lastPaymentDate) : start;

  // Calculate months between start date and now
  const monthsDiff =
    (now.getFullYear() - lastPayment.getFullYear()) * 12 +
    (now.getMonth() - lastPayment.getMonth());

  // Calculate total due amount
  const totalDue = monthsDiff * monthlyRate;

  // Calculate next due date
  const nextDueDate = new Date(lastPayment);
  nextDueDate.setMonth(nextDueDate.getMonth() + 1);

  return {
    totalDue,
    monthsDue: monthsDiff,
    nextDueDate,
    isLate: nextDueDate < now,
  };
};

module.exports = {
  calculateRentDue,
};
