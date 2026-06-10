import { GoogleGenAI, Type } from "@google/genai";
import axios from "axios";

const BASE_URL = 'https://stageapi.baawanerp.com';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { message, history = [] } = req.body;
  if (!message) {
    return res.status(400).json({ error: "Message is required" });
  }

  if (!process.env.GEMINI_API_KEY) {
    return res.status(500).json({ error: "Gemini API Key is not configured on the server." });
  }

  // Retrieve sessionId from request headers or body
  const sessionId = (req.headers['x-session-id'] || req.body.sessionId || '').toString();

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
            if (sessionId) {
              try {
                const stockRes = await axios.post(`${BASE_URL}/api/Report/CurrentStock`, {
                  name: args.itemName,
                  sessionId
                }, {
                  headers: { 'X-Session-ID': sessionId }
                });
                const items = stockRes.data || [];
                const searchResult = items.filter((i: any) => 
                  (i.itename || i.itemName || '').toLowerCase().includes(queryName) || 
                  (i.itemcode || i.itemCode || '').toLowerCase().includes(queryName)
                );
                resultData = searchResult.length > 0 ? searchResult : "No items found with that name in live database.";
              } catch (apiErr: any) {
                console.error("Live stock check failed, falling back", apiErr.message);
                resultData = { error: "Failed to query live stock database." };
              }
            } else {
              resultData = { error: "No active session ID. Please sign in." };
            }
          } else if (call.name === "get_ledger_info") {
            const queryName = (args.ledgerName || '').toString().toLowerCase();
            if (sessionId) {
              try {
                const ledgerRes = await axios.post(`${BASE_URL}/api/Ledger/Search`, {
                  name: args.ledgerName,
                  sessionId
                }, {
                  headers: { 'X-Session-ID': sessionId }
                });
                const list = ledgerRes.data?.list || ledgerRes.data?.data?.list || (Array.isArray(ledgerRes.data) ? ledgerRes.data : []);
                const searchResult = list.filter((l: any) => 
                  (l.name || l.ledgerName || '').toLowerCase().includes(queryName) || 
                  (l.groupName || '').toLowerCase().includes(queryName)
                );
                resultData = searchResult.length > 0 ? searchResult : "No ledgers found with that name.";
              } catch (apiErr: any) {
                console.error("Live ledger search failed", apiErr.message);
                resultData = { error: "Failed to search ledger on live database." };
              }
            } else {
              resultData = { error: "No active session ID. Please sign in." };
            }
          } else if (call.name === "get_outstanding") {
            const queryName = (args.partyName || '').toString().toLowerCase();
            if (sessionId) {
              try {
                // Step 1: find ledger ID
                const ledgerRes = await axios.post(`${BASE_URL}/api/Ledger/Search`, {
                  name: args.partyName,
                  sessionId
                }, {
                  headers: { 'X-Session-ID': sessionId }
                });
                const list = ledgerRes.data?.list || ledgerRes.data?.data?.list || (Array.isArray(ledgerRes.data) ? ledgerRes.data : []);
                const foundLedger = list.find((l: any) => (l.name || l.ledgerName || '').toLowerCase().includes(queryName));
                
                if (foundLedger) {
                  const ledgerId = foundLedger.ledger_id || foundLedger.id;
                  const outstandingRes = await axios.post(`${BASE_URL}/api/Report/LedgerOutstanding`, {
                    ledgers: [ledgerId],
                    toDate: new Date().toISOString().replace('T', ' ').substring(0, 19),
                    sessionId
                  }, {
                    headers: { 'X-Session-ID': sessionId }
                  });
                  resultData = outstandingRes.data || [];
                } else {
                  resultData = "No ledger found with that name to check outstanding balance.";
                }
              } catch (apiErr: any) {
                console.error("Live outstanding check failed", apiErr.message);
                resultData = { error: "Failed to check outstanding on live server." };
              }
            } else {
              resultData = { error: "No active session ID. Please sign in." };
            }
          } else if (call.name === "get_financial_summary") {
            if (sessionId) {
              try {
                // Default to current year fiscal dates: e.g. 2026-04-01 to 2026-06-30
                const pnlRes = await axios.post(`${BASE_URL}/api/Report/PNLReport`, {
                  fromDate: new Date(new Date().getFullYear(), 3, 1).toISOString(),
                  toDate: new Date().toISOString(),
                  withStock: true,
                  sessionId
                }, {
                  headers: { 'X-Session-ID': sessionId }
                });
                const data = pnlRes.data || {};
                const p = data.purchase || {};
                const s = data.sales || {};
                const revenue = (s.sales ?? s.Sales ?? 0) + (s.directIncome ?? s.DirectIncome ?? 0) + (s.indirectIncome ?? s.IndirectIncome ?? 0);
                const expenses = (p.purchase ?? p.Purchase ?? 0) + (p.directExpense ?? p.DirectExpense ?? 0) + (p.indirectExp ?? p.IndirectExp ?? 0) + (p.openStock ?? p.OpenStock ?? 0);
                const netProfit = (p.netProfit ?? p.NetProfit ?? 0) - (s.netLoss ?? s.NetLoss ?? 0);
                resultData = {
                  revenue,
                  expenses,
                  netProfit,
                  details: []
                };
              } catch (apiErr: any) {
                console.error("Live PNL check failed", apiErr.message);
                resultData = { error: "Failed to fetch profit & loss report." };
              }
            } else {
              resultData = { error: "No active session ID. Please sign in." };
            }
          } else if (call.name === "create_invoice") {
            if (sessionId) {
              try {
                const queryName = (args.partyName || '').toString().toLowerCase();
                // Step 1: find ledger
                const ledgerRes = await axios.post(`${BASE_URL}/api/Ledger/Search`, {
                  name: args.partyName,
                  sessionId
                }, {
                  headers: { 'X-Session-ID': sessionId }
                });
                const list = ledgerRes.data?.list || ledgerRes.data?.data?.list || (Array.isArray(ledgerRes.data) ? ledgerRes.data : []);
                const selectedLedger = list.find((l: any) => (l.name || l.ledgerName || '').toLowerCase().includes(queryName));
                
                if (!selectedLedger) {
                  resultData = "Could not find ledger with that name in live database. Invoice creation aborted.";
                } else {
                  // Step 2: resolve items
                  const itemsRes = await axios.post(`${BASE_URL}/api/item/Sync`, {
                    isSync: true,
                    lastModifiedDate: null,
                    sessionId
                  }, {
                    headers: { 'X-Session-ID': sessionId }
                  });
                  const allItems = itemsRes.data?.list || itemsRes.data?.data?.list || (Array.isArray(itemsRes.data) ? itemsRes.data : []);
                  
                  const itemsList = args.items || [];
                  const invoiceItems = [];
                  let subTotal = 0;

                  for (let idx = 0; idx < itemsList.length; idx++) {
                    const itemReq = itemsList[idx];
                    const matchedItem = allItems.find((i: any) => (i.nm || i.name || '').toLowerCase().includes((itemReq.itemName || '').toLowerCase()));
                    
                    const qty = Number(itemReq.quantity) || 1;
                    const rate = Number(itemReq.rate) || (matchedItem ? matchedItem.rate || matchedItem.sellRate || 100 : 100);
                    const amount = qty * rate;
                    const gstPercent = matchedItem ? matchedItem.gstPercent ?? matchedItem.gstPercentage ?? 18 : 18;
                    const itemTax = (amount * gstPercent) / 100;
                    subTotal += amount;

                    invoiceItems.push({
                      id: 0,
                      invDetID: 0,
                      sno: idx + 1,
                      item_ID: matchedItem ? matchedItem.iid || matchedItem.id : 0,
                      sp_Code: 0,
                      mfrItemName: itemReq.itemName,
                      invType: 0,
                      std_Qty: qty,
                      conv_Qty: qty,
                      conv_Unit: 0,
                      std_Rate: rate,
                      conv_Rate: rate,
                      vatPer: gstPercent,
                      discount1: 0,
                      discount2: 0,
                      amount: amount,
                      cost_Rate: 0,
                      itemDescription: itemReq.itemName,
                      inventoryMoved: 0,
                      cgstPer: gstPercent / 2,
                      cgstAmt: itemTax / 2,
                      sgstPer: gstPercent / 2,
                      sgstAmt: itemTax / 2,
                      igstPer: 0,
                      igstAmt: 0,
                      hsn: matchedItem ? matchedItem.hsn || matchedItem.hsnCode || "" : "",
                      scheduleDate: new Date().toISOString(),
                      rateAfterVat: rate * (1 + gstPercent / 100),
                      units: matchedItem ? matchedItem.unit || "PCS" : "PCS",
                      unittext: matchedItem ? matchedItem.unit || "PCS" : "PCS",
                      particular: itemReq.itemName,
                      conversion: 1,
                      ledger: selectedLedger.name || selectedLedger.ledgerName,
                    });
                  }

                  const grandTotal = subTotal + (subTotal * 0.18); // default 18% overall estimation for totals
                  const invoiceNo = `INV-${Date.now().toString().substring(6)}`;
                  
                  const invoicePayload = {
                    id: 0,
                    inv_Type: 0,
                    spCode: 0,
                    ledger_ID: selectedLedger.id || selectedLedger.ledger_id || 0,
                    gstType: 0,
                    invoiceNo: 0,
                    bill_No: invoiceNo,
                    date: new Date().toISOString(),
                    useInCompany: true,
                    refNo: "AI-Doc",
                    poNo: "PO-AI",
                    poDate: new Date().toISOString(),
                    projectSiteAddress: selectedLedger.address || "",
                    invoiceItemDetail: invoiceItems,
                    item_SubTotal: subTotal,
                    grandTotal: grandTotal,
                    shipToName: selectedLedger.name || selectedLedger.ledgerName,
                    shipToAddress: selectedLedger.address || "",
                    partyName: selectedLedger.name || selectedLedger.ledgerName,
                    partyAddress: selectedLedger.address || "",
                    dueDays: 15,
                    billStatus: 0,
                    branchId: 0,
                    companyId: 0,
                    financialYearId: 0,
                    sessionId
                  };

                  const invCreateRes = await axios.post(`${BASE_URL}/api/Invoice/Create`, invoicePayload, {
                    headers: { 'X-Session-ID': sessionId }
                  });
                  
                  resultData = { 
                    status: 'success', 
                    invoiceNo: invCreateRes.data?.docNo || invoiceNo, 
                    docNo: invCreateRes.data?.docNo || invoiceNo, 
                    partyName: selectedLedger.name || selectedLedger.ledgerName, 
                    grandTotal, 
                    itemsCount: itemsList.length 
                  };
                }
              } catch (apiErr: any) {
                console.error("Live invoice creation failed", apiErr.message);
                resultData = { error: "Failed to create invoice on ERP server." };
              }
            } else {
              resultData = { error: "No active session ID. Please sign in." };
            }
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
}
