import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useRequests } from "../../context/RequestContext";
import { useToast } from "../../context/ToastContext";
import { useCurrency } from "../../context/CurrencyContext";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Modal } from "../../components/ui/Modal";
import { useNavigate } from "react-router-dom";
import {
  CreditCard,
  Download,
  AlertCircle,
  CheckCircle,
  FileText,
  Plus,
  Coins,
  ChevronRight,
  ShieldCheck,
  Calendar,
  User,
  Hash,
  Building2,
  Upload,
  Copy
} from "lucide-react";

export const PaymentBilling = () => {
  const { currentUser } = useAuth();
  const { requests, transactions, confirmPayment } = useRequests();
  const { showToast } = useToast();
  const { formatAmount } = useCurrency();
  const navigate = useNavigate();

  const parseFee = (feeStr) => {
    if (!feeStr) return 0;
    return parseFloat(feeStr.replace(/[^0-9.]/g, "")) || 0;
  };

  // Find the user's completed but unpaid request (if any)
  const outstandingRequest = requests.find(
    (r) => r.userId === currentUser?.id && r.status === "completed" && r.paymentStatus === "unpaid"
  );

  // States
  const [selectedMethod, setSelectedMethod] = useState("Credit Card");
  const [selectedCard, setSelectedCard] = useState("visa");
  const [savedCards, setSavedCards] = useState([
    { id: "visa", brand: "Visa", last4: "4521", expiry: "12/28", holder: "Alex Mercer" },
    { id: "mastercard", brand: "Mastercard", last4: "1985", expiry: "08/29", holder: "Alex Mercer" }
  ]);
  const [showAddCardModal, setShowAddCardModal] = useState(false);
  const [newCardData, setNewCardData] = useState({ number: "", holder: "", expiry: "", cvc: "" });

  // Bank Transfer slip upload state
  const [bankSlipFile, setBankSlipFile] = useState(null);   // File object from <input type="file">
  const [bankSlipRef, setBankSlipRef] = useState("");     // Optional bank reference / transaction # entered by user
  const [selectedBank, setSelectedBank] = useState("commercial"); // Active bank account tab

  // Payment Success Modal state
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [lastTxnId, setLastTxnId] = useState("");

  // Invoice calculations based on outstandingRequest fee
  const rawFee = outstandingRequest ? parseFee(outstandingRequest.fee) : 0;

  const dispatchCost = rawFee; // Total Travel Cost
  const platformCommission = dispatchCost > 0 ? Math.round(dispatchCost * 0.10 * 100) / 100 : 0;
  const dispatchFee = dispatchCost > 0 ? Math.round((dispatchCost - platformCommission) * 100) / 100 : 0;
  const grandTotal = dispatchCost;

  // Filter transactions belonging to this user
  const userTransactions = transactions.filter((t) => t.userId === currentUser?.id);

  const handleConfirmPayment = () => {
    if (!outstandingRequest) {
      showToast("No outstanding payments due.", "info");
      return;
    }

    // Guard: Bank Transfer requires a slip upload
    if (selectedMethod === "Bank Transfer" && !bankSlipFile) {
      showToast("Please upload your bank payment slip/receipt before confirming.", "warning");
      return;
    }

    let methodText = selectedMethod;
    if (selectedMethod === "Credit Card" || selectedMethod === "Debit Card") {
      const card = savedCards.find((c) => c.id === selectedCard);
      methodText = card ? `${card.brand} ending ${card.last4}` : selectedMethod;
    }
    if (selectedMethod === "Bank Transfer" && bankSlipRef) {
      methodText = `Bank Transfer (Ref: ${bankSlipRef})`;
    }

    // ---------------------------------------------------------------------
    // FUTURE INTEGRATION POINT — Bank Transfer server upload
    // When you add a real backend, POST the slip here before confirmPayment:
    //
    //   const formData = new FormData();
    //   formData.append("slip", bankSlipFile);
    //   formData.append("requestId", outstandingRequest.id);
    //   formData.append("ref", bankSlipRef);
    //   await fetch("/api/upload-slip", { method: "POST", body: formData });
    // ---------------------------------------------------------------------

    const completedTxn = confirmPayment(outstandingRequest.id, methodText);

    if (completedTxn) {
      setLastTxnId(completedTxn.id);
      setShowSuccessModal(true);
      setBankSlipFile(null);
      setBankSlipRef("");
      showToast("Payment processed successfully!", "success");
    } else {
      showToast("Failed to process payment. Please try again.", "error");
    }
  };

  const handleAddCardSubmit = (e) => {
    e.preventDefault();
    if (!newCardData.number || !newCardData.holder || !newCardData.expiry) {
      showToast("Please fill in all card details.", "warning");
      return;
    }

    const last4 = newCardData.number.slice(-4) || "0000";
    const brand = newCardData.number.startsWith("4") ? "Visa" : "Mastercard";
    const newCard = {
      id: `card-${Date.now()}`,
      brand,
      last4,
      expiry: newCardData.expiry,
      holder: newCardData.holder
    };

    setSavedCards([...savedCards, newCard]);
    setSelectedCard(newCard.id);
    setShowAddCardModal(false);
    setNewCardData({ number: "", holder: "", expiry: "", cvc: "" });
    showToast("New card added successfully.", "success");
  };

  const handleDownloadReceipt = (txnId) => {
    showToast(`Downloading receipt for Transaction ${txnId}...`, "success");
  };

  return (
    <div className="space-y-6 text-left pb-12">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold tracking-tight text-foreground">Payment & Billing</h2>
        <p className="text-sm text-muted-foreground mt-0.5">Manage outstanding dues, saved payment methods, and invoices.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left Columns - Outstanding & Invoice & Payment Method Selection */}
        <div className="lg:col-span-2 space-y-6">

          {/* 1. Outstanding Payment Card */}
          <Card className="border-border/80">
            <CardHeader className="pb-3 border-b">
              <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <AlertCircle className="text-rose-500" size={16} /> Outstanding Payments
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {outstandingRequest ? (
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase border bg-rose-500/10 text-rose-500 border-rose-500/20">
                        Overdue / Unpaid
                      </span>
                      <span className="text-xs text-muted-foreground">ID: {outstandingRequest.id}</span>
                    </div>
                    <h3 className="text-xl font-bold text-foreground">{formatAmount(parseFee(outstandingRequest.fee))}</h3>
                    <p className="text-xs text-muted-foreground">
                      Service: <span className="font-semibold text-foreground">{outstandingRequest.category}</span>
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Provider: <span className="font-semibold text-foreground">{outstandingRequest.garageName}</span>
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Vehicle: <span className="font-semibold text-foreground">{outstandingRequest.vehicle.make} {outstandingRequest.vehicle.model} ({outstandingRequest.vehicle.plate})</span>
                    </p>
                  </div>
                  <Button
                    onClick={() => {
                      document.getElementById("payment-summary")?.scrollIntoView({ behavior: "smooth" });
                      showToast("Ready to confirm your payment details.", "info");
                    }}
                    className="shrink-0 flex items-center gap-1.5"
                    size="sm"
                  >
                    Pay Now <ChevronRight size={14} />
                  </Button>
                </div>
              ) : (
                <div className="text-center py-6 flex flex-col items-center justify-center space-y-2">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                    <ShieldCheck size={24} />
                  </div>
                  <div>
                    <p className="font-bold text-foreground">All Clear!</p>
                    <p className="text-xs text-muted-foreground mt-0.5">No outstanding payments on your account.</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 2. Invoice Details Card */}
          {outstandingRequest && (
            <Card className="border-border/80">
              <CardHeader className="pb-3 border-b">
                <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                  <FileText size={16} className="text-primary" /> Invoice Breakdowns
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5 space-y-3">
                <div className="flex justify-between text-xs py-1 border-b border-border/40">
                  <span className="text-muted-foreground">Dispatch Fee</span>
                  <span className="font-bold text-foreground">{formatAmount(dispatchFee)}</span>
                </div>
                <div className="flex justify-between text-xs py-1 border-b border-border/40">
                  <span className="text-muted-foreground">Platform Commission (10%)</span>
                  <span className="font-bold text-foreground">{formatAmount(platformCommission)}</span>
                </div>
                <div className="flex justify-between text-sm pt-2 font-bold text-foreground">
                  <span>Grand Total</span>
                  <span className="text-primary text-base">{formatAmount(grandTotal)}</span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* 3. Payment Method Selection & Saved Cards */}
          <Card className="border-border/80">
            <CardHeader className="pb-3 border-b">
              <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Payment Method</CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-6">

              {/* Payment Methods GRID */}
              {/* To replace placeholder URLs, update the `externalUrl` field in the config below */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {[
                  { label: "Credit Card" },
                  { label: "Debit Card" },
                  {
                    label: "PayPal",
                    externalUrl: "https://www.paypal.com",        // 🔁 Replace with your PayPal gateway URL
                  },
                  {
                    label: "Apple Pay",
                    externalUrl: "https://www.apple.com/apple-pay/", // 🔁 Replace with your Apple Pay gateway URL
                  },
                  {
                    label: "Google Pay",
                    externalUrl: "https://pay.google.com",        // 🔁 Replace with your Google Pay gateway URL
                  },
                  { label: "Bank Transfer" },
                  { label: "Cash Payment" },
                ].map(({ label, externalUrl }) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => {
                      setSelectedMethod(label);
                      if (externalUrl) {
                        window.open(externalUrl, "_blank", "noopener,noreferrer");
                      }
                    }}
                    className={`p-3 rounded-xl border text-xs font-bold text-center transition-all ${selectedMethod === label
                        ? "bg-primary/10 border-primary text-primary shadow-xs"
                        : "bg-muted/30 border-border/60 hover:bg-muted/50 hover:border-border/100 text-muted-foreground"
                      }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {/* 4. Saved Cards Section (only active if Credit/Debit card is selected) */}
              {(selectedMethod === "Credit Card" || selectedMethod === "Debit Card") && (
                <div className="space-y-4 pt-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Saved Cards</h4>
                    <Button onClick={() => setShowAddCardModal(true)} variant="ghost" size="sm" className="h-7 text-xs flex items-center gap-1">
                      <Plus size={14} /> Add Card
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {savedCards.map((card) => (
                      <div
                        key={card.id}
                        onClick={() => setSelectedCard(card.id)}
                        className={`p-4 rounded-xl border cursor-pointer transition-all flex flex-col justify-between h-28 relative overflow-hidden ${selectedCard === card.id
                            ? "bg-primary/5 border-primary shadow-xs ring-1 ring-primary/45"
                            : "bg-muted/20 border-border/60 hover:bg-muted/40 hover:border-border/100"
                          }`}
                      >
                        <div className="flex items-center justify-between">
                          <CreditCard size={20} className={selectedCard === card.id ? "text-primary" : "text-muted-foreground"} />
                          <span className="text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground/80">{card.brand}</span>
                        </div>
                        <div>
                          <p className="text-sm font-bold text-foreground">•••• •••• •••• {card.last4}</p>
                          <div className="flex items-center justify-between mt-1 text-[10px] text-muted-foreground font-semibold">
                            <span className="uppercase">{card.holder}</span>
                            <span>{card.expiry}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Bank Transfer Details Panel */}
              {selectedMethod === "Bank Transfer" && (
                <div className="space-y-4 pt-2">
                  {/* Section Header */}
                  <div className="flex items-center gap-2">
                    <Building2 size={14} className="text-primary" />
                    <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Bank Transfer Details</h4>
                  </div>

                  {/* ── BANK ACCOUNTS CONFIG ─────────────────────────────────────────────
                       🔁 Replace these values with your real merchant bank details.
                       Add / remove entries freely — the UI tabs update automatically.   */}
                  {(() => {
                    const BANK_ACCOUNTS = [
                      {
                        id: "commercial",
                        tabLabel: "Commercial Bank",
                        bankName: "Commercial Bank of Ceylon PLC",
                        accountNumber: "1000XXXXXXXX",
                        accountName: "ResQDriver (Pvt) Ltd",
                        branch: "Colombo 03 Branch",
                      },
                      {
                        id: "boc",
                        tabLabel: "BOC",
                        bankName: "Bank of Ceylon",
                        accountNumber: "76543XXXXXXX",
                        accountName: "ResQDriver (Pvt) Ltd",
                        branch: "Nugegoda Branch",
                      },
                      {
                        id: "sampath",
                        tabLabel: "Sampath Bank",
                        bankName: "Sampath Bank PLC",
                        accountNumber: "00458XXXXXXX",
                        accountName: "ResQDriver (Pvt) Ltd",
                        branch: "Kandy City Branch",
                      },
                    ];
                    // ─────────────────────────────────────────────────────────────────

                    const active = BANK_ACCOUNTS.find((b) => b.id === selectedBank) ?? BANK_ACCOUNTS[0];
                    const details = [
                      { label: "Bank Name", value: active.bankName },
                      { label: "Account Number", value: active.accountNumber },
                      { label: "Account Name", value: active.accountName },
                      { label: "Branch", value: active.branch },
                    ];

                    return (
                      <>
                        {/* Bank Selector — horizontal pill tabs */}
                        <div className="flex gap-1.5 flex-wrap">
                          {BANK_ACCOUNTS.map((bank) => (
                            <button
                              key={bank.id}
                              type="button"
                              onClick={() => setSelectedBank(bank.id)}
                              className={`px-3 py-1.5 rounded-lg text-[11px] font-bold border transition-all ${selectedBank === bank.id
                                  ? "bg-primary/10 border-primary text-primary shadow-sm"
                                  : "bg-muted/30 border-border/60 text-muted-foreground hover:bg-muted/50 hover:border-border"
                                }`}
                            >
                              {bank.tabLabel}
                            </button>
                          ))}
                        </div>

                        {/* Merchant Bank Details Card */}
                        <div className="bg-primary/[0.04] border border-primary/20 rounded-xl p-4 space-y-3">
                          <p className="text-[10px] font-bold uppercase tracking-widest text-primary/70">Transfer funds to the account below</p>

                          {details.map(({ label, value }) => (
                            <div key={label} className="flex items-center justify-between text-xs">
                              <span className="text-muted-foreground w-36 shrink-0">{label}</span>
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-foreground">{value}</span>
                                <button
                                  type="button"
                                  title="Copy"
                                  onClick={() => {
                                    navigator.clipboard.writeText(value);
                                    showToast(`${label} copied to clipboard.`, "success");
                                  }}
                                  className="text-muted-foreground hover:text-primary transition-colors"
                                >
                                  <Copy size={11} />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </>
                    );
                  })()}

                  {/* Bank Reference Number (optional, user-entered) */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                      <Hash size={12} /> Bank Reference / Transaction No. <span className="normal-case font-normal text-muted-foreground/60">(optional)</span>
                    </label>
                    <input
                      type="text"
                      value={bankSlipRef}
                      onChange={(e) => setBankSlipRef(e.target.value)}
                      placeholder="e.g. TXN-20241128-00123"
                      className="w-full text-xs rounded-lg border border-border/70 bg-muted/30 px-3 py-2 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/60 transition-all"
                    />
                  </div>

                  {/* Slip / Receipt Upload */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                      <Upload size={12} /> Upload Payment Slip / Receipt <span className="text-rose-500">*</span>
                    </label>

                    {/* Drop-zone style file input */}
                    <label
                      htmlFor="bank-slip-upload"
                      className={`flex flex-col items-center justify-center gap-2 w-full rounded-xl border-2 border-dashed cursor-pointer transition-all py-6 ${bankSlipFile
                          ? "border-emerald-500/50 bg-emerald-500/5 text-emerald-600"
                          : "border-border/60 bg-muted/20 hover:bg-muted/40 hover:border-border text-muted-foreground"
                        }`}
                    >
                      {bankSlipFile ? (
                        <>
                          <CheckCircle size={22} className="text-emerald-500" />
                          <span className="text-xs font-bold text-emerald-600 text-center px-4 truncate max-w-full">{bankSlipFile.name}</span>
                          <span className="text-[10px] text-emerald-500/70">Click to replace</span>
                        </>
                      ) : (
                        <>
                          <Upload size={22} className="opacity-50" />
                          <span className="text-xs font-semibold">Click to upload slip</span>
                          <span className="text-[10px] opacity-60">JPG, PNG, PDF — max 5 MB</span>
                        </>
                      )}
                      <input
                        id="bank-slip-upload"
                        type="file"
                        accept="image/jpeg,image/png,image/webp,application/pdf"
                        className="sr-only"
                        onChange={(e) => {
                          const file = e.target.files?.[0] ?? null;
                          if (file && file.size > 5 * 1024 * 1024) {
                            showToast("File too large. Maximum size is 5 MB.", "warning");
                            return;
                          }
                          setBankSlipFile(file);
                        }}
                      />
                    </label>

                    <p className="text-[10px] text-muted-foreground/60 pl-0.5">
                      Your receipt will be verified by the admin before your payment is confirmed.
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

        </div>

        {/* Right Column - Summary */}
        <div id="payment-summary" className="space-y-6">

          {/* 5. Payment Summary Card */}
          <Card className="border-border/80 bg-primary/[0.01]">
            <CardHeader className="pb-3 border-b">
              <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Payment Summary</CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-4">
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Dispatch Fee</span>
                  <span className="font-semibold text-foreground">{formatAmount(dispatchFee)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Platform Commission</span>
                  <span className="font-semibold text-foreground">{formatAmount(platformCommission)}</span>
                </div>
                <div className="pt-2 border-t border-border flex justify-between text-sm font-bold text-foreground">
                  <span>Total Amount</span>
                  <span className="text-primary text-base">{formatAmount(grandTotal)}</span>
                </div>
              </div>

              <div className="bg-muted/40 p-3 rounded-lg border border-border/50 text-[10px] text-muted-foreground leading-relaxed flex items-start gap-2">
                <ShieldCheck size={14} className="text-primary shrink-0 mt-0.5" />
                <span>
                  By clicking confirm, you authorize VAMP Secure Payments to process this transaction. Dues are forwarded to workshops directly.
                </span>
              </div>

              <Button
                disabled={!outstandingRequest}
                onClick={handleConfirmPayment}
                className="w-full font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
              >
                Confirm Payment ({formatAmount(grandTotal)})
              </Button>
            </CardContent>
          </Card>

        </div>

      </div>

      {/* 6. Recent Transactions Table */}
      <Card className="border-border/80">
        <CardHeader className="pb-3 border-b">
          <CardTitle className="text-base font-bold text-foreground">Billing Dues & Transaction Logs</CardTitle>
          <CardDescription>Comprehensive ledger of past roadside and towing clearings.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {userTransactions.length > 0 ? (
            <>
              {/* Desktop view */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-muted/40 border-y border-border/50 text-muted-foreground font-bold text-[10px] uppercase tracking-wider">
                      <th className="p-4">Transaction ID</th>
                      <th className="p-4">Date</th>
                      <th className="p-4">Garage Provider</th>
                      <th className="p-4">Vehicle</th>
                      <th className="p-4">Amount</th>
                      <th className="p-4">Method</th>
                      <th className="p-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {userTransactions.map((t) => (
                      <tr key={t.id} className="hover:bg-muted/10 transition-colors">
                        <td className="p-4 font-bold text-foreground">{t.id}</td>
                        <td className="p-4 text-muted-foreground">{new Date(t.date).toLocaleDateString()}</td>
                        <td className="p-4 font-semibold text-foreground">{t.garageName}</td>
                        <td className="p-4 text-muted-foreground">{t.vehicle}</td>
                        <td className="p-4 font-bold text-foreground">{formatAmount(parseFee(t.amount))}</td>
                        <td className="p-4 text-muted-foreground">{t.paymentMethod}</td>
                        <td className="p-4">
                          <span className="px-2 py-0.5 rounded text-[8px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 uppercase">
                            {t.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile View */}
              <div className="sm:hidden divide-y divide-border/60">
                {userTransactions.map((t) => (
                  <div key={t.id} className="p-4 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-xs text-foreground">{t.id}</span>
                      <span className="px-2 py-0.5 rounded text-[8px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 uppercase">
                        {t.status}
                      </span>
                    </div>
                    <div className="text-[11px] space-y-1 text-muted-foreground">
                      <p>Garage: <span className="font-semibold text-foreground">{t.garageName}</span></p>
                      <p>Vehicle: <span className="text-foreground">{t.vehicle}</span></p>
                      <p>Method: <span className="text-foreground">{t.paymentMethod}</span></p>
                    </div>
                    <div className="flex justify-between items-center text-[10px] text-muted-foreground/80 pt-1 border-t border-border/40">
                      <span>{new Date(t.date).toLocaleDateString()}</span>
                      <span className="font-bold text-foreground text-xs">{formatAmount(parseFee(t.amount))}</span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-12 text-xs text-muted-foreground">
              No transactions recorded yet.
            </div>
          )}
        </CardContent>
      </Card>

      {/* 7. Payment Success Modal */}
      <Modal isOpen={showSuccessModal} onClose={() => setShowSuccessModal(false)} title="Payment Settlement Completed">
        <div className="text-center py-6 flex flex-col items-center justify-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/5 animate-pulse">
            <CheckCircle size={40} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground">Payment Successful!</h3>
            <p className="text-xs text-muted-foreground mt-1">Your bill has been cleared successfully with the service provider.</p>
          </div>

          <div className="bg-muted/40 p-4 rounded-xl border border-border/60 w-full text-left space-y-2 max-w-sm">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Transaction ID</span>
              <span className="font-bold text-foreground">{lastTxnId}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Receipt Issued To</span>
              <span className="font-bold text-foreground">{currentUser?.name}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Cleared Amount</span>
              <span className="font-bold text-foreground">
                {outstandingRequest && formatAmount(parseFee(outstandingRequest.fee))}
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 w-full max-w-sm pt-2">
            <Button
              onClick={() => handleDownloadReceipt(lastTxnId)}
              variant="outline"
              className="flex-1 flex items-center justify-center gap-1.5 text-xs"
            >
              <Download size={14} /> Download Receipt
            </Button>
            <Button
              onClick={() => {
                setShowSuccessModal(false);
                navigate("/user/dashboard");
              }}
              className="flex-1 text-xs"
            >
              Return to Dashboard
            </Button>
          </div>
        </div>
      </Modal>

      {/* Add New Card Modal */}
      <Modal isOpen={showAddCardModal} onClose={() => setShowAddCardModal(false)} title="Register New Payment Card">
        <form onSubmit={handleAddCardSubmit} className="space-y-4 py-2 text-left">
          <div className="space-y-1">
            <label className="text-xs font-bold text-muted-foreground uppercase flex items-center gap-1.5">
              <User size={13} /> Cardholder Name
            </label>
            <Input
              type="text"
              required
              placeholder="e.g. Alex Mercer"
              value={newCardData.holder}
              onChange={(e) => setNewCardData({ ...newCardData, holder: e.target.value })}
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-muted-foreground uppercase flex items-center gap-1.5">
              <CreditCard size={13} /> Card Number
            </label>
            <Input
              type="text"
              required
              maxLength="16"
              placeholder="4000 1234 5678 9010"
              value={newCardData.number}
              onChange={(e) => setNewCardData({ ...newCardData, number: e.target.value.replace(/\D/g, "") })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-muted-foreground uppercase flex items-center gap-1.5">
                <Calendar size={13} /> Expiration Date
              </label>
              <Input
                type="text"
                required
                maxLength="5"
                placeholder="MM/YY"
                value={newCardData.expiry}
                onChange={(e) => setNewCardData({ ...newCardData, expiry: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-muted-foreground uppercase flex items-center gap-1.5">
                <Hash size={13} /> Security Code (CVC)
              </label>
              <Input
                type="password"
                required
                maxLength="3"
                placeholder="•••"
                value={newCardData.cvc}
                onChange={(e) => setNewCardData({ ...newCardData, cvc: e.target.value.replace(/\D/g, "") })}
              />
            </div>
          </div>

          <div className="flex gap-2 justify-end pt-4">
            <Button type="button" variant="outline" onClick={() => setShowAddCardModal(false)} size="sm">
              Cancel
            </Button>
            <Button type="submit" size="sm">
              Add Card Reference
            </Button>
          </div>
        </form>
      </Modal>

    </div>
  );
};
