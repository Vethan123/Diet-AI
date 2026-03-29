import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import {BOTS} from "./ModelShowcase";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell 
} from 'recharts';

// Unified Imports
import { 
  Send, User, Command, BarChart3, Info, X, Activity,
  Split, Globe, ScanQrCode, Hammer, AlertOctagon 
} from "lucide-react";

console.log(BOTS);
const MODEL_ASSETS: Record<string, any> = BOTS.reduce((acc, bot) => {  
  acc[bot.id] = {
    icon: bot.icon?.props?.src ? (
      <img src={bot.icon.props.src} alt={bot.name} className="w-5 h-5 object-cover rounded-md" />
    ) : <Command size={18} />,
    label: bot.name.includes('/') ? "Diet Builder" : bot.name,
    color: bot.color.split(' ').pop()
  };
  return acc;
}, {});

const MODEL_KEYS = Object.keys(MODEL_ASSETS);
const IDEAL_VALUES = JSON.parse(import.meta.env.VITE_BALANCED_DIET_SHEET);
// Model Metadata for the Council View
const MODEL_DETAILS: Record<string, any> = BOTS.reduce((acc, bot) => {
  acc[bot.id] = { desc: bot.description, tag: bot.tag };
  return acc;
}, {});

const ChatPage = () => {
  const navigate = useNavigate();
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [messages, setMessages] = useState([
    { id: "1", role: "bot", content: "Hello! I'm **Diet AI**. How can I help?", modelName: "omni_knowledge_bot" }
  ]);
  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(0);
  const [rawSheet, setRawSheet] = useState<any>(null);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false);
  const [analyticsData, setAnalyticsData] = useState<any[]>([]);
  const [isAnalyticsLoading, setIsAnalyticsLoading] = useState(false);

  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [popupContent, setPopupContent] = useState<string | null>(null);
  const [isPopupLoading, setIsPopupLoading] = useState(false);
  
  const [activeModel, setActiveModel] = useState<typeof MODEL_ASSETS[string] | null>(null);

  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const sendMessage = async () => {
    if (!input.trim() || isTyping) return;
    const userMsg = { id: Date.now().toString(), role: "user", content: input };
    setMessages((prev) => [...prev, userMsg]);
    const currentQuery = input;
    setInput("");
    setIsTyping(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/query`, {
        method: "POST",
        credentials: 'include',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: currentQuery }), 
      });

      const data = await response.json();
      const botContent = data.output.nutri_scanner || data.output.omni_knowledge_bot || "No response received.";
      
      setMessages((prev) => [
        ...prev, 
        { 
          id: (Date.now() + 1).toString(), 
          role: "bot", 
          content: botContent, 
          modelName: data.agent_used 
        }
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev, 
        { 
          id: "err-" + Date.now(), 
          role: "bot", 
          content: "Sorry, I encountered an error processing that request.", 
          modelName: "omni_knowledge_bot" 
        }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const fetchAnalytics = async () => {
  setIsAnalyticsOpen(true);
  setIsAnalyticsLoading(true);
  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/get_user_stats`, {
      method: 'GET',
      credentials: 'include',
    });
    const data = await response.json();
    
    const sheet = data.user_details.overall_nutrient_sheet;
    const startDateSource = data.user_details.start_date; 
    
    const dataArray = sheet["Calories (kcal)"] || [];
    const dataLength = dataArray.length;
    
    if (dataLength === 0) {
      setAnalyticsData([]);
      setIsAnalyticsLoading(false);
      return;
    }

    // --- FIX: ALWAYS TARGET THE LATEST INDEX (TODAY) ---
    const latestIndex = dataLength - 1;
    
    setRawSheet({ 
      ...sheet, 
      startDate: startDateSource,
      activeDays: dataLength 
    });
    
    // Set the dropdown to the last index
    setSelectedDayIndex(latestIndex);

    // Process the chart data for that specific day immediately
    processChartData(sheet, latestIndex);

  } catch (error) {
    console.error("Analytics Error:", error);
  } finally {
    setIsAnalyticsLoading(false);
  }
};
const processChartData = (sheet: any, dayIndex: number) => {
  const chartMap = Object.keys(sheet)
    .filter(key => Array.isArray(sheet[key]))
    .map(nutrientKey => {
      const ideal = IDEAL_VALUES[nutrientKey] || 100;
      const value = sheet[nutrientKey][dayIndex] || 0;
      const percentage = Math.round((value / ideal) * 100);

      return {
        name: nutrientKey.split(' (')[0],
        displayValue: Math.min(percentage, 100),
        actualPercentage: percentage,
        fullValue: `${value} / ${ideal} ${nutrientKey.match(/\(([^)]+)\)/)?.[1] || ''}`
      };
    });

  setAnalyticsData(chartMap);
};

