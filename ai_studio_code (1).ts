import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI, Type } from "@google/genai";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// Simple body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Mock data stores (Replace these with database queries or actual external REST endpoints in production!)
const MOCK_ITEMS = [
  { id: '1', itemName: 'Laptop Pro 15', itemCode: 'ITM001', hsnCode: '8471', mrp: 75000, sellRate: 68000, gstPercentage: 18, stock: 15 },
  { id: '2', itemName: 'Wireless Mouse', itemCode: 'ITM002', hsnCode: '8471', mrp: 1500, sellRate: 1200, gstPercentage: 18, stock: 45 },
  { id: '3', itemName: 'Monitor 27"', itemCode: 'ITM003', hsnCode: '8471', mrp: 22000, sellRate: 19500, gstPercentage: 18, stock: 8 },
  { id: '4', itemName: 'Keyboard Mechanical', itemCode: 'ITM004', hsnCode: '8471', mrp: 4500, sellRate: 3800, gstPercentage: 18, stock: 22 },
];

const MOCK_LEDGERS = [
  { id: '1', name: 'Cash in Hand', ledgerName: 'Cash in Hand', groupName: 'Cash-in-hand', openingBalance: 5000, balanceType: 'Dr' },
  { id: '2', name: 'HDFC Bank', ledgerName: 'HDFC Bank', groupName: 'Bank Accounts', openingBalance: 125000, balanceType: 'Dr' },
  { id: '3', name: 'Office Rent', ledgerName: 'Office Rent', groupName: 'Indirect Expenses', openingBalance: 0, balanceType: 'Dr' },
  { id: '4', name: 'Sales Account', ledgerName: 'Sales Account', groupName: 'Sales Accounts', openingBalance: 0, balanceType: 'Cr' },
  { id: '5', name: 'ABC Corporation', ledgerName: 'ABC Corporation', groupName: 'Sundry Debtors', openingBalance: 45000, balanceType: 'Dr', gstNo: '27AAAAA0000A1Z5' },
];

const INVOICES_STORE = [
  { id: '1', bill_No: 'MLCO-30008/25-26', date: '2026-03-21T09:47:00', partyName: 'Shri Parshwa Sales', refNo: 'SO-1002', item_SubTotal: 4300.00, grandTotal: 5074.00, billStatus: 0, salesPerson: 'Jigar Mehta' },
  { id: '2', bill_No: 'INV-1002', date: '2026-04-10T11:20:00', partyName: 'ABC Corporation', refNo: 'PO-30492', item_SubTotal: 150000.00, grandTotal: 177000.00, billStatus: 0, salesPerson: 'Jigar Mehta' }
];

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", env: process.env.NODE_ENV });
});

// GET: List invoices
app.get("/api/invoices", (req, res) => {
  const { docNo, partyName } = req.query;
  let filtered = [...INVOICES_STORE];
  if (docNo) {
    filtered = filtered.filter(inv => inv.bill_No.toLowerCase().includes(docNo.toString().toLowerCase()));
  }
  if (partyName) {
    filtered = filtered.filter(inv => inv.partyName.toLowerCase().includes(partyName.toString().toLowerCase()));
  }
  res.json(filtered);
});

// POST: Add new invoice (manually or via AI creation)
app.post("/api/invoices", (req, res) => {
  const invoice = req.body;
  const bill_No = invoice.docNo || invoice.bill_No || 'INV-' + Math.floor(Math.random() * 8999 + 1000);
  const newInvoice = {
    id: Math.random().toString(),
    bill_No: bill_No,
    date: invoice.billDate ? `${invoice.billDate}T12:00:00` : new Date().toISOString(),
    partyName: invoice.ledgerName || invoice.partyName || 'ABC Corporation',
    refNo: invoice.poNo || '-',
    item_SubTotal: invoice.subTotal || invoice.totalTaxableValue || invoice.taxableValue || 0,
    grandTotal: invoice.grandTotal || 0,
    billStatus: 0,
    salesPerson: invoice.salesPerson || 'Jigar Mehta'
  };
  INVOICES_STORE.unshift(newInvoice);
  res.json({ status: 'success', invoiceNo: bill_No, docNo: bill_No, data: newInvoice });
});

