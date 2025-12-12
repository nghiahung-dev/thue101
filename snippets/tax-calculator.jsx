export const TaxCalculator = () => {
  const PERSONAL_DEDUCTION = 11_000_000;
  const DEPENDENT_DEDUCTION = 4_400_000;

  const [grossIncome, setGrossIncome] = useState(20_000_000);
  const [mandatoryInsurance, setMandatoryInsurance] = useState(0);
  const [dependents, setDependents] = useState(0);
  const [otherDeductions, setOtherDeductions] = useState(0);

  const clampInt = (value, min, max) => {
    const n = Number.parseInt(String(value ?? "").replace(/[^0-9-]/g, ""), 10);
    if (Number.isNaN(n)) return min;
    return Math.max(min, Math.min(max, n));
  };

  const clampMoney = (value) => {
    const n = Number(String(value ?? "").replace(/[^0-9]/g, ""));
    if (!Number.isFinite(n) || Number.isNaN(n)) return 0;
    return Math.max(0, Math.round(n));
  };

  const formatVND = (amount) => {
    try {
      return new Intl.NumberFormat("vi-VN").format(Math.round(amount)) + " đ";
    } catch {
      return String(Math.round(amount)) + " đ";
    }
  };

  const calcProgressiveTaxMonthly = (taxableIncome) => {
    const brackets = [
      { cap: 5_000_000, rate: 0.05 },
      { cap: 10_000_000, rate: 0.1 },
      { cap: 18_000_000, rate: 0.15 },
      { cap: 32_000_000, rate: 0.2 },
      { cap: 52_000_000, rate: 0.25 },
      { cap: 80_000_000, rate: 0.3 },
      { cap: Infinity, rate: 0.35 },
    ];

    let remaining = Math.max(0, taxableIncome);
    let lowerBound = 0;
    let tax = 0;
    const breakdown = [];

    for (const b of brackets) {
      if (remaining <= 0) break;
      const upper = b.cap;
      const width =
        upper === Infinity ? remaining : Math.max(0, upper - lowerBound);
      const portion = Math.min(remaining, width);
      const portionTax = portion * b.rate;
      breakdown.push({
        from: lowerBound,
        to: upper,
        portion,
        rate: b.rate,
        tax: portionTax,
      });
      tax += portionTax;
      remaining -= portion;
      lowerBound = upper;
    }

    return { tax: Math.round(tax), breakdown };
  };

  const personalDeduction = PERSONAL_DEDUCTION;
  const dependentDeduction = Math.max(0, dependents) * DEPENDENT_DEDUCTION;
  const totalDeductions =
    personalDeduction +
    dependentDeduction +
    mandatoryInsurance +
    otherDeductions;
  const taxableIncome = Math.max(0, grossIncome - totalDeductions);
  const { tax, breakdown } = calcProgressiveTaxMonthly(taxableIncome);
  const netIncome = Math.max(0, grossIncome - mandatoryInsurance - tax);

  return (
    <div className="p-4 border border-zinc-950/20 dark:border-white/10 rounded-2xl not-prose">
      <div className="space-y-4">
        <div>
          <div className="text-sm font-medium text-zinc-950 dark:text-white">
            Máy tính thuế TNCN (ước tính theo tháng)
          </div>
          <div className="text-xs text-zinc-950/60 dark:text-white/60 mt-1">
            Giả định: cá nhân cư trú, thu nhập từ tiền lương/tiền công, áp dụng
            biểu thuế lũy tiến từng phần theo tháng.
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block">
            <div className="text-sm text-zinc-950/70 dark:text-white/70">
              Tổng thu nhập (gross) / tháng (VND)
            </div>
            <input
              inputMode="numeric"
              value={grossIncome}
              onChange={(e) => setGrossIncome(clampMoney(e.target.value))}
              className="mt-1 w-full rounded-xl border border-zinc-950/20 dark:border-white/10 bg-transparent px-3 py-2 text-sm text-zinc-950 dark:text-white"
              placeholder="Ví dụ: 20000000"
            />
          </label>

          <label className="block">
            <div className="text-sm text-zinc-950/70 dark:text-white/70">
              BH bắt buộc (ước tính) / tháng (VND)
            </div>
            <input
              inputMode="numeric"
              value={mandatoryInsurance}
              onChange={(e) =>
                setMandatoryInsurance(clampMoney(e.target.value))
              }
              className="mt-1 w-full rounded-xl border border-zinc-950/20 dark:border-white/10 bg-transparent px-3 py-2 text-sm text-zinc-950 dark:text-white"
              placeholder="Ví dụ: 0"
            />
          </label>

          <label className="block">
            <div className="text-sm text-zinc-950/70 dark:text-white/70">
              Số người phụ thuộc
            </div>
            <input
              inputMode="numeric"
              value={dependents}
              onChange={(e) => setDependents(clampInt(e.target.value, 0, 20))}
              className="mt-1 w-full rounded-xl border border-zinc-950/20 dark:border-white/10 bg-transparent px-3 py-2 text-sm text-zinc-950 dark:text-white"
              placeholder="Ví dụ: 0"
            />
          </label>

          <label className="block">
            <div className="text-sm text-zinc-950/70 dark:text-white/70">
              Giảm trừ khác hợp lệ (VND)
            </div>
            <input
              inputMode="numeric"
              value={otherDeductions}
              onChange={(e) => setOtherDeductions(clampMoney(e.target.value))}
              className="mt-1 w-full rounded-xl border border-zinc-950/20 dark:border-white/10 bg-transparent px-3 py-2 text-sm text-zinc-950 dark:text-white"
              placeholder="Ví dụ: 0"
            />
          </label>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-zinc-950/20 dark:border-white/10 p-3">
            <div className="text-xs text-zinc-950/60 dark:text-white/60">
              Thu nhập tính thuế
            </div>
            <div className="mt-1 text-sm font-semibold text-zinc-950 dark:text-white">
              {formatVND(taxableIncome)}
            </div>
          </div>

          <div className="rounded-xl border border-zinc-950/20 dark:border-white/10 p-3">
            <div className="text-xs text-zinc-950/60 dark:text-white/60">
              Thuế TNCN (ước tính)
            </div>
            <div className="mt-1 text-sm font-semibold text-zinc-950 dark:text-white">
              {formatVND(tax)}
            </div>
          </div>

          <div className="rounded-xl border border-zinc-950/20 dark:border-white/10 p-3">
            <div className="text-xs text-zinc-950/60 dark:text-white/60">
              Thu nhập thực nhận (net)
            </div>
            <div className="mt-1 text-sm font-semibold text-zinc-950 dark:text-white">
              {formatVND(netIncome)}
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-zinc-950/5 dark:bg-white/5 p-3">
          <div className="text-xs text-zinc-950/60 dark:text-white/60">
            Giảm trừ đang áp dụng
          </div>
          <div className="mt-1 grid gap-1 text-sm text-zinc-950/80 dark:text-white/80">
            <div>Bản thân: {formatVND(personalDeduction)}</div>
            <div>Người phụ thuộc: {formatVND(dependentDeduction)}</div>
            <div>BH bắt buộc: {formatVND(mandatoryInsurance)}</div>
            <div>Giảm trừ khác: {formatVND(otherDeductions)}</div>
            <div className="pt-1 font-medium">
              Tổng giảm trừ: {formatVND(totalDeductions)}
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm border-separate border-spacing-y-1">
            <thead>
              <tr className="text-left text-zinc-950/60 dark:text-white/60">
                <th className="pr-3">Phần thu nhập</th>
                <th className="pr-3">Thuế suất</th>
                <th className="pr-3">Thuế</th>
              </tr>
            </thead>
            <tbody>
              {breakdown
                .filter((row) => row.portion > 0)
                .map((row, idx) => (
                  <tr key={idx} className="rounded-lg">
                    <td className="pr-3 text-zinc-950/80 dark:text-white/80">
                      {formatVND(row.portion)}
                    </td>
                    <td className="pr-3 text-zinc-950/80 dark:text-white/80">
                      {Math.round(row.rate * 100)}%
                    </td>
                    <td className="pr-3 text-zinc-950/80 dark:text-white/80">
                      {formatVND(row.tax)}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        <div className="text-xs text-zinc-950/60 dark:text-white/60">
          Kết quả chỉ mang tính tham khảo; tuỳ hồ sơ thực tế và quy định tại
          thời điểm tính có thể khác.
        </div>
      </div>
    </div>
  );
};
