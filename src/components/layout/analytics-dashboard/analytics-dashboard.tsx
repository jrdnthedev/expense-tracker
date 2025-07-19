import Card from "../../ui/card/card";
import Select from "../../ui/select/select";

export default function AnalyticsDashboard() {
  const timeframes = [
    { value: "last30days", label: "Last 30 Days" },
    { value: "last3months", label: "Last 3 Months" },
    { value: "last6months", label: "Last 6 Months" },
  ];
  return (
    <div className="analytics-dashboard-container">
      <h1 className="text-2xl font-bold mb-4">Analytics Dashboard</h1>
      <p className="text-gray-600 mb-6">
        This section provides insights into your spending patterns and financial health.
      </p>
      <div className="mb-4">
        <Card>
            <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Spending Overview</h2>
                <Select
                  name="timeframe"
                  id="timeframe"
                  options={timeframes}
                  selected="last30days"
                  onChange={(value) => console.log(value)}
                />
            </div>
            <p className="text-gray-700 mb-2">Total Expenses: $3,500</p>
            <p className="text-gray-700 mb-2">Average Monthly Spending: $1,167</p>
            <p className="text-gray-700">Top Category: Food ($1,200)</p>
        </Card>
      </div>
      <div className="flex gap-4 max-sm:flex-col">
        <Card>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Category Breakdown</h2>
          <p className="text-gray-700 mb-2">Food: $1,200</p>
          <p className="text-gray-700 mb-2">Transport: $800</p>
          <p className="text-gray-700">Fun: $500</p>
        </Card>
        <Card>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Monthly Trends</h2>
          <p className="text-gray-700 mb-2">October: $1,000</p>
          <p className="text-gray-700 mb-2">November: $1,200</p>
          <p className="text-gray-700">December: $1,300</p>
        </Card>
      </div>
    </div>
  );
}