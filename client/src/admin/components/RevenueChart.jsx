import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { useEffect, useState } from "react";
import axios from "axios";
import PropTypes from "prop-types";

const RevenueChart = ({ period = "monthly" }) => {
  const [data, setData] = useState([]);
  const token = localStorage.getItem("token");

  useEffect(() => {
    axios.get(
      `http://localhost:8000/api/v1/orders/dashboard/revenue?period=${period}`,
      { headers: { Authorization: `Bearer ${token}` } }
    )
    .then((res) => setData(res.data))
    .catch((err) => console.error("Error fetching revenue:", err));
  }, [period, token]);

  return (
    <div style={{ width: "100%", height: 320 }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
          <XAxis 
            dataKey="label" 
            stroke="#64748b" 
            fontSize={11} 
            tickLine={false} 
            axisLine={false} 
            dy={10}
          />
          <YAxis 
            stroke="#64748b" 
            fontSize={11} 
            tickLine={false} 
            axisLine={false} 
            tickFormatter={(val) => `₹${val.toLocaleString()}`} 
          />
          <Tooltip 
            contentStyle={{ 
              background: "#ffffff", 
              border: "1px solid #e2e8f0", 
              borderRadius: "12px", 
              boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.02)" 
            }}
            formatter={(value) => [`₹${value.toLocaleString()}`, "Revenue"]}
          />
          <Line 
            type="monotone" 
            dataKey="revenue" 
            stroke="#6366f1" 
            strokeWidth={3} 
            dot={{ r: 4, stroke: "#6366f1", strokeWidth: 2, fill: "#ffffff" }} 
            activeDot={{ r: 6 }} 
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

RevenueChart.propTypes = {
  period: PropTypes.string,
};

export default RevenueChart;