// POST: Real-Time assistant LLM with function calling
app.post("/api/gemini/chat", async (req, res) => {
  const { message, history = [] } = req.body;
  if (!message) {
    return res.status(400).json({ error: "Message is required" });
  }

  if (!process.env.GEMINI_API_KEY) {
    return res.status(500).json({ error: "Gemini API Key is not configured on the server." });
  }

  try {
    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: { 'User-Agent': 'aistudio-build' }
      }
    });

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: [
        ...history,
        { role: "user", parts: [{ text: message }] }
      ],
      config: {
        systemInstruction: `You are "Baawan AI", a professional ERP assistant for the baawan.com ERP System. 
        Your goal is to help users manage their business efficiently.
        You can check stock, create invoices, look up ledger information, check outstanding balances, and provide financial summaries.
        Always be polite, concise, and helpful. 
        If you perform an action (like creating an invoice), confirm the details with the user.
        If you don't have enough information to perform an action, ask for the missing details.
        Current Date: ${new Date().toLocaleDateString()}`,
        tools: [{
          functionDeclarations: [
            {
              name: "check_stock",
              description: "Check the current stock of an item by name or code.",
              parameters: {
                type: Type.OBJECT,
                properties: {
                  itemName: { type: Type.STRING, description: "The name or code of the item to check stock for." }
                },
                required: ["itemName"]
              }
            },
            {
              name: "create_invoice",
              description: "Create a new sales invoice.",
              parameters: {
                type: Type.OBJECT,
                properties: {
                  partyName: { type: Type.STRING, description: "The name of the customer/party." },
                  items: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        itemName: { type: Type.STRING },
                        quantity: { type: Type.NUMBER },
                        rate: { type: Type.NUMBER }
                      },
                      required: ["itemName", "quantity"]
                    }
                  }
                },
                required: ["partyName", "items"]
              }
            },
            {
              name: "get_ledger_info",
              description: "Get information about a ledger/party, including their balance and GST details.",
              parameters: {
                type: Type.OBJECT,
                properties: {
                  ledgerName: { type: Type.STRING, description: "The name of the ledger to search for." }
                },
                required: ["ledgerName"]
              }
            },
            {
              name: "get_financial_summary",
              description: "Get a summary of the company's financial performance (Profit & Loss).",
              parameters: {
                type: Type.OBJECT,
                properties: {
                  period: { type: Type.STRING, description: "The period for the summary (e.g., 'this month', 'last quarter')." }
                }
              }
            },
            {
              name: "get_outstanding",
              description: "Get the outstanding balance and bill details for a specific party/ledger.",
              parameters: {
                type: Type.OBJECT,
                properties: {
                  partyName: { type: Type.STRING, description: "The name of the party to check outstanding for." }
                },
                required: ["partyName"]
              }
            }
          ]
        }]
      }
    });

    const functionCalls = response.functionCalls;
    if (functionCalls) {
      const results = [];
      for (const call of functionCalls) {
        let resultData;
        try {
          const args = (call.args || {}) as any;
          if (call.name === "check_stock") {
            const queryName = (args.itemName || '').toString().toLowerCase();
            const searchResult = MOCK_ITEMS.filter(i => 
              i.itemName.toLowerCase().includes(queryName) || 
              i.itemCode.toLowerCase().includes(queryName)
            );
            resultData = searchResult.length > 0 ? searchResult : "No items found with that name.";
          } else if (call.name === "create_invoice") {
            const invoiceNo = 'INV-' + Math.floor(Math.random() * 8999 + 1000);
            const partyName = (args.partyName || 'ABC Corporation').toString();
            const itemsList = args.items || [];
            
            let subTotal = 0;
            itemsList.forEach((item: any) => {
              const qty = Number(item.quantity) || 1;
              const rate = Number(item.rate) || 68000;
              subTotal += (qty * rate);
            });
            const grandTotal = subTotal * 1.18;

            const newInvoice = {
              id: Math.random().toString(),
              bill_No: invoiceNo,
              date: new Date().toISOString(),
              partyName: partyName,
              refNo: 'AI-Doc',
              item_SubTotal: subTotal,
              grandTotal: grandTotal,
              billStatus: 0,
              salesPerson: 'Baawan AI'
            };
            
            INVOICES_STORE.unshift(newInvoice);
            resultData = { 
              status: 'success', 
              invoiceNo, 
              docNo: invoiceNo, 
              partyName, 
              grandTotal, 
              itemsCount: itemsList.length 
            };
          } else if (call.name === "get_ledger_info") {
            const queryName = (args.ledgerName || '').toString().toLowerCase();
            const searchResult = MOCK_LEDGERS.filter(l => 
              l.name.toLowerCase().includes(queryName) || 
              l.groupName.toLowerCase().includes(queryName)
            );
            resultData = searchResult.length > 0 ? searchResult : "No ledgers found with that name.";
          } else if (call.name === "get_financial_summary") {
            resultData = {
              revenue: 1250000,
              expenses: 850000,
              netProfit: 400000,
              details: []
            };
          } else if (call.name === "get_outstanding") {
            resultData = [
              { id: '1', partyName: 'ABC Corporation', billNo: 'INV-001', date: '2024-03-01', amount: 25000, pendingAmount: 15000 },
              { id: '2', partyName: 'XYZ Industries', billNo: 'INV-005', date: '2024-03-10', amount: 12000, pendingAmount: 12000 }
            ];
          }
        } catch (toolError: any) {
          console.error(`Error in tool ${call.name}:`, toolError);
          resultData = { error: "Failed to execute tool." };
        }

        results.push({
          functionResponse: {
            name: call.name,
            response: { result: resultData }
          }
        });
      }

      const finalResponse = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: [
          ...history,
          { role: "user", parts: [{ text: message }] },
          { role: "model", parts: response.candidates?.[0]?.content?.parts || [] },
          { role: "user", parts: results as any }
        ],
        config: {
          systemInstruction: "You are Baawan AI. Provide a natural language summary of the tool results. If no data was found, clearly state that to the user.",
        }
      });

      const finalOutput = finalResponse.text?.trim() || "I've processed your request.";
      return res.json({
        text: finalOutput,
        history: [
          ...history,
          { role: "user", parts: [{ text: message }] },
          { role: "model", parts: [{ text: finalOutput }] }
        ]
      });
    }

    const outputText = response.text?.trim() || "I'm not sure how to respond to that.";
    return res.json({
      text: outputText,
      history: [
        ...history,
        { role: "user", parts: [{ text: message }] },
        { role: "model", parts: [{ text: outputText }] }
      ]
    });

  } catch (error: any) {
    console.error("Gemini AI Server Error:", error);
    res.status(500).json({ error: error.message || "Failed to call Gemini API from server" });
  }
});

