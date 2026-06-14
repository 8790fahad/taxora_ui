import { useMemo, useState } from "react";
import api from "../api/client";

interface ManualInvoiceModalProps {
  onClose: () => void;
  onSubmitted: (message: string) => void;
}

interface LineItemForm {
  name: string;
  description: string;
  sellersItemIdentification: string;
  isicCode: string;
  serviceCategory: string;
  unitPrice: string;
  discountRate: string;
  feeRate: string;
  quantity: string;
  taxCode: string;
  taxRate: string;
}

const emptyLine: LineItemForm = {
  name: "",
  description: "",
  sellersItemIdentification: "",
  isicCode: "",
  serviceCategory: "",
  unitPrice: "",
  discountRate: "0",
  feeRate: "0",
  quantity: "1",
  taxCode: "STANDARD_VAT",
  taxRate: "7.5",
};

function num(v: string): number {
  const n = parseFloat(v);
  return Number.isFinite(n) ? n : 0;
}

function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

export default function ManualInvoiceModal({
  onClose,
  onSubmitted,
}: ManualInvoiceModalProps) {
  const today = new Date().toISOString().slice(0, 10);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [invoice, setInvoice] = useState({
    invoiceRef: "",
    currency: "NGN",
    issueDate: today,
    dueDate: "",
    status: "issued",
    orderReference: "",
    invoiceKind: "B2B",
    invoiceTypeCode: "396",
    paymentStatus: "PENDING",
  });

  const [customer, setCustomer] = useState({
    customerId: "",
    name: "",
    email: "",
    phone: "",
    tin: "",
    line: "",
    city: "",
    country: "NG",
    postalZone: "",
  });

  const [lineItems, setLineItems] = useState<LineItemForm[]>([{ ...emptyLine }]);

  const totals = useMemo(() => {
    let totalLineAmount = 0;
    let totalTax = 0;
    for (const li of lineItems) {
      const gross = num(li.quantity) * num(li.unitPrice);
      const discount = round2((gross * num(li.discountRate)) / 100);
      const fee = round2((gross * num(li.feeRate)) / 100);
      const net = round2(gross - discount + fee);
      const tax = round2((net * num(li.taxRate)) / 100);
      totalLineAmount += net;
      totalTax += tax;
    }
    totalLineAmount = round2(totalLineAmount);
    totalTax = round2(totalTax);
    return {
      totalLineAmount,
      totalTax,
      grandTotal: round2(totalLineAmount + totalTax),
    };
  }, [lineItems]);

  const updateLine = (idx: number, field: keyof LineItemForm, value: string) => {
    setLineItems((prev) =>
      prev.map((li, i) => (i === idx ? { ...li, [field]: value } : li)),
    );
  };

  const addLine = () => setLineItems((prev) => [...prev, { ...emptyLine }]);
  const removeLine = (idx: number) =>
    setLineItems((prev) => prev.filter((_, i) => i !== idx));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    const invoiceRef = invoice.invoiceRef.trim() || `${Date.now()}`;

    const canonical = {
      type: invoice.invoiceKind,
      currency: invoice.currency,
      issueDate: invoice.issueDate,
      dueDate: invoice.dueDate || null,
      status: invoice.status,
      orderReference: invoice.orderReference || null,
      paymentStatus: invoice.paymentStatus,
      invoiceTypeCode: invoice.invoiceTypeCode,
      buyer: {
        customerId: customer.customerId || null,
        name: customer.name,
        tin: customer.tin || null,
        email: customer.email || null,
        phone: customer.phone || null,
        identifiers: { tin: customer.tin || null },
        address: {
          line: customer.line || null,
          city: customer.city || null,
          country: customer.country || "NG",
          postalZone: customer.postalZone || null,
        },
      },
      lineItems: lineItems.map((li, idx) => {
        const quantity = num(li.quantity);
        const unitPrice = num(li.unitPrice);
        const discountRate = num(li.discountRate);
        const feeRate = num(li.feeRate);
        const taxRate = num(li.taxRate);
        const gross = quantity * unitPrice;
        const discountAmount = round2((gross * discountRate) / 100);
        const feeAmount = round2((gross * feeRate) / 100);
        const totalAmount = round2(gross - discountAmount + feeAmount);
        return {
          lineNo: idx + 1,
          name: li.name || li.description || `Item ${idx + 1}`,
          description: li.description || li.name,
          sellersItemIdentification:
            li.sellersItemIdentification || `ITEM-${idx + 1}`,
          isicCode: li.isicCode || "SVC-001",
          serviceCategory: li.serviceCategory || "General Services",
          nrsProductCode: li.isicCode || li.sellersItemIdentification || "SVC-001",
          unitPrice,
          discountRate,
          discountAmount,
          feeRate,
          feeAmount,
          quantity,
          totalAmount,
          taxCode: li.taxCode || "STANDARD_VAT",
          taxRate,
          taxAmount: round2((totalAmount * taxRate) / 100),
        };
      }),
      totals,
      firsSpecific: {
        invoiceTypeCode: invoice.invoiceTypeCode,
        paymentStatus: invoice.paymentStatus,
        invoiceKind: invoice.invoiceKind,
      },
    };

    try {
      await api.post("/invoices", {
        erp_source: "manual",
        erp_invoice_id: invoiceRef,
        raw: canonical,
      });
      onSubmitted(
        "Invoice submitted! Refreshing in ~5 seconds for clearance status.",
      );
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data
          ?.error || "Could not submit invoice. Check the fields and try again.";
      setError(msg);
      setSubmitting(false);
    }
  };

  const inputCls =
    "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-primary-500";
  const labelCls = "mb-1 block text-xs font-medium text-slate-600";

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-900/40 px-4 py-8"
      role="dialog"
      aria-modal="true"
      aria-labelledby="manual-invoice-title"
    >
      <form
        onSubmit={submit}
        className="w-full max-w-3xl rounded-2xl bg-white p-6 shadow-xl"
      >
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h2
              id="manual-invoice-title"
              className="text-lg font-semibold text-slate-900"
            >
              Submit invoice manually
            </h2>
            <p className="text-xs text-slate-500">
              Fill in the invoice details to send it through NRS clearance.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600"
            aria-label="Close"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Invoice details */}
        <fieldset className="mb-5">
          <legend className="mb-2 text-sm font-semibold text-slate-700">
            Invoice details
          </legend>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <label className={labelCls}>Invoice reference</label>
              <input
                className={inputCls}
                placeholder="Auto-generated if blank"
                value={invoice.invoiceRef}
                onChange={(e) => setInvoice((p) => ({ ...p, invoiceRef: e.target.value }))}
              />
            </div>
            <div>
              <label className={labelCls}>Order reference</label>
              <input
                className={inputCls}
                placeholder="PO-00421"
                value={invoice.orderReference}
                onChange={(e) => setInvoice((p) => ({ ...p, orderReference: e.target.value }))}
              />
            </div>
            <div>
              <label className={labelCls}>Currency</label>
              <input
                className={inputCls}
                value={invoice.currency}
                onChange={(e) => setInvoice((p) => ({ ...p, currency: e.target.value }))}
              />
            </div>
            <div>
              <label className={labelCls}>Issue date</label>
              <input
                type="date"
                required
                className={inputCls}
                value={invoice.issueDate}
                onChange={(e) => setInvoice((p) => ({ ...p, issueDate: e.target.value }))}
              />
            </div>
            <div>
              <label className={labelCls}>Due date</label>
              <input
                type="date"
                className={inputCls}
                value={invoice.dueDate}
                onChange={(e) => setInvoice((p) => ({ ...p, dueDate: e.target.value }))}
              />
            </div>
            <div>
              <label className={labelCls}>Status</label>
              <select
                className={inputCls}
                value={invoice.status}
                onChange={(e) => setInvoice((p) => ({ ...p, status: e.target.value }))}
              >
                <option value="issued">Issued</option>
                <option value="draft">Draft</option>
              </select>
            </div>
            <div>
              <label className={labelCls}>Invoice kind</label>
              <select
                className={inputCls}
                value={invoice.invoiceKind}
                onChange={(e) => setInvoice((p) => ({ ...p, invoiceKind: e.target.value }))}
              >
                <option value="B2B">B2B</option>
                <option value="B2C">B2C</option>
                <option value="B2G">B2G</option>
              </select>
            </div>
            <div>
              <label className={labelCls}>Invoice type code</label>
              <input
                className={inputCls}
                value={invoice.invoiceTypeCode}
                onChange={(e) => setInvoice((p) => ({ ...p, invoiceTypeCode: e.target.value }))}
              />
            </div>
            <div>
              <label className={labelCls}>Payment status</label>
              <select
                className={inputCls}
                value={invoice.paymentStatus}
                onChange={(e) => setInvoice((p) => ({ ...p, paymentStatus: e.target.value }))}
              >
                <option value="PENDING">Pending</option>
                <option value="PAID">Paid</option>
              </select>
            </div>
          </div>
        </fieldset>

        {/* Customer */}
        <fieldset className="mb-5">
          <legend className="mb-2 text-sm font-semibold text-slate-700">
            Customer
          </legend>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <label className={labelCls}>Customer ID</label>
              <input
                className={inputCls}
                placeholder="CUST-001"
                value={customer.customerId}
                onChange={(e) => setCustomer((p) => ({ ...p, customerId: e.target.value }))}
              />
            </div>
            <div>
              <label className={labelCls}>Name</label>
              <input
                required
                className={inputCls}
                placeholder="Innoson Motors"
                value={customer.name}
                onChange={(e) => setCustomer((p) => ({ ...p, name: e.target.value }))}
              />
            </div>
            <div>
              <label className={labelCls}>TIN</label>
              <input
                className={inputCls}
                placeholder="21919238-0001"
                value={customer.tin}
                onChange={(e) => setCustomer((p) => ({ ...p, tin: e.target.value }))}
              />
            </div>
            <div>
              <label className={labelCls}>Email</label>
              <input
                type="email"
                className={inputCls}
                placeholder="sales@example.com"
                value={customer.email}
                onChange={(e) => setCustomer((p) => ({ ...p, email: e.target.value }))}
              />
            </div>
            <div>
              <label className={labelCls}>Phone</label>
              <input
                className={inputCls}
                placeholder="+2348033333333"
                value={customer.phone}
                onChange={(e) => setCustomer((p) => ({ ...p, phone: e.target.value }))}
              />
            </div>
            <div>
              <label className={labelCls}>Address line</label>
              <input
                className={inputCls}
                placeholder="3 Kings Road"
                value={customer.line}
                onChange={(e) => setCustomer((p) => ({ ...p, line: e.target.value }))}
              />
            </div>
            <div>
              <label className={labelCls}>City</label>
              <input
                className={inputCls}
                placeholder="Port Harcourt"
                value={customer.city}
                onChange={(e) => setCustomer((p) => ({ ...p, city: e.target.value }))}
              />
            </div>
            <div>
              <label className={labelCls}>Country</label>
              <input
                className={inputCls}
                value={customer.country}
                onChange={(e) => setCustomer((p) => ({ ...p, country: e.target.value }))}
              />
            </div>
            <div>
              <label className={labelCls}>Postal zone</label>
              <input
                className={inputCls}
                placeholder="500001"
                value={customer.postalZone}
                onChange={(e) => setCustomer((p) => ({ ...p, postalZone: e.target.value }))}
              />
            </div>
          </div>
        </fieldset>

        {/* Line items */}
        <fieldset className="mb-5">
          <div className="mb-2 flex items-center justify-between">
            <legend className="text-sm font-semibold text-slate-700">
              Line items
            </legend>
            <button
              type="button"
              onClick={addLine}
              className="text-sm font-medium text-primary-600 hover:text-primary-700"
            >
              + Add item
            </button>
          </div>
          <div className="space-y-4">
            {lineItems.map((li, idx) => (
              <div
                key={idx}
                className="rounded-xl border border-slate-200 p-4"
              >
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500">
                    Item {idx + 1}
                  </span>
                  {lineItems.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeLine(idx)}
                      className="text-xs font-medium text-red-600 hover:text-red-700"
                    >
                      Remove
                    </button>
                  )}
                </div>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  <div>
                    <label className={labelCls}>Name</label>
                    <input
                      required
                      className={inputCls}
                      placeholder="Bottle of Palm Oil"
                      value={li.name}
                      onChange={(e) => updateLine(idx, "name", e.target.value)}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Description</label>
                    <input
                      className={inputCls}
                      value={li.description}
                      onChange={(e) => updateLine(idx, "description", e.target.value)}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>SKU / item ID</label>
                    <input
                      className={inputCls}
                      placeholder="PO-500ML"
                      value={li.sellersItemIdentification}
                      onChange={(e) =>
                        updateLine(idx, "sellersItemIdentification", e.target.value)
                      }
                    />
                  </div>
                  <div>
                    <label className={labelCls}>ISIC code</label>
                    <input
                      className={inputCls}
                      placeholder="0126"
                      value={li.isicCode}
                      onChange={(e) => updateLine(idx, "isicCode", e.target.value)}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Service category</label>
                    <input
                      className={inputCls}
                      placeholder="Edible oil supply"
                      value={li.serviceCategory}
                      onChange={(e) => updateLine(idx, "serviceCategory", e.target.value)}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Tax code</label>
                    <input
                      className={inputCls}
                      value={li.taxCode}
                      onChange={(e) => updateLine(idx, "taxCode", e.target.value)}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Quantity</label>
                    <input
                      type="number"
                      min="0"
                      step="any"
                      className={inputCls}
                      value={li.quantity}
                      onChange={(e) => updateLine(idx, "quantity", e.target.value)}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Unit price</label>
                    <input
                      type="number"
                      min="0"
                      step="any"
                      className={inputCls}
                      value={li.unitPrice}
                      onChange={(e) => updateLine(idx, "unitPrice", e.target.value)}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Tax rate %</label>
                    <input
                      type="number"
                      min="0"
                      step="any"
                      className={inputCls}
                      value={li.taxRate}
                      onChange={(e) => updateLine(idx, "taxRate", e.target.value)}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Discount rate %</label>
                    <input
                      type="number"
                      min="0"
                      step="any"
                      className={inputCls}
                      value={li.discountRate}
                      onChange={(e) => updateLine(idx, "discountRate", e.target.value)}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Fee rate %</label>
                    <input
                      type="number"
                      min="0"
                      step="any"
                      className={inputCls}
                      value={li.feeRate}
                      onChange={(e) => updateLine(idx, "feeRate", e.target.value)}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </fieldset>

        {/* Totals */}
        <div className="mb-5 rounded-xl bg-slate-50 p-4 text-sm">
          <div className="flex justify-between py-0.5 text-slate-600">
            <span>Total line amount</span>
            <span>{totals.totalLineAmount.toLocaleString()}</span>
          </div>
          <div className="flex justify-between py-0.5 text-slate-600">
            <span>Total tax</span>
            <span>{totals.totalTax.toLocaleString()}</span>
          </div>
          <div className="mt-1 flex justify-between border-t border-slate-200 pt-2 font-semibold text-slate-900">
            <span>Grand total ({invoice.currency})</span>
            <span>{totals.grandTotal.toLocaleString()}</span>
          </div>
        </div>

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="btn-primary px-4 py-2"
          >
            {submitting ? "Submitting…" : "Submit invoice"}
          </button>
        </div>
      </form>
    </div>
  );
}