const getFormattedDate = (dateSource: any, index: number) => {
  const dateStr = dateSource?.$date || dateSource;

  const base = new Date(dateStr);

  // FIX: Use UTC methods
  const utcDate = new Date(
    Date.UTC(
      base.getUTCFullYear(),
      base.getUTCMonth(),
      base.getUTCDate() + index
    )
  );

  return utcDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

  const handlePopupAction = async (type: "summary" | "review") => {
  setPopupContent(null);
  setIsPopupLoading(true);
  setIsPopupOpen(true);
  
  setActiveModel(type === "summary" ? MODEL_ASSETS.diet_builder : MODEL_ASSETS.nutri_reflector);

  try {
    let formattedContent = "";

    if (type === "summary") {
      // --- SUMMARY LOGIC (DIET SUGGESTIONS) ---
      const res = await fetch(`${import.meta.env.VITE_API_URL}/diet_suggestions`, {
        method: 'GET',
        credentials: 'include',
      });
      const data = await res.json();
      const dietData = data?.output?.diet_builder;

      if (dietData && typeof dietData === 'object' && !Array.isArray(dietData)) {
        formattedContent = `# 🥗 Personalized Diet Plan\n`;
        formattedContent += `Diet AI has analyzed your nutrient gaps and curated these additions.\n\n----- \n\n`;

        Object.entries(dietData).forEach(([food, nutrients]) => {
          const foodTitle = food.charAt(0).toUpperCase() + food.slice(1);
          const nutrientList = Array.isArray(nutrients) 
            ? nutrients.map(n => `• ${n}`).join('\n') 
            : `• ${nutrients}`;

          formattedContent += `### 🍴 ${foodTitle}\n`;
          formattedContent += `${nutrientList}\n\n`;
        });
      } else {
        formattedContent = String(dietData || "No suggestions found.");
      }

    } else {
      // --- REVIEW LOGIC (DUAL API CALL) ---
      // We call both 'review' and 'check_skips' simultaneously
      const [reviewRes, skipsRes] = await Promise.all([
        fetch(`${import.meta.env.VITE_API_URL}/review`, { method: 'GET', credentials: 'include' }),
        fetch(`${import.meta.env.VITE_API_URL}/check_skips`, { method: 'GET', credentials: 'include' })
      ]);

      const reviewData = await reviewRes.json();
      const skipsData = await skipsRes.json();

      const reflection = reviewData?.output?.nutri_reflector || "No review available.";
      const skipComments = skipsData?.output?.missy_monitor || "Attendance data unavailable.";
      const hasSkips = skipsData?.output?.Miss_Flag;

      formattedContent += `### 🧠Nutri Reflector Analysis\n`;
      formattedContent += `${reflection}`;
      formattedContent += `\n\n----- \n\n`;
      formattedContent += `${hasSkips ? "⚠️ **Missed Sessions Detected**" : "✅ **Perfect Attendance**"}\n`;
      formattedContent += `> ${skipComments}\n\n`;
      
    }

    setPopupContent(formattedContent);
    
  } catch (e) { 
    console.error("Popup Action Error:", e);
    setPopupContent("## ⚠️ Error\nFailed to sync with the Council. Please check your connection."); 
  } finally { 
    setIsPopupLoading(false); 
  }
};


  return (
    <div className="h-screen flex flex-col bg-background text-foreground relative overflow-hidden font-sans">
      
      {/* HEADER */}
      <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/95 backdrop-blur flex items-center justify-between px-6 h-16">
  
  {/* LEFT SECTION: System Actions */}
  <div className="flex items-center gap-3">
    <button 
      onClick={fetchAnalytics} 
      className="flex items-center gap-2 text-[10px] font-black bg-primary/10 text-primary px-3 py-2 rounded-lg hover:bg-primary/20 transition-all shadow-sm"
    >
      <BarChart3 size={14} /> VIEW ANALYTICS
    </button>
    
    <button 
      onClick={() => setIsInfoOpen(true)} 
      className="flex items-center gap-2 text-[10px] font-black bg-muted text-muted-foreground px-3 py-2 rounded-lg hover:bg-muted/80 transition-all border border-border/50"
    >
      <Globe size={14} /> VIEW AGENTS
    </button>
  </div>

  {/* CENTER SECTION: Brand Logo */}
  <div 
    className="flex items-center gap-2 font-black text-xl cursor-pointer hover:opacity-80 transition-opacity tracking-tighter" 
    onClick={() => navigate('/')}
  >
      <Command className="text-primary w-6 h-6"/> 
      <span>DIET AI</span>
  </div>

  {/* RIGHT SECTION: Navigation Buttons with Names */}
  <div className="flex items-center gap-2">
    {/* ABOUT BUTTON */}
    <button 
      onClick={() => navigate("/about")} 
      className="flex items-center gap-2 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-xl transition-all group"
    >
      <Info size={18} className="group-hover:rotate-12 transition-transform"/>
      <span>About</span>
    </button>

    {/* PROFILE BUTTON */}
    <button 
      onClick={() => navigate("/profile")} 
      className="flex items-center gap-2 px-3 py-2 text-[10px] font-black uppercase tracking-widest bg-muted/50 hover:bg-muted text-foreground border border-border/40 rounded-xl transition-all"
    >
      <User size={18} />
      <span>Profile</span>
    </button>
  </div>

</header>

      {/* CHAT MAIN */}
      <main className="flex-1 overflow-y-auto">
        <div className="w-[90%] md:w-[60%] lg:w-[50%] mx-auto py-8 flex flex-col gap-8">
          <AnimatePresence mode="popLayout">
            {messages.map((msg) => (
              <motion.div 
                key={msg.id} 
                layout 
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }} 
                className={`flex w-full ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div className={`flex gap-3 max-w-[90%] ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                  
                  {/* ICON BLOCK */}
                  {/* ICON BLOCK */}
<div 
  className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center border shadow-md cursor-zoom-in transition-transform hover:scale-110 ${
    msg.role === "user" ? "bg-primary text-white" : "bg-card"
  }`}
  onClick={() => {
    if (msg.role === "bot") {
      const asset = MODEL_ASSETS[msg.modelName || ""];
      const imgSrc = asset?.icon?.props?.src || "../assets/agents/omni_knowledge_bot.png";
      setPopupContent(`![${asset?.label}](${imgSrc})`);
      setActiveModel(asset);
      setIsPopupOpen(true);
    }
  }}
  title="Click to view"
>
  {msg.role === "user" ? (
    <User size={24} />
  ) : (
    /* This wrapper ensures the bot icon stays centered and fills the space correctly */
    <div className="w-9 h-9 overflow-hidden rounded-lg flex items-center justify-center">
      {MODEL_ASSETS[msg.modelName || ""]?.icon || <Command size={20} />}
    </div>
  )}
</div>
                  

                  {/* MESSAGE CONTENT */}
                  <div className={`p-4 rounded-2xl border shadow-sm ${msg.role === "user" ? "bg-primary text-white" : "bg-card"}`}>
                    <div className="prose prose-sm dark:prose-invert">
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>

                    {/* RESTORED BUTTONS: Summary & Review */}
                    {msg.role === "bot" && (msg.modelName === "nutri_scanner") && (
                      <div className="flex gap-2 mt-4 pt-3 border-t border-border/50">
                        <button 
                          onClick={() => handlePopupAction("summary")} 
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary hover:bg-primary/20 rounded-lg text-[10px] font-black uppercase transition-colors"
                        >
                          <BarChart3 size={12}/> Get Diet Suggestions
                        </button>
                        <button 
                          onClick={() => handlePopupAction("review")} 
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-muted text-muted-foreground hover:bg-muted/80 rounded-lg text-[10px] font-black uppercase transition-colors"
                        >
                          <Info size={12}/> Get review
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          
          {isTyping && <LinearEmojiLoader />}
          <div ref={endRef} className="h-20" />
        </div>
      </main>

      <footer className="w-full py-6 px-6 bg-background">
        <div className="w-[90%] md:w-[60%] lg:w-[50%] mx-auto relative flex items-end gap-2 bg-muted/40 border border-border rounded-2xl p-2 focus-within:ring-2 ring-primary/20 transition-all">
          <textarea 
            rows={1} 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
            placeholder="Ask DietAI anything..." 
            className="w-full bg-transparent border-none focus:ring-0 resize-none py-2 px-3 text-sm min-h-[40px]" 
          />
          <button 
            onClick={sendMessage}
            disabled={!input.trim() || isTyping}
            className="p-2 rounded-xl bg-primary text-white shadow hover:opacity-90 active:scale-95 transition-all disabled:opacity-50"
          >
            <Send size={18}/>
          </button>
        </div>
      </footer>

    {/* ANALYTICS SIDEBAR */}
      <AnimatePresence>
        {isAnalyticsOpen && (
          <div className="fixed inset-0 z-50 flex justify-start bg-black/20 backdrop-blur-[2px]">
            <motion.div 
              initial={{ x: "-100%" }} 
              animate={{ x: 0 }} 
              exit={{ x: "-100%" }} 
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="w-[90%] max-w-[500px] bg-card border-r border-border h-full shadow-2xl flex flex-col"
            >
              {/* Sidebar Header */}
              <div className="p-6 border-b border-border flex items-center justify-between bg-muted/10">
                <div className="flex items-center gap-3">
                  <Activity className="text-primary" size={24} />
                  <h2 className="font-black text-lg tracking-tight uppercase">Nutrient Analytics</h2>
                </div>
                <button onClick={() => setIsAnalyticsOpen(false)} className="p-2 hover:bg-muted rounded-full transition-colors">
                  <X size={20}/>
                </button>
              </div>

              {/* Sidebar Content */}
              <div className="flex-1 overflow-y-auto p-6">
                {isAnalyticsLoading ? (
                  <div className="h-full flex items-center justify-center"><LinearEmojiLoader /></div>
                ) : (
                  <div className="flex flex-col gap-6">
                    
                    {/* DATE DROPDOWN */}
                    {rawSheet && (
  <select 
    value={selectedDayIndex} // Controlled component
    onChange={(e) => {
      const idx = parseInt(e.target.value);
      setSelectedDayIndex(idx);
      processChartData(rawSheet, idx);
    }}
    className="w-full bg-muted border border-border rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 ring-primary/20 outline-none"
  >
    {Array.from({ length: rawSheet.activeDays }).map((_, i) => {
      const dateLabel = getFormattedDate(rawSheet.startDate, i);
      
      const todayLabel = new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });

      const isToday = dateLabel === todayLabel;

      return (
        <option key={i} value={i}>
          {dateLabel} {isToday ? "— TODAY" : ""}
        </option>
      );
    })}
  </select>
)}
                    {/* CHART SECTION */}
                    <div style={{ height: `${Math.max(400, analyticsData.length * 50)}px` }} className="w-full">
                      {analyticsData.length === 0 ? (
                        <p className="text-center text-muted-foreground py-20 uppercase text-[10px] font-black tracking-widest">No data logged</p>
                      ) : (
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={analyticsData} layout="vertical" margin={{ left: 10, right: 40 }}>
                            <CartesianGrid strokeDasharray="3 3" horizontal={false} strokeOpacity={0.1} />
                            <XAxis type="number" domain={[0, 100]} hide />
                            <YAxis 
                              dataKey="name" 
                              type="category" 
                              width={100}
                              tick={{ fontSize: 11, fontWeight: 700, fill: "hsl(var(--foreground))" }} 
                              axisLine={false} 
                              tickLine={false} 
                            />
                            <Tooltip 
                              cursor={{ fill: 'hsl(var(--primary) / 0.05)' }} 
                              content={({ active, payload }) => {
                                if (active && payload?.length) {
                                  const data = payload[0].payload;
                                  return (
                                    <div className="bg-popover border border-border p-3 rounded-xl shadow-xl">
                                      <p className="text-[10px] font-black text-primary uppercase">{data.name}</p>
                                      <p className="text-lg font-black">{data.actualPercentage}%</p>
                                      <p className="text-[10px] text-muted-foreground font-medium">{data.fullValue}</p>
                                    </div>
                                  );
                                }
                                return null;
                              }}
                            />
                            <Bar dataKey={() => 100} fill="hsl(var(--muted))" radius={[0, 4, 4, 0]} barSize={15} isAnimationActive={false} />
                            <Bar dataKey="displayValue" radius={[0, 4, 4, 0]} barSize={15}>
                              {analyticsData.map((entry, index) => (
                                <Cell 
                                  key={`cell-${index}`} 
                                  fill={entry.actualPercentage >= 100 ? "#34D399" : "hsl(var(--primary))"} 
                                />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
            
            {/* Click outside to close area */}
            <div className="flex-1" onClick={() => setIsAnalyticsOpen(false)} />
          </div>
        )}
      </AnimatePresence>

      {/* POPUP MODAL (Summary/Review/Image Preview) */}
<AnimatePresence>
  {isPopupOpen && (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }} 
        animate={{ scale: 1, opacity: 1 }} 
        exit={{ scale: 0.9, opacity: 0 }} 
        className="bg-card border border-border w-full max-w-2xl max-h-[85vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col relative"
      >
        
        {/* --- ADD THIS HEADER LOGIC --- */}
        <div className="p-5 border-b border-border flex justify-between items-center bg-muted/20">
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-xl flex items-center justify-center bg-background border shadow-sm"
              style={{ color: activeModel?.color || "var(--primary)" }}
            >
              {activeModel?.icon || <Command size={20} />}
            </div>
            <div>
              <h3 className="font-black text-[10px] uppercase text-primary tracking-widest leading-none mb-1">
                Viewing Agent
              </h3>
              <p className="font-bold text-lg leading-tight">
                {activeModel?.label || "Diet AI Agent"}
              </p>
            </div>
          </div>
          <button 
            onClick={() => setIsPopupOpen(false)} 
            className="p-2 hover:bg-muted rounded-full transition-all text-muted-foreground"
          >
            <X size={22}/>
          </button>
        </div>
        {/* --- END HEADER LOGIC --- */}

        <div className="p-8 overflow-y-auto flex-1 bg-background custom-scrollbar">
  {isPopupLoading ? (
    <div className="h-64 flex flex-col items-center justify-center">
      <LinearEmojiLoader />
      <p className="text-[10px] font-black uppercase text-primary mt-4 tracking-[0.2em] animate-pulse">
        Analyzing Gaps...
      </p>
    </div>
  ) : (
    <div className="prose prose-sm dark:prose-invert max-w-none 
      prose-headings:font-black prose-headings:tracking-tighter 
      prose-h1:text-3xl prose-h1:mb-2 prose-h1:text-primary
      prose-h3:text-lg prose-h3:mt-8 prose-h3:mb-2
      prose-blockquote:border-l-4 prose-blockquote:border-primary/30 prose-blockquote:bg-primary/5 prose-blockquote:py-1 prose-blockquote:rounded-r-xl prose-blockquote:not-italic prose-blockquote:text-muted-foreground">
      
      {/* SAFER STRING CHECK */}
      {typeof popupContent === 'string' && popupContent.startsWith('![') ? (
        <div className="flex justify-center">
          <img 
            src={popupContent.match(/\((.*?)\)/)?.[1]} 
            alt="Agent" 
            className="max-h-[50vh] rounded-3xl shadow-2xl border border-white/10"
          />
        </div>
      ) : (
        <ReactMarkdown>{String(popupContent || "")}</ReactMarkdown>
      )}
    </div>
  )}
</div>
      </motion.div>
    </div>
  )}
</AnimatePresence>
      {/* AI COUNCIL MODAL */}
      <AnimatePresence>
        {isInfoOpen && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-background/80 backdrop-blur-md">
            <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-card border border-border w-full max-w-4xl max-h-[90vh] rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col relative"
            >
                <button 
                onClick={() => setIsInfoOpen(false)} 
                className="absolute top-6 right-6 p-2 hover:bg-muted rounded-full z-100"
                >
                <X size={20} />
                </button>

                <div className="p-10 overflow-y-auto">
                <div className="text-center mb-10">
                    <h2 className="text-2xl font-black uppercase tracking-tighter">The Diet AI Council</h2>
                    <p className="text-muted-foreground text-xs uppercase tracking-widest mt-1">Specialized Intelligence Layers</p>
                </div>

                {/* AI COUNCIL MODAL CONTENT */}
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {Object.entries(MODEL_ASSETS).map(([key, asset], i) => {
    // Get the original bot data using the key
    const botDetail = MODEL_DETAILS[key];
    
    return (
      <motion.div
        key={key}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: i * 0.05 }}
        className="p-5 rounded-3xl border border-border bg-muted/20 hover:bg-muted/30 transition-all group cursor-pointer"
        onClick={() => {
          // ADDED: Click to view large image from the agent list too!
          setPopupContent(`![${asset.label}](${asset.icon.props.src})`);
          setActiveModel(asset);
          setIsPopupOpen(true);
        }}
      >
        <div className="flex justify-between items-start mb-4">
          <div 
            className="w-12 h-12 rounded-xl flex items-center justify-center shadow-sm bg-background border transition-transform group-hover:scale-110"
            style={{ color: asset.color }}
          >
            {/* Using the normalized asset icon */}
            {asset.icon}
          </div>
          <span className="text-[9px] font-black uppercase tracking-widest text-primary/60 bg-primary/5 px-2 py-1 rounded-md border border-primary/10">
            {botDetail?.tag || "Agent"}
          </span>
        </div>
        
        <h3 className="font-bold text-sm mb-1.5">{asset.label}</h3>
        <p className="text-[11px] text-muted-foreground leading-relaxed">
          {botDetail?.desc || "No description available."}
        </p>
      </motion.div>
    );
  })}
</div>
                </div>
            </motion.div>
            </div>
        )}
      </AnimatePresence>

    </div>
  );
};

// --- LOADER COMPONENT ---
const LinearEmojiLoader = () => {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    const itv = setInterval(() => setIndex((p) => (p + 1) % MODEL_KEYS.length), 700);
    return () => clearInterval(itv);
  }, []);
  
  const currentAsset = MODEL_ASSETS[MODEL_KEYS[index]];

  return (
    <div className="flex items-center gap-4 bg-card border border-border p-3 rounded-2xl shadow-sm w-fit">
      <div 
        className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center"
        style={{ color: currentAsset.color }}
      >
        <AnimatePresence mode="wait">
          <motion.div key={index} initial={{ x: -10, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 10, opacity: 0 }}>
            {currentAsset.icon}
          </motion.div>
        </AnimatePresence>
      </div>
      <div className="flex flex-col pr-4">
        <span className="text-[9px] font-black uppercase text-primary">Scanning</span>
        <span className="text-[11px] font-medium text-muted-foreground">{currentAsset.label}</span>
      </div>
    </div>
  );
};

export default ChatPage;