// POST: Financial Performance insights diagnostic report
app.post("/api/gemini/insights", async (req, res) => {
  const { businessData } = req.body;
  if (!process.env.GEMINI_API_KEY) {
    return res.status(500).json({ error: "Gemini API Key is not configured on the server." });
  }

  try {
    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: { 'User-Agent': 'aistudio-build' }
      }
    });

    const prompt = `You are "Baawan ERP Strategic Advisor", an expert business consultant. 
Analyze the following business metrics of the company and provide constructive, highly actionable, strategic insights:

Business Data:
${JSON.stringify(businessData || {}, null, 2)}

Your response MUST be a valid JSON object matching the following TypeScript interface strictly. Do not wraps inside \`\`\`json markdown blocks, just return raw JSON text:
{
  "summary": "A concise executive summary (~2-3 sentences) of the financial & operation performance.",
  "strengths": ["List 2-3 key strengths or positive highlights based on the data."],
  "risks": ["List 2-3 operational/financial threats, risks, or areas of concern (e.g. outstanding, low stock)."],
  "recommendations": ["List 3-4 specific, professional, actionable steps the admin can take immediately."]
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    if (response?.text) {
      return res.json(JSON.parse(response.text.trim()));
    } else {
      throw new Error("No response text from Gemini");
    }
  } catch (error: any) {
    console.error("Gemini Insights Server Error:", error);
    res.status(500).json({ error: error.message || "Failed to generate AI insights from server" });
  }
});

// Start listening
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});