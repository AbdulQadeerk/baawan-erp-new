import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Send, Loader2, Bot, User, BarChart3, AlertCircle, RefreshCw, FileText, Landmark } from 'lucide-react';
import axios from 'axios';

interface MessagePart {
  text?: string;
  functionResponse?: {
    name: string;
    response: {
      result: any;
    };
  };
}

interface Message {
  role: 'user' | 'model';
  parts: MessagePart[];
}

export const AIChat: React.FC = () => {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [toolExecuting, setToolExecuting] = useState<string | null>(null);
  
  // Set default welcome message in history matching backend format
  const [history, setHistory] = useState<Message[]>([
    {
      role: 'model',
      parts: [{ text: "Hello! I am **Baawan AI**, your professional ERP assistant. How can I help you manage your business today?" }]
    }
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [history, loading, toolExecuting]);

  // Function to extract sessionId from tokenInfo
  const getSessionId = (): string => {
    try {
      const tokenInfoStr = localStorage.getItem('tokenInfo');
      if (tokenInfoStr) {
        const tokenInfo = JSON.parse(tokenInfoStr);
        return tokenInfo?.user?.currentSessionId || '';
      }
    } catch (e) {
      console.error("Failed to parse tokenInfo:", e);
    }
    return '';
  };

  const handleSend = async (textToSend?: string) => {
    const messageText = textToSend || input;
    if (!messageText.trim()) return;

    if (!textToSend) setInput('');
    setLoading(true);
    setToolExecuting(null);

    // Append user message to history
    const userMessage: Message = {
      role: 'user',
      parts: [{ text: messageText }]
    };
    
    setHistory(prev => [...prev, userMessage]);

    try {
      const sessionId = getSessionId();
      
      // Send message to local express server
      const response = await axios.post('/api/gemini/chat', {
        message: messageText,
        history: history
      }, {
        headers: {
          'X-Session-ID': sessionId
        }
      });

      if (response?.data) {
        const { text, history: updatedHistory } = response.data;
        if (updatedHistory) {
          setHistory(updatedHistory);

          // Check if the latest model response executed the 'check_stock' tool
          let hasCheckStock = false;
          let searchItemName = "";
          for (let idx = updatedHistory.length - 1; idx >= 0; idx--) {
            const msg = updatedHistory[idx];
            if (msg.role === 'model') {
              const part = msg.parts.find((p: any) => p.functionCall && p.functionCall.name === 'check_stock');
              if (part) {
                hasCheckStock = true;
                searchItemName = part.functionCall.args?.itemName || "";
                break;
              }
            }
          }

          if (hasCheckStock) {
            // Dispatch window event to open current stock tab
            const event = new CustomEvent("open-tab", {
              detail: {
                type: "current-stock-report",
                title: "Current Stock Report",
                params: { itemName: searchItemName }
              }
            });
            window.dispatchEvent(event);
          }
        } else {
          setHistory(prev => [...prev, {
            role: 'model',
            parts: [{ text }]
          }]);
        }
      }
    } catch (error: any) {
      console.error("Gemini chatbot error:", error);
      const errMsg = error.response?.data?.error || "Sorry, I couldn't reach the server. Please check if your Gemini API key is configured.";
      setHistory(prev => [...prev, {
        role: 'model',
        parts: [{ text: `⚠️ **Error**: ${errMsg}` }]
      }]);
    } finally {
      setLoading(false);
      setToolExecuting(null);
    }
  };

  // Helper to parse basic markdown tags like bold/italic/bullet points
  const formatText = (text: string) => {
    if (!text) return '';
    return text.split('\n').map((line, idx) => {
      let formatted = line;
      // Bold **
      formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      // Italic *
      formatted = formatted.replace(/\*(.*?)\*/g, '<em>$1</em>');
      // Bullet lists
      if (formatted.trim().startsWith('- ')) {
        return <li key={idx} className="ml-4 list-disc text-xs my-0.5" dangerouslySetInnerHTML={{ __html: formatted.trim().substring(2) }} />;
      }
      return <p key={idx} className="text-xs leading-relaxed mb-1" dangerouslySetInnerHTML={{ __html: formatted }} />;
    });
  };

  const renderToolResult = (name: string, result: any) => {
    if (!result) return null;
    
    // Error handling
    if (result.error) {
      return (
        <div className="mt-2 p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 rounded-xl flex items-center gap-2 text-xs text-red-600 dark:text-red-400">
          <AlertCircle size={14} />
          <span>Error running {name}: {result.error}</span>
        </div>
      );
    }

    switch (name) {
      case "check_stock":
        if (typeof result === 'string') {
          return (
            <div className="mt-1 flex items-center justify-between gap-2">
              <p className="text-xs italic text-slate-500">{result}</p>
              <button 
                onClick={() => {
                  const event = new CustomEvent("open-tab", {
                    detail: {
                      type: "current-stock-report",
                      title: "Current Stock Report",
                      params: { itemName: result.includes("No items found") ? "" : result }
                    }
                  });
                  window.dispatchEvent(event);
                }}
                className="text-[10px] font-bold text-primary hover:underline cursor-pointer bg-none border-none p-0"
              >
                Go to Report Page →
              </button>
            </div>
          );
        }

        // Handle object output (e.g. when searching all stock)
        if (result && !Array.isArray(result) && result.message) {
          return (
            <div className="mt-1 flex items-center justify-between gap-2">
              <p className="text-xs italic text-slate-500">{result.message}</p>
              <button 
                onClick={() => {
                  const event = new CustomEvent("open-tab", {
                    detail: {
                      type: "current-stock-report",
                      title: "Current Stock Report",
                      params: { itemName: "" }
                    }
                  });
                  window.dispatchEvent(event);
                }}
                className="text-[10px] font-bold text-primary hover:underline cursor-pointer bg-none border-none p-0"
              >
                Go to Report Page →
              </button>
            </div>
          );
        }

        const items = Array.isArray(result) ? result : (result.sampleItems || []);
        if (items.length === 0) return <p className="text-xs italic text-slate-500 mt-1">No items found.</p>;
        return (
          <div className="space-y-1.5 mt-2">
            <div className="flex items-center justify-between px-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Live Results</span>
              <button 
                onClick={() => {
                  const event = new CustomEvent("open-tab", {
                    detail: {
                      type: "current-stock-report",
                      title: "Current Stock Report",
                      params: { itemName: items[0]?.itename || items[0]?.itemName || "" }
                    }
                  });
                  window.dispatchEvent(event);
                }}
                className="text-[10px] font-bold text-primary hover:underline cursor-pointer bg-none border-none p-0 flex items-center gap-1"
              >
                View in Report Grid →
              </button>
            </div>
            <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm">
              <table className="w-full text-left border-collapse text-[11px]">
              <thead>
                <tr className="bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-800 text-slate-500">
                  <th className="px-3 py-2">Item Code</th>
                  <th className="px-3 py-2">Item Name</th>
                  <th className="px-3 py-2 text-right">Stock</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                {items.map((item: any, i: number) => (
                  <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                    <td className="px-3 py-1.5 font-mono">{item.itemcode || item.itemCode || '-'}</td>
                    <td className="px-3 py-1.5 font-medium">{item.itename || item.itemName || '-'}</td>
                    <td className={`px-3 py-1.5 text-right font-black ${
                      (item.closing || item.stock || 0) > 10 ? 'text-emerald-600' : 'text-amber-500'
                    }`}>{item.closing !== undefined ? item.closing : item.stock || 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );

      case "get_ledger_info":
        if (typeof result === 'string') return <p className="text-xs italic text-slate-500 mt-1">{result}</p>;
        const ledgers = Array.isArray(result) ? result : [];
        if (ledgers.length === 0) return <p className="text-xs italic text-slate-500 mt-1">No ledgers found.</p>;
        return (
          <div className="mt-2 space-y-2">
            {ledgers.map((l: any, i: number) => (
              <div key={i} className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
                <p className="font-bold text-slate-800 dark:text-white mb-1">{l.name || l.ledgerName}</p>
                <div className="grid grid-cols-2 gap-2 text-slate-500">
                  <p>Group: <span className="text-slate-700 dark:text-slate-300 font-medium">{l.groupName || l.group || '-'}</span></p>
                  <p>GSTIN: <span className="text-slate-700 dark:text-slate-300 font-mono font-medium">{l.gstNo || l.gstin || 'None'}</span></p>
                  <p>Balance: <span className="text-slate-700 dark:text-slate-300 font-medium">{l.balanceType || 'Dr'} {l.openingBalance || 0}</span></p>
                </div>
              </div>
            ))}
          </div>
        );

      case "get_outstanding":
        const bills = Array.isArray(result) ? result : [];
        if (bills.length === 0) return <p className="text-xs italic text-slate-500 mt-1">No outstanding balances.</p>;
        return (
          <div className="mt-2 overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm">
            <table className="w-full text-left border-collapse text-[11px]">
              <thead>
                <tr className="bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-800 text-slate-500">
                  <th className="px-3 py-2">Bill No</th>
                  <th className="px-3 py-2">Date</th>
                  <th className="px-3 py-2 text-right">Amount</th>
                  <th className="px-3 py-2 text-right">Pending</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                {bills.map((bill: any, i: number) => (
                  <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                    <td className="px-3 py-1.5 font-bold">{bill.billNo || bill.bill_No}</td>
                    <td className="px-3 py-1.5">{new Date(bill.date).toLocaleDateString()}</td>
                    <td className="px-3 py-1.5 text-right">₹{(bill.amount || 0).toLocaleString()}</td>
                    <td className="px-3 py-1.5 text-right font-bold text-red-500">₹{(bill.pendingAmount || bill.pending || 0).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );

      case "get_financial_summary":
        return (
          <div className="mt-2 p-3 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 rounded-xl text-xs space-y-2">
            <div className="flex items-center gap-1.5 font-bold text-emerald-600 dark:text-emerald-400">
              <Bot size={14} />
              <span>Financial Profitability Diagnostics</span>
            </div>
            <div className="grid grid-cols-3 gap-4 text-center mt-1">
              <div className="p-2 bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-slate-100 dark:border-slate-800">
                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Revenue</p>
                <p className="text-sm font-black text-slate-800 dark:text-white mt-0.5">₹{(result.revenue || 0).toLocaleString()}</p>
              </div>
              <div className="p-2 bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-slate-100 dark:border-slate-800">
                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Expenses</p>
                <p className="text-sm font-black text-slate-800 dark:text-white mt-0.5">₹{(result.expenses || 0).toLocaleString()}</p>
              </div>
              <div className="p-2 bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-slate-100 dark:border-slate-800">
                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Net Profit</p>
                <p className="text-sm font-black text-emerald-600 dark:text-emerald-400 mt-0.5">₹{(result.netProfit || 0).toLocaleString()}</p>
              </div>
            </div>
          </div>
        );

      case "create_invoice":
        return (
          <div className="mt-2 p-3 bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30 rounded-xl text-xs space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-blue-600 dark:text-blue-400">
              <Bot size={14} />
              <span>ERP Document Action Success</span>
            </div>
            <p className="text-slate-600 dark:text-slate-300">Created Sales Invoice <strong className="text-slate-800 dark:text-white">{result.invoiceNo || result.docNo}</strong> for <strong>{result.partyName || 'ABC Corporation'}</strong>.</p>
            <p className="text-slate-500">Grand Total: <strong>₹{(result.grandTotal || 0).toLocaleString()}</strong> ({result.itemsCount || 1} items)</p>
          </div>
        );

      default:
        return null;
    }
  };

  const quickPrompts = [
    { label: "Check current stock of Laptop Pro", text: "Check current stock of Laptop Pro 15" },
    { label: "Get ABC Corporation ledger details", text: "Get ledger info for ABC Corporation" },
    { label: "Check outstanding balance for ABC Corp", text: "What is the outstanding balance of ABC Corporation?" },
    { label: "Show financial PNL summary", text: "Show financial summary" },
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-190px)] max-w-5xl mx-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/40 dark:bg-slate-950/20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
            <Bot size={22} className="animate-pulse" />
          </div>
          <div>
            <h3 className="font-extrabold text-slate-800 dark:text-white flex items-center gap-1.5 text-base">
              Baawan AI Assistant
              <Sparkles size={16} className="text-primary animate-pulse" />
            </h3>
            <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Strategic ERP Agent</p>
          </div>
        </div>
        
        {loading && (
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Loader2 className="animate-spin text-primary" size={14} />
            <span>Analyzing...</span>
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6 custom-scrollbar bg-slate-50/20 dark:bg-slate-950/10">
        {history.map((msg, i) => (
          <div key={i} className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role !== 'user' && (
              <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 mt-0.5">
                <Bot size={16} />
              </div>
            )}
            
            <div className={`max-w-[75%] rounded-2xl p-4 text-xs ${
              msg.role === 'user'
                ? 'bg-primary text-white shadow-md shadow-primary/15 rounded-tr-sm'
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm text-slate-800 dark:text-slate-100 rounded-tl-sm'
            }`}>
              {/* Message text content */}
              <div className="space-y-1.5">
                {msg.parts.map((part, pidx) => (
                  <React.Fragment key={pidx}>
                    {part.text && formatText(part.text)}
                    {part.functionResponse && renderToolResult(part.functionResponse.name, part.functionResponse.response?.result)}
                  </React.Fragment>
                ))}
              </div>
            </div>

            {msg.role === 'user' && (
              <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center flex-shrink-0 mt-0.5 font-bold">
                U
              </div>
            )}
          </div>
        ))}
        
        {loading && !toolExecuting && (
          <div className="flex gap-4 justify-start">
            <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 mt-0.5">
              <Loader2 className="animate-spin" size={16} />
            </div>
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl rounded-tl-sm p-4 text-xs shadow-sm flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}

        {toolExecuting && (
          <div className="flex gap-4 justify-start">
            <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 mt-0.5">
              <Loader2 className="animate-spin" size={16} />
            </div>
            <div className="bg-slate-50 dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-800 rounded-2xl rounded-tl-sm p-4 text-xs flex items-center gap-2 text-slate-500">
              <Bot className="text-primary animate-pulse" size={14} />
              <span className="italic font-medium">{toolExecuting}</span>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Suggestions Panel */}
      {history.length === 1 && (
        <div className="px-6 py-3 border-t border-slate-100 dark:border-slate-850">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Suggested Queries</p>
          <div className="flex flex-wrap gap-2">
            {quickPrompts.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(prompt.text)}
                className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-xl text-[11px] font-semibold text-slate-600 dark:text-slate-300 hover:text-primary transition-all cursor-pointer shadow-sm"
              >
                {prompt.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-3"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
            placeholder={loading ? "Analyzing request..." : "Ask Baawan AI... (e.g. check stock, search ledgers)"}
            className="flex-1 px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all disabled:opacity-60"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="w-10 h-10 bg-primary hover:bg-primary/95 text-white flex items-center justify-center rounded-xl transition-all shadow-md shadow-primary/20 disabled:opacity-50 disabled:shadow-none cursor-pointer"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={18} />
            ) : (
              <Send size={16} />
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
