export const TaxCalculator = () => {
  const [grossIncome, setGrossIncome] = useState(20_000_000);
  const [insuranceRate, setInsuranceRate] = useState(10.5);
  const [dependents, setDependents] = useState(0);
  const [otherDeductions, setOtherDeductions] = useState(0);

  const PERSONAL_DEDUCTION = 11_000_000;
  const DEPENDENT_DEDUCTION = 4_400_000;
  const MAX_DEPENDENTS = 20;
  const MAX_INCOME = 999_999_999_999;
  const INSURANCE_BASE_CAP = 46_800_000;

  const TAX_BRACKETS = [
    { cap: 5_000_000, rate: 0.05 },
    { cap: 10_000_000, rate: 0.1 },
    { cap: 18_000_000, rate: 0.15 },
    { cap: 32_000_000, rate: 0.2 },
    { cap: 52_000_000, rate: 0.25 },
    { cap: 80_000_000, rate: 0.3 },
    { cap: Infinity, rate: 0.35 },
  ];

  const formatVND = (amount) => {
    try {
      return new Intl.NumberFormat("vi-VN").format(Math.round(amount)) + " đ";
    } catch {
      return String(Math.round(amount)) + " đ";
    }
  };

  const parseMoneyInput = (value) => {
    const cleaned = String(value ?? "").replace(/[^0-9]/g, "");
    const num = Number(cleaned);
    if (!Number.isFinite(num) || Number.isNaN(num)) return 0;
    return Math.max(0, Math.min(MAX_INCOME, Math.round(num)));
  };

  const parseIntInput = (value, min, max) => {
    const cleaned = String(value ?? "").replace(/[^0-9-]/g, "");
    const num = Number.parseInt(cleaned, 10);
    if (Number.isNaN(num)) return min;
    return Math.max(min, Math.min(max, num));
  };

  const parsePercentInput = (value) => {
    const cleaned = String(value ?? "").replace(/[^0-9.]/g, "");
    const num = Number.parseFloat(cleaned);
    if (!Number.isFinite(num) || Number.isNaN(num)) return 0;
    return Math.max(0, Math.min(100, num));
  };

  const calcProgressiveTaxMonthly = (taxableIncome) => {
    let remaining = Math.max(0, taxableIncome);
    let lowerBound = 0;
    let tax = 0;
    const breakdown = [];

    for (const bracket of TAX_BRACKETS) {
      if (remaining <= 0) break;
      const upper = bracket.cap;
      const width =
        upper === Infinity ? remaining : Math.max(0, upper - lowerBound);
      const portion = Math.min(remaining, width);
      const portionTax = portion * bracket.rate;

      breakdown.push({
        from: lowerBound,
        to: upper,
        portion,
        rate: bracket.rate,
        tax: portionTax,
      });

      tax += portionTax;
      remaining -= portion;
      lowerBound = upper;
    }

    return { tax: Math.round(tax), breakdown };
  };

  const calculations = useMemo(() => {
    const insuranceBase = Math.min(grossIncome, INSURANCE_BASE_CAP);
    const mandatoryInsurance = Math.round(
      (insuranceBase * insuranceRate) / 100
    );
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

    return {
      insuranceBase,
      mandatoryInsurance,
      personalDeduction,
      dependentDeduction,
      totalDeductions,
      taxableIncome,
      tax,
      breakdown,
      netIncome,
    };
  }, [grossIncome, insuranceRate, dependents, otherDeductions]);

  const handleReset = () => {
    setGrossIncome(20_000_000);
    setInsuranceRate(10.5);
    setDependents(0);
    setOtherDeductions(0);
  };

  return (
    <div className="p-4 border border-zinc-950/20 dark:border-white/10 rounded-2xl not-prose">
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-sm font-medium text-zinc-950 dark:text-white">
              Máy tính thuế TNCN (ước tính theo tháng)
            </h3>
            <p className="text-xs text-zinc-950/60 dark:text-white/60 mt-1">
              Giả định: cá nhân cư trú, thu nhập từ tiền lương/tiền công, áp
              dụng biểu thuế lũy tiến từng phần theo tháng.
            </p>
          </div>
          <button
            onClick={handleReset}
            type="button"
            aria-label="Đặt lại giá trị mặc định"
            className="px-3 py-1.5 text-xs font-medium rounded-lg border border-zinc-950/20 dark:border-white/10 text-zinc-950/70 dark:text-white/70 hover:bg-zinc-950/5 dark:hover:bg-white/5 transition-colors focus:outline-none focus:ring-2 focus:ring-zinc-950/20 dark:focus:ring-white/20"
          >
            Đặt lại
          </button>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <label htmlFor="gross-income" className="block">
            <span className="text-sm text-zinc-950/70 dark:text-white/70">
              Tổng thu nhập (gross) / tháng
            </span>
            <input
              id="gross-income"
              type="text"
              inputMode="numeric"
              value={grossIncome.toLocaleString("vi-VN")}
              onChange={(e) => setGrossIncome(parseMoneyInput(e.target.value))}
              aria-describedby="gross-income-help"
              className="mt-1 w-full rounded-xl border border-zinc-950/20 dark:border-white/10 bg-transparent px-3 py-2 text-sm text-zinc-950 dark:text-white focus:outline-none focus:ring-2 focus:ring-zinc-950/20 dark:focus:ring-white/20 transition-shadow"
              placeholder="20.000.000"
            />
            <span
              id="gross-income-help"
              className="text-xs text-zinc-950/50 dark:text-white/50 mt-0.5 block"
            >
              Thu nhập trước thuế và bảo hiểm (VND)
            </span>
          </label>

          <label htmlFor="insurance" className="block">
            <span className="text-sm text-zinc-950/70 dark:text-white/70">
              Tỷ lệ bảo hiểm bắt buộc
            </span>
            <div className="relative mt-1">
              <input
                id="insurance"
                type="number"
                inputMode="decimal"
                step="0.5"
                min="0"
                max="100"
                value={insuranceRate}
                onChange={(e) =>
                  setInsuranceRate(parsePercentInput(e.target.value))
                }
                aria-describedby="insurance-help"
                className="w-full rounded-xl border border-zinc-950/20 dark:border-white/10 bg-transparent px-3 py-2 pr-8 text-sm text-zinc-950 dark:text-white focus:outline-none focus:ring-2 focus:ring-zinc-950/20 dark:focus:ring-white/20 transition-shadow"
                placeholder="10.5"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-zinc-950/50 dark:text-white/50">
                %
              </span>
            </div>
            <span
              id="insurance-help"
              className="text-xs text-zinc-950/50 dark:text-white/50 mt-0.5 block"
            >
              ≈ {calculations.mandatoryInsurance.toLocaleString("vi-VN")} đ trên
              mức lương {calculations.insuranceBase.toLocaleString("vi-VN")} đ
              (tối đa 20 lần LĐTL)
            </span>
          </label>

          <label htmlFor="dependents" className="block">
            <span className="text-sm text-zinc-950/70 dark:text-white/70">
              Số người phụ thuộc
            </span>
            <input
              id="dependents"
              type="number"
              inputMode="numeric"
              min="0"
              max={MAX_DEPENDENTS}
              value={dependents}
              onChange={(e) =>
                setDependents(parseIntInput(e.target.value, 0, MAX_DEPENDENTS))
              }
              aria-describedby="dependents-help"
              className="mt-1 w-full rounded-xl border border-zinc-950/20 dark:border-white/10 bg-transparent px-3 py-2 text-sm text-zinc-950 dark:text-white focus:outline-none focus:ring-2 focus:ring-zinc-950/20 dark:focus:ring-white/20 transition-shadow"
              placeholder="0"
            />
            <span
              id="dependents-help"
              className="text-xs text-zinc-950/50 dark:text-white/50 mt-0.5 block"
            >
              Con, cha mẹ, vợ/chồng đủ điều kiện
            </span>
          </label>

          <label htmlFor="other-deductions" className="block">
            <span className="text-sm text-zinc-950/70 dark:text-white/70">
              Giảm trừ khác hợp lệ
            </span>
            <input
              id="other-deductions"
              type="text"
              inputMode="numeric"
              value={otherDeductions.toLocaleString("vi-VN")}
              onChange={(e) =>
                setOtherDeductions(parseMoneyInput(e.target.value))
              }
              aria-describedby="other-deductions-help"
              className="mt-1 w-full rounded-xl border border-zinc-950/20 dark:border-white/10 bg-transparent px-3 py-2 text-sm text-zinc-950 dark:text-white focus:outline-none focus:ring-2 focus:ring-zinc-950/20 dark:focus:ring-white/20 transition-shadow"
              placeholder="0"
            />
            <span
              id="other-deductions-help"
              className="text-xs text-zinc-950/50 dark:text-white/50 mt-0.5 block"
            >
              Từ thiện, quỹ hưu trí, v.v. (VND)
            </span>
          </label>
        </div>

        <div
          className="grid gap-3 sm:grid-cols-3"
          role="region"
          aria-label="Kết quả tính thuế"
        >
          <div className="rounded-xl border border-zinc-950/20 dark:border-white/10 bg-zinc-950/[0.02] dark:bg-white/[0.02] p-3">
            <div className="text-xs text-zinc-950/60 dark:text-white/60">
              Thu nhập tính thuế
            </div>
            <div
              className="mt-1 text-sm font-semibold text-zinc-950 dark:text-white"
              aria-live="polite"
            >
              {formatVND(calculations.taxableIncome)}
            </div>
          </div>

          <div className="rounded-xl border border-blue-500/20 dark:border-blue-400/20 bg-blue-500/5 dark:bg-blue-400/5 p-3">
            <div className="text-xs text-blue-900/70 dark:text-blue-100/70">
              Thuế TNCN (ước tính)
            </div>
            <div
              className="mt-1 text-sm font-semibold text-blue-900 dark:text-blue-100"
              aria-live="polite"
            >
              {formatVND(calculations.tax)}
            </div>
          </div>

          <div className="rounded-xl border border-green-500/20 dark:border-green-400/20 bg-green-500/5 dark:bg-green-400/5 p-3">
            <div className="text-xs text-green-900/70 dark:text-green-100/70">
              Thu nhập thực nhận (net)
            </div>
            <div
              className="mt-1 text-sm font-semibold text-green-900 dark:text-green-100"
              aria-live="polite"
            >
              {formatVND(calculations.netIncome)}
            </div>
          </div>
        </div>

        <details className="rounded-xl bg-zinc-950/5 dark:bg-white/5 overflow-hidden">
          <summary className="cursor-pointer p-3 text-sm font-medium text-zinc-950/80 dark:text-white/80 hover:bg-zinc-950/5 dark:hover:bg-white/5 transition-colors focus:outline-none focus:ring-2 focus:ring-inset focus:ring-zinc-950/20 dark:focus:ring-white/20">
            Chi tiết giảm trừ
          </summary>
          <div className="px-3 pb-3 grid gap-1.5 text-sm text-zinc-950/80 dark:text-white/80">
            <div className="flex justify-between">
              <span>Bản thân:</span>
              <span className="font-medium">
                {formatVND(calculations.personalDeduction)}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Người phụ thuộc ({dependents} người):</span>
              <span className="font-medium">
                {formatVND(calculations.dependentDeduction)}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Bảo hiểm bắt buộc ({insuranceRate}%):</span>
              <span className="font-medium">
                {formatVND(calculations.mandatoryInsurance)}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Giảm trừ khác:</span>
              <span className="font-medium">{formatVND(otherDeductions)}</span>
            </div>
            <div className="flex justify-between pt-2 mt-1 border-t border-zinc-950/10 dark:border-white/10 font-semibold">
              <span>Tổng giảm trừ:</span>
              <span>{formatVND(calculations.totalDeductions)}</span>
            </div>
          </div>
        </details>

        {calculations.breakdown.filter((row) => row.portion > 0).length > 0 && (
          <details className="rounded-xl border border-zinc-950/20 dark:border-white/10 overflow-hidden">
            <summary className="cursor-pointer p-3 text-sm font-medium text-zinc-950/80 dark:text-white/80 hover:bg-zinc-950/5 dark:hover:bg-white/5 transition-colors focus:outline-none focus:ring-2 focus:ring-inset focus:ring-zinc-950/20 dark:focus:ring-white/20">
              Bảng tính thuế lũy tiến từng phần
            </summary>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-zinc-950/5 dark:bg-white/5">
                  <tr className="text-left text-zinc-950/60 dark:text-white/60">
                    <th className="px-3 py-2 font-medium">Phần thu nhập</th>
                    <th className="px-3 py-2 font-medium">Thuế suất</th>
                    <th className="px-3 py-2 font-medium">Thuế</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-950/10 dark:divide-white/10">
                  {calculations.breakdown
                    .filter((row) => row.portion > 0)
                    .map((row, idx) => (
                      <tr
                        key={idx}
                        className="hover:bg-zinc-950/[0.02] dark:hover:bg-white/[0.02]"
                      >
                        <td className="px-3 py-2 text-zinc-950/80 dark:text-white/80">
                          {formatVND(row.portion)}
                        </td>
                        <td className="px-3 py-2 text-zinc-950/80 dark:text-white/80">
                          {Math.round(row.rate * 100)}%
                        </td>
                        <td className="px-3 py-2 font-medium text-zinc-950/80 dark:text-white/80">
                          {formatVND(row.tax)}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </details>
        )}

        <p
          className="text-xs text-zinc-950/60 dark:text-white/60 italic"
          role="note"
        >
          ⓘ Kết quả chỉ mang tính tham khảo; tuỳ hồ sơ thực tế và quy định tại
          thời điểm tính có thể khác.
        </p>
      </div>
    </div>
  );
};
