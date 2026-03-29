import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LabelList, // Added this for showing values
} from "recharts";

const CHART_COLORS = [
  "#2DD4BF", "#3B82F6", "#10B981", "#F59E0B", "#EF4444", 
  "#8B5CF6", "#EC4899", "#06B6D4", "#F97316", "#84CC16"
];

const ResultsPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [barData, setBarData] = useState<any[]>([]);

  useEffect(() => {
    const fetchUserStats = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/get_user_stats`, {
          method: "GET",
          credentials: "include",
        });

        if (!res.ok) throw new Error("Failed to fetch");

        const data = await res.json();
        const user = data.user_details || {};
        const nutrients = user.overall_nutrient_sheet || {};

        const formattedData = Object.entries(nutrients)
          .map(([key, values]: [string, any]) => ({
            name: key,
            value: Array.isArray(values) ? values[0] : 0,
          }))
          .filter((item) => item.value > 0); 

        setBarData(formattedData);
      } catch (err) {
        console.error("Error fetching stats:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserStats();
  }, []);

  return (
    <div className="min-h-screen bg-[#0F172A] text-white">
      <header className="flex items-center gap-4 px-6 py-4 border-b border-white/10 bg-white/5 backdrop-blur-md sticky top-0 z-10">
        <button onClick={() => navigate("/profile")} className="p-2 hover:bg-white/10 rounded-full transition-colors">
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>
        <h1 className="text-xl font-bold">Nutrient Analysis</h1>
      </header>

      <main className="max-w-6xl mx-auto p-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-40">
            <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin" />
          </div>
        ) : barData.length > 0 ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white/5 rounded-3xl p-8 border border-white/10 shadow-2xl"
          >
            {/* Dynamic height based on number of nutrients so it doesn't look cramped */}
            <div style={{ height: `${barData.length * 60}px`, minHeight: '500px' }} className="w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart 
                  layout="vertical" 
                  data={barData} 
                  margin={{ top: 5, right: 60, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="rgba(255,255,255,0.05)" />
                  
                  <XAxis 
                    type="number" 
                    hide // Hiding the bottom axis for a cleaner look since values are on the bars
                  />
                  
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    tick={{ fill: '#FFFFFF', fontSize: 13, fontWeight: 500 }} 
                    stroke="transparent"
                    width={130}
                  />

                  <Tooltip 
                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                    contentStyle={{ 
                      backgroundColor: '#1E293B', 
                      borderRadius: '12px',
                      border: '1px solid rgba(255,255,255,0.1)',
                      color: '#FFF'
                    }}
                    itemStyle={{ 
                      color: '#FFFFFF', 
                      fontWeight: 'bold',
                      fontSize: '14px'
                    }}
                    labelStyle={{ 
                      color: '#FFFFFF',
                      marginBottom: '4px'
                    }}
                  />
                  
                  <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={30}>
                    {barData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={CHART_COLORS[index % CHART_COLORS.length]} 
                      />
                    ))}
                    {/* THIS ADDS THE WHITE VALUE TEXT ON THE RIGHT OF THE BAR */}
                    <LabelList 
                      dataKey="value" 
                      position="right" 
                      fill="#FFFFFF" 
                      fontSize={14}
                      fontWeight="bold"
                      offset={15}
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        ) : (
          <div className="text-center py-20 text-white/50">No data available for today.</div>
        )}
      </main>
    </div>
  );
};

export default ResultsPage;